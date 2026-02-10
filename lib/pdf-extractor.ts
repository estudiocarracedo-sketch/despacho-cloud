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

  // Permite: 15059,66 | 15.059,66 | 949,00 | 1.474,500000 | 0,00
  private static AMOUNT = `([0-9]{1,3}(?:\\.[0-9]{3})*(?:,[0-9]{1,6})|[0-9]+(?:,[0-9]{1,6})?)`;

  parseNumber(value: string): number {
    if (!value) return 0;

    const s = value
      .replace(/\s+/g, '')
      .replace(/\./g, '')     // miles
      .replace(',', '.');     // decimal

    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  cleanFilename(filename: string): string {
    return filename.replace(/\.pdf$/i, '');
  }

  private matchAmountNear(text: string, labelRegex: RegExp): number | null {
    // Busca: LABEL + cualquier cosa (poco) + monto
    // [\s\S]{0,80}? permite saltos, tabs, etc.
    const re = new RegExp(`${labelRegex.source}[\\s\\S]{0,80}?${PDFExtractor.AMOUNT}`, 'i');
    const m = text.match(re);
    if (!m) return null;
    return this.parseNumber(m[1]);
  }

  private sumAll(text: string, re: RegExp): number | null {
    const matches = Array.from(text.matchAll(re));
    if (!matches.length) return null;
    return matches.reduce((sum, mm) => sum + this.parseNumber(mm[1]), 0);
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

    // 1) FOB TOTAL (más tolerante)
    let fob =
      this.matchAmountNear(text, /FOB\s+Total/i) ??
      this.matchAmountNear(text, /FOB\s+Total\s+en\s+D[oó]lar/i) ??
      this.matchAmountNear(text, /FOB\s+Total\s+en\s+Divisa/i);

    // Fallback: si no aparece FOB Total, sumá "Monto FOB:" (subítems)
    if (fob === null) {
      const reMontoFob = new RegExp(`Monto\\s+FOB:\\s*${PDFExtractor.AMOUNT}`, 'gi');
      fob = this.sumAll(text, reMontoFob);
    }
    if (fob !== null) data.fob_total = fob;

    // 2) FLETE TOTAL (tolerante)
    const flete = this.matchAmountNear(text, /Flete\s+Total/i);
    if (flete !== null) data.flete_total = flete;

    // 3) SEGURO TOTAL (tolerante)
    const seguro = this.matchAmountNear(text, /Seguro\s+Total/i);
    if (seguro !== null) data.seguro_total = seguro;

    // 4) DIVISA (a veces viene "DOL", a veces "USD")
    const mDiv = text.match(/Divisa\s*[\r\n\s]+(DOL|USD|EUR|BRL|ARS)\b/i);
    if (mDiv) data.divisa = mDiv[1].toUpperCase();

    // 5) VALOR EN ADUANA EN DOLAR (sumatoria si aparece varias veces)
    const reValAduana = new RegExp(
      `Valor\\s+en\\s+Aduana\\s+en\\s+D[oó]lar[\\s\\S]{0,80}?${PDFExtractor.AMOUNT}`,
      'gi'
    );
    const val = this.sumAll(text, reValAduana);
    if (val !== null) data.valor_aduana_dolar = val;

    // 6) COTIZACION (decimales variables)
    const mCot = text.match(new RegExp(`Cotiz\\s*=\\s*${PDFExtractor.AMOUNT}`, 'i'));
    if (mCot) data.cotizacion = this.parseNumber(mCot[1]);

    // 7) VENDEDOR (dejalo como está, pero tolerando saltos)
    let mVend = text.match(/Vendedor[\r\n\s]+\d{2}-\d{8}-\d[\r\n\s]+([A-Z][^\n]{3,80})/i);
    if (!mVend) mVend = text.match(/Vendedor[\r\n\s]+([A-Z][^\n]{3,80})/i);
    if (mVend) data.vendedor = mVend[1].replace(/\s+/g, ' ').trim();

    // 8) IMPORTADOR
    const mImp = text.match(/Importador\s*\/\s*Exportador[\r\n\s]+([^\n]{3,100})/i);
    if (mImp) data.importador = mImp[1].replace(/\s+/g, ' ').trim();

    // 9) NUMERO DE DESPACHO
    const mDesp = text.match(/(\d{2}\s+\d{3}\s+[A-Z0-9]{2,6}\s+\d{4,8}\s+[A-Z])\b/);
    if (mDesp) data.despacho_numero = mDesp[1].replace(/\s+/g, ' ').trim();

    // 10) FECHA
    let mFecha = text.match(/Oficializaci[oó]n[\r\n\s]+(\d{2}\/\d{2}\/\d{4})/i);
    if (!mFecha) mFecha = text.match(/Oficializaci[oó]n\s+(\d{2}\/\d{2}\/\d{4})/i);
    if (mFecha) data.fecha_oficializacion = mFecha[1];

    return data;
  }
}
