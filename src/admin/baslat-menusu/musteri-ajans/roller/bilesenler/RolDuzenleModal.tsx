import { useCallback, useEffect, useState } from 'react';
import type { RolTanimi } from '@/admin/baslat-menusu/musteri-ajans/roller/api';
import { FormAlani, formInputSinifi } from '@/formlar/FormAlani';

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

  const sistemRolu =
    rol.sistemRolu !== false &&
    ['SUPER_ADMIN', 'AJANS_ADMIN', 'MUSTERI_ADMIN', 'EDITOR', 'SEO_EDITOR', 'GORUNTULEME'].includes(
      rol.kod
    );

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
    <div className="ap-sistem-modal-arka">
      <button type="button" className="absolute inset-0" aria-label="Kapat" onClick={kapat} />
      <div className="ap-sistem-modal ap-sistem-modal-v2 relative max-w-md" role="dialog" aria-modal="true">
        <div className="ap-sistem-modal-v2-ust-cizgi" />
        <div className="ap-sistem-modal-baslik ap-sistem-modal-baslik-v2">
          <div className="flex items-start gap-3">
            <span className="ap-sistem-modal-ikon" aria-hidden>
              ✏️
            </span>
            <div>
              <h2 className="ap-heading text-lg font-semibold">Rol Düzenle</h2>
              <p className="ap-muted mt-0.5 text-sm">{rol.kod}</p>
            </div>
          </div>
          <button type="button" onClick={kapat} className="ap-sistem-modal-kapat ap-sistem-modal-kapat-v2">
            ✕
          </button>
        </div>
        <div className="ap-sistem-modal-govde-v2 space-y-3">
          <FormAlani etiket="Rol kodu">
            <input className={`${formInputSinifi} opacity-80`} value={rol.kod} readOnly />
          </FormAlani>
          <FormAlani etiket="Rol adı">
            <input
              className={formInputSinifi}
              value={form.baslik}
              onChange={(e) => setForm({ ...form, baslik: e.target.value })}
              autoFocus
            />
          </FormAlani>
          <FormAlani etiket="Açıklama">
            <textarea
              className={`${formInputSinifi} min-h-[80px] resize-y`}
              value={form.aciklama}
              onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
            />
          </FormAlani>
          {sistemRolu && (
            <div className="ap-sistem-modal-bilgi-kutu">
              <span className="ap-sistem-modal-bilgi-ikon" aria-hidden>
                🔒
              </span>
              <span>Sistem rolü: kod değiştirilemez, silinemez.</span>
            </div>
          )}
          {hata && <p className="text-sm text-red-400">{hata}</p>}
        </div>
        <div className="ap-sistem-modal-alt-v2">
          <button type="button" onClick={kapat} className="ap-sistem-modal-btn">
            İptal
          </button>
          <button type="button" onClick={kaydet} className="ap-sistem-modal-btn ap-sistem-modal-btn-birincil">
            Uygula
          </button>
        </div>
      </div>
    </div>
  );
}
