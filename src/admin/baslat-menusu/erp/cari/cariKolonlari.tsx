import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { TanimDurumRozeti } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitTablosu';
import {
  cariTipiEtiketi,
  isletmeTuruEtiketi,
  type AdminCari,
} from '@/admin/baslat-menusu/erp/cari/tipler';

export const CARI_KOLON_GENISLIK_SURUMU = 7;

export const CARI_VARSAYILAN_GIZLI: string[] = ['id', 'ustId'];

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
    degerYaz: (s, d) => ({ ...s, aktif: Boolean(d) }),
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
    {
      id: 'cariKoduAdi',
      baslik: 'Cari Kodu/Adı',
      tip: 'metin',
      genislik: 240,
      minGenislik: 140,
      zorunlu: true,
      siralama: true,
      degerAl: (s) => `${s.cariKodu} ${s.cariAdi}`,
      siralamaDegeri: (s) => `${s.cariKodu} ${s.cariAdi}`,
      goster: (s) => {
        const kod = s.cariKodu?.trim() ?? '';
        const ad = s.cariAdi?.trim() ?? '';
        if (!kod && !ad) return <>—</>;
        return (
          <div className="dg-iskonto-hucre dg-urun-kodu-adi-hucre">
            {kod ? <span className="dg-urun-kodu-alt">{kod}</span> : null}
            {ad ? <span className="dg-urun-adi-ust">{ad}</span> : null}
          </div>
        );
      },
    },
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
    metinKolon('unvan', 'Ünvanı', 160, (s) => s.unvan),
    {
      id: 'vergiDairesi',
      baslik: 'Vergi Dairesi',
      tip: 'metin',
      genislik: 140,
      minGenislik: 72,
      siralama: true,
      degerAl: (s) => {
        if (s.isletmeTuru === 'YABANCI' || s.isletmeTuru === 'GERCEK') return '';
        return s.vergiDairesi || '—';
      },
      goster: (s) =>
        s.isletmeTuru === 'YABANCI' || s.isletmeTuru === 'GERCEK' ? (
          <span className="dg-cari-bos-hucre">—</span>
        ) : (
          s.vergiDairesi || '—'
        ),
    },
    {
      id: 'vergiNo',
      baslik: 'Vergi / T.C. / Pasaport',
      tip: 'metin',
      genislik: 130,
      minGenislik: 88,
      siralama: true,
      degerAl: (s) => s.vergiNo || '—',
      goster: (s) => {
        if (!s.vergiNo) return '—';
        if (s.isletmeTuru === 'YABANCI') {
          return (
            <span className="dg-cari-pasaport" title="Pasaport No">
              {s.vergiNo}
            </span>
          );
        }
        if (s.isletmeTuru === 'GERCEK') {
          return (
            <span className="dg-cari-pasaport" title="T.C. Kimlik No">
              {s.vergiNo}
            </span>
          );
        }
        return s.vergiNo;
      },
    },
    metinKolon('adres', 'Adres', 180, (s) => s.adres),
    metinKolon('il', 'İl', 80, (s) => s.il),
    metinKolon('ilce', 'İlçe', 80, (s) => s.ilce),
    metinKolon('telefon', 'Telefon', 100, (s) => s.telefon),
    metinKolon('eposta', 'E-Posta', 140, (s) => s.eposta),
    metinKolon('web', 'Web', 120, (s) => s.web),
    {
      id: 'efatura',
      baslik: 'E-Fatura',
      tip: 'metin',
      genislik: 80,
      siralama: true,
      degerAl: (s) => (s.efatura ? 'Evet' : 'Hayır'),
    },
    metinKolon('efaturaTipi', 'Fatura Tipi', 100, (s) => {
      if (!s.efatura) return '';
      return s.efaturaTipi === 'TICARI' ? 'Ticari' : 'Temel';
    }),
    metinKolon('alias', 'Alias', 120, (s) => s.alias),
    metinKolon('id', 'ID', 72, (s) => s.id),
    metinKolon('ustId', 'Üst ID', 72, (s) => s.ustId),
    olusturmaKolonu(),
    guncellemeKolonu(),
    durumKolonu(),
    islemlerKolonu(),
  ];
}
