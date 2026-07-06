import { varsayilanUrunEslestirKaydi } from '@/admin/baslat-menusu/urun-eslestir/varsayilanVeri';
import type { PlatformEslestirme, UrunEslestirKayit } from '@/admin/baslat-menusu/urun-eslestir/tipler';
import { bosPlatformEslestirme } from '@/admin/baslat-menusu/urun-eslestir/tipler';

const STORAGE_KEY = 'restorant-urun-eslestir';

function platformEslestirmeNormalize(ham: unknown): PlatformEslestirme {
  const o = (ham && typeof ham === 'object' ? ham : {}) as Partial<PlatformEslestirme>;
  return {
    esDegerUrun: String(o.esDegerUrun ?? ''),
    carpan: typeof o.carpan === 'number' && !Number.isNaN(o.carpan) ? o.carpan : 1,
    secenek1: String(o.secenek1 ?? ''),
    secenek2: String(o.secenek2 ?? ''),
    opsiyonlar: Array.isArray(o.opsiyonlar)
      ? o.opsiyonlar.map((op) => ({
          id: String((op as { id?: string }).id ?? ''),
          opsiyon: String((op as { opsiyon?: string }).opsiyon ?? ''),
          product: String((op as { product?: string }).product ?? ''),
          anaUrun: Boolean((op as { anaUrun?: boolean }).anaUrun),
          menuYuzdesi: String((op as { menuYuzdesi?: string }).menuYuzdesi ?? ''),
          miktar: String((op as { miktar?: string }).miktar ?? ''),
          menuFiyat: String((op as { menuFiyat?: string }).menuFiyat ?? ''),
        }))
      : [],
  };
}

export function urunEslestirKaydiOku(): UrunEslestirKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanUrunEslestirKaydi();
    const parsed = JSON.parse(ham) as Partial<UrunEslestirKayit>;
    if (!parsed.harita || typeof parsed.harita !== 'object') return varsayilanUrunEslestirKaydi();

    const harita: UrunEslestirKayit['harita'] = {};
    for (const [urunId, platformlar] of Object.entries(parsed.harita)) {
      if (!platformlar || typeof platformlar !== 'object') continue;
      harita[urunId] = {};
      for (const [platform, es] of Object.entries(platformlar)) {
        harita[urunId][platform] = platformEslestirmeNormalize(es);
      }
    }
    return { harita };
  } catch {
    return varsayilanUrunEslestirKaydi();
  }
}

export function urunEslestirKaydiKaydet(kayit: UrunEslestirKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}

export function platformEslestirmeAl(
  kayit: UrunEslestirKayit,
  urunId: string,
  platform: string
): PlatformEslestirme {
  return kayit.harita[urunId]?.[platform] ?? bosPlatformEslestirme();
}

export function platformEslestirmeGuncelle(
  kayit: UrunEslestirKayit,
  urunId: string,
  platform: string,
  eslestirme: PlatformEslestirme
): UrunEslestirKayit {
  return {
    harita: {
      ...kayit.harita,
      [urunId]: {
        ...(kayit.harita[urunId] ?? {}),
        [platform]: eslestirme,
      },
    },
  };
}
