/** "20+20" → %36 gibi bileşik iskonto (ardışık indirimler) */
export function iskontoIfadesiHesapla(ham: string): number | null {
  const metin = ham.trim().replace(/%/g, '');
  if (!metin) return null;

  const parcalar = metin.includes('+')
    ? metin.split('+').map((p) => p.trim()).filter(Boolean)
    : [metin];

  if (parcalar.length === 0) return null;

  let kalan = 1;
  for (const p of parcalar) {
    const n = Number(p.replace(',', '.'));
    if (Number.isNaN(n) || n < 0 || n > 100) return null;
    kalan *= 1 - n / 100;
  }

  const toplam = (1 - kalan) * 100;
  if (toplam > 100) return null;
  return Math.round(toplam * 100) / 100;
}

export function iskontoGoster(deger: number | null): string {
  if (deger == null) return '—';
  return `%${deger}`;
}
