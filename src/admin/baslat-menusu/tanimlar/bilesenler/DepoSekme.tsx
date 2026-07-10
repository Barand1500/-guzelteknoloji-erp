import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  depoGuncelle,
  depoOlustur,
  depoSil,
  depolariGetir,
  subeleriGetir,
} from '@/admin/baslat-menusu/tanimlar/api';
import { OrtakAdresFormu } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakAdresFormu';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { TanimKayitListesi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitListesi';
import {
  adGecerliMi,
  kodGecerliMi,
  postaKoduGecerliMi,
} from '@/admin/baslat-menusu/tanimlar/alanKurallari';
import {
  bosDepoForm,
  type AdminDepo,
  type AdminSube,
  type DepoFormDegeri,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';

function depoFormDogrula(form: DepoFormDegeri): string | null {
  if (!form.subeId) return 'Şube seçimi zorunludur';
  if (!kodGecerliMi(form.depoKodu)) return 'Depo kodu zorunludur (en fazla 20 harf/rakam)';
  if (!adGecerliMi(form.depoAdi)) return 'Depo adı zorunludur';
  if (!postaKoduGecerliMi(form.postaKodu)) return 'Posta kodu 5 haneli olmalıdır';
  return null;
}

function depodanForm(d: AdminDepo): DepoFormDegeri {
  return {
    subeId: d.subeId,
    depoKodu: d.depoKodu,
    depoAdi: d.depoAdi,
    il: d.il,
    ilce: d.ilce,
    mahalle: d.mahalle,
    cadde: d.cadde,
    sokak: d.sokak,
    bina: d.bina,
    no: d.no,
    postaKodu: d.postaKodu,
    aktif: d.aktif,
  };
}

function formlarEsit(a: DepoFormDegeri, b: DepoFormDegeri): boolean {
  return (Object.keys(a) as (keyof DepoFormDegeri)[]).every((k) => a[k] === b[k]);
}

export function DepoSekme() {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayitlar, setKayitlar] = useState<AdminDepo[]>([]);
  const [subeler, setSubeler] = useState<AdminSube[]>([]);
  const [subeFiltre, setSubeFiltre] = useState('');
  const [form, setForm] = useState<DepoFormDegeri>(bosDepoForm);
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silModalAcik, setSilModalAcik] = useState(false);

  async function yukle() {
    setYukleniyor(true);
    try {
      const [depolar, subeListesi] = await Promise.all([depolariGetir(), subeleriGetir()]);
      setKayitlar(depolar);
      setSubeler(subeListesi);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Depolar alınamadı');
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
      ...bosDepoForm,
      subeId: subeFiltre || aktifSubeler[0]?.id || '',
    });
  }, [subeFiltre, aktifSubeler]);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (seciliKayit) return !formlarEsit(form, depodanForm(seciliKayit));
    return form.depoKodu.trim() !== '' || form.depoAdi.trim() !== '';
  }, [seciliKayit, form]);

  const kaydet = useCallback(async () => {
    const dogrulama = depoFormDogrula(form);
    if (dogrulama) {
      hataBildir(dogrulama);
      return;
    }
    const hedef = `«${form.depoAdi.trim()}» (${form.depoKodu.trim()}) deposunu`;
    setKaydediliyor(true);
    try {
      if (seciliId) {
        await depoGuncelle(seciliId, form);
        logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Depo', hedef));
        basariBildir('Depo güncellendi.');
      } else {
        await depoOlustur(form);
        logMesajiAyarla(logMesaj.ekledi('Tanımlar — Depo', hedef));
        basariBildir('Depo eklendi.');
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
      await depoSil(seciliId);
      if (silinen) {
        logMesajiAyarla(
          logMesaj.sildi('Tanımlar — Depo', `«${silinen.depoAdi}» (${silinen.depoKodu}) deposunu`)
        );
      }
      basariBildir('Depo silindi.');
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
          baslik="Depolar"
          kayitlar={filtrelenmisKayitlar}
          seciliId={seciliId}
          kodAlani={(k) => k.depoKodu}
          adAlani={(k) => k.depoAdi}
          aktifAlani={(k) => k.aktif}
          altMetin={(k) =>
            k.subeKodu && k.subeAdi ? `${k.subeKodu} — ${k.subeAdi}` : undefined
          }
          onSec={(k) => {
            setSeciliId(k.id);
            setForm(depodanForm(k));
          }}
        />
        <div className="ap-editor-panel ap-kullanici-editor-panel">
          <div className="ap-editor-baslik">
            <h2 className="ap-heading text-base font-semibold">
              {seciliId ? 'Depo Düzenle' : 'Yeni Depo'}
            </h2>
          </div>
          <div className="ap-editor-icerik ap-kullanici-editor-icerik space-y-4">
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
                etiket="Depo Kodu"
                deger={form.depoKodu}
                kural="kod"
                zorunlu
                onChange={(depoKodu) => setForm({ ...form, depoKodu })}
              />
              <TanimGirdi
                etiket="Depo Adı"
                deger={form.depoAdi}
                kural="ad"
                zorunlu
                onChange={(depoAdi) => setForm({ ...form, depoAdi })}
              />
            </div>

            <OrtakAdresFormu
              deger={form}
              onChange={(adres) => setForm({ ...form, ...adres })}
            />

            <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm({ ...form, aktif })} />
          </div>
        </div>
      </div>

      <SilmeOnayModal
        acik={silModalAcik}
        onKapat={() => setSilModalAcik(false)}
        onOnayla={() => void silOnayla()}
        baslik="Bu depoyu silmek istiyor musunuz?"
        hedefMetin={
          seciliKayit ? `${seciliKayit.depoAdi} (${seciliKayit.depoKodu})` : 'Seçili depo'
        }
        ariaLabel="Depo silme onayı"
      />
    </div>
  );
}
