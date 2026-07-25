/**
 * Kredi kartı ödeme tarihi önizlemesi.
 * Anlaşmada saklanan şey kural (kesim günü + kaç gün sonra); gerçek tarih aya göre değişir.
 * Burada yalnızca sıradaki dönem için bilgilendirme üretilir, kural değiştirilmez.
 */

import {
  resmiTatilEtiketi,
  resmiTatillerGuneGore,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/resmiTatiller';

export interface OdemeTarihiOnizleme {
  kesimEtiket: string;
  odemeEtiket: string;
  odemeGunAdi: string;
  haftaSonu: boolean;
  tatilAdi: string;
  /** Hafta sonu veya resmi tatile denk geliyorsa ilk iş günü */
  sonrakiIsGunuEtiket: string | null;
}

const TARIH_BICIM = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const GUN_BICIM = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' });

function isoGun(t: Date): string {
  const yy = t.getFullYear();
  const mm = String(t.getMonth() + 1).padStart(2, '0');
  const gg = String(t.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${gg}`;
}

/** Ayın istenen günü; kısa aylarda ay sonuna sabitlenir (31 → Şubat'ta 28/29) */
function ayinGunu(yil: number, ay: number, gun: number): Date {
  const ayinSonGunu = new Date(yil, ay + 1, 0).getDate();
  return new Date(yil, ay, Math.min(gun, ayinSonGunu));
}

function haftaSonuMu(t: Date): boolean {
  const g = t.getDay();
  return g === 0 || g === 6;
}

function tatilMi(t: Date): boolean {
  return resmiTatillerGuneGore(isoGun(t)).length > 0;
}

function ilkIsGunu(t: Date): Date {
  const sonuc = new Date(t);
  let adim = 0;
  while ((haftaSonuMu(sonuc) || tatilMi(sonuc)) && adim < 30) {
    sonuc.setDate(sonuc.getDate() + 1);
    adim += 1;
  }
  return sonuc;
}

/** Bugünden sonraki ilk hesap kesim tarihi */
function sonrakiKesim(kesimGunu: number, bugun: Date): Date {
  const bugunSade = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
  const buAy = ayinGunu(bugunSade.getFullYear(), bugunSade.getMonth(), kesimGunu);
  if (buAy >= bugunSade) return buAy;
  return ayinGunu(bugunSade.getFullYear(), bugunSade.getMonth() + 1, kesimGunu);
}

export function odemeTarihiOnizle(
  kesimGunuMetin: string,
  odemeSuresiMetin: string,
  bugun: Date = new Date()
): OdemeTarihiOnizleme | null {
  const kesimGunu = Number(kesimGunuMetin);
  const odemeSuresi = Number(odemeSuresiMetin);
  if (!Number.isFinite(kesimGunu) || kesimGunu < 1 || kesimGunu > 31) return null;
  if (!Number.isFinite(odemeSuresi) || odemeSuresi < 1) return null;

  const kesim = sonrakiKesim(kesimGunu, bugun);
  const odeme = new Date(kesim);
  odeme.setDate(odeme.getDate() + odemeSuresi);

  const haftaSonu = haftaSonuMu(odeme);
  const tatilAdi = resmiTatilEtiketi(isoGun(odeme));
  const isGunu = haftaSonu || tatilAdi ? ilkIsGunu(odeme) : null;

  return {
    kesimEtiket: TARIH_BICIM.format(kesim),
    odemeEtiket: TARIH_BICIM.format(odeme),
    odemeGunAdi: GUN_BICIM.format(odeme),
    haftaSonu,
    tatilAdi,
    sonrakiIsGunuEtiket: isGunu
      ? `${TARIH_BICIM.format(isGunu)} (${GUN_BICIM.format(isGunu)})`
      : null,
  };
}
