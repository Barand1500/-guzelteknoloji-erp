import type { TartilacakUrunKayit } from '@/admin/baslat-menusu/tarilacak-urunler/tipler';

const STORAGE_KEY = 'restorant-tartilacak-urunler';

const VARSAYILAN_IDLER = ['u4', 'u9', 'u17'];

export function tartilacakUrunKaydiOku(): TartilacakUrunKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return { tartilanUrunIdleri: [...VARSAYILAN_IDLER] };
    const parsed = JSON.parse(ham) as Partial<TartilacakUrunKayit>;
    if (!Array.isArray(parsed.tartilanUrunIdleri)) return { tartilanUrunIdleri: [...VARSAYILAN_IDLER] };
    return { tartilanUrunIdleri: parsed.tartilanUrunIdleri };
  } catch {
    return { tartilanUrunIdleri: [...VARSAYILAN_IDLER] };
  }
}

export function tartilacakUrunKaydiKaydet(kayit: TartilacakUrunKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}
