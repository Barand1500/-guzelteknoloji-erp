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
import {
  adGecerliMi,
  kodGecerliMi,
  postaKoduGecerliMi,
} from '@/admin/baslat-menusu/tanimlar/alanKurallari';
import { useTanimFirmaDurumu } from '@/admin/baslat-menusu/tanimlar/kancalar/useTanimFirmaDurumu';
import {
  bosDepoForm,
  type AdminDepo,
  type AdminSube,
  type DepoFormDegeri,
  type TanimGorunumModu,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
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

function depoAdimDogrula(adim: number, form: DepoFormDegeri): string | null {
  if (adim === 0) {
    if (!form.subeId) return 'Şube seçimi zorunludur';
    if (!kodGecerliMi(form.depoKodu)) return 'Depo kodu zorunludur';
    if (!adGecerliMi(form.depoAdi)) return 'Depo adı zorunludur';
  }
  if (adim === 1 && !postaKoduGecerliMi(form.postaKodu)) {
    return 'Posta kodu 5 haneli olmalıdır';
  }
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

export function DepoSekme({
  gomuluDuzenle,
}: {
  gomuluDuzenle?: { id: string; onKapat: () => void };
} = {}) {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { subeBagliPasifMi } = useTanimFirmaDurumu();
  const [kayitlar, setKayitlar] = useState<AdminDepo[]>([]);
  const [subeler, setSubeler] = useState<AdminSube[]>([]);
  const [subeFiltre, setSubeFiltre] = useState('');
  const [form, setForm] = useState<DepoFormDegeri>(bosDepoForm);
  const [gorunum, setGorunum] = useState<TanimGorunumModu>(gomuluDuzenle ? 'duzenle' : 'liste');
  const [sihirbazAdim, setSihirbazAdim] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silModalAcik, setSilModalAcik] = useState(false);
  const [seciliId, setSeciliId] = useState<string | null>(gomuluDuzenle?.id ?? null);

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

  const listeyeDon = useCallback(() => {
    if (gomuluDuzenle) {
      gomuluDuzenle.onKapat();
      return;
    }
    setGorunum('liste');
    setSeciliId(null);
    setForm(bosDepoForm);
    setSihirbazAdim(0);
  }, [gomuluDuzenle]);

  const yeniBaslat = useCallback(() => {
    setSeciliId(null);
    setForm({
      ...bosDepoForm,
      subeId: subeFiltre || aktifSubeler[0]?.id || '',
    });
    setSihirbazAdim(0);
    setGorunum('ekle');
  }, [subeFiltre, aktifSubeler]);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (gorunum === 'duzenle' && seciliKayit) {
      return !formlarEsit(form, depodanForm(seciliKayit));
    }
    if (gorunum === 'ekle') {
      return form.depoKodu.trim() !== '' || form.depoAdi.trim() !== '';
    }
    return false;
  }, [gorunum, seciliKayit, form]);

  const kaydet = useCallback(async () => {
    const dogrulama = depoFormDogrula(form);
    if (dogrulama) {
      hataBildir(dogrulama);
      return;
    }
    const hedef = `«${form.depoAdi.trim()}» (${form.depoKodu.trim()}) deposunu`;
    setKaydediliyor(true);
    try {
      if (gorunum === 'duzenle' && seciliId) {
        await depoGuncelle(seciliId, form);
        logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Depo', hedef));
        basariBildir('Depo güncellendi.');
      } else {
        await depoOlustur(form);
        logMesajiAyarla(logMesaj.ekledi('Tanımlar — Depo', hedef));
        basariBildir('Depo eklendi.');
      }
      listeyeDon();
      if (!gomuluDuzenle) await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [form, gorunum, seciliId, listeyeDon, logMesajiAyarla, basariBildir, hataBildir, gomuluDuzenle]);

  const sil = useCallback(() => {
    if (gorunum === 'duzenle' && seciliId) setSilModalAcik(true);
  }, [gorunum, seciliId]);

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
      listeyeDon();
      if (!gomuluDuzenle) await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, seciliKayit, listeyeDon, logMesajiAyarla, basariBildir, hataBildir, gomuluDuzenle]);

  useEffect(() => {
    if (!gomuluDuzenle || !seciliKayit) return;
    setForm(depodanForm(seciliKayit));
  }, [gomuluDuzenle, seciliKayit]);

  useModulAksiyonlari(
    { kaydet, ekle: yeniBaslat, sil },
    {
      kaydet: gorunum === 'duzenle' && !kaydediliyor,
      ekle: gorunum === 'liste' && !gomuluDuzenle,
      sil: gorunum === 'duzenle' && !!seciliId && !kaydediliyor,
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
          onChange={(subeId) => setForm({ ...form, subeId })}
          secenekler={aktifSubeler.map((s) => ({
            value: s.id,
            label: `${s.subeKodu} — ${s.subeAdi}`,
          }))}
        />
      </label>
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
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
    </>
  );

  if (yukleniyor) return <TanimYukleniyor />;

  if (gorunum === 'ekle' && !gomuluDuzenle) {
    return (
      <>
        <TanimSihirbaz
          baslik="Yeni Depo Kurulumu"
          aktifAdim={sihirbazAdim}
          onAdimDegistir={setSihirbazAdim}
          onIptal={listeyeDon}
          onTamamla={() => void kaydet()}
          adimDogrula={(adim) => depoAdimDogrula(adim, form)}
          onHata={hataBildir}
          tamamlaniyor={kaydediliyor}
          adimlar={[
            {
              baslik: 'Temel Bilgiler',
              aciklama: 'Şube, depo kodu ve adını girin',
              icerik: temelAlanlar,
            },
            {
              baslik: 'Adres',
              aciklama: 'Depo adres bilgilerini girin',
              icerik: (
                <OrtakAdresFormu
                  bolumsuz
                  deger={form}
                  onChange={(adres) => setForm({ ...form, ...adres })}
                />
              ),
            },
            {
              baslik: 'Durum',
              aciklama: 'Deponun aktif/pasif durumunu belirleyin',
              icerik: (
                <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm({ ...form, aktif })} />
              ),
            },
          ]}
        />
        <SilmeOnayModal
          acik={silModalAcik}
          onKapat={() => setSilModalAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu depoyu silmek istiyor musunuz?"
          hedefMetin=""
          ariaLabel="Depo silme onayı"
        />
      </>
    );
  }

  if (gorunum === 'duzenle' || gomuluDuzenle) {
    if (!seciliKayit) return <TanimYukleniyor />;
    return (
      <>
        <TanimDuzenleEkrani
          baslik={`${seciliKayit.depoAdi} (${seciliKayit.depoKodu})`}
          altBaslik="Depo bilgilerini güncelleyin"
          olusturma={seciliKayit.olusturma}
          guncelleme={seciliKayit.guncelleme}
          onGeri={listeyeDon}
        >
          <TanimFormBolum baslik="Temel Bilgiler">{temelAlanlar}</TanimFormBolum>
          <OrtakAdresFormu deger={form} onChange={(adres) => setForm({ ...form, ...adres })} />
          <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm({ ...form, aktif })} />
        </TanimDuzenleEkrani>
        <SilmeOnayModal
          acik={silModalAcik}
          onKapat={() => setSilModalAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu depoyu silmek istiyor musunuz?"
          hedefMetin={`${seciliKayit.depoAdi} (${seciliKayit.depoKodu})`}
          ariaLabel="Depo silme onayı"
        />
      </>
    );
  }

  return (
    <>
      <TanimListeEkrani onYeniEkle={yeniBaslat} yeniEkleMetin="Yeni Depo">
        <TanimKayitTablosu
          baslik="Depolar"
          kayitlar={filtrelenmisKayitlar}
          filtre={subeFiltreAlani}
          aramaMetni={(k) =>
            `${k.depoKodu} ${k.depoAdi} ${k.subeKodu ?? ''} ${k.subeAdi ?? ''} ${k.il} ${k.ilce}`
          }
          pasifMi={(k) => subeBagliPasifMi(k.aktif, k.subeId)}
          onSatirTikla={(k) => {
            setSeciliId(k.id);
            setForm(depodanForm(k));
            setGorunum('duzenle');
          }}
          kolonlar={[
            {
              id: 'kod',
              baslik: 'Kod',
              sinif: 'ap-tanimlar-tablo-kod',
              hucre: (k) => <span className="ap-tanimlar-tablo-kod">{k.depoKodu}</span>,
            },
            { id: 'ad', baslik: 'Depo Adı', hucre: (k) => k.depoAdi },
            {
              id: 'sube',
              baslik: 'Şube',
              hucre: (k) =>
                k.subeKodu && k.subeAdi ? `${k.subeKodu} — ${k.subeAdi}` : '—',
            },
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
        baslik="Bu depoyu silmek istiyor musunuz?"
        hedefMetin={seciliKayit ? `${seciliKayit.depoAdi} (${seciliKayit.depoKodu})` : ''}
        ariaLabel="Depo silme onayı"
      />
    </>
  );
}
