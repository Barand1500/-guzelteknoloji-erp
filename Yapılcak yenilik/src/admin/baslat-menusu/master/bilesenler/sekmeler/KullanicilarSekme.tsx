import { useCallback, useEffect, useMemo, useState } from 'react';
import { iskontoIfadesiHesapla } from '@/araclar/iskontoYardimci';
import {
  KullaniciKayitPanel,
  BOS_KULLANICI_PANEL,
  kullaniciPaneldenGirdi,
  kullanicidanPanel,
  type KullaniciPanelForm,
} from '@/admin/baslat-menusu/master/bilesenler/KullaniciKayitPanel';
import {
  KullaniciExcelTablo,
  type AktifKullaniciHucre,
  type KullaniciDuzenlenebilirAlan,
} from '@/admin/baslat-menusu/master/bilesenler/KullaniciExcelTablo';
import { MasterTabloSayfalama } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSayfalama';
import { MasterTabloSutunAyarlari } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSutunAyarlari';
import {
  MasterUstFiltreSatiri,
  useMasterKartDurumFiltre,
} from '@/admin/baslat-menusu/master/bilesenler/MasterKartUstAksiyon';
import { masterBayileriGetir } from '@/admin/baslat-menusu/master/bayiler/api';
import { masterFirmalariGetir } from '@/admin/baslat-menusu/master/firmalar/api';
import {
  KULLANICI_TABLO_SUTUNLARI,
  KULLANICI_TABLO_VARSAYILAN_SIRA,
  kullaniciTabloSutunlariKaydet,
  kullaniciTabloSutunlariOku,
} from '@/admin/baslat-menusu/master/kullanicilar/kullaniciTabloSutunlari';
import {
  kullaniciTipiHesapla,
  masterKullaniciGuncelle,
  masterKullaniciOlustur,
  masterKullaniciSil,
  masterKullanicilariGetir,
  type KullaniciFormGirdi,
  type MasterKullanici,
} from '@/admin/baslat-menusu/master/kullanicilar/api';
import { masterSubeleriGetir } from '@/admin/baslat-menusu/master/subeler/api';
import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

function hucreMevcutDeger(k: MasterKullanici, alan: KullaniciDuzenlenebilirAlan): string {
  switch (alan) {
    case 'email':
      return k.eposta;
    case 'bayiId':
      return k.bayiId != null ? String(k.bayiId) : '';
    case 'firmaId':
      return k.firmaId != null ? String(k.firmaId) : '';
    case 'subeId':
      return k.subeId != null ? String(k.subeId) : '';
    case 'aktif':
      return k.aktif ? 'true' : 'false';
    case 'iskonto':
      return k.iskonto != null ? String(k.iskonto) : '';
    default:
      return (k[alan as keyof MasterKullanici] as string | undefined) ?? '';
  }
}

export function KullanicilarSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kullanicilar, setKullanicilar] = useState<MasterKullanici[]>([]);
  const [roller, setRoller] = useState<{ kod: string; baslik: string }[]>([]);
  const [bayiler, setBayiler] = useState<Awaited<ReturnType<typeof masterBayileriGetir>>['bayiler']>([]);
  const [firmalar, setFirmalar] = useState<Awaited<ReturnType<typeof masterFirmalariGetir>>['firmalar']>([]);
  const [subeler, setSubeler] = useState<Awaited<ReturnType<typeof masterSubeleriGetir>>['subeler']>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [sayfa, setSayfa] = useState(0);
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [eklemeAcik, setEklemeAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterKullanici | null>(null);
  const [panelForm, setPanelForm] = useState<KullaniciPanelForm>(BOS_KULLANICI_PANEL);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);
  const [seciliId, setSeciliId] = useState<number | null>(null);
  const [aktifHucre, setAktifHucre] = useState<AktifKullaniciHucre | null>(null);
  const [hucreTaslak, setHucreTaslak] = useState('');
  const [hucreKaydediliyor, setHucreKaydediliyor] = useState(false);
  const [gorunurSutunlar, setGorunurSutunlar] = useState(kullaniciTabloSutunlariOku);

  const panelAcik = eklemeAcik || duzenlenen != null;

  useMasterKartDurumFiltre(filtre, setFiltre);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const [kVeri, bVeri, fVeri, sVeri, rolVeri] = await Promise.all([
        masterKullanicilariGetir(),
        masterBayileriGetir(),
        masterFirmalariGetir(),
        masterSubeleriGetir(),
        adminJsonFetch<{ roller: { kod: string; baslik: string }[] }>('/roller', { headers: adminHeaders() }),
      ]);
      setKullanicilar(kVeri.kullanicilar);
      setBayiler(bVeri.bayiler ?? []);
      setFirmalar(fVeri.firmalar);
      setSubeler(sVeri.subeler);
      setRoller(rolVeri.roller ?? []);
      setSeciliId((onceki) => {
        if (onceki !== null && !kVeri.kullanicilar.some((k) => k.id === onceki)) return null;
        return onceki;
      });
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Kullanıcılar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  useEffect(() => {
    setSayfa(0);
  }, [arama, filtre, sayfaBoyutu]);

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return kullanicilar.filter((k) => {
      if (filtre === 'aktif' && !k.aktif) return false;
      if (filtre === 'pasif' && k.aktif) return false;
      if (!q) return true;
      return (
        k.ad.toLowerCase().includes(q) ||
        k.eposta.toLowerCase().includes(q) ||
        k.rol.toLowerCase().includes(q) ||
        (k.bayiUnvan?.toLowerCase().includes(q) ?? false) ||
        (k.firmaTabela?.toLowerCase().includes(q) ?? false) ||
        (k.subeAdi?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [kullanicilar, arama, filtre]);

  const sayfalanmisListe = useMemo(() => {
    const bas = sayfa * sayfaBoyutu;
    return liste.slice(bas, bas + sayfaBoyutu);
  }, [liste, sayfa, sayfaBoyutu]);

  const seciliKullanici = useMemo(
    () => (seciliId !== null ? kullanicilar.find((k) => k.id === seciliId) ?? null : null),
    [kullanicilar, seciliId]
  );

  function hucreIptal() {
    setAktifHucre(null);
    setHucreTaslak('');
  }

  const hucreBaslat = useCallback((k: MasterKullanici, alan: KullaniciDuzenlenebilirAlan) => {
    setAktifHucre({ kullaniciId: k.id, alan });
    setHucreTaslak(hucreMevcutDeger(k, alan));
  }, []);

  const hucreKaydet = useCallback(
    async (anlikDeger?: string) => {
      if (!aktifHucre || hucreKaydediliyor) return;
      const k = kullanicilar.find((u) => u.id === aktifHucre.kullaniciId);
      if (!k) {
        hucreIptal();
        return;
      }

      const ham = (anlikDeger ?? hucreTaslak).trim();
      const mevcut = hucreMevcutDeger(k, aktifHucre.alan);
      if (ham === mevcut.trim() || (aktifHucre.alan !== 'ad' && ham === mevcut)) {
        hucreIptal();
        return;
      }

      const girdi: Partial<KullaniciFormGirdi> = {};
      const { alan } = aktifHucre;

      if (alan === 'ad') {
        if (ham.length < 2) {
          hataBildir('Ad en az 2 karakter olmalı');
          return;
        }
        girdi.ad = ham;
      } else if (alan === 'email') {
        if (!ham.includes('@')) {
          hataBildir('Geçerli e-posta girin');
          return;
        }
        girdi.email = ham;
      } else if (alan === 'bayiId') {
        const bayiId = ham ? Number(ham) : null;
        girdi.bayiId = bayiId;
        girdi.firmaId = null;
        girdi.subeId = null;
        girdi.kullaniciTipi = kullaniciTipiHesapla(bayiId, null, null);
      } else if (alan === 'firmaId') {
        const firmaId = ham ? Number(ham) : null;
        girdi.firmaId = firmaId;
        girdi.subeId = null;
        girdi.kullaniciTipi = kullaniciTipiHesapla(k.bayiId, firmaId, null);
      } else if (alan === 'subeId') {
        const subeId = ham ? Number(ham) : null;
        girdi.subeId = subeId;
        girdi.kullaniciTipi = kullaniciTipiHesapla(k.bayiId, k.firmaId, subeId);
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
      } else if (alan === 'rol') {
        girdi.rol = ham;
      } else if (alan === 'gsm') {
        girdi.gsm = ham || undefined;
      }

      setHucreKaydediliyor(true);
      try {
        const { kullanici: guncel } = await masterKullaniciGuncelle(k.id, girdi);
        setKullanicilar((onceki) => onceki.map((u) => (u.id === guncel.id ? guncel : u)));
        hucreIptal();
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Hücre kaydedilemedi');
      } finally {
        setHucreKaydediliyor(false);
      }
    },
    [aktifHucre, hucreTaslak, hucreKaydediliyor, kullanicilar, hataBildir]
  );

  const panelIptal = useCallback(() => {
    setEklemeAcik(false);
    setDuzenlenen(null);
    setPanelForm(BOS_KULLANICI_PANEL);
    hucreIptal();
  }, []);

  const panelKaydet = useCallback(async () => {
    const sonuc = kullaniciPaneldenGirdi(panelForm, eklemeAcik);
    if (sonuc.hata || !sonuc.girdi) {
      hataBildir(sonuc.hata ?? 'Geçersiz form');
      return;
    }

    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterKullaniciGuncelle(duzenlenen.id, sonuc.girdi);
        basariBildir(`${sonuc.girdi.ad} güncellendi.`);
      } else {
        const yanit = await masterKullaniciOlustur(sonuc.girdi);
        if (!yanit.kullanici) {
          throw new Error('Kullanıcı oluşturulamadı');
        }
        setSeciliId(yanit.kullanici.id);
        basariBildir(`${sonuc.girdi.ad} eklendi.`);
      }
      panelIptal();
      await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [panelForm, eklemeAcik, duzenlenen, panelIptal, yukle, basariBildir, hataBildir]);

  const yeniKullanici = useCallback(() => {
    const ilkBayi = bayiler.find((b) => b.aktif)?.id ?? null;
    setEklemeAcik(true);
    setDuzenlenen(null);
    setPanelForm({
      ...BOS_KULLANICI_PANEL,
      rol: roller[0]?.kod ?? 'EDITOR',
      bayiId: ilkBayi,
    });
    setSeciliId(null);
    hucreIptal();
  }, [bayiler, roller]);

  const kullaniciDuzenle = useCallback((k: MasterKullanici) => {
    setEklemeAcik(false);
    setDuzenlenen(k);
    setPanelForm(kullanicidanPanel(k));
    setSeciliId(k.id);
    hucreIptal();
  }, []);

  const kullaniciSil = useCallback(async () => {
    if (!seciliKullanici) return;
    if (!confirm(`"${seciliKullanici.ad}" kullanıcısını silmek istediğinize emin misiniz?`)) return;
    setKaydediliyor(true);
    try {
      await masterKullaniciSil(seciliKullanici.id);
      setSeciliId(null);
      await yukle();
      basariBildir('Kullanıcı silindi.');
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kullanıcı silinemedi');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliKullanici, yukle, basariBildir, hataBildir]);

  const sutunlarDegistir = useCallback((sira: string[]) => {
    setGorunurSutunlar(sira);
    kullaniciTabloSutunlariKaydet(sira);
  }, []);

  async function durumDegistir(k: MasterKullanici, aktif: boolean) {
    setIslemId(k.id);
    try {
      await masterKullaniciGuncelle(k.id, { aktif });
      await yukle();
      basariBildir(`${k.ad} ${aktif ? 'aktif' : 'pasif'} yapıldı.`);
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
      ekle: yeniKullanici,
      kaydet: panelKaydet,
      sil: panelAcik ? panelIptal : kullaniciSil,
    },
    {
      kaydet: panelAcik && !kaydediliyor,
      ekle: !islemde && !panelAcik && !aktifHucre,
      sil: (panelAcik || !!seciliKullanici) && !islemde && !aktifHucre,
    },
    kirli
  );

  if (yukleniyor && !panelAcik) return <YukleniyorDurumu mesaj="Kullanıcılar yükleniyor…" />;
  if (hata) return <HataDurumu mesaj={hata} />;

  const tabloGoster = panelAcik || liste.length > 0;

  return (
    <div className="ap-master-sekme">
      <MasterUstFiltreSatiri
        arama={arama}
        onArama={setArama}
        placeholder="Ad, e-posta, rol, bayi veya şube ara…"
        sag={
          <MasterTabloSutunAyarlari
            baslik="Kullanıcı tablosu sütunları"
            sutunlar={KULLANICI_TABLO_SUTUNLARI}
            gorunurSira={gorunurSutunlar}
            varsayilanSira={KULLANICI_TABLO_VARSAYILAN_SIRA}
            onDegistir={sutunlarDegistir}
          />
        }
      />

      {panelAcik && (
        <KullaniciKayitPanel
          acik
          yeniKayit={eklemeAcik}
          duzenlenen={duzenlenen}
          form={panelForm}
          onFormDegistir={setPanelForm}
          roller={roller}
          bayiler={bayiler}
          firmalar={firmalar}
          subeler={subeler}
          kaydediliyor={kaydediliyor}
        />
      )}

      {!tabloGoster ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu'
              ? 'Filtreye uygun kullanıcı bulunamadı.'
              : 'Henüz kullanıcı yok. Alt çubuktan Yeni Ekle ile başlayın.'}
          </p>
        </div>
      ) : (
        <>
          <KullaniciExcelTablo
            kullanicilar={sayfalanmisListe}
            roller={roller}
            bayiler={bayiler}
            firmalar={firmalar}
            subeler={subeler}
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
            onDurumDegistir={(k, aktif) => void durumDegistir(k, aktif)}
            onPanelDuzenle={kullaniciDuzenle}
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
