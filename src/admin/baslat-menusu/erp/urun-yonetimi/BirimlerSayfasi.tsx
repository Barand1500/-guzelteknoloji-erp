import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TanimDurumRozeti } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitTablosu';
import { TanimModCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimModCubugu';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import type { GomuluDuzenleSecenek } from '@/admin/baslat-menusu/tanimlar/tipler';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import '@/admin/ortak/datagrid/datagrid.css';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { DataGridApi, KolonTanimi } from '@/admin/ortak/datagrid/types';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import '@/admin/baslat-menusu/tanimlar/tanimlar.css';
import { birimSil, birimleriGetir, urunleriGetir } from './api';
import { birimHizliGirisKaydet, birimHizliGirisKolonlari } from './birimKayitHizliGiris';
import { BirimSekme } from './BirimSekme';
import type { AdminBirim, AdminUrun } from './tipler';

type BirimSayfaModu = 'kurulum' | 'kayitlar';

const MOD_SEKMELER = [
  { id: 'kurulum', ad: 'Kurulum Sihirbazı', ikon: '✨' },
  { id: 'kayitlar', ad: 'Kayıtlar', ikon: '📋' },
] as const;

function secimKolonu(): KolonTanimi<AdminBirim> {
  return {
    id: 'secim',
    baslik: '',
    tip: 'salt-okunur',
    genislik: 40,
    zorunlu: true,
    siralama: false,
    degerAl: () => null,
  };
}

function islemlerKolonu(): KolonTanimi<AdminBirim> {
  return {
    id: 'islemler',
    baslik: '',
    tip: 'salt-okunur',
    genislik: 68,
    sabitSag: true,
    siralama: false,
    degerAl: () => null,
  };
}

const para = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

export function BirimlerSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar, silmeVar } = useYetkiler('birimler');
  const gorunurSekmeler = useMemo(
    () => (eklemeVar ? MOD_SEKMELER : MOD_SEKMELER.filter((s) => s.id !== 'kurulum')),
    [eklemeVar]
  );
  const [mod, setMod] = useState<BirimSayfaModu>('kayitlar');
  const [modYonu, setModYonu] = useState<'ileri' | 'geri'>('ileri');
  const [kayitlar, setKayitlar] = useState<AdminBirim[]>([]);
  const [urunler, setUrunler] = useState<AdminUrun[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [silme, setSilme] = useState<AdminBirim | null>(null);
  const [kayitlarAnahtar, setKayitlarAnahtar] = useState(0);
  const gridApiRef = useRef<DataGridApi | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const [birimKayitlari, urunKayitlari] = await Promise.all([birimleriGetir(), urunleriGetir()]);
      setKayitlar(birimKayitlari);
      setUrunler(urunKayitlari);
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Birimler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const modDegistir = useCallback(
    (yeni: BirimSayfaModu) => {
      if (yeni === mod) return;
      const eskiIdx = MOD_SEKMELER.findIndex((s) => s.id === mod);
      const yeniIdx = MOD_SEKMELER.findIndex((s) => s.id === yeni);
      if (eskiIdx >= 0 && yeniIdx >= 0) {
        setModYonu(yeniIdx > eskiIdx ? 'ileri' : 'geri');
      }
      setMod(yeni);
    },
    [mod]
  );

  const kurulumTamamlandi = useCallback(() => {
    setModYonu('ileri');
    setMod('kayitlar');
    setKayitlarAnahtar((k) => k + 1);
    void yukle();
  }, [yukle]);

  const hizliGirisKaydet = useCallback(
    async (degerler: Record<string, string>) => {
      try {
        const sonuc = await birimHizliGirisKaydet(degerler);
        if (!sonuc.ok) {
          hataBildir(sonuc.mesaj);
          return false;
        }
        basariBildir(sonuc.mesaj);
        await yukle();
        return true;
      } catch (e) {
        hataBildir(e instanceof Error ? e.message : 'Kayıt eklenemedi');
        return false;
      }
    },
    [basariBildir, hataBildir, yukle]
  );

  const yeniEkle = useCallback(() => {
    gridApiRef.current?.hizliGirisOdakla();
  }, []);

  useEffect(() => {
    if (mod === 'kayitlar') return;
    gridApiRef.current?.hizliGirisKapat();
  }, [mod]);

  const panelKapat = useCallback(
    (onKapat: () => void) => {
      void yukle();
      onKapat();
    },
    [yukle]
  );

  const satirDuzenlePaneli = useCallback(
    (satir: AdminBirim, _onKaydet: (s: AdminBirim) => void, onKapat: () => void) => {
      const opts: GomuluDuzenleSecenek = {
        id: satir.id,
        onKapat: () => panelKapat(onKapat),
        panel: true,
      };
      return <BirimSekme key={`birim-${satir.id}`} gomuluDuzenle={opts} />;
    },
    [panelKapat]
  );

  const satirDuzenleAc = useCallback(
    (id: string) => {
      if (!duzenlemeVar) return;
      gridApiRef.current?.satirDuzenleAc(id);
    },
    [duzenlemeVar]
  );

  const silOnayla = useCallback(async () => {
    if (!silme) return;
    try {
      await birimSil(silme.id);
      basariBildir('Birim silindi.');
      setSilme(null);
      await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Silme başarısız');
    }
  }, [basariBildir, hataBildir, silme, yukle]);

  const kolonlar = useMemo((): KolonTanimi<AdminBirim>[] => {
    return [
      secimKolonu(),
      {
        id: 'urun',
        baslik: 'Ürün',
        tip: 'metin',
        genislik: 200,
        minGenislik: 140,
        zorunlu: true,
        siralama: true,
        degerAl: (b) => `${b.urunKodu} ${b.urunAdi}`,
        goster: (b) => (
          <span className="dg-urun-adi-ust">
            {b.urunKodu} — {b.urunAdi}
          </span>
        ),
      },
      {
        id: 'fiyatAdi',
        baslik: 'Fiyat Adı',
        tip: 'metin',
        genislik: 120,
        siralama: true,
        degerAl: (b) => b.fiyatAdi,
      },
      {
        id: 'birimAdi',
        baslik: 'Birim',
        tip: 'metin',
        genislik: 90,
        siralama: true,
        degerAl: (b) => b.birimAdi,
      },
      {
        id: 'carpan',
        baslik: 'Çarpan',
        tip: 'sayi',
        genislik: 80,
        siralama: true,
        degerAl: (b) => b.carpan,
      },
      {
        id: 'alisFiyati',
        baslik: 'Alış',
        tip: 'sayi',
        genislik: 100,
        siralama: true,
        degerAl: (b) => b.alisFiyati,
        goster: (b) => para(b.alisFiyati),
      },
      {
        id: 'satisFiyati',
        baslik: 'Satış',
        tip: 'sayi',
        genislik: 100,
        siralama: true,
        degerAl: (b) => b.satisFiyati,
        goster: (b) => para(b.satisFiyati),
      },
      {
        id: 'durum',
        baslik: 'Durum',
        tip: 'salt-okunur',
        genislik: 88,
        siralama: true,
        degerAl: (b) => b.aktif,
        siralamaDegeri: (b) => (b.aktif ? 1 : 0),
        goster: (b) => <TanimDurumRozeti aktif={b.aktif} />,
      },
      {
        id: 'guncelleme',
        baslik: 'Güncelleme',
        tip: 'tarih',
        genislik: 130,
        siralama: true,
        degerAl: (b) => b.guncelleme,
        goster: (b) => tarihSaatFormatla(b.guncelleme),
      },
      islemlerKolonu(),
    ];
  }, []);

  const hizliGirisKolonlari = useMemo(
    () => (urunler.length > 0 ? birimHizliGirisKolonlari(urunler) : undefined),
    [urunler]
  );

  const gridOrtak = useMemo(
    () => ({
      tabloAltBaslik: 'Görünür sütunlar ve sırası',
      yukleniyor,
      gridApiRef,
      satirDuzenlePaneli: duzenlemeVar ? satirDuzenlePaneli : undefined,
      satirPanelModu: 'cubuk' as const,
      formulMenuGoster: false,
      hizliGirisIstegeBagli: true,
      hizliGirisVarsayilanAlan: true,
      hizliGirisKolonlari: eklemeVar ? hizliGirisKolonlari : undefined,
      onHizliGiris: eklemeVar && hizliGirisKolonlari ? hizliGirisKaydet : undefined,
    }),
    [yukleniyor, satirDuzenlePaneli, duzenlemeVar, eklemeVar, hizliGirisKaydet, hizliGirisKolonlari]
  );

  if (yukleniyor && kayitlar.length === 0 && mod === 'kayitlar') {
    return (
      <AdminModulKabuk
        baslik="Birimler"
        aciklama="Ürün birimleri, fiyatları ve KDV oranlarını buradan yönetirsiniz."
        ustAksiyon={
          <TanimModCubugu
            sekmeler={gorunurSekmeler}
            aktif={mod}
            onDegistir={(id) => modDegistir(id as BirimSayfaModu)}
            ariaLabel="Birimler görünümü"
          />
        }
      >
        <TanimYukleniyor />
      </AdminModulKabuk>
    );
  }

  return (
    <AdminModulKabuk
      baslik="Birimler"
      aciklama="Ürün birimleri, fiyatları ve KDV oranlarını buradan yönetirsiniz."
      ustAksiyon={
        <TanimModCubugu
          sekmeler={gorunurSekmeler}
          aktif={mod}
          onDegistir={(id) => modDegistir(id as BirimSayfaModu)}
          ariaLabel="Birimler görünümü"
        />
      }
    >
      <div className="ap-tanimlar-sayfa">
        <div
          className={`ap-tanimlar-icerik ap-tanimlar-icerik--${modYonu}`}
          key={mod === 'kurulum' ? 'kurulum' : `kayitlar-${kayitlarAnahtar}`}
        >
          {mod === 'kurulum' && eklemeVar ? (
            <BirimSekme baslangicGorunum="ekle" onListeyeDon={kurulumTamamlandi} />
          ) : (
            <div className="dg-demo-sayfa">
              <div className="dg-tanimlar-kayit-ust">
                <nav className="ap-tanimlar-gezgin-yol" aria-label="Kayıt konumu">
                  <ol className="ap-tanimlar-gezgin-yol-liste">
                    <li className="ap-tanimlar-gezgin-yol-oge">
                      <span className="ap-tanimlar-gezgin-yol-metin">Birimler</span>
                    </li>
                  </ol>
                </nav>
                {eklemeVar && urunler.length > 0 ? (
                  <button type="button" className="ap-tanimlar-yeni-ekle" onClick={yeniEkle}>
                    <span aria-hidden>+</span>
                    Birim Ekle
                  </button>
                ) : null}
              </div>

              <DataGrid
                key="birimler_kayitlar_v1"
                {...gridOrtak}
                tabloBaslik="Birimler ve Fiyatlar"
                kolonlar={kolonlar}
                satirlar={kayitlar}
                depolamaAnahtari="birimler_kayitlar_v1"
                bosMesaj="Henüz birim tanımı yok"
                satirSinifAdi={(b) => (!b.aktif ? 'dg-satir--pasif' : undefined)}
                onSatirTikla={(b) => satirDuzenleAc(b.id)}
                onSatirSil={silmeVar ? (b) => setSilme(b) : undefined}
              />
            </div>
          )}
        </div>
      </div>

      <SilmeOnayModal
        acik={!!silme}
        onKapat={() => setSilme(null)}
        onOnayla={() => void silOnayla()}
        baslik="Bu birimi silmek istiyor musunuz?"
        hedefMetin={silme ? `${silme.urunAdi} — ${silme.birimAdi}` : ''}
        ariaLabel="Birim silme onayı"
      />
    </AdminModulKabuk>
  );
}
