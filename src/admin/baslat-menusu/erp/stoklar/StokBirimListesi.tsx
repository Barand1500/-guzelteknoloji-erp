import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import {
  OLCU_BIRIMLERI_GUNCELLENDI,
  olcuBirimSecenekleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/olcuBirimleri';
import { birimGuncelle, stokBirimleriGetir } from './api';
import {
  BIRIM_ACIKLAMA_GORUNUMLERI,
  type BirimAciklamaGorunumu,
  type StokBirimListeSatir,
} from './birimListeTipler';
import { birimdenListeSatir, listeSatirdanBirimForm } from './birimMap';
import { StoklarSagTikMenu } from './StoklarSagTikMenu';
import type { AdminStok } from './tipler';

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
    <div className="stok-dg-etiket-deger">
      <span className="dg-iskonto-yuzde">%{yuzde}</span>
      <span className="dg-iskonto-tutar">{etiket}</span>
    </div>
  );
}

export function StokBirimListesi({
  stok,
  onGeri,
  onDuzenle,
  onIncele,
  kaydetRef,
  onKirliDegistir,
  onGorunumDuzenle,
  onGorunumKaydet,
}: {
  stok: AdminStok;
  onGeri: () => void;
  onDuzenle: () => void;
  onIncele: () => void;
  kaydetRef?: MutableRefObject<(() => Promise<void>) | null>;
  onKirliDegistir?: (kirli: boolean) => void;
  onGorunumDuzenle?: () => void;
  onGorunumKaydet?: () => void;
}) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { duzenlemeVar } = useYetkiler();
  const tabloRef = useRef<HTMLDivElement | null>(null);
  const [satirlar, setSatirlar] = useState<StokBirimListeSatir[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kirli, setKirli] = useState(false);
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [aciklamaGorunumu, setAciklamaGorunumu] = useState<BirimAciklamaGorunumu>('hicbiri');
  const [birimSecenekleri, setBirimSecenekleri] = useState(() => olcuBirimSecenekleri(true));

  useEffect(() => {
    const yenile = () => setBirimSecenekleri(olcuBirimSecenekleri(true));
    window.addEventListener(OLCU_BIRIMLERI_GUNCELLENDI, yenile);
    return () => window.removeEventListener(OLCU_BIRIMLERI_GUNCELLENDI, yenile);
  }, []);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const birimler = await stokBirimleriGetir(stok.id);
      setSatirlar(birimler.map(birimdenListeSatir));
      setKirli(false);
      onKirliDegistir?.(false);
      setSeciliIdler([]);
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Birimler alınamadı');
      setSatirlar([]);
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir, onKirliDegistir, stok.id]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const satirlarAyarla = useCallback(
    (yeni: StokBirimListeSatir[]) => {
      setSatirlar(yeni);
      setKirli(true);
      onKirliDegistir?.(true);
    },
    [onKirliDegistir]
  );

  const kaydet = useCallback(async () => {
    if (!duzenlemeVar) {
      hataBildir('Düzenleme yetkiniz yok.');
      return;
    }
    if (!kirli) {
      basariBildir('Kaydedilecek değişiklik yok.', 'Birimler');
      return;
    }
    try {
      for (const satir of satirlar) {
        await birimGuncelle(satir.id, listeSatirdanBirimForm(satir, stok.id));
      }
      basariBildir('Birim listesi kaydedildi.', 'Birimler');
      await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Birim kaydı başarısız');
    }
  }, [basariBildir, duzenlemeVar, hataBildir, kirli, satirlar, stok.id, yukle]);

  useEffect(() => {
    if (!kaydetRef) return;
    kaydetRef.current = kaydet;
    return () => {
      kaydetRef.current = null;
    };
  }, [kaydet, kaydetRef]);

  const kolonlar = useMemo((): KolonTanimi<StokBirimListeSatir>[] => {
    const duzenlenebilir = duzenlemeVar;
    const fiyatKolonu = (
      id: 'satisFiyati1' | 'satisFiyati2' | 'satisFiyati3',
      baslik: string
    ): KolonTanimi<StokBirimListeSatir> => ({
      id,
      baslik,
      tip: 'para',
      genislik: 120,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      paraSembolu: false,
      degerAl: (s) => s[id],
      degerYaz: (s, d) => {
        let n: number | null;
        if (d === '' || d === null || d === undefined) n = null;
        else if (typeof d === 'number') n = Number.isFinite(d) ? d : null;
        else n = sayiOku(String(d));
        return { ...s, [id]: n };
      },
      siralamaDegeri: (s) => s[id] ?? -1,
      goster: (s) => <FiyatGosterim deger={s[id]} />,
    });

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
        secenekler: birimSecenekleri,
        degerAl: (s) => s.birim,
        degerYaz: (s, d) => ({ ...s, birim: String(d ?? '') }),
      },
      {
        id: 'carpan',
        baslik: 'Çarpan',
        tip: 'sayi',
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
      fiyatKolonu('satisFiyati1', '1. Satış Fiyatı'),
      fiyatKolonu('satisFiyati2', '2. Satış Fiyatı'),
      fiyatKolonu('satisFiyati3', '3. Satış Fiyatı'),
      {
        id: 'kdv',
        baslik: 'KDV',
        tip: 'metin',
        genislik: 80,
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
    ];
  }, [birimSecenekleri, duzenlemeVar]);

  return (
    <div className="stok-karti-kabuk stok-birim-liste-sayfa">
      <TanimDuzenleEkrani
        ustEtiket="Birimler"
        baslik={`${stok.urunKodu} — ${stok.urunAdi}`}
        altBaslik={`Hücreleri çift tıklayarak düzenleyin. Değişiklikleri üst aksiyon çubuğundan Kaydet ile kaydedin.`}
        rozet="Birim"
        onGeri={onGeri}
        saltOkunur
      >
        <div className="stok-karti-icerik stok-birim-liste-sayfa-icerik">
          <div className="stok-birim-liste-icerik">
            <div
              ref={tabloRef}
              className="stok-birim-liste-tablo stok-birim-liste-tablo--sayfa dg-demo-sag-tik-alan"
            >
              <StoklarSagTikMenu
                konteynerRef={tabloRef}
                duzenlemeVar={duzenlemeVar}
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
