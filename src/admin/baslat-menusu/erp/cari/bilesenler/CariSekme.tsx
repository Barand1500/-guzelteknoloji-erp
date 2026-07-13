import { useCallback, useEffect, useMemo, useState } from 'react';
import { cariFormDogrula } from '@/admin/baslat-menusu/erp/cari/alanKurallari';
import { cariGuncelle, cariSil, carileriGetir } from '@/admin/baslat-menusu/erp/cari/api';
import {
  CariEbelgeAlanlari,
  CariTemelAlanlar,
  CariVergiIletisimAlanlari,
} from '@/admin/baslat-menusu/erp/cari/bilesenler/cariFormAlanlari';
import { caridenForm } from '@/admin/baslat-menusu/erp/cari/cariYardimci';
import { bosCariForm, type AdminCari, type CariFormDegeri } from '@/admin/baslat-menusu/erp/cari/tipler';
import { useGomuluDuzenleFormYukle } from '@/admin/baslat-menusu/tanimlar/kancalar/useGomuluDuzenleForm';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import type { GomuluDuzenleSecenek } from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

function formlarEsit(a: CariFormDegeri, b: CariFormDegeri): boolean {
  return (Object.keys(a) as (keyof CariFormDegeri)[]).every((k) => a[k] === b[k]);
}

export function CariSekme({
  gomuluDuzenle,
}: {
  gomuluDuzenle?: GomuluDuzenleSecenek;
} = {}) {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { duzenlemeVar, silmeVar } = useYetkiler('cari');
  const [kayitlar, setKayitlar] = useState<AdminCari[]>([]);
  const [form, setForm] = useState<CariFormDegeri>(bosCariForm);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silModalAcik, setSilModalAcik] = useState(false);
  const [seciliId, setSeciliId] = useState<string | null>(gomuluDuzenle?.id ?? null);

  async function yukle() {
    setYukleniyor(true);
    try {
      setKayitlar(await carileriGetir());
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Cariler alınamadı');
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
    setSeciliId(null);
    setForm(bosCariForm);
  }, [gomuluDuzenle]);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (seciliKayit) {
      return !formlarEsit(form, caridenForm(seciliKayit));
    }
    return false;
  }, [seciliKayit, form]);

  const kaydet = useCallback(async () => {
    if (!duzenlemeVar) {
      hataBildir('Kayıt düzenleme yetkiniz yok');
      return;
    }
    const hata = cariFormDogrula(form);
    if (hata) {
      hataBildir(hata);
      return;
    }
    if (!seciliId) return;
    const hedef = `«${form.cariAdi.trim()}» (${form.cariKodu.trim()}) cari kartını`;
    setKaydediliyor(true);
    try {
      await cariGuncelle(seciliId, form);
      logMesajiAyarla(logMesaj.guncelledi('Cari Kartlar', hedef));
      basariBildir('Cari kart güncellendi.');
      listeyeDon();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [form, seciliId, listeyeDon, logMesajiAyarla, basariBildir, hataBildir, duzenlemeVar]);

  const sil = useCallback(() => {
    if (seciliId) setSilModalAcik(true);
  }, [seciliId]);

  const silOnayla = useCallback(async () => {
    if (!seciliId) return;
    const silinen = seciliKayit;
    setSilModalAcik(false);
    setKaydediliyor(true);
    try {
      await cariSil(seciliId);
      if (silinen) {
        logMesajiAyarla(
          logMesaj.sildi('Cari Kartlar', `«${silinen.cariAdi}» (${silinen.cariKodu}) cari kartını`)
        );
      }
      basariBildir('Cari kart silindi.');
      listeyeDon();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, seciliKayit, listeyeDon, logMesajiAyarla, basariBildir, hataBildir]);

  useGomuluDuzenleFormYukle(
    gomuluDuzenle,
    seciliKayit,
    useCallback(() => {
      if (seciliKayit) setForm(caridenForm(seciliKayit));
    }, [seciliKayit])
  );

  useModulAksiyonlari(
    { kaydet, sil },
    {
      kaydet: !!gomuluDuzenle && duzenlemeVar && !kaydediliyor,
      sil: !!gomuluDuzenle && !!seciliId && silmeVar && !kaydediliyor,
    },
    kirli
  );

  if (!gomuluDuzenle) return null;
  if (yukleniyor) return <TanimYukleniyor />;
  if (!seciliKayit) return <TanimYukleniyor />;

  return (
    <>
      <TanimDuzenleEkrani
        panel={gomuluDuzenle.panel}
        ustEtiket="Cari Düzenle"
        baslik={seciliKayit.cariAdi}
        onGeri={listeyeDon}
        onKaydet={duzenlemeVar ? () => void kaydet() : undefined}
        kaydediliyor={kaydediliyor}
        saltOkunur={!duzenlemeVar}
      >
        <TanimFormBolum baslik="Temel Bilgiler">
          <CariTemelAlanlar form={form} setForm={setForm} />
        </TanimFormBolum>
        <CariVergiIletisimAlanlari form={form} setForm={setForm} />
        <CariEbelgeAlanlari form={form} setForm={setForm} />
        <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm((f) => ({ ...f, aktif }))} />
      </TanimDuzenleEkrani>
      <SilmeOnayModal
        acik={silModalAcik}
        onKapat={() => setSilModalAcik(false)}
        onOnayla={() => void silOnayla()}
        baslik="Bu cari kartı silmek istiyor musunuz?"
        hedefMetin={`${seciliKayit.cariAdi} (${seciliKayit.cariKodu})`}
        ariaLabel="Cari silme onayı"
      />
    </>
  );
}
