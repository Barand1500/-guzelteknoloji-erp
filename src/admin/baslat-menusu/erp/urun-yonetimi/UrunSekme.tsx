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
import { birimleriGetir, urunGuncelle, urunOlustur, urunSil, urunleriGetir } from './api';
import {
  bosUrunForm,
  URUN_NEVILERI,
  URUN_TIPLERI,
  type AdminBirim,
  type AdminUrun,
  type UrunForm,
} from './tipler';

const urundenForm = (u: AdminUrun): UrunForm => ({
  ustId: u.ustId,
  urunTipi: u.urunTipi,
  urunNevi: u.urunNevi,
  urunKodu: u.urunKodu,
  marka: u.marka,
  urunAdi: u.urunAdi,
  anaBirim: u.anaBirim,
  varsayilanBirim: u.varsayilanBirim,
  mensei: u.mensei,
});

function formlarEsit(a: UrunForm, b: UrunForm): boolean {
  return (Object.keys(a) as (keyof UrunForm)[]).every((k) => a[k] === b[k]);
}

function birimAdiSecenekleri(birimler: AdminBirim[], urunId?: string) {
  const kaynak = urunId
    ? birimler.filter((b) => b.aktif && b.urunId === urunId)
    : birimler.filter((b) => b.aktif);
  const tumu = kaynak.length > 0 ? kaynak : birimler.filter((b) => b.aktif);
  const benzersiz = [...new Set(tumu.map((b) => b.birimAdi).filter(Boolean))].sort();
  return [
    { value: '', label: 'Seçilmedi' },
    ...benzersiz.map((birimAdi) => ({ value: birimAdi, label: birimAdi })),
  ];
}

export function UrunSekme({
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
  const [kayitlar, setKayitlar] = useState<AdminUrun[]>([]);
  const [birimler, setBirimler] = useState<AdminBirim[]>([]);
  const [form, setForm] = useState<UrunForm>(bosUrunForm);
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
      const [urunler, birimKayitlari] = await Promise.all([urunleriGetir(), birimleriGetir()]);
      setKayitlar(urunler);
      setBirimler(birimKayitlari);
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Ürünler alınamadı');
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
    setForm(bosUrunForm);
  }, [gomuluDuzenle, onListeyeDon]);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (gorunum === 'duzenle' && seciliKayit) {
      return !formlarEsit(form, urundenForm(seciliKayit));
    }
    if (gorunum === 'ekle') {
      return (
        form.urunKodu.trim() !== '' ||
        form.urunAdi.trim() !== '' ||
        form.marka.trim() !== '' ||
        form.mensei.trim() !== '' ||
        form.anaBirim.trim() !== '' ||
        form.varsayilanBirim.trim() !== '' ||
        form.ustId.trim() !== ''
      );
    }
    return false;
  }, [form, gorunum, seciliKayit]);

  const dogrula = useCallback(() => {
    if (!form.urunTipi) return 'Ürün tipi zorunludur';
    if (!form.urunKodu.trim()) return 'Ürün kodu zorunludur';
    if (!form.urunAdi.trim()) return 'Ürün adı zorunludur';
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
        await urunGuncelle(seciliId, { ...form, aktif });
        basariBildir('Ürün güncellendi.');
      } else {
        await urunOlustur({ ...form, aktif: true });
        basariBildir('Ürün eklendi.');
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
      await urunSil(seciliId);
      basariBildir('Ürün silindi.');
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
      if (seciliKayit) setForm(urundenForm(seciliKayit));
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

  const birimSecenekleri = useMemo(
    () => birimAdiSecenekleri(birimler, seciliKayit?.id),
    [birimler, seciliKayit?.id]
  );

  const ustUrunSecenekleri = useMemo(
    () => [
      { value: '', label: 'Yok' },
      ...kayitlar
        .filter((u) => u.id !== seciliKayit?.id)
        .map((u) => ({ value: u.id, label: `${u.urunKodu} — ${u.urunAdi}` })),
    ],
    [kayitlar, seciliKayit?.id]
  );

  const formAlanlari = (
    <TanimFormBolum baslik="Ürün Bilgileri">
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">Üst Ürün</span>
          <FormAcilirSecim
            value={form.ustId}
            onChange={(ustId) => setForm((f) => ({ ...f, ustId }))}
            secenekler={ustUrunSecenekleri}
          />
        </label>
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">Ürün Tipi *</span>
          <FormAcilirSecim
            value={form.urunTipi}
            onChange={(urunTipi) => setForm((f) => ({ ...f, urunTipi }))}
            secenekler={URUN_TIPLERI.map((x) => ({ ...x }))}
          />
        </label>
      </div>
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">Ürün Nevi</span>
          <FormAcilirSecim
            value={form.urunNevi}
            onChange={(urunNevi) => setForm((f) => ({ ...f, urunNevi }))}
            secenekler={[{ value: '', label: 'Seçilmedi' }, ...URUN_NEVILERI.map((x) => ({ ...x }))]}
          />
        </label>
        <TanimGirdi
          etiket="Ürün Kodu"
          deger={form.urunKodu}
          maxLength={30}
          zorunlu
          onChange={(urunKodu) => setForm((f) => ({ ...f, urunKodu }))}
        />
        <TanimGirdi
          etiket="Ürün Adı"
          deger={form.urunAdi}
          maxLength={255}
          zorunlu
          onChange={(urunAdi) => setForm((f) => ({ ...f, urunAdi }))}
        />
        <TanimGirdi
          etiket="Marka"
          deger={form.marka}
          maxLength={100}
          onChange={(marka) => setForm((f) => ({ ...f, marka }))}
        />
        <TanimGirdi
          etiket="Menşei"
          deger={form.mensei}
          maxLength={50}
          onChange={(mensei) => setForm((f) => ({ ...f, mensei }))}
        />
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">Ana Birim</span>
          <FormAcilirSecim
            value={form.anaBirim}
            onChange={(anaBirim) => setForm((f) => ({ ...f, anaBirim }))}
            secenekler={birimSecenekleri}
          />
        </label>
      </div>
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">Varsayılan Birim</span>
          <FormAcilirSecim
            value={form.varsayilanBirim}
            onChange={(varsayilanBirim) => setForm((f) => ({ ...f, varsayilanBirim }))}
            secenekler={birimSecenekleri}
          />
        </label>
      </div>
    </TanimFormBolum>
  );

  if (yukleniyor && (gomuluDuzenle || gorunum === 'duzenle')) {
    return <TanimYukleniyor />;
  }

  if (gorunum === 'ekle') {
    return (
      <>
        <TanimDuzenleEkrani
          ustEtiket="Yeni Ürün"
          baslik="Yeni Ürün Kartı"
          onGeri={listeyeDon}
          saltOkunur={!eklemeVar}
        >
          {formAlanlari}
        </TanimDuzenleEkrani>
        <SilmeOnayModal
          acik={silAcik}
          onKapat={() => setSilAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu ürünü silmek istiyor musunuz?"
          hedefMetin=""
          ariaLabel="Ürün silme onayı"
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
          ustEtiket="Ürün Düzenle"
          baslik={seciliKayit.urunAdi}
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
          baslik="Bu ürünü silmek istiyor musunuz?"
          hedefMetin={`${seciliKayit.urunAdi} (${seciliKayit.urunKodu})`}
          ariaLabel="Ürün silme onayı"
        />
      </>
    );
  }

  return null;
}
