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
    // Mejorados para ser más flexibles
    fob_total: /FOB\s+Total[^\d]*?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
    flete_total: /Flete\s+Total[^\d]*?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
    seguro_total: /Seguro\s+Total[^\d]*?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
    
    // Mejorado para capturar divisa
    divisa: /(?:FOB|Flete|Seguro)\s+Total[^\n]*?(DOL|USD|EUR|BRL|ARS)/i,
    
    // Mejorado para valor en aduana
    valor_aduana: /Valor\s+en\s+Aduana\s+en\s+(?:Divisa|D[oó]lar)[^\d]*?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
    
    // Mejorado para cotización
    cotizacion: /Cotiz\s*[=:]\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d+)/i,
    
    // Mejorado para vendedor
    vendedor: /Vendedor[^\n]*?\n\s*([A-Z][A-Z0-9\s.,\-&()]+?)(?=\n|\s+V[ií]a|\s+Document)/i,
    
    // Mejorado para importador - ahora busca específicamente después de "Importador"
    importador: /Importador\s*[\/]?\s*Exportador[^\n]*?\n\s*([A-Z][A-Z0-9\s.,\-&()]+?)(?=\s+(?:CUIT|Agente|Despachante)|\n\s*CUIT|\n\s*\d)/i,
    
    // Mejorado para número de despacho
    despacho_num: /(?:A[ñn]o\s*[\/]?\s*Ad\.?\s*[\/]?\s*Tipo\s*[\/]?\s*N[º°]Reg\.?\s*[\/]?\s*DC[^\n]*?)?(\d{2}\s+\d{3}\s+[A-Z]{2,4}\s+\d+\s+[A-Z])/i,
    
    // Mejorado para fecha de oficialización
    oficializacion: /Oficializaci[oó]n[^\d]*?(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
  };

  parseNumber(value: string): number {
    if (!value) return 0;
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  extractValorAduanaTotal(text: string): number {
    const matches = Array.from(text.matchAll(this.patterns.valor_aduana));
    if (!matches || matches.length === 0) return 0;
    
    const total = matches.reduce((sum, match) => {
      const numStr = match[1];
      return sum + (numStr ? this.parseNumber(numStr) : 0);
    }, 0);
    
    return total;
  }

  cleanFilename(filename: string): string {
    // Quitar la extensión .pdf
    return filename.replace(/\.pdf$/i, '');
  }

  cleanText(text: string): string {
    // Limpiar texto: quitar espacios extra, saltos de línea múltiples
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  async extractFromText(text: string, filename: string): Promise<DespachoData> {
    // Limpiar el texto primero
    const cleanedText = this.cleanText(text);
    
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

    // Extraer FOB
    const fobMatch = cleanedText.match(this.patterns.fob_total);
    if (fobMatch) {
      data.fob_total = this.parseNumber(fobMatch[1]);
    }

    // Extraer Flete
    const fleteMatch = cleanedText.match(this.patterns.flete_total);
    if (fleteMatch) {
      data.flete_total = this.parseNumber(fleteMatch[1]);
    }

    // Extraer Seguro
    const seguroMatch = cleanedText.match(this.patterns.seguro_total);
    if (seguroMatch) {
      data.seguro_total = this.parseNumber(seguroMatch[1]);
    }

    // Extraer Divisa
    const divisaMatch = cleanedText.match(this.patterns.divisa);
    if (divisaMatch) {
      data.divisa = divisaMatch[1].toUpperCase();
    }

    // Valor aduana con suma de múltiples páginas
    data.valor_aduana_dolar = this.extractValorAduanaTotal(text);

    // Extraer Cotización
    const cotizMatch = cleanedText.match(this.patterns.cotizacion);
    if (cotizMatch) {
      data.cotizacion = this.parseNumber(cotizMatch[1]);
    }

    // Extraer Vendedor
    const vendedorMatch = text.match(this.patterns.vendedor);
    if (vendedorMatch) {
      data.vendedor = vendedorMatch[1].trim().substring(0, 100); // Limitar a 100 caracteres
    }

    // Extraer Importador
    const importadorMatch = text.match(this.patterns.importador);
    if (importadorMatch) {
      data.importador = importadorMatch[1].trim().substring(0, 100);
    }

    // Extraer Número de Despacho
    const despachoMatch = text.match(this.patterns.despacho_num);
    if (despachoMatch) {
      data.despacho_numero = despachoMatch[1].trim();
    }

    // Extraer Fecha de Oficialización
    const fechaMatch = text.match(this.patterns.oficializacion);
    if (fechaMatch) {
      data.fecha_oficializacion = fechaMatch[1];
    }

    return data;
  }
}
