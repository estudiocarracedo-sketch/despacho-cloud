export interface DespachoData {
  archivo: string;
  fob_total: number;
  flete_total: number;
  seguro_total: number;
  divisa: string;
  valor_aduana_dolar: number;
  cotizacion: number;
  vendedor: string;
  importador: string;
  despacho_numero: string;
  fecha_oficializacion: string;
}

export class PDFExtractor {

  parseNumber(value: string): number {
    if (!value) return 0;
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  cleanFilename(filename: string): string {
    return filename.replace(/\.pdf$/i, '');
  }

  async extractFromText(text: string, filename: string): Promise<DespachoData> {
    const data: DespachoData = {
      archivo: this.cleanFilename(filename),
      fob_total: 0,
      flete_total: 0,
      seguro_total: 0,
      divisa: '',
      valor_aduana_dolar: 0,
      cotizacion: 0,
      vendedor: '',
      importador: '',
      despacho_numero: '',
      fecha_oficializacion: '',
    };

    let m: RegExpMatchArray | null;

    // FOB TOTAL
    // Texto real: "FOB Total\n\n34.760,81\n\nDivisa\nDOL"
    m = text.match(/FOB\s+Total\s*\n+\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);
    if (!m) m = text.match(/FOB\s+Total\s+en\s+D[oó]lar\s*\n+\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);
    if (!m) m = text.match(/FOB\s+Total\s+en\s+Divisa\s*\n*\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);
    if (m) data.fob_total = this.parseNumber(m[1]);

    // FLETE TOTAL
    // Texto real: "Flete Total\n949,00\n\nDivisa\nDOL"
    m = text.match(/Flete\s+Total\s*\n+\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);
    if (m) data.flete_total = this.parseNumber(m[1]);

    // SEGURO TOTAL
    // Texto real: "Seguro Total\n357,10\n\nDivisa\nDOL"
    m = text.match(/Seguro\s+Total\s*\n+\s*(\d{1,3}(?:\.\d{3})*,\d{2})/);
    if (m) data.seguro_total = this.parseNumber(m[1]);

    // DIVISA
    // Texto real: "Divisa\nDOL" aparece varias veces
    m = text.match(/Divisa\s*\n\s*(DOL|USD|EUR|BRL|ARS)\b/);
    if (m) data.divisa = m[1].toUpperCase();

    // VALOR EN ADUANA EN DOLAR
    // Texto real: "Valor en Aduana en Dólar\n\n36.066,91"
    const valRegex = /Valor\s+en\s+Aduana\s+en\s+D[oó]lar\s*\n+\s*(\d{1,3}(?:\.\d{3})*,\d{2})/g;
    const valMatches = Array.from(text.matchAll(valRegex));
    if (valMatches.length > 0) {
      data.valor_aduana_dolar = valMatches.reduce((sum, match) => sum + this.parseNumber(match[1]), 0);
    }

    // COTIZACION
    // Texto real: "Cotiz = 1.474,500000"
    m = text.match(/Cotiz\s*=\s*(\d{1,3}(?:\.\d{3})*,\d+)/);
    if (m) data.cotizacion = this.parseNumber(m[1]);

    // VENDEDOR
    // Texto real: "Vendedor\n\n30-58346901-6\n\nINDUSTRIES PPD INC. DIV MEDITECH"
    // El CUIT (30-XXXXXXXX-X) aparece entre "Vendedor" y el nombre real
    m = text.match(/Vendedor\s*\n+\s*\d{2}-\d{8}-\d\s*\n+\s*([A-Z][^\n]{3,80})/);
    if (!m) m = text.match(/Vendedor\s*\n+\s*([A-Z][^\n]{3,80})/);
    if (m) data.vendedor = m[1].replace(/\s+/g, ' ').trim();

    // IMPORTADOR / EXPORTADOR
    // Texto real: "Importador / Exportador\nIMPLANTES F. I. C. O.  ALEMANA    (IVA INS: SI)\n\nCUIT Nº"
    m = text.match(/Importador\s*\/\s*Exportador\s*\n\s*([^\n]{3,100})/);
    if (m) data.importador = m[1].replace(/\s+/g, ' ').trim();

    // NUMERO DE DESPACHO
    // Texto real: "25   073   IC04   105340   Z"
    m = text.match(/(\d{2}\s+\d{3}\s+[A-Z0-9]{2,6}\s+\d{4,8}\s+[A-Z])\b/);
    if (m) data.despacho_numero = m[1].replace(/\s+/g, ' ').trim();

    // FECHA DE OFICIALIZACION
    // Texto real: "Oficialización\n\n18/09/2025"
    m = text.match(/Oficializaci[oó]n\s*\n+\s*(\d{2}\/\d{2}\/\d{4})/);
    if (!m) m = text.match(/Oficializaci[oó]n\s+(\d{2}\/\d{2}\/\d{4})/);
    if (m) data.fecha_oficializacion = m[1];

    return data;
  }
}
