import { useCallback, useEffect, useMemo, useState, type MutableRefObject } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { TanimModCubugu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimModCubugu';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import {
  URUN_NEVILERI,
  URUN_TIPLERI,
  type AdminBirim,
} from '@/admin/baslat-menusu/erp/urun-yonetimi/tipler';
import { birimleriGetir, stokGuncelle, stokOlustur, stoklariGetir } from './api';
import {
  STOK_SON_EKLENENLER_MOCK,
  type StokSonEklenen,
} from './stokSonEklenenlerMock';
import {
  STOK_KART_SEKMELERI,
  bosStokForm,
  type AdminStok,
  type StokForm,
  type StokKartModu,
  type StokKartSekmeId,
} from './tipler';

const stoktenForm = (s: AdminStok): StokForm => ({
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
  const [sonEklenenSeciliId, setSonEklenenSeciliId] = useState<string | null>(null);

  const sonEklenenler = STOK_SON_EKLENENLER_MOCK;

  const sonEklenenFormaAktar = useCallback((oge: StokSonEklenen) => {
    setSonEklenenSeciliId(oge.id);
    setForm({
      ustId: '',
      urunTipi: oge.urunTipi,
      urunNevi: oge.urunNevi,
      urunKodu: oge.urunKodu,
      marka: oge.marka,
      urunAdi: oge.urunAdi,
      anaBirim: oge.anaBirim,
      varsayilanBirim: oge.varsayilanBirim,
      mensei: oge.mensei,
    });
  }, []);

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
      setSonEklenenSeciliId(null);
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
        form.mensei.trim() !== '' ||
        form.anaBirim.trim() !== '' ||
        form.varsayilanBirim.trim() !== '' ||
        form.ustId.trim() !== ''
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
    setKaydediliyor(true);
    try {
      if (mod === 'duzenle' && stokId) {
        await stokGuncelle(stokId, { ...form, aktif });
        basariBildir('Stok kartı güncellendi.');
      } else {
        await stokOlustur({ ...form, aktif: true });
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

  const ustUrunSecenekleri = useMemo(
    () => [
      { value: '', label: 'Yok' },
      ...kayitlar
        .filter((u) => u.id !== stokId)
        .map((u) => ({ value: u.id, label: `${u.urunKodu} — ${u.urunAdi}` })),
    ],
    [kayitlar, stokId]
  );

  const birimSecenekleri = useMemo(
    () => birimAdiSecenekleri(birimler, seciliKayit?.id),
    [birimler, seciliKayit?.id]
  );

  const sekmeDegistir = useCallback(
    (id: string) => {
      const sekme = STOK_KART_SEKMELERI.find((s) => s.id === id);
      if (!sekme?.aktif) {
        hataBildir('Bu sekme henüz kullanıma açılmadı.');
        return;
      }
      if (!form.urunKodu.trim() && id !== 'stok-bilgileri') {
        hataBildir('Bu işlemi yapabilmek için önce Stok Kodu tanımlayınız.');
        return;
      }
      setAktifSekme(id as StokKartSekmeId);
    },
    [form.urunKodu, hataBildir]
  );

  const baslik =
    mod === 'yeni' ? 'Yeni Stok Kartı' : seciliKayit ? seciliKayit.urunAdi : 'Stok Kartı';
  const ustEtiket = mod === 'yeni' ? 'Yeni Stok' : mod === 'incele' ? 'Stok İncele' : 'Stok Düzenle';
  const rozet =
    mod === 'yeni' ? 'Yeni Ekle' : mod === 'incele' ? 'İncele' : 'Düzenle';

  if (yukleniyor && mod !== 'yeni') {
    return <TanimYukleniyor />;
  }

  if (mod !== 'yeni' && !seciliKayit) {
    return <TanimYukleniyor />;
  }

  const anaTanimlar = (
    <TanimFormBolum baslik="Kimlik">
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <TanimGirdi
          etiket="Stok Kodu"
          deger={form.urunKodu}
          maxLength={30}
          zorunlu
          onChange={(urunKodu) => setForm((f) => ({ ...f, urunKodu }))}
        />
        <TanimGirdi
          etiket="Stok Adı"
          deger={form.urunAdi}
          maxLength={255}
          zorunlu
          onChange={(urunAdi) => setForm((f) => ({ ...f, urunAdi }))}
        />
      </div>
    </TanimFormBolum>
  );

  const siniflandirma = (
    <TanimFormBolum baslik="Sınıflandırma">
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">
            Stok Tipi <span>*</span>
          </span>
          <FormAcilirSecim
            value={form.urunTipi}
            onChange={(urunTipi) => setForm((f) => ({ ...f, urunTipi }))}
            secenekler={URUN_TIPLERI.map((x) => ({ ...x }))}
          />
        </label>
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">Stok Nevi</span>
          <FormAcilirSecim
            value={form.urunNevi}
            onChange={(urunNevi) => setForm((f) => ({ ...f, urunNevi }))}
            secenekler={[{ value: '', label: 'Seçilmedi' }, ...URUN_NEVILERI.map((x) => ({ ...x }))]}
          />
        </label>
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">Üst Ürün</span>
          <FormAcilirSecim
            value={form.ustId}
            onChange={(ustId) => setForm((f) => ({ ...f, ustId }))}
            secenekler={ustUrunSecenekleri}
          />
        </label>
      </div>
    </TanimFormBolum>
  );

  const birimlerBolum = (
    <TanimFormBolum baslik="Birimler">
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">Ana Birim</span>
          <FormAcilirSecim
            value={form.anaBirim}
            onChange={(anaBirim) => setForm((f) => ({ ...f, anaBirim }))}
            secenekler={birimSecenekleri}
          />
        </label>
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-tanim-girdi-etiket">Varsayılan Birim</span>
          <FormAcilirSecim
            value={form.varsayilanBirim}
            onChange={(varsayilanBirim) => setForm((f) => ({ ...f, varsayilanBirim }))}
            secenekler={birimSecenekleri}
          />
        </label>
      </div>
    </TanimFormBolum>
  );

  const ekstraBolum = (
    <TanimFormBolum baslik="Üretici Bilgileri">
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <TanimGirdi
          etiket="Üretici / Marka"
          deger={form.marka}
          maxLength={100}
          onChange={(marka) => setForm((f) => ({ ...f, marka }))}
        />
        <TanimGirdi
          etiket="Menşei"
          deger={form.mensei}
          maxLength={50}
          onChange={(mensei) => setForm((f) => ({ ...f, mensei }))}
        />
      </div>
    </TanimFormBolum>
  );

  const stokBilgileriDuzenle = (
    <>
      {siniflandirma}
      {birimlerBolum}
      {ekstraBolum}
    </>
  );

  const sekmeIcerik =
    aktifSekme === 'stok-bilgileri' ? (
      stokBilgileriDuzenle
    ) : (
      <p className="ap-tanimlar-duzenle-alt">Bu sekme yakında eklenecek.</p>
    );

  const sekmeGoster = mod !== 'yeni';

  return (
    <div className={`stok-karti-kabuk${mod === 'yeni' ? ' stok-karti-kabuk--yeni' : ''}`}>
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
        <div className={`stok-karti-icerik ap-scroll${mod === 'yeni' ? ' stok-karti-icerik--yeni' : ''}`}>
          {mod === 'yeni' ? (
            <div className="stok-yeni-duzen">
              <aside className="stok-yeni-sol" aria-label="En son eklenenler">
                <div className="stok-yeni-sol-baslik">
                  <h4>En Son Eklenenler</h4>
                  <span>{sonEklenenler.length}</span>
                </div>
                <ul className="stok-yeni-sol-liste">
                  {sonEklenenler.map((oge) => {
                    const secili = oge.id === sonEklenenSeciliId;
                    return (
                      <li key={oge.id}>
                        <button
                          type="button"
                          className={`stok-yeni-sol-oge${secili ? ' stok-yeni-sol-oge--secili' : ''}`}
                          onClick={() => sonEklenenFormaAktar(oge)}
                        >
                          <span className="stok-yeni-sol-kod">{oge.urunKodu}</span>
                          <span className="stok-yeni-sol-ad">{oge.urunAdi}</span>
                          <span className="stok-yeni-sol-meta">
                            {oge.urunTipi}
                            {oge.olusturma ? ` · ${tarihSaatFormatla(oge.olusturma)}` : ''}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>

              <div className="stok-yeni-sag">
                <fieldset disabled={saltOkunur} className="stok-karti-form border-0 p-0 m-0 min-w-0">
                  {anaTanimlar}
                  {siniflandirma}
                  {birimlerBolum}
                  {ekstraBolum}
                </fieldset>
              </div>
            </div>
          ) : (
            <>
              <fieldset disabled={saltOkunur} className="stok-karti-form border-0 p-0 m-0 min-w-0">
                {anaTanimlar}
              </fieldset>
              <div className="stok-karti-sekme-sarici">
                <TanimModCubugu
                  sekmeler={STOK_KART_SEKMELERI.map((s) => ({
                    id: s.id,
                    ad: s.ad,
                    ikon: s.aktif ? undefined : '🔒',
                  }))}
                  aktif={aktifSekme}
                  onDegistir={sekmeDegistir}
                  ariaLabel="Stok kartı sekmeleri"
                  kompakt
                />
              </div>
              <fieldset disabled={saltOkunur} className="stok-karti-form border-0 p-0 m-0 min-w-0">
                {sekmeIcerik}
              </fieldset>
            </>
          )}
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
