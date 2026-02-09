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
  private patterns = {
    fob_total: /FOB\s+Total[^\d]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s+(?:DOL|USD)/i,
    flete_total: /Flete\s+Total[^\d]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s+(?:DOL|USD)/i,
    seguro_total: /Seguro\s+Total[^\d]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s+(?:DOL|USD)/i,
    divisa: /(?:FOB|Flete|Seguro)\s+Total[^\n]*\s+(DOL|USD|EUR|BRL)/i,
    valor_aduana: /Valor\s+en\s+Aduana\s+en\s+(?:Divisa|Dólar)[^\d]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
    cotizacion: /Cotiz\s*=\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d+)/i,
    vendedor: /Vendedor[^\n]*\n\s*([A-Z][A-Z0-9\s.,\-]+?)(?:\n|Vía)/i,
    importador: /Importador\s*\/\s*Exportador[^\n]*\n\s*([A-Z][A-Z0-9\s.,\-()]+?)(?:\n|CUIT)/i,
    despacho_num: /(\d{2}\s+\d{3}\s+[A-Z]{4}\s+\d+\s+[A-Z])/i,
    oficializacion: /Oficialización[^\d]*(\d{2}\/\d{2}\/\d{4})/i,
  };

  parseNumber(value: string): number {
    if (!value) return 0;
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  extractValorAduanaTotal(text: string): number {
    const matches = text.match(this.patterns.valor_aduana);
    if (!matches) return 0;
    
    const total = matches.reduce((sum, match) => {
      const numStr = match.match(/(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/)?.[1];
      return sum + (numStr ? this.parseNumber(numStr) : 0);
    }, 0);
    
    return total;
  }

  async extractFromText(text: string, filename: string): Promise<DespachoData> {
    const data: DespachoData = {
      archivo: filename,
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

    // Extraer cada campo
    const fobMatch = text.match(this.patterns.fob_total);
    if (fobMatch) data.fob_total = this.parseNumber(fobMatch[1]);

    const fleteMatch = text.match(this.patterns.flete_total);
    if (fleteMatch) data.flete_total = this.parseNumber(fleteMatch[1]);

    const seguroMatch = text.match(this.patterns.seguro_total);
    if (seguroMatch) data.seguro_total = this.parseNumber(seguroMatch[1]);

    const divisaMatch = text.match(this.patterns.divisa);
    if (divisaMatch) data.divisa = divisaMatch[1];

    // Valor aduana con suma de múltiples páginas
    data.valor_aduana_dolar = this.extractValorAduanaTotal(text);

    const cotizMatch = text.match(this.patterns.cotizacion);
    if (cotizMatch) data.cotizacion = this.parseNumber(cotizMatch[1]);

    const vendedorMatch = text.match(this.patterns.vendedor);
    if (vendedorMatch) data.vendedor = vendedorMatch[1].trim();

    const importadorMatch = text.match(this.patterns.importador);
    if (importadorMatch) data.importador = importadorMatch[1].trim();

    const despachoMatch = text.match(this.patterns.despacho_num);
    if (despachoMatch) data.despacho_numero = despachoMatch[1];

    const fechaMatch = text.match(this.patterns.oficializacion);
    if (fechaMatch) data.fecha_oficializacion = fechaMatch[1];

    return data;
  }
}
