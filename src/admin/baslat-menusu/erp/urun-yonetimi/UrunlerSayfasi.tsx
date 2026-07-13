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
import { urunSil, urunleriGetir } from './api';
import { UrunSekme } from './UrunSekme';
import type { AdminUrun } from './tipler';
import { urunHizliGirisKaydet, urunHizliGirisKolonlari } from './urunKayitHizliGiris';

type UrunSayfaModu = 'kurulum' | 'kayitlar';

const MOD_SEKMELER = [
  { id: 'kurulum', ad: 'Kurulum Sihirbazı', ikon: '✨' },
  { id: 'kayitlar', ad: 'Kayıtlar', ikon: '📋' },
] as const;

function secimKolonu(): KolonTanimi<AdminUrun> {
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

function islemlerKolonu(): KolonTanimi<AdminUrun> {
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

export function UrunlerSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar, silmeVar } = useYetkiler('urunler');
  const gorunurSekmeler = useMemo(
    () => (eklemeVar ? MOD_SEKMELER : MOD_SEKMELER.filter((s) => s.id !== 'kurulum')),
    [eklemeVar]
  );
  const [mod, setMod] = useState<UrunSayfaModu>('kayitlar');
  const [modYonu, setModYonu] = useState<'ileri' | 'geri'>('ileri');
  const [kayitlar, setKayitlar] = useState<AdminUrun[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [silme, setSilme] = useState<AdminUrun | null>(null);
  const [kayitlarAnahtar, setKayitlarAnahtar] = useState(0);
  const gridApiRef = useRef<DataGridApi | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      setKayitlar(await urunleriGetir());
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Ürünler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const modDegistir = useCallback(
    (yeni: UrunSayfaModu) => {
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
        const sonuc = await urunHizliGirisKaydet(degerler);
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
    (satir: AdminUrun, _onKaydet: (s: AdminUrun) => void, onKapat: () => void) => {
      const opts: GomuluDuzenleSecenek = {
        id: satir.id,
        onKapat: () => panelKapat(onKapat),
        panel: true,
      };
      return <UrunSekme key={`urun-${satir.id}`} gomuluDuzenle={opts} />;
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
      await urunSil(silme.id);
      basariBildir('Ürün silindi.');
      setSilme(null);
      await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Silme başarısız');
    }
  }, [basariBildir, hataBildir, silme, yukle]);

  const kolonlar = useMemo((): KolonTanimi<AdminUrun>[] => {
    return [
      secimKolonu(),
      {
        id: 'urunKodu',
        baslik: 'Ürün Kodu',
        tip: 'metin',
        genislik: 120,
        minGenislik: 90,
        zorunlu: true,
        siralama: true,
        degerAl: (u) => u.urunKodu,
        goster: (u) => <span className="dg-urun-kodu-alt">{u.urunKodu || '—'}</span>,
      },
      {
        id: 'urunAdi',
        baslik: 'Ürün Adı',
        tip: 'metin',
        genislik: 220,
        minGenislik: 140,
        zorunlu: true,
        siralama: true,
        degerAl: (u) => u.urunAdi,
        goster: (u) => <span className="dg-urun-adi-ust">{u.urunAdi || '—'}</span>,
      },
      {
        id: 'urunTipi',
        baslik: 'Tip',
        tip: 'metin',
        genislik: 100,
        siralama: true,
        degerAl: (u) => u.urunTipi,
      },
      {
        id: 'marka',
        baslik: 'Marka',
        tip: 'metin',
        genislik: 120,
        siralama: true,
        degerAl: (u) => u.marka,
        goster: (u) => u.marka || '—',
      },
      {
        id: 'anaBirim',
        baslik: 'Ana Birim',
        tip: 'metin',
        genislik: 100,
        siralama: true,
        degerAl: (u) => u.anaBirim,
        goster: (u) => u.anaBirim || '—',
      },
      {
        id: 'durum',
        baslik: 'Durum',
        tip: 'salt-okunur',
        genislik: 88,
        siralama: true,
        degerAl: (u) => u.aktif,
        siralamaDegeri: (u) => (u.aktif ? 1 : 0),
        goster: (u) => <TanimDurumRozeti aktif={u.aktif} />,
      },
      {
        id: 'guncelleme',
        baslik: 'Güncelleme',
        tip: 'tarih',
        genislik: 130,
        siralama: true,
        degerAl: (u) => u.guncelleme,
        goster: (u) => tarihSaatFormatla(u.guncelleme),
      },
      islemlerKolonu(),
    ];
  }, []);

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
      hizliGirisKolonlari: eklemeVar ? urunHizliGirisKolonlari() : undefined,
      onHizliGiris: eklemeVar ? hizliGirisKaydet : undefined,
    }),
    [yukleniyor, satirDuzenlePaneli, duzenlemeVar, eklemeVar, hizliGirisKaydet]
  );

  if (yukleniyor && kayitlar.length === 0 && mod === 'kayitlar') {
    return (
      <AdminModulKabuk
        baslik="Ürünler"
        aciklama="Ürün ve hizmet kartlarını buradan oluşturur, düzenler ve yönetirsiniz."
        ustAksiyon={
          <TanimModCubugu
            sekmeler={gorunurSekmeler}
            aktif={mod}
            onDegistir={(id) => modDegistir(id as UrunSayfaModu)}
            ariaLabel="Ürünler görünümü"
          />
        }
      >
        <TanimYukleniyor />
      </AdminModulKabuk>
    );
  }

  return (
    <AdminModulKabuk
      baslik="Ürünler"
      aciklama="Ürün ve hizmet kartlarını buradan oluşturur, düzenler ve yönetirsiniz."
      ustAksiyon={
        <TanimModCubugu
          sekmeler={gorunurSekmeler}
          aktif={mod}
          onDegistir={(id) => modDegistir(id as UrunSayfaModu)}
          ariaLabel="Ürünler görünümü"
        />
      }
    >
      <div className="ap-tanimlar-sayfa">
        <div
          className={`ap-tanimlar-icerik ap-tanimlar-icerik--${modYonu}`}
          key={mod === 'kurulum' ? 'kurulum' : `kayitlar-${kayitlarAnahtar}`}
        >
          {mod === 'kurulum' && eklemeVar ? (
            <UrunSekme baslangicGorunum="ekle" onListeyeDon={kurulumTamamlandi} />
          ) : (
            <div className="dg-demo-sayfa">
              <div className="dg-tanimlar-kayit-ust">
                <nav className="ap-tanimlar-gezgin-yol" aria-label="Kayıt konumu">
                  <ol className="ap-tanimlar-gezgin-yol-liste">
                    <li className="ap-tanimlar-gezgin-yol-oge">
                      <span className="ap-tanimlar-gezgin-yol-metin">Ürünler</span>
                    </li>
                  </ol>
                </nav>
                {eklemeVar ? (
                  <button type="button" className="ap-tanimlar-yeni-ekle" onClick={yeniEkle}>
                    <span aria-hidden>+</span>
                    Ürün Ekle
                  </button>
                ) : null}
              </div>

              <DataGrid
                key="urunler_kayitlar_v1"
                {...gridOrtak}
                tabloBaslik="Ürünler"
                kolonlar={kolonlar}
                satirlar={kayitlar}
                depolamaAnahtari="urunler_kayitlar_v1"
                bosMesaj="Henüz ürün tanımı yok"
                satirSinifAdi={(u) => (!u.aktif ? 'dg-satir--pasif' : undefined)}
                onSatirTikla={(u) => satirDuzenleAc(u.id)}
                onSatirSil={silmeVar ? (u) => setSilme(u) : undefined}
              />
            </div>
          )}
        </div>
      </div>

      <SilmeOnayModal
        acik={!!silme}
        onKapat={() => setSilme(null)}
        onOnayla={() => void silOnayla()}
        baslik="Bu ürünü silmek istiyor musunuz?"
        hedefMetin={silme ? `${silme.urunAdi} (${silme.urunKodu})` : ''}
        ariaLabel="Ürün silme onayı"
      />
    </AdminModulKabuk>
  );
}
