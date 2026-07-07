const STORAGE_ANAHTAR = 'restorant-paket-kart-alanlari';

export interface PaketKartAlanTanim {
  id: string;
  etiket: string;
  zorunlu?: boolean;
}

/** Kart üzerinde gösterilebilir alanlar (paket adı ve durum her zaman görünür) */
export const PAKET_KART_ALANLARI: PaketKartAlanTanim[] = [
  { id: 'fiyat', etiket: 'Fiyat' },
  { id: 'subeSayisi', etiket: 'Şube sayısı' },
  { id: 'personelSayisi', etiket: 'Personel sayısı' },
  { id: 'masaSayisi', etiket: 'Masa sayısı' },
  { id: 'aktifLisansSayisi', etiket: 'Aktif lisans' },
];

const GECERLI_IDLER = new Set(PAKET_KART_ALANLARI.map((s) => s.id));

export const PAKET_KART_VARSAYILAN_SIRA: string[] = [
  'fiyat',
  'subeSayisi',
  'personelSayisi',
  'masaSayisi',
  'aktifLisansSayisi',
];

export function paketKartAlanlariOku(): string[] {
  try {
    const ham = localStorage.getItem(STORAGE_ANAHTAR);
    if (!ham) return [...PAKET_KART_VARSAYILAN_SIRA];
    const parsed = JSON.parse(ham) as string[];
    if (!Array.isArray(parsed)) return [...PAKET_KART_VARSAYILAN_SIRA];
    const temiz = parsed.filter((id) => GECERLI_IDLER.has(id));
    return temiz.length > 0 ? temiz : [...PAKET_KART_VARSAYILAN_SIRA];
  } catch {
    return [...PAKET_KART_VARSAYILAN_SIRA];
  }
}

export function paketKartAlanlariKaydet(sira: string[]) {
  const temiz = sira.filter((id) => GECERLI_IDLER.has(id));
  localStorage.setItem(STORAGE_ANAHTAR, JSON.stringify(temiz));
}

export function paketKartAlanTanimiBul(id: string): PaketKartAlanTanim | undefined {
  return PAKET_KART_ALANLARI.find((s) => s.id === id);
}
