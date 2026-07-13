import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { TanimDurumRozeti } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitTablosu';
import {
  cariTipiEtiketi,
  isletmeTuruEtiketi,
  type AdminCari,
} from '@/admin/baslat-menusu/erp/cari/tipler';

export const CARI_KOLON_GENISLIK_SURUMU = 2;

export const CARI_VARSAYILAN_GIZLI: string[] = [];

function secimKolonu(): KolonTanimi<AdminCari> {
  return {
    id: 'secim',
    baslik: '',
    tip: 'salt-okunur',
    genislik: 40,
    zorunlu: true,
    siralama: false,
    degerAl: () => null,
  };
}

function islemlerKolonu(): KolonTanimi<AdminCari> {
  return {
    id: 'islemler',
    baslik: '',
    tip: 'salt-okunur',
    genislik: 68,
    sabitSag: true,
    siralama: false,
    degerAl: () => null,
  };
}

function durumKolonu(): KolonTanimi<AdminCari> {
  return {
    id: 'durum',
    baslik: 'Durum',
    tip: 'salt-okunur',
    genislik: 88,
    siralama: true,
    degerAl: (s) => s.aktif,
    siralamaDegeri: (s) => (s.aktif ? 1 : 0),
    goster: (s) => <TanimDurumRozeti aktif={s.aktif} />,
  };
}

function olusturmaKolonu(): KolonTanimi<AdminCari> {
  return {
    id: 'olusturma',
    baslik: 'Kayıt Tarihi',
    tip: 'tarih',
    genislik: 130,
    siralama: true,
    degerAl: (s) => s.olusturma,
    goster: (s) => tarihSaatFormatla(s.olusturma),
  };
}

function guncellemeKolonu(): KolonTanimi<AdminCari> {
  return {
    id: 'guncelleme',
    baslik: 'Güncelleme Tarihi',
    tip: 'tarih',
    genislik: 130,
    siralama: true,
    degerAl: (s) => s.guncelleme,
    goster: (s) => tarihSaatFormatla(s.guncelleme),
  };
}

function metinKolon(
  id: string,
  baslik: string,
  genislik: number,
  al: (s: AdminCari) => string,
  opts?: { kod?: boolean; ad?: boolean }
): KolonTanimi<AdminCari> {
  return {
    id,
    baslik,
    tip: 'metin',
    genislik,
    minGenislik: Math.min(genislik, 72),
    siralama: true,
    degerAl: (s) => al(s) || '—',
    goster: opts?.kod
      ? (s) => <span className="dg-urun-kodu-alt">{al(s) || '—'}</span>
      : opts?.ad
        ? (s) => <span className="dg-urun-adi-ust">{al(s) || '—'}</span>
        : undefined,
  };
}

export function cariKolonlari(): KolonTanimi<AdminCari>[] {
  return [
    secimKolonu(),
    metinKolon('cariKodu', 'Cari Kodu', 110, (s) => s.cariKodu, { kod: true }),
    metinKolon('cariAdi', 'Cari Adı', 200, (s) => s.cariAdi, { ad: true }),
    {
      id: 'cariTipi',
      baslik: 'Cari Tipi',
      tip: 'metin',
      genislik: 88,
      siralama: true,
      degerAl: (s) => cariTipiEtiketi(s.cariTipi),
      goster: (s) => <span className="dg-birim-etiket">{cariTipiEtiketi(s.cariTipi)}</span>,
    },
    {
      id: 'isletmeTuru',
      baslik: 'İşletme Türü',
      tip: 'metin',
      genislik: 100,
      siralama: true,
      degerAl: (s) => isletmeTuruEtiketi(s.isletmeTuru),
      goster: (s) => <span className="dg-birim-etiket">{isletmeTuruEtiketi(s.isletmeTuru)}</span>,
    },
    metinKolon('unvan', 'Ünvan', 160, (s) => s.unvan),
    metinKolon('yetkili', 'Yetkili', 120, (s) => s.yetkili),
    metinKolon('vergiDairesi', 'Vergi Dairesi', 140, (s) => s.vergiDairesi),
    metinKolon('vergiNo', 'Vergi No', 110, (s) => s.vergiNo),
    metinKolon('il', 'İl', 80, (s) => s.il),
    metinKolon('ilce', 'İlçe', 80, (s) => s.ilce),
    metinKolon('adres', 'Adres', 180, (s) => s.adres),
    metinKolon('telefon', 'Telefon', 100, (s) => s.telefon),
    metinKolon('eposta', 'E-posta', 140, (s) => s.eposta),
    metinKolon('web', 'Web', 120, (s) => s.web),
    {
      id: 'efatura',
      baslik: 'E-Fatura',
      tip: 'metin',
      genislik: 80,
      siralama: true,
      degerAl: (s) => (s.efatura ? 'Evet' : 'Hayır'),
    },
    metinKolon('efaturaTipi', 'E-Fatura Tipi', 110, (s) => s.efaturaTipi),
    metinKolon('alias', 'Alias', 120, (s) => s.alias),
    olusturmaKolonu(),
    guncellemeKolonu(),
    durumKolonu(),
    islemlerKolonu(),
  ];
}
