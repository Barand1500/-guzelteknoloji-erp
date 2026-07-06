import { useCallback, useEffect, useState } from 'react';
import type { RolTanimi } from '@/admin/baslat-menusu/musteri-ajans/roller/api';
import { formInputSinifi } from '@/formlar/FormAlani';

export interface RolFormDegeri {
  baslik: string;
  aciklama: string;
}

interface RolDuzenleModalProps {
  acik: boolean;
  rol: RolTanimi | null;
  onKapat: () => void;
  onKaydet: (kod: string, deger: RolFormDegeri) => void;
}

export function RolDuzenleModal({ acik, rol, onKapat, onKaydet }: RolDuzenleModalProps) {
  const [form, setForm] = useState<RolFormDegeri>({ baslik: '', aciklama: '' });
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!acik || !rol) return;
    setForm({ baslik: rol.baslik, aciklama: rol.aciklama });
    setHata('');
  }, [acik, rol]);

  const kapat = useCallback(() => onKapat(), [onKapat]);

  useEffect(() => {
    if (!acik) return;
    function tusHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        kapat();
      }
    }
    document.addEventListener('keydown', tusHandler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tusHandler);
      document.body.style.overflow = '';
    };
  }, [acik, kapat]);

  if (!acik || !rol) return null;

  const sistemRolu = rol.sistemRolu !== false && [
    'SUPER_ADMIN',
    'AJANS_ADMIN',
    'MUSTERI_ADMIN',
    'EDITOR',
    'SEO_EDITOR',
    'GORUNTULEME',
  ].includes(rol.kod);

  function kaydet() {
    if (!form.baslik.trim()) {
      setHata('Rol adı zorunludur');
      return;
    }
    if (!rol) return;
    onKaydet(rol.kod, { baslik: form.baslik.trim(), aciklama: form.aciklama.trim() });
    kapat();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Kapat"
        onClick={kapat}
      />
      <div className="relative w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-white">Rol Düzenle</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Rol kodu</label>
            <input className={`${formInputSinifi} bg-slate-800/80`} value={rol.kod} readOnly />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Rol adı</label>
            <input
              className={formInputSinifi}
              value={form.baslik}
              onChange={(e) => setForm({ ...form, baslik: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Açıklama</label>
            <textarea
              className={`${formInputSinifi} min-h-[80px] resize-y`}
              value={form.aciklama}
              onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
            />
          </div>
          {sistemRolu && (
            <p className="text-xs text-slate-500">Sistem rolü: kod değiştirilemez, silinemez.</p>
          )}
          {hata && <p className="text-sm text-red-400">{hata}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={kapat}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={kaydet}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            Uygula
          </button>
        </div>
      </div>
    </div>
  );
}
