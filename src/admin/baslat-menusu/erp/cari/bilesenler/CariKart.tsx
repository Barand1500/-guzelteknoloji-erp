import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MutableRefObject,
} from 'react';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { cariOlustur, cariGuncelle, carileriGetir } from '../api';
import { cariFormDogrula, cariVergiNoDoluVeGecerliMi } from '../alanKurallari';
import { cariIletisimKaydet } from '../cariIletisimDeposu';
import { cariDosyaDokumanKaydet } from '../cariDosyaDokumanDeposu';
import { cariEirsaliyeAliasKaydet } from '../cariEirsaliyeAliasDeposu';
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
  EFATURA_EVET_HAYIR,
  FATURA_TIPLERI,
  bosCariForm,
  kartTipindenApiCariTipi,
  type AdminCari,
  type CariFormDegeri,
  type CariKartModu,
} from '../tipler';
import { stokFiyatAdlariGetir } from '@/admin/baslat-menusu/erp/stoklar/stokFiyatAdlari';
import { CariDosyaDokumanBolumu } from './CariDosyaDokumanBolumu';
import { CariIletisimBolumu } from './CariIletisimBolumu';
import { CariOutlinedAcilir } from './CariOutlinedAcilir';
import { CariOutlinedAramaAcilir } from './CariOutlinedAramaAcilir';
import { CariOutlinedEposta } from './CariOutlinedEposta';
import { CariOutlinedGirdi } from './CariOutlinedGirdi';
import { CariOutlinedIl, CariOutlinedIlce } from './CariOutlinedIlArama';
import { CariOutlinedTelefon } from './CariOutlinedTelefon';
import { CariOutlinedVergiDairesi } from './CariOutlinedVergiDairesi';
import { CariOutlinedVergiNo } from './CariOutlinedVergiNo';
import { CariSecenekModal } from './CariSecenekModal';

function formlarEsit(a: CariFormDegeri, b: CariFormDegeri): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function apiFormHazirla(form: CariFormDegeri, kartTipiSecim: string, mod: CariKartModu): CariFormDegeri {
  const { iletisimKisiler, dosyaDokuman: _dokuman, eirsaliyeAlias: _eirsaliye, ...rest } = form;
  const ilkKisi = iletisimKisiler.find((k) => k.adSoyad.trim());
  return {
    ...rest,
    iletisimKisiler: [],
    dosyaDokuman: { notlar: [], dosyalar: [], etiketler: [] },
    eirsaliyeAlias: '',
    cariTipi: kartTipindenApiCariTipi(kartTipiSecim),
    yetkili: ilkKisi?.adSoyad.trim() ?? '',
    aktif: mod === 'yeni' ? true : form.aktif,
    efaturaTipi: form.efatura ? form.efaturaTipi : 'TEMEL',
    alias: form.efatura ? form.alias : '',
    earsivAlias: form.earsiv ? form.earsivAlias : '',
  };
}

function SecimChipleri({
  etiket,
  secenekler,
  deger,
  saltOkunur,
  onYonet,
  onDegistir,
}: {
  etiket: string;
  secenekler: readonly { value: string; label: string }[];
  deger: string;
  saltOkunur: boolean;
  onYonet?: () => void;
  onDegistir: (deger: string) => void;
}) {
  return (
    <div className="cari-secili-alan">
      <div className="cari-secili-etiket-satir">
        <span className="cari-secili-etiket">{etiket}</span>
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

export function CariKart({
  mod,
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
    const apiForm = apiFormHazirla(form, kartTipiSecim, mod);
    const hata = cariFormDogrula(apiForm);
    if (hata) {
      hataBildir(hata);
      throw new Error(hata);
    }
    try {
      let kaydedilenId = cariId;
      if (mod === 'duzenle' && cariId) {
        await cariGuncelle(cariId, apiForm);
        basariBildir('Cari kart güncellendi.');
      } else {
        const yeni = await cariOlustur(apiForm);
        kaydedilenId = yeni.id;
        basariBildir('Cari kart eklendi.');
      }
      if (kaydedilenId) {
        cariIletisimKaydet(kaydedilenId, form.iletisimKisiler);
        cariDosyaDokumanKaydet(kaydedilenId, form.dosyaDokuman);
        cariEirsaliyeAliasKaydet(kaydedilenId, form.eirsaliyeAlias);
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
    form.isletmeTuru === 'GERCEK'
      ? 'gercek'
      : form.isletmeTuru === 'YABANCI'
        ? 'yabanci'
        : form.isletmeTuru
          ? 'tuzel'
          : null;

  const kimlikBulGoster =
    mod === 'yeni' &&
    !saltOkunur &&
    !!kimlikModu &&
    cariVergiNoDoluVeGecerliMi(form.vergiNo, form.isletmeTuru);

  const kimlikIleBul = useCallback(async () => {
    const aranan = form.vergiNo.trim().toLocaleUpperCase('tr');
    if (!aranan || !cariVergiNoDoluVeGecerliMi(form.vergiNo, form.isletmeTuru)) return;

    let liste = kayitlar;
    try {
      liste = await carileriGetir();
      setKayitlar(liste);
    } catch {
      // Eldeki listeyle devam et
    }

    const bulunan = liste.find(
      (k) => k.vergiNo.trim().toLocaleUpperCase('tr') === aranan
    );
    if (!bulunan) {
      hataBildir('Bu numaraya ait kayıtlı cari bulunamadı.');
      return;
    }

    const dolu = caridenForm(bulunan);
    setForm({
      ...dolu,
      vergiNo: form.vergiNo.trim(),
    });
    setKartTipiSecim(bulunan.cariTipi);
    basariBildir(`Kayıt bulundu: ${bulunan.cariAdi || bulunan.cariKodu}`);
  }, [basariBildir, form.isletmeTuru, form.vergiNo, hataBildir, kayitlar]);

  const kimlikBulEnter = kimlikBulGoster ? () => void kimlikIleBul() : undefined;

  const kimlikBulButonu = kimlikBulGoster ? (
    <button
      type="button"
      className="cari-adres-cek"
      onClick={() => void kimlikIleBul()}
      title="Bu numaraya ait kayıtlı cariyi getir"
    >
      Bul
    </button>
  ) : null;

  if (yukleniyor && mod !== 'yeni') return <TanimYukleniyor />;
  if (mod !== 'yeni' && !seciliKayit) return <TanimYukleniyor />;

  return (
    <>
      <div className={`cari-kart-sayfa${saltOkunur ? ' cari-kart-sayfa--salt' : ''}`}>
        <div className={`cari-kart-kabuk${saltOkunur ? ' cari-kart-kabuk--salt' : ''}`}>
          <div className="cari-kart-grid">
            <div className="cari-kart-ust-satir">
              <CariOutlinedAramaAcilir
                etiket="Cari Tipi"
                zorunlu
                deger={kartTipiSecim}
                secenekler={kartTipleri}
                disabled={saltOkunur}
                aramaPlaceholder="Cari tipi ara…"
                onYonet={() => setTipModalAcik(true)}
                onChange={setKartTipiSecim}
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
              <div
                className={`cari-kart-ust-kimlik${kimlikModu === 'tuzel' ? ' cari-kart-ust-kimlik--tuzel' : ''}${!kimlikModu ? ' cari-kart-ust-kimlik--bos' : ''}`}
              >
                {kimlikModu === 'yabanci' ? (
                  <CariOutlinedGirdi
                    etiket="Pasaport No"
                    deger={form.vergiNo}
                    maxLength={20}
                    buyukHarf
                    odakPlaceholder="Pasaport numarasını yazınız"
                    disabled={saltOkunur}
                    onChange={(vergiNo) =>
                      setAlan('vergiNo', vergiNo.replace(/[^A-Za-z0-9]/g, '').slice(0, 20).toUpperCase())
                    }
                    sonek={kimlikBulButonu}
                    onEnter={kimlikBulEnter}
                  />
                ) : kimlikModu === 'gercek' ? (
                  <CariOutlinedVergiNo
                    etiket="T.C. Kimlik No"
                    deger={form.vergiNo}
                    maxHane={11}
                    disabled={saltOkunur}
                    onChange={(vergiNo) => setAlan('vergiNo', vergiNo)}
                    sonek={kimlikBulButonu}
                    onEnter={kimlikBulEnter}
                  />
                ) : kimlikModu === 'tuzel' ? (
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
                      sonek={kimlikBulButonu}
                      onEnter={kimlikBulEnter}
                    />
                  </>
                ) : null}
              </div>
            </div>
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
              etiket="Tabela Adı"
              deger={form.cariAdi}
              zorunlu
              maxLength={255}
              buyukHarf
              odakPlaceholder="Tabela adını yazınız"
              disabled={saltOkunur}
              onChange={(cariAdi) => setAlan('cariAdi', cariAdi)}
            />
            <div className="cari-unvan-fiyat-satir cari-alan-tam">
              <CariOutlinedGirdi
                etiket="Ünvanı"
                deger={form.unvan}
                maxLength={255}
                buyukHarf
                odakPlaceholder="Ünvanı yazınız"
                disabled={saltOkunur}
                onChange={(unvan) => setAlan('unvan', unvan)}
              />
              <CariOutlinedAramaAcilir
                etiket="Fiyat Tanımı"
                deger={form.fiyatTanimi}
                secenekler={stokFiyatAdlariGetir()}
                disabled={saltOkunur}
                aramaPlaceholder="Fiyat tanımı ara…"
                onChange={(fiyatTanimi) => setAlan('fiyatTanimi', fiyatTanimi)}
                bosMetin=""
                kutuIciArama
              />
            </div>
            <CariOutlinedGirdi
              etiket="Adres"
              deger={form.adres}
              maxLength={500}
              odakPlaceholder="Adresi yazınız"
              disabled={saltOkunur}
              onChange={(adres) => setAlan('adres', adres)}
            />
            <CariOutlinedGirdi
              etiket="Web"
              deger={form.web}
              maxLength={120}
              odakPlaceholder="www.ornek.com"
              disabled={saltOkunur}
              onChange={(web) => setAlan('web', web)}
            />
            <CariOutlinedIl
              deger={form.il}
              disabled={saltOkunur}
              onChange={(il) => {
                setForm((f) => ({
                  ...f,
                  il,
                  ilce: il !== f.il ? '' : f.ilce,
                }));
              }}
            />
            <CariOutlinedIlce
              deger={form.ilce}
              il={form.il}
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
            <div className="cari-efatura-earsiv-satir cari-alan-tam">
              <CariOutlinedAcilir
                etiket="E-Fatura"
                deger={form.efatura ? 'EVET' : 'HAYIR'}
                secenekler={EFATURA_EVET_HAYIR}
                disabled={saltOkunur}
                onChange={(v) => {
                  const evet = v === 'EVET';
                  setForm((f) => ({
                    ...f,
                    efatura: evet,
                    alias: evet ? f.alias : '',
                    efaturaTipi: evet ? f.efaturaTipi || 'TEMEL' : 'TEMEL',
                  }));
                }}
              />
              <CariOutlinedAcilir
                etiket="E-Arşiv"
                deger={form.earsiv ? 'EVET' : 'HAYIR'}
                secenekler={EFATURA_EVET_HAYIR}
                disabled={saltOkunur}
                onChange={(v) => {
                  const evet = v === 'EVET';
                  setForm((f) => ({
                    ...f,
                    earsiv: evet,
                    earsivAlias: evet ? f.earsivAlias : '',
                  }));
                }}
              />
            </div>
            {form.efatura && form.earsiv ? (
              <div className="cari-efatura-earsiv-satir cari-alan-tam">
                <CariOutlinedGirdi
                  etiket="E-Fatura Alias"
                  deger={form.alias}
                  maxLength={200}
                  odakPlaceholder="Alias giriniz"
                  disabled={saltOkunur}
                  onChange={(alias) => setAlan('alias', alias)}
                />
                <CariOutlinedGirdi
                  etiket="E-Arşiv Alias"
                  deger={form.earsivAlias}
                  maxLength={200}
                  odakPlaceholder="Alias giriniz"
                  disabled={saltOkunur}
                  onChange={(earsivAlias) => setAlan('earsivAlias', earsivAlias)}
                />
              </div>
            ) : form.efatura ? (
              <CariOutlinedGirdi
                etiket="E-Fatura Alias"
                deger={form.alias}
                maxLength={200}
                odakPlaceholder="Alias giriniz"
                disabled={saltOkunur}
                onChange={(alias) => setAlan('alias', alias)}
              />
            ) : form.earsiv ? (
              <CariOutlinedGirdi
                etiket="E-Arşiv Alias"
                deger={form.earsivAlias}
                maxLength={200}
                odakPlaceholder="Alias giriniz"
                disabled={saltOkunur}
                onChange={(earsivAlias) => setAlan('earsivAlias', earsivAlias)}
              />
            ) : null}
            {form.efatura ? (
              <CariOutlinedAcilir
                etiket="Fatura Tipi"
                deger={form.efaturaTipi || 'TEMEL'}
                secenekler={[...FATURA_TIPLERI]}
                disabled={saltOkunur}
                onChange={(efaturaTipi) => setAlan('efaturaTipi', efaturaTipi)}
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

        <CariIletisimBolumu
          kisiler={form.iletisimKisiler}
          efaturaAlias={form.alias}
          eirsaliyeAlias={form.eirsaliyeAlias}
          varsayilanAdres={form.adres}
          varsayilanIl={form.il}
          varsayilanIlce={form.ilce}
          disabled={saltOkunur}
          onChange={(iletisimKisiler) => setAlan('iletisimKisiler', iletisimKisiler)}
          onEfaturaAliasChange={(alias) => setAlan('alias', alias)}
          onEirsaliyeAliasChange={(eirsaliyeAlias) => setAlan('eirsaliyeAlias', eirsaliyeAlias)}
        />

        <CariDosyaDokumanBolumu
          deger={form.dosyaDokuman}
          disabled={saltOkunur}
          onChange={(dosyaDokuman) => setAlan('dosyaDokuman', dosyaDokuman)}
          onHata={hataBildir}
        />
      </div>

      <CariSecenekModal
        acik={tipModalAcik}
        baslik="Cari Tipi"
        placeholder="Yeni cari tipi adı…"
        liste={kartTipleri}
        sabitDegerler={['ALICI', 'SATICI']}
        kullanimNesneAdi="tipi"
        kullanimSayisiAl={(value) => kayitlar.filter((c) => c.cariTipi === value).length}
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
        kullanimNesneAdi="işletme türünü"
        kullanimSayisiAl={(value) => kayitlar.filter((c) => c.isletmeTuru === value).length}
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
