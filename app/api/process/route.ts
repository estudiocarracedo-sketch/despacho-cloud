// app/api/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { PDFExtractor, DespachoData } from '@/lib/pdf-extractor';
import { generateExcel } from '@/lib/excel-generator';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 segundos para Vercel Pro

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

    // Procesar cada PDF
    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Extraer texto del PDF
        const pdfData = await pdf(buffer);
        const text = pdfData.text;

        // Extraer datos del despacho
        const data = await extractor.extractFromText(text, file.name);
        results.push(data);
      } catch (error) {
        console.error(`Error procesando ${file.name}:`, error);
        // Continuar con el siguiente archivo
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron procesar los archivos' },
        { status: 500 }
      );
    }

    // Generar Excel
    const excelBuffer = await generateExcel(results);

    // Retornar Excel
    return new NextResponse(excelBuffer, {
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
