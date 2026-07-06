const STORAGE_ANAHTAR = 'restorant-kullanici-tablo-sutunlari';

export interface KullaniciTabloSutunTanim {
  id: string;
  etiket: string;
  zorunlu?: boolean;
  saltOkunur?: boolean;
}

export const KULLANICI_TABLO_SUTUNLARI: KullaniciTabloSutunTanim[] = [
  { id: 'ad', etiket: 'Ad Soyad', zorunlu: true },
  { id: 'eposta', etiket: 'E-posta' },
  { id: 'gsm', etiket: 'GSM' },
  { id: 'rol', etiket: 'Rol' },
  { id: 'kullaniciTipi', etiket: 'Tip', saltOkunur: true },
  { id: 'bayiId', etiket: 'Bayi' },
  { id: 'firmaId', etiket: 'Firma' },
  { id: 'subeId', etiket: 'Şube' },
  { id: 'iskonto', etiket: 'İskonto %' },
  { id: 'aktif', etiket: 'Durum' },
  { id: 'sonGirisTarihi', etiket: 'Son Giriş', saltOkunur: true },
];

const GECERLI_IDLER = new Set(KULLANICI_TABLO_SUTUNLARI.map((s) => s.id));

export const KULLANICI_TABLO_VARSAYILAN_SIRA: string[] = [
  'ad',
  'eposta',
  'gsm',
  'rol',
  'bayiId',
  'firmaId',
  'subeId',
  'iskonto',
  'aktif',
  'sonGirisTarihi',
];

export function kullaniciTabloSutunlariOku(): string[] {
  try {
    const ham = localStorage.getItem(STORAGE_ANAHTAR);
    if (!ham) return [...KULLANICI_TABLO_VARSAYILAN_SIRA];
    const parsed = JSON.parse(ham) as string[];
    if (!Array.isArray(parsed)) return [...KULLANICI_TABLO_VARSAYILAN_SIRA];
    const temiz = parsed.filter((id) => GECERLI_IDLER.has(id));
    if (!temiz.includes('ad')) temiz.unshift('ad');
    return temiz.length > 0 ? temiz : [...KULLANICI_TABLO_VARSAYILAN_SIRA];
  } catch {
    return [...KULLANICI_TABLO_VARSAYILAN_SIRA];
  }
}

export function kullaniciTabloSutunlariKaydet(sira: string[]) {
  const temiz = sira.filter((id) => GECERLI_IDLER.has(id));
  if (!temiz.includes('ad')) temiz.unshift('ad');
  localStorage.setItem(STORAGE_ANAHTAR, JSON.stringify(temiz));
}

export function kullaniciTabloSutunTanimiBul(id: string): KullaniciTabloSutunTanim | undefined {
  return KULLANICI_TABLO_SUTUNLARI.find((s) => s.id === id);
}
