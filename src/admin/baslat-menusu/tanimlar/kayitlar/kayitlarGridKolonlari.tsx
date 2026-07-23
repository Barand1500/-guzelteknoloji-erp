import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { TIP_ETIKET, TIP_SIRASI, type TanimSatir } from './tipler';

function hucreMetin(deger: string) {
  const v = deger.trim();
  if (!v) return <span className="ap-tanimlar-hucre-bos">—</span>;
  return <span className="ap-tanimlar-hucre-metin">{v}</span>;
}

export function kayitlarGridKolonlari(params: {
  eklemeVar: boolean;
  onSubedenDepo: (satir: TanimSatir) => void;
  onSubedenKasa: (satir: TanimSatir) => void;
}): KolonTanimi<TanimSatir>[] {
  const { eklemeVar, onSubedenDepo, onSubedenKasa } = params;

  return [
    {
      id: 'tip',
      baslik: 'Tip',
      tip: 'metin',
      genislik: 88,
      minGenislik: 72,
      zorunlu: true,
      siralama: true,
      degerAl: (s) => TIP_ETIKET[s.tip],
      siralamaDegeri: (s) => TIP_SIRASI[s.tip],
      goster: (s) => (
        <span className={`ap-tanimlar-tip-rozet ap-tanimlar-tip-rozet--${s.tip}`}>
          {TIP_ETIKET[s.tip]}
        </span>
      ),
    },
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
      genislik: 200,
      minGenislik: 140,
      zorunlu: true,
      siralama: true,
      degerAl: (s) => s.ad,
    },
    {
      id: 'baglam',
      baslik: 'Bağlam',
      tip: 'metin',
      genislik: 180,
      minGenislik: 130,
      siralama: true,
      degerAl: (s) => s.baglamMetin,
      goster: (s) => {
        if (s.tip === 'firma') return hucreMetin('');
        if (s.tip === 'donem') return hucreMetin(s.baglamMetin);
        if (s.tip === 'sube') return <span className="ap-muted">Şube kaydı</span>;
        return hucreMetin(s.baglamMetin);
      },
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
      id: 'altEkle',
      baslik: '',
      tip: 'salt-okunur',
      genislik: eklemeVar ? 148 : 40,
      minGenislik: eklemeVar ? 120 : 40,
      sabitSag: true,
      siralama: false,
      degerAl: () => null,
      goster: (s) => {
        if (!eklemeVar || s.tip !== 'sube' || !s.aktif) return null;
        return (
          <div className="ap-tanimlar-satir-alt-ekle" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="ap-tanimlar-satir-alt-tus"
              title="Bu şubeye depo ekle"
              onClick={() => onSubedenDepo(s)}
            >
              + Depo
            </button>
            <button
              type="button"
              className="ap-tanimlar-satir-alt-tus"
              title="Bu şubeye kasa ekle"
              onClick={() => onSubedenKasa(s)}
            >
              + Kasa
            </button>
          </div>
        );
      },
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
