import { useCallback, useEffect, useMemo, useState, type MutableRefObject } from 'react';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { cariOlustur, cariGuncelle, carileriGetir } from '../api';
import { cariFormDogrula } from '../alanKurallari';
import {
  cariIsletmeTuruEkle,
  cariIsletmeTuruGuncelle,
  cariIsletmeTuruSil,
  cariIsletmeTurleriGetir,
  type CariIsletmeTuruSecenek,
} from '../cariIsletmeTurleri';
import {
  cariKartTipiEkle,
  cariKartTipiGuncelle,
  cariKartTipiSil,
  cariKartTipleriGetir,
  type CariKartTipiSecenek,
} from '../cariKartTipleri';
import { caridenForm } from '../cariYardimci';
import {
  EFATURA_SECIMLERI,
  bosCariForm,
  efaturaSecimDegeri,
  kartTipindenApiCariTipi,
  type AdminCari,
  type CariFormDegeri,
  type CariKartModu,
} from '../tipler';
import { CariOutlinedAcilir } from './CariOutlinedAcilir';
import { CariOutlinedEposta } from './CariOutlinedEposta';
import { CariOutlinedGirdi } from './CariOutlinedGirdi';
import { CariOutlinedTelefon } from './CariOutlinedTelefon';
import { CariOutlinedVergiDairesi } from './CariOutlinedVergiDairesi';
import { CariOutlinedVergiNo } from './CariOutlinedVergiNo';
import { CariSecenekModal } from './CariSecenekModal';
import { CariUstCariSecici } from './CariUstCariSecici';
function formlarEsit(a: CariFormDegeri, b: CariFormDegeri): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function SecimChipleri({
  etiket,
  zorunlu,
  secenekler,
  deger,
  saltOkunur,
  onYonet,
  onDegistir,
}: {
  etiket: string;
  zorunlu?: boolean;
  secenekler: readonly { value: string; label: string }[];
  deger: string;
  saltOkunur: boolean;
  onYonet?: () => void;
  onDegistir: (deger: string) => void;
}) {
  return (
    <div className="cari-secili-alan">
      <div className="cari-secili-etiket-satir">
        <span className="cari-secili-etiket">
          {etiket}
          {zorunlu ? <span className="cari-outlined-zorunlu"> *</span> : null}
        </span>
        {!saltOkunur && onYonet ? (
          <button
            type="button"
            className="cari-secili-yonet"
            onClick={onYonet}
            title={`${etiket} yönet`}
            aria-label={`${etiket} yönet`}
          >
            +
          </button>
        ) : null}
      </div>
      <div className="cari-secili-chip-grup" role="group" aria-label={etiket}>
        {secenekler.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`cari-secili-chip${deger === s.value ? ' cari-secili-chip--aktif' : ''}`}
            disabled={saltOkunur}
            onClick={() => onDegistir(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CariKart({  mod,
  cariId,
  onKaydedildi,
  kaydetRef,
  onKirliDegistir,
}: {
  mod: CariKartModu;
  cariId: string | null;
  onKaydedildi: () => void;
  kaydetRef: MutableRefObject<(() => Promise<void>) | null>;
  onKirliDegistir: (kirli: boolean) => void;
}) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar } = useYetkiler('cari');
  const saltOkunur = mod === 'incele';
  const [kayitlar, setKayitlar] = useState<AdminCari[]>([]);
  const [form, setForm] = useState<CariFormDegeri>(bosCariForm);
  const [baslangic, setBaslangic] = useState<CariFormDegeri>(bosCariForm);
  const [baslangicKartTipi, setBaslangicKartTipi] = useState('ALICI');
  const [kartTipiSecim, setKartTipiSecim] = useState('ALICI');
  const [yukleniyor, setYukleniyor] = useState(mod !== 'yeni');
  const [kartTipleri, setKartTipleri] = useState<CariKartTipiSecenek[]>(() => cariKartTipleriGetir());
  const [isletmeTurleri, setIsletmeTurleri] = useState<CariIsletmeTuruSecenek[]>(() =>
    cariIsletmeTurleriGetir()
  );
  const [tipModalAcik, setTipModalAcik] = useState(false);
  const [isletmeModalAcik, setIsletmeModalAcik] = useState(false);

  const seciliKayit = useMemo(
    () => (cariId ? kayitlar.find((k) => k.id === cariId) ?? null : null),
    [cariId, kayitlar]
  );

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      setKayitlar(await carileriGetir());
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Cariler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  useEffect(() => {
    if (mod === 'yeni') {
      setForm(bosCariForm);
      setBaslangic(bosCariForm);
      setKartTipiSecim('ALICI');
      setBaslangicKartTipi('ALICI');
      return;
    }
    if (seciliKayit) {
      const dolu = caridenForm(seciliKayit);
      setForm(dolu);
      setBaslangic(dolu);
      setKartTipiSecim(seciliKayit.cariTipi);
      setBaslangicKartTipi(seciliKayit.cariTipi);
    }
  }, [mod, seciliKayit]);

  const kirli = useMemo(
    () => !formlarEsit(form, baslangic) || kartTipiSecim !== baslangicKartTipi,
    [baslangic, baslangicKartTipi, form, kartTipiSecim]
  );

  useEffect(() => {
    onKirliDegistir(kirli);
  }, [kirli, onKirliDegistir]);

  const setAlan = useCallback(<K extends keyof CariFormDegeri>(alan: K, deger: CariFormDegeri[K]) => {
    setForm((f) => ({ ...f, [alan]: deger }));
  }, []);

  const kaydet = useCallback(async () => {
    if (saltOkunur) return;
    if (mod === 'duzenle' && !duzenlemeVar) {
      const mesaj = 'Kayıt düzenleme yetkiniz yok';
      hataBildir(mesaj);
      throw new Error(mesaj);
    }
    if (mod === 'yeni' && !eklemeVar) {
      const mesaj = 'Yeni kayıt ekleme yetkiniz yok';
      hataBildir(mesaj);
      throw new Error(mesaj);
    }
    const apiForm: CariFormDegeri = {
      ...form,
      cariTipi: kartTipindenApiCariTipi(kartTipiSecim),
      aktif: mod === 'yeni' ? true : form.aktif,
    };
    const hata = cariFormDogrula(apiForm);
    if (hata) {
      hataBildir(hata);
      throw new Error(hata);
    }
    try {
      if (mod === 'duzenle' && cariId) {
        await cariGuncelle(cariId, apiForm);
        basariBildir('Cari kart güncellendi.');
      } else {
        await cariOlustur(apiForm);
        basariBildir('Cari kart eklendi.');
      }
      onKaydedildi();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Kayıt başarısız');
      throw e;
    }
  }, [
    basariBildir,
    cariId,
    duzenlemeVar,
    eklemeVar,
    form,
    hataBildir,
    kartTipiSecim,
    mod,
    onKaydedildi,
    saltOkunur,
  ]);

  useEffect(() => {
    kaydetRef.current = kaydet;
    return () => {
      kaydetRef.current = null;
    };
  }, [kaydet, kaydetRef]);

  const kimlikModu =
    form.isletmeTuru === 'GERCEK' ? 'gercek' : form.isletmeTuru === 'YABANCI' ? 'yabanci' : 'tuzel';
  const efaturaSecim = efaturaSecimDegeri(form.efatura, form.efaturaTipi);
  const efaturaSecenekleri = EFATURA_SECIMLERI.map((s) => ({ value: s.value, label: s.label }));

  if (yukleniyor && mod !== 'yeni') return <TanimYukleniyor />;
  if (mod !== 'yeni' && !seciliKayit) return <TanimYukleniyor />;

  return (
    <>
      <div className={`cari-kart-sayfa${saltOkunur ? ' cari-kart-sayfa--salt' : ''}`}>
        <div className={`cari-kart-kabuk${saltOkunur ? ' cari-kart-kabuk--salt' : ''}`}>
          <div className="cari-kart-grid">
            <SecimChipleri
              etiket="Cari Tipi"
              zorunlu
              secenekler={kartTipleri}
              deger={kartTipiSecim}
              saltOkunur={saltOkunur}
              onYonet={() => setTipModalAcik(true)}
              onDegistir={setKartTipiSecim}
            />
            <SecimChipleri
              etiket="İşletme Türü"
              secenekler={isletmeTurleri}
              deger={form.isletmeTuru}
              saltOkunur={saltOkunur}
              onYonet={() => setIsletmeModalAcik(true)}
              onDegistir={(isletmeTuru) => {
                setForm((f) => ({
                  ...f,
                  isletmeTuru,
                  vergiDairesi:
                    isletmeTuru === 'YABANCI' || isletmeTuru === 'GERCEK' ? '' : f.vergiDairesi,
                  vergiNo: isletmeTuru === 'YABANCI' || isletmeTuru === 'GERCEK' ? '' : f.vergiNo,
                }));
              }}
            />
            <CariOutlinedGirdi
              etiket="Cari Kodu"
              deger={form.cariKodu}
              zorunlu
              maxLength={30}
              buyukHarf
              odakPlaceholder="Cari kodunu yazınız"
              disabled={saltOkunur}
              onChange={(cariKodu) => setAlan('cariKodu', cariKodu)}
            />
            <CariOutlinedGirdi
              etiket="Cari Adı"
              deger={form.cariAdi}
              zorunlu
              maxLength={255}
              odakPlaceholder="Cari adını yazınız"
              disabled={saltOkunur}
              onChange={(cariAdi) => setAlan('cariAdi', cariAdi)}
            />
            <CariOutlinedGirdi
              etiket="Ünvan"
              deger={form.unvan}
              className="cari-alan-tam"
              maxLength={255}
              odakPlaceholder="Ünvanı yazınız"
              disabled={saltOkunur}
              onChange={(unvan) => setAlan('unvan', unvan)}
            />
            <CariOutlinedGirdi
              etiket="Yetkili"
              deger={form.yetkili}
              maxLength={120}
              odakPlaceholder="Yetkili adını yazınız"
              disabled={saltOkunur}
              onChange={(yetkili) => setAlan('yetkili', yetkili)}
            />
            <CariUstCariSecici
              ustId={form.ustId}
              cariler={kayitlar}
              haricId={cariId}
              disabled={saltOkunur}
              onChange={(ustId) => setAlan('ustId', ustId)}
            />

            {kimlikModu === 'yabanci' ? (
              <CariOutlinedGirdi
                etiket="Pasaport No"
                deger={form.vergiNo}
                className="cari-alan-tam"
                maxLength={20}
                buyukHarf
                odakPlaceholder="Pasaport numarasını yazınız"
                disabled={saltOkunur}
                onChange={(vergiNo) =>
                  setAlan('vergiNo', vergiNo.replace(/[^A-Za-z0-9]/g, '').slice(0, 20).toUpperCase())
                }
              />
            ) : kimlikModu === 'gercek' ? (
              <CariOutlinedVergiNo
                etiket="T.C. Kimlik No"
                deger={form.vergiNo}
                className="cari-alan-tam"
                maxHane={11}
                disabled={saltOkunur}
                onChange={(vergiNo) => setAlan('vergiNo', vergiNo)}
              />
            ) : (
              <>
                <CariOutlinedVergiDairesi
                  deger={form.vergiDairesi}
                  disabled={saltOkunur}
                  onChange={(vergiDairesi) => setAlan('vergiDairesi', vergiDairesi)}
                />
                <CariOutlinedVergiNo
                  etiket="Vergi No"
                  deger={form.vergiNo}
                  maxHane={10}
                  disabled={saltOkunur}
                  onChange={(vergiNo) => setAlan('vergiNo', vergiNo)}
                />
              </>
            )}
            <CariOutlinedGirdi
              etiket="Adres"
              deger={form.adres}
              className="cari-alan-tam"
              maxLength={500}
              odakPlaceholder="Adresi yazınız"
              disabled={saltOkunur}
              onChange={(adres) => setAlan('adres', adres)}
            />
            <CariOutlinedGirdi
              etiket="İl"
              deger={form.il}
              maxLength={40}
              odakPlaceholder="İl yazınız"
              disabled={saltOkunur}
              onChange={(il) => setAlan('il', il)}
            />
            <CariOutlinedGirdi
              etiket="İlçe"
              deger={form.ilce}
              maxLength={40}
              odakPlaceholder="İlçe yazınız"
              disabled={saltOkunur}
              onChange={(ilce) => setAlan('ilce', ilce)}
            />
            <CariOutlinedTelefon
              deger={form.telefon}
              disabled={saltOkunur}
              onChange={(telefon) => setAlan('telefon', telefon)}
            />
            <CariOutlinedEposta
              deger={form.eposta}
              disabled={saltOkunur}
              onChange={(eposta) => setAlan('eposta', eposta)}
            />
            <CariOutlinedGirdi
              etiket="Web"
              deger={form.web}
              maxLength={120}
              odakPlaceholder="www.ornek.com"
              disabled={saltOkunur}
              onChange={(web) => setAlan('web', web)}
            />
            <CariOutlinedAcilir
              etiket="E-Fatura"
              deger={efaturaSecim}
              secenekler={efaturaSecenekleri}
              disabled={saltOkunur}
              onChange={(v) => {
                const secim = EFATURA_SECIMLERI.find((s) => s.value === v);
                if (!secim) return;
                setForm((f) => ({
                  ...f,
                  efatura: secim.efatura,
                  efaturaTipi: secim.efaturaTipi,
                  alias: secim.efatura ? f.alias : '',
                }));
              }}
            />
            {form.efatura ? (
              <CariOutlinedGirdi
                etiket="Alias"
                deger={form.alias}
                className="cari-alan-tam"
                maxLength={200}
                odakPlaceholder="urn:mail:…"
                disabled={saltOkunur}
                onChange={(alias) => setAlan('alias', alias)}
              />
            ) : null}
          </div>

          {mod !== 'yeni' && seciliKayit && (seciliKayit.olusturma || seciliKayit.guncelleme) ? (
            <div className="cari-kart-tarihler">
              {seciliKayit.olusturma ? (
                <span>
                  <em>Kayıt</em> {tarihSaatFormatla(seciliKayit.olusturma)}
                </span>
              ) : null}
              {seciliKayit.olusturma && seciliKayit.guncelleme ? (
                <span className="cari-kart-tarihler-ayrac">·</span>
              ) : null}
              {seciliKayit.guncelleme ? (
                <span>
                  <em>Güncelleme</em> {tarihSaatFormatla(seciliKayit.guncelleme)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <CariSecenekModal
        acik={tipModalAcik}
        baslik="Cari Tipi"
        placeholder="Yeni cari tipi adı…"
        liste={kartTipleri}
        sabitDegerler={['ALICI', 'SATICI']}
        onEkle={(ad) => {
          const sonuc = cariKartTipiEkle(ad);
          if (!sonuc) return false;
          setKartTipleri(cariKartTipleriGetir());
          return true;
        }}
        onGuncelle={(value, ad) => {
          const ok = cariKartTipiGuncelle(value, ad);
          if (ok) setKartTipleri(cariKartTipleriGetir());
          return ok;
        }}
        onSil={(value) => {
          cariKartTipiSil(value);
          setKartTipleri(cariKartTipleriGetir());
          if (kartTipiSecim === value) setKartTipiSecim('ALICI');
        }}
        onKapat={() => setTipModalAcik(false)}
      />

      <CariSecenekModal
        acik={isletmeModalAcik}
        baslik="İşletme Türü"
        placeholder="Yeni işletme türü adı…"
        liste={isletmeTurleri}
        sabitDegerler={['TUZEL', 'GERCEK', 'YABANCI']}
        onEkle={(ad) => {
          const sonuc = cariIsletmeTuruEkle(ad);
          if (!sonuc) return false;
          setIsletmeTurleri(cariIsletmeTurleriGetir());
          return true;
        }}
        onGuncelle={(value, ad) => {
          const ok = cariIsletmeTuruGuncelle(value, ad);
          if (ok) setIsletmeTurleri(cariIsletmeTurleriGetir());
          return ok;
        }}
        onSil={(value) => {
          cariIsletmeTuruSil(value);
          setIsletmeTurleri(cariIsletmeTurleriGetir());
          if (form.isletmeTuru === value) setAlan('isletmeTuru', '');
        }}
        onKapat={() => setIsletmeModalAcik(false)}
      />
    </>
  );
}
