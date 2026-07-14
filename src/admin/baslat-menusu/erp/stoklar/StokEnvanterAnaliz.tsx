import { useMemo } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { paraFormatla, sayiFormatla, yuzdeFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import {
  stokEnvanterAnalizOrnekVeri,
  stokEnvanterFiyatBilgisiOrnek,
} from './envanterAnalizVeri';
import type { StokEnvanterAnalizOzet, StokEnvanterAnalizSatir } from './envanterAnalizTipler';
import type { AdminStok } from './tipler';

function envanterAnalizKolonlari(): KolonTanimi<StokEnvanterAnalizSatir>[] {
  return [
    {
      id: 'depoInd',
      baslik: 'Depo Ind',
      tip: 'metin',
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
      tip: 'metin',
      genislik: 96,
      siralama: true,
      degerAl: (s) => s.envanter,
      siralamaDegeri: (s) => s.envanter,
      goster: (s) => sayiFormatla(s.envanter),
    },
    {
      id: 'siparisMiktari',
      baslik: 'Sip. Mk.',
      tip: 'metin',
      genislik: 88,
      siralama: true,
      degerAl: (s) => s.siparisMiktari,
      siralamaDegeri: (s) => s.siparisMiktari,
      goster: (s) => sayiFormatla(s.siparisMiktari),
    },
    {
      id: 'kullanilabilir',
      baslik: 'Kullanılabilir',
      tip: 'metin',
      genislik: 104,
      siralama: true,
      degerAl: (s) => s.kullanilabilir,
      siralamaDegeri: (s) => s.kullanilabilir,
      goster: (s) => sayiFormatla(s.kullanilabilir),
    },
    {
      id: 'altSeviye',
      baslik: 'Alt Seviye',
      tip: 'metin',
      genislik: 96,
      siralama: true,
      degerAl: (s) => s.altSeviye,
      siralamaDegeri: (s) => s.altSeviye,
      goster: (s) => sayiFormatla(s.altSeviye),
    },
    {
      id: 'ustSeviye',
      baslik: 'Üst Seviye',
      tip: 'metin',
      genislik: 96,
      siralama: true,
      degerAl: (s) => s.ustSeviye,
      siralamaDegeri: (s) => s.ustSeviye,
      goster: (s) => sayiFormatla(s.ustSeviye),
    },
    {
      id: 'optimumSeviye',
      baslik: 'Optimum Seviye',
      tip: 'metin',
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

export function StokEnvanterAnaliz({
  stok,
  onGeri,
}: {
  stok: AdminStok;
  onGeri: () => void;
}) {
  const satirlar = useMemo(() => stokEnvanterAnalizOrnekVeri(stok), [stok]);
  const fiyat = useMemo(() => stokEnvanterFiyatBilgisiOrnek(stok), [stok]);
  const kolonlar = useMemo(() => envanterAnalizKolonlari(), []);
  const ozet = useMemo(() => envanterOzetHesapla(satirlar), [satirlar]);

  return (
    <div className="stok-karti-kabuk stok-envanter-analiz-sayfa">
      <TanimDuzenleEkrani
        ustEtiket="Envanter"
        baslik={`${stok.urunKodu} — ${stok.urunAdi}`}
        altBaslik={`Aşağıda ${stok.urunKodu} stoğunun envanterinin depolara dağılımını görmektesiniz. Envanter sütununun en altında toplam envanteri görebilirsiniz.`}
        rozet="Analiz"
        onGeri={onGeri}
        saltOkunur
      >
        <div className="stok-karti-icerik ap-scroll stok-envanter-analiz-sayfa-icerik">
          <div className="stok-envanter-analiz-icerik">
            <p className="stok-envanter-analiz-bolum-baslik">Stok Envanter Listesi</p>

            <div className="stok-envanter-analiz-tablo stok-envanter-analiz-tablo--sayfa">
              <DataGrid
                key={`stok_envanter_analiz_${stok.id}`}
                tabloBaslik="Stok Envanter Listesi"
                tabloAltBaslik="Depo dağılımı"
                kolonlar={kolonlar}
                satirlar={satirlar}
                depolamaAnahtari={`stok_envanter_analiz_${stok.id}`}
                bosMesaj="Bu stok için envanter kaydı bulunamadı."
                formulMenuGoster={false}
              />
              <div className="stok-envanter-analiz-toplam" aria-label="Envanter toplamları">
                <span className="stok-envanter-analiz-toplam-etiket">Toplam</span>
                <span />
                <span className="stok-envanter-analiz-toplam-deger">{sayiFormatla(ozet.envanter)}</span>
                <span className="stok-envanter-analiz-toplam-deger">
                  {sayiFormatla(ozet.siparisMiktari)}
                </span>
                <span className="stok-envanter-analiz-toplam-deger">
                  {sayiFormatla(ozet.kullanilabilir)}
                </span>
                <span />
                <span />
                <span />
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

            <div className="stok-envanter-analiz-alt stok-envanter-analiz-alt--sayfa">
              <button type="button" className="ap-tanimlar-duzenle-geri" onClick={onGeri}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
