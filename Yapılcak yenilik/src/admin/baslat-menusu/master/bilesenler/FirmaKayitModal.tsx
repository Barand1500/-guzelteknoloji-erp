import { useEffect, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { IlIlceArama, TelefonAlani } from '@/admin/baslat-menusu/master/bilesenler/MasterFormAlanlari';
import type { FirmaFormGirdi, MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import type { MasterBayi } from '@/admin/baslat-menusu/master/bayiler/api';
import { SistemModal } from '@/admin/ortak/SistemModal';

interface FirmaKayitModalProps {
  acik: boolean;
  duzenlenen: MasterFirma | null;
  bayiSecenekleri: MasterBayi[];
  kaydediliyor?: boolean;
  onKapat: () => void;
  onKaydet: (girdi: FirmaFormGirdi) => void;
}

const bosForm: FirmaFormGirdi = {
  bayiId: 0,
  unvan: '',
  tabelaAdi: '',
  il: '',
  ilce: '',
  eposta: '',
  telefon: '',
  gsm: '',
  vergiDairesi: '',
  vergiNo: '',
  iskonto: null,
  aktif: true,
};

export function FirmaKayitModal({
  acik,
  duzenlenen,
  bayiSecenekleri,
  kaydediliyor,
  onKapat,
  onKaydet,
}: FirmaKayitModalProps) {
  const [form, setForm] = useState<FirmaFormGirdi>(bosForm);
  const [hata, setHata] = useState('');

  const aktifBayiler = bayiSecenekleri.filter((b) => b.aktif);

  useEffect(() => {
    if (!acik) return;
    const aktif = bayiSecenekleri.filter((b) => b.aktif);
    if (duzenlenen) {
      setForm({
        bayiId: duzenlenen.bayiId,
        unvan: duzenlenen.unvan,
        tabelaAdi: duzenlenen.tabelaAdi ?? '',
        il: duzenlenen.il ?? '',
        ilce: duzenlenen.ilce ?? '',
        eposta: duzenlenen.eposta ?? '',
        telefon: duzenlenen.telefon ?? '',
        gsm: duzenlenen.gsm ?? '',
        vergiDairesi: duzenlenen.vergiDairesi ?? '',
        vergiNo: duzenlenen.vergiNo ?? '',
        iskonto: duzenlenen.iskonto,
        aktif: duzenlenen.aktif,
      });
    } else {
      setForm({
        ...bosForm,
        bayiId: aktif[0]?.id ?? 0,
      });
    }
    setHata('');
  }, [acik, duzenlenen, bayiSecenekleri]);

  function kaydet() {
    const unvan = form.unvan.trim();
    if (!form.bayiId || form.bayiId < 1) {
      setHata('Bayi seçin');
      return;
    }
    if (unvan.length < 2) {
      setHata('Unvan en az 2 karakter olmalı');
      return;
    }
    if (form.iskonto != null && (form.iskonto < 0 || form.iskonto > 100)) {
      setHata('İskonto 0-100 arasında olmalı');
      return;
    }
    onKaydet({
      ...form,
      unvan,
      tabelaAdi: form.tabelaAdi?.trim() || undefined,
      il: form.il?.trim() || undefined,
      ilce: form.ilce?.trim() || undefined,
      eposta: form.eposta?.trim() || undefined,
      telefon: form.telefon?.trim() || undefined,
      gsm: form.gsm?.trim() || undefined,
      vergiDairesi: form.vergiDairesi?.trim() || undefined,
      vergiNo: form.vergiNo?.trim() || undefined,
      iskonto: form.iskonto === null || form.iskonto === undefined ? null : form.iskonto,
    });
  }

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik={duzenlenen ? 'Firma Düzenle' : 'Yeni Firma Ekle'}
      altBaslik="Tüm alanları tek seferde doldurmak için bu formu kullanın"
      ikon="🏪"
      genislik="firma"
      baslikId="firma-kayit-baslik"
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
            disabled={kaydediliyor || aktifBayiler.length === 0}
          >
            {kaydediliyor ? 'Kaydediliyor…' : duzenlenen ? 'Güncelle' : 'Firma Oluştur'}
          </button>
        </>
      }
    >
      <div className="ap-sistem-modal-bilgi-kutu">
        <span className="ap-sistem-modal-bilgi-ikon" aria-hidden>
          ℹ️
        </span>
        <p>
          Tabloda hücreleri çift tıklayarak hızlı düzenleyebilirsiniz. Sütun görünürlüğünü tablo üstündeki ⚙️ ile
          ayarlayın.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Bayi *</label>
          <select
            className={formSelectSinifi}
            value={form.bayiId || ''}
            onChange={(e) => setForm({ ...form, bayiId: Number(e.target.value) })}
          >
            <option value="" disabled>
              Bayi seçin
            </option>
            {aktifBayiler.map((b) => (
              <option key={b.id} value={b.id}>
                {b.unvan}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Tabela adı</label>
          <input
            className={formInputSinifi}
            placeholder="Müşteriye görünen ad"
            value={form.tabelaAdi ?? ''}
            onChange={(e) => setForm({ ...form, tabelaAdi: e.target.value })}
            autoFocus
          />
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Unvan *</label>
          <input
            className={formInputSinifi}
            placeholder="Resmi unvan"
            value={form.unvan}
            onChange={(e) => setForm({ ...form, unvan: e.target.value })}
          />
        </div>
        <IlIlceArama
          il={form.il ?? ''}
          ilce={form.ilce ?? ''}
          onDegistir={(g) => setForm((f) => ({ ...f, ...g }))}
        />
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Vergi dairesi</label>
          <input
            className={formInputSinifi}
            value={form.vergiDairesi ?? ''}
            onChange={(e) => setForm({ ...form, vergiDairesi: e.target.value })}
          />
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Vergi no</label>
          <input
            className={formInputSinifi}
            value={form.vergiNo ?? ''}
            onChange={(e) => setForm({ ...form, vergiNo: e.target.value })}
            placeholder="VKN / TCKN"
          />
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">İskonto %</label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            className={formInputSinifi}
            value={form.iskonto ?? ''}
            onChange={(e) =>
              setForm({
                ...form,
                iskonto: e.target.value === '' ? null : Number(e.target.value),
              })
            }
            placeholder="0-100"
          />
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Durum</label>
          <select
            className={formSelectSinifi}
            value={form.aktif === false ? 'false' : 'true'}
            onChange={(e) => setForm({ ...form, aktif: e.target.value === 'true' })}
          >
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">E-posta</label>
          <input
            type="email"
            className={formInputSinifi}
            value={form.eposta ?? ''}
            onChange={(e) => setForm({ ...form, eposta: e.target.value })}
          />
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">Telefon</label>
          <TelefonAlani value={form.telefon ?? ''} onChange={(v) => setForm({ ...form, telefon: v })} />
        </div>
        <div>
          <label className="ap-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">GSM</label>
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
