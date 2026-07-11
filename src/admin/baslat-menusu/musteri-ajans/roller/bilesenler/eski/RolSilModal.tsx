import { useCallback, useEffect } from 'react';
import type { RolTanimi } from '@/admin/baslat-menusu/musteri-ajans/roller/api';

interface RolSilModalProps {
  acik: boolean;
  rol: RolTanimi | null;
  onKapat: () => void;
  onOnayla: () => void;
}

export function RolSilModal({ acik, rol, onKapat, onOnayla }: RolSilModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Kapat"
        onClick={kapat}
      />
      <div className="relative w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-white">Rolü Sil</h2>
        <p className="mt-3 text-sm text-slate-300">
          <strong className="text-white">{rol.baslik}</strong> ({rol.kod}) rolünü silmek
          istediğinize emin misiniz?
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Değişiklik kalıcı olması için silme işleminden sonra Kaydet&apos;e basmanız gerekir.
        </p>
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
            onClick={() => {
              onOnayla();
              kapat();
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}
