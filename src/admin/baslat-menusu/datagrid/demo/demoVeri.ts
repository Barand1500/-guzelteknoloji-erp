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
  return ifadeHesapla(girdi.trim(), 'iskonto') ?? parseFloat(girdi.replace(',', '.')) ?? varsayilan;
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

export function satirHesapla(s: SiparisSatiri, kdvDahil = false): SiparisSatiri {
  const tutar = Math.round(s.miktar * s.fiyat * 100) / 100;
  const satirIskontoTutar = Math.round(tutar * (s.satirIskontoYuzde / 100) * 100) / 100;
  const netTutar = Math.round((tutar - satirIskontoTutar) * 100) / 100;
  const altIskontoTutar = Math.round(netTutar * (s.altIskontoYuzde / 100) * 100) / 100;
  const indirimli = Math.round((netTutar - altIskontoTutar) * 100) / 100;
  const kdvOran = s.toplamKdvYuzde / 100;

  if (kdvDahil) {
    const toplamTutar = indirimli;
    const gercekToplam =
      kdvOran > 0 ? Math.round((indirimli / (1 + kdvOran)) * 100) / 100 : indirimli;
    const toplamKdvTutar = Math.round((toplamTutar - gercekToplam) * 100) / 100;
    return {
      ...s,
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
    tutar,
    satirIskontoTutar,
    netTutar,
    altIskontoTutar,
    gercekToplam,
    toplamKdvTutar,
    toplamTutar,
  };
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
