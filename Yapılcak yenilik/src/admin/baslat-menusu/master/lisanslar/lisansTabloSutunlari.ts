const STORAGE_ANAHTAR = 'restorant-lisans-tablo-sutunlari';

export interface LisansTabloSutunTanim {
  id: string;
  etiket: string;
  zorunlu?: boolean;
  saltOkunur?: boolean;
}

export const LISANS_TABLO_SUTUNLARI: LisansTabloSutunTanim[] = [
  { id: 'firma', etiket: 'Firma', zorunlu: true, saltOkunur: true },
  { id: 'paketId', etiket: 'Paket' },
  { id: 'baslangicTarihi', etiket: 'Başlangıç' },
  { id: 'bitisTarihi', etiket: 'Bitiş' },
  { id: 'aktif', etiket: 'Durum' },
  { id: 'kayitTarihi', etiket: 'Kayıt tarihi', saltOkunur: true },
  { id: 'guncellemeTarihi', etiket: 'Güncelleme', saltOkunur: true },
];

const GECERLI_IDLER = new Set(LISANS_TABLO_SUTUNLARI.map((s) => s.id));

export const LISANS_TABLO_VARSAYILAN_SIRA: string[] = [
  'firma',
  'paketId',
  'baslangicTarihi',
  'bitisTarihi',
  'aktif',
];

export function lisansTabloSutunlariOku(): string[] {
  try {
    const ham = localStorage.getItem(STORAGE_ANAHTAR);
    if (!ham) return [...LISANS_TABLO_VARSAYILAN_SIRA];
    const parsed = JSON.parse(ham) as string[];
    if (!Array.isArray(parsed)) return [...LISANS_TABLO_VARSAYILAN_SIRA];
    const temiz = parsed.filter((id) => GECERLI_IDLER.has(id) && id !== 'durum');
    if (!temiz.includes('firma')) temiz.unshift('firma');
    return temiz.length > 0 ? temiz : [...LISANS_TABLO_VARSAYILAN_SIRA];
  } catch {
    return [...LISANS_TABLO_VARSAYILAN_SIRA];
  }
}

export function lisansTabloSutunlariKaydet(sira: string[]) {
  const temiz = sira.filter((id) => GECERLI_IDLER.has(id) && id !== 'durum');
  if (!temiz.includes('firma')) temiz.unshift('firma');
  localStorage.setItem(STORAGE_ANAHTAR, JSON.stringify(temiz));
}

export function lisansTabloSutunTanimiBul(id: string): LisansTabloSutunTanim | undefined {
  return LISANS_TABLO_SUTUNLARI.find((s) => s.id === id);
}
