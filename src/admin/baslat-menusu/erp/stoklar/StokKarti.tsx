import { useCallback, useEffect, useMemo, useState, type MutableRefObject } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { CariSecenekModal } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariSecenekModal';
import { CariOutlinedAcilir } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedAcilir';
import { CariOutlinedAramaAcilir } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedAramaAcilir';
import { CariOutlinedGirdi } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import { CariOutlinedMarka } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedMarka';
import { CariOutlinedMensei } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedMensei';
import '@/admin/baslat-menusu/erp/cari/cari.css';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { markaCacheSifirla, stokMarkaEkle } from '@/veri/markalar';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import {
  URUN_NEVILERI,
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
import { StokDigerVergiBlok } from './StokDigerVergiBlok';
import { StokEnvanterTakibiDetay } from './StokEnvanterTakibiDetay';
import {
  stokKdvDepartmaniEkle,
  stokKdvDepartmaniGuncelle,
  stokKdvDepartmaniGosterimEtiketi,
  stokKdvDepartmaniSil,
  stokKdvDepartmanlariGetir,
  type StokKdvDepartmaniSecenek,
} from './stokKdvDepartmanlari';
import { StokKdvDepartmanModal } from './StokKdvDepartmanModal';
import {
  stokTipiEkle,
  stokTipiGuncelle,
  stokTipiSil,
  stokTipleriGetir,
  type StokTipiSecenek,
} from './stokTipleri';
import {
  bosStokForm,
  ENVANTER_TAKIBI_SECENEKLERI,
  envanterDetayKolonSayisi,
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
  marka: s.marka.trim().toLocaleUpperCase('tr'),
  urunAdi: s.urunAdi,
  anaBirim: s.anaBirim,
  varsayilanBirim: s.varsayilanBirim,
  mensei: s.mensei,
});

function formlarEsit(a: StokForm, b: StokForm): boolean {
  return (Object.keys(a) as (keyof StokForm)[]).every((k) => a[k] === b[k]);
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
  const [stokTipleri, setStokTipleri] = useState<StokTipiSecenek[]>(() => stokTipleriGetir());
  const [kdvDepartmanlari, setKdvDepartmanlari] = useState<StokKdvDepartmaniSecenek[]>(() =>
    stokKdvDepartmanlariGetir()
  );
  const [tipModalAcik, setTipModalAcik] = useState(false);
  const [kdvModalAcik, setKdvModalAcik] = useState(false);

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
    setStokTipleri(stokTipleriGetir());
  }, [tipModalAcik]);

  useEffect(() => {
    setKdvDepartmanlari(stokKdvDepartmanlariGetir());
  }, [kdvModalAcik]);

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
        const anaBirimMi = Boolean(anaBirim && b.birimAdi === anaBirim);
        return {
          ...satir,
          anaBirimMi,
          varsayilanMi: Boolean(varsayilanBirim && b.birimAdi === varsayilanBirim),
          carpan: anaBirimMi ? 1 : satir.carpan,
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
    urunForm.marka = urunForm.marka.trim().toLocaleUpperCase('tr');
    // Ana/varsayılan birim, birim satırlarındaki işaretlerden gelir
    urunForm.anaBirim = birimSatirlari.find((s) => s.anaBirimMi)?.birim ?? '';
    urunForm.varsayilanBirim = birimSatirlari.find((s) => s.varsayilanMi)?.birim ?? '';

    const birimSatirlariniKaydet = async (urunId: string) => {
      for (const satir of birimSatirlari) {
        // Otomatik eklenen ve hiç dokunulmamış boş satırları kaydetme
        if (geciciIdMi(satir.id) && birimSatiriBosMu(satir)) continue;
        const kaydedilecek = satir.anaBirimMi ? { ...satir, carpan: 1 } : satir;
        const birimForm = fiyatDuzenleSatirdanBirimForm(kaydedilecek, urunId);
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
      if (urunForm.marka) {
        stokMarkaEkle(urunForm.marka);
        markaCacheSifirla();
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
    mod !== 'yeni' && seciliKayit?.guncelleme
      ? tarihSaatFormatla(seciliKayit.guncelleme)
      : mod === 'yeni'
        ? 'Kayıt sonrası oluşur'
        : '—';

  const kayitGoster =
    mod !== 'yeni' && seciliKayit?.olusturma
      ? tarihSaatFormatla(seciliKayit.olusturma)
      : mod === 'yeni'
        ? 'Kayıt sonrası oluşur'
        : '—';

  if (yukleniyor && mod !== 'yeni') {
    return <TanimYukleniyor />;
  }

  if (mod !== 'yeni' && !seciliKayit) {
    return <TanimYukleniyor />;
  }

  const anaTanimlar = (
    <div className="stok-karti-ana-tanimlar stok-karti-bolum-panel">
      <div className="stok-karti-ana-grid">
        <CariOutlinedGirdi
          etiket="Stok Kodu"
          deger={form.urunKodu}
          kural="stokKod"
          zorunlu
          maxLength={30}
          buyukHarf
          disabled={saltOkunur}
          odakPlaceholder="Stok kodunu yazınız"
          onChange={(urunKodu) => setForm((f) => ({ ...f, urunKodu }))}
        />
        <CariOutlinedGirdi
          etiket="Stok Adı"
          deger={form.urunAdi}
          zorunlu
          maxLength={255}
          buyukHarf
          disabled={saltOkunur}
          odakPlaceholder="Stok adını yazınız"
          onChange={(urunAdi) => setForm((f) => ({ ...f, urunAdi }))}
        />
        <div className="stok-karti-gtip-envanter-satir">
          <CariOutlinedAcilir
            etiket="Stok Tipi"
            zorunlu
            deger={form.urunTipi}
            disabled={saltOkunur}
            secenekler={stokTipleri.map((x) => ({ ...x }))}
            onYonet={() => setTipModalAcik(true)}
            onChange={(urunTipi) => setForm((f) => ({ ...f, urunTipi }))}
          />
          <CariOutlinedGirdi
            etiket="GTIP Kodu"
            deger={form.gtip}
            disabled={saltOkunur}
            maxLength={20}
            buyukHarf
            className="stok-karti-kisa-alan"
            odakPlaceholder="GTIP kodunu yazınız"
            onChange={(gtip) => setForm((f) => ({ ...f, gtip }))}
          />
          <CariOutlinedAramaAcilir
            etiket="KDV Departmanı"
            deger={form.kdvDepartmani}
            disabled={saltOkunur}
            secenekler={kdvDepartmanlari.map((x) => ({
              value: x.value,
              label: stokKdvDepartmaniGosterimEtiketi(x),
            }))}
            aramaPlaceholder="KDV departmanı ara…"
            bosMetin="KDV Departmanı"
            kutuIciArama
            onYonet={() => setKdvModalAcik(true)}
            onChange={(kdvDepartmani) => setForm((f) => ({ ...f, kdvDepartmani }))}
          />
          <div
            className="stok-karti-envanter-blok"
            data-detay={envanterDetayKolonSayisi(form.envanterTakibi || 'YOK')}
          >
            <CariOutlinedAcilir
              etiket="Envanter Takibi"
              deger={form.envanterTakibi || 'YOK'}
              disabled={saltOkunur}
              secenekler={[...ENVANTER_TAKIBI_SECENEKLERI]}
              onChange={(envanterTakibi) => setForm((f) => ({ ...f, envanterTakibi }))}
            />
            <StokEnvanterTakibiDetay
              envanterTakibi={form.envanterTakibi}
              form={form}
              disabled={saltOkunur}
              onAlan={(alan, deger) => setForm((f) => ({ ...f, [alan]: deger }))}
            />
          </div>
        </div>
        <div className="stok-karti-ana-nevi-satir">
          <CariOutlinedAcilir
            etiket="Stok Nevi"
            deger={form.urunNevi}
            disabled={saltOkunur}
            secenekler={[{ value: '', label: 'Seçilmedi' }, ...URUN_NEVILERI.map((x) => ({ ...x }))]}
            onChange={(urunNevi) => setForm((f) => ({ ...f, urunNevi }))}
          />
          <StokDigerVergiBlok />
        </div>
        <CariOutlinedMarka
          deger={form.marka}
          disabled={saltOkunur}
          onChange={(marka) => setForm((f) => ({ ...f, marka }))}
        />
        <CariOutlinedGirdi
          etiket="Güncelleme Tarihi"
          deger={guncellemeGoster}
          disabled
          onChange={() => undefined}
        />
        <CariOutlinedMensei
          deger={form.mensei}
          disabled={saltOkunur}
          onChange={(mensei) => setForm((f) => ({ ...f, mensei }))}
        />
        <CariOutlinedGirdi
          etiket="Kayıt Tarihi"
          deger={kayitGoster}
          disabled
          onChange={() => undefined}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="stok-karti-kabuk">
        <TanimDuzenleEkrani
          ustGizle
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
              <StokYeniBirimler satirlar={birimSatirlari} onChange={birimSatirlariAyarla} />
            </fieldset>
          </div>
        </TanimDuzenleEkrani>
      </div>

      <StokKdvDepartmanModal
        acik={kdvModalAcik}
        liste={kdvDepartmanlari}
        onEkle={(ad, yuzde) => {
          const sonuc = stokKdvDepartmaniEkle(ad, yuzde);
          if (!sonuc) return false;
          setKdvDepartmanlari(stokKdvDepartmanlariGetir());
          setForm((f) => ({ ...f, kdvDepartmani: sonuc.value }));
          return true;
        }}
        onGuncelle={(value, ad, yuzde) => {
          const ok = stokKdvDepartmaniGuncelle(value, ad, yuzde);
          if (ok) setKdvDepartmanlari(stokKdvDepartmanlariGetir());
          return ok;
        }}
        onSil={(value) => {
          stokKdvDepartmaniSil(value);
          setKdvDepartmanlari(stokKdvDepartmanlariGetir());
          if (form.kdvDepartmani === value) setForm((f) => ({ ...f, kdvDepartmani: '' }));
        }}
        onKapat={() => setKdvModalAcik(false)}
      />

      <CariSecenekModal
        acik={tipModalAcik}
        baslik="Stok Tipi"
        placeholder="Yeni stok tipi adı…"
        liste={stokTipleri.map((t) => ({ value: t.value, label: t.label }))}
        sabitDegerler={['EMTIA', 'HIZMET']}
        kullanimNesneAdi="stok tipini"
        kullanimSayisiAl={(value) => kayitlar.filter((s) => s.urunTipi === value).length}
        onEkle={(ad) => {
          const sonuc = stokTipiEkle(ad);
          if (!sonuc) return false;
          setStokTipleri(stokTipleriGetir());
          setForm((f) => ({ ...f, urunTipi: sonuc.value }));
          return true;
        }}
        onGuncelle={(value, ad) => {
          const ok = stokTipiGuncelle(value, ad);
          if (ok) setStokTipleri(stokTipleriGetir());
          return ok;
        }}
        onSil={(value) => {
          stokTipiSil(value);
          setStokTipleri(stokTipleriGetir());
          if (form.urunTipi === value) setForm((f) => ({ ...f, urunTipi: 'EMTIA' }));
        }}
        onKapat={() => setTipModalAcik(false)}
      />
    </>
  );
}
