import { PDFDocument } from 'pdf-lib';

/** Aynı seçimde gelen birden fazla PDF'i tek dosyada birleştirir. */
export async function pdfDosyalariniBirlestir(dosyalar: File[]): Promise<File> {
  if (dosyalar.length === 0) {
    throw new Error('Birleştirilecek PDF yok');
  }
  if (dosyalar.length === 1) {
    return dosyalar[0]!;
  }

  const hedef = await PDFDocument.create();

  for (const dosya of dosyalar) {
    const kaynakBayt = await dosya.arrayBuffer();
    const kaynak = await PDFDocument.load(kaynakBayt, { ignoreEncryption: true });
    const sayfalar = await hedef.copyPages(kaynak, kaynak.getPageIndices());
    for (const sayfa of sayfalar) {
      hedef.addPage(sayfa);
    }
  }

  const birlesik = await hedef.save();
  const baytlar = new Uint8Array(birlesik);
  const ilkAd = dosyalar[0]!.name.replace(/\.pdf$/i, '') || 'belge';
  const ad =
    dosyalar.length > 2
      ? `${ilkAd}-ve-${dosyalar.length - 1}-pdf-birlestirilmis.pdf`
      : `${ilkAd}-birlestirilmis.pdf`;

  return new File([baytlar], ad, { type: 'application/pdf', lastModified: Date.now() });
}
