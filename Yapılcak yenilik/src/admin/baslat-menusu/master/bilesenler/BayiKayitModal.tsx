import { useEffect, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { IlIlceArama, TelefonAlani } from '@/admin/baslat-menusu/master/bilesenler/MasterFormAlanlari';
import {
  bayiTarihGoster,
  type BayiFormGirdi,
  type MasterBayi,
} from '@/admin/baslat-menusu/master/bayiler/api';
import { SistemModal } from '@/admin/ortak/SistemModal';

interface BayiKayitModalProps {
  acik: boolean;
  duzenlenen: MasterBayi | null;
  ustBayiSecenekleri: MasterBayi[];
  kaydediliyor?: boolean;
  onKapat: () => void;
  onKaydet: (girdi: BayiFormGirdi) => void;
}

const bosForm: BayiFormGirdi = {
  unvan: '',
  ustId: null,
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

export function BayiKayitModal({
  acik,
  duzenlenen,
  ustBayiSecenekleri,
  kaydediliyor,
  onKapat,
  onKaydet,
}: BayiKayitModalProps) {
  const [form, setForm] = useState<BayiFormGirdi>(bosForm);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!acik) return;
    if (duzenlenen) {
      setForm({
        unvan: duzenlenen.unvan,
        ustId: duzenlenen.ustId,
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
      setForm(bosForm);
    }
    setHata('');
  }, [acik, duzenlenen]);

  const ustSecenekler = ustBayiSecenekleri.filter((b) => b.id !== duzenlenen?.id && b.aktif);

  function kaydet() {
    const unvan = form.unvan.trim();
    if (unvan.length < 2) {
      setHata('Unvan en az 2 karakter olmalı');
      return;
    }

    let iskonto: number | null = null;
    if (form.iskonto != null && form.iskonto !== ('' as unknown as number)) {
      const n = Number(form.iskonto);
      if (Number.isNaN(n) || n < 0 || n > 100) {
        setHata('İskonto 0–100 arasında olmalı');
        return;
      }
      iskonto = n;
    }

    onKaydet({
      ...form,
      unvan,
      il: form.il?.trim() || undefined,
      ilce: form.ilce?.trim() || undefined,
      adres: form.adres?.trim() || undefined,
      eposta: form.eposta?.trim() || undefined,
      telefon: form.telefon?.trim() || undefined,
      gsm: form.gsm?.trim() || undefined,
      vergiDairesi: form.vergiDairesi?.trim() || undefined,
      vergiNo: form.vergiNo?.trim() || undefined,
      iskonto,
      ustId: form.ustId ?? null,
    });
  }

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik={duzenlenen ? 'Bayi Düzenle' : 'Yeni Bayi Ekle'}
      ikon="🏢"
      genislik="bayi"
      baslikId="bayi-kayit-baslik"
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
            disabled={kaydediliyor}
          >
            {kaydediliyor ? 'Kaydediliyor…' : duzenlenen ? 'Güncelle' : 'Bayi Oluştur'}
          </button>
        </>
      }
    >
      {duzenlenen && (
        <div className="mb-3 flex flex-wrap gap-4 text-xs">
          <span className="ap-muted">
            Kayıt: <strong className="ap-heading">{bayiTarihGoster(duzenlenen.kayitTarihi)}</strong>
          </span>
          <span className="ap-muted">
            Güncelleme: <strong className="ap-heading">{bayiTarihGoster(duzenlenen.guncellemeTarihi)}</strong>
          </span>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Unvan *</label>
            <input
              className={formInputSinifi}
              placeholder="Bayi / distribütör unvanı"
              value={form.unvan}
              onChange={(e) => setForm({ ...form, unvan: e.target.value })}
              autoFocus
            />
          </div>
          <div className="sm:col-span-2">
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Üst bayi</label>
            <select
              className={formSelectSinifi}
              value={form.ustId ?? ''}
              onChange={(e) =>
                setForm({ ...form, ustId: e.target.value ? Number(e.target.value) : null })
              }
            >
              <option value="">Bağımsız (ana bayi)</option>
              {ustSecenekler.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.unvan}
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
              placeholder="0"
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
