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
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { TanimKayitListesi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitListesi';
import { VergiDairesiSecici } from '@/admin/baslat-menusu/tanimlar/bilesenler/VergiDairesiSecici';
import {
  bosFirmaForm,
  type AdminFirma,
  type FirmaFormDegeri,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
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

export function FirmaSekme() {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayitlar, setKayitlar] = useState<AdminFirma[]>([]);
  const [form, setForm] = useState<FirmaFormDegeri>(bosFirmaForm);
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silModalAcik, setSilModalAcik] = useState(false);

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

  const yeniBaslat = useCallback(() => {
    setSeciliId(null);
    setForm(bosFirmaForm);
  }, []);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (seciliKayit) {
      const k = firmadanForm(seciliKayit);
      return (
        form.firmaKodu !== k.firmaKodu ||
        form.firmaAdi !== k.firmaAdi ||
        form.vergiDairesi !== k.vergiDairesi ||
        form.vergiNo !== k.vergiNo ||
        form.aktif !== k.aktif
      );
    }
    return form.firmaKodu.trim() !== '' || form.firmaAdi.trim() !== '';
  }, [seciliKayit, form]);

  const kaydet = useCallback(async () => {
    const hata = firmaFormDogrula(form);
    if (hata) {
      hataBildir(hata);
      return;
    }
    const hedef = `«${form.firmaAdi.trim()}» (${form.firmaKodu.trim()}) firmasını`;
    setKaydediliyor(true);
    try {
      if (seciliId) {
        await firmaGuncelle(seciliId, form);
        logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Firma', hedef));
        basariBildir('Firma güncellendi.');
      } else {
        await firmaOlustur(form);
        logMesajiAyarla(logMesaj.ekledi('Tanımlar — Firma', hedef));
        basariBildir('Firma eklendi. MERKEZ şube ve depo oluşturuldu.');
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
      await firmaSil(seciliId);
      if (silinen) {
        logMesajiAyarla(
          logMesaj.sildi('Tanımlar — Firma', `«${silinen.firmaAdi}» (${silinen.firmaKodu}) firmasını`)
        );
      }
      basariBildir('Firma silindi.');
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
          baslik="Firmalar"
          kayitlar={kayitlar}
          seciliId={seciliId}
          kodAlani={(k) => k.firmaKodu}
          adAlani={(k) => k.firmaAdi}
          aktifAlani={(k) => k.aktif}
          onSec={(k) => {
            setSeciliId(k.id);
            setForm(firmadanForm(k));
          }}
        />
        <div className="ap-editor-panel ap-kullanici-editor-panel">
          <div className="ap-editor-baslik">
            <h2 className="ap-heading text-base font-semibold">
              {seciliId ? 'Firma Düzenle' : 'Yeni Firma'}
            </h2>
          </div>
          <div className="ap-editor-icerik ap-kullanici-editor-icerik space-y-3">
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
            <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm({ ...form, aktif })} />
          </div>
        </div>
      </div>

      <SilmeOnayModal
        acik={silModalAcik}
        onKapat={() => setSilModalAcik(false)}
        onOnayla={() => void silOnayla()}
        baslik="Bu firmayı silmek istiyor musunuz?"
        hedefMetin={
          seciliKayit ? `${seciliKayit.firmaAdi} (${seciliKayit.firmaKodu})` : 'Seçili firma'
        }
        ariaLabel="Firma silme onayı"
      />
    </div>
  );
}
