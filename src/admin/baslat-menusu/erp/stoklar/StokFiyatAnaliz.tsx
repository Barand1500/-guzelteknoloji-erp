import { useCallback, useMemo, useState } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { paraFormatla, sayiFormatla, tarihFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { fiyatAnalizOzetHesapla, fiyatAnalizSatirlariniFiltrele } from './fiyatAnalizFiltre';
import {
  FIYAT_ANALIZ_ISLEM_FILTRELERI,
  type FiyatAnalizIslemFiltre,
  type StokFiyatAnalizSatir,
} from './fiyatAnalizTipler';
import { stokFiyatAnalizOrnekVeri } from './fiyatAnalizVeri';
import type { AdminStok } from './tipler';

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

function fiyatAnalizKolonlari(): KolonTanimi<StokFiyatAnalizSatir>[] {
  return [
    {
      id: 'islemTipi',
      baslik: '',
      tip: 'metin',
      genislik: 72,
      minGenislik: 56,
      siralama: true,
      degerAl: (s) => s.islemTipi,
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
      degerAl: (s) => ({ ust: s.firmaKodu, alt: s.firmaAdi }),
      siralamaDegeri: (s) => `${s.firmaKodu} ${s.firmaAdi}`,
      goster: (s) => <FirmaKoduAdiHucre satir={s} />,
    },
    {
      id: 'tarih',
      baslik: 'Tarih',
      tip: 'tarih',
      genislik: 100,
      siralama: true,
      degerAl: (s) => s.tarih,
      goster: (s) => tarihFormatla(s.tarih),
    },
    {
      id: 'birimFiyati',
      baslik: 'Birim Fiyatı',
      tip: 'metin',
      genislik: 110,
      siralama: true,
      degerAl: (s) => s.birimFiyati,
      siralamaDegeri: (s) => s.birimFiyati,
      goster: (s) => sayiFormatla(s.birimFiyati),
    },
    {
      id: 'pb',
      baslik: 'PB',
      tip: 'metin',
      genislik: 52,
      siralama: true,
      degerAl: (s) => s.pb,
    },
    {
      id: 'miktar',
      baslik: 'Miktar',
      tip: 'metin',
      genislik: 72,
      siralama: true,
      degerAl: (s) => s.miktar,
      siralamaDegeri: (s) => s.miktar,
      goster: (s) => sayiFormatla(s.miktar),
    },
    {
      id: 'birimMaliyet',
      baslik: 'Birim Maliyet',
      tip: 'metin',
      genislik: 118,
      siralama: true,
      degerAl: (s) => s.birimMaliyet,
      siralamaDegeri: (s) => s.birimMaliyet,
      goster: (s) => paraFormatla(s.birimMaliyet, s.pb === 'TL' ? '₺' : s.pb),
    },
    {
      id: 'kur',
      baslik: 'Kur',
      tip: 'metin',
      genislik: 64,
      siralama: true,
      degerAl: (s) => s.kur,
      siralamaDegeri: (s) => s.kur,
      goster: (s) => sayiFormatla(s.kur),
    },
    {
      id: 'depoAdi',
      baslik: 'Depo Adı',
      tip: 'metin',
      genislik: 100,
      siralama: true,
      degerAl: (s) => s.depoAdi,
    },
  ];
}

const DONEM_SECENEKLERI = ['2026', '2025', '2024'].map((y) => ({ value: y, label: y }));

export function StokFiyatAnaliz({
  stok,
  onGeri,
}: {
  stok: AdminStok;
  onGeri: () => void;
}) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [islemFiltre, setIslemFiltre] = useState<FiyatAnalizIslemFiltre>('giris');
  const [donem, setDonem] = useState('2026');
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);

  const tumSatirlar = useMemo(() => stokFiyatAnalizOrnekVeri(stok), [stok]);
  const kolonlar = useMemo(() => fiyatAnalizKolonlari(), []);

  const gorunurSatirlar = useMemo(
    () => fiyatAnalizSatirlariniFiltrele(tumSatirlar, islemFiltre),
    [tumSatirlar, islemFiltre]
  );

  const ozet = useMemo(() => fiyatAnalizOzetHesapla(gorunurSatirlar), [gorunurSatirlar]);
  const seciliSatir =
    seciliIdler.length === 1
      ? (gorunurSatirlar.find((s) => s.id === seciliIdler[0]) ?? null)
      : null;

  const tamam = useCallback(() => {
    if (!seciliSatir) {
      hataBildir('Fiyat aktarmak için bir satır seçin.');
      return;
    }
    basariBildir(
      `${sayiFormatla(seciliSatir.birimFiyati)} ${seciliSatir.pb} fiyat seçildi.`,
      'Fiyat Analizi'
    );
    onGeri();
  }, [basariBildir, hataBildir, onGeri, seciliSatir]);

  return (
    <div className="stok-karti-kabuk stok-fiyat-analiz-sayfa">
      <TanimDuzenleEkrani
        ustEtiket="Fiyat Analizi"
        baslik={`${stok.urunKodu} — ${stok.urunAdi}`}
        altBaslik={`Aşağıda ${stok.urunKodu} stoğunun son işlemlerini görmektesiniz. Fiyatı belgeye aktarmak için ilgili satır üzerindeyken Tamam butonuna tıklayınız.`}
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

            <div className="stok-fiyat-analiz-tablo stok-fiyat-analiz-tablo--sayfa">
              <DataGrid
                key={`stok_fiyat_analiz_${stok.id}`}
                tabloBaslik="Fiyat Analizi"
                tabloAltBaslik="Son işlem fiyatları"
                kolonlar={kolonlar}
                satirlar={gorunurSatirlar}
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
              <div className="stok-fiyat-analiz-alt-sag">
                <button type="button" className="ap-tanimlar-duzenle-geri" onClick={onGeri}>
                  İptal
                </button>
                <button type="button" className="ap-tanimlar-yeni-ekle" onClick={tamam}>
                  Tamam
                </button>
              </div>
            </div>
          </div>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
