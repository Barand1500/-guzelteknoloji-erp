import { useCallback, useEffect, useMemo, useState } from 'react';
import { formSelectSinifi } from '@/formlar/FormAlani';
import { iskontoIfadesiHesapla } from '@/araclar/iskontoYardimci';
import { masterBayileriGetir, type MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import {
  FirmaKayitPanel,
  BOS_FIRMA_PANEL,
  firmaPaneldenGirdi,
  firmadanPanel,
  type FirmaPanelForm,
} from '@/admin/baslat-menusu/master/bilesenler/FirmaKayitPanel';
import {
  FirmaExcelTablo,
  type AktifHucre,
  type FirmaDuzenlenebilirAlan,
} from '@/admin/baslat-menusu/master/bilesenler/FirmaExcelTablo';
import { MasterTabloSayfalama } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSayfalama';
import { MasterTabloSutunAyarlari } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSutunAyarlari';
import {
  MasterUstFiltreSatiri,
  useMasterKartDurumFiltre,
} from '@/admin/baslat-menusu/master/bilesenler/MasterKartUstAksiyon';
import {
  FIRMA_TABLO_SUTUNLARI,
  FIRMA_TABLO_VARSAYILAN_SIRA,
  firmaTabloSutunlariKaydet,
  firmaTabloSutunlariOku,
} from '@/admin/baslat-menusu/master/firmalar/firmaTabloSutunlari';
import {
  masterFirmaGuncelle,
  masterFirmaOlustur,
  masterFirmaSil,
  masterFirmalariGetir,
  type FirmaFormGirdi,
  type MasterFirma,
} from '@/admin/baslat-menusu/master/firmalar/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { FirmaAgacGorunumu } from '@/admin/baslat-menusu/master/bilesenler/agac/FirmaAgacGorunumu';
import type { MasterGorunum } from '@/admin/baslat-menusu/master/bilesenler/MasterGorunumSegici';
import { masterLisanslariGetir, type MasterLisans } from '@/admin/baslat-menusu/master/lisanslar/api';
import { masterSubeleriGetir, type MasterSube } from '@/admin/baslat-menusu/master/subeler/api';

function hucreMevcutDeger(firma: MasterFirma, alan: FirmaDuzenlenebilirAlan): string {
  switch (alan) {
    case 'bayiId':
      return String(firma.bayiId);
    case 'tabelaAdi':
      return firma.tabelaAdi ?? '';
    case 'iskonto':
      return firma.iskonto != null ? String(firma.iskonto) : '';
    default:
      return (firma[alan] as string | undefined) ?? '';
  }
}

export function FirmalarSekme({ gorunum = 'tablo' }: { gorunum?: MasterGorunum }) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [firmalar, setFirmalar] = useState<MasterFirma[]>([]);
  const [bayiler, setBayiler] = useState<MasterBayi[]>([]);
  const [subeler, setSubeler] = useState<MasterSube[]>([]);
  const [lisanslar, setLisanslar] = useState<MasterLisans[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [bayiFiltre, setBayiFiltre] = useState<number | ''>('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [sayfa, setSayfa] = useState(0);
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [eklemeAcik, setEklemeAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterFirma | null>(null);
  const [panelForm, setPanelForm] = useState<FirmaPanelForm>(BOS_FIRMA_PANEL);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);
  const [seciliId, setSeciliId] = useState<number | null>(null);
  const [aktifHucre, setAktifHucre] = useState<AktifHucre | null>(null);
  const [hucreTaslak, setHucreTaslak] = useState('');
  const [hucreKaydediliyor, setHucreKaydediliyor] = useState(false);
  const [gorunurSutunlar, setGorunurSutunlar] = useState(firmaTabloSutunlariOku);

  const panelAcik = eklemeAcik || duzenlenen != null;

  useMasterKartDurumFiltre(filtre, setFiltre);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      if (gorunum === 'agac') {
        const [firmaVeri, bayiVeri, subeVeri, lisansVeri] = await Promise.all([
          masterFirmalariGetir(),
          masterBayileriGetir(),
          masterSubeleriGetir(),
          masterLisanslariGetir(),
        ]);
        setFirmalar(firmaVeri.firmalar);
        setBayiler(bayiVeri.bayiler ?? []);
        setSubeler(subeVeri.subeler ?? []);
        setLisanslar(lisansVeri.lisanslar ?? []);
        setSeciliId((onceki) => {
          if (onceki !== null && !firmaVeri.firmalar.some((f) => f.id === onceki)) return null;
          return onceki;
        });
      } else {
        const [firmaVeri, bayiVeri] = await Promise.all([masterFirmalariGetir(), masterBayileriGetir()]);
        setFirmalar(firmaVeri.firmalar);
        setBayiler(bayiVeri.bayiler ?? []);
        setSeciliId((onceki) => {
          if (onceki !== null && !firmaVeri.firmalar.some((f) => f.id === onceki)) return null;
          return onceki;
        });
      }
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Firmalar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [gorunum]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  useEffect(() => {
    setSayfa(0);
  }, [arama, filtre, bayiFiltre, sayfaBoyutu]);

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return firmalar.filter((f) => {
      if (filtre === 'aktif' && !f.aktif) return false;
      if (filtre === 'pasif' && f.aktif) return false;
      if (bayiFiltre !== '' && f.bayiId !== bayiFiltre) return false;
      if (!q) return true;
      return (
        f.unvan.toLowerCase().includes(q) ||
        (f.tabelaAdi?.toLowerCase().includes(q) ?? false) ||
        f.bayiUnvan.toLowerCase().includes(q) ||
        (f.il?.toLowerCase().includes(q) ?? false) ||
        (f.eposta?.toLowerCase().includes(q) ?? false) ||
        (f.vergiNo?.toLowerCase().includes(q) ?? false) ||
        (f.vergiDairesi?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [firmalar, arama, filtre, bayiFiltre]);

  const sayfalanmisListe = useMemo(() => {
    const bas = sayfa * sayfaBoyutu;
    return liste.slice(bas, bas + sayfaBoyutu);
  }, [liste, sayfa, sayfaBoyutu]);

  const seciliFirma = useMemo(
    () => (seciliId !== null ? firmalar.find((f) => f.id === seciliId) ?? null : null),
    [firmalar, seciliId]
  );

  const aktifBayiler = useMemo(() => bayiler.filter((b) => b.aktif), [bayiler]);

  function hucreIptal() {
    setAktifHucre(null);
    setHucreTaslak('');
  }

  const hucreBaslat = useCallback((firma: MasterFirma, alan: FirmaDuzenlenebilirAlan) => {
    setAktifHucre({ firmaId: firma.id, alan });
    setHucreTaslak(hucreMevcutDeger(firma, alan));
  }, []);

  const hucreKaydet = useCallback(
    async (anlikDeger?: string) => {
      if (!aktifHucre || hucreKaydediliyor) return;
      const firma = firmalar.find((f) => f.id === aktifHucre.firmaId);
      if (!firma) {
        hucreIptal();
        return;
      }

      const ham = (anlikDeger ?? hucreTaslak).trim();
      const mevcut = hucreMevcutDeger(firma, aktifHucre.alan);
      if (ham === mevcut.trim() || (aktifHucre.alan !== 'unvan' && ham === mevcut)) {
        hucreIptal();
        return;
      }

      const girdi: Partial<FirmaFormGirdi> = {};
      const { alan } = aktifHucre;

      if (alan === 'unvan') {
        if (ham.length < 2) {
          hataBildir('Unvan en az 2 karakter olmalı');
          return;
        }
        girdi.unvan = ham;
      } else if (alan === 'bayiId') {
        const bayiId = Number(ham);
        if (!Number.isInteger(bayiId) || bayiId < 1) {
          hataBildir('Geçerli bir bayi seçin');
          return;
        }
        girdi.bayiId = bayiId;
      } else if (alan === 'tabelaAdi') {
        girdi.tabelaAdi = ham || undefined;
      } else if (alan === 'iskonto') {
        if (!ham) {
          girdi.iskonto = null;
        } else {
          const iskonto = iskontoIfadesiHesapla(ham);
          if (iskonto == null) {
            hataBildir('Geçerli bir iskonto girin (ör. 5 veya 20+20)');
            return;
          }
          girdi.iskonto = iskonto;
        }
      } else if (alan === 'vergiNo') {
        const vergiNo = ham.replace(/\D/g, '').slice(0, 10);
        girdi.vergiNo = vergiNo || undefined;
      } else {
        girdi[alan] = ham || undefined;
      }

      setHucreKaydediliyor(true);
      try {
        const { firma: guncel } = await masterFirmaGuncelle(firma.id, girdi);
        setFirmalar((onceki) => onceki.map((f) => (f.id === guncel.id ? guncel : f)));
        hucreIptal();
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Hücre kaydedilemedi');
      } finally {
        setHucreKaydediliyor(false);
      }
    },
    [aktifHucre, hucreTaslak, hucreKaydediliyor, firmalar, hataBildir]
  );

  const panelIptal = useCallback(() => {
    setEklemeAcik(false);
    setDuzenlenen(null);
    setPanelForm(BOS_FIRMA_PANEL);
  }, []);

  const panelKaydet = useCallback(async () => {
    const sonuc = firmaPaneldenGirdi(panelForm);
    if (sonuc.hata || !sonuc.girdi) {
      hataBildir(sonuc.hata ?? 'Geçersiz form');
      return;
    }

    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterFirmaGuncelle(duzenlenen.id, sonuc.girdi);
        basariBildir(`${sonuc.girdi.unvan} güncellendi.`);
      } else {
        const { firma } = await masterFirmaOlustur(sonuc.girdi);
        setSeciliId(firma.id);
        basariBildir(`${sonuc.girdi.unvan} eklendi.`);
      }
      panelIptal();
      await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [panelForm, duzenlenen, panelIptal, yukle, basariBildir, hataBildir]);

  const yeniFirma = useCallback(() => {
    setEklemeAcik(true);
    setDuzenlenen(null);
    setPanelForm({
      ...BOS_FIRMA_PANEL,
      bayiId: aktifBayiler[0]?.id ?? 0,
    });
    setSeciliId(null);
    hucreIptal();
  }, [aktifBayiler]);

  const firmaDuzenle = useCallback((firma: MasterFirma) => {
    setEklemeAcik(false);
    setDuzenlenen(firma);
    setPanelForm(firmadanPanel(firma));
    setSeciliId(firma.id);
    hucreIptal();
  }, []);

  const firmaSil = useCallback(async () => {
    if (!seciliFirma) return;
    if (
      !confirm(
        `"${seciliFirma.tabelaAdi ?? seciliFirma.unvan}" firmasını silmek istediğinize emin misiniz? Bağlı şubeler de kaldırılır.`
      )
    ) {
      return;
    }
    setKaydediliyor(true);
    try {
      await masterFirmaSil(seciliFirma.id);
      setSeciliId(null);
      await yukle();
      basariBildir('Firma silindi.');
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Firma silinemedi');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliFirma, yukle, basariBildir, hataBildir]);

  const sutunlarDegistir = useCallback((sira: string[]) => {
    setGorunurSutunlar(sira);
    firmaTabloSutunlariKaydet(sira);
  }, []);

  async function durumDegistir(firma: MasterFirma, aktif: boolean) {
    setIslemId(firma.id);
    try {
      await masterFirmaGuncelle(firma.id, { aktif });
      await yukle();
      basariBildir(`${firma.tabelaAdi ?? firma.unvan} ${aktif ? 'aktif' : 'pasif'} yapıldı.`);
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
      ekle: yeniFirma,
      kaydet: panelKaydet,
      sil: panelAcik ? panelIptal : firmaSil,
    },
    {
      kaydet: panelAcik && !kaydediliyor,
      ekle: !islemde && !panelAcik && aktifBayiler.length > 0 && !aktifHucre,
      sil: (panelAcik || !!seciliFirma) && !islemde && !aktifHucre,
    },
    kirli
  );

  if (yukleniyor) return <YukleniyorDurumu mesaj="Firmalar yükleniyor…" />;
  if (hata) return <HataDurumu mesaj={hata} />;

  const tabloGoster = panelAcik || liste.length > 0;

  return (
    <div className="ap-master-sekme">
      <MasterUstFiltreSatiri
        arama={arama}
        onArama={setArama}
        placeholder="Tabela, unvan, bayi, il veya e-posta ara…"
        sag={
          <>
            <select
              className={`${formSelectSinifi} ap-master-ikincil-filtre`}
              value={bayiFiltre}
              onChange={(e) => setBayiFiltre(e.target.value ? Number(e.target.value) : '')}
              aria-label="Bayi filtresi"
            >
              <option value="">Tüm bayiler</option>
              {bayiler.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.unvan}
                </option>
              ))}
            </select>
            <MasterTabloSutunAyarlari
              baslik="Firma tablosu sütunları"
              sutunlar={FIRMA_TABLO_SUTUNLARI}
              gorunurSira={gorunurSutunlar}
              varsayilanSira={FIRMA_TABLO_VARSAYILAN_SIRA}
              onDegistir={sutunlarDegistir}
            />
          </>
        }
      />

      {panelAcik && (
        <FirmaKayitPanel
          acik
          yeniKayit={eklemeAcik}
          duzenlenen={duzenlenen}
          form={panelForm}
          onFormDegistir={setPanelForm}
          bayiSecenekleri={bayiler}
          kaydediliyor={kaydediliyor}
        />
      )}

      {!tabloGoster ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu' || bayiFiltre !== ''
              ? 'Filtreye uygun firma bulunamadı.'
              : aktifBayiler.length === 0
                ? 'Önce aktif bir bayi ekleyin.'
                : 'Henüz firma kaydı yok. Alt çubuktan Yeni Ekle ile başlayın.'}
          </p>
        </div>
      ) : gorunum === 'agac' ? (
        <FirmaAgacGorunumu
          firmalar={liste}
          bayiler={bayiler}
          subeler={subeler}
          lisanslar={lisanslar}
          arama={arama}
          filtre={filtre}
          bayiFiltre={bayiFiltre}
        />
      ) : (
        <>
          <FirmaExcelTablo
            firmalar={sayfalanmisListe}
            bayiler={bayiler}
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
            onDurumDegistir={(f, aktif) => void durumDegistir(f, aktif)}
            onPanelDuzenle={firmaDuzenle}
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
