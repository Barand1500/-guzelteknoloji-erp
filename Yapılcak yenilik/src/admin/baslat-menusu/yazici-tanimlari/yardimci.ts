import { varsayilanYaziciTanimlariKaydi } from '@/admin/baslat-menusu/yazici-tanimlari/varsayilanVeri';
import type { YaziciTanimlariKayit } from '@/admin/baslat-menusu/yazici-tanimlari/tipler';

const STORAGE_KEY = 'restorant-yazici-tanimlari';

export function yaziciTanimlariOku(): YaziciTanimlariKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanYaziciTanimlariKaydi();
    const parsed = JSON.parse(ham) as Partial<YaziciTanimlariKayit>;
    const varsayilan = varsayilanYaziciTanimlariKaydi();
    return {
      mutfak: parsed.mutfak?.length ? parsed.mutfak : varsayilan.mutfak,
      pusula: parsed.pusula?.length ? parsed.pusula : varsayilan.pusula,
      resmiAdisyon: parsed.resmiAdisyon ?? varsayilan.resmiAdisyon,
    };
  } catch {
    return varsayilanYaziciTanimlariKaydi();
  }
}

export function yaziciTanimlariKaydet(kayit: YaziciTanimlariKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}
