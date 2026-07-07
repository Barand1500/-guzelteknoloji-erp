import { useEffect, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import type { LisansFormGirdi, MasterLisans } from '@/admin/baslat-menusu/master/lisanslar/api';
import type { MasterFirma } from '@/admin/baslat-menusu/master/firmalar/api';
import type { MasterPaket } from '@/admin/baslat-menusu/master/paketler/api';
import { paketParaBirimiSembol } from '@/admin/baslat-menusu/master/paketler/paraBirimi';
import { SistemModal } from '@/admin/ortak/SistemModal';

interface LisansKayitModalProps {
  acik: boolean;
  duzenlenen: MasterLisans | null;
  firmalar: MasterFirma[];
  paketler: MasterPaket[];
  kaydediliyor?: boolean;
  onKapat: () => void;
  onKaydet: (girdi: LisansFormGirdi) => void;
}

function isoTarih(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function LisansKayitModal({
  acik,
  duzenlenen,
  firmalar,
  paketler,
  kaydediliyor,
  onKapat,
  onKaydet,
}: LisansKayitModalProps) {
  const [form, setForm] = useState<LisansFormGirdi>({
    firmaId: 0,
    paketId: 0,
    baslangicTarihi: new Date().toISOString().slice(0, 10),
    bitisTarihi: '',
  });
  const [hata, setHata] = useState('');

  const aktifFirmalar = firmalar.filter((f) => f.aktif);
  const aktifPaketler = paketler.filter((p) => p.aktif);

  useEffect(() => {
    if (!acik) return;
    if (duzenlenen) {
      setForm({
        firmaId: duzenlenen.firmaId,
        paketId: duzenlenen.paketId,
        baslangicTarihi: isoTarih(duzenlenen.baslangicTarihi),
        bitisTarihi: isoTarih(duzenlenen.bitisTarihi) || '',
      });
    } else {
      setForm({
        firmaId: aktifFirmalar[0]?.id ?? 0,
        paketId: aktifPaketler[0]?.id ?? 0,
        baslangicTarihi: new Date().toISOString().slice(0, 10),
        bitisTarihi: '',
      });
    }
    setHata('');
  }, [acik, duzenlenen, aktifFirmalar, aktifPaketler]);

  function kaydet() {
    if (!form.firmaId || !form.paketId) {
      setHata('Firma ve paket seçin');
      return;
    }
    onKaydet({
      ...form,
      bitisTarihi: form.bitisTarihi?.trim() || null,
    });
  }

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik={duzenlenen ? 'Lisans Düzenle' : 'Lisans Ata'}
      ikon="📜"
      genislik="firma"
      baslikId="lisans-kayit-baslik"
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
            disabled={kaydediliyor || aktifFirmalar.length === 0 || aktifPaketler.length === 0}
          >
            {kaydediliyor ? 'Kaydediliyor…' : duzenlenen ? 'Güncelle' : 'Lisans Oluştur'}
          </button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Firma *</label>
            <select
              className={formSelectSinifi}
              value={form.firmaId || ''}
              onChange={(e) => setForm((f) => ({ ...f, firmaId: Number(e.target.value) }))}
              disabled={!!duzenlenen}
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
          <div className="sm:col-span-2">
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Paket *</label>
            <select
              className={formSelectSinifi}
              value={form.paketId || ''}
              onChange={(e) => setForm((f) => ({ ...f, paketId: Number(e.target.value) }))}
            >
              <option value="" disabled>
                Paket seçin
              </option>
              {aktifPaketler.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.paketAdi} — {paketParaBirimiSembol(p.paraBirimi)}
                  {p.fiyat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Başlangıç</label>
            <input
              type="date"
              className={formInputSinifi}
              value={form.baslangicTarihi ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, baslangicTarihi: e.target.value }))}
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-xs font-semibold uppercase">Bitiş (opsiyonel)</label>
            <input
              type="date"
              className={formInputSinifi}
              value={form.bitisTarihi ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, bitisTarihi: e.target.value }))}
            />
          </div>
        </div>

      {hata && <p className="mt-3 text-sm text-red-400">{hata}</p>}
    </SistemModal>
  );
}
