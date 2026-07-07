const STORAGE_ANAHTAR = 'restorant-bayi-tablo-sutunlari';

export interface BayiTabloSutunTanim {
  id: string;
  etiket: string;
  zorunlu?: boolean;
  saltOkunur?: boolean;
}

export const BAYI_TABLO_SUTUNLARI: BayiTabloSutunTanim[] = [
  { id: 'unvan', etiket: 'Unvan', zorunlu: true },
  { id: 'konum', etiket: 'Konum' },
  { id: 'ustBayi', etiket: 'Üst bayi' },
  { id: 'vergiDairesi', etiket: 'Vergi dairesi' },
  { id: 'vergiNo', etiket: 'Vergi no' },
  { id: 'iskonto', etiket: 'İskonto %' },
  { id: 'firmaSayisi', etiket: 'Firma sayısı', saltOkunur: true },
  { id: 'kayitTarihi', etiket: 'Kayıt', saltOkunur: true },
  { id: 'guncellemeTarihi', etiket: 'Güncelleme', saltOkunur: true },
  { id: 'aktif', etiket: 'Durum' },
];

const GECERLI_IDLER = new Set(BAYI_TABLO_SUTUNLARI.map((s) => s.id));

export const BAYI_TABLO_VARSAYILAN_SIRA: string[] = [
  'unvan',
  'konum',
  'ustBayi',
  'vergiDairesi',
  'vergiNo',
  'iskonto',
  'firmaSayisi',
  'kayitTarihi',
  'guncellemeTarihi',
  'aktif',
];

export function bayiTabloSutunlariOku(): string[] {
  try {
    const ham = localStorage.getItem(STORAGE_ANAHTAR);
    if (!ham) return [...BAYI_TABLO_VARSAYILAN_SIRA];
    const parsed = JSON.parse(ham) as string[];
    if (!Array.isArray(parsed)) return [...BAYI_TABLO_VARSAYILAN_SIRA];
    const temiz = parsed.filter((id) => GECERLI_IDLER.has(id));
    if (!temiz.includes('unvan')) temiz.unshift('unvan');
    return temiz.length > 0 ? temiz : [...BAYI_TABLO_VARSAYILAN_SIRA];
  } catch {
    return [...BAYI_TABLO_VARSAYILAN_SIRA];
  }
}

export function bayiTabloSutunlariKaydet(sira: string[]) {
  const temiz = sira.filter((id) => GECERLI_IDLER.has(id));
  if (!temiz.includes('unvan')) temiz.unshift('unvan');
  localStorage.setItem(STORAGE_ANAHTAR, JSON.stringify(temiz));
}

export function bayiTabloSutunTanimiBul(id: string): BayiTabloSutunTanim | undefined {
  return BAYI_TABLO_SUTUNLARI.find((s) => s.id === id);
}
