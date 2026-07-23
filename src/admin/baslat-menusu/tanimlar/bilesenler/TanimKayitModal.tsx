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
import { OrtakDurumAlani } from '@/admin/baslat-menusu/tanimlar/bilesenler/OrtakDurumAlani';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { VergiDairesiSecici } from '@/admin/baslat-menusu/tanimlar/bilesenler/VergiDairesiSecici';
import {
  bosDepoForm,
  bosDonemForm,
  bosFirmaForm,
  bosKasaForm,
  bosSubeForm,
  PARA_BIRIMLERI,
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
import { SistemModal } from '@/admin/ortak/SistemModal';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { logMesaj } from '@/admin/ortak/logMesajiYardimci';
import { useAdminLogMesaji, useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

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
        if (!ebelgeSeriGecerliMi(subeForm.efaturaSeri)) throw new Error('e-Fatura seri 3 karakter olmalıdır');
        if (!ebelgeSeriGecerliMi(subeForm.earsivSeri)) throw new Error('e-Arşiv seri 3 karakter olmalıdır');
        if (!ebelgeSeriGecerliMi(subeForm.eirsaliyeSeri)) throw new Error('e-İrsaliye seri 3 karakter olmalıdır');
        if (!mersisGecerliMi(subeForm.mersis)) throw new Error('MERSİS numarası 16 haneli olmalıdır');
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

  useEffect(() => {
    if (!hedef) return;
    function tusHandler(e: KeyboardEvent) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        void kaydet();
      }
    }
    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [hedef, kaydet]);

  useModulAksiyonlari(
    {
      kaydet: hedef ? () => void kaydet() : undefined,
    },
    {
      kaydet: Boolean(hedef) && !kaydediliyor,
    },
    Boolean(hedef)
  );

  if (!hedef) return null;

  const tip = hedef.tip;
  const ekleMi = hedef.mod === 'ekle';
  const baslik = ekleMi ? `Yeni ${TIP_BASLIK[tip]}` : `${TIP_BASLIK[tip]} Düzenle`;

  return (
    <SistemModal
      acik
      onKapat={onKapat}
      baslik={baslik}
      altBaslik="Ctrl+Enter ile kaydet · Esc ile kapat"
      ikon={TIP_IKON[tip]}
      genislik={tip === 'sube' || tip === 'depo' ? 'lg' : 'md'}
      kapatmaDevreDisi={kaydediliyor}
      ustCizgi={false}
      footer={
        <div className="ap-tanimlar-modal-footer">
          <button
            type="button"
            className="ap-tanimlar-modal-iptal"
            onClick={onKapat}
            disabled={kaydediliyor}
          >
            İptal
          </button>
          <button
            type="button"
            className="ap-tanimlar-modal-kaydet"
            onClick={() => void kaydet()}
            disabled={kaydediliyor}
          >
            {kaydediliyor ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      }
    >
      <div className="ap-tanimlar-modal-govde">
        {baglamBandi ? (
          <div className="ap-tanimlar-modal-baglam" role="status">
            <span className="ap-tanimlar-modal-baglam-etiket">Bağlam</span>
            <span className="ap-tanimlar-modal-baglam-metin">{baglamBandi}</span>
          </div>
        ) : null}

        {tip === 'firma' && (
          <>
            <TanimFormBolum baslik="Temel Bilgiler">
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
            </TanimFormBolum>
            <TanimFormBolum baslik="Vergi Bilgileri">
              <VergiDairesiSecici
                deger={firmaForm.vergiDairesi}
                onChange={(vergiDairesi) => setFirmaForm((f) => ({ ...f, vergiDairesi }))}
              />
              <TanimGirdi
                etiket="Vergi No"
                deger={firmaForm.vergiNo}
                kural="vergiNo"
                onChange={(vergiNo) => setFirmaForm((f) => ({ ...f, vergiNo }))}
                placeholder="10 haneli vergi numarası"
              />
            </TanimFormBolum>
            <OrtakDurumAlani
              aktif={firmaForm.aktif}
              onChange={(aktif) => setFirmaForm((f) => ({ ...f, aktif }))}
            />
          </>
        )}

        {tip === 'sube' && (
          <>
            <TanimFormBolum baslik="Temel Bilgiler">
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
              </div>
            </TanimFormBolum>
            <OrtakAdresFormu
              deger={subeForm}
              onChange={(adres) => setSubeForm((f) => ({ ...f, ...adres }))}
            />
            <TanimFormBolum baslik="E-Belge / Sicil">
              <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
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
            </TanimFormBolum>
            <OrtakDurumAlani
              aktif={subeForm.aktif}
              onChange={(aktif) => setSubeForm((f) => ({ ...f, aktif }))}
            />
          </>
        )}

        {tip === 'depo' && (
          <>
            <TanimFormBolum baslik="Temel Bilgiler">
              <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
                <label className="ap-tanimlar-secim-alan block">
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
              </div>
            </TanimFormBolum>
            <OrtakAdresFormu
              deger={depoForm}
              onChange={(adres) => setDepoForm((f) => ({ ...f, ...adres }))}
            />
            <OrtakDurumAlani
              aktif={depoForm.aktif}
              onChange={(aktif) => setDepoForm((f) => ({ ...f, aktif }))}
            />
          </>
        )}

        {tip === 'kasa' && (
          <>
            <TanimFormBolum baslik="Temel Bilgiler">
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
                    value={kasaForm.paraBirimi}
                    onChange={(paraBirimi) => setKasaForm((f) => ({ ...f, paraBirimi }))}
                    secenekler={PARA_BIRIMLERI.map((p) => ({ value: p, label: p }))}
                    aria-label="Para birimi"
                  />
                </label>
              </div>
            </TanimFormBolum>
            <OrtakDurumAlani
              aktif={kasaForm.aktif}
              onChange={(aktif) => setKasaForm((f) => ({ ...f, aktif }))}
            />
          </>
        )}

        {tip === 'donem' && (
          <>
            <TanimFormBolum baslik="Temel Bilgiler">
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
            </TanimFormBolum>
            <OrtakDurumAlani
              aktif={donemForm.aktif}
              onChange={(aktif) => setDonemForm((f) => ({ ...f, aktif }))}
            />
          </>
        )}

        {hata ? <p className="ap-tanimlar-modal-hata">{hata}</p> : null}
      </div>
    </SistemModal>
  );
}
