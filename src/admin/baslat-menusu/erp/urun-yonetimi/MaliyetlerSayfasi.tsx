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
import { birimleriGetir, maliyetSil, maliyetleriGetir } from './api';
import { maliyetHizliGirisKaydet, maliyetHizliGirisKolonlari } from './maliyetKayitHizliGiris';
import { MaliyetSekme } from './MaliyetSekme';
import type { AdminBirim, AdminMaliyet } from './tipler';

type MaliyetSayfaModu = 'kurulum' | 'kayitlar';

const MOD_SEKMELER = [
  { id: 'kurulum', ad: 'Kurulum Sihirbazı', ikon: '✨' },
  { id: 'kayitlar', ad: 'Kayıtlar', ikon: '📋' },
] as const;

function secimKolonu(): KolonTanimi<AdminMaliyet> {
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

function islemlerKolonu(): KolonTanimi<AdminMaliyet> {
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

export function MaliyetlerSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar, silmeVar } = useYetkiler('maliyetler');
  const gorunurSekmeler = useMemo(
    () => (eklemeVar ? MOD_SEKMELER : MOD_SEKMELER.filter((s) => s.id !== 'kurulum')),
    [eklemeVar]
  );
  const [mod, setMod] = useState<MaliyetSayfaModu>('kayitlar');
  const [modYonu, setModYonu] = useState<'ileri' | 'geri'>('ileri');
  const [kayitlar, setKayitlar] = useState<AdminMaliyet[]>([]);
  const [birimler, setBirimler] = useState<AdminBirim[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [silme, setSilme] = useState<AdminMaliyet | null>(null);
  const [kayitlarAnahtar, setKayitlarAnahtar] = useState(0);
  const gridApiRef = useRef<DataGridApi | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const [maliyetKayitlari, birimKayitlari] = await Promise.all([
        maliyetleriGetir(),
        birimleriGetir(),
      ]);
      setKayitlar(maliyetKayitlari);
      setBirimler(birimKayitlari);
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Maliyetler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const kullanilanBirimIdler = useMemo(
    () => new Set(kayitlar.map((m) => m.birimId)),
    [kayitlar]
  );

  const modDegistir = useCallback(
    (yeni: MaliyetSayfaModu) => {
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
        const sonuc = await maliyetHizliGirisKaydet(degerler, kullanilanBirimIdler);
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
    [basariBildir, hataBildir, kullanilanBirimIdler, yukle]
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
    (satir: AdminMaliyet, _onKaydet: (s: AdminMaliyet) => void, onKapat: () => void) => {
      const opts: GomuluDuzenleSecenek = {
        id: satir.id,
        onKapat: () => panelKapat(onKapat),
        panel: true,
      };
      return <MaliyetSekme key={`maliyet-${satir.id}`} gomuluDuzenle={opts} />;
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
      await maliyetSil(silme.id);
      basariBildir('Maliyet silindi.');
      setSilme(null);
      await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Silme başarısız');
    }
  }, [basariBildir, hataBildir, silme, yukle]);

  const kolonlar = useMemo((): KolonTanimi<AdminMaliyet>[] => {
    return [
      secimKolonu(),
      {
        id: 'urun',
        baslik: 'Ürün',
        tip: 'metin',
        genislik: 180,
        minGenislik: 120,
        zorunlu: true,
        siralama: true,
        degerAl: (m) => `${m.urunKodu} ${m.urunAdi}`,
        goster: (m) => (
          <span className="dg-urun-adi-ust">
            {m.urunKodu} — {m.urunAdi}
          </span>
        ),
      },
      {
        id: 'birimAdi',
        baslik: 'Birim',
        tip: 'metin',
        genislik: 90,
        siralama: true,
        degerAl: (m) => m.birimAdi,
      },
      {
        id: 'sonAlisMaliyeti',
        baslik: 'Son Alış',
        tip: 'sayi',
        genislik: 100,
        siralama: true,
        degerAl: (m) => m.sonAlisMaliyeti,
        goster: (m) => para(m.sonAlisMaliyeti),
      },
      {
        id: 'yuruyenAgirlikliOrtalama',
        baslik: 'Yürüyen Ort.',
        tip: 'sayi',
        genislik: 110,
        siralama: true,
        degerAl: (m) => m.yuruyenAgirlikliOrtalama,
        goster: (m) => para(m.yuruyenAgirlikliOrtalama),
      },
      {
        id: 'agirlikliOrtalama',
        baslik: 'Ağırlıklı Ort.',
        tip: 'sayi',
        genislik: 110,
        siralama: true,
        degerAl: (m) => m.agirlikliOrtalama,
        goster: (m) => para(m.agirlikliOrtalama),
      },
      {
        id: 'fifo',
        baslik: 'FIFO',
        tip: 'sayi',
        genislik: 90,
        siralama: true,
        degerAl: (m) => m.fifo,
        goster: (m) => para(m.fifo),
      },
      {
        id: 'lifo',
        baslik: 'LIFO',
        tip: 'sayi',
        genislik: 90,
        siralama: true,
        degerAl: (m) => m.lifo,
        goster: (m) => para(m.lifo),
      },
      {
        id: 'durum',
        baslik: 'Durum',
        tip: 'salt-okunur',
        genislik: 88,
        siralama: true,
        degerAl: (m) => m.aktif,
        siralamaDegeri: (m) => (m.aktif ? 1 : 0),
        goster: (m) => <TanimDurumRozeti aktif={m.aktif} />,
      },
      {
        id: 'guncelleme',
        baslik: 'Güncelleme',
        tip: 'tarih',
        genislik: 130,
        siralama: true,
        degerAl: (m) => m.guncelleme,
        goster: (m) => tarihSaatFormatla(m.guncelleme),
      },
      islemlerKolonu(),
    ];
  }, []);

  const hizliGirisKolonlari = useMemo(() => {
    const musaitBirimler = birimler.filter((b) => !kullanilanBirimIdler.has(b.id));
    return musaitBirimler.length > 0 ? maliyetHizliGirisKolonlari(musaitBirimler) : undefined;
  }, [birimler, kullanilanBirimIdler]);

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
        baslik="Maliyetler"
        aciklama="Ürün birimi bazında maliyet hesaplama değerlerini buradan yönetirsiniz."
        ustAksiyon={
          <TanimModCubugu
            sekmeler={gorunurSekmeler}
            aktif={mod}
            onDegistir={(id) => modDegistir(id as MaliyetSayfaModu)}
            ariaLabel="Maliyetler görünümü"
          />
        }
      >
        <TanimYukleniyor />
      </AdminModulKabuk>
    );
  }

  return (
    <AdminModulKabuk
      baslik="Maliyetler"
      aciklama="Ürün birimi bazında maliyet hesaplama değerlerini buradan yönetirsiniz."
      ustAksiyon={
        <TanimModCubugu
          sekmeler={gorunurSekmeler}
          aktif={mod}
          onDegistir={(id) => modDegistir(id as MaliyetSayfaModu)}
          ariaLabel="Maliyetler görünümü"
        />
      }
    >
      <div className="ap-tanimlar-sayfa">
        <div
          className={`ap-tanimlar-icerik ap-tanimlar-icerik--${modYonu}`}
          key={mod === 'kurulum' ? 'kurulum' : `kayitlar-${kayitlarAnahtar}`}
        >
          {mod === 'kurulum' && eklemeVar ? (
            <MaliyetSekme baslangicGorunum="ekle" onListeyeDon={kurulumTamamlandi} />
          ) : (
            <div className="dg-demo-sayfa">
              <div className="dg-tanimlar-kayit-ust">
                <nav className="ap-tanimlar-gezgin-yol" aria-label="Kayıt konumu">
                  <ol className="ap-tanimlar-gezgin-yol-liste">
                    <li className="ap-tanimlar-gezgin-yol-oge">
                      <span className="ap-tanimlar-gezgin-yol-metin">Maliyetler</span>
                    </li>
                  </ol>
                </nav>
                {eklemeVar && hizliGirisKolonlari ? (
                  <button type="button" className="ap-tanimlar-yeni-ekle" onClick={yeniEkle}>
                    <span aria-hidden>+</span>
                    Maliyet Ekle
                  </button>
                ) : null}
              </div>

              <DataGrid
                key="maliyetler_kayitlar_v1"
                {...gridOrtak}
                tabloBaslik="Maliyetler"
                kolonlar={kolonlar}
                satirlar={kayitlar}
                depolamaAnahtari="maliyetler_kayitlar_v1"
                bosMesaj="Henüz maliyet kaydı yok"
                satirSinifAdi={(m) => (!m.aktif ? 'dg-satir--pasif' : undefined)}
                onSatirTikla={(m) => satirDuzenleAc(m.id)}
                onSatirSil={silmeVar ? (m) => setSilme(m) : undefined}
              />
            </div>
          )}
        </div>
      </div>

      <SilmeOnayModal
        acik={!!silme}
        onKapat={() => setSilme(null)}
        onOnayla={() => void silOnayla()}
        baslik="Bu maliyet kaydını silmek istiyor musunuz?"
        hedefMetin={silme ? `${silme.urunAdi} — ${silme.birimAdi}` : ''}
        ariaLabel="Maliyet silme onayı"
      />
    </AdminModulKabuk>
  );
}
