import { useCallback, useEffect, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';

export interface RolFormDegeri {
  baslik: string;
  aciklama: string;
}

interface RolEkleModalProps {
  acik: boolean;
  onKapat: () => void;
  onEkle: (deger: RolFormDegeri) => void;
}

const bosForm: RolFormDegeri = { baslik: '', aciklama: '' };

export function RolEkleModal({ acik, onKapat, onEkle }: RolEkleModalProps) {
  const [form, setForm] = useState<RolFormDegeri>(bosForm);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!acik) return;
    setForm(bosForm);
    setHata('');
  }, [acik]);

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

  if (!acik) return null;

  function kaydet() {
    if (!form.baslik.trim()) {
      setHata('Rol adı zorunludur');
      return;
    }
    onEkle({ baslik: form.baslik.trim(), aciklama: form.aciklama.trim() });
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
        <h2 className="text-lg font-semibold text-white">Yeni Rol Ekle</h2>
        <p className="mt-1 text-sm text-slate-400">
          Rol kodu otomatik oluşturulur. Yetkileri matristen işaretleyip kaydedin.
        </p>
        <div className="mt-4 space-y-3">
          <input
            className={formInputSinifi}
            placeholder="Rol adı (ör. İçerik Yöneticisi)"
            value={form.baslik}
            onChange={(e) => setForm({ ...form, baslik: e.target.value })}
            autoFocus
          />
          <textarea
            className={`${formInputSinifi} min-h-[80px] resize-y`}
            placeholder="Kısa açıklama"
            value={form.aciklama}
            onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
          />
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
            Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
