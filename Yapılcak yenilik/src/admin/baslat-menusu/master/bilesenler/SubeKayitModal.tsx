import { useEffect, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { IlIlceArama, TelefonAlani } from '@/admin/baslat-menusu/master/bilesenler/MasterFormAlanlari';
import {
  SUBE_TIP_SECENEKLERI,
  subeTarihGoster,
  type MasterSube,
  type SubeFormGirdi,
} from '@/admin/baslat-menusu/master/subeler/api';
import type { MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import { SistemModal } from '@/admin/ortak/SistemModal';

interface SubeKayitModalProps {
  acik: boolean;
  duzenlenen: MasterSube | null;
  firmaSecenekleri: MasterFirma[];
  kaydediliyor?: boolean;
  onKapat: () => void;
  onKaydet: (girdi: SubeFormGirdi) => void;
}

const bosForm: SubeFormGirdi = {
  firmaId: 0,
  subeAdi: '',
  subeTipi: 'restoran',
  il: '',
  ilce: '',
  adres: '',
  eposta: '',
  telefon: '',
  gsm: '',
  vergiDairesi: '',
  vergiNo: '',
  iskonto: null,
};

export function SubeKayitModal({
  acik,
  duzenlenen,
  firmaSecenekleri,
  kaydediliyor,
  onKapat,
  onKaydet,
}: SubeKayitModalProps) {
  const [form, setForm] = useState<SubeFormGirdi>(bosForm);
  const [hata, setHata] = useState('');

  const aktifFirmalar = firmaSecenekleri.filter((f) => f.aktif);

  useEffect(() => {
    if (!acik) return;
    const aktif = firmaSecenekleri.filter((f) => f.aktif);
    if (duzenlenen) {
      setForm({
        firmaId: duzenlenen.firmaId,
        subeAdi: duzenlenen.subeAdi,
        subeTipi: duzenlenen.subeTipi,
        il: duzenlenen.il ?? '',
        ilce: duzenlenen.ilce ?? '',
        adres: duzenlenen.adres ?? '',
        eposta: duzenlenen.eposta ?? '',
        telefon: duzenlenen.telefon ?? '',
        gsm: duzenlenen.gsm ?? '',
        vergiDairesi: duzenlenen.vergiDairesi ?? '',
        vergiNo: duzenlenen.vergiNo ?? '',
        iskonto: duzenlenen.iskonto,
      });
    } else {
      setForm({
        ...bosForm,
        firmaId: aktif[0]?.id ?? 0,
      });
    }
    setHata('');
  }, [acik, duzenlenen, firmaSecenekleri]);

  function kaydet() {
    const subeAdi = form.subeAdi.trim();
    if (!form.firmaId || form.firmaId < 1) {
      setHata('Firma seçin');
      return;
    }
    if (subeAdi.length < 2) {
      setHata('Şube adı en az 2 karakter olmalı');
      return;
    }

    let iskonto: number | null = null;
    if (form.iskonto != null) {
      const n = Number(form.iskonto);
      if (Number.isNaN(n) || n < 0 || n > 100) {
        setHata('İskonto 0–100 arasında olmalı');
        return;
      }
      iskonto = n;
    }

    onKaydet({
      ...form,
      subeAdi,
      il: form.il?.trim() || undefined,
      ilce: form.ilce?.trim() || undefined,
      adres: form.adres?.trim() || undefined,
      eposta: form.eposta?.trim() || undefined,
      telefon: form.telefon?.trim() || undefined,
      gsm: form.gsm?.trim() || undefined,
      vergiDairesi: form.vergiDairesi?.trim() || undefined,
      vergiNo: form.vergiNo?.trim() || undefined,
      iskonto,
    });
  }

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik={duzenlenen ? 'Şube Düzenle' : 'Yeni Şube Ekle'}
      ikon="🍽️"
      genislik="firma"
      baslikId="sube-kayit-baslik"
      kapatmaDevreDisi={kaydediliyor}
      footer={
        <>
          <button type="button" className="ap-sistem-modal-btn" onClick={onKapat} disabled={kaydediliyor}>
            İptal
          </button>
          <button
            type="button"
            className="ap-sistem-modal-btn ap-sistem-modal-btn-birincil"
            onClick={kaydet}
            disabled={kaydediliyor || aktifFirmalar.length === 0}
          >
            {kaydediliyor ? 'Kaydediliyor…' : duzenlenen ? 'Güncelle' : 'Şube Oluştur'}
          </button>
        </>
      }
    >
      {duzenlenen && (
        <div className="mb-3 flex flex-wrap gap-4 text-xs">
          <span className="ap-muted">
            Kayıt: <strong className="ap-heading">{subeTarihGoster(duzenlenen.kayitTarihi)}</strong>
          </span>
          <span className="ap-muted">
            Güncelleme: <strong className="ap-heading">{subeTarihGoster(duzenlenen.guncellemeTarihi)}</strong>
          </span>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Firma *</label>
            <select
              className={formSelectSinifi}
              value={form.firmaId || ''}
              onChange={(e) => setForm({ ...form, firmaId: Number(e.target.value) })}
            >
              <option value="" disabled>
                Firma seçin
              </option>
              {aktifFirmalar.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.tabelaAdi ?? f.unvan}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Şube adı *</label>
            <input
              className={formInputSinifi}
              placeholder="ör. Merkez Şube"
              value={form.subeAdi}
              onChange={(e) => setForm({ ...form, subeAdi: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Şube tipi</label>
            <select
              className={formSelectSinifi}
              value={form.subeTipi ?? 'restoran'}
              onChange={(e) => setForm({ ...form, subeTipi: e.target.value as SubeFormGirdi['subeTipi'] })}
            >
              {SUBE_TIP_SECENEKLERI.map((t) => (
                <option key={t.kod} value={t.kod}>
                  {t.etiket}
                </option>
              ))}
            </select>
          </div>
          <IlIlceArama
            il={form.il ?? ''}
            ilce={form.ilce ?? ''}
            onDegistir={(g) => setForm((f) => ({ ...f, ...g }))}
          />
          <div className="sm:col-span-2">
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Adres</label>
            <input
              className={formInputSinifi}
              value={form.adres ?? ''}
              onChange={(e) => setForm({ ...form, adres: e.target.value })}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Vergi dairesi</label>
            <input
              className={formInputSinifi}
              value={form.vergiDairesi ?? ''}
              onChange={(e) => setForm({ ...form, vergiDairesi: e.target.value })}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Vergi no</label>
            <input
              className={formInputSinifi}
              value={form.vergiNo ?? ''}
              onChange={(e) => setForm({ ...form, vergiNo: e.target.value })}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">İskonto (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              className={formInputSinifi}
              value={form.iskonto ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  iskonto: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">E-posta</label>
            <input
              type="email"
              className={formInputSinifi}
              value={form.eposta ?? ''}
              onChange={(e) => setForm({ ...form, eposta: e.target.value })}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Telefon</label>
            <TelefonAlani value={form.telefon ?? ''} onChange={(v) => setForm({ ...form, telefon: v })} />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">GSM</label>
            <TelefonAlani
              value={form.gsm ?? ''}
              onChange={(v) => setForm({ ...form, gsm: v })}
              placeholder="05XX XXX XX XX"
              aria-label="GSM"
            />
          </div>
        </div>

      {hata && <p className="mt-3 text-sm text-red-400">{hata}</p>}
    </SistemModal>
  );
}
