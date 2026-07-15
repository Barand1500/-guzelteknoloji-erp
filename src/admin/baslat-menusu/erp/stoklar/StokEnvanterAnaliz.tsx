import { useEffect, useMemo, useRef, useState } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { paraFormatla, sayiFormatla, yuzdeFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { stokBirimleriGetir, stokMaliyetleriGetir } from './api';
import { envanterFiyatBilgisiBirimden } from './birimMap';
import type { StokEnvanterAnalizOzet, StokEnvanterAnalizSatir, StokEnvanterFiyatBilgisi } from './envanterAnalizTipler';
import { StoklarSagTikMenu } from './StoklarSagTikMenu';
import type { AdminStok } from './tipler';

function envanterAnalizKolonlari(): KolonTanimi<StokEnvanterAnalizSatir>[] {
  return [
    {
      id: 'depoInd',
      baslik: 'Depo Ind',
      tip: 'sayi',
      genislik: 72,
      minGenislik: 56,
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
      minGenislik: 90,
      zorunlu: true,
      siralama: true,
      degerAl: (s) => s.depoKodu,
    },
    {
      id: 'envanter',
      baslik: 'Envanter',
      tip: 'sayi',
      genislik: 96,
      siralama: true,
      degerAl: (s) => s.envanter,
      siralamaDegeri: (s) => s.envanter,
      goster: (s) => sayiFormatla(s.envanter),
    },
    {
      id: 'siparisMiktari',
      baslik: 'Sip. Mk.',
      tip: 'sayi',
      genislik: 88,
      siralama: true,
      degerAl: (s) => s.siparisMiktari,
      siralamaDegeri: (s) => s.siparisMiktari,
      goster: (s) => sayiFormatla(s.siparisMiktari),
    },
    {
      id: 'kullanilabilir',
      baslik: 'Kullanılabilir',
      tip: 'sayi',
      genislik: 104,
      siralama: true,
      degerAl: (s) => s.kullanilabilir,
      siralamaDegeri: (s) => s.kullanilabilir,
      goster: (s) => sayiFormatla(s.kullanilabilir),
    },
    {
      id: 'altSeviye',
      baslik: 'Alt Seviye',
      tip: 'sayi',
      genislik: 96,
      siralama: true,
      degerAl: (s) => s.altSeviye,
      siralamaDegeri: (s) => s.altSeviye,
      goster: (s) => sayiFormatla(s.altSeviye),
    },
    {
      id: 'ustSeviye',
      baslik: 'Üst Seviye',
      tip: 'sayi',
      genislik: 96,
      siralama: true,
      degerAl: (s) => s.ustSeviye,
      siralamaDegeri: (s) => s.ustSeviye,
      goster: (s) => sayiFormatla(s.ustSeviye),
    },
    {
      id: 'optimumSeviye',
      baslik: 'Optimum Seviye',
      tip: 'sayi',
      genislik: 112,
      siralama: true,
      degerAl: (s) => s.optimumSeviye,
      siralamaDegeri: (s) => s.optimumSeviye,
      goster: (s) => sayiFormatla(s.optimumSeviye),
    },
  ];
}

function envanterOzetHesapla(satirlar: StokEnvanterAnalizSatir[]): StokEnvanterAnalizOzet {
  return satirlar.reduce(
    (acc, s) => ({
      envanter: acc.envanter + s.envanter,
      siparisMiktari: acc.siparisMiktari + s.siparisMiktari,
      kullanilabilir: acc.kullanilabilir + s.kullanilabilir,
    }),
    { envanter: 0, siparisMiktari: 0, kullanilabilir: 0 }
  );
}

function FiyatAlani({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <label className="stok-envanter-analiz-fiyat-alan">
      <span>{etiket}</span>
      <div className="stok-envanter-analiz-fiyat-deger">{deger}</div>
    </label>
  );
}

const BOS_FIYAT: StokEnvanterFiyatBilgisi = {
  alisFiyati: 0,
  dovizAlisFiyati: 0,
  maliyet: 0,
  satisFiyati1: 0,
  satisFiyati2: 0,
  satisFiyati3: 0,
  satisFiyati3Yuzde: 0,
};

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
  const { eklemeVar, duzenlemeVar } = useYetkiler('stoklar');
  const tabloRef = useRef<HTMLDivElement | null>(null);
  const [satirlar] = useState<StokEnvanterAnalizSatir[]>([]);
  const [fiyat, setFiyat] = useState<StokEnvanterFiyatBilgisi>(BOS_FIYAT);
  const [yukleniyor, setYukleniyor] = useState(true);
  const kolonlar = useMemo(() => envanterAnalizKolonlari(), []);
  const ozet = useMemo(() => envanterOzetHesapla(satirlar), [satirlar]);

  useEffect(() => {
    let iptal = false;
    setYukleniyor(true);
    void (async () => {
      try {
        const birimler = await stokBirimleriGetir(stok.id);
        const anaBirim =
          birimler.find((b) => b.birimAdi === stok.varsayilanBirim) ??
          birimler.find((b) => b.birimAdi === stok.anaBirim) ??
          birimler[0] ??
          null;
        const maliyetler = anaBirim
          ? await stokMaliyetleriGetir([anaBirim.id])
          : [];
        if (iptal) return;
        setFiyat(envanterFiyatBilgisiBirimden(anaBirim, maliyetler[0] ?? null));
      } catch (e) {
        if (!iptal) {
          hataBildir(e instanceof Error ? e.message : 'Fiyat bilgileri alınamadı');
          setFiyat(BOS_FIYAT);
        }
      } finally {
        if (!iptal) setYukleniyor(false);
      }
    })();
    return () => {
      iptal = true;
    };
  }, [hataBildir, stok.anaBirim, stok.id, stok.varsayilanBirim]);

  return (
    <div className="stok-karti-kabuk stok-envanter-analiz-sayfa">
      <TanimDuzenleEkrani
        ustEtiket="Envanter"
        baslik={`${stok.urunKodu} — ${stok.urunAdi}`}
        altBaslik={`Fiyat bilgileri f001birimler + f001maliyetler tablolarından gelir. Depo envanter miktarı için henüz tablo yok — aşağıdaki liste boş kalır.`}
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
                tabloAltBaslik="Depo envanter tablosu yok"
                kolonlar={kolonlar}
                satirlar={satirlar}
                yukleniyor={yukleniyor}
                depolamaAnahtari={`stok_envanter_analiz_api_${stok.id}`}
                bosMesaj="Depo envanter tablosu henüz tanımlı değil. Fiyat paneli birim/maliyet verisine bağlıdır."
                formulMenuGoster={false}
              />
              <div className="stok-envanter-analiz-toplam" aria-label="Envanter toplamları">
                <span className="stok-envanter-analiz-toplam-oge">
                  <span className="stok-envanter-analiz-toplam-etiket">Envanter</span>
                  <span className="stok-envanter-analiz-toplam-deger">{sayiFormatla(ozet.envanter)}</span>
                </span>
                <span className="stok-envanter-analiz-toplam-oge">
                  <span className="stok-envanter-analiz-toplam-etiket">Sip. Mk.</span>
                  <span className="stok-envanter-analiz-toplam-deger">
                    {sayiFormatla(ozet.siparisMiktari)}
                  </span>
                </span>
                <span className="stok-envanter-analiz-toplam-oge">
                  <span className="stok-envanter-analiz-toplam-etiket">Kullanılabilir</span>
                  <span className="stok-envanter-analiz-toplam-deger">
                    {sayiFormatla(ozet.kullanilabilir)}
                  </span>
                </span>
              </div>
            </div>

            <div className="stok-envanter-analiz-fiyat-panel">
              <p className="stok-envanter-analiz-fiyat-baslik">Fiyat Bilgileri</p>
              <div className="stok-envanter-analiz-fiyat-satir">
                <FiyatAlani etiket="Alış Fiyatı" deger={paraFormatla(fiyat.alisFiyati, 'TL')} />
                <FiyatAlani
                  etiket="D. Alış Fiyatı"
                  deger={paraFormatla(fiyat.dovizAlisFiyati, 'TL')}
                />
                <FiyatAlani etiket="Maliyet" deger={sayiFormatla(fiyat.maliyet)} />
              </div>
              <div className="stok-envanter-analiz-fiyat-satir">
                <FiyatAlani etiket="Satış Fiyatı" deger={sayiFormatla(fiyat.satisFiyati1)} />
                <FiyatAlani etiket="2. S. Fiyatı" deger="—" />
                <label className="stok-envanter-analiz-fiyat-alan">
                  <span>3. S. Fiyatı</span>
                  <div className="stok-envanter-analiz-fiyat-deger stok-envanter-analiz-fiyat-deger--yuzde">
                    <span>—</span>
                    <span className="stok-envanter-analiz-yuzde">
                      ({yuzdeFormatla(fiyat.satisFiyati3Yuzde)})
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
