import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { paraFormatla, sayiFormatla, tarihFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { fiyatAnalizOzetHesapla, fiyatAnalizSatirlariniFiltrele } from './fiyatAnalizFiltre';
import {
  FIYAT_ANALIZ_ISLEM_FILTRELERI,
  type FiyatAnalizIslemFiltre,
  type StokFiyatAnalizSatir,
} from './fiyatAnalizTipler';
import { stokFiyatAnalizOrnekVeri } from './fiyatAnalizVeri';
import { StoklarSagTikMenu } from './StoklarSagTikMenu';
import type { AdminStok } from './tipler';

function sayiOku(ham: unknown, yedek = 0): number {
  if (typeof ham === 'number' && Number.isFinite(ham)) return ham;
  const t = String(ham ?? '').trim();
  if (!t) return yedek;
  const n = Number(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : yedek;
}

function FirmaKoduAdiHucre({ satir }: { satir: StokFiyatAnalizSatir }) {
  const kod = satir.firmaKodu?.trim() ?? '';
  const ad = satir.firmaAdi?.trim() ?? '';
  if (!kod && !ad) return <>—</>;

  if (kod && ad && kod.toLowerCase() !== ad.toLowerCase()) {
    return (
      <div className="dg-iskonto-hucre dg-urun-kodu-adi-hucre">
        <span className="dg-urun-kodu-alt">{kod}</span>
        <span className="dg-urun-adi-ust">{ad}</span>
      </div>
    );
  }

  return <span className="dg-urun-adi-ust">{ad || kod}</span>;
}

function fiyatAnalizKolonlari(duzenlenebilir: boolean): KolonTanimi<StokFiyatAnalizSatir>[] {
  return [
    {
      id: 'islemTipi',
      baslik: '',
      tip: 'metin',
      genislik: 72,
      minGenislik: 56,
      siralama: true,
      duzenlenebilir,
      degerAl: (s) => s.islemTipi,
      degerYaz: (s, d) => ({ ...s, islemTipi: String(d ?? '').trim() || s.islemTipi }),
      goster: (s) => <span className="stok-fiyat-analiz-islem">{s.islemTipi}</span>,
    },
    {
      id: 'firmaKoduAdi',
      baslik: 'Firma Kodu/Adı',
      tip: 'birlesik',
      genislik: 240,
      minGenislik: 160,
      zorunlu: true,
      siralama: true,
      duzenlenebilir,
      degerAl: (s) => ({ ust: s.firmaAdi, alt: s.firmaKodu }),
      siralamaDegeri: (s) => `${s.firmaKodu} ${s.firmaAdi}`,
      degerYaz: (s, d) => ({ ...s, firmaAdi: String(d ?? '').trim() || s.firmaAdi }),
      birlesikDuzenle: {
        altDegerAl: (s) => s.firmaKodu,
        altDegerYaz: (s, d) => ({ ...s, firmaKodu: String(d ?? '').trim() || s.firmaKodu }),
      },
      goster: (s) => <FirmaKoduAdiHucre satir={s} />,
    },
    {
      id: 'tarih',
      baslik: 'Tarih',
      tip: 'tarih',
      genislik: 100,
      siralama: true,
      duzenlenebilir,
      degerAl: (s) => s.tarih,
      degerYaz: (s, d) => ({ ...s, tarih: String(d ?? '').trim() || s.tarih }),
      goster: (s) => tarihFormatla(s.tarih),
    },
    {
      id: 'birimFiyati',
      baslik: 'Birim Fiyatı',
      tip: 'sayi',
      genislik: 110,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.birimFiyati,
      siralamaDegeri: (s) => s.birimFiyati,
      degerYaz: (s, d) => ({ ...s, birimFiyati: sayiOku(d, s.birimFiyati) }),
      goster: (s) => sayiFormatla(s.birimFiyati),
    },
    {
      id: 'pb',
      baslik: 'PB',
      tip: 'metin',
      genislik: 52,
      siralama: true,
      duzenlenebilir,
      degerAl: (s) => s.pb,
      degerYaz: (s, d) => ({ ...s, pb: String(d ?? '').trim() || s.pb }),
    },
    {
      id: 'miktar',
      baslik: 'Miktar',
      tip: 'sayi',
      genislik: 72,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.miktar,
      siralamaDegeri: (s) => s.miktar,
      degerYaz: (s, d) => ({ ...s, miktar: sayiOku(d, s.miktar) }),
      goster: (s) => sayiFormatla(s.miktar),
    },
    {
      id: 'birimMaliyet',
      baslik: 'Birim Maliyet',
      tip: 'sayi',
      genislik: 118,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.birimMaliyet,
      siralamaDegeri: (s) => s.birimMaliyet,
      degerYaz: (s, d) => ({ ...s, birimMaliyet: sayiOku(d, s.birimMaliyet) }),
      goster: (s) => paraFormatla(s.birimMaliyet, s.pb === 'TL' ? '₺' : s.pb),
    },
    {
      id: 'kur',
      baslik: 'Kur',
      tip: 'sayi',
      genislik: 64,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.kur,
      siralamaDegeri: (s) => s.kur,
      degerYaz: (s, d) => ({ ...s, kur: sayiOku(d, s.kur) }),
      goster: (s) => sayiFormatla(s.kur),
    },
    {
      id: 'depoAdi',
      baslik: 'Depo Adı',
      tip: 'metin',
      genislik: 100,
      siralama: true,
      duzenlenebilir,
      degerAl: (s) => s.depoAdi,
      degerYaz: (s, d) => ({ ...s, depoAdi: String(d ?? '').trim() || s.depoAdi }),
    },
  ];
}

const DONEM_SECENEKLERI = ['2026', '2025', '2024'].map((y) => ({ value: y, label: y }));

export function StokFiyatAnaliz({
  stok,
  onGeri,
  onYeni,
  onDuzenle,
  onIncele,
  onGorunumDuzenle,
  onGorunumKaydet,
}: {
  stok: AdminStok;
  onGeri: () => void;
  onYeni: () => void;
  onDuzenle: () => void;
  onIncele: () => void;
  onGorunumDuzenle?: () => void;
  onGorunumKaydet?: () => void;
}) {
  const { eklemeVar, duzenlemeVar } = useYetkiler('stoklar');
  const tabloRef = useRef<HTMLDivElement | null>(null);
  const [islemFiltre, setIslemFiltre] = useState<FiyatAnalizIslemFiltre>('giris');
  const [donem, setDonem] = useState('2026');
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [tumSatirlar, setTumSatirlar] = useState(() => stokFiyatAnalizOrnekVeri(stok));

  useEffect(() => {
    setTumSatirlar(stokFiyatAnalizOrnekVeri(stok));
    setSeciliIdler([]);
  }, [stok]);

  const kolonlar = useMemo(() => fiyatAnalizKolonlari(duzenlemeVar), [duzenlemeVar]);

  const gorunurSatirlar = useMemo(
    () => fiyatAnalizSatirlariniFiltrele(tumSatirlar, islemFiltre),
    [tumSatirlar, islemFiltre]
  );

  const ozet = useMemo(() => fiyatAnalizOzetHesapla(gorunurSatirlar), [gorunurSatirlar]);

  const satirlarDegistir = useCallback((guncel: StokFiyatAnalizSatir[]) => {
    setTumSatirlar((onceki) => {
      const map = new Map(guncel.map((s) => [s.id, s]));
      return onceki.map((s) => map.get(s.id) ?? s);
    });
  }, []);

  return (
    <div className="stok-karti-kabuk stok-fiyat-analiz-sayfa">
      <TanimDuzenleEkrani
        ustEtiket="Fiyat Analizi"
        baslik={`${stok.urunKodu} — ${stok.urunAdi}`}
        altBaslik={`Aşağıda ${stok.urunKodu} stoğunun son işlemlerini görmektesiniz. Hücreleri çift tıklayarak düzenleyebilirsiniz.`}
        rozet="Analiz"
        onGeri={onGeri}
        saltOkunur
      >
        <div className="stok-karti-icerik ap-scroll stok-fiyat-analiz-sayfa-icerik">
          <div className="stok-fiyat-analiz-icerik">
            <div className="stok-fiyat-analiz-ust">
              <p className="stok-fiyat-analiz-bolum-baslik">Son İşlem Fiyatları</p>
              <div className="stok-fiyat-analiz-donem">
                <label className="stok-fiyat-analiz-donem-alan">
                  <span>Dönem</span>
                  <FormAcilirSecim
                    value={donem}
                    onChange={setDonem}
                    secenekler={DONEM_SECENEKLERI}
                    aria-label="Dönem"
                  />
                </label>
                <button
                  type="button"
                  className="stoklar-hizli-ara-tus"
                  onClick={() => setSeciliIdler([])}
                >
                  Listele
                </button>
              </div>
            </div>

            <div
              ref={tabloRef}
              className="stok-fiyat-analiz-tablo stok-fiyat-analiz-tablo--sayfa dg-demo-sag-tik-alan"
            >
              <StoklarSagTikMenu
                konteynerRef={tabloRef}
                eklemeVar={eklemeVar}
                duzenlemeVar={duzenlemeVar}
                onYeni={onYeni}
                onDuzenle={() => onDuzenle()}
                onIncele={() => onIncele()}
                onSatirSec={(id) => setSeciliIdler([id])}
                onGorunumDuzenle={onGorunumDuzenle ?? (() => undefined)}
                onGorunumKaydet={onGorunumKaydet ?? (() => undefined)}
              />
              <DataGrid
                key={`stok_fiyat_analiz_${stok.id}`}
                tabloBaslik="Fiyat Analizi"
                tabloAltBaslik="Çift tıklayarak hücre düzenleyin"
                kolonlar={kolonlar}
                satirlar={gorunurSatirlar}
                onSatirlarDegistir={satirlarDegistir}
                depolamaAnahtari={`stok_fiyat_analiz_${stok.id}`}
                bosMesaj="Bu filtreye uygun işlem bulunamadı."
                onSatirTikla={(s) => setSeciliIdler([s.id])}
                satirSinifAdi={(s) =>
                  seciliIdler.includes(s.id) ? 'dg-satir--secili-manuel' : undefined
                }
                formulMenuGoster={false}
              />
            </div>

            <div className="stok-fiyat-analiz-alt stok-fiyat-analiz-alt--sayfa">
              <div className="stok-fiyat-analiz-alt-sol">
                <label className="stok-fiyat-analiz-islem-filtre">
                  <span>İşlemler</span>
                  <FormAcilirSecim
                    value={islemFiltre}
                    onChange={(v) => {
                      setIslemFiltre(v as FiyatAnalizIslemFiltre);
                      setSeciliIdler([]);
                    }}
                    secenekler={FIYAT_ANALIZ_ISLEM_FILTRELERI.map((x) => ({ ...x }))}
                    aria-label="İşlem filtresi"
                  />
                </label>
                <p className="stok-fiyat-analiz-ozet">
                  AVG={sayiFormatla(ozet.ortalamaBirimMaliyet)} · {sayiFormatla(ozet.toplamMiktar)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
