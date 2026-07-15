import { useEffect, useMemo, useRef, useState } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { paraFormatla, sayiFormatla, yuzdeFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { stokBirimleriGetir, stokMaliyetleriGetir } from './api';
import {
  envanterOzetHesapla,
  envanterSatirHesapla,
  type StokEnvanterAnalizSatir,
} from './envanterAnalizTipler';
import { StoklarSagTikMenu } from './StoklarSagTikMenu';
import type { AdminStok } from './tipler';

function FiyatAlani({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <label className="stok-envanter-analiz-fiyat-alan">
      <span>{etiket}</span>
      <div className="stok-envanter-analiz-fiyat-deger">{deger}</div>
    </label>
  );
}

function envanterAnalizKolonlari(): KolonTanimi<StokEnvanterAnalizSatir>[] {
  return [
    {
      id: 'fiyatAdi',
      baslik: 'Fiyat Ad',
      tip: 'metin',
      genislik: 100,
      zorunlu: true,
      siralama: true,
      degerAl: (s) => s.fiyatAdi,
    },
    {
      id: 'birimAdi',
      baslik: 'Birim',
      tip: 'metin',
      genislik: 80,
      siralama: true,
      degerAl: (s) => s.birimAdi,
    },
    {
      id: 'carpan',
      baslik: 'Çarpan',
      tip: 'sayi',
      genislik: 72,
      siralama: true,
      degerAl: (s) => s.carpan,
      siralamaDegeri: (s) => s.carpan,
      goster: (s) => String(s.carpan),
    },
    {
      id: 'alisFiyati',
      baslik: 'Alış',
      tip: 'para',
      genislik: 100,
      paraSembolu: false,
      siralama: true,
      degerAl: (s) => s.alisFiyati,
      siralamaDegeri: (s) => s.alisFiyati,
      goster: (s) => sayiFormatla(s.alisFiyati),
    },
    {
      id: 'maliyet',
      baslik: 'Maliyet',
      tip: 'para',
      genislik: 100,
      paraSembolu: false,
      siralama: true,
      degerAl: (s) => s.maliyet,
      siralamaDegeri: (s) => s.maliyet,
      goster: (s) => sayiFormatla(s.maliyet),
    },
    {
      id: 'satisFiyati',
      baslik: 'Satış',
      tip: 'para',
      genislik: 100,
      paraSembolu: false,
      siralama: true,
      degerAl: (s) => s.satisFiyati,
      siralamaDegeri: (s) => s.satisFiyati,
      goster: (s) => sayiFormatla(s.satisFiyati),
    },
    {
      id: 'fark',
      baslik: 'Fark',
      tip: 'para',
      genislik: 100,
      paraSembolu: false,
      siralama: true,
      degerAl: (s) => s.fark,
      siralamaDegeri: (s) => s.fark,
      goster: (s) => (
        <span className={s.fark >= 0 ? 'stok-envanter-analiz-pozitif' : 'stok-envanter-analiz-negatif'}>
          {sayiFormatla(s.fark)}
        </span>
      ),
    },
    {
      id: 'karYuzde',
      baslik: 'Kar %',
      tip: 'metin',
      genislik: 80,
      siralama: true,
      degerAl: (s) => s.karYuzde,
      siralamaDegeri: (s) => s.karYuzde,
      goster: (s) => (
        <span className={s.karYuzde >= 0 ? 'stok-envanter-analiz-pozitif' : 'stok-envanter-analiz-negatif'}>
          {yuzdeFormatla(s.karYuzde)}
        </span>
      ),
    },
    {
      id: 'kdv',
      baslik: 'KDV',
      tip: 'metin',
      genislik: 72,
      siralama: true,
      degerAl: (s) => s.kdvYuzde,
      siralamaDegeri: (s) => s.kdvYuzde,
      goster: (s) => `%${s.kdvYuzde} ${s.kdvDahil ? 'D' : 'H'}`,
    },
  ];
}

export function StokEnvanterAnaliz({
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
  const { hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar } = useYetkiler();
  const tabloRef = useRef<HTMLDivElement | null>(null);
  const [satirlar, setSatirlar] = useState<StokEnvanterAnalizSatir[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const kolonlar = useMemo(() => envanterAnalizKolonlari(), []);
  const ozet = useMemo(() => envanterOzetHesapla(satirlar), [satirlar]);

  useEffect(() => {
    let iptal = false;
    setYukleniyor(true);
    void (async () => {
      try {
        const birimler = await stokBirimleriGetir(stok.id);
        const maliyetler = await stokMaliyetleriGetir(birimler.map((b) => b.id));
        const maliyetMap = new Map(maliyetler.map((m) => [m.birimId, m]));

        const hesapli = birimler.map((b) => {
          const m = maliyetMap.get(b.id);
          const maliyetDeger =
            m?.sonAlisMaliyeti ||
            m?.yuruyenAgirlikliOrtalama ||
            b.alisFiyati ||
            0;
          return envanterSatirHesapla({
            id: b.id,
            fiyatAdi: b.fiyatAdi,
            birimAdi: b.birimAdi,
            carpan: b.carpan,
            alisFiyati: b.alisFiyati,
            maliyet: maliyetDeger,
            satisFiyati: b.satisFiyati,
            kdvYuzde: b.satisKdv,
            kdvDahil: b.kdvDahil,
          });
        });

        if (!iptal) setSatirlar(hesapli);
      } catch (e) {
        if (!iptal) {
          hataBildir(e instanceof Error ? e.message : 'Envanter analizi alınamadı');
          setSatirlar([]);
        }
      } finally {
        if (!iptal) setYukleniyor(false);
      }
    })();
    return () => {
      iptal = true;
    };
  }, [hataBildir, stok.id]);

  return (
    <div className="stok-karti-kabuk stok-envanter-analiz-sayfa">
      <TanimDuzenleEkrani
        ustEtiket="Envanter"
        baslik={`${stok.urunKodu} — ${stok.urunAdi}`}
        altBaslik={`Alış ve satış f001birimler / f001maliyetler tablolarından okunur. Fark ve kar % burada matematiksel hesaplanır (satış − alış). Depo miktarı kullanılmaz.`}
        rozet="Analiz"
        onGeri={onGeri}
        saltOkunur
      >
        <div className="stok-karti-icerik stok-envanter-analiz-sayfa-icerik">
          <div className="stok-envanter-analiz-icerik">
            <div
              ref={tabloRef}
              className="stok-envanter-analiz-tablo stok-envanter-analiz-tablo--sayfa dg-demo-sag-tik-alan"
            >
              <StoklarSagTikMenu
                konteynerRef={tabloRef}
                eklemeVar={eklemeVar}
                duzenlemeVar={duzenlemeVar}
                onYeni={onYeni}
                onDuzenle={() => onDuzenle()}
                onIncele={() => onIncele()}
                onGorunumDuzenle={onGorunumDuzenle ?? (() => undefined)}
                onGorunumKaydet={onGorunumKaydet ?? (() => undefined)}
              />
              <DataGrid
                key={`stok_envanter_analiz_${stok.id}`}
                tabloBaslik="Alış / Satış Analizi"
                tabloAltBaslik="Birim bazında hesaplanan fark ve kar %"
                kolonlar={kolonlar}
                satirlar={satirlar}
                yukleniyor={yukleniyor}
                depolamaAnahtari={`stok_envanter_hesap_${stok.id}`}
                bosMesaj="Bu stok için birim/fiyat kaydı yok. Önce Fiyat Düzenle ile alış ve satış girin."
                formulMenuGoster={false}
              />
            </div>

            <div className="stok-envanter-analiz-fiyat-panel">
              <p className="stok-envanter-analiz-fiyat-baslik">Toplam / Özet (matematik)</p>
              <div className="stok-envanter-analiz-fiyat-satir">
                <FiyatAlani etiket="Birim sayısı" deger={String(ozet.birimSayisi)} />
                <FiyatAlani etiket="Toplam Alış" deger={paraFormatla(ozet.toplamAlis, 'TL')} />
                <FiyatAlani etiket="Toplam Satış" deger={paraFormatla(ozet.toplamSatis, 'TL')} />
              </div>
              <div className="stok-envanter-analiz-fiyat-satir">
                <FiyatAlani etiket="Toplam Fark" deger={paraFormatla(ozet.toplamFark, 'TL')} />
                <FiyatAlani etiket="Ort. Maliyet" deger={sayiFormatla(ozet.ortalamaMaliyet)} />
                <FiyatAlani etiket="Ort. Kar %" deger={yuzdeFormatla(ozet.ortalamaKarYuzde)} />
              </div>
            </div>
          </div>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
