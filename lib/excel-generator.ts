import ExcelJS from 'exceljs';
import { DespachoData } from './pdf-extractor';

function excelNumberOrBlank(value: number): number | null {
  // Si tu extractor usa 0 como "no detectado", lo convertimos a celda vacía
  // (así no se confunde con un 0 real)
  return value === 0 ? null : value;
}

export async function generateExcel(data: DespachoData[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Despachos');

  worksheet.columns = [
    { header: 'Archivo', key: 'archivo', width: 25 },
    { header: 'Despacho Nº', key: 'despacho_numero', width: 25 },
    { header: 'Fecha Oficialización', key: 'fecha_oficializacion', width: 18 },
    { header: 'Importador', key: 'importador', width: 40 },
    { header: 'Vendedor', key: 'vendedor', width: 40 },
    { header: 'FOB Total', key: 'fob_total', width: 15 },
    { header: 'Flete Total', key: 'flete_total', width: 15 },
    { header: 'Seguro Total', key: 'seguro_total', width: 15 },
    { header: 'Divisa', key: 'divisa', width: 10 },
    { header: 'Valor Aduana (USD)', key: 'valor_aduana_dolar', width: 18 },
    { header: 'Cotización', key: 'cotizacion', width: 15 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF366092' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerRow.height = 30;

  data.forEach((item) => {
    const row = worksheet.addRow({
      archivo: item.archivo,
      despacho_numero: item.despacho_numero,
      fecha_oficializacion: item.fecha_oficializacion,
      importador: item.importador,
      vendedor: item.vendedor,

      // Convertimos 0 => vacío (null) para que Excel no muestre "0,00" por error de extracción
      fob_total: excelNumberOrBlank(item.fob_total),
      flete_total: excelNumberOrBlank(item.flete_total),
      seguro_total: excelNumberOrBlank(item.seguro_total),
      valor_aduana_dolar: excelNumberOrBlank(item.valor_aduana_dolar),
      cotizacion: excelNumberOrBlank(item.cotizacion),

      divisa: item.divisa,
    });

    // Formatos numéricos (si la celda es null, Excel simplemente la deja vacía)
    row.getCell('fob_total').numFmt = '#,##0.00';
    row.getCell('flete_total').numFmt = '#,##0.00';
    row.getCell('seguro_total').numFmt = '#,##0.00';
    row.getCell('valor_aduana_dolar').numFmt = '#,##0.00';
    row.getCell('cotizacion').numFmt = '#,##0.0000';

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
