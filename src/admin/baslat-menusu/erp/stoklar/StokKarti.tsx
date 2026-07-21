import { useCallback, useEffect, useMemo, useState, type MutableRefObject, type ReactNode } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
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
import { birimGuncelle, birimOlustur, birimleriGetir, stokGuncelle, stokOlustur, stoklariGetir } from './api';
import {
  birimSatiriBosMu,
  birimdenFiyatDuzenleSatir,
  bosBirimFiyatSatiri,
  fiyatDuzenleSatirdanBirimForm,
  geciciIdMi,
} from './birimMap';
import type { StokFiyatDuzenleSatir } from './fiyatDuzenleTipler';
import { StokYeniBirimler } from './StokYeniBirimler';
import {
  bosStokForm,
  stokFormdanUrunForm,
  type AdminStok,
  type StokForm,
  type StokKartModu,
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
  const [aktif, setAktif] = useState(true);
  const [birimSatirlari, setBirimSatirlari] = useState<StokFiyatDuzenleSatir[]>(() => [
    bosBirimFiyatSatiri({ anaBirimMi: true, varsayilanMi: true }),
  ]);
  const [birimlerKirli, setBirimlerKirli] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);

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
      setAktif(true);
      return;
    }
    if (seciliKayit) {
      setForm(stoktenForm(seciliKayit));
      setAktif(seciliKayit.aktif);
    }
  }, [mod, seciliKayit]);

  useEffect(() => {
    if (mod === 'yeni') {
      setBirimSatirlari([bosBirimFiyatSatiri({ anaBirimMi: true, varsayilanMi: true })]);
      setBirimlerKirli(false);
      return;
    }
    if (!stokId) return;
    const anaBirim = seciliKayit?.anaBirim?.trim() ?? '';
    const varsayilanBirim = seciliKayit?.varsayilanBirim?.trim() ?? '';
    const kayitli = birimler
      .filter((b) => b.urunId === stokId)
      .map((b) => {
        const satir = birimdenFiyatDuzenleSatir(b);
        return {
          ...satir,
          anaBirimMi: Boolean(anaBirim && b.birimAdi === anaBirim),
          varsayilanMi: Boolean(varsayilanBirim && b.birimAdi === varsayilanBirim),
        };
      });
    setBirimSatirlari(
      kayitli.length > 0 ? kayitli : [bosBirimFiyatSatiri({ anaBirimMi: true, varsayilanMi: true })]
    );
    setBirimlerKirli(false);
  }, [mod, stokId, birimler, seciliKayit]);

  const birimSatirlariAyarla = useCallback((satirlar: StokFiyatDuzenleSatir[]) => {
    setBirimSatirlari(satirlar);
    setBirimlerKirli(true);
  }, []);

  const kirli = useMemo(() => {
    if (mod === 'duzenle' && seciliKayit) {
      return (
        birimlerKirli ||
        !formlarEsit(form, stoktenForm(seciliKayit)) ||
        aktif !== seciliKayit.aktif
      );
    }
    if (mod === 'yeni') {
      return (
        birimlerKirli ||
        form.urunKodu.trim() !== '' ||
        form.urunAdi.trim() !== '' ||
        form.marka.trim() !== '' ||
        form.anaBirim.trim() !== '' ||
        form.varsayilanBirim.trim() !== ''
      );
    }
    return false;
  }, [aktif, birimlerKirli, form, mod, seciliKayit]);

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
    const urunForm = stokFormdanUrunForm(form);
    // Ana/varsayılan birim, birim satırlarındaki işaretlerden gelir
    urunForm.anaBirim = birimSatirlari.find((s) => s.anaBirimMi)?.birim ?? '';
    urunForm.varsayilanBirim = birimSatirlari.find((s) => s.varsayilanMi)?.birim ?? '';

    const birimSatirlariniKaydet = async (urunId: string) => {
      for (const satir of birimSatirlari) {
        // Otomatik eklenen ve hiç dokunulmamış boş satırları kaydetme
        if (geciciIdMi(satir.id) && birimSatiriBosMu(satir)) continue;
        const birimForm = fiyatDuzenleSatirdanBirimForm(satir, urunId);
        if (geciciIdMi(satir.id)) await birimOlustur(birimForm);
        else await birimGuncelle(satir.id, birimForm);
      }
    };

    setKaydediliyor(true);
    try {
      if (mod === 'duzenle' && stokId) {
        await stokGuncelle(stokId, { ...urunForm, aktif });
        await birimSatirlariniKaydet(stokId);
        basariBildir('Stok kartı güncellendi.');
      } else {
        const yeniStok = await stokOlustur({ ...urunForm, aktif });
        await birimSatirlariniKaydet(yeniStok.id);
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
    aktif,
    basariBildir,
    birimSatirlari,
    birimlerKirli,
    dogrula,
    duzenlemeVar,
    eklemeVar,
    form,
    hataBildir,
    mod,
    onKaydedildi,
    saltOkunur,
    stokId,
  ]);

  useEffect(() => {
    kaydetRef.current = kaydet;
    return () => {
      kaydetRef.current = null;
    };
  }, [kaydet, kaydetRef]);

  const baslik =
    form.urunAdi.trim() ||
    seciliKayit?.urunAdi ||
    (mod === 'yeni' ? 'Yeni Stok Kartı' : 'Stok Kartı');
  const altBaslik = form.urunKodu.trim() || seciliKayit?.urunKodu || undefined;
  const ustEtiket =
    mod === 'yeni' ? 'Yeni Stok' : mod === 'incele' ? 'Stok İncele' : 'Stok Düzenle';
  const rozet = mod === 'yeni' ? 'Yeni Ekle' : mod === 'incele' ? 'İncele' : 'Düzenle';

  const guncellemeGoster =
    mod !== 'yeni' && seciliKayit?.guncelleme ? tarihSaatFormatla(seciliKayit.guncelleme) : '';

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
        <div className="stok-karti-ana-govde">
          <div className="stok-karti-ana-kolon">
            <SecimGirdi
              etiket="Stok Tipi"
              deger={form.urunTipi}
              onChange={(urunTipi) => setForm((f) => ({ ...f, urunTipi }))}
              secenekler={URUN_TIPLERI.map((x) => ({ ...x }))}
              zorunlu
            />
            <SecimGirdi
              etiket="Stok Nevi"
              deger={form.urunNevi}
              onChange={(urunNevi) => setForm((f) => ({ ...f, urunNevi }))}
              secenekler={[{ value: '', label: 'Seçilmedi' }, ...URUN_NEVILERI.map((x) => ({ ...x }))]}
            />
            <MetinGirdi
              etiket="Marka"
              deger={form.marka}
              maxLength={100}
              onChange={(marka) => setForm((f) => ({ ...f, marka }))}
            />
            <MetinGirdi
              etiket="Menşei"
              deger={form.mensei}
              maxLength={50}
              onChange={(mensei) => setForm((f) => ({ ...f, mensei }))}
            />
          </div>
          <div className="stok-karti-ana-kolon">
            <TarihGirdi
              etiket="Güncelleme Tarihi"
              deger={guncellemeGoster}
              saltOkunur
              placeholder={mod === 'yeni' ? 'Kayıt sonrası oluşur' : '—'}
            />
            <div className="stok-karti-yatay stok-karti-durum-satir">
              <span className="stok-karti-yatay-etiket">Durum</span>
              <div className="stok-karti-yatay-kontrol">
                {!saltOkunur ? (
                  <OrtakDurumAlani aktif={aktif} onChange={setAktif} />
                ) : (
                  <span className={aktif ? 'ap-tanimlar-aktif-etiket--aktif' : 'ap-tanimlar-aktif-etiket--pasif'}>
                    {aktif ? 'Aktif' : 'Pasif'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TanimFormBolum>
  );

  return (
    <div className="stok-karti-kabuk">
      <TanimDuzenleEkrani
        ustEtiket={ustEtiket}
        baslik={baslik}
        altBaslik={altBaslik}
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

          <fieldset disabled={saltOkunur} className="stok-karti-form border-0 p-0 m-0 min-w-0">
            <TanimFormBolum baslik="Birimler ve Fiyatlar (F001)">
              <StokYeniBirimler satirlar={birimSatirlari} onChange={birimSatirlariAyarla} />
            </TanimFormBolum>
          </fieldset>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
