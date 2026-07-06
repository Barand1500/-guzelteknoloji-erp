const STORAGE_ANAHTAR = 'restorant-firma-tablo-sutunlari';

export interface FirmaTabloSutunTanim {
  id: string;
  etiket: string;
  /** Tabloda gizlenemez */
  zorunlu?: boolean;
  /** Hücre içi düzenleme yok */
  saltOkunur?: boolean;
}

/** Ayarlanabilir sütunlar (Düzenle sütunu her zaman sonda kalır) */
export const FIRMA_TABLO_SUTUNLARI: FirmaTabloSutunTanim[] = [
  { id: 'tabelaAdi', etiket: 'Tabela' },
  { id: 'unvan', etiket: 'Unvan', zorunlu: true },
  { id: 'bayiId', etiket: 'Bayi' },
  { id: 'il', etiket: 'İl' },
  { id: 'ilce', etiket: 'İlçe' },
  { id: 'eposta', etiket: 'E-posta' },
  { id: 'telefon', etiket: 'Telefon' },
  { id: 'gsm', etiket: 'GSM' },
  { id: 'vergiDairesi', etiket: 'Vergi Dairesi' },
  { id: 'vergiNo', etiket: 'Vergi No' },
  { id: 'iskonto', etiket: 'İskonto %' },
  { id: 'subeSayisi', etiket: 'Şube', saltOkunur: true },
  { id: 'lisansDurum', etiket: 'Lisans', saltOkunur: true },
  { id: 'aktif', etiket: 'Durum' },
];

const GECERLI_IDLER = new Set(FIRMA_TABLO_SUTUNLARI.map((s) => s.id));

/** Varsayılan görünür sütunlar ve sırası */
export const FIRMA_TABLO_VARSAYILAN_SIRA: string[] = [
  'tabelaAdi',
  'unvan',
  'bayiId',
  'il',
  'ilce',
  'vergiDairesi',
  'vergiNo',
  'iskonto',
  'aktif',
  'subeSayisi',
  'lisansDurum',
];

export function firmaTabloSutunlariOku(): string[] {
  try {
    const ham = localStorage.getItem(STORAGE_ANAHTAR);
    if (!ham) return [...FIRMA_TABLO_VARSAYILAN_SIRA];
    const parsed = JSON.parse(ham) as string[];
    if (!Array.isArray(parsed)) return [...FIRMA_TABLO_VARSAYILAN_SIRA];
    const temiz = parsed.filter((id) => GECERLI_IDLER.has(id));
    if (!temiz.includes('unvan')) temiz.unshift('unvan');
    return temiz.length > 0 ? temiz : [...FIRMA_TABLO_VARSAYILAN_SIRA];
  } catch {
    return [...FIRMA_TABLO_VARSAYILAN_SIRA];
  }
}

export function firmaTabloSutunlariKaydet(sira: string[]) {
  const temiz = sira.filter((id) => GECERLI_IDLER.has(id));
  if (!temiz.includes('unvan')) temiz.unshift('unvan');
  localStorage.setItem(STORAGE_ANAHTAR, JSON.stringify(temiz));
}

export function firmaTabloSutunTanimiBul(id: string): FirmaTabloSutunTanim | undefined {
  return FIRMA_TABLO_SUTUNLARI.find((s) => s.id === id);
}
