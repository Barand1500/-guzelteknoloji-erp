import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  adGecerliMi,
  donemAdGecerliMi,
  ebelgeSeriGecerliMi,
  kodGecerliMi,
  mersisGecerliMi,
  postaKoduGecerliMi,
  vergiNoGecerliMi,
} from '@/admin/baslat-menusu/tanimlar/alanKurallari';
import {
  depoGuncelle,
  depolariGetir,
  donemOlustur,
  firmaOlustur,
  firmalariGetir,
  kasaOlustur,
  subeGuncelle,
  subeleriGetir,
} from '@/admin/baslat-menusu/tanimlar/api';
import { adresMetniniOku } from '@/admin/baslat-menusu/tanimlar/araclar/adresYardimci';
import { OrtakAdresFormu } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakAdresFormu';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import {
  TanimSihirbaz,
  type TanimSihirbazAdim,
} from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimSihirbaz';
import { TanimYukleniyor } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimYukleniyor';
import { VergiDairesiSecici } from '@/admin/baslat-menusu/tanimlar/bilesenler/VergiDairesiSecici';
import {
  bosDepoForm,
  bosDonemForm,
  bosFirmaForm,
  bosKasaForm,
  bosSubeForm,
  PARA_BIRIMLERI,
  type AdminFirma,
  type DepoFormDegeri,
  type DonemFormDegeri,
  type FirmaFormDegeri,
  type KasaFormDegeri,
  type SubeFormDegeri,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { TanimFirmaSecici } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFirmaSecici';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useYetkiler } from '@/kancalar/useYetkiler';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

type KurulumFazId = 'firma' | 'sube' | 'depo' | 'kasa' | 'donem';

const KURULUM_FAZ_SIRASI: KurulumFazId[] = ['firma', 'sube', 'depo', 'kasa', 'donem'];

/** Toplu akışta kayıt yapılan global adımlar (0 tabanlı) */
const TOPLU_KAYDET_ADIMLARI = new Set([0, 1, 2, 3]);

function globalAdimdenFaz(adim: number): KurulumFazId {
  return KURULUM_FAZ_SIRASI[adim] ?? 'donem';
}

interface KurulumSihirbaziProps {
  onTamamlandi: () => void;
  onIptal: () => void;
}

export function KurulumSihirbazi({ onTamamlandi, onIptal }: KurulumSihirbaziProps) {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar } = useYetkiler();

  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [globalAdim, setGlobalAdim] = useState(0);

  const [firmalar, setFirmalar] = useState<AdminFirma[]>([]);
  const [seciliFirmaId, setSeciliFirmaId] = useState('');

  const [firmaForm, setFirmaForm] = useState<FirmaFormDegeri>(bosFirmaForm);
  const [subeForm, setSubeForm] = useState<SubeFormDegeri>(bosSubeForm);
  const [depoForm, setDepoForm] = useState<DepoFormDegeri>(bosDepoForm);
  const [kasaForm, setKasaForm] = useState<KasaFormDegeri>({
    ...bosKasaForm,
    kasaKodu: 'KASA01',
    kasaAdi: 'Merkez Kasa',
  });
  const [donemForm, setDonemForm] = useState<DonemFormDegeri>(bosDonemForm);

  const [subeId, setSubeId] = useState<string | null>(null);
  const [depoId, setDepoId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [firmaListesi, subeListesi] = await Promise.all([firmalariGetir(), subeleriGetir()]);
        setFirmalar(firmaListesi);
        const ilkFirma = firmaListesi[0]?.id ?? '';
        const ilkSube = subeListesi[0]?.id ?? '';
        setSeciliFirmaId(ilkFirma);
        setDepoForm((d) => ({ ...d, subeId: ilkSube }));
        setKasaForm((k) => ({ ...k, subeId: ilkSube }));
      } catch (err) {
        hataBildir(err instanceof Error ? err.message : 'Veriler yüklenemedi');
      } finally {
        setYukleniyor(false);
      }
    })();
  }, [hataBildir]);

  const merkezKayitlariniYukle = useCallback(async (yeniFirmaId: string) => {
    const subeListesi = await subeleriGetir();
    const merkez = subeListesi.find((s) => s.firmaId === yeniFirmaId && s.subeKodu === 'MERKEZ');
    if (!merkez) throw new Error('MERKEZ şube oluşturulamadı');

    setSeciliFirmaId(yeniFirmaId);
    setSubeId(merkez.id);
    setSubeForm({
      subeKodu: merkez.subeKodu,
      subeAdi: merkez.subeAdi,
      il: merkez.il,
      ilce: merkez.ilce,
      mahalle: merkez.mahalle,
      postaKodu: merkez.postaKodu,
      adres: adresMetniniOku(merkez),
      efaturaSeri: merkez.efaturaSeri,
      earsivSeri: merkez.earsivSeri,
      eirsaliyeSeri: merkez.eirsaliyeSeri,
      mersis: merkez.mersis,
      ticaretSicil: merkez.ticaretSicil,
      aktif: merkez.aktif,
    });

    const depoListesi = await depolariGetir();
    const merkezDepo = depoListesi.find((d) => d.subeId === merkez.id && d.depoKodu === 'MERKEZ');
    if (!merkezDepo) throw new Error('MERKEZ depo oluşturulamadı');

    setDepoId(merkezDepo.id);
    setDepoForm({
      subeId: merkez.id,
      depoKodu: merkezDepo.depoKodu,
      depoAdi: merkezDepo.depoAdi,
      il: merkezDepo.il,
      ilce: merkezDepo.ilce,
      mahalle: merkezDepo.mahalle,
      postaKodu: merkezDepo.postaKodu,
      adres: adresMetniniOku(merkezDepo),
      aktif: merkezDepo.aktif,
    });

    setKasaForm((k) => ({ ...k, subeId: merkez.id }));
  }, []);

  const firmaSecici = (saltOkunur = false) => (
    <TanimFirmaSecici
      firmalar={firmalar}
      value={seciliFirmaId}
      onChange={saltOkunur ? undefined : setSeciliFirmaId}
      saltOkunur={saltOkunur}
    />
  );

  const firmaAdimlari = useMemo(
    (): TanimSihirbazAdim[] => [
      {
        baslik: 'Firma',
        aciklama: 'Firma kodu, unvan ve vergi bilgileri',
        icerik: (
          <>
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
              <TanimGirdi
                etiket="Firma Kodu"
                deger={firmaForm.firmaKodu}
                kural="kod"
                zorunlu
                onChange={(firmaKodu) => setFirmaForm((f) => ({ ...f, firmaKodu }))}
              />
              <TanimGirdi
                etiket="Firma Adı"
                deger={firmaForm.firmaAdi}
                kural="serbestMetin"
                maxLength={255}
                zorunlu
                onChange={(firmaAdi) => setFirmaForm((f) => ({ ...f, firmaAdi }))}
              />
            </div>
            <VergiDairesiSecici
              deger={firmaForm.vergiDairesi}
              onChange={(vergiDairesi) => setFirmaForm((f) => ({ ...f, vergiDairesi }))}
            />
            <TanimGirdi
              etiket="Vergi No"
              deger={firmaForm.vergiNo}
              kural="vergiNo"
              onChange={(vergiNo) => setFirmaForm((f) => ({ ...f, vergiNo }))}
            />
          </>
        ),
      },
    ],
    [firmaForm]
  );

  const subeAdimlari = useMemo((): TanimSihirbazAdim[] => {
    const merkezGuncelle = !!subeId;
    return [
      {
        baslik: 'Şube',
        aciklama: merkezGuncelle
          ? 'Merkez şube adres, e-belge ve ticari bilgileri'
          : 'Şube temel bilgileri, adres, e-belge serileri ve ticari kayıtlar',
        icerik: (
          <>
            {firmaSecici(merkezGuncelle)}
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
              <TanimGirdi
                etiket="Şube Kodu"
                deger={subeForm.subeKodu}
                kural="kod"
                zorunlu
                onChange={(subeKodu) => setSubeForm((s) => ({ ...s, subeKodu }))}
              />
              <TanimGirdi
                etiket="Şube Adı"
                deger={subeForm.subeAdi}
                kural="ad"
                zorunlu
                onChange={(subeAdi) => setSubeForm((s) => ({ ...s, subeAdi }))}
              />
            </div>
            <OrtakAdresFormu
              bolumsuz
              deger={subeForm}
              onChange={(adres) => setSubeForm((s) => ({ ...s, ...adres }))}
            />
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--3">
              <TanimGirdi
                etiket="E-Fatura Seri"
                deger={subeForm.efaturaSeri}
                kural="ebelgeSeri"
                onChange={(efaturaSeri) => setSubeForm((s) => ({ ...s, efaturaSeri }))}
              />
              <TanimGirdi
                etiket="E-Arşiv Seri"
                deger={subeForm.earsivSeri}
                kural="ebelgeSeri"
                onChange={(earsivSeri) => setSubeForm((s) => ({ ...s, earsivSeri }))}
              />
              <TanimGirdi
                etiket="E-İrsaliye Seri"
                deger={subeForm.eirsaliyeSeri}
                kural="ebelgeSeri"
                onChange={(eirsaliyeSeri) => setSubeForm((s) => ({ ...s, eirsaliyeSeri }))}
              />
            </div>
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
              <TanimGirdi
                etiket="MERSİS No"
                deger={subeForm.mersis}
                kural="mersis"
                onChange={(mersis) => setSubeForm((s) => ({ ...s, mersis }))}
              />
              <TanimGirdi
                etiket="Ticaret Sicil No"
                deger={subeForm.ticaretSicil}
                kural="ticaretSicil"
                onChange={(ticaretSicil) => setSubeForm((s) => ({ ...s, ticaretSicil }))}
              />
            </div>
          </>
        ),
      },
    ];
  }, [subeId, subeForm, firmalar, seciliFirmaId]);

  const depoAdimlari = useMemo((): TanimSihirbazAdim[] => {
    const merkezGuncelle = !!depoId;
    return [
      {
        baslik: 'Depo',
        aciklama: merkezGuncelle
          ? 'Merkez depo bilgileri ve adresi'
          : 'Depo kodu, adı ve adres bilgileri',
        icerik: (
          <>
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
              <TanimGirdi
                etiket="Depo Kodu"
                deger={depoForm.depoKodu}
                kural="kod"
                zorunlu
                onChange={(depoKodu) => setDepoForm((d) => ({ ...d, depoKodu }))}
              />
              <TanimGirdi
                etiket="Depo Adı"
                deger={depoForm.depoAdi}
                kural="ad"
                zorunlu
                onChange={(depoAdi) => setDepoForm((d) => ({ ...d, depoAdi }))}
              />
            </div>
            <OrtakAdresFormu
              bolumsuz
              deger={depoForm}
              onChange={(adres) => setDepoForm((d) => ({ ...d, ...adres }))}
            />
          </>
        ),
      },
    ];
  }, [depoId, depoForm]);

  const kasaAdimlari = useMemo(
    (): TanimSihirbazAdim[] => [
      {
        baslik: 'Kasa',
        aciklama: 'Kasa kodu, adı ve para birimi',
        icerik: (
          <>
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
              <TanimGirdi
                etiket="Kasa Kodu"
                deger={kasaForm.kasaKodu}
                kural="kod"
                zorunlu
                onChange={(kasaKodu) => setKasaForm((k) => ({ ...k, kasaKodu }))}
              />
              <TanimGirdi
                etiket="Kasa Adı"
                deger={kasaForm.kasaAdi}
                kural="ad"
                zorunlu
                onChange={(kasaAdi) => setKasaForm((k) => ({ ...k, kasaAdi }))}
              />
            </div>
            <label className="ap-tanimlar-secim-alan block">
              <span className="ap-tanim-girdi-etiket">Para Birimi *</span>
              <FormAcilirSecim
                value={kasaForm.paraBirimi}
                onChange={(paraBirimi) => setKasaForm((k) => ({ ...k, paraBirimi }))}
                secenekler={PARA_BIRIMLERI.map((pb) => ({ value: pb, label: pb }))}
              />
            </label>
          </>
        ),
      },
    ],
    [kasaForm]
  );

  const donemAdimlari = useMemo(
    (): TanimSihirbazAdim[] => [
      {
        baslik: 'Dönem',
        aciklama: 'Muhasebe dönem kodu ve adı',
        icerik: (
          <>
            <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
              <TanimGirdi
                etiket="Dönem Kodu"
                deger={donemForm.donemKodu}
                kural="kod"
                zorunlu
                onChange={(donemKodu) => setDonemForm((d) => ({ ...d, donemKodu }))}
              />
              <TanimGirdi
                etiket="Dönem Adı"
                deger={donemForm.donemAdi}
                kural="serbestMetin"
                maxLength={100}
                zorunlu
                onChange={(donemAdi) => setDonemForm((d) => ({ ...d, donemAdi }))}
              />
            </div>
          </>
        ),
      },
    ],
    [donemForm]
  );

  const kurulumAdimlari = useMemo(
    () => [
      ...firmaAdimlari,
      ...subeAdimlari,
      ...depoAdimlari,
      ...kasaAdimlari,
      ...donemAdimlari,
    ],
    [firmaAdimlari, subeAdimlari, depoAdimlari, kasaAdimlari, donemAdimlari]
  );

  const fazAdimDogrula = useCallback(
    (faz: KurulumFazId): string | null => {
      if (faz === 'firma') {
        if (!kodGecerliMi(firmaForm.firmaKodu)) return 'Firma kodu zorunludur';
        if (!adGecerliMi(firmaForm.firmaAdi, 255)) return 'Firma adı zorunludur';
        if (!vergiNoGecerliMi(firmaForm.vergiNo)) return 'Vergi no 10 haneli olmalıdır';
        return null;
      }

      if (faz === 'sube') {
        const merkezGuncelle = !!subeId;
        if (!merkezGuncelle && !seciliFirmaId) return 'Firma seçimi zorunludur';
        if (!kodGecerliMi(subeForm.subeKodu)) return 'Şube kodu zorunludur';
        if (!adGecerliMi(subeForm.subeAdi)) return 'Şube adı zorunludur';
        if (!postaKoduGecerliMi(subeForm.postaKodu)) return 'Posta kodu 5 haneli olmalıdır';
        if (!ebelgeSeriGecerliMi(subeForm.efaturaSeri)) return 'E-Fatura seri 3 karakter olmalıdır';
        if (!ebelgeSeriGecerliMi(subeForm.earsivSeri)) return 'E-Arşiv seri 3 karakter olmalıdır';
        if (!ebelgeSeriGecerliMi(subeForm.eirsaliyeSeri)) return 'E-İrsaliye seri 3 karakter olmalıdır';
        if (!mersisGecerliMi(subeForm.mersis)) return 'MERSİS numarası 16 haneli olmalıdır';
        return null;
      }

      if (faz === 'depo') {
        if (!kodGecerliMi(depoForm.depoKodu)) return 'Depo kodu zorunludur';
        if (!adGecerliMi(depoForm.depoAdi)) return 'Depo adı zorunludur';
        if (!postaKoduGecerliMi(depoForm.postaKodu)) return 'Posta kodu 5 haneli olmalıdır';
        return null;
      }

      if (faz === 'kasa') {
        if (!kasaForm.subeId) return 'Şube seçimi zorunludur';
        if (!kodGecerliMi(kasaForm.kasaKodu)) return 'Kasa kodu zorunludur';
        if (!adGecerliMi(kasaForm.kasaAdi)) return 'Kasa adı zorunludur';
        if (!kasaForm.paraBirimi.trim()) return 'Para birimi zorunludur';
        return null;
      }

      if (faz === 'donem') {
        if (!kodGecerliMi(donemForm.donemKodu)) return 'Dönem kodu zorunludur';
        if (!donemAdGecerliMi(donemForm.donemAdi)) return 'Dönem adı zorunludur';
        return null;
      }

      return null;
    },
    [subeId, seciliFirmaId, firmaForm, subeForm, depoForm, kasaForm, donemForm]
  );

  const adimDogrula = useCallback(
    (adim: number): string | null => fazAdimDogrula(globalAdimdenFaz(adim)),
    [fazAdimDogrula]
  );

  const fazKaydet = useCallback(
    async (hedefFaz: KurulumFazId): Promise<string | null> => {
      if (!eklemeVar) {
        hataBildir('Kurulum kaydetme yetkiniz yok');
        return 'Kurulum kaydetme yetkiniz yok';
      }
      const faz = hedefFaz;
      try {
        if (faz === 'firma') {
          const firma = await firmaOlustur(firmaForm);
          logMesajiAyarla(
            logMesaj.ekledi('Tanımlar — Kurulum', `«${firma.firmaAdi}» (${firma.firmaKodu}) firmasını`)
          );
          await merkezKayitlariniYukle(firma.id);
          setFirmalar((f) => [...f, firma]);
          setSeciliFirmaId(firma.id);
          basariBildir('Firma kaydedildi.');
          return null;
        }

        if (faz === 'sube') {
          if (subeId) {
            await subeGuncelle(subeId, subeForm);
            logMesajiAyarla(
              logMesaj.guncelledi(
                'Tanımlar — Kurulum',
                `«${subeForm.subeAdi}» (${subeForm.subeKodu}) şubesini`
              )
            );
            basariBildir('Şube kaydedildi.');
          }
          return null;
        }

        if (faz === 'depo') {
          if (depoId) {
            await depoGuncelle(depoId, depoForm);
            logMesajiAyarla(
              logMesaj.guncelledi(
                'Tanımlar — Kurulum',
                `«${depoForm.depoAdi}» (${depoForm.depoKodu}) deposunu`
              )
            );
            basariBildir('Depo kaydedildi.');
          }
          return null;
        }

        if (faz === 'kasa') {
          await kasaOlustur(kasaForm);
          logMesajiAyarla(
            logMesaj.ekledi(
              'Tanımlar — Kurulum',
              `«${kasaForm.kasaAdi}» (${kasaForm.kasaKodu}) kasasını`
            )
          );
          basariBildir('Kasa eklendi.');
          return null;
        }

        if (faz === 'donem') {
          await donemOlustur(donemForm);
          logMesajiAyarla(
            logMesaj.ekledi(
              'Tanımlar — Kurulum',
              `«${donemForm.donemAdi}» (${donemForm.donemKodu}) dönemini`
            )
          );
          basariBildir('Dönem eklendi.');
          return null;
        }

        return null;
      } catch (err) {
        return err instanceof Error ? err.message : 'Kayıt başarısız';
      }
    },
    [
      subeId,
      depoId,
      firmaForm,
      subeForm,
      depoForm,
      kasaForm,
      donemForm,
      merkezKayitlariniYukle,
      logMesajiAyarla,
      basariBildir,
      eklemeVar,
      hataBildir,
    ]
  );

  const adimIleri = useCallback(
    async (adim: number): Promise<string | null> => {
      if (TOPLU_KAYDET_ADIMLARI.has(adim)) {
        return fazKaydet(globalAdimdenFaz(adim));
      }
      return null;
    },
    [fazKaydet]
  );

  const tamamla = useCallback(async () => {
    const hata = adimDogrula(globalAdim);
    if (hata) {
      hataBildir(hata);
      return;
    }
    setKaydediliyor(true);
    try {
      const kayitHata = await fazKaydet(globalAdimdenFaz(globalAdim));
      if (kayitHata) {
        hataBildir(kayitHata);
        return;
      }
      basariBildir('Kurulum tamamlandı! Tüm tanımlar kaydedildi.');
      onTamamlandi();
    } finally {
      setKaydediliyor(false);
    }
  }, [globalAdim, adimDogrula, fazKaydet, basariBildir, hataBildir, onTamamlandi]);

  const adimDegistir = useCallback((adim: number) => {
    setGlobalAdim(adim);
  }, []);

  if (yukleniyor) return <TanimYukleniyor />;

  return (
    <TanimSihirbaz
      baslik="Kurulum Sihirbazı"
      ustGizle
      adimlar={kurulumAdimlari}
      aktifAdim={globalAdim}
      onAdimDegistir={adimDegistir}
      onIptal={onIptal}
      onTamamla={() => void tamamla()}
      adimDogrula={adimDogrula}
      onAdimIleri={adimIleri}
      onHata={hataBildir}
      tamamlaniyor={kaydediliyor}
      tamamlaMetin="Kaydet ve Bitir"
    />
  );
}
