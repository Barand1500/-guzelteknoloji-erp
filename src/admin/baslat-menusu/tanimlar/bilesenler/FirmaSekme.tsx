import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  adGecerliMi,
  kodGecerliMi,
  vergiNoGecerliMi,
} from '@/admin/baslat-menusu/tanimlar/alanKurallari';
import {
  firmaGuncelle,
  firmaOlustur,
  firmaSil,
  firmalariGetir,
} from '@/admin/baslat-menusu/tanimlar/api';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import {
  TanimDurumRozeti,
  TanimKayitTablosu,
} from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitTablosu';
import { TanimListeEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimListeEkrani';
import { TanimSihirbaz } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimSihirbaz';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { VergiDairesiSecici } from '@/admin/baslat-menusu/tanimlar/bilesenler/VergiDairesiSecici';
import {
  bosFirmaForm,
  type AdminFirma,
  type FirmaFormDegeri,
  type GomuluDuzenleSecenek,
  type TanimGorunumModu,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

function firmadanForm(f: AdminFirma): FirmaFormDegeri {
  return {
    firmaKodu: f.firmaKodu,
    firmaAdi: f.firmaAdi,
    vergiDairesi: f.vergiDairesi,
    vergiNo: f.vergiNo,
    aktif: f.aktif,
  };
}

function firmaFormDogrula(form: FirmaFormDegeri): string | null {
  if (!kodGecerliMi(form.firmaKodu)) return 'Firma kodu zorunludur (en fazla 20 harf/rakam)';
  if (!adGecerliMi(form.firmaAdi, 255)) return 'Firma adı zorunludur (en fazla 255 karakter)';
  if (!vergiNoGecerliMi(form.vergiNo)) return 'Vergi no 10 haneli olmalıdır (yalnızca rakam)';
  return null;
}

function firmaAdimDogrula(adim: number, form: FirmaFormDegeri): string | null {
  if (adim === 0) {
    if (!kodGecerliMi(form.firmaKodu)) return 'Firma kodu zorunludur';
    if (!adGecerliMi(form.firmaAdi, 255)) return 'Firma adı zorunludur';
  }
  if (adim === 1 && !vergiNoGecerliMi(form.vergiNo)) {
    return 'Vergi no 10 haneli olmalıdır';
  }
  return null;
}

export function FirmaSekme({
  gomuluDuzenle,
}: {
  gomuluDuzenle?: GomuluDuzenleSecenek;
} = {}) {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayitlar, setKayitlar] = useState<AdminFirma[]>([]);
  const [form, setForm] = useState<FirmaFormDegeri>(bosFirmaForm);
  const [gorunum, setGorunum] = useState<TanimGorunumModu>(gomuluDuzenle ? 'duzenle' : 'liste');
  const [sihirbazAdim, setSihirbazAdim] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silModalAcik, setSilModalAcik] = useState(false);
  const [seciliId, setSeciliId] = useState<string | null>(gomuluDuzenle?.id ?? null);

  async function yukle() {
    setYukleniyor(true);
    try {
      setKayitlar(await firmalariGetir());
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Firmalar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }

  useEffect(() => {
    void yukle();
  }, []);

  const listeyeDon = useCallback(() => {
    if (gomuluDuzenle) {
      gomuluDuzenle.onKapat();
      return;
    }
    setGorunum('liste');
    setSeciliId(null);
    setForm(bosFirmaForm);
    setSihirbazAdim(0);
  }, [gomuluDuzenle]);

  const yeniBaslat = useCallback(() => {
    setSeciliId(null);
    setForm(bosFirmaForm);
    setSihirbazAdim(0);
    setGorunum('ekle');
  }, []);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (gorunum === 'duzenle' && seciliKayit) {
      const k = firmadanForm(seciliKayit);
      return (
        form.firmaKodu !== k.firmaKodu ||
        form.firmaAdi !== k.firmaAdi ||
        form.vergiDairesi !== k.vergiDairesi ||
        form.vergiNo !== k.vergiNo ||
        form.aktif !== k.aktif
      );
    }
    if (gorunum === 'ekle') {
      return form.firmaKodu.trim() !== '' || form.firmaAdi.trim() !== '';
    }
    return false;
  }, [gorunum, seciliKayit, form]);

  const kaydet = useCallback(async () => {
    const hata = firmaFormDogrula(form);
    if (hata) {
      hataBildir(hata);
      return;
    }
    const hedef = `«${form.firmaAdi.trim()}» (${form.firmaKodu.trim()}) firmasını`;
    setKaydediliyor(true);
    try {
      if (gorunum === 'duzenle' && seciliId) {
        await firmaGuncelle(seciliId, form);
        logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Firma', hedef));
        basariBildir('Firma güncellendi.');
      } else {
        await firmaOlustur(form);
        logMesajiAyarla(logMesaj.ekledi('Tanımlar — Firma', hedef));
        basariBildir('Firma eklendi. MERKEZ şube ve depo oluşturuldu.');
      }
      listeyeDon();
      if (!gomuluDuzenle) await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [form, gorunum, seciliId, listeyeDon, logMesajiAyarla, basariBildir, hataBildir, gomuluDuzenle]);

  const sil = useCallback(() => {
    if (gorunum === 'duzenle' && seciliId) setSilModalAcik(true);
  }, [gorunum, seciliId]);

  const silOnayla = useCallback(async () => {
    if (!seciliId) return;
    const silinen = seciliKayit;
    setSilModalAcik(false);
    setKaydediliyor(true);
    try {
      await firmaSil(seciliId);
      if (silinen) {
        logMesajiAyarla(
          logMesaj.sildi('Tanımlar — Firma', `«${silinen.firmaAdi}» (${silinen.firmaKodu}) firmasını`)
        );
      }
      basariBildir('Firma silindi.');
      listeyeDon();
      if (!gomuluDuzenle) await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, seciliKayit, listeyeDon, logMesajiAyarla, basariBildir, hataBildir, gomuluDuzenle]);

  useEffect(() => {
    if (!gomuluDuzenle || !seciliKayit) return;
    setForm(firmadanForm(seciliKayit));
  }, [gomuluDuzenle, seciliKayit]);

  useModulAksiyonlari(
    { kaydet, ekle: yeniBaslat, sil },
    {
      kaydet: gorunum === 'duzenle' && !kaydediliyor,
      ekle: gorunum === 'liste' && !gomuluDuzenle,
      sil: gorunum === 'duzenle' && !!seciliId && !kaydediliyor,
    },
    kirli
  );

  const temelAlanlar = (
    <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
      <TanimGirdi
        etiket="Firma Kodu"
        deger={form.firmaKodu}
        kural="kod"
        zorunlu
        onChange={(firmaKodu) => setForm({ ...form, firmaKodu })}
      />
      <TanimGirdi
        etiket="Firma Adı"
        deger={form.firmaAdi}
        kural="serbestMetin"
        maxLength={255}
        zorunlu
        onChange={(firmaAdi) => setForm({ ...form, firmaAdi })}
      />
    </div>
  );

  const vergiAlanlar = (
    <>
      <VergiDairesiSecici
        deger={form.vergiDairesi}
        onChange={(vergiDairesi) => setForm({ ...form, vergiDairesi })}
      />
      <TanimGirdi
        etiket="Vergi No"
        deger={form.vergiNo}
        kural="vergiNo"
        onChange={(vergiNo) => setForm({ ...form, vergiNo })}
      />
    </>
  );

  if (yukleniyor) return <TanimYukleniyor />;

  if (gorunum === 'ekle' && !gomuluDuzenle) {
    return (
      <>
        <TanimSihirbaz
          baslik="Yeni Firma Kurulumu"
          aktifAdim={sihirbazAdim}
          onAdimDegistir={setSihirbazAdim}
          onIptal={listeyeDon}
          onTamamla={() => void kaydet()}
          adimDogrula={(adim) => firmaAdimDogrula(adim, form)}
          onHata={hataBildir}
          tamamlaniyor={kaydediliyor}
          adimlar={[
            {
              baslik: 'Temel Bilgiler',
              aciklama: 'Firma kodu ve unvanını girin',
              icerik: temelAlanlar,
            },
            {
              baslik: 'Vergi Bilgileri',
              aciklama: 'Vergi dairesi ve numarasını girin',
              icerik: vergiAlanlar,
            },
            {
              baslik: 'Durum',
              aciklama: 'Firmanın aktif/pasif durumunu belirleyin',
              icerik: (
                <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm({ ...form, aktif })} />
              ),
            },
          ]}
        />
        <SilmeOnayModal
          acik={silModalAcik}
          onKapat={() => setSilModalAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu firmayı silmek istiyor musunuz?"
          hedefMetin=""
          ariaLabel="Firma silme onayı"
        />
      </>
    );
  }

  if (gorunum === 'duzenle' || gomuluDuzenle) {
    if (!seciliKayit) return <TanimYukleniyor />;
    return (
      <>
        <TanimDuzenleEkrani
          panel={gomuluDuzenle?.panel}
          ustEtiket="Firma Düzenle"
          baslik={seciliKayit.firmaAdi}
          onGeri={listeyeDon}
          onKaydet={() => void kaydet()}
          kaydediliyor={kaydediliyor}
        >
          <TanimFormBolum baslik="Temel Bilgiler">{temelAlanlar}</TanimFormBolum>
          <TanimFormBolum baslik="Vergi Bilgileri">{vergiAlanlar}</TanimFormBolum>
          <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm({ ...form, aktif })} />
        </TanimDuzenleEkrani>
        <SilmeOnayModal
          acik={silModalAcik}
          onKapat={() => setSilModalAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu firmayı silmek istiyor musunuz?"
          hedefMetin={`${seciliKayit.firmaAdi} (${seciliKayit.firmaKodu})`}
          ariaLabel="Firma silme onayı"
        />
      </>
    );
  }

  return (
    <>
      <TanimListeEkrani onYeniEkle={yeniBaslat} yeniEkleMetin="Yeni Firma">
        <TanimKayitTablosu
          baslik="Firmalar"
          kayitlar={kayitlar}
          aramaMetni={(k) => `${k.firmaKodu} ${k.firmaAdi} ${k.vergiNo}`}
          pasifMi={(k) => !k.aktif}
          onSatirTikla={(k) => {
            setSeciliId(k.id);
            setForm(firmadanForm(k));
            setGorunum('duzenle');
          }}
          kolonlar={[
            {
              id: 'kod',
              baslik: 'Kod',
              sinif: 'ap-tanimlar-tablo-kod',
              hucre: (k) => <span className="ap-tanimlar-tablo-kod">{k.firmaKodu}</span>,
            },
            { id: 'ad', baslik: 'Firma Adı', hucre: (k) => k.firmaAdi },
            { id: 'vergi', baslik: 'Vergi No', hucre: (k) => k.vergiNo || '—' },
            {
              id: 'durum',
              baslik: 'Durum',
              hucre: (k) => <TanimDurumRozeti aktif={k.aktif} />,
            },
            {
              id: 'guncelleme',
              baslik: 'Güncelleme',
              sinif: 'ap-tanimlar-tablo-tarih',
              hucre: (k) => tarihSaatFormatla(k.guncelleme),
            },
          ]}
        />
      </TanimListeEkrani>
      <SilmeOnayModal
        acik={silModalAcik}
        onKapat={() => setSilModalAcik(false)}
        onOnayla={() => void silOnayla()}
        baslik="Bu firmayı silmek istiyor musunuz?"
        hedefMetin={seciliKayit ? `${seciliKayit.firmaAdi} (${seciliKayit.firmaKodu})` : ''}
        ariaLabel="Firma silme onayı"
      />
    </>
  );
}
