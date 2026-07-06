/** Güvenli basit aritmetik: 10+10, 10-5, 20*2, 100/4 */
export function sayiIfadesiHesapla(girdi: string): number | null {
  const temiz = girdi.trim().replace(/\s+/g, '').replace(/,/g, '.');
  if (!temiz) return null;
  if (/^[+-]?\d+(\.\d+)?$/.test(temiz)) return parseFloat(temiz);

  const guvenli = temiz.replace(/[^0-9+\-*/().]/g, '');
  if (!guvenli || !/[\d]/.test(guvenli)) return null;

  try {
    const sonuc = Function(`"use strict"; return (${guvenli})`)() as unknown;
    if (typeof sonuc !== 'number' || !Number.isFinite(sonuc)) return null;
    return Math.round(sonuc * 10000) / 10000;
  } catch {
    return null;
  }
}

/**
 * İskonto ifadesi: 20+20 → bileşik %36 (1-(1-0.2)*(1-0.2))
 * Tek değer veya + ile ayrılmış yüzdeler.
 */
export function iskontoIfadesiHesapla(girdi: string): number | null {
  const temiz = girdi.trim().replace(/%/g, '').replace(/,/g, '.');
  if (!temiz) return null;

  if (temiz.includes('+')) {
    const parcalar = temiz.split('+').map((p) => parseFloat(p.trim())).filter((n) => !Number.isNaN(n));
    if (parcalar.length < 2) return sayiIfadesiHesapla(temiz);
    let carpim = 1;
    for (const yuzde of parcalar) {
      carpim *= 1 - Math.min(100, Math.max(0, yuzde)) / 100;
    }
    const bileşik = (1 - carpim) * 100;
    return Math.round(bileşik * 100) / 100;
  }

  const tek = sayiIfadesiHesapla(temiz);
  return tek;
}

export function ifadeHesapla(girdi: string, tip: 'sayi' | 'iskonto'): number | null {
  return tip === 'iskonto' ? iskontoIfadesiHesapla(girdi) : sayiIfadesiHesapla(girdi);
}
