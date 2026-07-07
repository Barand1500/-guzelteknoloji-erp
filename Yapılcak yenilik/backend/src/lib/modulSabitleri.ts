/** Yeni modul olusturulunca otomatik atanacak sistem rolleri */
export const VARSAYILAN_SISTEM_ROLLERI = [
  { rolAdi: 'SUPER_ADMIN', yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'] },
  { rolAdi: 'AJANS_ADMIN', yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'] },
  { rolAdi: 'MUSTERI_ADMIN', yetkiler: ['goruntuleme', 'ekleme', 'duzenleme', 'silme', 'kullanici_yonetimi'] },
  { rolAdi: 'EDITOR', yetkiler: ['goruntuleme', 'ekleme', 'duzenleme'] },
  { rolAdi: 'SEO_EDITOR', yetkiler: ['goruntuleme', 'duzenleme'] },
  { rolAdi: 'GORUNTULEME', yetkiler: ['goruntuleme'] },
] as const;

export function prefixNormalize(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

export function prefixGecerliMi(prefix: string): boolean {
  return prefix.length >= 2 && /^[a-z][a-z0-9_]*$/.test(prefix);
}

export function prefixUret(modulAdi: string, mevcutPrefixler: string[]): string {
  let temel = prefixNormalize(modulAdi);
  if (!temel) temel = 'modul';
  if (!/^[a-z]/.test(temel)) temel = `m_${temel}`;

  if (!mevcutPrefixler.includes(temel)) return temel;

  let sayac = 2;
  while (mevcutPrefixler.includes(`${temel}_${sayac}`)) sayac += 1;
  return `${temel}_${sayac}`.slice(0, 50);
}
