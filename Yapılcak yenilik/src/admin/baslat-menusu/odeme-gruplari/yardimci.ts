import { varsayilanOdemeGruplariKaydi } from '@/admin/baslat-menusu/odeme-gruplari/varsayilanVeri';
import type { OdemeGruplariKayit } from '@/admin/baslat-menusu/odeme-gruplari/tipler';

const STORAGE_KEY = 'restorant-odeme-gruplari';

export function odemeGruplariOku(): OdemeGruplariKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanOdemeGruplariKaydi();
    const parsed = JSON.parse(ham) as Partial<OdemeGruplariKayit>;
    if (!Array.isArray(parsed.satirlar)) return varsayilanOdemeGruplariKaydi();
    return {
      satirlar: parsed.satirlar.map((s) => ({
        id: String(s.id ?? ''),
        odemeGrubu: String(s.odemeGrubu ?? ''),
        odemeYontemi: String(s.odemeYontemi ?? ''),
        uygulama: String(s.uygulama ?? ''),
      })),
    };
  } catch {
    return varsayilanOdemeGruplariKaydi();
  }
}

export function odemeGruplariKaydet(kayit: OdemeGruplariKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}
