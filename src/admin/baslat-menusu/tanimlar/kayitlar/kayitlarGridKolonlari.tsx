import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import type { TanimSatir } from './tipler';

/** Göz (tablo) görünümü — boş başlıklı sütun yok. */
export function kayitlarGridKolonlari(): KolonTanimi<TanimSatir>[] {
  return [
    {
      id: 'kod',
      baslik: 'Kod',
      tip: 'metin',
      genislik: 110,
      minGenislik: 80,
      zorunlu: true,
      siralama: true,
      degerAl: (s) => s.kod,
      goster: (s) => <span className="ap-tanimlar-hucre-kod">{s.kod}</span>,
    },
    {
      id: 'ad',
      baslik: 'Ad',
      tip: 'metin',
      genislik: 220,
      minGenislik: 140,
      zorunlu: true,
      siralama: true,
      degerAl: (s) => s.ad,
    },
    {
      id: 'durum',
      baslik: 'Durum',
      tip: 'salt-okunur',
      genislik: 88,
      siralama: true,
      degerAl: (s) => (s.aktif ? 'Aktif' : 'Pasif'),
      siralamaDegeri: (s) => (s.aktif ? 1 : 0),
      goster: (s) => (
        <span className={s.aktif ? 'ap-muted' : 'ap-tanimlar-hucre-bos'}>
          {s.aktif ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      id: 'olusturma',
      baslik: 'Kayıt',
      tip: 'tarih',
      genislik: 120,
      siralama: true,
      degerAl: (s) => s.olusturma,
      goster: (s) => tarihSaatFormatla(s.olusturma),
    },
    {
      id: 'guncelleme',
      baslik: 'Güncelleme',
      tip: 'tarih',
      genislik: 120,
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
