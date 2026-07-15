import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { birimGuncelle, stokBirimleriGetir } from './api';
import {
  BIRIM_ACIKLAMA_GORUNUMLERI,
  type BirimAciklamaGorunumu,
  type StokBirimListeSatir,
} from './birimListeTipler';
import { birimdenListeSatir, listeSatirdanBirimForm } from './birimMap';
import { StoklarSagTikMenu } from './StoklarSagTikMenu';
import type { AdminStok } from './tipler';

const BIRIM_SECENEKLERI = [
  { deger: 'ADET', etiket: 'ADET' },
  { deger: 'PAKET', etiket: 'PAKET' },
  { deger: 'KOLİ', etiket: 'KOLİ' },
  { deger: 'KUTU', etiket: 'KUTU' },
  { deger: 'SET', etiket: 'SET' },
  { deger: 'KG', etiket: 'KG' },
  { deger: 'LT', etiket: 'LT' },
];

const FIYAT_AD_SECENEKLERI = [
  { deger: 'FİYAT', etiket: 'FİYAT' },
  { deger: 'PERAKENDE', etiket: 'PERAKENDE' },
  { deger: 'TOPTAN', etiket: 'TOPTAN' },
];

function sayiOku(ham: string): number | null {
  const t = ham.trim();
  if (!t) return null;
  const n = Number(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function FiyatGosterim({ deger }: { deger: number | null }) {
  if (deger === null) return <span className="stok-birim-liste-fiyat-bos">—</span>;
  return (
    <span className="stok-birim-liste-fiyat-metin">
      {sayiFormatla(deger)} <span className="stok-birim-liste-fiyat-pb">TL</span>
    </span>
  );
}

function KdvHucre({ satir }: { satir: StokBirimListeSatir }) {
  const etiket = satir.kdvDahil ? 'D' : 'H';
  const yuzde = Number.isInteger(satir.kdvYuzde)
    ? String(satir.kdvYuzde)
    : satir.kdvYuzde.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <span className="stok-birim-liste-kdv">
      %{yuzde} {etiket}
    </span>
  );
}

export function StokBirimListesi({
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
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar } = useYetkiler('stoklar');
  const tabloRef = useRef<HTMLDivElement | null>(null);
  const [satirlar, setSatirlar] = useState<StokBirimListeSatir[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [kirli, setKirli] = useState(false);
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [aciklamaGorunumu, setAciklamaGorunumu] = useState<BirimAciklamaGorunumu>('hicbiri');

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const birimler = await stokBirimleriGetir(stok.id);
      setSatirlar(birimler.map(birimdenListeSatir));
      setKirli(false);
      setSeciliIdler([]);
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Birimler alınamadı');
      setSatirlar([]);
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir, stok.id]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const satirlarAyarla = useCallback((yeni: StokBirimListeSatir[]) => {
    setSatirlar(yeni);
    setKirli(true);
  }, []);

  const kaydet = useCallback(async () => {
    if (!duzenlemeVar) return;
    setKaydediliyor(true);
    try {
      for (const satir of satirlar) {
        await birimGuncelle(satir.id, listeSatirdanBirimForm(satir, stok.id));
      }
      basariBildir('Birim listesi kaydedildi.', 'Birimler');
      await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Birim kaydı başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [basariBildir, duzenlemeVar, hataBildir, satirlar, stok.id, yukle]);

  const kolonlar = useMemo((): KolonTanimi<StokBirimListeSatir>[] => {
    const duzenlenebilir = duzenlemeVar;
    return [
      {
        id: 'fiyatAd',
        baslik: 'Fiyat Ad',
        tip: 'metin',
        genislik: 100,
        minGenislik: 80,
        zorunlu: true,
        siralama: true,
        duzenlenebilir,
        secenekler: FIYAT_AD_SECENEKLERI,
        degerAl: (s) => s.fiyatAd,
        degerYaz: (s, d) => ({ ...s, fiyatAd: String(d ?? '') }),
      },
      {
        id: 'birim',
        baslik: 'Birim',
        tip: 'metin',
        genislik: 88,
        siralama: true,
        duzenlenebilir,
        secenekler: BIRIM_SECENEKLERI,
        degerAl: (s) => s.birim,
        degerYaz: (s, d) => ({ ...s, birim: String(d ?? '') }),
      },
      {
        id: 'carpan',
        baslik: 'Çarpan',
        tip: 'metin',
        genislik: 72,
        siralama: true,
        duzenlenebilir,
        formulaTip: 'sayi',
        degerAl: (s) => s.carpan,
        degerYaz: (s, d) => {
          const n = typeof d === 'number' ? d : sayiOku(String(d ?? '')) ?? s.carpan;
          return { ...s, carpan: n > 0 ? n : 1 };
        },
        siralamaDegeri: (s) => s.carpan,
        goster: (s) => String(s.carpan),
      },
      {
        id: 'satisFiyati1',
        baslik: 'Satış Fiyatı',
        tip: 'metin',
        genislik: 120,
        siralama: true,
        duzenlenebilir,
        formulaTip: 'sayi',
        paraSembolu: false,
        degerAl: (s) => s.satisFiyati1,
        degerYaz: (s, d) => {
          let n: number | null;
          if (d === '' || d === null || d === undefined) n = null;
          else if (typeof d === 'number') n = Number.isFinite(d) ? d : null;
          else n = sayiOku(String(d));
          return { ...s, satisFiyati1: n };
        },
        siralamaDegeri: (s) => s.satisFiyati1 ?? -1,
        goster: (s) => <FiyatGosterim deger={s.satisFiyati1} />,
      },
      {
        id: 'kdv',
        baslik: 'KDV',
        tip: 'metin',
        genislik: 88,
        siralama: true,
        duzenlenebilir,
        secenekler: [
          { deger: 'dahil', etiket: 'Dahil (D)' },
          { deger: 'haric', etiket: 'Hariç (H)' },
        ],
        degerAl: (s) => (s.kdvDahil ? 'dahil' : 'haric'),
        degerYaz: (s, d) => ({ ...s, kdvDahil: String(d) === 'dahil' }),
        siralamaDegeri: (s) => s.kdvYuzde,
        goster: (s) => <KdvHucre satir={s} />,
      },
      {
        id: 'kdvYuzde',
        baslik: 'KDV %',
        tip: 'metin',
        genislik: 72,
        siralama: true,
        duzenlenebilir,
        formulaTip: 'sayi',
        degerAl: (s) => s.kdvYuzde,
        degerYaz: (s, d) => {
          const n = typeof d === 'number' ? d : sayiOku(String(d ?? '')) ?? s.kdvYuzde;
          return { ...s, kdvYuzde: n };
        },
        siralamaDegeri: (s) => s.kdvYuzde,
        goster: (s) => `%${Number.isInteger(s.kdvYuzde) ? s.kdvYuzde : sayiFormatla(s.kdvYuzde)}`,
      },
    ];
  }, [duzenlemeVar]);

  return (
    <div className="stok-karti-kabuk stok-birim-liste-sayfa">
      <TanimDuzenleEkrani
        ustEtiket="Birimler"
        baslik={`${stok.urunKodu} — ${stok.urunAdi}`}
        altBaslik={`Aşağıda ${stok.urunKodu} - ${stok.urunAdi} stoğunun birim tanımlarını görmektesiniz. Veriler f001birimler tablosundan gelir. Hücreleri çift tıklayarak düzenleyip Kaydet ile kaydediniz.`}
        rozet="Birim"
        onGeri={onGeri}
        onKaydet={duzenlemeVar && kirli ? () => void kaydet() : undefined}
        kaydediliyor={kaydediliyor}
        saltOkunur={!duzenlemeVar}
      >
        <div className="stok-karti-icerik stok-birim-liste-sayfa-icerik">
          <div className="stok-birim-liste-icerik">
            <div
              ref={tabloRef}
              className="stok-birim-liste-tablo stok-birim-liste-tablo--sayfa dg-demo-sag-tik-alan"
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
                key={`stok_birim_liste_${stok.id}`}
                tabloBaslik="Birim Listesi"
                tabloAltBaslik="f001birimler — çift tıklayarak düzenleyin"
                kolonlar={kolonlar}
                satirlar={satirlar}
                yukleniyor={yukleniyor}
                onSatirlarDegistir={satirlarAyarla}
                depolamaAnahtari={`stok_birim_liste_api_${stok.id}`}
                bosMesaj="Bu stok için birim kaydı yok. Önce Fiyat Düzenle ile birim ekleyin."
                onSatirTikla={(s) => setSeciliIdler([s.id])}
                satirSinifAdi={(s) =>
                  seciliIdler.includes(s.id) ? 'dg-satir--secili-manuel' : undefined
                }
                formulMenuGoster={false}
              />
            </div>

            <div className="stok-birim-liste-alt stok-birim-liste-alt--sayfa">
              <div className="stok-birim-liste-alt-sag stok-birim-liste-alt-sag--tek">
                <label className="stok-birim-liste-aciklama-filtre">
                  <span>Açıklama Görünümü:</span>
                  <FormAcilirSecim
                    value={aciklamaGorunumu}
                    onChange={(v) => setAciklamaGorunumu(v as BirimAciklamaGorunumu)}
                    secenekler={BIRIM_ACIKLAMA_GORUNUMLERI.map((x) => ({ ...x }))}
                    aria-label="Açıklama görünümü"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
