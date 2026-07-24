import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MutableRefObject,
} from 'react';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { CariOutlinedAcilir } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedAcilir';
import { CariOutlinedGirdi } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import { CariSecenekModal } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariSecenekModal';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import {
  bankaAnlasmaGuncelle,
  bankaAnlasmaOlustur,
  bankaAnlasmalariGetir,
} from '../api';
import {
  bankaEkle,
  bankaGuncelle,
  bankalariGetir,
  bankaSil,
  type BankaSecenek,
} from '../bankalar';
import {
  hesapTipiEkle,
  hesapTipiGuncelle,
  hesapTipleriGetir,
  hesapTipiSil,
  SABIT_HESAP_TIPLERI,
  type HesapTipiSecenek,
} from '../hesapTipleri';
import {
  BANKA_DOVIZ_SECENEKLERI,
  KOMISYON_UYGULAMA_TIPLERI,
  KREDI_KART_TURLERI,
  PUAN_UYGULAMA_TIPLERI,
  type AdminBankaAnlasma,
  type BankaAnlasmaFormDegeri,
  type BankaKartModu,
  type KrediKartTuru,
} from '../tipler';
import {
  bankaAnlasmadanForm,
  bankaAnlasmaFormDogrula,
  bosFormKopyala,
  gunSayisiFiltrele,
  kartLimitiFiltrele,
  tipDegisinceFormTemizle,
} from '../bankaYardimci';
import { BankaAdresIletisimBolumu } from './BankaAdresIletisimBolumu';
import { BankaIbanGirdi } from './BankaIbanGirdi';
import { BankaKrediKartGorsel } from './BankaKrediKartGorsel';
import { BankaOutlinedDonem, BankaValorKutu } from './BankaPosAlanlari';
import { BankaPosKomisyonTablosu } from './BankaPosKomisyonTablosu';
import { bankaEtiketi } from '../bankalar';

function formlarEsit(a: BankaAnlasmaFormDegeri, b: BankaAnlasmaFormDegeri): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function HesapTipiChipleri({
  deger,
  secenekler,
  saltOkunur,
  onYonet,
  onDegistir,
}: {
  deger: string;
  secenekler: HesapTipiSecenek[];
  saltOkunur: boolean;
  onYonet?: () => void;
  onDegistir: (deger: string) => void;
}) {
  return (
    <div className="cari-secili-alan ba-hesap-tipi">
      <div className="cari-secili-etiket-satir">
        <span className="cari-secili-etiket">Hesap Tipi</span>
        {!saltOkunur && onYonet ? (
          <button
            type="button"
            className="cari-secili-yonet"
            onClick={onYonet}
            title="Hesap tipi yönet"
            aria-label="Hesap tipi yönet"
          >
            +
          </button>
        ) : null}
      </div>
      <div className="cari-secili-chip-grup" role="group" aria-label="Hesap Tipi">
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

function KartTuruChipleri({
  deger,
  saltOkunur,
  onDegistir,
}: {
  deger: KrediKartTuru | '';
  saltOkunur: boolean;
  onDegistir: (deger: KrediKartTuru) => void;
}) {
  return (
    <div className="cari-secili-alan ba-kart-turu">
      <div className="cari-secili-etiket-satir">
        <span className="cari-secili-etiket">Kart Türü</span>
      </div>
      <div className="cari-secili-chip-grup" role="group" aria-label="Kart Türü">
        {KREDI_KART_TURLERI.map((s) => (
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

export function BankaAnlasmaKart({
  mod,
  kayitId,
  onKaydedildi,
  kaydetRef,
  onKirliDegistir,
}: {
  mod: BankaKartModu;
  kayitId: string | null;
  onKaydedildi: () => void;
  kaydetRef: MutableRefObject<(() => Promise<void>) | null>;
  onKirliDegistir: (kirli: boolean) => void;
}) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar } = useYetkiler('banka-anlasmalari');
  const saltOkunur = mod === 'incele';
  const [kayitlar, setKayitlar] = useState<AdminBankaAnlasma[]>([]);
  const [form, setForm] = useState<BankaAnlasmaFormDegeri>(bosFormKopyala);
  const [baslangic, setBaslangic] = useState<BankaAnlasmaFormDegeri>(bosFormKopyala);
  const [yukleniyor, setYukleniyor] = useState(mod !== 'yeni');
  const [bankalar, setBankalar] = useState<BankaSecenek[]>(() => bankalariGetir());
  const [hesapTipleri, setHesapTipleri] = useState<HesapTipiSecenek[]>(() => hesapTipleriGetir());
  const [bankaModalAcik, setBankaModalAcik] = useState(false);
  const [tipModalAcik, setTipModalAcik] = useState(false);

  const bankaSecenekleri = useMemo(
    () =>
      [...bankalar].sort((a, b) =>
        a.label.localeCompare(b.label, 'tr', { sensitivity: 'base' })
      ),
    [bankalar]
  );

  const seciliKayit = useMemo(
    () => (kayitId ? kayitlar.find((k) => k.id === kayitId) ?? null : null),
    [kayitId, kayitlar]
  );

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      setKayitlar(await bankaAnlasmalariGetir());
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Kayıtlar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  useEffect(() => {
    if (mod === 'yeni') {
      const bos = bosFormKopyala();
      setForm(bos);
      setBaslangic(bos);
      return;
    }
    if (seciliKayit) {
      const dolu = bankaAnlasmadanForm(seciliKayit);
      setForm(dolu);
      setBaslangic(dolu);
    }
  }, [mod, seciliKayit]);

  const kirli = useMemo(() => !formlarEsit(form, baslangic), [baslangic, form]);

  useEffect(() => {
    onKirliDegistir(kirli);
  }, [kirli, onKirliDegistir]);

  const setAlan = <K extends keyof BankaAnlasmaFormDegeri>(
    alan: K,
    deger: BankaAnlasmaFormDegeri[K]
  ) => {
    setForm((f) => ({ ...f, [alan]: deger }));
  };

  const kaydet = useCallback(async () => {
    if (saltOkunur) return;
    if (mod === 'yeni' && !eklemeVar) {
      hataBildir('Ekleme yetkiniz yok.');
      return;
    }
    if (mod === 'duzenle' && !duzenlemeVar) {
      hataBildir('Düzenleme yetkiniz yok.');
      return;
    }
    const hata = bankaAnlasmaFormDogrula(form);
    if (hata) {
      hataBildir(hata);
      throw new Error(hata);
    }
    try {
      if (mod === 'yeni') {
        await bankaAnlasmaOlustur(form);
        basariBildir('Banka kaydı eklendi.');
      } else if (kayitId) {
        await bankaAnlasmaGuncelle(kayitId, form);
        basariBildir('Banka kaydı güncellendi.');
      }
      onKaydedildi();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Kayıt başarısız');
      throw e;
    }
  }, [
    basariBildir,
    duzenlemeVar,
    eklemeVar,
    form,
    hataBildir,
    kayitId,
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

  if (yukleniyor && mod !== 'yeni') return <TanimYukleniyor />;
  if (mod !== 'yeni' && !seciliKayit) return <TanimYukleniyor />;

  return (
    <>
      <div className={`cari-kart-sayfa${saltOkunur ? ' cari-kart-sayfa--salt' : ''}`}>
        <div className={`cari-kart-kabuk${saltOkunur ? ' cari-kart-kabuk--salt' : ''}`}>
          <div className="cari-kart-grid">
            <HesapTipiChipleri
              deger={form.hesapTipi}
              secenekler={hesapTipleri}
              saltOkunur={saltOkunur}
              onYonet={() => setTipModalAcik(true)}
              onDegistir={(hesapTipi) => setForm((f) => tipDegisinceFormTemizle(f, hesapTipi))}
            />

            {form.hesapTipi === 'BANKA' ? (
              <>
                <div className="ba-hesap-kod-isim">
                  <CariOutlinedGirdi
                    etiket="Hesap Kodu"
                    deger={form.hesapKodu}
                    maxLength={20}
                    buyukHarf
                    odakPlaceholder="Kod"
                    disabled={saltOkunur}
                    onChange={(hesapKodu) => setAlan('hesapKodu', hesapKodu)}
                  />
                  <CariOutlinedGirdi
                    etiket="Hesap Adı"
                    deger={form.hesapIsmi}
                    zorunlu
                    maxLength={120}
                    odakPlaceholder="Hesap adını yazınız"
                    disabled={saltOkunur}
                    onChange={(hesapIsmi) => setAlan('hesapIsmi', hesapIsmi)}
                  />
                </div>
                <CariOutlinedGirdi
                  etiket="Hesap Numarası"
                  deger={form.hesapNumarasi}
                  maxLength={40}
                  odakPlaceholder="Hesap numarası"
                  disabled={saltOkunur}
                  onChange={(hesapNumarasi) => setAlan('hesapNumarasi', hesapNumarasi)}
                />
                <CariOutlinedAcilir
                  etiket="Banka"
                  zorunlu
                  deger={form.bankaKodu}
                  secenekler={bankaSecenekleri}
                  disabled={saltOkunur}
                  onYonet={() => setBankaModalAcik(true)}
                  onChange={(bankaKodu) => setAlan('bankaKodu', bankaKodu)}
                />
                <div className="cari-il-ilce-cift ba-sube-cift">
                  <CariOutlinedGirdi
                    etiket="Banka Şubesi"
                    deger={form.bankaSubesi}
                    maxLength={80}
                    odakPlaceholder="Şube adı"
                    disabled={saltOkunur}
                    onChange={(bankaSubesi) => setAlan('bankaSubesi', bankaSubesi)}
                  />
                  <CariOutlinedGirdi
                    etiket="Banka Şube Kodu"
                    deger={form.bankaSubeKodu}
                    maxLength={20}
                    odakPlaceholder="Şube kodu"
                    disabled={saltOkunur}
                    onChange={(bankaSubeKodu) => setAlan('bankaSubeKodu', bankaSubeKodu)}
                  />
                </div>
                <BankaIbanGirdi
                  deger={form.iban}
                  mod={form.ibanModu}
                  disabled={saltOkunur}
                  onChange={(iban) => setAlan('iban', iban)}
                  onModChange={(ibanModu) => setAlan('ibanModu', ibanModu)}
                />
                <CariOutlinedAcilir
                  etiket="Döviz Cinsi"
                  deger={form.dovizCinsi}
                  secenekler={[...BANKA_DOVIZ_SECENEKLERI]}
                  disabled={saltOkunur}
                  onChange={(dovizCinsi) => setAlan('dovizCinsi', dovizCinsi)}
                />
              </>
            ) : form.hesapTipi === 'KREDI' ? (
              <div className="ba-kredi-govde">
                <div className="ba-hesap-kod-isim ba-kredi-ust-sol">
                  <CariOutlinedGirdi
                    etiket="Hesap Kodu"
                    deger={form.hesapKodu}
                    maxLength={20}
                    buyukHarf
                    odakPlaceholder="Kod"
                    disabled={saltOkunur}
                    onChange={(hesapKodu) => setAlan('hesapKodu', hesapKodu)}
                  />
                  <CariOutlinedGirdi
                    etiket="Hesap Adı"
                    deger={form.hesapIsmi}
                    zorunlu
                    maxLength={120}
                    odakPlaceholder="Hesap adını yazınız"
                    disabled={saltOkunur}
                    onChange={(hesapIsmi) => setAlan('hesapIsmi', hesapIsmi)}
                  />
                </div>
                <div className="ba-kredi-ust-sag">
                  <CariOutlinedAcilir
                    etiket="Banka"
                    zorunlu
                    deger={form.bankaKodu}
                    secenekler={bankaSecenekleri}
                    disabled={saltOkunur}
                    onYonet={() => setBankaModalAcik(true)}
                    onChange={(bankaKodu) => setAlan('bankaKodu', bankaKodu)}
                  />
                </div>
                <div className="ba-kredi-sol-alt">
                  <KartTuruChipleri
                    deger={form.kartTuru}
                    saltOkunur={saltOkunur}
                    onDegistir={(kartTuru) => setAlan('kartTuru', kartTuru)}
                  />
                  <div className="cari-il-ilce-cift">
                    <CariOutlinedGirdi
                      etiket="Hesap Kesim Tarihi"
                      className="ba-gun-cumle"
                      deger={form.hesapKesimGunu}
                      maxLength={2}
                      odakPlaceholder="1–31"
                      inputMode="numeric"
                      disabled={saltOkunur}
                      onChange={(v) => setAlan('hesapKesimGunu', gunSayisiFiltrele(v))}
                      onek={<span className="ba-gun-sonek">Her ayın</span>}
                      sonek={<span className="ba-gun-sonek">. günü</span>}
                    />
                    <CariOutlinedGirdi
                      etiket="Ödeme Günü"
                      className="ba-gun-cumle"
                      deger={form.odemeGunu}
                      maxLength={2}
                      odakPlaceholder="1–31"
                      inputMode="numeric"
                      disabled={saltOkunur}
                      onChange={(v) => setAlan('odemeGunu', gunSayisiFiltrele(v))}
                      onek={<span className="ba-gun-sonek">Her ayın</span>}
                      sonek={<span className="ba-gun-sonek">. günü</span>}
                    />
                  </div>
                  <div className="cari-il-ilce-cift">
                    <CariOutlinedGirdi
                      etiket="Kart Limiti"
                      deger={form.kartLimiti}
                      maxLength={18}
                      odakPlaceholder="0"
                      inputMode="decimal"
                      disabled={saltOkunur}
                      onChange={(v) => setAlan('kartLimiti', kartLimitiFiltrele(v))}
                    />
                    <CariOutlinedAcilir
                      etiket="Döviz Cinsi"
                      deger={form.dovizCinsi}
                      secenekler={[...BANKA_DOVIZ_SECENEKLERI]}
                      disabled={saltOkunur}
                      onChange={(dovizCinsi) => setAlan('dovizCinsi', dovizCinsi)}
                    />
                  </div>
                </div>
                <BankaKrediKartGorsel
                  kartNo={form.kartNo}
                  sonKullanma={form.sonKullanmaTarihi}
                  hesapIsmi={form.hesapIsmi}
                  bankaAdi={bankaEtiketi(form.bankaKodu)}
                  disabled={saltOkunur}
                  onKartNoChange={(kartNo) => setAlan('kartNo', kartNo)}
                  onSonKullanmaChange={(sonKullanmaTarihi) =>
                    setAlan('sonKullanmaTarihi', sonKullanmaTarihi)
                  }
                />
              </div>
            ) : form.hesapTipi === 'POS' ? (
              <>
                <div className="ba-hesap-kod-isim">
                  <CariOutlinedGirdi
                    etiket="Hesap Kodu"
                    deger={form.hesapKodu}
                    maxLength={20}
                    buyukHarf
                    odakPlaceholder="Kod"
                    disabled={saltOkunur}
                    onChange={(hesapKodu) => setAlan('hesapKodu', hesapKodu)}
                  />
                  <CariOutlinedGirdi
                    etiket="Hesap Adı"
                    deger={form.hesapIsmi}
                    zorunlu
                    maxLength={120}
                    odakPlaceholder="Hesap adını yazınız"
                    disabled={saltOkunur}
                    onChange={(hesapIsmi) => setAlan('hesapIsmi', hesapIsmi)}
                  />
                </div>
                <CariOutlinedAcilir
                  etiket="Banka"
                  zorunlu
                  deger={form.bankaKodu}
                  secenekler={bankaSecenekleri}
                  disabled={saltOkunur}
                  onYonet={() => setBankaModalAcik(true)}
                  onChange={(bankaKodu) => setAlan('bankaKodu', bankaKodu)}
                />
                <CariOutlinedGirdi
                  etiket="Anlaşma No"
                  deger={form.anlasmaNo}
                  maxLength={40}
                  odakPlaceholder="Anlaşma numarası"
                  disabled={saltOkunur}
                  onChange={(anlasmaNo) => setAlan('anlasmaNo', anlasmaNo)}
                />
                <div className="ba-pos-donem-valor">
                  <BankaOutlinedDonem
                    baslangic={form.baslangicTarihi}
                    bitis={form.bitisTarihi}
                    disabled={saltOkunur}
                    onBaslangicChange={(baslangicTarihi) =>
                      setAlan('baslangicTarihi', baslangicTarihi)
                    }
                    onBitisChange={(bitisTarihi) => setAlan('bitisTarihi', bitisTarihi)}
                  />
                  <BankaValorKutu
                    deger={form.valor}
                    disabled={saltOkunur}
                    onChange={(valor) => setAlan('valor', valor)}
                  />
                </div>
                <CariOutlinedAcilir
                  etiket="Komisyon Uygulama Tipi"
                  deger={form.komisyonUygulamaTipi}
                  secenekler={KOMISYON_UYGULAMA_TIPLERI}
                  disabled={saltOkunur}
                  onChange={(komisyonUygulamaTipi) =>
                    setAlan(
                      'komisyonUygulamaTipi',
                      komisyonUygulamaTipi as typeof form.komisyonUygulamaTipi
                    )
                  }
                />
                <CariOutlinedAcilir
                  etiket="Puan Uygulama Tipi"
                  deger={form.puanUygulamaTipi}
                  secenekler={PUAN_UYGULAMA_TIPLERI}
                  disabled={saltOkunur}
                  onChange={(puanUygulamaTipi) =>
                    setAlan('puanUygulamaTipi', puanUygulamaTipi as typeof form.puanUygulamaTipi)
                  }
                />
                <div className="ba-pos-tablo-satir">
                  <BankaPosKomisyonTablosu
                    satirlar={form.posKomisyonSatirlari}
                    disabled={saltOkunur}
                    onChange={(posKomisyonSatirlari) =>
                      setAlan('posKomisyonSatirlari', posKomisyonSatirlari)
                    }
                  />
                </div>
              </>
            ) : (
              <p className="ba-tip-bekleyen cari-alan-tam">
                Bu hesap tipi için ek alanlar yakında eklenecek.
              </p>
            )}
          </div>
        </div>

        <BankaAdresIletisimBolumu
          kisiler={form.iletisimKisiler}
          disabled={saltOkunur}
          onChange={(iletisimKisiler) => setAlan('iletisimKisiler', iletisimKisiler)}
        />
      </div>

      <CariSecenekModal
        acik={bankaModalAcik}
        baslik="Bankalar"
        placeholder="Banka adı…"
        liste={bankaSecenekleri}
        kullanimNesneAdi="bankayı"
        kullanimSayisiAl={(value) =>
          kayitlar.filter((k) => k.bankaKodu === value).length
        }
        onEkle={(ad) => {
          const eklenen = bankaEkle(ad);
          if (!eklenen) return false;
          setBankalar(bankalariGetir());
          return true;
        }}
        onGuncelle={(value, yeniAd) => {
          const ok = bankaGuncelle(value, yeniAd);
          if (ok) setBankalar(bankalariGetir());
          return ok;
        }}
        onSil={(value) => {
          bankaSil(value);
          setBankalar(bankalariGetir());
          if (form.bankaKodu === value) setAlan('bankaKodu', '');
        }}
        onKapat={() => setBankaModalAcik(false)}
      />

      <CariSecenekModal
        acik={tipModalAcik}
        baslik="Hesap Tipleri"
        placeholder="Hesap tipi adı…"
        liste={hesapTipleri}
        sabitDegerler={[...SABIT_HESAP_TIPLERI]}
        kullanimNesneAdi="hesap tipini"
        kullanimSayisiAl={(value) =>
          kayitlar.filter((k) => k.hesapTipi === value).length
        }
        onEkle={(ad) => {
          const eklenen = hesapTipiEkle(ad);
          if (!eklenen) return false;
          setHesapTipleri(hesapTipleriGetir());
          return true;
        }}
        onGuncelle={(value, yeniAd) => {
          const ok = hesapTipiGuncelle(value, yeniAd);
          if (ok) setHesapTipleri(hesapTipleriGetir());
          return ok;
        }}
        onSil={(value) => {
          if (!hesapTipiSil(value)) return;
          setHesapTipleri(hesapTipleriGetir());
          if (form.hesapTipi === value) {
            setForm((f) => tipDegisinceFormTemizle(f, 'BANKA'));
          }
        }}
        onKapat={() => setTipModalAcik(false)}
      />
    </>
  );
}
