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
  donemGuncelle,
  donemOlustur,
  firmaGuncelle,
  firmaOlustur,
  kasaGuncelle,
  kasaOlustur,
  subeGuncelle,
  subeOlustur,
} from '@/admin/baslat-menusu/tanimlar/api';
import { adresMetniniOku } from '@/admin/baslat-menusu/tanimlar/araclar/adresYardimci';
import { OrtakAdresFormu } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakAdresFormu';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { VergiDairesiSecici } from '@/admin/baslat-menusu/tanimlar/bilesenler/VergiDairesiSecici';
import {
  bosDepoForm,
  bosDonemForm,
  bosFirmaForm,
  bosKasaForm,
  bosSubeForm,
  type AdminDepo,
  type AdminDonem,
  type AdminFirma,
  type AdminKasa,
  type AdminSube,
  type DepoFormDegeri,
  type DonemFormDegeri,
  type FirmaFormDegeri,
  type KasaFormDegeri,
  type SubeFormDegeri,
  type TanimSekmeId,
} from '@/admin/baslat-menusu/tanimlar/tipler';
import {
  gecerliParaBirimi,
  paraBirimiFormSecenekleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/paraBirimleri';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalSolBaslik } from '@/admin/ortak/ModalSolBaslik';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import {
  sekmePortalHedefi,
  sekmePortaliGizliMi,
  useSekmeModalGovdeKilidi,
} from '@/araclar/sekmePortal';
import { useAdminLogMesaji, useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { createPortal } from 'react-dom';

export type TanimModalHedef =
  | { tip: 'firma'; mod: 'ekle' }
  | { tip: 'firma'; mod: 'duzenle'; kayit: AdminFirma }
  | { tip: 'sube'; mod: 'ekle'; firmaId: string }
  | { tip: 'sube'; mod: 'duzenle'; kayit: AdminSube }
  | { tip: 'depo'; mod: 'ekle'; firmaId: string; subeId?: string }
  | { tip: 'depo'; mod: 'duzenle'; kayit: AdminDepo }
  | { tip: 'kasa'; mod: 'ekle'; firmaId: string; subeId?: string }
  | { tip: 'kasa'; mod: 'duzenle'; kayit: AdminKasa }
  | { tip: 'donem'; mod: 'ekle'; firmaId: string }
  | { tip: 'donem'; mod: 'duzenle'; kayit: AdminDonem };

interface TanimKayitModalProps {
  hedef: TanimModalHedef | null;
  subeler: AdminSube[];
  /** Bağlam bandı için (opsiyonel) */
  firmalar?: AdminFirma[];
  onKapat: () => void;
  onKaydedildi: (tip: TanimSekmeId, firmaId?: string) => void;
}

const TIP_BASLIK: Record<TanimSekmeId, string> = {
  firma: 'Firma',
  sube: 'Şube',
  depo: 'Depo',
  kasa: 'Kasa',
  donem: 'Dönem',
};

const TIP_IKON: Record<TanimSekmeId, string> = {
  firma: '🏢',
  sube: '🏪',
  depo: '📦',
  kasa: '💰',
  donem: '📅',
};

function firmadanForm(f: AdminFirma): FirmaFormDegeri {
  return {
    firmaKodu: f.firmaKodu,
    firmaAdi: f.firmaAdi,
    vergiDairesi: f.vergiDairesi,
    vergiNo: f.vergiNo,
    aktif: f.aktif,
  };
}

function subedenForm(s: AdminSube): SubeFormDegeri {
  return {
    subeKodu: s.subeKodu,
    subeAdi: s.subeAdi,
    il: s.il,
    ilce: s.ilce,
    mahalle: s.mahalle,
    postaKodu: s.postaKodu,
    adres: adresMetniniOku(s),
    efaturaSeri: s.efaturaSeri,
    earsivSeri: s.earsivSeri,
    eirsaliyeSeri: s.eirsaliyeSeri,
    mersis: s.mersis,
    ticaretSicil: s.ticaretSicil,
    aktif: s.aktif,
  };
}

function depodanForm(d: AdminDepo): DepoFormDegeri {
  return {
    subeId: d.subeId,
    depoKodu: d.depoKodu,
    depoAdi: d.depoAdi,
    il: d.il,
    ilce: d.ilce,
    mahalle: d.mahalle ?? '',
    postaKodu: postaKoduGecerliMi(d.postaKodu ?? '') ? (d.postaKodu ?? '') : '',
    adres: adresMetniniOku(d),
    aktif: d.aktif,
  };
}

function kasadanForm(k: AdminKasa): KasaFormDegeri {
  const para = (k.paraBirimi ?? '').trim();
  return {
    subeId: k.subeId ?? '',
    kasaKodu: k.kasaKodu ?? '',
    kasaAdi: k.kasaAdi ?? '',
    paraBirimi: para || 'TL',
    aktif: k.aktif !== false,
  };
}

function donemdenForm(d: AdminDonem): DonemFormDegeri {
  return { donemKodu: d.donemKodu, donemAdi: d.donemAdi, aktif: d.aktif };
}

export function TanimKayitModal({
  hedef,
  subeler,
  firmalar = [],
  onKapat,
  onKaydedildi,
}: TanimKayitModalProps) {
  const logMesajiAyarla = useAdminLogMesaji();
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState('');

  const [firmaForm, setFirmaForm] = useState(bosFirmaForm);
  const [subeForm, setSubeForm] = useState(bosSubeForm);
  const [depoForm, setDepoForm] = useState(bosDepoForm);
  const [kasaForm, setKasaForm] = useState(bosKasaForm);
  const [donemForm, setDonemForm] = useState(bosDonemForm);

  useEffect(() => {
    if (!hedef) return;
    setHata('');
    setKaydediliyor(false);
    if (hedef.tip === 'firma') {
      setFirmaForm(hedef.mod === 'duzenle' ? firmadanForm(hedef.kayit) : bosFirmaForm);
    } else if (hedef.tip === 'sube') {
      setSubeForm(hedef.mod === 'duzenle' ? subedenForm(hedef.kayit) : bosSubeForm);
    } else if (hedef.tip === 'depo') {
      if (hedef.mod === 'duzenle') setDepoForm(depodanForm(hedef.kayit));
      else setDepoForm({ ...bosDepoForm, subeId: hedef.subeId ?? '' });
    } else if (hedef.tip === 'kasa') {
      if (hedef.mod === 'duzenle') setKasaForm(kasadanForm(hedef.kayit));
      else setKasaForm({ ...bosKasaForm, subeId: hedef.subeId ?? '' });
    } else if (hedef.tip === 'donem') {
      setDonemForm(hedef.mod === 'duzenle' ? donemdenForm(hedef.kayit) : bosDonemForm);
    }
  }, [hedef]);

  const firmaIdBaglam = useMemo(() => {
    if (!hedef) return '';
    if (hedef.tip === 'sube' && hedef.mod === 'ekle') return hedef.firmaId;
    if (hedef.tip === 'sube' && hedef.mod === 'duzenle') return hedef.kayit.firmaId;
    if (hedef.tip === 'depo' && hedef.mod === 'ekle') return hedef.firmaId;
    if (hedef.tip === 'kasa' && hedef.mod === 'ekle') return hedef.firmaId;
    if (hedef.tip === 'donem' && hedef.mod === 'ekle') return hedef.firmaId;
    if (hedef.tip === 'donem' && hedef.mod === 'duzenle') return hedef.kayit.firmaId;
    if (hedef.tip === 'depo' && hedef.mod === 'duzenle') {
      return subeler.find((s) => s.id === hedef.kayit.subeId)?.firmaId ?? '';
    }
    if (hedef.tip === 'kasa' && hedef.mod === 'duzenle') {
      return subeler.find((s) => s.id === hedef.kayit.subeId)?.firmaId ?? '';
    }
    return '';
  }, [hedef, subeler]);

  const firmaSubeleri = useMemo(() => {
    const seciliSubeId =
      hedef?.tip === 'depo'
        ? hedef.mod === 'duzenle'
          ? hedef.kayit.subeId
          : depoForm.subeId || hedef.subeId || ''
        : hedef?.tip === 'kasa'
          ? hedef.mod === 'duzenle'
            ? hedef.kayit.subeId
            : kasaForm.subeId || hedef.subeId || ''
          : '';
    return subeler.filter((s) => {
      if (s.firmaId !== firmaIdBaglam) return false;
      if (s.aktif !== false) return true;
      return s.id === seciliSubeId;
    });
  }, [subeler, firmaIdBaglam, hedef, depoForm.subeId, kasaForm.subeId]);

  const subeSecenekleri = useMemo(
    () =>
      firmaSubeleri.map((s) => ({
        value: s.id,
        label: `${s.subeKodu} — ${s.subeAdi}${s.aktif === false ? ' (Pasif)' : ''}`,
      })),
    [firmaSubeleri]
  );

  const baglamBandi = useMemo(() => {
    if (!hedef || hedef.tip === 'firma') return null;
    const firma = firmalar.find((f) => f.id === firmaIdBaglam);
    const firmaAd = firma ? `${firma.firmaAdi} (${firma.firmaKodu})` : 'Firma';
    if (hedef.tip === 'sube' || hedef.tip === 'donem') {
      return firmaAd;
    }
    const subeId =
      hedef.tip === 'depo'
        ? hedef.mod === 'duzenle'
          ? hedef.kayit.subeId
          : depoForm.subeId || hedef.subeId || ''
        : hedef.mod === 'duzenle'
          ? hedef.kayit.subeId
          : kasaForm.subeId || hedef.subeId || '';
    const sube = subeler.find((s) => s.id === subeId);
    if (sube) return `${firmaAd} → ${sube.subeKodu} — ${sube.subeAdi}`;
    return `${firmaAd} → Şube seçin`;
  }, [hedef, firmalar, firmaIdBaglam, subeler, depoForm.subeId, kasaForm.subeId]);

  const kaydet = useCallback(async () => {
    if (!hedef || kaydediliyor) return;
    setHata('');

    try {
      setKaydediliyor(true);

      if (hedef.tip === 'firma') {
        if (!kodGecerliMi(firmaForm.firmaKodu)) throw new Error('Firma kodu zorunludur (en fazla 20 harf/rakam)');
        if (!adGecerliMi(firmaForm.firmaAdi, 255)) throw new Error('Firma adı zorunludur (en fazla 255 karakter)');
        if (!vergiNoGecerliMi(firmaForm.vergiNo)) throw new Error('Vergi no 10 haneli olmalıdır (yalnızca rakam)');
        const hedefMetin = `«${firmaForm.firmaAdi.trim()}» (${firmaForm.firmaKodu.trim()}) firmasını`;
        if (hedef.mod === 'duzenle') {
          await firmaGuncelle(hedef.kayit.id, firmaForm);
          logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Firma', hedefMetin));
          basariBildir('Firma güncellendi.');
          onKaydedildi('firma', hedef.kayit.id);
        } else {
          const f = await firmaOlustur(firmaForm);
          logMesajiAyarla(logMesaj.ekledi('Tanımlar — Firma', hedefMetin));
          basariBildir('Firma eklendi. MERKEZ şube ve depo oluşturuldu.');
          onKaydedildi('firma', f.id);
        }
      } else if (hedef.tip === 'sube') {
        const firmaId = hedef.mod === 'ekle' ? hedef.firmaId : hedef.kayit.firmaId;
        if (!firmaId) throw new Error('Firma seçimi zorunludur');
        if (!kodGecerliMi(subeForm.subeKodu)) throw new Error('Şube kodu zorunludur (en fazla 20 harf/rakam)');
        if (!adGecerliMi(subeForm.subeAdi)) throw new Error('Şube adı zorunludur');
        if (!postaKoduGecerliMi(subeForm.postaKodu)) throw new Error('Posta kodu 5 haneli olmalıdır');
        if (!ebelgeSeriGecerliMi(subeForm.efaturaSeri)) throw new Error('e-Fatura seri 3 harf olmalıdır (A-Z)');
        if (!ebelgeSeriGecerliMi(subeForm.earsivSeri)) throw new Error('e-Arşiv seri 3 harf olmalıdır (A-Z)');
        if (!ebelgeSeriGecerliMi(subeForm.eirsaliyeSeri)) throw new Error('e-İrsaliye seri 3 harf olmalıdır (A-Z)');
        if (!mersisGecerliMi(subeForm.mersis)) throw new Error('MERSİS numarası 16 haneli rakam olmalıdır');
        const hedefMetin = `«${subeForm.subeAdi.trim()}» (${subeForm.subeKodu.trim()}) şubesini`;
        if (hedef.mod === 'duzenle') {
          await subeGuncelle(hedef.kayit.id, subeForm);
          logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Şube', hedefMetin));
          basariBildir('Şube güncellendi.');
        } else {
          await subeOlustur(subeForm, firmaId);
          logMesajiAyarla(logMesaj.ekledi('Tanımlar — Şube', hedefMetin));
          basariBildir('Şube eklendi.');
        }
        onKaydedildi('sube', firmaId);
      } else if (hedef.tip === 'depo') {
        if (!depoForm.subeId) throw new Error('Şube seçimi zorunludur');
        if (!kodGecerliMi(depoForm.depoKodu)) throw new Error('Depo kodu zorunludur (en fazla 20 harf/rakam)');
        if (!adGecerliMi(depoForm.depoAdi)) throw new Error('Depo adı zorunludur');
        const hedefMetin = `«${depoForm.depoAdi.trim()}» (${depoForm.depoKodu.trim()}) deposunu`;
        if (hedef.mod === 'duzenle') {
          await depoGuncelle(hedef.kayit.id, depoForm);
          logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Depo', hedefMetin));
          basariBildir('Depo güncellendi.');
        } else {
          await depoOlustur(depoForm);
          logMesajiAyarla(logMesaj.ekledi('Tanımlar — Depo', hedefMetin));
          basariBildir('Depo eklendi.');
        }
        onKaydedildi('depo', firmaIdBaglam);
      } else if (hedef.tip === 'kasa') {
        if (!kasaForm.subeId) throw new Error('Şube seçimi zorunludur');
        if (!kodGecerliMi(kasaForm.kasaKodu)) throw new Error('Kasa kodu zorunludur (en fazla 20 harf/rakam)');
        if (!adGecerliMi(kasaForm.kasaAdi)) throw new Error('Kasa adı zorunludur');
        if (!kasaForm.paraBirimi.trim()) throw new Error('Para birimi zorunludur');
        const hedefMetin = `«${kasaForm.kasaAdi.trim()}» (${kasaForm.kasaKodu.trim()}) kasasını`;
        if (hedef.mod === 'duzenle') {
          await kasaGuncelle(hedef.kayit.id, kasaForm);
          logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Kasa', hedefMetin));
          basariBildir('Kasa güncellendi.');
        } else {
          await kasaOlustur(kasaForm);
          logMesajiAyarla(logMesaj.ekledi('Tanımlar — Kasa', hedefMetin));
          basariBildir('Kasa eklendi.');
        }
        onKaydedildi('kasa', firmaIdBaglam);
      } else if (hedef.tip === 'donem') {
        const firmaId = hedef.mod === 'ekle' ? hedef.firmaId : hedef.kayit.firmaId;
        if (!firmaId) throw new Error('Firma seçimi zorunludur');
        if (!kodGecerliMi(donemForm.donemKodu)) throw new Error('Dönem kodu zorunludur (en fazla 20 harf/rakam)');
        if (!donemAdGecerliMi(donemForm.donemAdi)) throw new Error('Dönem adı zorunludur (en fazla 100 karakter)');
        const hedefMetin = `«${donemForm.donemAdi.trim()}» (${donemForm.donemKodu.trim()}) dönemini`;
        if (hedef.mod === 'duzenle') {
          await donemGuncelle(hedef.kayit.id, donemForm);
          logMesajiAyarla(logMesaj.guncelledi('Tanımlar — Dönem', hedefMetin));
          basariBildir('Dönem güncellendi.');
        } else {
          await donemOlustur(donemForm, firmaId);
          logMesajiAyarla(logMesaj.ekledi('Tanımlar — Dönem', hedefMetin));
          basariBildir('Dönem eklendi.');
        }
        onKaydedildi('donem', firmaId);
      }

      onKapat();
    } catch (err) {
      const mesaj = err instanceof Error ? err.message : 'Kayıt başarısız';
      setHata(mesaj);
      hataBildir(mesaj);
    } finally {
      setKaydediliyor(false);
    }
  }, [
    hedef,
    kaydediliyor,
    firmaForm,
    subeForm,
    depoForm,
    kasaForm,
    donemForm,
    firmaIdBaglam,
    logMesajiAyarla,
    basariBildir,
    hataBildir,
    onKaydedildi,
    onKapat,
  ]);

  const sekme = useAdminSekmeKabuk();
  const acik = Boolean(hedef);
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );

  useSekmeModalGovdeKilidi(acik, portalKok);

  const kapat = useCallback(() => {
    if (!kaydediliyor) onKapat();
  }, [kaydediliyor, onKapat]);

  useEffect(() => {
    if (!hedef || !portalKok) return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        kapat();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const el = e.target as HTMLElement | null;
        if (el?.tagName === 'TEXTAREA') return;
        if (el?.closest('.ap-form-acilir-secim, .ap-form-arama-secim')) return;
        e.preventDefault();
        void kaydet();
      }
    }
    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [hedef, portalKok, kapat, kaydet]);

  useModulAksiyonlari({}, { kaydet: acik ? false : undefined }, false);

  if (!hedef || !portalKok) return null;

  const tip = hedef.tip;
  const ekleMi = hedef.mod === 'ekle';
  const baslik = ekleMi ? `Yeni ${TIP_BASLIK[tip]}` : `${TIP_BASLIK[tip]} Düzenle`;
  const genis = tip === 'sube' || tip === 'depo';

  return createPortal(
    <div
      className="ap-sil-onay-modal ap-tanimlar-kayit-modal"
      role="dialog"
      aria-modal="true"
      aria-label={baslik}
    >
      <div className="ap-sil-onay-arka" aria-hidden="true" onClick={kapat} />
      <DonenAccentCerceve
        className={`ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--tanim-kayit${genis ? ' ap-accent-donen-cerceve--tanim-kayit-genis' : ''}`}
      >
        <div className="ap-sil-onay-kart ap-tanimlar-kayit-kart ap-sil-onay-kart--sol-baslik">
          <ModalSolBaslik baslik={baslik} ikon={TIP_IKON[tip]} onKapat={kapat} />

          <div className="ap-tanimlar-modal-govde ap-tanimlar-modal-govde--tek">
            {baglamBandi ? (
              <div className="ap-tanimlar-modal-baglam" role="status">
                <span className="ap-tanimlar-modal-baglam-etiket">Bağlam</span>
                <span className="ap-tanimlar-modal-baglam-metin">{baglamBandi}</span>
              </div>
            ) : null}

            {tip === 'firma' && (
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
              </div>
            )}

            {tip === 'sube' && (
              <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
                <TanimGirdi
                  etiket="Şube Kodu"
                  deger={subeForm.subeKodu}
                  kural="kod"
                  zorunlu
                  onChange={(subeKodu) => setSubeForm((f) => ({ ...f, subeKodu }))}
                />
                <TanimGirdi
                  etiket="Şube Adı"
                  deger={subeForm.subeAdi}
                  kural="serbestMetin"
                  zorunlu
                  onChange={(subeAdi) => setSubeForm((f) => ({ ...f, subeAdi }))}
                />
                <div className="ap-tanimlar-modal-adres">
                  <OrtakAdresFormu
                    bolumsuz
                    deger={subeForm}
                    onChange={(adres) => setSubeForm((f) => ({ ...f, ...adres }))}
                  />
                </div>
                <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--3 ap-tanimlar-modal-ebelge-satir">
                  <TanimGirdi
                    etiket="e-Fatura Seri"
                    deger={subeForm.efaturaSeri}
                    kural="ebelgeSeri"
                    onChange={(efaturaSeri) => setSubeForm((f) => ({ ...f, efaturaSeri }))}
                  />
                  <TanimGirdi
                    etiket="e-Arşiv Seri"
                    deger={subeForm.earsivSeri}
                    kural="ebelgeSeri"
                    onChange={(earsivSeri) => setSubeForm((f) => ({ ...f, earsivSeri }))}
                  />
                  <TanimGirdi
                    etiket="e-İrsaliye Seri"
                    deger={subeForm.eirsaliyeSeri}
                    kural="ebelgeSeri"
                    onChange={(eirsaliyeSeri) => setSubeForm((f) => ({ ...f, eirsaliyeSeri }))}
                  />
                </div>
                <TanimGirdi
                  etiket="MERSİS"
                  deger={subeForm.mersis}
                  kural="mersis"
                  onChange={(mersis) => setSubeForm((f) => ({ ...f, mersis }))}
                />
                <TanimGirdi
                  etiket="Ticaret Sicil"
                  deger={subeForm.ticaretSicil}
                  kural="serbestMetin"
                  onChange={(ticaretSicil) => setSubeForm((f) => ({ ...f, ticaretSicil }))}
                />
              </div>
            )}

            {tip === 'depo' && (
              <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
                <label className="ap-tanimlar-secim-alan block ap-tanimlar-modal-adres">
                  <span className="ap-tanim-girdi-etiket">
                    Şube <span className="ap-tanim-girdi-zorunlu">*</span>
                  </span>
                  <FormAcilirSecim
                    value={depoForm.subeId}
                    onChange={(subeId) => setDepoForm((f) => ({ ...f, subeId }))}
                    secenekler={subeSecenekleri}
                    aria-label="Şube"
                  />
                </label>
                <TanimGirdi
                  etiket="Depo Kodu"
                  deger={depoForm.depoKodu}
                  kural="kod"
                  zorunlu
                  onChange={(depoKodu) => setDepoForm((f) => ({ ...f, depoKodu }))}
                />
                <TanimGirdi
                  etiket="Depo Adı"
                  deger={depoForm.depoAdi}
                  kural="serbestMetin"
                  zorunlu
                  onChange={(depoAdi) => setDepoForm((f) => ({ ...f, depoAdi }))}
                />
                <div className="ap-tanimlar-modal-adres">
                  <OrtakAdresFormu
                    bolumsuz
                    deger={depoForm}
                    onChange={(adres) => setDepoForm((f) => ({ ...f, ...adres }))}
                  />
                </div>
              </div>
            )}

            {tip === 'kasa' && (
              <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
                <label className="ap-tanimlar-secim-alan block">
                  <span className="ap-tanim-girdi-etiket">
                    Şube <span className="ap-tanim-girdi-zorunlu">*</span>
                  </span>
                  <FormAcilirSecim
                    value={kasaForm.subeId}
                    onChange={(subeId) => setKasaForm((f) => ({ ...f, subeId }))}
                    secenekler={subeSecenekleri}
                    aria-label="Şube"
                  />
                </label>
                <TanimGirdi
                  etiket="Kasa Kodu"
                  deger={kasaForm.kasaKodu}
                  kural="kod"
                  zorunlu
                  onChange={(kasaKodu) => setKasaForm((f) => ({ ...f, kasaKodu }))}
                />
                <TanimGirdi
                  etiket="Kasa Adı"
                  deger={kasaForm.kasaAdi}
                  kural="serbestMetin"
                  zorunlu
                  onChange={(kasaAdi) => setKasaForm((f) => ({ ...f, kasaAdi }))}
                />
                <label className="ap-tanimlar-secim-alan block">
                  <span className="ap-tanim-girdi-etiket">
                    Para Birimi <span className="ap-tanim-girdi-zorunlu">*</span>
                  </span>
                  <FormAcilirSecim
                    value={gecerliParaBirimi(kasaForm.paraBirimi)}
                    onChange={(paraBirimi) => setKasaForm((f) => ({ ...f, paraBirimi }))}
                    secenekler={paraBirimiFormSecenekleri()}
                    aria-label="Para birimi"
                  />
                </label>
              </div>
            )}

            {tip === 'donem' && (
              <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
                <TanimGirdi
                  etiket="Dönem Kodu"
                  deger={donemForm.donemKodu}
                  kural="kod"
                  zorunlu
                  onChange={(donemKodu) => setDonemForm((f) => ({ ...f, donemKodu }))}
                />
                <TanimGirdi
                  etiket="Dönem Adı"
                  deger={donemForm.donemAdi}
                  kural="serbestMetin"
                  maxLength={100}
                  zorunlu
                  onChange={(donemAdi) => setDonemForm((f) => ({ ...f, donemAdi }))}
                />
              </div>
            )}

            {hata ? <p className="ap-tanimlar-modal-hata">{hata}</p> : null}
          </div>

          <div className="ap-tanimlar-modal-footer">
            <button
              type="button"
              className="ap-tanimlar-modal-iptal"
              onClick={kapat}
              disabled={kaydediliyor}
            >
              <span className="ap-tanimlar-modal-tus-metin">İptal</span>
              <span className="ap-tanimlar-modal-kisayol">(ESC)</span>
            </button>
            <button
              type="button"
              className="ap-tanimlar-modal-kaydet"
              onClick={() => void kaydet()}
              disabled={kaydediliyor}
            >
              <span className="ap-tanimlar-modal-tus-metin">
                {kaydediliyor ? 'Kaydediliyor…' : 'Kaydet'}
              </span>
              <span className="ap-tanimlar-modal-kisayol">(ENTER)</span>
            </button>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
