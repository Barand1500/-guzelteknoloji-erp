import { useEffect, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import type { MasterPaket, PaketFormGirdi } from '@/admin/baslat-menusu/master/paketler/api';
import {
  PAKET_PARA_BIRIMLERI,
  VARSAYILAN_PARA_BIRIMI,
  gecerliParaBirimi,
  paketParaBirimiNormallestir,
  type PaketParaBirimi,
} from '@/admin/baslat-menusu/master/paketler/paraBirimi';
import { SistemModal } from '@/admin/ortak/SistemModal';

interface PaketKayitModalProps {
  acik: boolean;
  duzenlenen: MasterPaket | null;
  kaydediliyor?: boolean;
  onKapat: () => void;
  onKaydet: (girdi: PaketFormGirdi) => void;
}

interface PaketFormMetin {
  paketAdi: string;
  subeSayisi: string;
  personelSayisi: string;
  masaSayisi: string;
  fiyat: string;
  paraBirimi: PaketParaBirimi;
}

const bosFormMetin: PaketFormMetin = {
  paketAdi: '',
  subeSayisi: '1',
  personelSayisi: '10',
  masaSayisi: '50',
  fiyat: '0',
  paraBirimi: VARSAYILAN_PARA_BIRIMI,
};

function tamSayiKabul(metin: string): boolean {
  return metin === '' || /^\d+$/.test(metin);
}

function ondalikKabul(metin: string): boolean {
  return metin === '' || /^\d*\.?\d*$/.test(metin);
}

function metindenGirdi(form: PaketFormMetin): { girdi?: PaketFormGirdi; hata?: string } {
  const paketAdi = form.paketAdi.trim();
  if (paketAdi.length < 2) return { hata: 'Paket adı en az 2 karakter olmalı' };

  const subeSayisi = Number(form.subeSayisi);
  const personelSayisi = Number(form.personelSayisi);
  const masaSayisi = Number(form.masaSayisi);
  const fiyat = Number(form.fiyat);

  if (form.subeSayisi.trim() === '' || !Number.isInteger(subeSayisi) || subeSayisi < 1) {
    return { hata: 'Şube sayısı en az 1 olmalı' };
  }
  if (form.personelSayisi.trim() === '' || !Number.isInteger(personelSayisi) || personelSayisi < 1) {
    return { hata: 'Personel sayısı en az 1 olmalı' };
  }
  if (form.masaSayisi.trim() === '' || !Number.isInteger(masaSayisi) || masaSayisi < 1) {
    return { hata: 'Masa sayısı en az 1 olmalı' };
  }
  if (form.fiyat.trim() === '' || Number.isNaN(fiyat) || fiyat < 0) {
    return { hata: 'Geçerli bir fiyat girin' };
  }
  if (!gecerliParaBirimi(form.paraBirimi)) {
    return { hata: 'Geçerli bir para birimi seçin' };
  }

  return {
    girdi: { paketAdi, subeSayisi, personelSayisi, masaSayisi, fiyat, paraBirimi: form.paraBirimi },
  };
}

export function PaketKayitModal({ acik, duzenlenen, kaydediliyor, onKapat, onKaydet }: PaketKayitModalProps) {
  const [form, setForm] = useState<PaketFormMetin>(bosFormMetin);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!acik) return;
    if (duzenlenen) {
      setForm({
        paketAdi: duzenlenen.paketAdi,
        subeSayisi: String(duzenlenen.subeSayisi),
        personelSayisi: String(duzenlenen.personelSayisi),
        masaSayisi: String(duzenlenen.masaSayisi),
        fiyat: String(duzenlenen.fiyat),
        paraBirimi: paketParaBirimiNormallestir(duzenlenen.paraBirimi),
      });
    } else {
      setForm(bosFormMetin);
    }
    setHata('');
  }, [acik, duzenlenen]);

  function kaydet() {
    const sonuc = metindenGirdi(form);
    if (sonuc.hata || !sonuc.girdi) {
      setHata(sonuc.hata ?? 'Geçersiz form');
      return;
    }
    onKaydet(sonuc.girdi);
  }

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik={duzenlenen ? 'Paket Düzenle' : 'Yeni Paket'}
      ikon="📦"
      genislik="sm"
      baslikId="paket-kayit-baslik"
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
            {kaydediliyor ? 'Kaydediliyor…' : duzenlenen ? 'Güncelle' : 'Paket Oluştur'}
          </button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Paket adı *</label>
            <input
              className={formInputSinifi}
              value={form.paketAdi}
              onChange={(e) => setForm((f) => ({ ...f, paketAdi: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Şube sayısı</label>
            <input
              type="text"
              inputMode="numeric"
              className={formInputSinifi}
              value={form.subeSayisi}
              onChange={(e) => {
                const v = e.target.value;
                if (tamSayiKabul(v)) setForm((f) => ({ ...f, subeSayisi: v }));
              }}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Personel sayısı</label>
            <input
              type="text"
              inputMode="numeric"
              className={formInputSinifi}
              value={form.personelSayisi}
              onChange={(e) => {
                const v = e.target.value;
                if (tamSayiKabul(v)) setForm((f) => ({ ...f, personelSayisi: v }));
              }}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Masa sayısı</label>
            <input
              type="text"
              inputMode="numeric"
              className={formInputSinifi}
              value={form.masaSayisi}
              onChange={(e) => {
                const v = e.target.value;
                if (tamSayiKabul(v)) setForm((f) => ({ ...f, masaSayisi: v }));
              }}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Fiyat</label>
            <div className="ap-master-fiyat-satiri">
              <input
                type="text"
                inputMode="decimal"
                className={formInputSinifi}
                value={form.fiyat}
                onChange={(e) => {
                  const v = e.target.value.replace(',', '.');
                  if (ondalikKabul(v)) setForm((f) => ({ ...f, fiyat: v }));
                }}
              />
              <select
                className={`${formSelectSinifi} ap-master-para-birimi-sec`}
                value={form.paraBirimi}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    paraBirimi: paketParaBirimiNormallestir(e.target.value),
                  }))
                }
                aria-label="Para birimi"
                title={PAKET_PARA_BIRIMLERI.find((pb) => pb.kod === form.paraBirimi)?.etiket}
              >
                {PAKET_PARA_BIRIMLERI.map((pb) => (
                  <option key={pb.kod} value={pb.kod}>
                    {pb.sembol}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      {hata && <p className="mt-3 text-sm text-red-400">{hata}</p>}
    </SistemModal>
  );
}

export { metindenGirdi, tamSayiKabul, ondalikKabul };
