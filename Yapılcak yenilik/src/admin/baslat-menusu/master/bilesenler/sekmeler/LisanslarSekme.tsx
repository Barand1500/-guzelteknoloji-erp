import { useCallback, useEffect, useMemo, useState } from 'react';
import { formSelectSinifi } from '@/formlar/FormAlani';
import {
  LisansKayitPanel,
  BOS_LISANS_PANEL,
  lisansPaneldenGirdi,
  lisanstanPanel,
  type LisansPanelForm,
} from '@/admin/baslat-menusu/master/bilesenler/LisansKayitPanel';
import {
  LisansExcelTablo,
  type AktifLisansHucre,
  type LisansDuzenlenebilirAlan,
} from '@/admin/baslat-menusu/master/bilesenler/LisansExcelTablo';
import { MasterTabloSayfalama } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSayfalama';
import { MasterTabloSutunAyarlari } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSutunAyarlari';
import {
  MASTER_LISANS_DURUM_FILTRE,
  MasterUstFiltreSatiri,
  useMasterKartDurumFiltre,
} from '@/admin/baslat-menusu/master/bilesenler/MasterKartUstAksiyon';
import { masterFirmalariGetir } from '@/admin/baslat-menusu/master/firmalar/api';
import {
  LISANS_TABLO_SUTUNLARI,
  LISANS_TABLO_VARSAYILAN_SIRA,
  lisansTabloSutunlariKaydet,
  lisansTabloSutunlariOku,
} from '@/admin/baslat-menusu/master/lisanslar/lisansTabloSutunlari';
import {
  masterLisansGuncelle,
  masterLisansOlustur,
  masterLisansSil,
  masterLisanslariGetir,
  type LisansFormGirdi,
  type MasterLisans,
} from '@/admin/baslat-menusu/master/lisanslar/api';
import { masterPaketleriGetir } from '@/admin/baslat-menusu/master/paketler/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { LisansAgacGorunumu } from '@/admin/baslat-menusu/master/bilesenler/agac/LisansAgacGorunumu';
import type { MasterGorunum } from '@/admin/baslat-menusu/master/bilesenler/MasterGorunumSegici';

type Filtre = 'tumu' | 'aktif' | 'yakinda' | 'pasif';

function hucreMevcutDeger(lisans: MasterLisans, alan: LisansDuzenlenebilirAlan): string {
  switch (alan) {
    case 'paketId':
      return String(lisans.paketId);
    case 'baslangicTarihi':
      return lisans.baslangicTarihi.slice(0, 10);
    case 'bitisTarihi':
      return lisans.bitisTarihi ? lisans.bitisTarihi.slice(0, 10) : '';
    default:
      return '';
  }
}

export function LisanslarSekme({ gorunum = 'tablo' }: { gorunum?: MasterGorunum }) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [lisanslar, setLisanslar] = useState<MasterLisans[]>([]);
  const [firmalar, setFirmalar] = useState<Awaited<ReturnType<typeof masterFirmalariGetir>>['firmalar']>([]);
  const [paketler, setPaketler] = useState<Awaited<ReturnType<typeof masterPaketleriGetir>>['paketler']>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [firmaFiltre, setFirmaFiltre] = useState<number | ''>('');
  const [filtre, setFiltre] = useState<Filtre>('tumu');
  const [sayfa, setSayfa] = useState(0);
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [eklemeAcik, setEklemeAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterLisans | null>(null);
  const [panelForm, setPanelForm] = useState<LisansPanelForm>(BOS_LISANS_PANEL);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);
  const [seciliId, setSeciliId] = useState<number | null>(null);
  const [aktifHucre, setAktifHucre] = useState<AktifLisansHucre | null>(null);
  const [hucreTaslak, setHucreTaslak] = useState('');
  const [hucreKaydediliyor, setHucreKaydediliyor] = useState(false);
  const [gorunurSutunlar, setGorunurSutunlar] = useState(lisansTabloSutunlariOku);

  const panelAcik = eklemeAcik || duzenlenen != null;

  useMasterKartDurumFiltre(filtre, setFiltre, MASTER_LISANS_DURUM_FILTRE);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const [lVeri, fVeri, pVeri] = await Promise.all([
        masterLisanslariGetir(),
        masterFirmalariGetir(),
        masterPaketleriGetir(),
      ]);
      setLisanslar(lVeri.lisanslar ?? []);
      setFirmalar(fVeri.firmalar ?? []);
      setPaketler(pVeri.paketler ?? []);
      setSeciliId((onceki) => {
        if (onceki !== null && !(lVeri.lisanslar ?? []).some((l) => l.id === onceki)) return null;
        return onceki;
      });
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Lisanslar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  useEffect(() => {
    setSayfa(0);
  }, [arama, filtre, firmaFiltre, sayfaBoyutu]);

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return lisanslar.filter((l) => {
      if (filtre !== 'tumu' && l.durum !== filtre) return false;
      if (firmaFiltre !== '' && l.firmaId !== firmaFiltre) return false;
      if (!q) return true;
      return (
        l.firmaUnvan.toLowerCase().includes(q) ||
        (l.firmaTabela?.toLowerCase().includes(q) ?? false) ||
        l.paketAdi.toLowerCase().includes(q)
      );
    });
  }, [lisanslar, arama, filtre, firmaFiltre]);

  const sayfalanmisListe = useMemo(() => {
    const bas = sayfa * sayfaBoyutu;
    return liste.slice(bas, bas + sayfaBoyutu);
  }, [liste, sayfa, sayfaBoyutu]);

  const seciliLisans = useMemo(
    () => (seciliId !== null ? lisanslar.find((l) => l.id === seciliId) ?? null : null),
    [lisanslar, seciliId]
  );

  const aktifFirmalar = useMemo(() => firmalar.filter((f) => f.aktif), [firmalar]);
  const aktifPaketler = useMemo(() => paketler.filter((p) => p.aktif), [paketler]);

  function hucreIptal() {
    setAktifHucre(null);
    setHucreTaslak('');
  }

  const hucreBaslat = useCallback(
    (lisans: MasterLisans, alan: LisansDuzenlenebilirAlan) => {
      if (panelAcik) return;
      setAktifHucre({ lisansId: lisans.id, alan });
      setHucreTaslak(hucreMevcutDeger(lisans, alan));
    },
    [panelAcik]
  );

  const hucreKaydet = useCallback(
    async (anlikDeger?: string) => {
      if (!aktifHucre || hucreKaydediliyor) return;
      const lisans = lisanslar.find((l) => l.id === aktifHucre.lisansId);
      if (!lisans) {
        hucreIptal();
        return;
      }

      const ham = (anlikDeger ?? hucreTaslak).trim();
      const mevcut = hucreMevcutDeger(lisans, aktifHucre.alan);
      if (ham === mevcut.trim()) {
        hucreIptal();
        return;
      }

      const girdi: Partial<LisansFormGirdi> = {};
      const { alan } = aktifHucre;

      if (alan === 'paketId') {
        const paketId = Number(ham);
        if (!Number.isInteger(paketId) || paketId < 1) {
          hataBildir('Geçerli bir paket seçin');
          return;
        }
        girdi.paketId = paketId;
      } else if (alan === 'baslangicTarihi') {
        if (!ham) {
          hataBildir('Başlangıç tarihi gerekli');
          return;
        }
        girdi.baslangicTarihi = ham;
      } else if (alan === 'bitisTarihi') {
        girdi.bitisTarihi = ham || null;
      }

      setHucreKaydediliyor(true);
      try {
        const { lisans: guncel } = await masterLisansGuncelle(lisans.id, girdi);
        setLisanslar((onceki) => onceki.map((l) => (l.id === guncel.id ? guncel : l)));
        hucreIptal();
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Hücre kaydedilemedi');
      } finally {
        setHucreKaydediliyor(false);
      }
    },
    [aktifHucre, hucreTaslak, hucreKaydediliyor, lisanslar, hataBildir]
  );

  const panelIptal = useCallback(() => {
    setEklemeAcik(false);
    setDuzenlenen(null);
    setPanelForm(BOS_LISANS_PANEL);
    hucreIptal();
  }, []);

  const panelKaydet = useCallback(async () => {
    const sonuc = lisansPaneldenGirdi(panelForm);
    if (sonuc.hata || !sonuc.girdi) {
      hataBildir(sonuc.hata ?? 'Geçersiz form');
      return;
    }

    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterLisansGuncelle(duzenlenen.id, sonuc.girdi);
        basariBildir('Lisans güncellendi.');
      } else {
        const { lisans } = await masterLisansOlustur(sonuc.girdi);
        setSeciliId(lisans.id);
        basariBildir('Lisans oluşturuldu.');
      }
      panelIptal();
      await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [panelForm, duzenlenen, panelIptal, yukle, basariBildir, hataBildir]);

  const yeniLisans = useCallback(() => {
    setEklemeAcik(true);
    setDuzenlenen(null);
    setPanelForm({
      ...BOS_LISANS_PANEL,
      firmaId: aktifFirmalar[0]?.id ?? 0,
      paketId: aktifPaketler[0]?.id ?? 0,
      baslangicTarihi: new Date().toISOString().slice(0, 10),
    });
    setSeciliId(null);
    hucreIptal();
    setSayfa(0);
  }, [aktifFirmalar, aktifPaketler]);

  const lisansDuzenle = useCallback((l: MasterLisans) => {
    setEklemeAcik(false);
    setDuzenlenen(l);
    setPanelForm(lisanstanPanel(l));
    setSeciliId(l.id);
    hucreIptal();
  }, []);

  const lisansSil = useCallback(async () => {
    if (!seciliLisans) return;
    const firmaAd = seciliLisans.firmaTabela ?? seciliLisans.firmaUnvan;
    if (!confirm(`"${firmaAd}" firmasının lisansını silmek istediğinize emin misiniz?`)) return;

    setKaydediliyor(true);
    try {
      await masterLisansSil(seciliLisans.id);
      setSeciliId(null);
      await yukle();
      basariBildir('Lisans silindi.');
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Lisans silinemedi');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliLisans, yukle, basariBildir, hataBildir]);

  const sutunlarDegistir = useCallback((sira: string[]) => {
    setGorunurSutunlar(sira);
    lisansTabloSutunlariKaydet(sira);
  }, []);

  async function durumDegistir(l: MasterLisans, aktif: boolean) {
    setIslemId(l.id);
    try {
      await masterLisansGuncelle(l.id, { aktif });
      await yukle();
      const firmaAd = l.firmaTabela ?? l.firmaUnvan;
      basariBildir(`${firmaAd} lisansı ${aktif ? 'aktif' : 'pasif'} yapıldı.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Durum güncellenemedi');
    } finally {
      setIslemId(null);
    }
  }

  const islemde = kaydediliyor || hucreKaydediliyor || islemId !== null;
  const kirli = panelAcik || aktifHucre != null;

  useModulAksiyonlari(
    {
      ekle: yeniLisans,
      kaydet: panelKaydet,
      sil: panelAcik ? panelIptal : lisansSil,
    },
    {
      kaydet: panelAcik && !kaydediliyor,
      ekle: !islemde && !panelAcik && !aktifHucre && aktifFirmalar.length > 0 && aktifPaketler.length > 0,
      sil: (panelAcik || !!seciliLisans) && !islemde && !aktifHucre,
    },
    kirli
  );

  if (yukleniyor) return <YukleniyorDurumu mesaj="Lisanslar yükleniyor…" />;
  if (hata) return <HataDurumu mesaj={hata} />;

  const tabloGoster = panelAcik || liste.length > 0;

  return (
    <div className="ap-master-sekme">
      <MasterUstFiltreSatiri
        arama={arama}
        onArama={setArama}
        placeholder="Firma veya paket ara…"
        sag={
          <>
            <select
              className={`${formSelectSinifi} ap-master-ikincil-filtre`}
              value={firmaFiltre}
              onChange={(e) => setFirmaFiltre(e.target.value ? Number(e.target.value) : '')}
              aria-label="Firma filtresi"
            >
              <option value="">Tüm firmalar</option>
              {firmalar.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.tabelaAdi ?? f.unvan}
                </option>
              ))}
            </select>
            {gorunum === 'tablo' && (
              <MasterTabloSutunAyarlari
                baslik="Lisans tablosu sütunları"
                sutunlar={LISANS_TABLO_SUTUNLARI}
                gorunurSira={gorunurSutunlar}
                varsayilanSira={LISANS_TABLO_VARSAYILAN_SIRA}
                onDegistir={sutunlarDegistir}
              />
            )}
          </>
        }
      />

      {panelAcik && (
        <LisansKayitPanel
          acik
          yeniKayit={eklemeAcik}
          duzenlenen={duzenlenen}
          form={panelForm}
          onFormDegistir={setPanelForm}
          firmalar={firmalar}
          paketler={paketler}
          kaydediliyor={kaydediliyor}
        />
      )}

      {!tabloGoster ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu' || firmaFiltre !== ''
              ? 'Filtreye uygun lisans bulunamadı.'
              : aktifFirmalar.length === 0
                ? 'Önce aktif bir firma ekleyin.'
                : aktifPaketler.length === 0
                  ? 'Önce aktif bir paket tanımlayın.'
                  : 'Henüz lisans kaydı yok. Alt çubuktan Yeni Ekle ile başlayın.'}
          </p>
        </div>
      ) : gorunum === 'agac' ? (
        <LisansAgacGorunumu lisanslar={liste} paketler={paketler} filtre={filtre} />
      ) : (
        <>
          <LisansExcelTablo
            lisanslar={sayfalanmisListe}
            paketler={paketler}
            seciliId={seciliId}
            aktifHucre={aktifHucre}
            hucreTaslak={hucreTaslak}
            hucreKaydediliyor={hucreKaydediliyor}
            islemId={islemId}
            gorunurSutunlar={gorunurSutunlar}
            onSatirSec={(id) => {
              if (panelAcik) panelIptal();
              setSeciliId(id);
            }}
            onHucreBaslat={hucreBaslat}
            onHucreTaslak={setHucreTaslak}
            onHucreKaydet={hucreKaydet}
            onHucreIptal={hucreIptal}
            onDurumDegistir={(l, aktif) => void durumDegistir(l, aktif)}
            onPanelDuzenle={lisansDuzenle}
          />

          {liste.length > 0 && (
            <MasterTabloSayfalama
              toplam={liste.length}
              sayfa={sayfa}
              sayfaBoyutu={sayfaBoyutu}
              onSayfaDegistir={setSayfa}
              onSayfaBoyutuDegistir={setSayfaBoyutu}
            />
          )}
        </>
      )}
    </div>
  );
}
