import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  donemGuncelle,
  donemOlustur,
  donemSil,
  donemleriGetir,
} from '@/admin/baslat-menusu/tanimlar/api';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import {
  TanimDurumRozeti,
  TanimKayitTablosu,
} from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitTablosu';
import { TanimListeEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimListeEkrani';
import { TanimSihirbaz } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimSihirbaz';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { donemAdGecerliMi, kodGecerliMi } from '@/admin/baslat-menusu/tanimlar/alanKurallari';
import {
  bosDonemForm,
  type AdminDonem,
  type DonemFormDegeri,
  type GomuluDuzenleSecenek,
  type TanimGorunumModu,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useTanimFirmaDurumu } from '@/admin/baslat-menusu/tanimlar/kancalar/useTanimFirmaDurumu';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

function donemFormDogrula(form: DonemFormDegeri): string | null {
  if (!kodGecerliMi(form.donemKodu)) return 'Dönem kodu zorunludur (en fazla 20 harf/rakam)';
  if (!donemAdGecerliMi(form.donemAdi)) return 'Dönem adı zorunludur (en fazla 100 karakter)';
  return null;
}

function donemdenForm(d: AdminDonem): DonemFormDegeri {
  return { donemKodu: d.donemKodu, donemAdi: d.donemAdi, aktif: d.aktif };
}

export function DonemSekme({
  gomuluDuzenle,
}: {
  gomuluDuzenle?: GomuluDuzenleSecenek;
} = {}) {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { firmaBagliPasifMi } = useTanimFirmaDurumu();
  const [kayitlar, setKayitlar] = useState<AdminDonem[]>([]);
  const [form, setForm] = useState<DonemFormDegeri>(bosDonemForm);
  const [gorunum, setGorunum] = useState<TanimGorunumModu>(gomuluDuzenle ? 'duzenle' : 'liste');
  const [sihirbazAdim, setSihirbazAdim] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silModalAcik, setSilModalAcik] = useState(false);
  const [seciliId, setSeciliId] = useState<string | null>(gomuluDuzenle?.id ?? null);

  async function yukle() {
    setYukleniyor(true);
    try {
      setKayitlar(await donemleriGetir());
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Dönemler alınamadı');
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
    setForm(bosDonemForm);
    setSihirbazAdim(0);
  }, [gomuluDuzenle]);

  const yeniBaslat = useCallback(() => {
    setSeciliId(null);
    setForm(bosDonemForm);
    setSihirbazAdim(0);
    setGorunum('ekle');
  }, []);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (gorunum === 'duzenle' && seciliKayit) {
      const k = donemdenForm(seciliKayit);
      return form.donemKodu !== k.donemKodu || form.donemAdi !== k.donemAdi || form.aktif !== k.aktif;
    }
    if (gorunum === 'ekle') return form.donemKodu.trim() !== '' || form.donemAdi.trim() !== '';
    return false;
  }, [gorunum, seciliKayit, form]);

  const kaydet = useCallback(async () => {
    const dogrulama = donemFormDogrula(form);
    if (dogrulama) {
      hataBildir(dogrulama);
      return;
    }
    const hedef = `«${form.donemAdi.trim()}» (${form.donemKodu.trim()}) dönemini`;
    setKaydediliyor(true);
    try {
      if (gorunum === 'duzenle' && seciliId) {
        await donemGuncelle(seciliId, form);
        logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Dönem', hedef));
        basariBildir('Dönem güncellendi.');
      } else {
        await donemOlustur(form);
        logMesajiAyarla(logMesaj.ekledi('Tanımlar — Dönem', hedef));
        basariBildir('Dönem eklendi.');
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
      await donemSil(seciliId);
      if (silinen) {
        logMesajiAyarla(
          logMesaj.sildi('Tanımlar — Dönem', `«${silinen.donemAdi}» (${silinen.donemKodu}) dönemini`)
        );
      }
      basariBildir('Dönem silindi.');
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
    setForm(donemdenForm(seciliKayit));
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

  const bilgiAlanlar = (
    <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
      <TanimGirdi
        etiket="Dönem Kodu"
        deger={form.donemKodu}
        kural="kod"
        zorunlu
        onChange={(donemKodu) => setForm({ ...form, donemKodu })}
      />
      <TanimGirdi
        etiket="Dönem Adı"
        deger={form.donemAdi}
        kural="serbestMetin"
        maxLength={100}
        zorunlu
        onChange={(donemAdi) => setForm({ ...form, donemAdi })}
      />
    </div>
  );

  if (yukleniyor) return <TanimYukleniyor />;

  if (gorunum === 'ekle' && !gomuluDuzenle) {
    return (
      <TanimSihirbaz
        baslik="Yeni Dönem Kurulumu"
        aktifAdim={sihirbazAdim}
        onAdimDegistir={setSihirbazAdim}
        onIptal={listeyeDon}
        onTamamla={() => void kaydet()}
        adimDogrula={(adim) => (adim === 0 ? donemFormDogrula(form) : null)}
        onHata={hataBildir}
        tamamlaniyor={kaydediliyor}
        adimlar={[
          { baslik: 'Dönem Bilgileri', aciklama: 'Kod ve adı girin', icerik: bilgiAlanlar },
          {
            baslik: 'Durum',
            aciklama: 'Dönemin aktif/pasif durumunu belirleyin',
            icerik: <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm({ ...form, aktif })} />,
          },
        ]}
      />
    );
  }

  if (gorunum === 'duzenle' || gomuluDuzenle) {
    if (!seciliKayit) return <TanimYukleniyor />;
    return (
      <>
        <TanimDuzenleEkrani
          panel={gomuluDuzenle?.panel}
          ustEtiket="Dönem düzenle"
          kod={seciliKayit.donemKodu}
          baslik={seciliKayit.donemAdi}
          olusturma={seciliKayit.olusturma}
          guncelleme={seciliKayit.guncelleme}
          onGeri={listeyeDon}
          onKaydet={() => void kaydet()}
          kaydediliyor={kaydediliyor}
        >
          {bilgiAlanlar}
          <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm({ ...form, aktif })} />
        </TanimDuzenleEkrani>
        <SilmeOnayModal
          acik={silModalAcik}
          onKapat={() => setSilModalAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu dönemi silmek istiyor musunuz?"
          hedefMetin={`${seciliKayit.donemAdi} (${seciliKayit.donemKodu})`}
          ariaLabel="Dönem silme onayı"
        />
      </>
    );
  }

  return (
    <>
      <TanimListeEkrani onYeniEkle={yeniBaslat} yeniEkleMetin="Yeni Dönem">
        <TanimKayitTablosu
          baslik="Dönemler"
          kayitlar={kayitlar}
          aramaMetni={(k) => `${k.donemKodu} ${k.donemAdi}`}
          pasifMi={(k) => firmaBagliPasifMi(k.aktif, k.firmaId)}
          onSatirTikla={(k) => {
            setSeciliId(k.id);
            setForm(donemdenForm(k));
            setGorunum('duzenle');
          }}
          kolonlar={[
            {
              id: 'kod',
              baslik: 'Kod',
              hucre: (k) => <span className="ap-tanimlar-tablo-kod">{k.donemKodu}</span>,
            },
            { id: 'ad', baslik: 'Dönem Adı', hucre: (k) => k.donemAdi },
            { id: 'durum', baslik: 'Durum', hucre: (k) => <TanimDurumRozeti aktif={k.aktif} /> },
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
        baslik="Bu dönemi silmek istiyor musunuz?"
        hedefMetin=""
        ariaLabel="Dönem silme onayı"
      />
    </>
  );
}
