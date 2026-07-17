import { useCallback, useEffect, useMemo, useState, type MutableRefObject, type ReactNode } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimModCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimModCubugu';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { formInputSinifi } from '@/formlar/FormAlani';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import {
  URUN_NEVILERI,
  URUN_TIPLERI,
  type AdminBirim,
} from '@/admin/baslat-menusu/erp/urun-yonetimi/tipler';
import { birimleriGetir, stokGuncelle, stokOlustur, stoklariGetir } from './api';
import { StokKartiSekmeIcerik } from './StokKartiSekmeIcerik';
import {
  STOK_KART_SEKMELERI,
  STOK_KDV_DEPARTMAN_SECENEKLERI,
  STOK_PB_SECENEKLERI,
  bosStokForm,
  stokFormdanUrunForm,
  type AdminStok,
  type StokForm,
  type StokKartModu,
  type StokKartSekmeId,
} from './tipler';

const stoktenForm = (s: AdminStok): StokForm => ({
  ...bosStokForm,
  ustId: s.ustId,
  urunTipi: s.urunTipi,
  urunNevi: s.urunNevi,
  urunKodu: s.urunKodu,
  marka: s.marka,
  urunAdi: s.urunAdi,
  anaBirim: s.anaBirim,
  varsayilanBirim: s.varsayilanBirim,
  mensei: s.mensei,
});

function formlarEsit(a: StokForm, b: StokForm): boolean {
  return (Object.keys(a) as (keyof StokForm)[]).every((k) => a[k] === b[k]);
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

function YatayAlan({
  etiket,
  zorunlu,
  children,
  className,
}: {
  etiket: string;
  zorunlu?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`stok-karti-yatay${className ? ` ${className}` : ''}`}>
      <span className="stok-karti-yatay-etiket">
        {etiket}
        {zorunlu ? <span> *</span> : null}
      </span>
      <div className="stok-karti-yatay-kontrol">{children}</div>
    </div>
  );
}

function SayiGirdi({
  etiket,
  deger,
  onChange,
  zorunlu,
}: {
  etiket: string;
  deger: string;
  onChange: (deger: string) => void;
  zorunlu?: boolean;
}) {
  return (
    <YatayAlan etiket={etiket} zorunlu={zorunlu}>
      <input
        className={formInputSinifi}
        value={deger}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        placeholder="0"
      />
    </YatayAlan>
  );
}

function MetinGirdi({
  etiket,
  deger,
  onChange,
  maxLength,
  zorunlu,
}: {
  etiket: string;
  deger: string;
  onChange: (deger: string) => void;
  maxLength?: number;
  zorunlu?: boolean;
}) {
  return (
    <YatayAlan etiket={etiket} zorunlu={zorunlu}>
      <input
        className={formInputSinifi}
        value={deger}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength ?? 999))}
      />
    </YatayAlan>
  );
}

function SecimGirdi({
  etiket,
  deger,
  onChange,
  secenekler,
  zorunlu,
}: {
  etiket: string;
  deger: string;
  onChange: (deger: string) => void;
  secenekler: { value: string; label: string }[];
  zorunlu?: boolean;
}) {
  return (
    <YatayAlan etiket={etiket} zorunlu={zorunlu}>
      <FormAcilirSecim value={deger} onChange={onChange} secenekler={secenekler} />
    </YatayAlan>
  );
}

function FiyatPbGirdi({
  etiket,
  deger,
  pb,
  onDeger,
  onPb,
}: {
  etiket: string;
  deger: string;
  pb: string;
  onDeger: (v: string) => void;
  onPb: (v: string) => void;
}) {
  return (
    <YatayAlan etiket={etiket}>
      <div className="stok-karti-fiyat-pb">
        <input
          className={formInputSinifi}
          value={deger}
          onChange={(e) => onDeger(e.target.value)}
          inputMode="decimal"
          placeholder="0"
        />
        <FormAcilirSecim
          value={pb}
          onChange={onPb}
          secenekler={STOK_PB_SECENEKLERI.map((x) => ({ ...x }))}
          aria-label={`${etiket} para birimi`}
        />
      </div>
    </YatayAlan>
  );
}

function TarihGirdi({
  etiket,
  deger,
  onChange,
  saltOkunur,
  placeholder,
}: {
  etiket: string;
  deger: string;
  onChange?: (deger: string) => void;
  saltOkunur?: boolean;
  placeholder?: string;
}) {
  return (
    <YatayAlan etiket={etiket}>
      {saltOkunur ? (
        <input
          className={`${formInputSinifi} stok-karti-tarih-girdi`}
          value={deger}
          readOnly
          tabIndex={-1}
          placeholder={placeholder ?? '—'}
          aria-label={etiket}
        />
      ) : (
        <input
          type="date"
          className={`${formInputSinifi} stok-karti-tarih-girdi`}
          value={deger}
          onChange={(e) => onChange?.(e.target.value)}
          aria-label={etiket}
        />
      )}
    </YatayAlan>
  );
}

export function StokKarti({
  mod,
  stokId,
  onGeri,
  onKaydedildi,
  kaydetRef,
  onKirliDegistir,
}: {
  mod: StokKartModu;
  stokId: string | null;
  onGeri: () => void;
  onKaydedildi: () => void;
  kaydetRef: MutableRefObject<(() => Promise<void>) | null>;
  onKirliDegistir: (kirli: boolean) => void;
}) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar } = useYetkiler('stoklar');
  const saltOkunur = mod === 'incele';
  const [kayitlar, setKayitlar] = useState<AdminStok[]>([]);
  const [birimler, setBirimler] = useState<AdminBirim[]>([]);
  const [form, setForm] = useState<StokForm>(bosStokForm);
  const [yukleniyor, setYukleniyor] = useState(mod !== 'yeni');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [aktifSekme, setAktifSekme] = useState<StokKartSekmeId>('stok-bilgileri');

  const seciliKayit = useMemo(
    () => (stokId ? kayitlar.find((k) => k.id === stokId) ?? null : null),
    [stokId, kayitlar]
  );

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const [stoklar, birimKayitlari] = await Promise.all([stoklariGetir(), birimleriGetir()]);
      setKayitlar(stoklar);
      setBirimler(birimKayitlari);
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Stoklar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, [hataBildir]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  useEffect(() => {
    if (mod === 'yeni') {
      setForm(bosStokForm);
      setAktifSekme('stok-bilgileri');
      return;
    }
    if (seciliKayit) setForm(stoktenForm(seciliKayit));
  }, [mod, seciliKayit]);

  const kirli = useMemo(() => {
    if (mod === 'duzenle' && seciliKayit) {
      return !formlarEsit(form, stoktenForm(seciliKayit));
    }
    if (mod === 'yeni') {
      return (
        form.urunKodu.trim() !== '' ||
        form.urunAdi.trim() !== '' ||
        form.marka.trim() !== '' ||
        form.anaBirim.trim() !== '' ||
        form.varsayilanBirim.trim() !== ''
      );
    }
    return false;
  }, [form, mod, seciliKayit]);

  useEffect(() => {
    onKirliDegistir(kirli);
  }, [kirli, onKirliDegistir]);

  const dogrula = useCallback(() => {
    if (!form.urunTipi) return 'Stok tipi zorunludur';
    if (!form.urunKodu.trim()) return 'Stok kodu zorunludur';
    if (!form.urunAdi.trim()) return 'Stok adı zorunludur';
    return null;
  }, [form]);

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
    const hata = dogrula();
    if (hata) {
      hataBildir(hata);
      throw new Error(hata);
    }
    const aktif = mod === 'duzenle' && seciliKayit ? seciliKayit.aktif : true;
    const urunForm = stokFormdanUrunForm(form);
    setKaydediliyor(true);
    try {
      if (mod === 'duzenle' && stokId) {
        await stokGuncelle(stokId, { ...urunForm, aktif });
        basariBildir('Stok kartı güncellendi.');
      } else {
        await stokOlustur({ ...urunForm, aktif: true });
        basariBildir('Stok kartı eklendi.');
      }
      onKaydedildi();
    } catch (e) {
      hataBildir(e instanceof Error ? e.message : 'Kayıt başarısız');
      throw e;
    } finally {
      setKaydediliyor(false);
    }
  }, [
    basariBildir,
    dogrula,
    duzenlemeVar,
    eklemeVar,
    form,
    hataBildir,
    mod,
    onKaydedildi,
    saltOkunur,
    seciliKayit,
    stokId,
  ]);

  useEffect(() => {
    kaydetRef.current = kaydet;
    return () => {
      kaydetRef.current = null;
    };
  }, [kaydet, kaydetRef]);

  const birimSecenekleri = useMemo(
    () => birimAdiSecenekleri(birimler, seciliKayit?.id),
    [birimler, seciliKayit?.id]
  );

  const sekmeDegistir = useCallback((id: string) => {
    setAktifSekme(id as StokKartSekmeId);
  }, []);

  const baslik =
    mod === 'yeni' ? 'Yeni Stok Kartı' : seciliKayit ? seciliKayit.urunAdi : 'Stok Kartı';
  const ustEtiket = mod === 'yeni' ? 'Yeni Stok' : mod === 'incele' ? 'Stok İncele' : 'Stok Düzenle';
  const rozet =
    mod === 'yeni' ? 'Yeni Ekle' : mod === 'incele' ? 'İncele' : 'Düzenle';

  const guncellemeGoster =
    mod === 'yeni'
      ? ''
      : seciliKayit?.guncelleme
        ? tarihSaatFormatla(seciliKayit.guncelleme)
        : '';

  if (yukleniyor && mod !== 'yeni') {
    return <TanimYukleniyor />;
  }

  if (mod !== 'yeni' && !seciliKayit) {
    return <TanimYukleniyor />;
  }

  const anaTanimlar = (
    <TanimFormBolum baslik="Ana Tanımlar">
      <div className="stok-karti-ana-tanimlar">
        <div className="stok-karti-ana-ust">
          <MetinGirdi
            etiket="Stok Kodu"
            deger={form.urunKodu}
            maxLength={30}
            zorunlu
            onChange={(urunKodu) => setForm((f) => ({ ...f, urunKodu }))}
          />
          <MetinGirdi
            etiket="Stok Adı"
            deger={form.urunAdi}
            maxLength={255}
            zorunlu
            onChange={(urunAdi) => setForm((f) => ({ ...f, urunAdi }))}
          />
        </div>
        <div className="stok-karti-ana-alt">
          <SecimGirdi
            etiket="Ana Birim"
            deger={form.anaBirim}
            onChange={(anaBirim) => setForm((f) => ({ ...f, anaBirim }))}
            secenekler={birimSecenekleri}
          />
          <SecimGirdi
            etiket="Varsayılan"
            deger={form.varsayilanBirim}
            onChange={(varsayilanBirim) => setForm((f) => ({ ...f, varsayilanBirim }))}
            secenekler={birimSecenekleri}
          />
          <TarihGirdi
            etiket="Güncelleme Tarihi"
            deger={guncellemeGoster}
            saltOkunur
            placeholder="Kayıt sonrası oluşur"
          />
        </div>
      </div>
    </TanimFormBolum>
  );

  const ekTanimlar = (
    <TanimFormBolum baslik="Ek Tanımlar">
      <div className="stok-karti-ek-tanimlar">
        <div className="stok-karti-ek-ust">
          <SecimGirdi
            etiket="KDV Departmanı"
            deger={form.kdvDepartmani}
            onChange={(kdvDepartmani) => setForm((f) => ({ ...f, kdvDepartmani }))}
            secenekler={STOK_KDV_DEPARTMAN_SECENEKLERI.map((x) => ({ ...x }))}
          />
          <SecimGirdi
            etiket="Stok Tipi"
            deger={form.urunTipi}
            onChange={(urunTipi) => setForm((f) => ({ ...f, urunTipi }))}
            secenekler={URUN_TIPLERI.map((x) => ({ ...x }))}
            zorunlu
          />
          <SecimGirdi
            etiket="KDV Departmanı .T"
            deger={form.kdvDepartmaniToplam}
            onChange={(kdvDepartmaniToplam) => setForm((f) => ({ ...f, kdvDepartmaniToplam }))}
            secenekler={STOK_KDV_DEPARTMAN_SECENEKLERI.map((x) => ({ ...x }))}
          />
          <SecimGirdi
            etiket="Stok Nevi"
            deger={form.urunNevi}
            onChange={(urunNevi) => setForm((f) => ({ ...f, urunNevi }))}
            secenekler={[{ value: '', label: 'Seçilmedi' }, ...URUN_NEVILERI.map((x) => ({ ...x }))]}
          />
          <MetinGirdi
            etiket="Üretici"
            deger={form.marka}
            maxLength={100}
            onChange={(marka) => setForm((f) => ({ ...f, marka }))}
          />
          <SayiGirdi
            etiket="ÖTV (%)"
            deger={form.otvYuzde}
            onChange={(otvYuzde) => setForm((f) => ({ ...f, otvYuzde }))}
          />
        </div>

        <div className="stok-karti-ek-govde">
          <div className="stok-karti-ek-sol">
            <SayiGirdi
              etiket="Alış Fiyatı (TL)"
              deger={form.alisFiyati}
              onChange={(alisFiyati) => setForm((f) => ({ ...f, alisFiyati }))}
            />
            <FiyatPbGirdi
              etiket="D.Alış Fiyatı"
              deger={form.dAlisFiyati}
              pb={form.dAlisPb}
              onDeger={(dAlisFiyati) => setForm((f) => ({ ...f, dAlisFiyati }))}
              onPb={(dAlisPb) => setForm((f) => ({ ...f, dAlisPb }))}
            />
            <FiyatPbGirdi
              etiket="Default Fiyat"
              deger={form.defaultFiyat}
              pb={form.defaultPb}
              onDeger={(defaultFiyat) => setForm((f) => ({ ...f, defaultFiyat }))}
              onPb={(defaultPb) => setForm((f) => ({ ...f, defaultPb }))}
            />
            <SayiGirdi
              etiket="SatFiy 1 İsk (%)"
              deger={form.satFiy1Isk}
              onChange={(satFiy1Isk) => setForm((f) => ({ ...f, satFiy1Isk }))}
            />
            <SayiGirdi
              etiket="SatFiy 2 İsk (%)"
              deger={form.satFiy2Isk}
              onChange={(satFiy2Isk) => setForm((f) => ({ ...f, satFiy2Isk }))}
            />
            <SayiGirdi
              etiket="SatFiy 3 İsk (%)"
              deger={form.satFiy3Isk}
              onChange={(satFiy3Isk) => setForm((f) => ({ ...f, satFiy3Isk }))}
            />
            <SayiGirdi
              etiket="SatFiy 4 İsk (%)"
              deger={form.satFiy4Isk}
              onChange={(satFiy4Isk) => setForm((f) => ({ ...f, satFiy4Isk }))}
            />
            <SayiGirdi
              etiket="SatFiy 5 İsk (%)"
              deger={form.satFiy5Isk}
              onChange={(satFiy5Isk) => setForm((f) => ({ ...f, satFiy5Isk }))}
            />
            <SayiGirdi
              etiket="SatFiy 6 İsk (%)"
              deger={form.satFiy6Isk}
              onChange={(satFiy6Isk) => setForm((f) => ({ ...f, satFiy6Isk }))}
            />
            <SayiGirdi
              etiket="Max İsk (%)"
              deger={form.maxIsk}
              onChange={(maxIsk) => setForm((f) => ({ ...f, maxIsk }))}
            />
          </div>

          <div className="stok-karti-ek-orta">
            <SayiGirdi
              etiket="Alış KDV (%)"
              deger={form.alisKdv}
              onChange={(alisKdv) => setForm((f) => ({ ...f, alisKdv }))}
            />
            <SayiGirdi
              etiket="Alış İsk (%)"
              deger={form.alisIsk}
              onChange={(alisIsk) => setForm((f) => ({ ...f, alisIsk }))}
            />
            <TarihGirdi
              etiket="Tarih"
              deger={form.tarih}
              onChange={(tarih) => setForm((f) => ({ ...f, tarih }))}
            />
          </div>

          <div className="stok-karti-ek-sag">
            <SayiGirdi etiket="ÖTV" deger={form.otv} onChange={(otv) => setForm((f) => ({ ...f, otv }))} />
            <SayiGirdi
              etiket="Maliyet"
              deger={form.maliyet}
              onChange={(maliyet) => setForm((f) => ({ ...f, maliyet }))}
            />
            <div className="stok-karti-ek-mini">
              <SayiGirdi
                etiket="Raf Ömrü (Gün)"
                deger={form.rafOmruGun}
                onChange={(rafOmruGun) => setForm((f) => ({ ...f, rafOmruGun }))}
              />
              <SayiGirdi
                etiket="Kar (%)"
                deger={form.karYuzde}
                onChange={(karYuzde) => setForm((f) => ({ ...f, karYuzde }))}
              />
              <SayiGirdi
                etiket="Ops. (Gün)"
                deger={form.opsGun}
                onChange={(opsGun) => setForm((f) => ({ ...f, opsGun }))}
              />
              <SayiGirdi
                etiket="Prim (%)"
                deger={form.primYuzde}
                onChange={(primYuzde) => setForm((f) => ({ ...f, primYuzde }))}
              />
              <SayiGirdi
                etiket="Temin Süresi"
                deger={form.teminSuresi}
                onChange={(teminSuresi) => setForm((f) => ({ ...f, teminSuresi }))}
              />
              <SayiGirdi
                etiket="Garanti"
                deger={form.garanti}
                onChange={(garanti) => setForm((f) => ({ ...f, garanti }))}
              />
            </div>
          </div>
        </div>
      </div>
    </TanimFormBolum>
  );

  const sekmeIcerik = (
    <StokKartiSekmeIcerik
      aktifSekme={aktifSekme}
      form={form}
      setForm={setForm}
      stokBilgileri={ekTanimlar}
    />
  );

  return (
    <div className="stok-karti-kabuk">
      <TanimDuzenleEkrani
        ustEtiket={ustEtiket}
        baslik={baslik}
        rozet={rozet}
        olusturma={seciliKayit?.olusturma}
        guncelleme={seciliKayit?.guncelleme}
        onGeri={onGeri}
        onKaydet={!saltOkunur && !kaydediliyor ? () => void kaydet() : undefined}
        kaydediliyor={kaydediliyor}
        saltOkunur={saltOkunur}
      >
        <div className="stok-karti-icerik ap-scroll">
          <fieldset disabled={saltOkunur} className="stok-karti-form border-0 p-0 m-0 min-w-0">
            {anaTanimlar}
          </fieldset>

          <div className="stok-karti-sekme-sarici">
            <TanimModCubugu
              sekmeler={STOK_KART_SEKMELERI.map((s) => ({
                id: s.id,
                ad: s.ad,
              }))}
              aktif={aktifSekme}
              onDegistir={sekmeDegistir}
              ariaLabel="Stok kartı sekmeleri"
              kompakt
            />
          </div>

          <fieldset
            disabled={saltOkunur}
            className="stok-karti-form border-0 p-0 m-0 min-w-0"
            key={aktifSekme}
            data-stok-sekme={aktifSekme}
          >
            {sekmeIcerik}
          </fieldset>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
