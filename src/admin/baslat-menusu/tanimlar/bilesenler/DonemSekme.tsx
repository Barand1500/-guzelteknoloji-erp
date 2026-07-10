import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  donemGuncelle,
  donemOlustur,
  donemSil,
  donemleriGetir,
} from '@/admin/baslat-menusu/tanimlar/api';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { TanimKayitListesi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitListesi';
import {
  donemAdGecerliMi,
  kodGecerliMi,
} from '@/admin/baslat-menusu/tanimlar/alanKurallari';
import {
  bosDonemForm,
  type AdminDonem,
  type DonemFormDegeri,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

function donemFormDogrula(form: DonemFormDegeri): string | null {
  if (!kodGecerliMi(form.donemKodu)) return 'Dönem kodu zorunludur (en fazla 20 harf/rakam)';
  if (!donemAdGecerliMi(form.donemAdi)) return 'Dönem adı zorunludur (en fazla 100 karakter)';
  return null;
}

function donemdenForm(d: AdminDonem): DonemFormDegeri {
  return {
    donemKodu: d.donemKodu,
    donemAdi: d.donemAdi,
    aktif: d.aktif,
  };
}

export function DonemSekme() {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayitlar, setKayitlar] = useState<AdminDonem[]>([]);
  const [form, setForm] = useState<DonemFormDegeri>(bosDonemForm);
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silModalAcik, setSilModalAcik] = useState(false);

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

  const yeniBaslat = useCallback(() => {
    setSeciliId(null);
    setForm(bosDonemForm);
  }, []);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (seciliKayit) {
      const k = donemdenForm(seciliKayit);
      return (
        form.donemKodu !== k.donemKodu ||
        form.donemAdi !== k.donemAdi ||
        form.aktif !== k.aktif
      );
    }
    return form.donemKodu.trim() !== '' || form.donemAdi.trim() !== '';
  }, [seciliKayit, form]);

  const kaydet = useCallback(async () => {
    const dogrulama = donemFormDogrula(form);
    if (dogrulama) {
      hataBildir(dogrulama);
      return;
    }
    const hedef = `«${form.donemAdi.trim()}» (${form.donemKodu.trim()}) dönemini`;
    setKaydediliyor(true);
    try {
      if (seciliId) {
        await donemGuncelle(seciliId, form);
        logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Dönem', hedef));
        basariBildir('Dönem güncellendi.');
      } else {
        await donemOlustur(form);
        logMesajiAyarla(logMesaj.ekledi('Tanımlar — Dönem', hedef));
        basariBildir('Dönem eklendi.');
      }
      yeniBaslat();
      await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [form, seciliId, yeniBaslat, logMesajiAyarla, basariBildir, hataBildir]);

  const sil = useCallback(() => {
    if (seciliId) setSilModalAcik(true);
  }, [seciliId]);

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
      yeniBaslat();
      await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, seciliKayit, yeniBaslat, logMesajiAyarla, basariBildir, hataBildir]);

  useModulAksiyonlari(
    { kaydet, ekle: yeniBaslat, sil },
    { kaydet: !kaydediliyor, ekle: true, sil: !!seciliId && !kaydediliyor },
    kirli
  );

  if (yukleniyor) {
    return <p className="ap-muted text-sm">Yükleniyor...</p>;
  }

  return (
    <div className="ap-tanimlar-sekme-icerik">
      <div className="ap-kullanicilar-sayfa-grid">
        <TanimKayitListesi
          baslik="Dönemler"
          kayitlar={kayitlar}
          seciliId={seciliId}
          kodAlani={(k) => k.donemKodu}
          adAlani={(k) => k.donemAdi}
          aktifAlani={(k) => k.aktif}
          onSec={(k) => {
            setSeciliId(k.id);
            setForm(donemdenForm(k));
          }}
        />
        <div className="ap-editor-panel ap-kullanici-editor-panel">
          <div className="ap-editor-baslik">
            <h2 className="ap-heading text-base font-semibold">
              {seciliId ? 'Dönem Düzenle' : 'Yeni Dönem'}
            </h2>
          </div>
          <div className="ap-editor-icerik ap-kullanici-editor-icerik space-y-3">
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
            <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm({ ...form, aktif })} />
          </div>
        </div>
      </div>

      <SilmeOnayModal
        acik={silModalAcik}
        onKapat={() => setSilModalAcik(false)}
        onOnayla={() => void silOnayla()}
        baslik="Bu dönemi silmek istiyor musunuz?"
        hedefMetin={
          seciliKayit ? `${seciliKayit.donemAdi} (${seciliKayit.donemKodu})` : 'Seçili dönem'
        }
        ariaLabel="Dönem silme onayı"
      />
    </div>
  );
}
