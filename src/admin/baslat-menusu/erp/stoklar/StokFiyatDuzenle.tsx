import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { birimGuncelle, birimOlustur, stokBirimleriGetir } from './api';
import {
  birimdenFiyatDuzenleSatir,
  fiyatDuzenleSatirdanBirimForm,
  geciciIdMi,
  yeniIdGecici,
} from './birimMap';
import {
  digerFiyatlariHesapla,
  fiyatDuzenleCarpanYaz,
  fiyatDuzenleFiyatYaz,
  fiyatDuzenleKdvTipiYaz,
  fiyatDuzenleKdvYaz,
  fiyatDuzenlePbYaz,
  fiyatDuzenleSatirGuncelle,
  kdvTipiEtiketi,
} from './fiyatDuzenleYardimci';
import {
  ISARETLI_FIYAT_ALANLARI,
  STOK_FIYAT_KDV_TIPI_SECENEKLERI,
  STOK_FIYAT_PB_SECENEKLERI,
  type IsaretliFiyatAlani,
  type StokFiyatDuzenleSatir,
} from './fiyatDuzenleTipler';
import { stokFiyatBarkodUret } from './fiyatDuzenleVeri';
import { StoklarSagTikMenu } from './StoklarSagTikMenu';
import type { AdminStok } from './tipler';

function fiyatDuzenleKolonlari(): KolonTanimi<StokFiyatDuzenleSatir>[] {
  return [
    {
      id: 'fiyatAdi',
      baslik: 'Fiyat Adı',
      tip: 'metin',
      genislik: 100,
      minGenislik: 80,
      zorunlu: true,
      duzenlenebilir: true,
      siralama: true,
      degerAl: (s) => s.fiyatAdi,
      degerYaz: (s, d) => fiyatDuzenleSatirGuncelle(s, { fiyatAdi: String(d).trim() || s.fiyatAdi }),
    },
    {
      id: 'birim',
      baslik: 'Birim',
      tip: 'metin',
      genislik: 80,
      duzenlenebilir: true,
      siralama: true,
      degerAl: (s) => s.birim,
      degerYaz: (s, d) => fiyatDuzenleSatirGuncelle(s, { birim: String(d).trim() || s.birim }),
    },
    {
      id: 'carpan',
      baslik: 'Çarpan',
      tip: 'metin',
      genislik: 64,
      duzenlenebilir: true,
      formulaTip: 'sayi',
      siralama: true,
      degerAl: (s) => s.carpan,
      siralamaDegeri: (s) => s.carpan,
      degerYaz: (s, d) => fiyatDuzenleCarpanYaz(s, d),
      goster: (s) => String(s.carpan),
    },
    {
      id: 'barkod',
      baslik: 'Barkod',
      tip: 'metin',
      genislik: 120,
      minGenislik: 96,
      duzenlenebilir: true,
      siralama: true,
      degerAl: (s) => s.barkod,
      degerYaz: (s, d) => fiyatDuzenleSatirGuncelle(s, { barkod: String(d).trim() }),
    },
    {
      id: 'kdv',
      baslik: 'Kdv',
      tip: 'metin',
      genislik: 56,
      duzenlenebilir: true,
      formulaTip: 'sayi',
      siralama: true,
      degerAl: (s) => s.kdv,
      siralamaDegeri: (s) => s.kdv,
      degerYaz: (s, d) => fiyatDuzenleKdvYaz(s, d),
      goster: (s) => String(s.kdv),
    },
    {
      id: 'kdvTipi',
      baslik: 'K.',
      baslikIpucu: 'KDV dahil / hariç',
      tip: 'badge',
      genislik: 52,
      minGenislik: 48,
      duzenlenebilir: true,
      secenekler: STOK_FIYAT_KDV_TIPI_SECENEKLERI.map((x) => ({ deger: x.deger, etiket: x.etiket })),
      siralama: true,
      degerAl: (s) => s.kdvTipi,
      siralamaDegeri: (s) => s.kdvTipi,
      degerYaz: (s, d) => fiyatDuzenleKdvTipiYaz(s, d),
      goster: (s) => (
        <span className="stok-fiyat-duzenle-kdv-tip">{kdvTipiEtiketi(s.kdvTipi)}</span>
      ),
    },
    {
      id: 'alisFiyati',
      baslik: 'Alış Fiyatı',
      tip: 'para',
      genislik: 108,
      paraSembolu: false,
      duzenlenebilir: true,
      formulaTip: 'sayi',
      siralama: true,
      degerAl: (s) => s.alisFiyati,
      siralamaDegeri: (s) => s.alisFiyati ?? -1,
      degerYaz: (s, d) => fiyatDuzenleFiyatYaz(s, 'alisFiyati', d),
      goster: (s) => (s.alisFiyati === null ? '' : sayiFormatla(s.alisFiyati)),
    },
    {
      id: 'satisFiyati1',
      baslik: 'Satış Fiyatı',
      tip: 'para',
      genislik: 108,
      paraSembolu: false,
      duzenlenebilir: true,
      formulaTip: 'sayi',
      siralama: true,
      degerAl: (s) => s.satisFiyati1,
      siralamaDegeri: (s) => s.satisFiyati1 ?? -1,
      degerYaz: (s, d) => fiyatDuzenleFiyatYaz(s, 'satisFiyati1', d),
      goster: (s) => (s.satisFiyati1 === null ? '' : sayiFormatla(s.satisFiyati1)),
    },
    {
      id: 'pb1',
      baslik: 'PB',
      tip: 'badge',
      genislik: 52,
      duzenlenebilir: true,
      secenekler: STOK_FIYAT_PB_SECENEKLERI.map((x) => ({ deger: x.deger, etiket: x.etiket })),
      siralama: true,
      degerAl: (s) => s.pb1,
      siralamaDegeri: (s) => s.pb1,
      degerYaz: (s, d) => fiyatDuzenlePbYaz(s, 'pb1', d),
      goster: (s) => <span className="stok-fiyat-duzenle-pb">{s.pb1}</span>,
    },
  ];
}

function bosSatir(stok: AdminStok): StokFiyatDuzenleSatir {
  return {
    id: yeniIdGecici(),
    fiyatAdi: 'PERAKENDE',
    birim: stok.anaBirim || 'ADET',
    carpan: 1,
    barkod: '',
    kdv: 10,
    kdvTipi: 'dahil',
    alisFiyati: null,
    satisFiyati1: null,
    pb1: 'TL',
    satisFiyati2: null,
    pb2: 'TL',
    satisFiyati3: null,
    pb3: 'TL',
    satisFiyati4: null,
    pb4: 'TL',
    satisFiyati5: null,
    pb5: 'TL',
    alisKdv: 10,
    aktif: true,
  };
}

export function StokFiyatDuzenle({
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
  const [satirlar, setSatirlar] = useState<StokFiyatDuzenleSatir[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [kirli, setKirli] = useState(false);
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [isaretliAlan, setIsaretliAlan] = useState<IsaretliFiyatAlani>('satisFiyati1');
  const [otomatikBarkod, setOtomatikBarkod] = useState(false);

  const kolonlar = useMemo(() => fiyatDuzenleKolonlari(), []);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const birimler = await stokBirimleriGetir(stok.id);
      setSatirlar(birimler.map(birimdenFiyatDuzenleSatir));
      setKirli(false);
      setSeciliIdler([]);
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Fiyat listesi alınamadı');
      setSatirlar([]);
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir, stok.id]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const satirlarAyarla = useCallback((yeni: StokFiyatDuzenleSatir[]) => {
    setSatirlar(yeni);
    setKirli(true);
  }, []);

  const kaydet = useCallback(async () => {
    if (!duzenlemeVar && !eklemeVar) return;
    setKaydediliyor(true);
    try {
      for (const satir of satirlar) {
        const form = fiyatDuzenleSatirdanBirimForm(satir, stok.id);
        if (geciciIdMi(satir.id)) {
          if (!eklemeVar) continue;
          await birimOlustur(form);
        } else {
          if (!duzenlemeVar) continue;
          await birimGuncelle(satir.id, form);
        }
      }
      basariBildir('Fiyat listesi kaydedildi.', 'Stok Fiyat Düzenle');
      await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Fiyat kaydı başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [basariBildir, duzenlemeVar, eklemeVar, hataBildir, satirlar, stok.id, yukle]);

  const satirEkle = useCallback(() => {
    if (!eklemeVar) return;
    const yeni = bosSatir(stok);
    if (otomatikBarkod) {
      yeni.barkod = stokFiyatBarkodUret(stok, yeni.carpan, satirlar.length + 1);
    }
    setSatirlar((m) => [...m, yeni]);
    setKirli(true);
    setSeciliIdler([yeni.id]);
  }, [eklemeVar, otomatikBarkod, satirlar.length, stok]);

  const digerFiyatlariHesaplaTus = useCallback(() => {
    const hedefIdler = seciliIdler.length ? seciliIdler : undefined;
    const guncel = digerFiyatlariHesapla(satirlar, isaretliAlan, hedefIdler);
    const bazVar = guncel.some(
      (s) =>
        (!hedefIdler || hedefIdler.includes(s.id)) &&
        s[isaretliAlan] !== null &&
        Number.isFinite(s[isaretliAlan]!)
    );
    if (!bazVar) {
      hataBildir('Hesaplama için işaretli alanda fiyat girin.');
      return;
    }
    setSatirlar(guncel);
    setKirli(true);
    basariBildir(
      isaretliAlan === 'satisFiyati1'
        ? 'Satış fiyatı alış fiyatına kopyalandı.'
        : 'Alış fiyatı satış fiyatına kopyalandı.',
      'Stok Fiyat Düzenle'
    );
  }, [basariBildir, hataBildir, isaretliAlan, satirlar, seciliIdler]);

  const barkodUret = useCallback(() => {
    const hedefIdler = seciliIdler.length ? seciliIdler : satirlar.map((s) => s.id);
    setSatirlar((mevcut) =>
      mevcut.map((satir, index) => {
        if (!hedefIdler.includes(satir.id)) return satir;
        return fiyatDuzenleSatirGuncelle(satir, {
          barkod: stokFiyatBarkodUret(stok, satir.carpan, index + 1),
        });
      })
    );
    setKirli(true);
    basariBildir('Barkod üretildi. Kaydet ile veritabanına yazılır.', 'Stok Fiyat Düzenle');
  }, [basariBildir, satirlar, seciliIdler, stok]);

  return (
    <div className="stok-karti-kabuk stok-fiyat-duzenle-sayfa">
      <TanimDuzenleEkrani
        ustEtiket="Stok Fiyat Düzenle"
        baslik={`${stok.urunKodu} — ${stok.urunAdi}`}
        altBaslik={`Aşağıda ${stok.urunKodu} stoğunun fiyatlarını girebilirsiniz. Veriler f001birimler tablosuna kaydedilir. PB alanının para birimi satır lokalidir (şemada PB kolonu yok).`}
        rozet="Fiyat"
        onGeri={onGeri}
        onKaydet={(duzenlemeVar || eklemeVar) && kirli ? () => void kaydet() : undefined}
        kaydediliyor={kaydediliyor}
        saltOkunur={!duzenlemeVar && !eklemeVar}
      >
        <div className="stok-karti-icerik ap-scroll stok-fiyat-duzenle-sayfa-icerik">
          <div className="stok-fiyat-duzenle-icerik">
            <p className="stok-fiyat-duzenle-bolum-baslik">Fiyat Listesi</p>

            <div ref={tabloRef} className="stok-fiyat-duzenle-tablo stok-fiyat-duzenle-tablo--sayfa dg-demo-sag-tik-alan">
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
                key={`stok_fiyat_duzenle_${stok.id}`}
                tabloBaslik="Fiyat Listesi"
                tabloAltBaslik="f001birimler — çift tıklayarak düzenleyin"
                kolonlar={kolonlar}
                satirlar={satirlar}
                yukleniyor={yukleniyor}
                depolamaAnahtari={`stok_fiyat_duzenle_api_${stok.id}`}
                bosMesaj="Bu stok için fiyat satırı yok. Aşağıdan satır ekleyebilirsiniz."
                onSatirlarDegistir={satirlarAyarla}
                onSatirTikla={(s) => setSeciliIdler([s.id])}
                onSecimDegistir={setSeciliIdler}
                satirSinifAdi={(s) =>
                  seciliIdler.includes(s.id) ? 'dg-satir--secili-manuel' : undefined
                }
                formulMenuGoster={false}
              />
            </div>

            <div className="stok-fiyat-duzenle-alt stok-fiyat-duzenle-alt--sayfa">
              <div className="stok-fiyat-duzenle-alt-sol">
                {eklemeVar ? (
                  <button type="button" className="ap-tanimlar-yeni-ekle" onClick={satirEkle}>
                    Satır Ekle
                  </button>
                ) : null}
                <button type="button" className="stoklar-hizli-ara-tus" onClick={digerFiyatlariHesaplaTus}>
                  Diğer Fiyatları Hesapla
                </button>
                <button type="button" className="ap-tanimlar-duzenle-geri" onClick={barkodUret}>
                  Barkod Üret
                </button>
              </div>
              <div className="stok-fiyat-duzenle-alt-orta">
                <label className="stok-fiyat-duzenle-isaretli-alan">
                  <span>İşaretli Alan:</span>
                  <FormAcilirSecim
                    value={isaretliAlan}
                    onChange={(v) => setIsaretliAlan(v as IsaretliFiyatAlani)}
                    secenekler={ISARETLI_FIYAT_ALANLARI.map((x) => ({ ...x }))}
                    aria-label="İşaretli alan"
                  />
                </label>
                <label className="stok-fiyat-duzenle-otomatik-barkod">
                  <input
                    type="checkbox"
                    checked={otomatikBarkod}
                    onChange={(e) => setOtomatikBarkod(e.target.checked)}
                  />
                  <span>Yeni fiyatlara barkodu otomatik yaz</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
