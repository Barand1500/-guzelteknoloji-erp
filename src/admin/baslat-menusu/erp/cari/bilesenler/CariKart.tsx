import { useCallback, useEffect, useMemo, useState, type MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { TanimModCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimModCubugu';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';
import { SistemModal } from '@/admin/ortak/SistemModal';
import { formInputSinifi } from '@/formlar/FormAlani';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { cariOlustur, cariGuncelle, carileriGetir } from '../api';
import { cariKartFormDogrula } from '../alanKurallari';
import { cariEkAlanlariKaydet } from '../cariEkAlanlar';
import {
  cariKartTipiEkle,
  cariKartTipiSil,
  cariKartTipleriGetir,
  type CariKartTipiSecenek,
} from '../cariKartTipleri';
import {
  cariIsletmeTuruEkle,
  cariIsletmeTuruSil,
  cariIsletmeTurleriGetir,
  type CariIsletmeTuruSecenek,
} from '../cariIsletmeTurleri';
import { caridenKartForm, kartFormdanApiForm } from '../cariYardimci';
import {
  CARI_KART_SEKMELERI,
  bosCariKartForm,
  type AdminCari,
  type CariAltKart,
  type CariKartForm,
  type CariKartModu,
  type CariKartSekmeId,
} from '../tipler';
import { CariKartSekmeIcerik } from './CariKartSekmeler';
import { CariSecenekModal } from './CariSecenekModal';

function formlarEsit(a: CariKartForm, b: CariKartForm): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function AltKartModal({
  kart,
  yeniMi,
  onKaydet,
  onKapat,
}: {
  kart: CariAltKart;
  yeniMi: boolean;
  onKaydet: (k: CariAltKart) => void;
  onKapat: () => void;
}) {
  const [f, setF] = useState(kart);

  useEffect(() => {
    setF(kart);
  }, [kart]);

  const portalKok = document.querySelector('.admin-panel') ?? document.body;

  return createPortal(
    <SistemModal
      acik
      onKapat={onKapat}
      baslik={yeniMi ? 'Yeni Alt Kart' : 'Alt Kart Düzenle'}
      altBaslik={yeniMi ? 'Yeni alt kart bilgilerini girin' : 'Alt kart bilgilerini güncelleyin'}
      genislik="lg"
      baslikId="cari-alt-kart-modal"
      footer={
        <>
          <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--iptal" onClick={onKapat}>
            <ModalTusIcerik metin="İptal" kisayol="Esc" />
          </button>
          <button type="button" className="ap-sil-onay-tus ap-sil-onay-tus--onay" onClick={() => onKaydet(f)}>
            <ModalTusIcerik metin="Tamam" kisayol="Enter" />
          </button>
        </>
      }
    >
      <div className="cari-alt-modal-govde-icerik">
        <TanimFormBolum baslik="Genel Bilgiler">
          <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
            <TanimGirdi etiket="Firma Kodu" deger={f.firmaKodu} onChange={(firmaKodu) => setF((x) => ({ ...x, firmaKodu }))} />
            <TanimGirdi etiket="Firma Adı" deger={f.firmaAdi} onChange={(firmaAdi) => setF((x) => ({ ...x, firmaAdi }))} />
            <TanimGirdi etiket="Adı" deger={f.adi} onChange={(adi) => setF((x) => ({ ...x, adi }))} />
            <TanimGirdi etiket="Soyadı" deger={f.soyadi} onChange={(soyadi) => setF((x) => ({ ...x, soyadi }))} />
            <TanimGirdi etiket="Görevi" deger={f.gorevi} onChange={(gorevi) => setF((x) => ({ ...x, gorevi }))} />
          </div>
        </TanimFormBolum>

        <TanimFormBolum baslik="Telefon Bilgileri">
          <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
            <TanimGirdi etiket="Telefon 1" deger={f.telefon1} onChange={(telefon1) => setF((x) => ({ ...x, telefon1 }))} />
            <TanimGirdi etiket="Açıklama" deger={f.telefon1Aciklama} onChange={(telefon1Aciklama) => setF((x) => ({ ...x, telefon1Aciklama }))} />
            <TanimGirdi etiket="Telefon 2" deger={f.telefon2} onChange={(telefon2) => setF((x) => ({ ...x, telefon2 }))} />
            <TanimGirdi etiket="Açıklama" deger={f.telefon2Aciklama} onChange={(telefon2Aciklama) => setF((x) => ({ ...x, telefon2Aciklama }))} />
            <TanimGirdi etiket="Telefon 3" deger={f.telefon3} onChange={(telefon3) => setF((x) => ({ ...x, telefon3 }))} />
            <TanimGirdi etiket="Açıklama" deger={f.telefon3Aciklama} onChange={(telefon3Aciklama) => setF((x) => ({ ...x, telefon3Aciklama }))} />
            <TanimGirdi etiket="Faks" deger={f.faks} onChange={(faks) => setF((x) => ({ ...x, faks }))} />
            <TanimGirdi etiket="Açıklama" deger={f.faksAciklama} onChange={(faksAciklama) => setF((x) => ({ ...x, faksAciklama }))} />
            <TanimGirdi etiket="GSM" deger={f.gsm} onChange={(gsm) => setF((x) => ({ ...x, gsm }))} />
            <TanimGirdi etiket="Açıklama" deger={f.gsmAciklama} onChange={(gsmAciklama) => setF((x) => ({ ...x, gsmAciklama }))} />
          </div>
        </TanimFormBolum>

        <TanimFormBolum baslik="E-Posta Bilgileri">
          <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
            <TanimGirdi etiket="E-Posta 1" deger={f.eposta1} onChange={(eposta1) => setF((x) => ({ ...x, eposta1 }))} />
            <TanimGirdi etiket="E-Posta 2" deger={f.eposta2} onChange={(eposta2) => setF((x) => ({ ...x, eposta2 }))} />
            <TanimGirdi etiket="Vergi No" deger={f.vergiNo} onChange={(vergiNo) => setF((x) => ({ ...x, vergiNo }))} />
            <TanimGirdi etiket="TC Kimlik No" deger={f.tcKimlikNo} onChange={(tcKimlikNo) => setF((x) => ({ ...x, tcKimlikNo }))} />
            <TanimGirdi
              etiket="Müşteri Temsilcisi"
              deger={f.musteriTemsilcisi}
              onChange={(musteriTemsilcisi) => setF((x) => ({ ...x, musteriTemsilcisi }))}
            />
            <TanimGirdi etiket="GLN Kodu" deger={f.glnKodu} onChange={(glnKodu) => setF((x) => ({ ...x, glnKodu }))} />
          </div>
        </TanimFormBolum>

        <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
          <TanimFormBolum baslik="Adres 1">
            <label className="ap-tanim-girdi block cari-metin-alan">
              <span className="ap-tanim-girdi-etiket">Adres</span>
              <textarea
                className={formInputSinifi}
                rows={3}
                value={f.adres1}
                onChange={(e) => setF((x) => ({ ...x, adres1: e.target.value }))}
              />
            </label>
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
              <TanimGirdi etiket="İlçe" deger={f.ilce1} onChange={(ilce1) => setF((x) => ({ ...x, ilce1 }))} />
              <TanimGirdi etiket="Şehir" deger={f.sehir1} onChange={(sehir1) => setF((x) => ({ ...x, sehir1 }))} />
            </div>
          </TanimFormBolum>
          <TanimFormBolum baslik="Adres 2">
            <label className="ap-tanim-girdi block cari-metin-alan">
              <span className="ap-tanim-girdi-etiket">Adres</span>
              <textarea
                className={formInputSinifi}
                rows={3}
                value={f.adres2}
                onChange={(e) => setF((x) => ({ ...x, adres2: e.target.value }))}
              />
            </label>
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
              <TanimGirdi etiket="İlçe" deger={f.ilce2} onChange={(ilce2) => setF((x) => ({ ...x, ilce2 }))} />
              <TanimGirdi etiket="Şehir" deger={f.sehir2} onChange={(sehir2) => setF((x) => ({ ...x, sehir2 }))} />
            </div>
          </TanimFormBolum>
        </div>

        <TanimFormBolum baslik="Notlar">
          <label className="ap-tanim-girdi block cari-metin-alan">
            <span className="ap-tanim-girdi-etiket">Notlar</span>
            <textarea
              className={formInputSinifi}
              rows={3}
              value={f.notlar}
              onChange={(e) => setF((x) => ({ ...x, notlar: e.target.value }))}
            />
          </label>
        </TanimFormBolum>
      </div>
    </SistemModal>,
    portalKok
  );
}

export function CariKart({
  mod,
  cariId,
  onGeri,
  onKaydedildi,
  kaydetRef,
  onKirliDegistir,
}: {
  mod: CariKartModu;
  cariId: string | null;
  onGeri: () => void;
  onKaydedildi: () => void;
  kaydetRef: MutableRefObject<(() => Promise<void>) | null>;
  onKirliDegistir: (kirli: boolean) => void;
}) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar } = useYetkiler('cari');
  const saltOkunur = mod === 'incele';
  const [kayitlar, setKayitlar] = useState<AdminCari[]>([]);
  const [form, setForm] = useState<CariKartForm>(bosCariKartForm);
  const [baslangic, setBaslangic] = useState<CariKartForm>(bosCariKartForm);
  const [yukleniyor, setYukleniyor] = useState(mod !== 'yeni');
  const [, setKaydediliyor] = useState(false);
  const [aktifSekme, setAktifSekme] = useState<CariKartSekmeId>('kart-bilgileri');
  const [kartTipleri, setKartTipleri] = useState<CariKartTipiSecenek[]>(() => cariKartTipleriGetir());
  const [isletmeTurleri, setIsletmeTurleri] = useState<CariIsletmeTuruSecenek[]>(() =>
    cariIsletmeTurleriGetir()
  );
  const [tipModalAcik, setTipModalAcik] = useState(false);
  const [isletmeModalAcik, setIsletmeModalAcik] = useState(false);
  const [altKartDuzenle, setAltKartDuzenle] = useState<CariAltKart | null>(null);

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
      const bos = bosCariKartForm();
      setForm(bos);
      setBaslangic(bos);
      setAktifSekme('kart-bilgileri');
      return;
    }
    if (seciliKayit) {
      const dolu = caridenKartForm(seciliKayit);
      setForm(dolu);
      setBaslangic(dolu);
    }
  }, [mod, seciliKayit]);

  const kirli = useMemo(() => !formlarEsit(form, baslangic), [baslangic, form]);

  useEffect(() => {
    onKirliDegistir(kirli);
  }, [kirli, onKirliDegistir]);

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
    const hata = cariKartFormDogrula(form);
    if (hata) {
      hataBildir(hata);
      throw new Error(hata);
    }
    const apiForm = kartFormdanApiForm(form);
    setKaydediliyor(true);
    try {
      let kayit: AdminCari;
      if (mod === 'duzenle' && cariId) {
        kayit = await cariGuncelle(cariId, apiForm);
        basariBildir('Cari kart güncellendi.');
      } else {
        kayit = await cariOlustur(apiForm);
        basariBildir('Cari kart eklendi.');
      }
      cariEkAlanlariKaydet(kayit.id, form);
      onKaydedildi();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Kayıt başarısız');
      throw e;
    } finally {
      setKaydediliyor(false);
    }
  }, [
    basariBildir,
    cariId,
    duzenlemeVar,
    eklemeVar,
    form,
    hataBildir,
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

  const altKartKaydet = (k: CariAltKart) => {
    setForm((f) => {
      const varMi = f.altKartlar.some((x) => x.id === k.id);
      return {
        ...f,
        altKartlar: varMi
          ? f.altKartlar.map((x) => (x.id === k.id ? k : x))
          : [...f.altKartlar, k.id ? k : { ...k, id: `a-${Date.now()}` }],
      };
    });
    setAltKartDuzenle(null);
  };

  const baslik =
    mod === 'yeni' ? 'Yeni Cari Kart' : seciliKayit ? seciliKayit.cariAdi : 'Cari Kart';
  const ustEtiket = mod === 'yeni' ? 'Yeni Cari' : mod === 'incele' ? 'Cari İncele' : 'Cari Düzenle';
  const rozet = mod === 'yeni' ? 'Yeni Ekle' : mod === 'incele' ? 'İncele' : 'Düzenle';

  if (yukleniyor && mod !== 'yeni') return <TanimYukleniyor />;
  if (mod !== 'yeni' && !seciliKayit) return <TanimYukleniyor />;

  return (
    <>
      <TanimDuzenleEkrani
        baslik={baslik}
        altBaslik={mod === 'yeni' ? 'Cari kart bilgilerini girin' : seciliKayit?.cariKodu}
        ustEtiket={ustEtiket}
        rozet={rozet}
        olusturma={seciliKayit?.olusturma}
        guncelleme={seciliKayit?.guncelleme}
        onGeri={onGeri}
        saltOkunur={saltOkunur}
      >
        <div className={`cari-kart-kabuk${saltOkunur ? ' cari-kart-kabuk--salt' : ''}`}>
          <TanimFormBolum baslik="Genel Bilgiler" className="cari-genel-bolum">
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2 cari-genel-grid">
              <TanimGirdi
                etiket="Ünvan"
                deger={form.unvan}
                className="cari-alan-tam"
                onChange={(unvan) => setForm((f) => ({ ...f, unvan }))}
              />
              <TanimGirdi
                etiket="Firma Kodu"
                deger={form.firmaKodu}
                zorunlu
                maxLength={30}
                buyukHarf
                onChange={(firmaKodu) => setForm((f) => ({ ...f, firmaKodu }))}
              />
              <TanimGirdi
                etiket="Firma Adı"
                deger={form.firmaAdi}
                zorunlu
                maxLength={255}
                onChange={(firmaAdi) => setForm((f) => ({ ...f, firmaAdi }))}
              />
              <TanimGirdi
                etiket="Grup Kodu"
                deger={form.grupKodu}
                onChange={(grupKodu) => setForm((f) => ({ ...f, grupKodu }))}
              />
              <TanimGirdi
                etiket="Takip Kodu"
                deger={form.takipKodu}
                onChange={(takipKodu) => setForm((f) => ({ ...f, takipKodu }))}
              />
              <div className="cari-secili-alan">
                <div className="cari-secili-etiket-satir">
                  <span className="ap-tanim-girdi-etiket">İşletme Türü</span>
                  {!saltOkunur ? (
                    <button
                      type="button"
                      className="cari-secili-yonet"
                      onClick={() => setIsletmeModalAcik(true)}
                      title="İşletme türü ekle"
                      aria-label="İşletme türü ekle"
                    >
                      +
                    </button>
                  ) : null}
                </div>
                <div className="cari-secili-chip-grup" role="group" aria-label="İşletme türü">
                  {isletmeTurleri.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`cari-secili-chip${form.isletmeTuru === t.value ? ' cari-secili-chip--aktif' : ''}`}
                      disabled={saltOkunur}
                      onClick={() => setForm((f) => ({ ...f, isletmeTuru: t.value }))}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cari-secili-alan">
                <div className="cari-secili-etiket-satir">
                  <span className="ap-tanim-girdi-etiket">
                    Kart Tipi <span>*</span>
                  </span>
                  {!saltOkunur ? (
                    <button
                      type="button"
                      className="cari-secili-yonet"
                      onClick={() => setTipModalAcik(true)}
                      title="Kart tipi ekle"
                      aria-label="Kart tipi ekle"
                    >
                      +
                    </button>
                  ) : null}
                </div>
                <div className="cari-secili-chip-grup" role="group" aria-label="Kart tipi">
                  {kartTipleri.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`cari-secili-chip${form.kartTipi === t.value ? ' cari-secili-chip--aktif' : ''}`}
                      disabled={saltOkunur}
                      onClick={() => setForm((f) => ({ ...f, kartTipi: t.value }))}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <TanimGirdi
                etiket="Yetkili Adı"
                deger={form.yetkiliAdi}
                onChange={(yetkiliAdi) => setForm((f) => ({ ...f, yetkiliAdi }))}
              />
              <TanimGirdi
                etiket="Yetkili Soyadı"
                deger={form.yetkiliSoyadi}
                onChange={(yetkiliSoyadi) => setForm((f) => ({ ...f, yetkiliSoyadi }))}
              />
            </div>
          </TanimFormBolum>

          <div className="cari-sekme-ayirici" aria-hidden />

          <div className="cari-sekme-sarici">
            <TanimModCubugu
              sekmeler={CARI_KART_SEKMELERI}
              aktif={aktifSekme}
              onDegistir={(id) => setAktifSekme(id as CariKartSekmeId)}
              ariaLabel="Cari kart sekmeleri"
              kompakt
            />
          </div>

          <CariKartSekmeIcerik
            sekme={aktifSekme}
            form={form}
            setForm={setForm}
            saltOkunur={saltOkunur}
            onAltKartDuzenle={setAltKartDuzenle}
          />
        </div>
      </TanimDuzenleEkrani>

      <CariSecenekModal
        acik={tipModalAcik}
        baslik="Kart Tipi"
        placeholder="Yeni kart tipi adı…"
        liste={kartTipleri}
        sabitDegerler={['ALICI', 'SATICI']}
        onEkle={(ad) => {
          const sonuc = cariKartTipiEkle(ad);
          if (!sonuc) return false;
          setKartTipleri(cariKartTipleriGetir());
          return true;
        }}
        onSil={(value) => {
          cariKartTipiSil(value);
          setKartTipleri(cariKartTipleriGetir());
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
        onSil={(value) => {
          cariIsletmeTuruSil(value);
          setIsletmeTurleri(cariIsletmeTurleriGetir());
        }}
        onKapat={() => setIsletmeModalAcik(false)}
      />

      {altKartDuzenle ? (
        <AltKartModal
          kart={altKartDuzenle}
          yeniMi={!form.altKartlar.some((x) => x.id === altKartDuzenle.id)}
          onKaydet={altKartKaydet}
          onKapat={() => setAltKartDuzenle(null)}
        />
      ) : null}
    </>
  );
}
