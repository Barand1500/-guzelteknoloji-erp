import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { sayiFormatla, tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { birimGuncelle, stokBirimleriGetir } from './api';
import { birimdenFiyatDuzenleSatir, fiyatDuzenleSatirdanBirimForm } from './birimMap';
import { fiyatAnalizOzetHesapla, fiyatAnalizSatirlariniFiltrele } from './fiyatAnalizFiltre';
import {
  FIYAT_ANALIZ_ISLEM_FILTRELERI,
  type FiyatAnalizIslemFiltre,
  type StokFiyatAnalizSatir,
} from './fiyatAnalizTipler';
import { stokFiyatAnalizOrnekVeri } from './fiyatAnalizVeri';
import { StoklarSagTikMenu } from './StoklarSagTikMenu';
import type { AdminStok } from './tipler';

function sayiOku(ham: unknown, yedek = 0): number {
  if (typeof ham === 'number' && Number.isFinite(ham)) return ham;
  const t = String(ham ?? '').trim();
  if (!t) return yedek;
  const n = Number(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : yedek;
}

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

function fiyatAnalizKolonlari(duzenlenebilir: boolean): KolonTanimi<StokFiyatAnalizSatir>[] {
  return [
    {
      id: 'islemTipi',
      baslik: '',
      tip: 'metin',
      genislik: 72,
      minGenislik: 56,
      siralama: true,
      duzenlenebilir,
      degerAl: (s) => s.islemTipi,
      degerYaz: (s, d) => ({ ...s, islemTipi: String(d ?? '').trim() || s.islemTipi }),
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
      duzenlenebilir,
      degerAl: (s) => ({ ust: s.firmaAdi, alt: s.firmaKodu }),
      siralamaDegeri: (s) => `${s.firmaKodu} ${s.firmaAdi}`,
      degerYaz: (s, d) => ({ ...s, firmaAdi: String(d ?? '').trim() || s.firmaAdi }),
      birlesikDuzenle: {
        altDegerAl: (s) => s.firmaKodu,
        altDegerYaz: (s, d) => ({ ...s, firmaKodu: String(d ?? '').trim() || s.firmaKodu }),
      },
      goster: (s) => <FirmaKoduAdiHucre satir={s} />,
    },
    {
      id: 'tarih',
      baslik: 'Tarih',
      tip: 'tarih',
      genislik: 128,
      minGenislik: 110,
      siralama: true,
      duzenlenebilir,
      degerAl: (s) => s.tarih,
      degerYaz: (s, d) => ({ ...s, tarih: String(d ?? '').trim() || s.tarih }),
      goster: (s) => tarihSaatFormatla(s.tarih),
    },
    {
      id: 'birimFiyati',
      baslik: 'Birim Fiyatı',
      tip: 'sayi',
      genislik: 110,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.birimFiyati,
      siralamaDegeri: (s) => s.birimFiyati,
      degerYaz: (s, d) => ({ ...s, birimFiyati: sayiOku(d, s.birimFiyati) }),
      goster: (s) => (
        <div className="stok-dg-etiket-deger">
          <span className="dg-iskonto-yuzde">{s.pb}</span>
          <span className="dg-iskonto-tutar">{sayiFormatla(s.birimFiyati)}</span>
        </div>
      ),
    },
    {
      id: 'pb',
      baslik: 'PB',
      tip: 'metin',
      genislik: 52,
      siralama: true,
      duzenlenebilir,
      degerAl: (s) => s.pb,
      degerYaz: (s, d) => ({ ...s, pb: String(d ?? '').trim() || s.pb }),
    },
    {
      id: 'miktar',
      baslik: 'Miktar',
      tip: 'sayi',
      genislik: 72,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.miktar,
      siralamaDegeri: (s) => s.miktar,
      degerYaz: (s, d) => ({ ...s, miktar: sayiOku(d, s.miktar) }),
      goster: (s) => sayiFormatla(s.miktar),
    },
    {
      id: 'birimMaliyet',
      baslik: 'Birim Maliyet',
      tip: 'sayi',
      genislik: 118,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.birimMaliyet,
      siralamaDegeri: (s) => s.birimMaliyet,
      degerYaz: (s, d) => ({ ...s, birimMaliyet: sayiOku(d, s.birimMaliyet) }),
      goster: (s) => (
        <div className="stok-dg-etiket-deger">
          <span className="dg-iskonto-yuzde">{s.pb === 'TL' ? '₺' : s.pb}</span>
          <span className="dg-iskonto-tutar">{sayiFormatla(s.birimMaliyet)}</span>
        </div>
      ),
    },
    {
      id: 'kur',
      baslik: 'Kur',
      tip: 'sayi',
      genislik: 64,
      siralama: true,
      duzenlenebilir,
      formulaTip: 'sayi',
      degerAl: (s) => s.kur,
      siralamaDegeri: (s) => s.kur,
      degerYaz: (s, d) => ({ ...s, kur: sayiOku(d, s.kur) }),
      goster: (s) => sayiFormatla(s.kur),
    },
    {
      id: 'depoAdi',
      baslik: 'Depo Adı',
      tip: 'metin',
      genislik: 100,
      siralama: true,
      duzenlenebilir,
      degerAl: (s) => s.depoAdi,
      degerYaz: (s, d) => ({ ...s, depoAdi: String(d ?? '').trim() || s.depoAdi }),
    },
  ];
}

const DONEM_SECENEKLERI = ['2026', '2025', '2024'].map((y) => ({ value: y, label: y }));

export function StokFiyatAnaliz({
  stok,
  onGeri,
  onYeni,
  onDuzenle,
  onIncele,
  kaydetRef,
  onKirliDegistir,
  onGorunumDuzenle,
  onGorunumKaydet,
}: {
  stok: AdminStok;
  onGeri: () => void;
  onYeni: () => void;
  onDuzenle: () => void;
  onIncele: () => void;
  kaydetRef?: MutableRefObject<(() => Promise<void>) | null>;
  onKirliDegistir?: (kirli: boolean) => void;
  onGorunumDuzenle?: () => void;
  onGorunumKaydet?: () => void;
}) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar } = useYetkiler();
  const tabloRef = useRef<HTMLDivElement | null>(null);
  const [islemFiltre, setIslemFiltre] = useState<FiyatAnalizIslemFiltre>('giris');
  const [donem, setDonem] = useState('2026');
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [tumSatirlar, setTumSatirlar] = useState(() => stokFiyatAnalizOrnekVeri(stok));
  const [kirli, setKirli] = useState(false);

  useEffect(() => {
    setTumSatirlar(stokFiyatAnalizOrnekVeri(stok));
    setSeciliIdler([]);
    setKirli(false);
    onKirliDegistir?.(false);
  }, [onKirliDegistir, stok]);

  const kolonlar = useMemo(() => fiyatAnalizKolonlari(duzenlemeVar), [duzenlemeVar]);

  const gorunurSatirlar = useMemo(
    () => fiyatAnalizSatirlariniFiltrele(tumSatirlar, islemFiltre),
    [tumSatirlar, islemFiltre]
  );

  const ozet = useMemo(() => fiyatAnalizOzetHesapla(gorunurSatirlar), [gorunurSatirlar]);

  const satirSec = useCallback(
    (id: string) => {
      setSeciliIdler([id]);
      setKirli(true);
      onKirliDegistir?.(true);
    },
    [onKirliDegistir]
  );

  const satirlarDegistir = useCallback(
    (guncel: StokFiyatAnalizSatir[]) => {
      setTumSatirlar((onceki) => {
        const map = new Map(guncel.map((s) => [s.id, s]));
        return onceki.map((s) => map.get(s.id) ?? s);
      });
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
    const seciliId = seciliIdler.length === 1 ? seciliIdler[0] : null;
    const seciliSatir = seciliId
      ? (tumSatirlar.find((s) => s.id === seciliId) ?? null)
      : null;
    if (!seciliSatir) {
      hataBildir('Fiyat aktarmak için listeden bir satır seçin.');
      return;
    }

    try {
      const birimler = await stokBirimleriGetir(stok.id);
      const hedef =
        birimler.find((b) => b.birimAdi === stok.varsayilanBirim) ??
        birimler.find((b) => b.birimAdi === stok.anaBirim) ??
        birimler[0];
      if (!hedef) {
        hataBildir('Bu stoğa bağlı birim kaydı yok. Önce Fiyat Düzenle ile birim ekleyin.');
        return;
      }

      const formSatir = birimdenFiyatDuzenleSatir(hedef);
      if (seciliSatir.yon === 'giris') {
        formSatir.alisFiyati = seciliSatir.birimFiyati;
        if (formSatir.satisFiyati1 == null || formSatir.satisFiyati1 === 0) {
          formSatir.satisFiyati1 = seciliSatir.birimFiyati;
        }
      } else {
        formSatir.satisFiyati1 = seciliSatir.birimFiyati;
      }

      await birimGuncelle(hedef.id, fiyatDuzenleSatirdanBirimForm(formSatir, stok.id));
      setKirli(false);
      onKirliDegistir?.(false);
      basariBildir(
        `${sayiFormatla(seciliSatir.birimFiyati)} ${seciliSatir.pb} fiyatı birim kaydına aktarıldı.`,
        'Fiyat Analizi'
      );
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Fiyat aktarımı başarısız');
    }
  }, [
    basariBildir,
    duzenlemeVar,
    hataBildir,
    onKirliDegistir,
    seciliIdler,
    stok.anaBirim,
    stok.id,
    stok.varsayilanBirim,
    tumSatirlar,
  ]);

  useEffect(() => {
    if (!kaydetRef) return;
    kaydetRef.current = kaydet;
    return () => {
      kaydetRef.current = null;
    };
  }, [kaydet, kaydetRef]);

  return (
    <div className="stok-karti-kabuk stok-fiyat-analiz-sayfa">
      <TanimDuzenleEkrani
        ustEtiket="Fiyat Analizi"
        baslik={`${stok.urunKodu} — ${stok.urunAdi}`}
        altBaslik={`İşlem satırını seçip üst Kaydet ile birim fiyatına aktarın. Giriş → alış, çıkış → satış fiyatı yazılır.`}
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
                  onClick={() => {
                    setSeciliIdler([]);
                    setKirli(false);
                    onKirliDegistir?.(false);
                  }}
                >
                  Listele
                </button>
              </div>
            </div>

            <div
              ref={tabloRef}
              className="stok-fiyat-analiz-tablo stok-fiyat-analiz-tablo--sayfa dg-demo-sag-tik-alan"
            >
              <StoklarSagTikMenu
                konteynerRef={tabloRef}
                eklemeVar={eklemeVar}
                duzenlemeVar={duzenlemeVar}
                onYeni={onYeni}
                onDuzenle={() => onDuzenle()}
                onIncele={() => onIncele()}
                onSatirSec={satirSec}
                onGorunumDuzenle={onGorunumDuzenle ?? (() => undefined)}
                onGorunumKaydet={onGorunumKaydet ?? (() => undefined)}
              />
              <DataGrid
                key={`stok_fiyat_analiz_${stok.id}`}
                tabloBaslik="Fiyat Analizi"
                tabloAltBaslik={
                  kirli
                    ? 'Değişiklik var — satır seçip Kaydet ile birime aktarın'
                    : 'Satır seçin, Kaydet ile birim fiyatına aktarın'
                }
                kolonlar={kolonlar}
                satirlar={gorunurSatirlar}
                onSatirlarDegistir={satirlarDegistir}
                depolamaAnahtari={`stok_fiyat_analiz_${stok.id}`}
                bosMesaj="Bu filtreye uygun işlem bulunamadı."
                onSatirTikla={(s) => satirSec(s.id)}
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
                      setKirli(false);
                      onKirliDegistir?.(false);
                    }}
                    secenekler={FIYAT_ANALIZ_ISLEM_FILTRELERI.map((x) => ({ ...x }))}
                    aria-label="İşlem filtresi"
                  />
                </label>
                <p className="stok-fiyat-analiz-ozet">
                  AVG={sayiFormatla(ozet.ortalamaBirimMaliyet)} · {sayiFormatla(ozet.toplamMiktar)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
