import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { PDFExtractor, DespachoData } from '@/lib/pdf-extractor';
import { generateExcel } from '@/lib/excel-generator';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron archivos' },
        { status: 400 }
      );
    }

    const extractor = new PDFExtractor();
    const results: DespachoData[] = [];

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const pdfData = await pdf(buffer);
        const text = pdfData.text;

        const data = await extractor.extractFromText(text, file.name);
        results.push(data);
      } catch (error) {
        console.error(`Error procesando ${file.name}:`, error);
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron procesar los archivos' },
        { status: 500 }
      );
    }

    const excelBuffer = await generateExcel(results);

    return new NextResponse(excelBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Despachos_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error en /api/process:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
