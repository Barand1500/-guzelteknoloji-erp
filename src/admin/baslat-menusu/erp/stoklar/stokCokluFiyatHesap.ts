/** Bileşik iskonto: "20+20" → çarpan 0.64 (etkili %36) */

export function iskontoOranlariOku(iskonto: string): number[] {
  const ham = iskonto.trim();
  if (!ham) return [];
  return ham
    .split('+')
    .map((p) => p.trim().replace(',', '.'))
    .filter(Boolean)
    .map((p) => Number(p))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 100);
}

/** Kalan oran çarpanı (1 - d1/100) * (1 - d2/100) * … */
export function iskontoCarpanOku(iskonto: string): number {
  const oranlar = iskontoOranlariOku(iskonto);
  if (oranlar.length === 0) return 1;
  return oranlar.reduce((carpan, oran) => carpan * (1 - oran / 100), 1);
}

export function iskontoGecerliMi(iskonto: string): boolean {
  const ham = iskonto.trim();
  if (!ham) return true;
  if (!/^[\d.,+\s]+$/.test(ham)) return false;
  const parcalar = ham.split('+').map((p) => p.trim()).filter(Boolean);
  if (parcalar.length === 0) return false;
  return parcalar.every((p) => {
    const n = Number(p.replace(',', '.'));
    return Number.isFinite(n) && n >= 0 && n <= 100;
  });
}

export function netHesapla(fiyat: number, iskonto: string): number {
  if (!Number.isFinite(fiyat)) return 0;
  const carpan = iskontoCarpanOku(iskonto);
  return Math.round(fiyat * carpan * 10000) / 10000;
}

export function fiyatHesapla(net: number, iskonto: string): number {
  if (!Number.isFinite(net)) return 0;
  const carpan = iskontoCarpanOku(iskonto);
  if (carpan <= 0) return net;
  return Math.round((net / carpan) * 10000) / 10000;
}

/** Etkili iskonto yüzdesi: "20+20" → 36 */
export function iskontoEtkiliYuzde(iskonto: string): number | null {
  const ham = iskonto.trim();
  if (!ham || !iskontoGecerliMi(ham)) return null;
  const carpan = iskontoCarpanOku(ham);
  return Math.round((1 - carpan) * 10000) / 100;
}

export function iskontoEtkiliYuzdeMetin(iskonto: string): string {
  const yuzde = iskontoEtkiliYuzde(iskonto);
  if (yuzde === null) return '';
  return String(yuzde).replace('.', ',');
}

/** Görünüm: "%36" */
export function iskontoGorunumMetin(iskonto: string): string {
  const metin = iskontoEtkiliYuzdeMetin(iskonto);
  return metin ? `%${metin}` : '';
}

/** Fiyat + net → tek iskonto yüzdesi ("36" / "36,5") */
export function iskontoYuzdeHesapla(fiyat: number, net: number): string {
  if (!Number.isFinite(fiyat) || fiyat <= 0 || !Number.isFinite(net)) return '';
  let yuzde = (1 - net / fiyat) * 100;
  if (yuzde < 0) yuzde = 0;
  if (yuzde > 100) yuzde = 100;
  yuzde = Math.round(yuzde * 100) / 100;
  if (yuzde === 0) return '';
  return String(yuzde).replace('.', ',');
}

/** İskonto metnini normalize eder: "20 + 20" → "20+20" */
export function iskontoNormalize(ham: string): string {
  return ham
    .replace(/[^\d.,+\s]/g, '')
    .replace(/\s*\+\s*/g, '+')
    .replace(/\s+/g, '')
    .replace(/^\+|\+$/g, '');
}
