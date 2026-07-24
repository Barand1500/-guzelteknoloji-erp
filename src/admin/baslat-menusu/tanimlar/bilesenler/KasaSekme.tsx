import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGomuluDuzenleFormYukle } from '@/admin/baslat-menusu/tanimlar/kancalar/useGomuluDuzenleForm';
import {
  kasaGuncelle,
  kasaOlustur,
  kasaSil,
  kasalariGetir,
  subeleriGetir,
} from '@/admin/baslat-menusu/tanimlar/api';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import {
  TanimDurumRozeti,
  TanimKayitTablosu,
} from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitTablosu';
import { TanimListeEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimListeEkrani';
import { TanimSihirbaz } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimSihirbaz';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { adGecerliMi, kodGecerliMi } from '@/admin/baslat-menusu/tanimlar/alanKurallari';
import { useTanimFirmaDurumu } from '@/admin/baslat-menusu/tanimlar/kancalar/useTanimFirmaDurumu';
import {
  bosKasaForm,
  type AdminKasa,
  type AdminSube,
  type GomuluDuzenleSecenek,
  type KasaFormDegeri,
  type TanimGorunumModu,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import {
  gecerliParaBirimi,
  paraBirimiFormSecenekleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/paraBirimleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
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

function kasaAdimDogrula(adim: number, form: KasaFormDegeri): string | null {
  if (adim === 0) {
    if (!form.subeId) return 'Şube seçimi zorunludur';
    if (!kodGecerliMi(form.kasaKodu)) return 'Kasa kodu zorunludur';
    if (!adGecerliMi(form.kasaAdi)) return 'Kasa adı zorunludur';
    if (!form.paraBirimi.trim()) return 'Para birimi zorunludur';
  }
  return null;
}

function kasadanForm(k: AdminKasa): KasaFormDegeri {
  const para = (k.paraBirimi ?? '').trim();
  return {
    subeId: k.subeId ?? '',
    kasaKodu: k.kasaKodu ?? '',
    kasaAdi: k.kasaAdi ?? '',
    paraBirimi: gecerliParaBirimi(para || 'TRY'),
    aktif: k.aktif !== false,
  };
}

function onizlemeKasaMu(v: unknown): v is AdminKasa {
  return (
    !!v &&
    typeof v === 'object' &&
    typeof (v as AdminKasa).id === 'string' &&
    typeof (v as AdminKasa).kasaKodu === 'string'
  );
}

function formlarEsit(a: KasaFormDegeri, b: KasaFormDegeri): boolean {
  return (Object.keys(a) as (keyof KasaFormDegeri)[]).every((k) => a[k] === b[k]);
}

export function KasaSekme({
  gomuluDuzenle,
}: {
  gomuluDuzenle?: GomuluDuzenleSecenek;
} = {}) {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { subeBagliPasifMi } = useTanimFirmaDurumu();
  const { duzenlemeVar, eklemeVar, silmeVar } = useYetkiler('tanimlar');
  const gomuluEkle = gomuluDuzenle?.mod === 'ekle';
  const onizleme = onizlemeKasaMu(gomuluDuzenle?.onizleme) ? gomuluDuzenle.onizleme : null;
  const baglamSubeId = gomuluDuzenle?.baglam?.subeId ?? '';
  const [kayitlar, setKayitlar] = useState<AdminKasa[]>(() => (onizleme ? [onizleme] : []));
  const [subeler, setSubeler] = useState<AdminSube[]>([]);
  const [subeFiltre, setSubeFiltre] = useState('');
  const [form, setForm] = useState<KasaFormDegeri>(() => {
    if (onizleme) return kasadanForm(onizleme);
    if (baglamSubeId) return { ...bosKasaForm, subeId: baglamSubeId };
    return bosKasaForm;
  });
  const [gorunum, setGorunum] = useState<TanimGorunumModu>(
    gomuluEkle ? 'ekle' : gomuluDuzenle ? 'duzenle' : 'liste'
  );
  const [sihirbazAdim, setSihirbazAdim] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(!gomuluDuzenle);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silModalAcik, setSilModalAcik] = useState(false);
  const [seciliId, setSeciliId] = useState<string | null>(
    gomuluEkle ? null : gomuluDuzenle?.id ?? null
  );

  async function yukle() {
    if (!gomuluDuzenle) setYukleniyor(true);
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

  const subeSecenekleri = useMemo(() => {
    const aktif = subeler.filter((s) => s.aktif);
    const mevcutId = form.subeId || onizleme?.subeId;
    if (!mevcutId) return aktif;
    if (aktif.some((s) => s.id === mevcutId)) return aktif;
    const mevcut = subeler.find((s) => s.id === mevcutId);
    if (mevcut) return [...aktif, mevcut];
    if (onizleme?.subeId === mevcutId) {
      return [
        ...aktif,
        {
          id: onizleme.subeId,
          firmaId: '',
          subeKodu: onizleme.subeKodu || '—',
          subeAdi: onizleme.subeAdi || '—',
          il: '',
          ilce: '',
          mahalle: '',
          postaKodu: '',
          adres: '',
          efaturaSeri: '',
          earsivSeri: '',
          eirsaliyeSeri: '',
          mersis: '',
          ticaretSicil: '',
          aktif: true,
          olusturma: '',
          guncelleme: '',
        } satisfies AdminSube,
      ];
    }
    return aktif;
  }, [subeler, form.subeId, onizleme]);

  const listeyeDon = useCallback((secenek?: { yenile?: boolean }) => {
    if (gomuluDuzenle) {
      gomuluDuzenle.onKapat(secenek);
      return;
    }
    setGorunum('liste');
    setSeciliId(null);
    setForm(bosKasaForm);
    setSihirbazAdim(0);
  }, [gomuluDuzenle]);

  const yeniBaslat = useCallback(() => {
    setSeciliId(null);
    setForm({
      ...bosKasaForm,
      subeId: subeFiltre || subeSecenekleri[0]?.id || '',
    });
    setSihirbazAdim(0);
    setGorunum('ekle');
  }, [subeFiltre, subeSecenekleri]);

  const seciliKayit = useMemo(() => {
    if (!seciliId) return null;
    return (
      kayitlar.find((k) => k.id === seciliId) ??
      (onizleme?.id === seciliId ? onizleme : null)
    );
  }, [seciliId, kayitlar, onizleme]);

  const kirli = useMemo(() => {
    if (gorunum === 'duzenle' && seciliKayit) {
      return !formlarEsit(form, kasadanForm(seciliKayit));
    }
    if (gorunum === 'ekle') {
      return form.kasaKodu.trim() !== '' || form.kasaAdi.trim() !== '';
    }
    return false;
  }, [gorunum, seciliKayit, form]);

  const kaydet = useCallback(async () => {
    if (gorunum === 'duzenle' && !duzenlemeVar) {
      hataBildir('Kayıt düzenleme yetkiniz yok');
      return;
    }
    if (gorunum === 'ekle' && !eklemeVar) {
      hataBildir('Yeni kayıt ekleme yetkiniz yok');
      return;
    }
    const dogrulama = kasaFormDogrula(form);
    if (dogrulama) {
      hataBildir(dogrulama);
      return;
    }
    const hedef = `«${form.kasaAdi.trim()}» (${form.kasaKodu.trim()}) kasasını`;
    setKaydediliyor(true);
    try {
      if (gorunum === 'duzenle' && seciliId) {
        await kasaGuncelle(seciliId, form);
        logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Kasa', hedef));
        basariBildir('Kasa güncellendi.');
      } else {
        await kasaOlustur(form);
        logMesajiAyarla(logMesaj.ekledi('Tanımlar — Kasa', hedef));
        basariBildir('Kasa eklendi.');
      }
      listeyeDon({ yenile: true });
      if (!gomuluDuzenle) await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [form, gorunum, seciliId, listeyeDon, logMesajiAyarla, basariBildir, hataBildir, gomuluDuzenle, duzenlemeVar, eklemeVar]);

  const sil = useCallback(() => {
    if (gorunum === 'duzenle' && seciliId) setSilModalAcik(true);
  }, [gorunum, seciliId]);

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
      listeyeDon({ yenile: true });
      if (!gomuluDuzenle) await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, seciliKayit, listeyeDon, logMesajiAyarla, basariBildir, hataBildir, gomuluDuzenle]);

  useGomuluDuzenleFormYukle(
    gomuluDuzenle,
    seciliKayit,
    useCallback(() => {
      if (seciliKayit) setForm(kasadanForm(seciliKayit));
    }, [seciliKayit])
  );

  useModulAksiyonlari(
    gomuluDuzenle ? { kaydet, sil } : { kaydet, ekle: yeniBaslat, sil },
    {
      kaydet:
        ((gorunum === 'duzenle' && duzenlemeVar) || (gorunum === 'ekle' && eklemeVar)) &&
        !kaydediliyor,
      ...(gomuluDuzenle ? {} : { ekle: gorunum === 'liste' && eklemeVar }),
      sil: gorunum === 'duzenle' && !!seciliId && silmeVar && !kaydediliyor,
    },
    kirli
  );

  const subeFiltreAlani = (
    <label className="ap-tanimlar-liste-filtre-alan">
      <span>Şube</span>
      <FormAcilirSecim
        value={subeFiltre}
        onChange={setSubeFiltre}
        secenekler={[
          { value: '', label: 'Tümü' },
          ...subeler.map((s) => ({ value: s.id, label: `${s.subeKodu} — ${s.subeAdi}` })),
        ]}
      />
    </label>
  );

  const temelAlanlar = (
    <>
      <label className="ap-tanimlar-secim-alan block">
        <span className="ap-tanim-girdi-etiket">Şube *</span>
        <FormAcilirSecim
          value={form.subeId}
          onChange={(subeId) => setForm((f) => ({ ...f, subeId }))}
          disabled={Boolean(baglamSubeId)}
          secenekler={subeSecenekleri.map((s) => ({
            value: s.id,
            label: `${s.subeKodu} — ${s.subeAdi}`.toLocaleUpperCase('tr'),
          }))}
        />
      </label>
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <TanimGirdi
          etiket="Kasa Kodu"
          deger={form.kasaKodu}
          kural="kod"
          zorunlu
          autoFocus={Boolean(gomuluDuzenle)}
          onChange={(kasaKodu) => setForm((f) => ({ ...f, kasaKodu }))}
        />
        <TanimGirdi
          etiket="Kasa Adı"
          deger={form.kasaAdi}
          kural="ad"
          zorunlu
          onChange={(kasaAdi) => setForm((f) => ({ ...f, kasaAdi }))}
        />
      </div>
      <label className="ap-tanimlar-secim-alan block">
        <span className="ap-tanim-girdi-etiket">Para Birimi *</span>
        <FormAcilirSecim
          value={gecerliParaBirimi(form.paraBirimi)}
          onChange={(paraBirimi) => setForm((f) => ({ ...f, paraBirimi }))}
          secenekler={paraBirimiFormSecenekleri()}
        />
      </label>
    </>
  );

  if (yukleniyor && !gomuluDuzenle) return <TanimYukleniyor />;

  if (gomuluEkle && gomuluDuzenle?.panel) {
    return (
      <TanimDuzenleEkrani
        panel
        ustEtiket="Yeni Kasa"
        baslik="Yeni Kasa"
        onGeri={listeyeDon}
        onKaydet={eklemeVar ? () => void kaydet() : undefined}
        kaydediliyor={kaydediliyor}
        saltOkunur={!eklemeVar}
      >
        <TanimFormBolum baslik="Temel Bilgiler">{temelAlanlar}</TanimFormBolum>
        <OrtakDurumAlani
          aktif={form.aktif}
          onChange={(aktif) => setForm((f) => ({ ...f, aktif }))}
        />
      </TanimDuzenleEkrani>
    );
  }

  if (gorunum === 'ekle' && !gomuluDuzenle) {
    return (
      <>
        <TanimSihirbaz
          baslik="Yeni Kasa Kurulumu"
          aktifAdim={sihirbazAdim}
          onAdimDegistir={setSihirbazAdim}
          onIptal={listeyeDon}
          onTamamla={() => void kaydet()}
          adimDogrula={(adim) => kasaAdimDogrula(adim, form)}
          onHata={hataBildir}
          tamamlaniyor={kaydediliyor}
          adimlar={[
            {
              baslik: 'Temel Bilgiler',
              aciklama: 'Şube, kasa kodu, adı ve para birimini girin',
              icerik: temelAlanlar,
            },
            {
              baslik: 'Durum',
              aciklama: 'Kasanın aktif/pasif durumunu belirleyin',
              icerik: (
                <OrtakDurumAlani
                  aktif={form.aktif}
                  onChange={(aktif) => setForm((f) => ({ ...f, aktif }))}
                />
              ),
            },
          ]}
        />
        <SilmeOnayModal
          acik={silModalAcik}
          onKapat={() => setSilModalAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu kasayı silmek istiyor musunuz?"
          hedefMetin=""
          ariaLabel="Kasa silme onayı"
        />
      </>
    );
  }

  if (gorunum === 'duzenle' || (gomuluDuzenle && !gomuluEkle)) {
    if (!seciliKayit) {
      if (yukleniyor) return <TanimYukleniyor />;
      return (
        <TanimDuzenleEkrani
          panel={gomuluDuzenle?.panel}
          ustEtiket="Kasa Düzenle"
          baslik="Kayıt bulunamadı"
          onGeri={listeyeDon}
        >
          <p className="ap-tanimlar-panel-alt">Bu kasa yüklenemedi. Paneli kapatıp tekrar deneyin.</p>
        </TanimDuzenleEkrani>
      );
    }
    return (
      <>
        <TanimDuzenleEkrani
          panel={gomuluDuzenle?.panel}
          ustEtiket="Kasa Düzenle"
          baslik={seciliKayit.kasaAdi || seciliKayit.kasaKodu || 'Kasa'}
          onGeri={listeyeDon}
          onKaydet={duzenlemeVar ? () => void kaydet() : undefined}
          kaydediliyor={kaydediliyor}
          saltOkunur={!duzenlemeVar}
        >
          <TanimFormBolum baslik="Temel Bilgiler">{temelAlanlar}</TanimFormBolum>
          <OrtakDurumAlani
            aktif={form.aktif}
            onChange={(aktif) => setForm((f) => ({ ...f, aktif }))}
          />
        </TanimDuzenleEkrani>
        <SilmeOnayModal
          acik={silModalAcik}
          onKapat={() => setSilModalAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu kasayı silmek istiyor musunuz?"
          hedefMetin={`${seciliKayit.kasaAdi} (${seciliKayit.kasaKodu})`}
          ariaLabel="Kasa silme onayı"
        />
      </>
    );
  }

  return (
    <>
      <TanimListeEkrani onYeniEkle={eklemeVar ? yeniBaslat : undefined} yeniEkleMetin="Yeni Kasa">
        <TanimKayitTablosu
          baslik="Kasalar"
          kayitlar={filtrelenmisKayitlar}
          filtre={subeFiltreAlani}
          aramaMetni={(k) =>
            `${k.kasaKodu} ${k.kasaAdi} ${k.subeKodu ?? ''} ${k.subeAdi ?? ''} ${k.paraBirimi}`
          }
          pasifMi={(k) => subeBagliPasifMi(k.aktif, k.subeId)}
          onSatirTikla={(k) => {
            setSeciliId(k.id);
            setForm(kasadanForm(k));
            setGorunum('duzenle');
          }}
          kolonlar={[
            {
              id: 'kod',
              baslik: 'Kod',
              sinif: 'ap-tanimlar-tablo-kod',
              hucre: (k) => <span className="ap-tanimlar-tablo-kod">{k.kasaKodu}</span>,
            },
            { id: 'ad', baslik: 'Kasa Adı', hucre: (k) => k.kasaAdi },
            {
              id: 'sube',
              baslik: 'Şube',
              hucre: (k) =>
                k.subeKodu && k.subeAdi ? `${k.subeKodu} — ${k.subeAdi}` : '—',
            },
            { id: 'para', baslik: 'Para Birimi', hucre: (k) => k.paraBirimi },
            {
              id: 'durum',
              baslik: 'Durum',
              hucre: (k) => <TanimDurumRozeti aktif={k.aktif} />,
            },
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
        baslik="Bu kasayı silmek istiyor musunuz?"
        hedefMetin={seciliKayit ? `${seciliKayit.kasaAdi} (${seciliKayit.kasaKodu})` : ''}
        ariaLabel="Kasa silme onayı"
      />
    </>
  );
}
