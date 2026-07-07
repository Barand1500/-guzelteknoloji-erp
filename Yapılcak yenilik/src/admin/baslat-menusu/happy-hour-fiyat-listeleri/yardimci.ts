import { varsayilanFiyatListeKaydi } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/varsayilanVeri';
import type {
  FiyatGuncellemeTaslak,
  FiyatListeKayit,
  FiyatSablonu,
  YeniSablonTaslak,
} from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/tipler';

const STORAGE_KEY = 'restorant-happy-hour-fiyat-listeleri';

export function fiyatListeKaydiOku(): FiyatListeKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return JSON.parse(JSON.stringify(varsayilanFiyatListeKaydi)) as FiyatListeKayit;
    const parsed = JSON.parse(ham) as FiyatListeKayit;
    if (!parsed?.sablonlar?.length) return JSON.parse(JSON.stringify(varsayilanFiyatListeKaydi)) as FiyatListeKayit;
    return parsed;
  } catch {
    return JSON.parse(JSON.stringify(varsayilanFiyatListeKaydi)) as FiyatListeKayit;
  }
}

export function fiyatListeKaydiKaydet(kayit: FiyatListeKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}

export function sonrakiSablonId(sablonlar: FiyatSablonu[]): number {
  return sablonlar.reduce((max, s) => Math.max(max, s.id), 0) + 1;
}

export function aktifSablonAdi(kayit: FiyatListeKayit): string {
  const sablon = kayit.sablonlar.find((s) => s.id === kayit.aktifSablonId);
  return sablon?.ad ?? '—';
}

export function yeniSablonKirli(taslak: YeniSablonTaslak): boolean {
  return taslak.ad.trim().length > 0;
}

export function guncellemeKirli(taslak: FiyatGuncellemeTaslak, baslangic: FiyatGuncellemeTaslak): boolean {
  return JSON.stringify(taslak) !== JSON.stringify(baslangic);
}

export function kayitKirli(a: FiyatListeKayit, b: FiyatListeKayit): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}
