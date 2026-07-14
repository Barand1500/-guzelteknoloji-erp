import { useEffect, useMemo, useRef, useState } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { paraFormatla, sayiFormatla, yuzdeFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { useYetkiler } from '@/kancalar/useYetkiler';
import {
  stokEnvanterAnalizOrnekVeri,
  stokEnvanterFiyatBilgisiOrnek,
} from './envanterAnalizVeri';
import type { StokEnvanterAnalizOzet, StokEnvanterAnalizSatir } from './envanterAnalizTipler';
import { StoklarSagTikMenu } from './StoklarSagTikMenu';
import type { AdminStok } from './tipler';

function sayiOku(ham: unknown, yedek = 0): number {
  if (typeof ham === 'number' && Number.isFinite(ham)) return ham;
  const t = String(ham ?? '').trim();
  if (!t) return yedek;
  const n = Number(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : yedek;
}

function envanterAnalizKolonlari(
  duzenlenebilir: boolean
): KolonTanimi<StokEnvanterAnalizSatir>[] {
  return [
    {
      id: 'depoInd',
      baslik: 'Depo Ind',
      tip: 'sayi',
      genislik: 72,
      minGenislik: 56,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.depoInd,
      siralamaDegeri: (s) => s.depoInd,
      degerYaz: (s, d) => ({ ...s, depoInd: Math.max(0, Math.round(sayiOku(d, s.depoInd))) }),
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
      duzenlenebilir,
      degerAl: (s) => s.depoKodu,
      degerYaz: (s, d) => ({ ...s, depoKodu: String(d ?? '').trim() || s.depoKodu }),
    },
    {
      id: 'envanter',
      baslik: 'Envanter',
      tip: 'sayi',
      genislik: 96,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.envanter,
      siralamaDegeri: (s) => s.envanter,
      degerYaz: (s, d) => ({ ...s, envanter: sayiOku(d, s.envanter) }),
      goster: (s) => sayiFormatla(s.envanter),
    },
    {
      id: 'siparisMiktari',
      baslik: 'Sip. Mk.',
      tip: 'sayi',
      genislik: 88,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.siparisMiktari,
      siralamaDegeri: (s) => s.siparisMiktari,
      degerYaz: (s, d) => ({ ...s, siparisMiktari: sayiOku(d, s.siparisMiktari) }),
      goster: (s) => sayiFormatla(s.siparisMiktari),
    },
    {
      id: 'kullanilabilir',
      baslik: 'Kullanılabilir',
      tip: 'sayi',
      genislik: 104,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.kullanilabilir,
      siralamaDegeri: (s) => s.kullanilabilir,
      degerYaz: (s, d) => ({ ...s, kullanilabilir: sayiOku(d, s.kullanilabilir) }),
      goster: (s) => sayiFormatla(s.kullanilabilir),
    },
    {
      id: 'altSeviye',
      baslik: 'Alt Seviye',
      tip: 'sayi',
      genislik: 96,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.altSeviye,
      siralamaDegeri: (s) => s.altSeviye,
      degerYaz: (s, d) => ({ ...s, altSeviye: sayiOku(d, s.altSeviye) }),
      goster: (s) => sayiFormatla(s.altSeviye),
    },
    {
      id: 'ustSeviye',
      baslik: 'Üst Seviye',
      tip: 'sayi',
      genislik: 96,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.ustSeviye,
      siralamaDegeri: (s) => s.ustSeviye,
      degerYaz: (s, d) => ({ ...s, ustSeviye: sayiOku(d, s.ustSeviye) }),
      goster: (s) => sayiFormatla(s.ustSeviye),
    },
    {
      id: 'optimumSeviye',
      baslik: 'Optimum Seviye',
      tip: 'sayi',
      genislik: 112,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.optimumSeviye,
      siralamaDegeri: (s) => s.optimumSeviye,
      degerYaz: (s, d) => ({ ...s, optimumSeviye: sayiOku(d, s.optimumSeviye) }),
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
  const { eklemeVar, duzenlemeVar } = useYetkiler('stoklar');
  const tabloRef = useRef<HTMLDivElement | null>(null);
  const [satirlar, setSatirlar] = useState(() => stokEnvanterAnalizOrnekVeri(stok));
  const fiyat = useMemo(() => stokEnvanterFiyatBilgisiOrnek(stok), [stok]);
  const kolonlar = useMemo(() => envanterAnalizKolonlari(duzenlemeVar), [duzenlemeVar]);
  const ozet = useMemo(() => envanterOzetHesapla(satirlar), [satirlar]);

  useEffect(() => {
    setSatirlar(stokEnvanterAnalizOrnekVeri(stok));
  }, [stok]);

  return (
    <div className="stok-karti-kabuk stok-envanter-analiz-sayfa">
      <TanimDuzenleEkrani
        ustEtiket="Envanter"
        baslik={`${stok.urunKodu} — ${stok.urunAdi}`}
        altBaslik={`Aşağıda ${stok.urunKodu} stoğunun envanterinin depolara dağılımını görmektesiniz. Hücreleri çift tıklayarak düzenleyebilirsiniz.`}
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
                tabloAltBaslik="Çift tıklayarak hücre düzenleyin"
                kolonlar={kolonlar}
                satirlar={satirlar}
                onSatirlarDegistir={setSatirlar}
                depolamaAnahtari={`stok_envanter_analiz_${stok.id}`}
                bosMesaj="Bu stok için envanter kaydı bulunamadı."
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
                <FiyatAlani etiket="1. S. Fiyatı" deger={sayiFormatla(fiyat.satisFiyati1)} />
                <FiyatAlani etiket="2. S. Fiyatı" deger={sayiFormatla(fiyat.satisFiyati2)} />
                <label className="stok-envanter-analiz-fiyat-alan">
                  <span>3. S. Fiyatı</span>
                  <div className="stok-envanter-analiz-fiyat-deger stok-envanter-analiz-fiyat-deger--yuzde">
                    <span>{sayiFormatla(fiyat.satisFiyati3)}</span>
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
