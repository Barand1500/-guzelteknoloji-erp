import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  firmalariGetir,
  subeGuncelle,
  subeOlustur,
  subeSil,
  subeleriGetir,
} from '@/admin/baslat-menusu/tanimlar/api';
import { adresMetniniOku } from '@/admin/baslat-menusu/tanimlar/araclar/adresYardimci';
import { OrtakAdresFormu } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakAdresFormu';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimFirmaSecici, firmaEtiketi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFirmaSecici';
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
  ebelgeSeriGecerliMi,
  kodGecerliMi,
  mersisGecerliMi,
  postaKoduGecerliMi,
} from '@/admin/baslat-menusu/tanimlar/alanKurallari';
import { useTanimFirmaDurumu } from '@/admin/baslat-menusu/tanimlar/kancalar/useTanimFirmaDurumu';
import { useGomuluDuzenleFormYukle } from '@/admin/baslat-menusu/tanimlar/kancalar/useGomuluDuzenleForm';
import {
  bosSubeForm,
  type AdminFirma,
  type AdminSube,
  type GomuluDuzenleSecenek,
  type SubeFormDegeri,
  type TanimGorunumModu,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
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

function subeAdimDogrula(adim: number, form: SubeFormDegeri, firmaId: string): string | null {
  if (adim === 0) {
    if (!firmaId) return 'Firma seçimi zorunludur';
    if (!kodGecerliMi(form.subeKodu)) return 'Şube kodu zorunludur';
    if (!adGecerliMi(form.subeAdi)) return 'Şube adı zorunludur';
  }
  if (adim === 1 && !postaKoduGecerliMi(form.postaKodu)) {
    return 'Posta kodu 5 haneli olmalıdır';
  }
  if (adim === 2) {
    if (!ebelgeSeriGecerliMi(form.efaturaSeri)) return 'E-Fatura seri 3 karakter olmalıdır (A-Z, 0-9)';
    if (!ebelgeSeriGecerliMi(form.earsivSeri)) return 'E-Arşiv seri 3 karakter olmalıdır (A-Z, 0-9)';
    if (!ebelgeSeriGecerliMi(form.eirsaliyeSeri)) return 'E-İrsaliye seri 3 karakter olmalıdır (A-Z, 0-9)';
  }
  if (adim === 3 && !mersisGecerliMi(form.mersis)) {
    return 'MERSİS numarası 16 haneli olmalıdır';
  }
  return null;
}

function subedenForm(s: AdminSube): SubeFormDegeri {
  return {
    subeKodu: s.subeKodu,
    subeAdi: s.subeAdi,
    il: s.il,
    ilce: s.ilce,
    mahalle: s.mahalle,
    postaKodu: s.postaKodu,
    adres: adresMetniniOku(s),
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

export function SubeSekme({
  gomuluDuzenle,
}: {
  gomuluDuzenle?: GomuluDuzenleSecenek;
} = {}) {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { firmaBagliPasifMi } = useTanimFirmaDurumu();
  const { duzenlemeVar, eklemeVar, silmeVar } = useYetkiler();
  const [kayitlar, setKayitlar] = useState<AdminSube[]>([]);
  const [firmalar, setFirmalar] = useState<AdminFirma[]>([]);
  const [seciliFirmaId, setSeciliFirmaId] = useState('');
  const [form, setForm] = useState<SubeFormDegeri>(bosSubeForm);
  const [gorunum, setGorunum] = useState<TanimGorunumModu>(gomuluDuzenle ? 'duzenle' : 'liste');
  const [sihirbazAdim, setSihirbazAdim] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silModalAcik, setSilModalAcik] = useState(false);
  const [seciliId, setSeciliId] = useState<string | null>(gomuluDuzenle?.id ?? null);

  async function yukle() {
    setYukleniyor(true);
    try {
      const [subeListesi, firmaListesi] = await Promise.all([subeleriGetir(), firmalariGetir()]);
      setKayitlar(subeListesi);
      setFirmalar(firmaListesi);
      if (!seciliFirmaId && firmaListesi[0]) {
        setSeciliFirmaId(firmaListesi[0].id);
      }
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Şubeler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }

  useEffect(() => {
    void yukle();
  }, []);

  const listeyeDon = useCallback(() => {
    if (gomuluDuzenle) {
      gomuluDuzenle.onKapat();
      return;
    }
    setGorunum('liste');
    setSeciliId(null);
    setForm(bosSubeForm);
    setSihirbazAdim(0);
  }, [gomuluDuzenle]);

  const yeniBaslat = useCallback(() => {
    setSeciliId(null);
    setForm(bosSubeForm);
    setSeciliFirmaId(firmalar[0]?.id ?? '');
    setSihirbazAdim(0);
    setGorunum('ekle');
  }, [firmalar]);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (gorunum === 'duzenle' && seciliKayit) {
      return !formlarEsit(form, subedenForm(seciliKayit));
    }
    if (gorunum === 'ekle') {
      return form.subeKodu.trim() !== '' || form.subeAdi.trim() !== '';
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
    const dogrulama = subeFormDogrula(form);
    if (dogrulama) {
      hataBildir(dogrulama);
      return;
    }
    if (!form.subeKodu.trim() || !form.subeAdi.trim()) {
      hataBildir('Şube kodu ve adı zorunludur');
      return;
    }
    if (gorunum === 'ekle' && !seciliFirmaId) {
      hataBildir('Firma seçimi zorunludur');
      return;
    }
    const hedef = `«${form.subeAdi.trim()}» (${form.subeKodu.trim()}) şubesini`;
    setKaydediliyor(true);
    try {
      if (gorunum === 'duzenle' && seciliId) {
        await subeGuncelle(seciliId, form);
        logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Şube', hedef));
        basariBildir('Şube güncellendi.');
      } else {
        await subeOlustur(form, seciliFirmaId);
        logMesajiAyarla(logMesaj.ekledi('Tanımlar — Şube', hedef));
        basariBildir('Şube eklendi.');
      }
      listeyeDon();
      if (!gomuluDuzenle) await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [form, gorunum, seciliId, seciliFirmaId, listeyeDon, logMesajiAyarla, basariBildir, hataBildir, gomuluDuzenle, duzenlemeVar, eklemeVar]);

  const sil = useCallback(() => {
    if (gorunum === 'duzenle' && seciliId) setSilModalAcik(true);
  }, [gorunum, seciliId]);

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
      listeyeDon();
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
      if (seciliKayit) setForm(subedenForm(seciliKayit));
    }, [seciliKayit])
  );

  useModulAksiyonlari(
    { kaydet, ekle: yeniBaslat, sil },
    {
      kaydet: gorunum === 'duzenle' && duzenlemeVar && !kaydediliyor,
      ekle: gorunum === 'liste' && !gomuluDuzenle && eklemeVar,
      sil: gorunum === 'duzenle' && !!seciliId && silmeVar && !kaydediliyor,
    },
    kirli
  );

  const temelAlanlar = (
    <>
      {gorunum === 'ekle' ? (
        <TanimFirmaSecici
          firmalar={firmalar}
          value={seciliFirmaId}
          onChange={setSeciliFirmaId}
        />
      ) : seciliKayit ? (
        <TanimFirmaSecici
          firmalar={firmalar}
          value={seciliKayit.firmaId}
          saltOkunur
        />
      ) : null}
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
      <TanimGirdi
        etiket="Şube Kodu"
        deger={form.subeKodu}
        kural="kod"
        zorunlu
        onChange={(subeKodu) => setForm((f) => ({ ...f, subeKodu }))}
      />
      <TanimGirdi
        etiket="Şube Adı"
        deger={form.subeAdi}
        kural="ad"
        zorunlu
        onChange={(subeAdi) => setForm((f) => ({ ...f, subeAdi }))}
      />
      </div>
    </>
  );

  const ebelgeAlanlar = (
    <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--3">
      <TanimGirdi
        etiket="E-Fatura Seri"
        deger={form.efaturaSeri}
        kural="ebelgeSeri"
        onChange={(efaturaSeri) => setForm((f) => ({ ...f, efaturaSeri }))}
      />
      <TanimGirdi
        etiket="E-Arşiv Seri"
        deger={form.earsivSeri}
        kural="ebelgeSeri"
        onChange={(earsivSeri) => setForm((f) => ({ ...f, earsivSeri }))}
      />
      <TanimGirdi
        etiket="E-İrsaliye Seri"
        deger={form.eirsaliyeSeri}
        kural="ebelgeSeri"
        onChange={(eirsaliyeSeri) => setForm((f) => ({ ...f, eirsaliyeSeri }))}
      />
    </div>
  );

  const ticariAlanlar = (
    <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
      <TanimGirdi
        etiket="MERSİS No"
        deger={form.mersis}
        kural="mersis"
        onChange={(mersis) => setForm((f) => ({ ...f, mersis }))}
      />
      <TanimGirdi
        etiket="Ticaret Sicil No"
        deger={form.ticaretSicil}
        kural="ticaretSicil"
        onChange={(ticaretSicil) => setForm((f) => ({ ...f, ticaretSicil }))}
      />
    </div>
  );

  if (yukleniyor) return <TanimYukleniyor />;

  if (gorunum === 'ekle' && !gomuluDuzenle) {
    return (
      <>
        <TanimSihirbaz
          baslik="Yeni Şube Kurulumu"
          aktifAdim={sihirbazAdim}
          onAdimDegistir={setSihirbazAdim}
          onIptal={listeyeDon}
          onTamamla={() => void kaydet()}
          adimDogrula={(adim) => subeAdimDogrula(adim, form, seciliFirmaId)}
          onHata={hataBildir}
          tamamlaniyor={kaydediliyor}
          adimlar={[
            {
              baslik: 'Temel Bilgiler',
              aciklama: 'Şube kodu ve adını girin',
              icerik: temelAlanlar,
            },
            {
              baslik: 'Adres',
              aciklama: 'Şube adres bilgilerini girin',
              icerik: (
                <OrtakAdresFormu
                  bolumsuz
                  deger={form}
                  onChange={(adres) => setForm((f) => ({ ...f, ...adres }))}
                />
              ),
            },
            {
              baslik: 'E-Belge',
              aciklama: 'E-belge seri numaralarını girin',
              icerik: ebelgeAlanlar,
            },
            {
              baslik: 'Ticari',
              aciklama: 'MERSİS ve ticaret sicil bilgilerini girin',
              icerik: ticariAlanlar,
            },
            {
              baslik: 'Durum',
              aciklama: 'Şubenin aktif/pasif durumunu belirleyin',
              icerik: (
                <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm((f) => ({ ...f, aktif }))} />
              ),
            },
          ]}
        />
        <SilmeOnayModal
          acik={silModalAcik}
          onKapat={() => setSilModalAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu şubeyi silmek istiyor musunuz?"
          hedefMetin=""
          ariaLabel="Şube silme onayı"
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
          ustEtiket="Şube Düzenle"
          baslik={seciliKayit.subeAdi}
          onGeri={listeyeDon}
          onKaydet={duzenlemeVar ? () => void kaydet() : undefined}
          kaydediliyor={kaydediliyor}
          saltOkunur={!duzenlemeVar}
        >
          <TanimFormBolum baslik="Temel Bilgiler">{temelAlanlar}</TanimFormBolum>
          <OrtakAdresFormu deger={form} onChange={(adres) => setForm((f) => ({ ...f, ...adres }))} />
          <TanimFormBolum baslik="E-Belge Serileri">{ebelgeAlanlar}</TanimFormBolum>
          <TanimFormBolum baslik="Ticari Bilgiler">{ticariAlanlar}</TanimFormBolum>
          <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm((f) => ({ ...f, aktif }))} />
        </TanimDuzenleEkrani>
        <SilmeOnayModal
          acik={silModalAcik}
          onKapat={() => setSilModalAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu şubeyi silmek istiyor musunuz?"
          hedefMetin={`${seciliKayit.subeAdi} (${seciliKayit.subeKodu})`}
          ariaLabel="Şube silme onayı"
        />
      </>
    );
  }

  return (
    <>
      <TanimListeEkrani onYeniEkle={eklemeVar ? yeniBaslat : undefined} yeniEkleMetin="Yeni Şube">
        <TanimKayitTablosu
          baslik="Şubeler"
          kayitlar={kayitlar}
          aramaMetni={(k) =>
            `${k.subeKodu} ${k.subeAdi} ${k.il} ${k.ilce} ${firmaEtiketi(firmalar, k.firmaId)}`
          }
          pasifMi={(k) => firmaBagliPasifMi(k.aktif, k.firmaId)}
          onSatirTikla={(k) => {
            setSeciliId(k.id);
            setForm(subedenForm(k));
            setGorunum('duzenle');
          }}
          kolonlar={[
            {
              id: 'kod',
              baslik: 'Kod',
              sinif: 'ap-tanimlar-tablo-kod',
              hucre: (k) => <span className="ap-tanimlar-tablo-kod">{k.subeKodu}</span>,
            },
            { id: 'ad', baslik: 'Şube Adı', hucre: (k) => k.subeAdi },
            {
              id: 'firma',
              baslik: 'Firma',
              hucre: (k) => firmaEtiketi(firmalar, k.firmaId),
            },
            {
              id: 'konum',
              baslik: 'Konum',
              hucre: (k) => [k.il, k.ilce].filter(Boolean).join(' / ') || '—',
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
        baslik="Bu şubeyi silmek istiyor musunuz?"
        hedefMetin={seciliKayit ? `${seciliKayit.subeAdi} (${seciliKayit.subeKodu})` : ''}
        ariaLabel="Şube silme onayı"
      />
    </>
  );
}
