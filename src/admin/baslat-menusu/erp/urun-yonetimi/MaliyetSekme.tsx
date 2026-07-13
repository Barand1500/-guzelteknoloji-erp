import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGomuluDuzenleFormYukle } from '@/admin/baslat-menusu/tanimlar/kancalar/useGomuluDuzenleForm';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import type { GomuluDuzenleSecenek, TanimGorunumModu } from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { birimleriGetir, maliyetGuncelle, maliyetOlustur, maliyetSil, maliyetleriGetir } from './api';
import { SayiGirdi } from './SayiGirdi';
import {
  bosMaliyetForm,
  type AdminBirim,
  type AdminMaliyet,
  type MaliyetForm,
} from './tipler';

const maliyettenForm = (m: AdminMaliyet): MaliyetForm => ({
  birimId: m.birimId,
  sonAlisMaliyeti: m.sonAlisMaliyeti,
  yuruyenAgirlikliOrtalama: m.yuruyenAgirlikliOrtalama,
  agirlikliOrtalama: m.agirlikliOrtalama,
  basitOrtalama: m.basitOrtalama,
  lifo: m.lifo,
  fifo: m.fifo,
  aktif: m.aktif,
});

function formlarEsit(a: MaliyetForm, b: MaliyetForm): boolean {
  return (Object.keys(a) as (keyof MaliyetForm)[]).every((k) => a[k] === b[k]);
}

export function MaliyetSekme({
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
  const [kayitlar, setKayitlar] = useState<AdminMaliyet[]>([]);
  const [birimler, setBirimler] = useState<AdminBirim[]>([]);
  const [form, setForm] = useState<MaliyetForm>(bosMaliyetForm);
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
      const [maliyetKayitlari, birimKayitlari] = await Promise.all([
        maliyetleriGetir(),
        birimleriGetir(),
      ]);
      setKayitlar(maliyetKayitlari);
      setBirimler(birimKayitlari);
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Maliyetler alınamadı');
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
    setForm(bosMaliyetForm);
  }, [gomuluDuzenle, onListeyeDon]);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (gorunum === 'duzenle' && seciliKayit) {
      return !formlarEsit(form, maliyettenForm(seciliKayit));
    }
    if (gorunum === 'ekle') {
      return (
        form.birimId.trim() !== '' ||
        form.sonAlisMaliyeti !== 0 ||
        form.yuruyenAgirlikliOrtalama !== 0 ||
        form.agirlikliOrtalama !== 0 ||
        form.basitOrtalama !== 0 ||
        form.lifo !== 0 ||
        form.fifo !== 0
      );
    }
    return false;
  }, [form, gorunum, seciliKayit]);

  const dogrula = useCallback(() => {
    if (!form.birimId) return 'Birim seçimi zorunludur';
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
        await maliyetGuncelle(seciliId, { ...form, aktif });
        basariBildir('Maliyet güncellendi.');
      } else {
        await maliyetOlustur({ ...form, aktif: true });
        basariBildir('Maliyet eklendi.');
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
      await maliyetSil(seciliId);
      basariBildir('Maliyet silindi.');
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
      if (seciliKayit) setForm(maliyettenForm(seciliKayit));
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

  const birimSecenekleri = useMemo(() => {
    const kullanilan = new Set(kayitlar.map((m) => m.birimId));
    const kaynak =
      gorunum === 'ekle'
        ? birimler.filter((b) => !kullanilan.has(b.id))
        : birimler;
    return kaynak.map((b) => ({
      value: b.id,
      label: `${b.urunKodu} — ${b.urunAdi} / ${b.birimAdi}`,
    }));
  }, [birimler, gorunum, kayitlar]);

  const formAlanlari = (
    <TanimFormBolum baslik="Maliyet Bilgileri">
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">Ürün / Birim *</span>
          <FormAcilirSecim
            value={form.birimId}
            onChange={(birimId) => setForm((f) => ({ ...f, birimId }))}
            disabled={gorunum === 'duzenle'}
            secenekler={birimSecenekleri}
          />
        </label>
      </div>
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <SayiGirdi
          etiket="Son Alış Maliyeti"
          deger={form.sonAlisMaliyeti}
          onChange={(sonAlisMaliyeti) => setForm((f) => ({ ...f, sonAlisMaliyeti }))}
        />
        <SayiGirdi
          etiket="Yürüyen Ağırlıklı Ortalama"
          deger={form.yuruyenAgirlikliOrtalama}
          onChange={(yuruyenAgirlikliOrtalama) => setForm((f) => ({ ...f, yuruyenAgirlikliOrtalama }))}
        />
        <SayiGirdi
          etiket="Ağırlıklı Ortalama"
          deger={form.agirlikliOrtalama}
          onChange={(agirlikliOrtalama) => setForm((f) => ({ ...f, agirlikliOrtalama }))}
        />
        <SayiGirdi
          etiket="Basit Ortalama"
          deger={form.basitOrtalama}
          onChange={(basitOrtalama) => setForm((f) => ({ ...f, basitOrtalama }))}
        />
        <SayiGirdi etiket="LIFO" deger={form.lifo} onChange={(lifo) => setForm((f) => ({ ...f, lifo }))} />
        <SayiGirdi etiket="FIFO" deger={form.fifo} onChange={(fifo) => setForm((f) => ({ ...f, fifo }))} />
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
          ustEtiket="Yeni Maliyet"
          baslik="Yeni Maliyet Kartı"
          onGeri={listeyeDon}
          saltOkunur={!eklemeVar}
        >
          {formAlanlari}
        </TanimDuzenleEkrani>
        <SilmeOnayModal
          acik={silAcik}
          onKapat={() => setSilAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu maliyet kaydını silmek istiyor musunuz?"
          hedefMetin=""
          ariaLabel="Maliyet silme onayı"
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
          ustEtiket="Maliyet Düzenle"
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
          baslik="Bu maliyet kaydını silmek istiyor musunuz?"
          hedefMetin={`${seciliKayit.urunAdi} — ${seciliKayit.birimAdi}`}
          ariaLabel="Maliyet silme onayı"
        />
      </>
    );
  }

  return null;
}
