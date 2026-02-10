// lib/pdf-extractor.ts
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
    // Formato argentino: 1.474,50 → quitar puntos de miles, reemplazar coma decimal
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  cleanFilename(filename: string): string {
    return filename.replace(/\.pdf$/i, '');
  }

  extractValorAduanaTotal(text: string): number {
    // Buscar todas las ocurrencias de "Valor en Aduana en Dólar" y sumarlas
    const regex = /Valor\s+en\s+Aduana\s+en\s+D[oó]lar[\s\S]{1,50}?(\d{1,3}(?:\.\d{3})*,\d{2})/gi;
    const matches = Array.from(text.matchAll(regex));

    if (matches.length > 0) {
      return matches.reduce((sum, m) => sum + this.parseNumber(m[1]), 0);
    }

    // Fallback: buscar en "Divisa"
    const regex2 = /Valor\s+en\s+Aduana\s+en\s+Divisa[\s\S]{1,50}?(\d{1,3}(?:\.\d{3})*,\d{2})/gi;
    const matches2 = Array.from(text.matchAll(regex2));
    if (matches2.length > 0) {
      return matches2.reduce((sum, m) => sum + this.parseNumber(m[1]), 0);
    }

    return 0;
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

    // ── FOB TOTAL ──────────────────────────────────────────────────────────────
    // En el PDF texto extraido: "FOB Total en Divisa 34.760,81 FOB Total en Dólar 34.760,81"
    // O en la cabecera: "FOB 34.760,81 DOL 949,00 DOL"
    let m: RegExpMatchArray | null;

    m = text.match(/FOB\s+Total\s+en\s+D[oó]lar[\s\S]{1,20}?(\d{1,3}(?:\.\d{3})*,\d{2})/i);
    if (!m) m = text.match(/FOB\s+Total\s+en\s+Divisa[\s\S]{1,20}?(\d{1,3}(?:\.\d{3})*,\d{2})/i);
    if (!m) m = text.match(/FOB\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s+DOL/i);
    if (!m) m = text.match(/Cond\.\s*Venta\s+FOB[\s\S]{1,30}?(\d{1,3}(?:\.\d{3})*,\d{2})/i);
    if (m) data.fob_total = this.parseNumber(m[1]);

    // ── FLETE TOTAL ────────────────────────────────────────────────────────────
    // En el PDF: "949,00 DOL" después de "Flete Total Divisa"
    m = text.match(/Flete\s+Total[\s\S]{1,5}?(?:Divisa|DOL|USD)[\s\S]{1,30}?(\d{1,3}(?:\.\d{3})*,\d{2})/i);
    if (!m) m = text.match(/Flete\s+Total[\s\S]{1,30}?(\d{1,3}(?:\.\d{3})*,\d{2})\s+(?:DOL|USD)/i);
    if (!m) m = text.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s+DOL[\s\S]{1,10}?(\d{1,3}(?:\.\d{3})*,\d{2})\s+DOL/i);
    if (m && m[2]) data.flete_total = this.parseNumber(m[2]);
    else if (m && m[1] && !m[2]) data.flete_total = this.parseNumber(m[1]);

    // ── SEGURO TOTAL ───────────────────────────────────────────────────────────
    // En el PDF: "Seguro Total ... 357,10 DOL"
    m = text.match(/Seguro\s+Total[\s\S]{1,30}?(\d{1,3}(?:\.\d{3})*,\d{2})\s+(?:DOL|USD)/i);
    if (!m) m = text.match(/Seguro\s+Total[\s\S]{1,20}?(\d{1,3}(?:\.\d{3})*,\d{2})/i);
    if (m) data.seguro_total = this.parseNumber(m[1]);

    // ── DIVISA ─────────────────────────────────────────────────────────────────
    // En el PDF aparece DOL junto a los montos
    m = text.match(/\d{1,3}(?:\.\d{3})*,\d{2}\s+(DOL|USD|EUR|BRL|ARS)\b/i);
    if (m) data.divisa = m[1].toUpperCase();

    // ── VALOR EN ADUANA ────────────────────────────────────────────────────────
    data.valor_aduana_dolar = this.extractValorAduanaTotal(text);

    // ── COTIZACIÓN ─────────────────────────────────────────────────────────────
    // En el PDF: "Cotiz = 1.474,500000"
    m = text.match(/Cotiz\s*=\s*(\d{1,3}(?:\.\d{3})*,\d+)/i);
    if (!m) m = text.match(/Cotiz\s*=\s*(\d[\d.,]+)/i);
    if (m) data.cotizacion = this.parseNumber(m[1]);

    // ── VENDEDOR ───────────────────────────────────────────────────────────────
    // En el PDF: "Vendedor\nINDUSTRIES PPD INC. DIV MEDITECH"
    // pdf-parse puede extraerlo como "Vendedor INDUSTRIES PPD INC. DIV MEDITECH Vía"
    m = text.match(/Vendedor\s*\n([^\n]{3,80})/i);
    if (!m) m = text.match(/Vendedor\s+([A-Z][A-Z0-9\s.,\-&()\/]{3,80}?)(?:\s+V[ií]a|\s+Vía|\s+CUIT|\n)/i);
    if (m) data.vendedor = m[1].replace(/\s+/g, ' ').trim();

    // ── IMPORTADOR / EXPORTADOR ────────────────────────────────────────────────
    // En el PDF: "Importador / Exportador\nIMPLANTES F. I. C. O. ALEMANA (IVA INS: SI)"
    // pdf-parse puede extraerlo todo en una línea
    m = text.match(/Importador\s*\/\s*Exportador\s*\n([^\n]{3,100})/i);
    if (!m) m = text.match(/Importador\s*\/?\s*Exportador\s+([A-Z][A-Z0-9\s.,\-&()\/:]+?)(?=\s*CUIT\s*N[º°]|\s*Agente|\s*\n\s*CUIT)/i);
    if (!m) m = text.match(/Importador[^/\n]+\/[^/\n]+Exportador\s+([A-Z][^\n]{3,100}?)(?=\s*CUIT|\n)/i);
    if (m) data.importador = m[1].replace(/\s+/g, ' ').trim().substring(0, 100);

    // ── NÚMERO DE DESPACHO ─────────────────────────────────────────────────────
    // En el PDF: "25 073 IC04 105340 Z"
    // Formato exacto: DD EEE LLLL NNNNNN L
    // Donde D=dígito, E=dígito, L=letra/dígito, N=dígito, L=letra final
    m = text.match(/\b(\d{2}\s+\d{3}\s+[A-Z]{2}\d{2}\s+\d{6}\s+[A-Z])\b/i);
    if (!m) m = text.match(/\b(\d{2}\s+\d{3}\s+[A-Z0-9]{4}\s+\d{6}\s+[A-Z])\b/i);
    if (!m) m = text.match(/A[ñn]o\s*\/\s*Ad\.?[\s\S]{1,60}?(\d{2}\s+\d{3}\s+[A-Z0-9]{4}\s+\d{5,7}\s+[A-Z])/i);
    if (m) data.despacho_numero = m[1].replace(/\s+/g, ' ').trim();

    // ── FECHA DE OFICIALIZACIÓN ────────────────────────────────────────────────
    // En el PDF: "Oficialización\n18/09/2025" o "Oficialización 18/09/2025"
    m = text.match(/Oficializaci[oó]n\s+(\d{2}\/\d{2}\/\d{4})/i);
    if (!m) m = text.match(/Oficializaci[oó]n[\s\S]{1,15}?(\d{2}\s*\/\s*\d{2}\s*\/\s*\d{4})/i);
    if (!m) m = text.match(/Oficializaci[oó]n[\s\S]{1,5}?\n(\d{2}\/\d{2}\/\d{4})/i);
    if (m) data.fecha_oficializacion = m[1].replace(/\s/g, '');

    return data;
  }
}
