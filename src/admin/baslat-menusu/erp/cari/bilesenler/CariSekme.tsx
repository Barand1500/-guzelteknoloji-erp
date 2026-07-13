import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cariAdimDogrula,
  cariFormDogrula,
} from '@/admin/baslat-menusu/erp/cari/alanKurallari';
import { cariGuncelle, cariOlustur, cariSil, carileriGetir } from '@/admin/baslat-menusu/erp/cari/api';
import { CariAdresFormu } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariAdresFormu';
import {
  CARI_TIPLERI,
  EFATURA_TIPLERI,
  ISLETME_TURLERI,
  bosCariForm,
  cariTipiEtiketi,
  isletmeTuruEtiketi,
  type AdminCari,
  type CariFormDegeri,
  type CariTipi,
  type TanimGorunumModu,
} from '@/admin/baslat-menusu/erp/cari/tipler';
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
import { VergiDairesiSecici } from '@/admin/baslat-menusu/tanimlar/bilesenler/VergiDairesiSecici';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useModulAksiyonlari, useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

function caridenForm(c: AdminCari): CariFormDegeri {
  return {
    ustId: c.ustId,
    cariTipi: c.cariTipi,
    isletmeTuru: (c.isletmeTuru as CariFormDegeri['isletmeTuru']) || '',
    cariKodu: c.cariKodu,
    cariAdi: c.cariAdi,
    unvan: c.unvan,
    yetkili: c.yetkili,
    vergiDairesi: c.vergiDairesi,
    vergiNo: c.vergiNo,
    il: c.il,
    ilce: c.ilce,
    adres: c.adres,
    telefon: c.telefon,
    eposta: c.eposta,
    web: c.web,
    efatura: c.efatura,
    efaturaTipi: c.efaturaTipi || 'E-ARSIV',
    alias: c.alias,
    aktif: c.aktif,
  };
}

function formlarEsit(a: CariFormDegeri, b: CariFormDegeri): boolean {
  return (Object.keys(a) as (keyof CariFormDegeri)[]).every((k) => a[k] === b[k]);
}

export function CariSekme() {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { duzenlemeVar, eklemeVar, silmeVar } = useYetkiler();
  const [kayitlar, setKayitlar] = useState<AdminCari[]>([]);
  const [form, setForm] = useState<CariFormDegeri>(bosCariForm);
  const [gorunum, setGorunum] = useState<TanimGorunumModu>('liste');
  const [sihirbazAdim, setSihirbazAdim] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [silModalAcik, setSilModalAcik] = useState(false);
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [tipFiltre, setTipFiltre] = useState<CariTipi | ''>('');

  async function yukle() {
    setYukleniyor(true);
    try {
      setKayitlar(await carileriGetir(tipFiltre));
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Cariler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }

  useEffect(() => {
    void yukle();
  }, [tipFiltre]);

  const listeyeDon = useCallback(() => {
    setGorunum('liste');
    setSeciliId(null);
    setForm(bosCariForm);
    setSihirbazAdim(0);
  }, []);

  const yeniBaslat = useCallback(() => {
    setSeciliId(null);
    setForm(bosCariForm);
    setSihirbazAdim(0);
    setGorunum('ekle');
  }, []);

  const seciliKayit = useMemo(
    () => (seciliId ? kayitlar.find((k) => k.id === seciliId) ?? null : null),
    [seciliId, kayitlar]
  );

  const kirli = useMemo(() => {
    if (gorunum === 'duzenle' && seciliKayit) {
      return !formlarEsit(form, caridenForm(seciliKayit));
    }
    if (gorunum === 'ekle') {
      return form.cariKodu.trim() !== '' || form.cariAdi.trim() !== '';
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
    const hata = cariFormDogrula(form);
    if (hata) {
      hataBildir(hata);
      return;
    }
    const hedef = `«${form.cariAdi.trim()}» (${form.cariKodu.trim()}) cari kartını`;
    setKaydediliyor(true);
    try {
      if (gorunum === 'duzenle' && seciliId) {
        await cariGuncelle(seciliId, form);
        logMesajiAyarla(logMesaj.guncelledi('Cari Kartlar', hedef));
        basariBildir('Cari kart güncellendi.');
      } else {
        await cariOlustur(form);
        logMesajiAyarla(logMesaj.ekledi('Cari Kartlar', hedef));
        basariBildir('Cari kart eklendi.');
      }
      listeyeDon();
      await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [form, gorunum, seciliId, listeyeDon, logMesajiAyarla, basariBildir, hataBildir, duzenlemeVar, eklemeVar]);

  const sil = useCallback(() => {
    if (gorunum === 'duzenle' && seciliId) setSilModalAcik(true);
  }, [gorunum, seciliId]);

  const silOnayla = useCallback(async () => {
    if (!seciliId) return;
    const silinen = seciliKayit;
    setSilModalAcik(false);
    setKaydediliyor(true);
    try {
      await cariSil(seciliId);
      if (silinen) {
        logMesajiAyarla(
          logMesaj.sildi('Cari Kartlar', `«${silinen.cariAdi}» (${silinen.cariKodu}) cari kartını`)
        );
      }
      basariBildir('Cari kart silindi.');
      listeyeDon();
      await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, seciliKayit, listeyeDon, logMesajiAyarla, basariBildir, hataBildir]);

  useModulAksiyonlari(
    { kaydet, ekle: yeniBaslat, sil },
    {
      kaydet: gorunum === 'duzenle' && duzenlemeVar && !kaydediliyor,
      ekle: gorunum === 'liste' && eklemeVar,
      sil: gorunum === 'duzenle' && !!seciliId && silmeVar && !kaydediliyor,
    },
    kirli
  );

  const tipFiltreAlani = (
    <label className="ap-tanimlar-liste-filtre-alan">
      <span>Cari Tipi</span>
      <FormAcilirSecim
        value={tipFiltre}
        onChange={(v) => setTipFiltre(v as CariTipi | '')}
        secenekler={[
          { value: '', label: 'Tümü' },
          ...CARI_TIPLERI.map((t) => ({ value: t.value, label: t.label })),
        ]}
        aria-label="Cari tipi filtresi"
      />
    </label>
  );

  const temelAlanlar = (
    <>
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">Cari Tipi *</span>
          <FormAcilirSecim
            value={form.cariTipi}
            onChange={(cariTipi) => setForm((f) => ({ ...f, cariTipi: cariTipi as CariTipi }))}
            secenekler={CARI_TIPLERI.map((t) => ({ value: t.value, label: t.label }))}
          />
        </label>
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">İşletme Türü</span>
          <FormAcilirSecim
            value={form.isletmeTuru}
            onChange={(isletmeTuru) =>
              setForm((f) => ({ ...f, isletmeTuru: isletmeTuru as CariFormDegeri['isletmeTuru'] }))
            }
            secenekler={[
              { value: '', label: 'Seçilmedi' },
              ...ISLETME_TURLERI.map((t) => ({ value: t.value, label: t.label })),
            ]}
          />
        </label>
      </div>
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <TanimGirdi
          etiket="Cari Kodu"
          deger={form.cariKodu}
          kural="serbestMetin"
          maxLength={30}
          zorunlu
          onChange={(cariKodu) => setForm((f) => ({ ...f, cariKodu }))}
          placeholder="Örn. S.07.0001"
        />
        <TanimGirdi
          etiket="Cari Adı"
          deger={form.cariAdi}
          kural="serbestMetin"
          maxLength={255}
          zorunlu
          onChange={(cariAdi) => setForm((f) => ({ ...f, cariAdi }))}
        />
      </div>
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <TanimGirdi
          etiket="Ünvan"
          deger={form.unvan}
          kural="serbestMetin"
          maxLength={255}
          onChange={(unvan) => setForm((f) => ({ ...f, unvan }))}
        />
        <TanimGirdi
          etiket="Yetkili"
          deger={form.yetkili}
          kural="serbestMetin"
          maxLength={150}
          onChange={(yetkili) => setForm((f) => ({ ...f, yetkili }))}
        />
      </div>
    </>
  );

  const vergiIletisimAlanlar = (
    <>
      <TanimFormBolum baslik="Vergi Bilgileri">
        <VergiDairesiSecici
          deger={form.vergiDairesi}
          onChange={(vergiDairesi) => setForm((f) => ({ ...f, vergiDairesi }))}
        />
        <TanimGirdi
          etiket={form.isletmeTuru === 'GERCEK' ? 'T.C. Kimlik No' : 'Vergi No'}
          deger={form.vergiNo}
          kural="serbestMetin"
          maxLength={form.isletmeTuru === 'GERCEK' ? 11 : 10}
          onChange={(vergiNo) =>
            setForm((f) => ({
              ...f,
              vergiNo: vergiNo.replace(/\D/g, '').slice(0, f.isletmeTuru === 'GERCEK' ? 11 : 10),
            }))
          }
          placeholder={form.isletmeTuru === 'GERCEK' ? '11 haneli T.C. kimlik no' : '10 haneli vergi numarası'}
          inputMode="numeric"
        />
      </TanimFormBolum>
      <CariAdresFormu
        deger={form}
        onChange={(adres) => setForm((f) => ({ ...f, ...adres }))}
      />
      <TanimFormBolum baslik="İletişim">
        <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
          <TanimGirdi
            etiket="Telefon"
            deger={form.telefon}
            kural="serbestMetin"
            maxLength={20}
            onChange={(telefon) => setForm((f) => ({ ...f, telefon }))}
          />
          <TanimGirdi
            etiket="E-posta"
            deger={form.eposta}
            kural="serbestMetin"
            maxLength={191}
            onChange={(eposta) => setForm((f) => ({ ...f, eposta }))}
          />
        </div>
        <TanimGirdi
          etiket="Web"
          deger={form.web}
          kural="serbestMetin"
          maxLength={255}
          onChange={(web) => setForm((f) => ({ ...f, web }))}
          placeholder="www.ornek.com"
        />
      </TanimFormBolum>
    </>
  );

  const ebelgeAlanlar = (
    <TanimFormBolum baslik="E-Belge">
      <div className="ap-tanimlar-aktif-satir">
        <span
          className={`ap-tanimlar-aktif-etiket ${form.efatura ? 'ap-tanimlar-aktif-etiket--aktif' : 'ap-tanimlar-aktif-etiket--pasif'}`}
        >
          {form.efatura ? 'E-Fatura Mükellefi' : 'E-Fatura Değil'}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={form.efatura}
          aria-label="E-Fatura mükellefi"
          onClick={() => setForm((f) => ({ ...f, efatura: !f.efatura }))}
          className={`ap-tanimlar-toggle ${form.efatura ? 'ap-tanimlar-toggle--acik' : ''}`}
        >
          <span className="ap-tanimlar-toggle-dugme" aria-hidden />
        </button>
      </div>
      <label className="ap-tanimlar-secim-alan block">
        <span className="ap-tanim-girdi-etiket">E-Fatura Tipi</span>
        <FormAcilirSecim
          value={form.efaturaTipi}
          onChange={(efaturaTipi) => setForm((f) => ({ ...f, efaturaTipi }))}
          secenekler={EFATURA_TIPLERI.map((t) => ({ value: t.value, label: t.label }))}
        />
      </label>
      <TanimGirdi
        etiket="E-Fatura Alias"
        deger={form.alias}
        kural="serbestMetin"
        maxLength={255}
        onChange={(alias) => setForm((f) => ({ ...f, alias }))}
        placeholder="urn:mail:..."
      />
    </TanimFormBolum>
  );

  if (yukleniyor) return <TanimYukleniyor />;

  if (gorunum === 'ekle') {
    return (
      <>
        <TanimSihirbaz
          baslik="Yeni Cari Kart"
          aktifAdim={sihirbazAdim}
          onAdimDegistir={setSihirbazAdim}
          onIptal={listeyeDon}
          onTamamla={() => void kaydet()}
          adimDogrula={(adim) => cariAdimDogrula(adim, form)}
          onHata={hataBildir}
          tamamlaniyor={kaydediliyor}
          adimlar={[
            {
              baslik: 'Temel Bilgiler',
              aciklama: 'Cari tipi, kod ve unvan bilgilerini girin',
              icerik: temelAlanlar,
            },
            {
              baslik: 'Vergi ve İletişim',
              aciklama: 'Vergi, adres ve iletişim bilgilerini girin',
              icerik: vergiIletisimAlanlar,
            },
            {
              baslik: 'E-Belge ve Durum',
              aciklama: 'E-fatura ayarları ve aktif/pasif durumu',
              icerik: (
                <>
                  {ebelgeAlanlar}
                  <OrtakDurumAlani
                    aktif={form.aktif}
                    onChange={(aktif) => setForm((f) => ({ ...f, aktif }))}
                  />
                </>
              ),
            },
          ]}
        />
        <SilmeOnayModal
          acik={silModalAcik}
          onKapat={() => setSilModalAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu cari kartı silmek istiyor musunuz?"
          hedefMetin=""
          ariaLabel="Cari silme onayı"
        />
      </>
    );
  }

  if (gorunum === 'duzenle') {
    if (!seciliKayit) return <TanimYukleniyor />;
    return (
      <>
        <TanimDuzenleEkrani
          ustEtiket="Cari Düzenle"
          baslik={seciliKayit.cariAdi}
          onGeri={listeyeDon}
          onKaydet={duzenlemeVar ? () => void kaydet() : undefined}
          kaydediliyor={kaydediliyor}
          saltOkunur={!duzenlemeVar}
        >
          <TanimFormBolum baslik="Temel Bilgiler">{temelAlanlar}</TanimFormBolum>
          {vergiIletisimAlanlar}
          {ebelgeAlanlar}
          <OrtakDurumAlani aktif={form.aktif} onChange={(aktif) => setForm((f) => ({ ...f, aktif }))} />
        </TanimDuzenleEkrani>
        <SilmeOnayModal
          acik={silModalAcik}
          onKapat={() => setSilModalAcik(false)}
          onOnayla={() => void silOnayla()}
          baslik="Bu cari kartı silmek istiyor musunuz?"
          hedefMetin={`${seciliKayit.cariAdi} (${seciliKayit.cariKodu})`}
          ariaLabel="Cari silme onayı"
        />
      </>
    );
  }

  return (
    <>
      <TanimListeEkrani onYeniEkle={eklemeVar ? yeniBaslat : undefined} yeniEkleMetin="Yeni Cari">
        <TanimKayitTablosu
          baslik="Cari Kartlar"
          kayitlar={kayitlar}
          filtre={tipFiltreAlani}
          aramaMetni={(k) =>
            `${k.cariKodu} ${k.cariAdi} ${k.unvan} ${k.vergiNo} ${k.il} ${k.yetkili}`
          }
          pasifMi={(k) => !k.aktif}
          onSatirTikla={(k) => {
            setSeciliId(k.id);
            setForm(caridenForm(k));
            setGorunum('duzenle');
          }}
          onDuzenle={
            duzenlemeVar
              ? (k) => {
                  setSeciliId(k.id);
                  setForm(caridenForm(k));
                  setGorunum('duzenle');
                }
              : undefined
          }
          onSil={
            silmeVar
              ? (k) => {
                  setSeciliId(k.id);
                  setForm(caridenForm(k));
                  setSilModalAcik(true);
                }
              : undefined
          }
          kolonlar={[
            {
              id: 'kod',
              baslik: 'Kod',
              sinif: 'ap-tanimlar-tablo-kod',
              hucre: (k) => <span className="ap-tanimlar-tablo-kod">{k.cariKodu}</span>,
            },
            { id: 'ad', baslik: 'Cari Adı', hucre: (k) => k.cariAdi },
            { id: 'tip', baslik: 'Tip', hucre: (k) => cariTipiEtiketi(k.cariTipi) },
            {
              id: 'isletme',
              baslik: 'İşletme Türü',
              hucre: (k) => isletmeTuruEtiketi(k.isletmeTuru),
            },
            { id: 'vergi', baslik: 'Vergi No', hucre: (k) => k.vergiNo || '—' },
            { id: 'il', baslik: 'İl', hucre: (k) => k.il || '—' },
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
        baslik="Bu cari kartı silmek istiyor musunuz?"
        hedefMetin={seciliKayit ? `${seciliKayit.cariAdi} (${seciliKayit.cariKodu})` : ''}
        ariaLabel="Cari silme onayı"
      />
    </>
  );
}
