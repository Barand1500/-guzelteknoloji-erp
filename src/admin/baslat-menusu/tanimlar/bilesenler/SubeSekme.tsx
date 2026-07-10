import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  subeGuncelle,
  subeOlustur,
  subeSil,
  subeleriGetir,
} from '@/admin/baslat-menusu/tanimlar/api';
import { OrtakAdresFormu } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakAdresFormu';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { TanimCalismaAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimCalismaAlani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimFormPanel } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormPanel';
import { TanimKayitListesi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitListesi';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import {
  bosSubeForm,
  type AdminSube,
  type SubeFormDegeri,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import {
  adGecerliMi,
  ebelgeSeriGecerliMi,
  kodGecerliMi,
  mersisGecerliMi,
  postaKoduGecerliMi,
} from '@/admin/baslat-menusu/tanimlar/alanKurallari';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { useTanimFirmaDurumu } from '@/admin/baslat-menusu/tanimlar/kancalar/useTanimFirmaDurumu';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

function subeFormDogrula(form: SubeFormDegeri): string | null {
  if (!kodGecerliMi(form.subeKodu)) return 'Şube kodu zorunludur (en fazla 20 harf/rakam)';
  if (!adGecerliMi(form.subeAdi)) return 'Şube adı zorunludur';
  if (!postaKoduGecerliMi(form.postaKodu)) return 'Posta kodu 5 haneli olmalıdır';
  if (!ebelgeSeriGecerliMi(form.efaturaSeri)) return 'e-Fatura seri 3 karakter olmalıdır (A-Z, 0-9)';
  if (!ebelgeSeriGecerliMi(form.earsivSeri)) return 'e-Arşiv seri 3 karakter olmalıdır (A-Z, 0-9)';
  if (!ebelgeSeriGecerliMi(form.eirsaliyeSeri)) return 'e-İrsaliye seri 3 karakter olmalıdır (A-Z, 0-9)';
  if (!mersisGecerliMi(form.mersis)) return 'MERSİS numarası 16 haneli olmalıdır';
  return null;
}

function subedenForm(s: AdminSube): SubeFormDegeri {
  return {
    subeKodu: s.subeKodu,
    subeAdi: s.subeAdi,
    il: s.il,
    ilce: s.ilce,
    mahalle: s.mahalle,
    cadde: s.cadde,
    sokak: s.sokak,
    bina: s.bina,
    no: s.no,
    postaKodu: s.postaKodu,
    efaturaSeri: s.efaturaSeri,
    earsivSeri: s.earsivSeri,
    eirsaliyeSeri: s.eirsaliyeSeri,
    mersis: s.mersis,
    ticaretSicil: s.ticaretSicil,
    aktif: s.aktif,
  };
}

function formlarEsit(a: SubeFormDegeri, b: SubeFormDegeri): boolean {
  return (Object.keys(a) as (keyof SubeFormDegeri)[]).every((k) => a[k] === b[k]);
}

export function SubeSekme() {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { firmaBagliPasifMi } = useTanimFirmaDurumu();
  const [kayitlar, setKayitlar] = useState<AdminSube[]>([]);
  const [form, setForm] = useState<SubeFormDegeri>(bosSubeForm);
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silModalAcik, setSilModalAcik] = useState(false);

  async function yukle() {
    setYukleniyor(true);
    try {
      setKayitlar(await subeleriGetir());
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Şubeler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }

  useEffect(() => {
    void yukle();
  }, []);

  const yeniBaslat = useCallback(() => {
    setSeciliId(null);
    setForm(bosSubeForm);
  }, []);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (seciliKayit) return !formlarEsit(form, subedenForm(seciliKayit));
    return form.subeKodu.trim() !== '' || form.subeAdi.trim() !== '';
  }, [seciliKayit, form]);

  const kaydet = useCallback(async () => {
    const dogrulama = subeFormDogrula(form);
    if (dogrulama) {
      hataBildir(dogrulama);
      return;
    }
    if (!form.subeKodu.trim() || !form.subeAdi.trim()) {
      hataBildir('Şube kodu ve adı zorunludur');
      return;
    }
    const hedef = `«${form.subeAdi.trim()}» (${form.subeKodu.trim()}) şubesini`;
    setKaydediliyor(true);
    try {
      if (seciliId) {
        await subeGuncelle(seciliId, form);
        logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Şube', hedef));
        basariBildir('Şube güncellendi.');
      } else {
        await subeOlustur(form);
        logMesajiAyarla(logMesaj.ekledi('Tanımlar — Şube', hedef));
        basariBildir('Şube eklendi.');
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
      await subeSil(seciliId);
      if (silinen) {
        logMesajiAyarla(
          logMesaj.sildi('Tanımlar — Şube', `«${silinen.subeAdi}» (${silinen.subeKodu}) şubesini`)
        );
      }
      basariBildir('Şube silindi.');
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
    return <TanimYukleniyor />;
  }

  return (
    <div className="ap-tanimlar-sekme-icerik">
      <TanimCalismaAlani>
        <TanimKayitListesi
          baslik="Şubeler"
          kayitlar={kayitlar}
          seciliId={seciliId}
          kodAlani={(k) => k.subeKodu}
          adAlani={(k) => k.subeAdi}
          pasifAlani={(k) => firmaBagliPasifMi(k.aktif, k.firmaId)}
          altMetin={(k) => [k.il, k.ilce].filter(Boolean).join(' / ') || undefined}
          onSec={(k) => {
            setSeciliId(k.id);
            setForm(subedenForm(k));
          }}
        />
        <TanimFormPanel
          baslik={seciliId ? 'Şube Düzenle' : 'Yeni Şube'}
          duzenleme={!!seciliId}
          icKaydirma={false}
        >
          <TanimFormBolum baslik="Temel Bilgiler">
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
              <TanimGirdi
                etiket="Şube Kodu"
                deger={form.subeKodu}
                kural="kod"
                zorunlu
                onChange={(subeKodu) => setForm({ ...form, subeKodu })}
              />
              <TanimGirdi
                etiket="Şube Adı"
                deger={form.subeAdi}
                kural="ad"
                zorunlu
                onChange={(subeAdi) => setForm({ ...form, subeAdi })}
              />
            </div>
          </TanimFormBolum>

          <OrtakAdresFormu deger={form} onChange={(adres) => setForm({ ...form, ...adres })} />

          <TanimFormBolum baslik="E-Belge Serileri">
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--3">
              <TanimGirdi
                etiket="e-Fatura Seri"
                deger={form.efaturaSeri}
                kural="ebelgeSeri"
                onChange={(efaturaSeri) => setForm({ ...form, efaturaSeri })}
              />
              <TanimGirdi
                etiket="e-Arşiv Seri"
                deger={form.earsivSeri}
                kural="ebelgeSeri"
                onChange={(earsivSeri) => setForm({ ...form, earsivSeri })}
              />
              <TanimGirdi
                etiket="e-İrsaliye Seri"
                deger={form.eirsaliyeSeri}
                kural="ebelgeSeri"
                onChange={(eirsaliyeSeri) => setForm({ ...form, eirsaliyeSeri })}
              />
            </div>
          </TanimFormBolum>

          <TanimFormBolum baslik="Ticari Bilgiler">
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
              <TanimGirdi
                etiket="MERSİS No"
                deger={form.mersis}
                kural="mersis"
                onChange={(mersis) => setForm({ ...form, mersis })}
              />
              <TanimGirdi
                etiket="Ticaret Sicil No"
                deger={form.ticaretSicil}
                kural="ticaretSicil"
                onChange={(ticaretSicil) => setForm({ ...form, ticaretSicil })}
              />
            </div>
          </TanimFormBolum>

          <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm({ ...form, aktif })} />
        </TanimFormPanel>
      </TanimCalismaAlani>

      <SilmeOnayModal
        acik={silModalAcik}
        onKapat={() => setSilModalAcik(false)}
        onOnayla={() => void silOnayla()}
        baslik="Bu şubeyi silmek istiyor musunuz?"
        hedefMetin={
          seciliKayit ? `${seciliKayit.subeAdi} (${seciliKayit.subeKodu})` : 'Seçili şube'
        }
        ariaLabel="Şube silme onayı"
      />
    </div>
  );
}
