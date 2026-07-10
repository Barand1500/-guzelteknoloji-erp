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
  depoOlustur,
  depolariGetir,
  donemOlustur,
  firmaOlustur,
  firmalariGetir,
  kasaOlustur,
  subeGuncelle,
  subeOlustur,
  subeleriGetir,
} from '@/admin/baslat-menusu/tanimlar/api';
import { OrtakAdresFormu } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakAdresFormu';
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import {
  TanimSihirbaz,
  type TanimSihirbazAdim,
  type TanimSihirbazFaz,
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
  type AdminSube,
  type DepoFormDegeri,
  type DonemFormDegeri,
  type FirmaFormDegeri,
  type KasaFormDegeri,
  type SubeFormDegeri,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import { TanimFirmaSecici } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFirmaSecici';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminLogMesaji } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';

type KurulumFazId = 'firma' | 'sube' | 'depo' | 'kasa' | 'donem';

const FAZLAR: TanimSihirbazFaz[] = [
  { id: 'toplu', ad: 'Toplu Kurulum', ikon: '✨' },
  { id: 'firma', ad: 'Firma', ikon: '🏢' },
  { id: 'sube', ad: 'Şube', ikon: '🏪' },
  { id: 'depo', ad: 'Depo', ikon: '📦' },
  { id: 'kasa', ad: 'Kasa', ikon: '💰' },
  { id: 'donem', ad: 'Dönem', ikon: '📅' },
];

/** Toplu akışta kayıt yapılan global adımlar (0 tabanlı) */
const TOPLU_KAYDET_ADIMLARI = new Set([1, 5, 7, 8]);

function globalAdimdenFaz(adim: number): KurulumFazId {
  if (adim <= 1) return 'firma';
  if (adim <= 5) return 'sube';
  if (adim <= 7) return 'depo';
  if (adim === 8) return 'kasa';
  return 'donem';
}

function globalAdimdenFazIci(adim: number): number {
  if (adim <= 1) return adim;
  if (adim <= 5) return adim - 2;
  if (adim <= 7) return adim - 6;
  if (adim === 8) return 0;
  return 0;
}

function topluFormlariSifirla() {
  return {
    firma: bosFirmaForm,
    sube: bosSubeForm,
    depo: bosDepoForm,
    kasa: { ...bosKasaForm, kasaKodu: 'KASA01', kasaAdi: 'Merkez Kasa' },
    donem: bosDonemForm,
  };
}


interface KurulumSihirbaziProps {
  onTamamlandi: () => void;
  onIptal: () => void;
}

export function KurulumSihirbazi({ onTamamlandi, onIptal }: KurulumSihirbaziProps) {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();

  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [aktifFazId, setAktifFazId] = useState<KurulumFazId>('firma');
  const [fazIciAdim, setFazIciAdim] = useState(0);
  const [globalAdim, setGlobalAdim] = useState(0);
  /** Sekme seçilmediyse toplu kurulum; bir faz sekmesine tıklanınca false */
  const [tamAkis, setTamAkis] = useState(true);

  const [firmalar, setFirmalar] = useState<AdminFirma[]>([]);
  const [subeler, setSubeler] = useState<AdminSube[]>([]);
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
        setSubeler(subeListesi);
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
      cadde: merkez.cadde,
      sokak: merkez.sokak,
      bina: merkez.bina,
      no: merkez.no,
      postaKodu: merkez.postaKodu,
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
      cadde: merkezDepo.cadde,
      sokak: merkezDepo.sokak,
      bina: merkezDepo.bina,
      no: merkezDepo.no,
      postaKodu: merkezDepo.postaKodu,
      aktif: merkezDepo.aktif,
    });

    setKasaForm((k) => ({ ...k, subeId: merkez.id }));
    setSubeler(subeListesi);
  }, []);

  const topluModaDon = useCallback(() => {
    const sifir = topluFormlariSifirla();
    setTamAkis(true);
    setGlobalAdim(0);
    setAktifFazId('firma');
    setFazIciAdim(0);
    setSubeId(null);
    setDepoId(null);
    setFirmaForm(sifir.firma);
    setSubeForm(sifir.sube);
    setDepoForm({ ...sifir.depo, subeId: subeler[0]?.id ?? '' });
    setKasaForm({ ...sifir.kasa, subeId: subeler[0]?.id ?? '' });
    setDonemForm(sifir.donem);
  }, [subeler]);

  const fazSecildi = useCallback(
    (faz: TanimSihirbazFaz) => {
      if (faz.id === 'toplu') {
        topluModaDon();
        return;
      }

      const id = faz.id as KurulumFazId;
      setAktifFazId(id);
      setFazIciAdim(0);
      setTamAkis(false);

      if (id === 'firma') {
        setFirmaForm(bosFirmaForm);
      }
      if (id === 'sube') {
        setSubeId(null);
        setSubeForm(bosSubeForm);
      }
      if (id === 'depo') {
        setDepoId(null);
        setDepoForm({ ...bosDepoForm, subeId: subeler[0]?.id ?? '' });
      }
      if (id === 'kasa') {
        setKasaForm({
          ...bosKasaForm,
          kasaKodu: 'KASA01',
          kasaAdi: '',
          subeId: subeler[0]?.id ?? '',
        });
      }
      if (id === 'donem') {
        setDonemForm(bosDonemForm);
      }
    },
    [subeler, topluModaDon]
  );

  const firmaSecici = (saltOkunur = false) => (
    <TanimFirmaSecici
      firmalar={firmalar}
      value={seciliFirmaId}
      onChange={saltOkunur ? undefined : setSeciliFirmaId}
      saltOkunur={saltOkunur}
    />
  );

  const subeSecici = (deger: string, onChange: (id: string) => void) => (
    <label className="ap-tanimlar-secim-alan block">
      <span className="ap-tanim-girdi-etiket">Şube *</span>
      <FormAcilirSecim
        value={deger}
        onChange={onChange}
        secenekler={subeler.map((s) => ({
          value: s.id,
          label: `${s.subeKodu} — ${s.subeAdi}`,
        }))}
      />
    </label>
  );

  const firmaAdimlari = useMemo(
    (): TanimSihirbazAdim[] => [
      {
        baslik: 'Firma — Temel Bilgiler',
        aciklama: 'Firma kodu ve unvanını girin',
        icerik: (
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
        ),
      },
      {
        baslik: 'Firma — Vergi Bilgileri',
        aciklama: 'Vergi dairesi, numarası ve durum',
        icerik: (
          <>
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
            <OrtakDurumAlani
              aktif={firmaForm.aktif}
              onChange={(aktif) => setFirmaForm((f) => ({ ...f, aktif }))}
            />
          </>
        ),
      },
    ],
    [firmaForm]
  );

  const subeAdimlari = useMemo((): TanimSihirbazAdim[] => {
    const merkezGuncelle = tamAkis && !!subeId;
    return [
      {
        baslik: 'Şube — Temel Bilgiler',
        aciklama: merkezGuncelle
          ? 'Bağlı firma ve merkez şube bilgileri'
          : 'Hangi firmaya ekleneceğini seçin, şube kodu ve adını girin',
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
            <OrtakDurumAlani
              aktif={subeForm.aktif}
              onChange={(aktif) => setSubeForm((s) => ({ ...s, aktif }))}
            />
          </>
        ),
      },
      {
        baslik: 'Şube — Adres',
        aciklama: 'Şube adres bilgilerini girin',
        icerik: (
          <OrtakAdresFormu
            bolumsuz
            deger={subeForm}
            onChange={(adres) => setSubeForm((s) => ({ ...s, ...adres }))}
          />
        ),
      },
      {
        baslik: 'Şube — E-Belge Serileri',
        aciklama: 'E-Fatura, E-Arşiv ve E-İrsaliye seri kodları',
        icerik: (
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
        ),
      },
      {
        baslik: 'Şube — Ticari Bilgiler',
        aciklama: 'MERSİS ve ticaret sicil numaraları',
        icerik: (
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
        ),
      },
    ];
  }, [tamAkis, subeId, subeForm, firmalar, seciliFirmaId]);

  const depoAdimlari = useMemo((): TanimSihirbazAdim[] => {
    const bagimsiz = !tamAkis || !depoId;
    return [
      {
        baslik: 'Depo — Temel Bilgiler',
        aciklama: bagimsiz ? 'Şubeyi seçin, depo kodu ve adını girin' : 'Merkez depo kodu, adı ve durum',
        icerik: (
          <>
            {bagimsiz
              ? subeSecici(depoForm.subeId, (subeId) => setDepoForm((d) => ({ ...d, subeId })))
              : null}
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
            <OrtakDurumAlani
              aktif={depoForm.aktif}
              onChange={(aktif) => setDepoForm((d) => ({ ...d, aktif }))}
            />
          </>
        ),
      },
      {
        baslik: 'Depo — Adres',
        aciklama: 'Depo adres bilgilerini girin',
        icerik: (
          <OrtakAdresFormu
            bolumsuz
            deger={depoForm}
            onChange={(adres) => setDepoForm((d) => ({ ...d, ...adres }))}
          />
        ),
      },
    ];
  }, [tamAkis, depoId, depoForm, subeler]);

  const kasaAdimlari = useMemo(
    (): TanimSihirbazAdim[] => [
      {
        baslik: 'Kasa — Bilgiler',
        aciklama:
          tamAkis && kasaForm.subeId
            ? 'Kasa bilgilerini ve durumu girin'
            : 'Şubeyi seçin, kasa bilgilerini ve durumu girin',
        icerik: (
          <>
            {!(tamAkis && kasaForm.subeId)
              ? subeSecici(kasaForm.subeId, (subeId) => setKasaForm((k) => ({ ...k, subeId })))
              : null}
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
            <OrtakDurumAlani
              aktif={kasaForm.aktif}
              onChange={(aktif) => setKasaForm((k) => ({ ...k, aktif }))}
            />
          </>
        ),
      },
    ],
    [kasaForm, subeler, tamAkis]
  );

  const donemAdimlari = useMemo(
    (): TanimSihirbazAdim[] => [
      {
        baslik: 'Dönem — Bilgiler',
        aciklama: 'Muhasebe dönem kodu, adı ve durum',
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
            <OrtakDurumAlani
              aktif={donemForm.aktif}
              onChange={(aktif) => setDonemForm((d) => ({ ...d, aktif }))}
            />
          </>
        ),
      },
    ],
    [donemForm]
  );

  const topluAdimlar = useMemo(
    () => [
      ...firmaAdimlari,
      ...subeAdimlari,
      ...depoAdimlari,
      ...kasaAdimlari,
      ...donemAdimlari,
    ],
    [firmaAdimlari, subeAdimlari, depoAdimlari, kasaAdimlari, donemAdimlari]
  );

  const tekliAdimlar = useMemo(() => {
    switch (aktifFazId) {
      case 'firma':
        return firmaAdimlari;
      case 'sube':
        return subeAdimlari;
      case 'depo':
        return depoAdimlari;
      case 'kasa':
        return kasaAdimlari;
      case 'donem':
        return donemAdimlari;
      default:
        return firmaAdimlari;
    }
  }, [aktifFazId, firmaAdimlari, subeAdimlari, depoAdimlari, kasaAdimlari, donemAdimlari]);

  const gorunurAdimlar = tamAkis ? topluAdimlar : tekliAdimlar;
  const aktifAdim = tamAkis ? globalAdim : fazIciAdim;
  const gorunurFazId = tamAkis ? 'toplu' : aktifFazId;

  const fazAdimDogrula = useCallback(
    (faz: KurulumFazId, adim: number): string | null => {
      if (faz === 'firma') {
        if (adim === 0) {
          if (!kodGecerliMi(firmaForm.firmaKodu)) return 'Firma kodu zorunludur';
          if (!adGecerliMi(firmaForm.firmaAdi, 255)) return 'Firma adı zorunludur';
        }
        if (adim === 1 && !vergiNoGecerliMi(firmaForm.vergiNo)) {
          return 'Vergi no 10 haneli olmalıdır';
        }
        return null;
      }

      if (faz === 'sube') {
        const merkezGuncelle = tamAkis && !!subeId;
        if (adim === 0) {
          if (!merkezGuncelle && !seciliFirmaId) return 'Firma seçimi zorunludur';
          if (!kodGecerliMi(subeForm.subeKodu)) return 'Şube kodu zorunludur';
          if (!adGecerliMi(subeForm.subeAdi)) return 'Şube adı zorunludur';
        }
        if (adim === 1 && !postaKoduGecerliMi(subeForm.postaKodu)) {
          return 'Posta kodu 5 haneli olmalıdır';
        }
        if (adim === 2) {
          if (!ebelgeSeriGecerliMi(subeForm.efaturaSeri)) return 'E-Fatura seri 3 karakter olmalıdır';
          if (!ebelgeSeriGecerliMi(subeForm.earsivSeri)) return 'E-Arşiv seri 3 karakter olmalıdır';
          if (!ebelgeSeriGecerliMi(subeForm.eirsaliyeSeri)) return 'E-İrsaliye seri 3 karakter olmalıdır';
        }
        if (adim === 3 && !mersisGecerliMi(subeForm.mersis)) {
          return 'MERSİS numarası 16 haneli olmalıdır';
        }
        return null;
      }

      if (faz === 'depo') {
        const bagimsiz = !tamAkis || !depoId;
        if (adim === 0) {
          if (bagimsiz && !depoForm.subeId) return 'Şube seçimi zorunludur';
          if (!kodGecerliMi(depoForm.depoKodu)) return 'Depo kodu zorunludur';
          if (!adGecerliMi(depoForm.depoAdi)) return 'Depo adı zorunludur';
        }
        if (adim === 1 && !postaKoduGecerliMi(depoForm.postaKodu)) {
          return 'Posta kodu 5 haneli olmalıdır';
        }
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
    [
      tamAkis,
      subeId,
      depoId,
      seciliFirmaId,
      firmaForm,
      subeForm,
      depoForm,
      kasaForm,
      donemForm,
    ]
  );

  const adimDogrula = useCallback(
    (adim: number): string | null => {
      if (tamAkis) {
        const faz = globalAdimdenFaz(adim);
        return fazAdimDogrula(faz, globalAdimdenFazIci(adim));
      }
      return fazAdimDogrula(aktifFazId, adim);
    },
    [tamAkis, aktifFazId, fazAdimDogrula]
  );

  const fazKaydet = useCallback(
    async (hedefFaz?: KurulumFazId): Promise<string | null> => {
      const faz = hedefFaz ?? aktifFazId;
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
          const bagimsiz = !tamAkis || !subeId;
          if (bagimsiz) {
            if (!seciliFirmaId) return 'Firma seçimi zorunludur';
            await subeOlustur(subeForm, seciliFirmaId);
            logMesajiAyarla(
              logMesaj.ekledi(
                'Tanımlar — Kurulum',
                `«${subeForm.subeAdi}» (${subeForm.subeKodu}) şubesini`
              )
            );
            basariBildir('Şube eklendi.');
          } else if (subeId) {
            await subeGuncelle(subeId, subeForm);
            logMesajiAyarla(
              logMesaj.guncelledi(
                'Tanımlar — Kurulum',
                `«${subeForm.subeAdi}» (${subeForm.subeKodu}) şubesini`
              )
            );
            basariBildir('Şube kaydedildi.');
          }
          setSubeler(await subeleriGetir());
          return null;
        }

        if (faz === 'depo') {
          const bagimsiz = !tamAkis || !depoId;
          if (bagimsiz) {
            await depoOlustur(depoForm);
            logMesajiAyarla(
              logMesaj.ekledi(
                'Tanımlar — Kurulum',
                `«${depoForm.depoAdi}» (${depoForm.depoKodu}) deposunu`
              )
            );
            basariBildir('Depo eklendi.');
          } else if (depoId) {
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
      aktifFazId,
      tamAkis,
      subeId,
      depoId,
      seciliFirmaId,
      firmaForm,
      subeForm,
      depoForm,
      kasaForm,
      donemForm,
      merkezKayitlariniYukle,
      logMesajiAyarla,
      basariBildir,
    ]
  );

  const adimIleri = useCallback(
    async (adim: number): Promise<string | null> => {
      if (tamAkis && TOPLU_KAYDET_ADIMLARI.has(adim)) {
        return fazKaydet(globalAdimdenFaz(adim));
      }
      return null;
    },
    [tamAkis, fazKaydet]
  );

  const tamamla = useCallback(async () => {
    const hata = adimDogrula(aktifAdim);
    if (hata) {
      hataBildir(hata);
      return;
    }
    setKaydediliyor(true);
    try {
      const hedefFaz = tamAkis ? globalAdimdenFaz(aktifAdim) : aktifFazId;
      const kayitHata = await fazKaydet(hedefFaz);
      if (kayitHata) {
        hataBildir(kayitHata);
        return;
      }
      if (tamAkis) {
        basariBildir('Kurulum tamamlandı! Tüm tanımlar kaydedildi.');
      }
      onTamamlandi();
    } finally {
      setKaydediliyor(false);
    }
  }, [aktifAdim, adimDogrula, fazKaydet, tamAkis, basariBildir, hataBildir, onTamamlandi]);

  const adimDegistir = useCallback(
    (adim: number) => {
      if (tamAkis) setGlobalAdim(adim);
      else setFazIciAdim(adim);
    },
    [tamAkis]
  );

  if (yukleniyor) return <TanimYukleniyor />;

  return (
    <TanimSihirbaz
      baslik="Kurulum Sihirbazı"
      adimlar={gorunurAdimlar}
      aktifAdim={aktifAdim}
      onAdimDegistir={adimDegistir}
      onIptal={onIptal}
      onTamamla={() => void tamamla()}
      adimDogrula={adimDogrula}
      onAdimIleri={adimIleri}
      onHata={hataBildir}
      tamamlaniyor={kaydediliyor}
      fazlar={FAZLAR}
      aktifFazId={gorunurFazId}
      onFazSecildi={fazSecildi}
      iptalMetin="← Kayıtlara dön"
      tamamlaMetin={tamAkis ? 'Kaydet ve Bitir' : 'Kaydet'}
    />
  );
}
