import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  kasaGuncelle,
  kasaOlustur,
  kasaSil,
  kasalariGetir,
  subeleriGetir,
} from '@/admin/baslat-menusu/tanimlar/api';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { TanimKayitListesi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitListesi';
import { adGecerliMi, kodGecerliMi } from '@/admin/baslat-menusu/tanimlar/alanKurallari';
import {
  bosKasaForm,
  PARA_BIRIMLERI,
  type AdminKasa,
  type AdminSube,
  type KasaFormDegeri,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';

function kasaFormDogrula(form: KasaFormDegeri): string | null {
  if (!form.subeId) return 'Şube seçimi zorunludur';
  if (!kodGecerliMi(form.kasaKodu)) return 'Kasa kodu zorunludur (en fazla 20 harf/rakam)';
  if (!adGecerliMi(form.kasaAdi)) return 'Kasa adı zorunludur';
  if (!form.paraBirimi.trim()) return 'Para birimi zorunludur';
  return null;
}

function kasadanForm(k: AdminKasa): KasaFormDegeri {
  return {
    subeId: k.subeId,
    kasaKodu: k.kasaKodu,
    kasaAdi: k.kasaAdi,
    paraBirimi: k.paraBirimi,
    aktif: k.aktif,
  };
}

function formlarEsit(a: KasaFormDegeri, b: KasaFormDegeri): boolean {
  return (Object.keys(a) as (keyof KasaFormDegeri)[]).every((k) => a[k] === b[k]);
}

export function KasaSekme() {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayitlar, setKayitlar] = useState<AdminKasa[]>([]);
  const [subeler, setSubeler] = useState<AdminSube[]>([]);
  const [subeFiltre, setSubeFiltre] = useState('');
  const [form, setForm] = useState<KasaFormDegeri>(bosKasaForm);
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silModalAcik, setSilModalAcik] = useState(false);

  async function yukle() {
    setYukleniyor(true);
    try {
      const [kasalar, subeListesi] = await Promise.all([kasalariGetir(), subeleriGetir()]);
      setKayitlar(kasalar);
      setSubeler(subeListesi);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kasalar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }

  useEffect(() => {
    void yukle();
  }, []);

  const filtrelenmisKayitlar = useMemo(() => {
    if (!subeFiltre) return kayitlar;
    return kayitlar.filter((k) => k.subeId === subeFiltre);
  }, [kayitlar, subeFiltre]);

  const aktifSubeler = useMemo(() => subeler.filter((s) => s.aktif), [subeler]);

  const yeniBaslat = useCallback(() => {
    setSeciliId(null);
    setForm({
      ...bosKasaForm,
      subeId: subeFiltre || aktifSubeler[0]?.id || '',
    });
  }, [subeFiltre, aktifSubeler]);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (seciliKayit) return !formlarEsit(form, kasadanForm(seciliKayit));
    return form.kasaKodu.trim() !== '' || form.kasaAdi.trim() !== '';
  }, [seciliKayit, form]);

  const kaydet = useCallback(async () => {
    const dogrulama = kasaFormDogrula(form);
    if (dogrulama) {
      hataBildir(dogrulama);
      return;
    }
    const hedef = `«${form.kasaAdi.trim()}» (${form.kasaKodu.trim()}) kasasını`;
    setKaydediliyor(true);
    try {
      if (seciliId) {
        await kasaGuncelle(seciliId, form);
        logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Kasa', hedef));
        basariBildir('Kasa güncellendi.');
      } else {
        await kasaOlustur(form);
        logMesajiAyarla(logMesaj.ekledi('Tanımlar — Kasa', hedef));
        basariBildir('Kasa eklendi.');
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
      await kasaSil(seciliId);
      if (silinen) {
        logMesajiAyarla(
          logMesaj.sildi('Tanımlar — Kasa', `«${silinen.kasaAdi}» (${silinen.kasaKodu}) kasasını`)
        );
      }
      basariBildir('Kasa silindi.');
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
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <label className="block min-w-[200px]">
          <span className="ap-muted mb-1 block text-xs">Şube Filtresi</span>
          <FormAcilirSecim
            value={subeFiltre}
            onChange={setSubeFiltre}
            secenekler={[
              { value: '', label: 'Tüm şubeler' },
              ...subeler.map((s) => ({ value: s.id, label: `${s.subeKodu} — ${s.subeAdi}` })),
            ]}
          />
        </label>
      </div>

      <div className="ap-kullanicilar-sayfa-grid">
        <TanimKayitListesi
          baslik="Kasalar"
          kayitlar={filtrelenmisKayitlar}
          seciliId={seciliId}
          kodAlani={(k) => k.kasaKodu}
          adAlani={(k) => k.kasaAdi}
          aktifAlani={(k) => k.aktif}
          altMetin={(k) => {
            const sube = k.subeKodu && k.subeAdi ? `${k.subeKodu} — ${k.subeAdi}` : '';
            return [sube, k.paraBirimi].filter(Boolean).join(' · ') || undefined;
          }}
          onSec={(k) => {
            setSeciliId(k.id);
            setForm(kasadanForm(k));
          }}
        />
        <div className="ap-editor-panel ap-kullanici-editor-panel">
          <div className="ap-editor-baslik">
            <h2 className="ap-heading text-base font-semibold">
              {seciliId ? 'Kasa Düzenle' : 'Yeni Kasa'}
            </h2>
          </div>
          <div className="ap-editor-icerik ap-kullanici-editor-icerik space-y-3">
            <label className="block">
              <span className="ap-muted mb-1 block text-xs">Şube *</span>
              <FormAcilirSecim
                value={form.subeId}
                onChange={(subeId) => setForm({ ...form, subeId })}
                secenekler={aktifSubeler.map((s) => ({
                  value: s.id,
                  label: `${s.subeKodu} — ${s.subeAdi}`,
                }))}
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <TanimGirdi
                etiket="Kasa Kodu"
                deger={form.kasaKodu}
                kural="kod"
                zorunlu
                onChange={(kasaKodu) => setForm({ ...form, kasaKodu })}
              />
              <TanimGirdi
                etiket="Kasa Adı"
                deger={form.kasaAdi}
                kural="ad"
                zorunlu
                onChange={(kasaAdi) => setForm({ ...form, kasaAdi })}
              />
            </div>
            <label className="block">
              <span className="ap-muted mb-1 block text-xs">Para Birimi *</span>
              <FormAcilirSecim
                value={form.paraBirimi}
                onChange={(paraBirimi) => setForm({ ...form, paraBirimi })}
                secenekler={PARA_BIRIMLERI.map((pb) => ({ value: pb, label: pb }))}
              />
            </label>
            <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm({ ...form, aktif })} />
          </div>
        </div>
      </div>

      <SilmeOnayModal
        acik={silModalAcik}
        onKapat={() => setSilModalAcik(false)}
        onOnayla={() => void silOnayla()}
        baslik="Bu kasayı silmek istiyor musunuz?"
        hedefMetin={
          seciliKayit ? `${seciliKayit.kasaAdi} (${seciliKayit.kasaKodu})` : 'Seçili kasa'
        }
        ariaLabel="Kasa silme onayı"
      />
    </div>
  );
}
