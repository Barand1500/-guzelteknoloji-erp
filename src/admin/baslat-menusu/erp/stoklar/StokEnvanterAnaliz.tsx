import { useEffect, useMemo, useRef, useState } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { paraFormatla, sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { stokBirimleriGetir, stokMaliyetleriGetir } from './api';
import {
  envanterToplam,
  type StokEnvanterAnalizSatir,
  type StokEnvanterFiyatOzeti,
} from './envanterAnalizTipler';
import { StoklarSagTikMenu } from './StoklarSagTikMenu';
import type { AdminStok } from './tipler';

function FiyatAlani({ etiket, deger, ek }: { etiket: string; deger: string; ek?: string }) {
  return (
    <label className="stok-envanter-analiz-fiyat-alan">
      <span>{etiket}</span>
      <div className="stok-envanter-analiz-fiyat-deger">
        {deger}
        {ek ? <span className="stok-envanter-analiz-yuzde">{ek}</span> : null}
      </div>
    </label>
  );
}

function envanterAnalizKolonlari(): KolonTanimi<StokEnvanterAnalizSatir>[] {
  const sayiKolon = (
    id: keyof StokEnvanterAnalizSatir,
    baslik: string,
    genislik = 100
  ): KolonTanimi<StokEnvanterAnalizSatir> => ({
    id: String(id),
    baslik,
    tip: 'sayi',
    genislik,
    siralama: true,
    degerAl: (s) => s[id] as number,
    siralamaDegeri: (s) => s[id] as number,
    goster: (s) => sayiFormatla(s[id] as number),
  });

  return [
    {
      id: 'depoInd',
      baslik: 'Depo İnd',
      tip: 'sayi',
      genislik: 80,
      siralama: true,
      degerAl: (s) => s.depoInd,
      siralamaDegeri: (s) => s.depoInd,
      goster: (s) => String(s.depoInd),
    },
    {
      id: 'depoKodu',
      baslik: 'Depo Kodu',
      tip: 'metin',
      genislik: 120,
      siralama: true,
      degerAl: (s) => s.depoKodu,
    },
    sayiKolon('envanter', 'Envanter'),
    sayiKolon('sipMk', 'Sip. Mk.'),
    sayiKolon('kullanilabilir', 'Kullanılabilir', 110),
    sayiKolon('altSeviye', 'Alt Seviye'),
    sayiKolon('ustSeviye', 'Üst Seviye'),
    sayiKolon('optimumSeviye', 'Optimum Seviye', 110),
  ];
}

function paraVeyaBos(deger: number | null): string {
  if (deger === null || !Number.isFinite(deger)) return '';
  return paraFormatla(deger, 'TL');
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
  const [fiyatOzet, setFiyatOzet] = useState<StokEnvanterFiyatOzeti>({
    alisFiyati: null,
    dAlisFiyati: null,
    maliyet: null,
    satisFiyati1: null,
    satisFiyati2: null,
    satisFiyati3: null,
    kdvYuzde: 10,
  });
  const [yukleniyor, setYukleniyor] = useState(true);
  const kolonlar = useMemo(() => envanterAnalizKolonlari(), []);
  const toplamEnvanter = useMemo(() => envanterToplam(satirlar), [satirlar]);

  useEffect(() => {
    let iptal = false;
    setYukleniyor(true);
    void (async () => {
      try {
        const birimler = await stokBirimleriGetir(stok.id);
        const maliyetler = await stokMaliyetleriGetir(birimler.map((b) => b.id));
        const maliyetMap = new Map(maliyetler.map((m) => [m.birimId, m]));
        const ana = birimler[0];
        const m = ana ? maliyetMap.get(ana.id) : undefined;
        const maliyetDeger =
          m?.sonAlisMaliyeti || m?.yuruyenAgirlikliOrtalama || ana?.alisFiyati || null;

        if (!iptal) {
          // Depo miktar tablosu henüz yok — MERKEZ satırı UI şablonuna uygun gösterilir.
          setSatirlar([
            {
              id: `${stok.id}-depo-merkez`,
              depoInd: 1,
              depoKodu: 'MERKEZ',
              envanter: 0,
              sipMk: 0,
              kullanilabilir: 0,
              altSeviye: 0,
              ustSeviye: 0,
              optimumSeviye: 0,
            },
          ]);
          setFiyatOzet({
            alisFiyati: ana?.alisFiyati ?? null,
            dAlisFiyati: ana?.alisFiyati ?? null,
            maliyet: maliyetDeger,
            satisFiyati1: ana?.satisFiyati ?? null,
            satisFiyati2: null,
            satisFiyati3: null,
            kdvYuzde: ana?.satisKdv ?? 10,
          });
        }
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
        altBaslik={`Aşağıda ${stok.urunKodu} stoğunun envanterinin depolara dağılımını görmektesiniz. Envanter sütunun en altında toplam envanteri görebilirsiniz.`}
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
                tabloBaslik="Stok Envanter Listesi"
                tabloAltBaslik="Depo bazında envanter dağılımı"
                kolonlar={kolonlar}
                satirlar={satirlar}
                yukleniyor={yukleniyor}
                depolamaAnahtari={`stok_envanter_depo_${stok.id}`}
                bosMesaj="Depo envanter kaydı yok."
                formulMenuGoster={false}
              />
            </div>

            <div className="stok-envanter-analiz-toplam">
              <div className="stok-envanter-analiz-toplam-oge">
                <span className="stok-envanter-analiz-toplam-etiket">Toplam Envanter</span>
                <span className="stok-envanter-analiz-toplam-deger">{sayiFormatla(toplamEnvanter)}</span>
              </div>
              <button type="button" className="ap-tanimlar-duzenle-geri" disabled>
                Teknik Detaylar
              </button>
            </div>

            <div className="stok-envanter-analiz-fiyat-panel">
              <p className="stok-envanter-analiz-fiyat-baslik">Fiyat Bilgileri</p>
              <div className="stok-envanter-analiz-fiyat-satir">
                <FiyatAlani etiket="Alış Fiyatı" deger={paraVeyaBos(fiyatOzet.alisFiyati)} />
                <FiyatAlani etiket="D.Alış Fiyatı" deger={paraVeyaBos(fiyatOzet.dAlisFiyati)} />
                <FiyatAlani
                  etiket="Maliyet"
                  deger={
                    fiyatOzet.maliyet === null || !Number.isFinite(fiyatOzet.maliyet)
                      ? ''
                      : sayiFormatla(fiyatOzet.maliyet)
                  }
                />
              </div>
              <div className="stok-envanter-analiz-fiyat-satir">
                <FiyatAlani etiket="1.S. Fiyatı" deger={paraVeyaBos(fiyatOzet.satisFiyati1)} />
                <FiyatAlani etiket="2.S. Fiyatı" deger={paraVeyaBos(fiyatOzet.satisFiyati2)} />
                <FiyatAlani
                  etiket="3.S. Fiyatı"
                  deger={paraVeyaBos(fiyatOzet.satisFiyati3)}
                  ek={`(% ${sayiFormatla(fiyatOzet.kdvYuzde)})`}
                />
              </div>
            </div>
          </div>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
