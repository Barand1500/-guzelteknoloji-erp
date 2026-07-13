import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cariSil, carileriGetir } from '@/admin/baslat-menusu/erp/cari/api';
import {
  cariEkleEtiketi,
  cariHizliGirisKaydet,
  cariHizliGirisKolonlari,
} from '@/admin/baslat-menusu/erp/cari/araclar/cariKayitHizliGiris';
import { CariSekme } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariSekme';
import {
  CARI_KOLON_GENISLIK_SURUMU,
  CARI_VARSAYILAN_GIZLI,
  cariKolonlari,
} from '@/admin/baslat-menusu/erp/cari/cariKolonlari';
import { cariSatirEtiketi } from '@/admin/baslat-menusu/erp/cari/cariYardimci';
import type { AdminCari } from '@/admin/baslat-menusu/erp/cari/tipler';
import type { GomuluDuzenleSecenek } from '@/admin/baslat-menusu/tanimlar/tipler';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import '@/admin/ortak/datagrid/datagrid.css';
import { DatagridSagTikMenu } from '@/admin/ortak/datagrid/DatagridSagTikMenu';
import type { DataGridApi } from '@/admin/ortak/datagrid/types';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';

export function CariKayitlarOzeti() {
  const { eklemeVar, duzenlemeVar, silmeVar } = useYetkiler('cari');
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const sayfaRef = useRef<HTMLDivElement>(null);
  const gridApiRef = useRef<DataGridApi | null>(null);
  const [seciliSatirSayisi, setSeciliSatirSayisi] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kayitlar, setKayitlar] = useState<AdminCari[]>([]);
  const [silme, setSilme] = useState<AdminCari | null>(null);
  const [siliniyor, setSiliniyor] = useState(false);

  const kolonlar = useMemo(() => cariKolonlari(), []);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      setKayitlar(await carileriGetir());
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Cariler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const hizliGirisKaydet = useCallback(
    async (degerler: Record<string, string>) => {
      try {
        const sonuc = await cariHizliGirisKaydet(degerler);
        if (!sonuc.ok) {
          hataBildir(sonuc.mesaj);
          return false;
        }
        basariBildir(sonuc.mesaj);
        await yukle();
        return true;
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Kayıt eklenemedi');
        return false;
      }
    },
    [basariBildir, hataBildir, yukle]
  );

  const yeniEkle = useCallback(() => {
    gridApiRef.current?.hizliGirisOdakla();
  }, []);

  useModulAksiyonlari({ ekle: yeniEkle }, { ekle: eklemeVar });

  const silmeAc = useCallback((kayit: AdminCari) => {
    setSilme(kayit);
  }, []);

  const silmeKapat = useCallback(() => {
    if (siliniyor) return;
    setSilme(null);
  }, [siliniyor]);

  const silmeUygula = useCallback(async () => {
    if (!silme) return;
    setSiliniyor(true);
    try {
      await cariSil(silme.id);
      basariBildir(`${cariSatirEtiketi(silme)} silindi.`);
      setSilme(null);
      await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setSiliniyor(false);
    }
  }, [silme, basariBildir, hataBildir, yukle]);

  const panelKapat = useCallback(
    (onKapat: () => void) => {
      void yukle();
      onKapat();
    },
    [yukle]
  );

  const satirDuzenlePaneli = useCallback(
    (satir: AdminCari, _onKaydet: unknown, onKapat: () => void) => {
      const opts: GomuluDuzenleSecenek = {
        id: satir.id,
        onKapat: () => panelKapat(onKapat),
        panel: true,
      };
      return <CariSekme key={`cari-${satir.id}`} gomuluDuzenle={opts} />;
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

  const sagTikSatirSil = useCallback(
    (satir: { id: string }) => {
      const kayit = kayitlar.find((c) => c.id === satir.id);
      if (kayit) silmeAc(kayit);
    },
    [kayitlar, silmeAc]
  );

  const gridOrtak = useMemo(
    () => ({
      tabloAltBaslik: 'Görünür sütunlar ve sırası',
      yukleniyor,
      varsayilanGizliKolonlar: CARI_VARSAYILAN_GIZLI,
      kolonGenislikSurumu: CARI_KOLON_GENISLIK_SURUMU,
      gridApiRef,
      satirDuzenlePaneli: duzenlemeVar ? satirDuzenlePaneli : undefined,
      satirPanelModu: 'cubuk' as const,
      formulMenuGoster: false,
      hizliGirisIstegeBagli: true,
      hizliGirisVarsayilanAlan: true,
      hizliGirisKolonlari: eklemeVar ? cariHizliGirisKolonlari() : undefined,
      onHizliGiris: eklemeVar ? hizliGirisKaydet : undefined,
      onSecimDegistir: (ids: string[]) => setSeciliSatirSayisi(ids.length),
    }),
    [yukleniyor, satirDuzenlePaneli, hizliGirisKaydet, duzenlemeVar, eklemeVar]
  );

  if (yukleniyor && kayitlar.length === 0) return <TanimYukleniyor />;

  return (
    <div ref={sayfaRef} className="dg-demo-sayfa dg-demo-sag-tik-alan">
      <DatagridSagTikMenu
        konteynerRef={sayfaRef}
        kolonlar={kolonlar}
        satirlar={kayitlar}
        seciliSatirSayisi={seciliSatirSayisi}
        gridApiRef={gridApiRef}
        menuEtiketi="Cari kartlar menüsü"
        satirCogaltGoster={false}
        seciliSilGoster={false}
        dahiliSilmeOnay={false}
        onSatirEkleBaslat={eklemeVar ? () => gridApiRef.current?.hizliGirisOdakla() : undefined}
        onSatirSil={silmeVar ? sagTikSatirSil : undefined}
        satirSilMetniAl={(satir) => {
          const kayit = kayitlar.find((c) => c.id === satir.id);
          return kayit ? cariSatirEtiketi(kayit) : `Kayıt #${satir.id}`;
        }}
        onBilgi={basariBildir}
      />

      <div className="dg-tanimlar-kayit-ust">
        <nav className="ap-tanimlar-gezgin-yol" aria-label="Kayıt konumu">
          <ol className="ap-tanimlar-gezgin-yol-liste">
            <li className="ap-tanimlar-gezgin-yol-oge">
              <span className="ap-tanimlar-gezgin-yol-metin">Cari Kartlar</span>
            </li>
          </ol>
        </nav>
        {eklemeVar ? (
          <button type="button" className="ap-tanimlar-yeni-ekle" onClick={yeniEkle}>
            <span aria-hidden>+</span>
            {cariEkleEtiketi()}
          </button>
        ) : null}
      </div>

      <DataGrid
        key="cari_kayitlar_v2"
        {...gridOrtak}
        tabloBaslik="Cari Kayıtları"
        kolonlar={kolonlar}
        satirlar={kayitlar}
        depolamaAnahtari="cari_kayitlar_v2"
        bosMesaj="Henüz cari kart bulunmamaktadır."
        satirSinifAdi={(c) => (!c.aktif ? 'dg-satir--pasif' : undefined)}
        onSatirTikla={(c) => satirDuzenleAc(c.id)}
        onSatirSil={silmeVar ? silmeAc : undefined}
      />

      <SilmeOnayModal
        acik={!!silme}
        onKapat={silmeKapat}
        onOnayla={() => void silmeUygula()}
        baslik="Bu cari kartı silmek istiyor musunuz?"
        hedefMetin={silme ? cariSatirEtiketi(silme) : ''}
        ariaLabel="Cari silme onayı"
      />
    </div>
  );
}
