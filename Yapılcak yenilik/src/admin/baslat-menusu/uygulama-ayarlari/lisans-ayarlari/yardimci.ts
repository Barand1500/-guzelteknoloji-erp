import type { LisansKaydi } from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/tipler';
import { bosLisansKaydi } from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/tipler';
import { ORNEK_LISANSLAR } from '@/admin/baslat-menusu/uygulama-ayarlari/lisans-ayarlari/varsayilanVeri';

const STORAGE_KEY = 'restorant-lisans-ayarlari';

export function lisansListesiOku(): LisansKaydi[] {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return ORNEK_LISANSLAR.map((l) => ({ ...l }));
    const parsed = JSON.parse(ham);
    if (!Array.isArray(parsed)) return ORNEK_LISANSLAR.map((l) => ({ ...l }));
    return parsed.map((l) => normalizeLisans(l));
  } catch {
    return ORNEK_LISANSLAR.map((l) => ({ ...l }));
  }
}

export function lisansListesiKaydet(liste: LisansKaydi[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(liste));
}

function normalizeLisans(ham: Partial<LisansKaydi>): LisansKaydi {
  return {
    id: String(ham.id ?? `lis-${Date.now()}`),
    urun: String(ham.urun ?? ''),
    seriNo: String(ham.seriNo ?? ''),
    kullaniciAdi: String(ham.kullaniciAdi ?? ''),
    parola: String(ham.parola ?? ''),
    isletmeKodu: String(ham.isletmeKodu ?? ''),
    lisansAnahtari: String(ham.lisansAnahtari ?? ''),
  };
}

export function lisansKaydiKopyala(k: LisansKaydi): LisansKaydi {
  return { ...k };
}

export function lisansFormGecerli(k: LisansKaydi) {
  return (
    k.urun.trim().length > 0 &&
    k.kullaniciAdi.trim().length > 0 &&
    k.lisansAnahtari.trim().length > 0
  );
}

export function yeniLisansId() {
  return `lis-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function bosLisansFormu(): LisansKaydi {
  return { ...bosLisansKaydi(), id: yeniLisansId() };
}
