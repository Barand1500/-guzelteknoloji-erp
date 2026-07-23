import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { TanimDurumRozeti } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitTablosu';
import { hesapTipiEtiketi } from './hesapTipleri';
import type { AdminBankaAnlasma } from './tipler';

export const BANKA_KOLON_GENISLIK_SURUMU = 1;

export function bankaAnlasmaKolonlari(): KolonTanimi<AdminBankaAnlasma>[] {
  return [
    {
      id: 'secim',
      baslik: '',
      tip: 'salt-okunur',
      genislik: 40,
      zorunlu: true,
      siralama: false,
      degerAl: () => null,
    },
    {
      id: 'hesapIsmi',
      baslik: 'Hesap İsmi',
      tip: 'metin',
      genislik: 220,
      siralama: true,
      degerAl: (s) => s.hesapIsmi,
    },
    {
      id: 'hesapTipi',
      baslik: 'Tip',
      tip: 'salt-okunur',
      genislik: 90,
      siralama: true,
      degerAl: (s) => s.hesapTipi,
      goster: (s) => hesapTipiEtiketi(s.hesapTipi),
    },
    {
      id: 'bankaAdi',
      baslik: 'Banka',
      tip: 'metin',
      genislik: 160,
      siralama: true,
      degerAl: (s) => s.bankaAdi,
    },
    {
      id: 'iban',
      baslik: 'IBAN',
      tip: 'metin',
      genislik: 220,
      siralama: true,
      degerAl: (s) => (s.ibanModu === 'TR' ? `TR${s.iban}` : s.iban),
    },
    {
      id: 'dovizCinsi',
      baslik: 'Döviz',
      tip: 'salt-okunur',
      genislik: 80,
      siralama: true,
      degerAl: (s) => s.dovizCinsi,
    },
    {
      id: 'durum',
      baslik: 'Durum',
      tip: 'salt-okunur',
      genislik: 88,
      siralama: true,
      degerAl: (s) => s.aktif,
      degerYaz: (s, d) => ({ ...s, aktif: Boolean(d) }),
      siralamaDegeri: (s) => (s.aktif ? 1 : 0),
      goster: (s) => <TanimDurumRozeti aktif={s.aktif} />,
    },
    {
      id: 'guncelleme',
      baslik: 'Güncelleme',
      tip: 'tarih',
      genislik: 130,
      siralama: true,
      degerAl: (s) => s.guncelleme,
      goster: (s) => tarihSaatFormatla(s.guncelleme),
    },
    {
      id: 'islemler',
      baslik: '',
      tip: 'salt-okunur',
      genislik: 68,
      sabitSag: true,
      siralama: false,
      degerAl: () => null,
    },
  ];
}
