import { useCallback, useMemo, useState } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { bosGosterim, sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import {
  BIRIM_ACIKLAMA_GORUNUMLERI,
  type BirimAciklamaGorunumu,
  type StokBirimListeSatir,
} from './birimListeTipler';
import { stokBirimListeOrnekVeri } from './birimListeVeri';
import type { AdminStok } from './tipler';

function SatisFiyatiHucre({ deger }: { deger: number | null }) {
  return (
    <span className="stok-birim-liste-fiyat-hucre">
      <span className="stok-birim-liste-fiyat-deger">
        {deger === null ? '' : sayiFormatla(deger)}
      </span>
      <span className="stok-birim-liste-fiyat-pb">TL</span>
    </span>
  );
}

function KdvHucre({ satir }: { satir: StokBirimListeSatir }) {
  const etiket = satir.kdvDahil ? 'D' : 'H';
  const yuzde = Number.isInteger(satir.kdvYuzde)
    ? String(satir.kdvYuzde)
    : satir.kdvYuzde.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return <span className="stok-birim-liste-kdv">%{yuzde} {etiket}</span>;
}

function birimListeKolonlari(): KolonTanimi<StokBirimListeSatir>[] {
  return [
    {
      id: 'fiyatAd',
      baslik: 'Fiyat Ad',
      tip: 'metin',
      genislik: 100,
      minGenislik: 80,
      zorunlu: true,
      siralama: true,
      degerAl: (s) => s.fiyatAd,
    },
    {
      id: 'birim',
      baslik: 'Birim',
      tip: 'metin',
      genislik: 88,
      siralama: true,
      degerAl: (s) => s.birim,
    },
    {
      id: 'carpan',
      baslik: 'Çarpan',
      tip: 'metin',
      genislik: 72,
      siralama: true,
      degerAl: (s) => s.carpan,
      siralamaDegeri: (s) => s.carpan,
      goster: (s) => String(s.carpan),
    },
    {
      id: 'satisFiyati1',
      baslik: '1. Satış Fiyatı',
      tip: 'metin',
      genislik: 120,
      siralama: true,
      degerAl: (s) => s.satisFiyati1,
      siralamaDegeri: (s) => s.satisFiyati1 ?? -1,
      goster: (s) => <SatisFiyatiHucre deger={s.satisFiyati1} />,
    },
    {
      id: 'satisFiyati2',
      baslik: '2. Satış Fiyatı',
      tip: 'metin',
      genislik: 120,
      siralama: true,
      degerAl: (s) => s.satisFiyati2,
      siralamaDegeri: (s) => s.satisFiyati2 ?? -1,
      goster: (s) => <SatisFiyatiHucre deger={s.satisFiyati2} />,
    },
    {
      id: 'satisFiyati3',
      baslik: '3. Satış Fiyatı',
      tip: 'metin',
      genislik: 120,
      siralama: true,
      degerAl: (s) => s.satisFiyati3,
      siralamaDegeri: (s) => s.satisFiyati3 ?? -1,
      goster: (s) => <SatisFiyatiHucre deger={s.satisFiyati3} />,
    },
    {
      id: 'kdv',
      baslik: 'KDV',
      tip: 'metin',
      genislik: 88,
      siralama: true,
      degerAl: (s) => s.kdvYuzde,
      siralamaDegeri: (s) => s.kdvYuzde,
      goster: (s) => <KdvHucre satir={s} />,
    },
  ];
}

export function StokBirimListesi({
  stok,
  onGeri,
}: {
  stok: AdminStok;
  onGeri: () => void;
}) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar } = useYetkiler();
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [aciklamaGorunumu, setAciklamaGorunumu] = useState<BirimAciklamaGorunumu>('hicbiri');

  const satirlar = useMemo(() => stokBirimListeOrnekVeri(stok), [stok]);
  const kolonlar = useMemo(() => birimListeKolonlari(), []);

  const seciliSatir =
    seciliIdler.length === 1 ? (satirlar.find((s) => s.id === seciliIdler[0]) ?? null) : null;

  const yeni = useCallback(() => {
    if (!eklemeVar) return;
    basariBildir('Yeni birim tanımı yakında eklenecek.', 'Birimler');
  }, [basariBildir, eklemeVar]);

  const duzenle = useCallback(() => {
    if (!duzenlemeVar) return;
    if (!seciliSatir) {
      hataBildir('Düzenlemek için bir birim satırı seçin.');
      return;
    }
    basariBildir(
      `${bosGosterim(seciliSatir.birim)} birimi düzenleme ekranı yakında eklenecek.`,
      'Birimler'
    );
  }, [basariBildir, duzenlemeVar, hataBildir, seciliSatir]);

  return (
    <div className="stok-karti-kabuk stok-birim-liste-sayfa">
      <TanimDuzenleEkrani
        ustEtiket="Birimler"
        baslik={`${stok.urunKodu} — ${stok.urunAdi}`}
        altBaslik={`Aşağıda ${stok.urunKodu} - ${stok.urunAdi} stoğunun birim tanımlarını görmektesiniz. Birim detaylarını görebilmek için ilgili birim üzerindeyken [Düzenle] butonuna basınız.`}
        rozet="Birim"
        onGeri={onGeri}
        saltOkunur
      >
        <div className="stok-karti-icerik ap-scroll stok-birim-liste-sayfa-icerik">
          <div className="stok-birim-liste-icerik">
            <p className="stok-birim-liste-bolum-baslik">Birim Listesi</p>

            <div className="stok-birim-liste-tablo stok-birim-liste-tablo--sayfa">
              <DataGrid
                key={`stok_birim_liste_${stok.id}`}
                tabloBaslik="Birim Listesi"
                tabloAltBaslik="Stok birim tanımları"
                kolonlar={kolonlar}
                satirlar={satirlar}
                depolamaAnahtari={`stok_birim_liste_${stok.id}`}
                bosMesaj="Bu stok için birim tanımı bulunamadı."
                onSatirTikla={(s) => setSeciliIdler([s.id])}
                satirSinifAdi={(s) =>
                  seciliIdler.includes(s.id) ? 'dg-satir--secili-manuel' : undefined
                }
                formulMenuGoster={false}
              />
            </div>

            <div className="stok-birim-liste-alt stok-birim-liste-alt--sayfa">
              <div className="stok-birim-liste-alt-sol">
                <button
                  type="button"
                  className="ap-tanimlar-yeni-ekle"
                  onClick={yeni}
                  disabled={!eklemeVar}
                >
                  Yeni
                </button>
                <button
                  type="button"
                  className="stoklar-hizli-ara-tus stok-birim-liste-duzenle-tus"
                  onClick={duzenle}
                  disabled={!duzenlemeVar}
                >
                  Düzenle
                </button>
              </div>
              <div className="stok-birim-liste-alt-sag">
                <label className="stok-birim-liste-aciklama-filtre">
                  <span>Açıklama Görünümü:</span>
                  <FormAcilirSecim
                    value={aciklamaGorunumu}
                    onChange={(v) => setAciklamaGorunumu(v as BirimAciklamaGorunumu)}
                    secenekler={BIRIM_ACIKLAMA_GORUNUMLERI.map((x) => ({ ...x }))}
                    aria-label="Açıklama görünümü"
                  />
                </label>
                <button type="button" className="ap-tanimlar-duzenle-geri" onClick={onGeri}>
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
