const STORAGE_ANAHTAR = 'restorant-sube-tablo-sutunlari';

export interface SubeTabloSutunTanim {
  id: string;
  etiket: string;
  zorunlu?: boolean;
  saltOkunur?: boolean;
}

export const SUBE_TABLO_SUTUNLARI: SubeTabloSutunTanim[] = [
  { id: 'subeAdi', etiket: 'Şube adı', zorunlu: true },
  { id: 'firma', etiket: 'Firma' },
  { id: 'subeTipi', etiket: 'Tip' },
  { id: 'konum', etiket: 'Konum' },
  { id: 'vergiDairesi', etiket: 'Vergi dairesi' },
  { id: 'vergiNo', etiket: 'Vergi no' },
  { id: 'iskonto', etiket: 'İskonto %' },
  { id: 'kayitTarihi', etiket: 'Kayıt', saltOkunur: true },
  { id: 'guncellemeTarihi', etiket: 'Güncelleme', saltOkunur: true },
  { id: 'aktif', etiket: 'Durum' },
];

const GECERLI_IDLER = new Set(SUBE_TABLO_SUTUNLARI.map((s) => s.id));

export const SUBE_TABLO_VARSAYILAN_SIRA: string[] = [
  'subeAdi',
  'firma',
  'subeTipi',
  'konum',
  'vergiDairesi',
  'vergiNo',
  'iskonto',
  'kayitTarihi',
  'guncellemeTarihi',
  'aktif',
];

export function subeTabloSutunlariOku(): string[] {
  try {
    const ham = localStorage.getItem(STORAGE_ANAHTAR);
    if (!ham) return [...SUBE_TABLO_VARSAYILAN_SIRA];
    const parsed = JSON.parse(ham) as string[];
    if (!Array.isArray(parsed)) return [...SUBE_TABLO_VARSAYILAN_SIRA];
    const temiz = parsed.filter((id) => GECERLI_IDLER.has(id));
    if (!temiz.includes('subeAdi')) temiz.unshift('subeAdi');
    return temiz.length > 0 ? temiz : [...SUBE_TABLO_VARSAYILAN_SIRA];
  } catch {
    return [...SUBE_TABLO_VARSAYILAN_SIRA];
  }
}

export function subeTabloSutunlariKaydet(sira: string[]) {
  const temiz = sira.filter((id) => GECERLI_IDLER.has(id));
  if (!temiz.includes('subeAdi')) temiz.unshift('subeAdi');
  localStorage.setItem(STORAGE_ANAHTAR, JSON.stringify(temiz));
}

export function subeTabloSutunTanimiBul(id: string): SubeTabloSutunTanim | undefined {
  return SUBE_TABLO_SUTUNLARI.find((s) => s.id === id);
}
