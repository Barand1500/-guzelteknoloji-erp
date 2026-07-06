import { varsayilanMasaGrubuKaydi } from '@/admin/baslat-menusu/tanimlar/masa-gruplari/varsayilanVeri';
import { bosMasaGrubuAyarlar, type TanimlarMasaGrubuKayit } from '@/admin/baslat-menusu/tanimlar/masa-gruplari/tipler';

const STORAGE_KEY = 'restorant-tanimlar-masa-gruplari';

export function masaGrubuKaydiOku(): TanimlarMasaGrubuKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanMasaGrubuKaydi();
    const parsed = JSON.parse(ham) as Partial<TanimlarMasaGrubuKayit>;
    const varsayilan = varsayilanMasaGrubuKaydi();
    const gruplar = parsed.gruplar?.length ? parsed.gruplar : varsayilan.gruplar;
    const ayarlar = { ...varsayilan.ayarlar, ...parsed.ayarlar };
    for (const g of gruplar) {
      if (!ayarlar[g.id]) ayarlar[g.id] = bosMasaGrubuAyarlar();
    }
    return { gruplar, ayarlar };
  } catch {
    return varsayilanMasaGrubuKaydi();
  }
}

export function masaGrubuKaydiKaydet(kayit: TanimlarMasaGrubuKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}
