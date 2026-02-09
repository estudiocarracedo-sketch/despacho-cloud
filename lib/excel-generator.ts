// lib/excel-generator.ts
import ExcelJS from 'exceljs';
import { DespachoData } from './pdf-extractor';

export async function generateExcel(data: DespachoData[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Despachos');

  // Definir columnas
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

  // Estilo del header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF366092' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerRow.height = 30;

  // Agregar datos
  data.forEach((item) => {
    const row = worksheet.addRow(item);
    
    // Formato de números
    row.getCell('fob_total').numFmt = '#,##0.00';
    row.getCell('flete_total').numFmt = '#,##0.00';
    row.getCell('seguro_total').numFmt = '#,##0.00';
    row.getCell('valor_aduana_dolar').numFmt = '#,##0.00';
    row.getCell('cotizacion').numFmt = '#,##0.0000';

    // Bordes
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // Congelar primera fila
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Generar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
```

4. Si lo cambiaste, **Commit:** `Verificar generador Excel`

---

## ✅ Resumen de Mejoras

El nuevo extractor:

1. ✅ **Nombre de archivo sin .pdf** - Se limpia automáticamente
2. ✅ **Importador vs Vendedor** - Ahora busca específicamente cada uno
3. ✅ **Número de despacho** - Extracción mejorada
4. ✅ **Fecha de oficialización** - Expresión regular más flexible
5. ✅ **Divisa** - Ahora captura DOL, USD, EUR, BRL, ARS
6. ✅ **Valores en 0** - Regex más flexibles para capturar números
7. ✅ **Limpieza de texto** - Elimina espacios extra que confunden el regex

---

## 🧪 Probar

1. Espera 2-3 minutos a que Vercel haga deploy automático
2. Ve a tu app: `https://tu-proyecto.vercel.app`
3. Sube el mismo PDF de prueba
4. Descarga el Excel
5. Verifica que ahora tenga todos los datos

---

## 📊 Si Todavía Faltan Datos

Si después de esto siguen faltando datos específicos, **necesito que me digas:**

1. ¿Qué campo específico sigue en blanco o con 0?
2. ¿Puedes copiar 2-3 líneas del PDF donde aparece ese dato?

Por ejemplo:
```
Campo que falla: Importador
En el PDF dice: "IMPLANTES F. I. C. O. ALEMANA (IVA INS: SI)"
