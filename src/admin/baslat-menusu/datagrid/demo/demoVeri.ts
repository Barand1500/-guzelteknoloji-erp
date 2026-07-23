import { ifadeHesapla } from '@/admin/ortak/datagrid/formulaYardimci';

import { gecerliBirim, type BirimKodu } from './birimVeri';
import { type ParaBirimiKodu } from './paraBirimiVeri';
import { urunKoduAdiCozumle, type UrunKaydi } from './urunAramaYardimci';

export interface SiparisSatiri {
  id: string;
  urun: { sku: string; ad: string; kur?: string };
  miktar: number;
  birim: BirimKodu;
  fiyat: number;
  tutar: number;
  satirIskontoYuzde: number;
  satirIskontoTutar: number;
  netTutar: number;
  altIskontoYuzde: number;
  altIskontoTutar: number;
  gercekToplam: number;
  toplamKdvYuzde: number;
  toplamKdvTutar: number;
  toplamTutar: number;
  pb: ParaBirimiKodu;
  etiketler: { metin: string; renk: 'mavi' | 'yesil' | 'mor' | 'turuncu' }[];
  durum: boolean;
  kayitTarihi: string;
  guncellemeTarihi: string;
}

const ETIKET_RENKLER: Array<'mavi' | 'yesil' | 'mor' | 'turuncu'> = ['mavi', 'mor', 'turuncu', 'yesil'];

function sayiDeger(girdi: string | undefined, varsayilan = 0): number {
  if (!girdi?.trim()) return varsayilan;
  return ifadeHesapla(girdi.trim(), 'sayi') ?? parseFloat(girdi.replace(',', '.')) ?? varsayilan;
}

function iskontoDeger(girdi: string | undefined, varsayilan = 0): number {
  if (!girdi?.trim()) return varsayilan;
  const n =
    ifadeHesapla(girdi.trim(), 'iskonto') ?? parseFloat(girdi.replace(',', '.')) ?? varsayilan;
  if (!Number.isFinite(n)) return varsayilan;
  return Math.min(100, Math.max(0, n));
}

function etiketleriAyikla(ham?: string) {
  if (!ham?.trim()) return [{ metin: 'Yeni', renk: 'yesil' as const }];
  const parcalar = ham.split(/[,;|]/).map((p) => p.trim()).filter(Boolean);
  if (!parcalar.length) return [{ metin: 'Yeni', renk: 'yesil' as const }];
  return parcalar.map((metin, i) => ({
    metin,
    renk: ETIKET_RENKLER[i % ETIKET_RENKLER.length],
  }));
}

export function yeniSiparisSatiriOlustur(
  degerler: Record<string, string>,
  kdvDahil = false,
  urunKatalogu: UrunKaydi[] = []
): SiparisSatiri {
  const simdi = new Date().toISOString();
  const urunCozum = urunKoduAdiCozumle(degerler.urunKoduAdi, urunKatalogu);
  const durumHam = degerler.durum ?? 'true';

  return satirHesapla(
    {
      id: `y-${Date.now()}`,
      urun: { sku: urunCozum.sku, ad: urunCozum.ad, kur: urunCozum.kur },
      miktar: sayiDeger(degerler.miktar, 1),
      birim: gecerliBirim(degerler.birim),
      fiyat: sayiDeger(degerler.fiyat, 0),
      tutar: 0,
      satirIskontoYuzde: iskontoDeger(degerler.satirIskonto, 0),
      satirIskontoTutar: 0,
      netTutar: 0,
      altIskontoYuzde: iskontoDeger(degerler.altIskonto, 0),
      altIskontoTutar: 0,
      gercekToplam: 0,
      toplamKdvYuzde: sayiDeger(degerler.toplamKdv, 20),
      toplamKdvTutar: 0,
      toplamTutar: 0,
      pb: 'TRY',
      etiketler: etiketleriAyikla(degerler.etiketler),
      durum: durumHam === 'true' || durumHam === '1',
      kayitTarihi: simdi,
      guncellemeTarihi: simdi,
    },
    kdvDahil
  );
}

/** Birim fiyatı KDV dahil ↔ hariç modları arasında dönüştürür (toplam tutarı korur). */
export function fiyatKdvModunaCevir(
  fiyat: number,
  kdvYuzde: number,
  eskiDahil: boolean,
  yeniDahil: boolean
): number {
  if (eskiDahil === yeniDahil || !Number.isFinite(fiyat) || fiyat === 0) return fiyat;
  const carpan = 1 + kdvYuzde / 100;
  const yeni = eskiDahil ? fiyat / carpan : fiyat * carpan;
  return Math.round(yeni * 100) / 100;
}

export function satirlariKdvModunaCevir(
  satirlar: SiparisSatiri[],
  eskiDahil: boolean,
  yeniDahil: boolean
): SiparisSatiri[] {
  return satirlar.map((s) => {
    const fiyat = fiyatKdvModunaCevir(s.fiyat, s.toplamKdvYuzde, eskiDahil, yeniDahil);
    return satirHesapla({ ...s, fiyat }, yeniDahil);
  });
}

export function satirHesapla(s: SiparisSatiri, kdvDahil = false): SiparisSatiri {
  const satirIskontoYuzde = Math.min(100, Math.max(0, s.satirIskontoYuzde));
  const altIskontoYuzde = Math.min(100, Math.max(0, s.altIskontoYuzde));
  const tutar = Math.round(s.miktar * s.fiyat * 100) / 100;
  const satirIskontoTutar = Math.round(tutar * (satirIskontoYuzde / 100) * 100) / 100;
  const netTutar = Math.round((tutar - satirIskontoTutar) * 100) / 100;
  const altIskontoTutar = Math.round(netTutar * (altIskontoYuzde / 100) * 100) / 100;
  const indirimli = Math.round((netTutar - altIskontoTutar) * 100) / 100;
  const kdvOran = s.toplamKdvYuzde / 100;

  if (kdvDahil) {
    const toplamTutar = indirimli;
    const gercekToplam =
      kdvOran > 0 ? Math.round((indirimli / (1 + kdvOran)) * 100) / 100 : indirimli;
    const toplamKdvTutar = Math.round((toplamTutar - gercekToplam) * 100) / 100;
    return {
      ...s,
      satirIskontoYuzde,
      altIskontoYuzde,
      tutar,
      satirIskontoTutar,
      netTutar,
      altIskontoTutar,
      gercekToplam,
      toplamKdvTutar,
      toplamTutar,
    };
  }

  const gercekToplam = indirimli;
  const toplamKdvTutar = Math.round(gercekToplam * kdvOran * 100) / 100;
  const toplamTutar = Math.round((gercekToplam + toplamKdvTutar) * 100) / 100;
  return {
    ...s,
    satirIskontoYuzde,
    altIskontoYuzde,
    tutar,
    satirIskontoTutar,
    netTutar,
    altIskontoTutar,
    gercekToplam,
    toplamKdvTutar,
    toplamTutar,
  };
}

function yuvarla2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Tutar yazılınca miktar sabit → birim fiyat; miktar yoksa fiyat sabit → miktar */
export function satirTutarYaz(s: SiparisSatiri, yeniTutar: number, kdvDahil = false): SiparisSatiri {
  const tutar = Math.max(0, Number.isFinite(yeniTutar) ? yeniTutar : 0);
  if (s.miktar > 0) {
    return satirHesapla({ ...s, fiyat: yuvarla2(tutar / s.miktar) }, kdvDahil);
  }
  if (s.fiyat > 0) {
    return satirHesapla({ ...s, miktar: yuvarla2(tutar / s.fiyat) }, kdvDahil);
  }
  return satirHesapla({ ...s, miktar: 1, fiyat: tutar }, kdvDahil);
}

/** Net tutar → satır iskonto oranını koruyarak brüt tutara, oradan fiyata */
export function satirNetTutarYaz(s: SiparisSatiri, yeniNet: number, kdvDahil = false): SiparisSatiri {
  const net = Math.max(0, Number.isFinite(yeniNet) ? yeniNet : 0);
  const kalanOran = 1 - s.satirIskontoYuzde / 100;
  const tutar = kalanOran > 0 ? yuvarla2(net / kalanOran) : net;
  return satirTutarYaz(s, tutar, kdvDahil);
}

/**
 * Gerçek tutar → alt iskonto tersine net tutar.
 * KDV dahil modda gerçek tutar KDV'siz matrah; önce indirimli (KDV'li) tutara çevrilir.
 */
export function satirGercekTutarYaz(
  s: SiparisSatiri,
  yeniGercek: number,
  kdvDahil = false
): SiparisSatiri {
  const gercek = Math.max(0, Number.isFinite(yeniGercek) ? yeniGercek : 0);
  let indirimli = gercek;
  if (kdvDahil) {
    const kdvOran = s.toplamKdvYuzde / 100;
    indirimli = kdvOran > 0 ? yuvarla2(gercek * (1 + kdvOran)) : gercek;
  }
  const kalanOran = 1 - s.altIskontoYuzde / 100;
  const net = kalanOran > 0 ? yuvarla2(indirimli / kalanOran) : indirimli;
  return satirNetTutarYaz(s, net, kdvDahil);
}

/** Toplam → KDV oranını koruyarak gerçek tutara (veya KDV dahilde indirimliye) */
export function satirToplamTutarYaz(
  s: SiparisSatiri,
  yeniToplam: number,
  kdvDahil = false
): SiparisSatiri {
  const toplam = Math.max(0, Number.isFinite(yeniToplam) ? yeniToplam : 0);
  if (kdvDahil) {
    const kalanOran = 1 - s.altIskontoYuzde / 100;
    const net = kalanOran > 0 ? yuvarla2(toplam / kalanOran) : toplam;
    return satirNetTutarYaz(s, net, kdvDahil);
  }
  const kdvOran = s.toplamKdvYuzde / 100;
  const gercek = kdvOran > 0 ? yuvarla2(toplam / (1 + kdvOran)) : toplam;
  return satirGercekTutarYaz(s, gercek, kdvDahil);
}

const urun = (sku: string, ad: string, kur?: string) => ({ sku, ad, kur });

export const DEMO_SIPARIS_SATIRLARI: SiparisSatiri[] = [
  satirHesapla({
    id: '1',
    urun: urun('DJI-MINI-4K', 'DJI Mini 4K Fly More Combo', '$ = 41,5548'),
    miktar: 1,
    birim: 'ADET',
    fiyat: 28499,
    tutar: 0,
    satirIskontoYuzde: 0,
    satirIskontoTutar: 0,
    netTutar: 0,
    altIskontoYuzde: 0,
    altIskontoTutar: 0,
    gercekToplam: 0,
    toplamKdvYuzde: 20,
    toplamKdvTutar: 0,
    toplamTutar: 0,
    pb: 'TRY',
    etiketler: [{ metin: 'Drone', renk: 'mavi' }],
    durum: true,
    kayitTarihi: '2026-03-15T09:42:00',
    guncellemeTarihi: '2026-03-18T14:22:00',
  }),
  satirHesapla({
    id: '2',
    urun: urun('INSTA-X4', 'Insta360 X4 Standart Bundle', '$ = 41,5548'),
    miktar: 2,
    birim: 'ADET',
    fiyat: 18999,
    tutar: 0,
    satirIskontoYuzde: 10,
    satirIskontoTutar: 0,
    netTutar: 0,
    altIskontoYuzde: 5,
    altIskontoTutar: 0,
    gercekToplam: 0,
    toplamKdvYuzde: 20,
    toplamKdvTutar: 0,
    toplamTutar: 0,
    pb: 'TRY',
    etiketler: [
      { metin: 'Aksiyon', renk: 'mor' },
      { metin: 'Kampanya', renk: 'turuncu' },
    ],
    durum: true,
    kayitTarihi: '2026-03-10T14:15:00',
    guncellemeTarihi: '2026-03-16T11:35:00',
  }),
  satirHesapla({
    id: '3',
    urun: urun('GT-PRO-12', 'Güzel Teknoloji Pro Lisans (12 Ay)'),
    miktar: 1,
    birim: 'PAKET',
    fiyat: 4990,
    tutar: 0,
    satirIskontoYuzde: 0,
    satirIskontoTutar: 0,
    netTutar: 0,
    altIskontoYuzde: 0,
    altIskontoTutar: 0,
    gercekToplam: 0,
    toplamKdvYuzde: 20,
    toplamKdvTutar: 0,
    toplamTutar: 0,
    pb: 'TRY',
    etiketler: [{ metin: 'Yazılım', renk: 'yesil' }],
    durum: false,
    kayitTarihi: '2026-02-28T11:03:00',
    guncellemeTarihi: '2026-03-01T09:18:00',
  }),
  satirHesapla({
    id: '4',
    urun: urun('LOGI-MX3', 'Logitech MX Master 3S'),
    miktar: 3,
    birim: 'ADET',
    fiyat: 3299,
    tutar: 0,
    satirIskontoYuzde: 0,
    satirIskontoTutar: 0,
    netTutar: 0,
    altIskontoYuzde: 0,
    altIskontoTutar: 0,
    gercekToplam: 0,
    toplamKdvYuzde: 20,
    toplamKdvTutar: 0,
    toplamTutar: 0,
    pb: 'TRY',
    etiketler: [{ metin: 'Aksesuar', renk: 'mavi' }],
    durum: true,
    kayitTarihi: '2026-03-20T16:28:00',
    guncellemeTarihi: '2026-03-20T16:28:00',
  }),
  satirHesapla({
    id: '5',
    urun: urun('SAM-T7-1TB', 'Samsung T7 Shield 1TB Taşınabilir SSD'),
    miktar: 1,
    birim: 'KUTU',
    fiyat: 4599,
    tutar: 0,
    satirIskontoYuzde: 15,
    satirIskontoTutar: 0,
    netTutar: 0,
    altIskontoYuzde: 0,
    altIskontoTutar: 0,
    gercekToplam: 0,
    toplamKdvYuzde: 20,
    toplamKdvTutar: 0,
    toplamTutar: 0,
    pb: 'TRY',
    etiketler: [{ metin: 'Depolama', renk: 'mor' }],
    durum: true,
    kayitTarihi: '2026-03-12T10:51:00',
    guncellemeTarihi: '2026-03-14T08:47:00',
  }),
];

export const DEMO_SIPARIS_OZET = {
  siparisNo: 'SIP-2026-00482',
  siparisTarihi: '18.03.2026',
  siparisVeren: { ad: 'Ahmet Yılmaz', telefon: '0532 111 22 33' },
  durum: 'Teslim Edildi',
  odeme: 'Havale / EFT',
  tutar: DEMO_SIPARIS_SATIRLARI.reduce((t, s) => t + s.toplamTutar, 0),
  musteri: {
    tip: 'Kurumsal',
    kod: 'M-1042',
    unvan: 'Güzel İç ve Dış Ticaret Ltd. Şti.',
    telefon: '0242 333 44 55',
    eposta: 'bilgi@guzelteknoloji.com',
    tc: '—',
  },
  teslimat: {
    adres: 'Fabrikalar Mah. 3001. Sok. No:12',
    ilceIl: 'Kepez / Antalya / Türkiye',
  },
  fatura: {
    adres: 'Fabrikalar Mah. 3001. Sok. No:12',
    ilceIl: 'Kepez / Antalya / Türkiye',
  },
};
