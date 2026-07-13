import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGomuluDuzenleFormYukle } from '@/admin/baslat-menusu/tanimlar/kancalar/useGomuluDuzenleForm';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import type { GomuluDuzenleSecenek, TanimGorunumModu } from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { birimGuncelle, birimOlustur, birimSil, birimleriGetir, urunleriGetir } from './api';
import { KdvDahilAlani, SayiGirdi } from './SayiGirdi';
import {
  bosBirimForm,
  type AdminBirim,
  type AdminUrun,
  type BirimForm,
} from './tipler';

const birimdenForm = (b: AdminBirim): BirimForm => ({
  urunId: b.urunId,
  fiyatAdi: b.fiyatAdi,
  birimAdi: b.birimAdi,
  carpan: b.carpan,
  barkod: b.barkod,
  alisKdv: b.alisKdv,
  satisKdv: b.satisKdv,
  alisFiyati: b.alisFiyati,
  satisFiyati: b.satisFiyati,
  kdvDahil: b.kdvDahil,
  aktif: b.aktif,
});

function formlarEsit(a: BirimForm, b: BirimForm): boolean {
  return (Object.keys(a) as (keyof BirimForm)[]).every((k) => a[k] === b[k]);
}

export function BirimSekme({
  gomuluDuzenle,
  baslangicGorunum,
  onListeyeDon,
}: {
  gomuluDuzenle?: GomuluDuzenleSecenek;
  baslangicGorunum?: Extract<TanimGorunumModu, 'ekle'>;
  onListeyeDon?: () => void;
} = {}) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar, silmeVar } = useYetkiler();
  const [kayitlar, setKayitlar] = useState<AdminBirim[]>([]);
  const [urunler, setUrunler] = useState<AdminUrun[]>([]);
  const [form, setForm] = useState<BirimForm>(bosBirimForm);
  const [gorunum, setGorunum] = useState<TanimGorunumModu>(
    gomuluDuzenle ? 'duzenle' : (baslangicGorunum ?? 'liste')
  );
  const [seciliId, setSeciliId] = useState<string | null>(gomuluDuzenle?.id ?? null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silAcik, setSilAcik] = useState(false);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const [birimKayitlari, urunKayitlari] = await Promise.all([birimleriGetir(), urunleriGetir()]);
      setKayitlar(birimKayitlari);
      setUrunler(urunKayitlari);
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Birimler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const listeyeDon = useCallback(() => {
    if (gomuluDuzenle) {
      gomuluDuzenle.onKapat();
      return;
    }
    if (onListeyeDon) {
      onListeyeDon();
      return;
    }
    setGorunum('liste');
    setSeciliId(null);
    setForm(bosBirimForm);
  }, [gomuluDuzenle, onListeyeDon]);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (gorunum === 'duzenle' && seciliKayit) {
      return !formlarEsit(form, birimdenForm(seciliKayit));
    }
    if (gorunum === 'ekle') {
      return (
        form.urunId.trim() !== '' ||
        form.fiyatAdi.trim() !== bosBirimForm.fiyatAdi ||
        form.birimAdi.trim() !== bosBirimForm.birimAdi ||
        form.barkod.trim() !== '' ||
        form.carpan !== bosBirimForm.carpan ||
        form.alisKdv !== bosBirimForm.alisKdv ||
        form.satisKdv !== bosBirimForm.satisKdv ||
        form.alisFiyati !== 0 ||
        form.satisFiyati !== 0 ||
        form.kdvDahil !== bosBirimForm.kdvDahil
      );
    }
    return false;
  }, [form, gorunum, seciliKayit]);

  const dogrula = useCallback(() => {
    if (!form.urunId) return 'Ürün seçimi zorunludur';
    if (!form.fiyatAdi.trim()) return 'Fiyat adı zorunludur';
    if (!form.birimAdi.trim()) return 'Birim adı zorunludur';
    if (form.carpan <= 0) return 'Çarpan sıfırdan büyük olmalıdır';
    return null;
  }, [form]);

  const kaydet = useCallback(async () => {
    if (gorunum === 'duzenle' && !duzenlemeVar) {
      hataBildir('Kayıt düzenleme yetkiniz yok');
      return;
    }
    if (gorunum === 'ekle' && !eklemeVar) {
      hataBildir('Yeni kayıt ekleme yetkiniz yok');
      return;
    }
    const hata = dogrula();
    if (hata) {
      hataBildir(hata);
      return;
    }
    const aktif = gorunum === 'duzenle' && seciliKayit ? seciliKayit.aktif : true;
    setKaydediliyor(true);
    try {
      if (gorunum === 'duzenle' && seciliId) {
        await birimGuncelle(seciliId, { ...form, aktif });
        basariBildir('Birim güncellendi.');
      } else {
        await birimOlustur({ ...form, aktif: true });
        basariBildir('Birim eklendi.');
      }
      listeyeDon();
      if (!gomuluDuzenle) await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [
    basariBildir,
    dogrula,
    duzenlemeVar,
    eklemeVar,
    form,
    gorunum,
    gomuluDuzenle,
    hataBildir,
    listeyeDon,
    seciliId,
    seciliKayit,
    yukle,
  ]);

  const sil = useCallback(() => {
    if (gorunum === 'duzenle' && seciliId) setSilAcik(true);
  }, [gorunum, seciliId]);

  const silOnayla = useCallback(async () => {
    if (!seciliId) return;
    setSilAcik(false);
    setKaydediliyor(true);
    try {
      await birimSil(seciliId);
      basariBildir('Birim silindi.');
      listeyeDon();
      if (!gomuluDuzenle) await yukle();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Silme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [basariBildir, gomuluDuzenle, hataBildir, listeyeDon, seciliId, yukle]);

  useGomuluDuzenleFormYukle(
    gomuluDuzenle,
    seciliKayit,
    useCallback(() => {
      if (seciliKayit) setForm(birimdenForm(seciliKayit));
    }, [seciliKayit])
  );

  useModulAksiyonlari(
    { kaydet, sil },
    {
      kaydet:
        ((gorunum === 'ekle' && eklemeVar) || (gorunum === 'duzenle' && duzenlemeVar)) &&
        !kaydediliyor,
      sil: gorunum === 'duzenle' && !!seciliId && silmeVar && !kaydediliyor && !gomuluDuzenle,
    },
    kirli
  );

  const urunSecenekleri = useMemo(
    () => urunler.map((u) => ({ value: u.id, label: `${u.urunKodu} — ${u.urunAdi}` })),
    [urunler]
  );

  const formAlanlari = (
    <>
      <TanimFormBolum baslik="Birim Bilgileri">
        <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
          <label className="ap-tanimlar-secim-alan block">
            <span className="ap-tanim-girdi-etiket">Ürün *</span>
            <FormAcilirSecim
              value={form.urunId}
              onChange={(urunId) => setForm((f) => ({ ...f, urunId }))}
              secenekler={urunSecenekleri}
            />
          </label>
          <TanimGirdi
            etiket="Fiyat Adı"
            deger={form.fiyatAdi}
            maxLength={50}
            zorunlu
            onChange={(fiyatAdi) => setForm((f) => ({ ...f, fiyatAdi }))}
          />
        </div>
        <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
          <TanimGirdi
            etiket="Birim Adı"
            deger={form.birimAdi}
            maxLength={20}
            zorunlu
            onChange={(birimAdi) => setForm((f) => ({ ...f, birimAdi }))}
          />
          <TanimGirdi
            etiket="Barkod"
            deger={form.barkod}
            maxLength={50}
            onChange={(barkod) => setForm((f) => ({ ...f, barkod }))}
          />
          <SayiGirdi
            etiket="Çarpan"
            deger={form.carpan}
            adim="0.0001"
            onChange={(carpan) => setForm((f) => ({ ...f, carpan }))}
          />
        </div>
      </TanimFormBolum>
      <TanimFormBolum baslik="Fiyat ve Vergi">
        <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
          <SayiGirdi
            etiket="Alış KDV (%)"
            deger={form.alisKdv}
            onChange={(alisKdv) => setForm((f) => ({ ...f, alisKdv }))}
          />
          <SayiGirdi
            etiket="Satış KDV (%)"
            deger={form.satisKdv}
            onChange={(satisKdv) => setForm((f) => ({ ...f, satisKdv }))}
          />
          <SayiGirdi
            etiket="Alış Fiyatı"
            deger={form.alisFiyati}
            adim="0.0001"
            onChange={(alisFiyati) => setForm((f) => ({ ...f, alisFiyati }))}
          />
          <SayiGirdi
            etiket="Satış Fiyatı"
            deger={form.satisFiyati}
            adim="0.0001"
            onChange={(satisFiyati) => setForm((f) => ({ ...f, satisFiyati }))}
          />
        </div>
        <KdvDahilAlani
          kdvDahil={form.kdvDahil}
          onChange={(kdvDahil) => setForm((f) => ({ ...f, kdvDahil }))}
        />
      </TanimFormBolum>
    </>
  );

  if (yukleniyor && (gomuluDuzenle || gorunum === 'duzenle')) {
    return <TanimYukleniyor />;
  }

  if (gorunum === 'ekle') {
    return (
      <>
        <TanimDuzenleEkrani
          ustEtiket="Yeni Birim"
          baslik="Yeni Birim / Fiyat Kartı"
          onGeri={listeyeDon}
          saltOkunur={!eklemeVar}
        >
          {formAlanlari}
        </TanimDuzenleEkrani>
        <SilmeOnayModal
          acik={silAcik}
          onKapat={() => setSilAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu birimi silmek istiyor musunuz?"
          hedefMetin=""
          ariaLabel="Birim silme onayı"
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
          ustEtiket="Birim Düzenle"
          baslik={`${seciliKayit.urunKodu} — ${seciliKayit.birimAdi}`}
          olusturma={seciliKayit.olusturma}
          guncelleme={seciliKayit.guncelleme}
          onGeri={listeyeDon}
          onKaydet={duzenlemeVar ? () => void kaydet() : undefined}
          kaydediliyor={kaydediliyor}
          saltOkunur={!duzenlemeVar}
        >
          {formAlanlari}
        </TanimDuzenleEkrani>
        <SilmeOnayModal
          acik={silAcik}
          onKapat={() => setSilAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu birimi silmek istiyor musunuz?"
          hedefMetin={`${seciliKayit.urunAdi} — ${seciliKayit.birimAdi}`}
          ariaLabel="Birim silme onayı"
        />
      </>
    );
  }

  return null;
}
