import { useEffect, useMemo, useRef, useState } from 'react';
import type { AdminFirma } from '@/admin/baslat-menusu/tanimlar/tipler';

interface FirmaAramaSeciciProps {
  firmalar: AdminFirma[];
  seciliFirmaId: string | null;
  onSec: (firmaId: string) => void;
  disabled?: boolean;
}

export function FirmaAramaSecici({
  firmalar,
  seciliFirmaId,
  onSec,
  disabled,
}: FirmaAramaSeciciProps) {
  const [acik, setAcik] = useState(false);
  const [sorgu, setSorgu] = useState('');
  const kokRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const secili = useMemo(
    () => firmalar.find((f) => f.id === seciliFirmaId) ?? null,
    [firmalar, seciliFirmaId]
  );

  const filtreli = useMemo(() => {
    const q = sorgu.trim().toLocaleLowerCase('tr');
    const liste = !q
      ? firmalar
      : firmalar.filter(
          (f) =>
            f.firmaAdi.toLocaleLowerCase('tr').includes(q) ||
            f.firmaKodu.toLocaleLowerCase('tr').includes(q)
        );
    return liste.slice(0, 80);
  }, [firmalar, sorgu]);

  useEffect(() => {
    if (!acik) return;
    function dis(e: MouseEvent) {
      if (!kokRef.current?.contains(e.target as Node)) setAcik(false);
    }
    document.addEventListener('mousedown', dis);
    return () => document.removeEventListener('mousedown', dis);
  }, [acik]);

  useEffect(() => {
    if (acik) inputRef.current?.focus();
  }, [acik]);

  return (
    <div className="ap-tanimlar-firma-arama-secici" ref={kokRef}>
      <button
        type="button"
        className="ap-tanimlar-firma-arama-tus"
        disabled={disabled || firmalar.length === 0}
        onClick={() => {
          setAcik((v) => !v);
          setSorgu('');
        }}
        aria-expanded={acik}
        aria-haspopup="listbox"
        aria-label="Firma seç"
      >
        {secili ? (
          <span className="ap-tanimlar-firma-arama-secili">
            <strong>{secili.firmaAdi}</strong>
            <span className="ap-tanimlar-firma-arama-kod">{secili.firmaKodu}</span>
            {!secili.aktif ? <span className="ap-tanimlar-firma-arama-pasif">Pasif</span> : null}
          </span>
        ) : (
          <span className="ap-tanimlar-firma-arama-placeholder">
            {firmalar.length === 0 ? 'Firma yok' : 'Firma ara ve seç…'}
          </span>
        )}
        <span className="ap-tanimlar-firma-arama-ok" aria-hidden>
          ▾
        </span>
      </button>

      {acik ? (
        <div className="ap-tanimlar-firma-arama-panel" role="listbox">
          <input
            ref={inputRef}
            type="search"
            className="ap-tanimlar-firma-arama-input"
            placeholder="Ad veya kod yazın…"
            value={sorgu}
            onChange={(e) => setSorgu(e.target.value)}
            aria-label="Firma ara"
          />
          <div className="ap-tanimlar-firma-arama-liste">
            {filtreli.length === 0 ? (
              <p className="ap-tanimlar-firma-arama-bos">Sonuç yok</p>
            ) : (
              filtreli.map((f) => {
                const seciliMi = f.id === seciliFirmaId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="option"
                    aria-selected={seciliMi}
                    className={`ap-tanimlar-firma-arama-oge${seciliMi ? ' ap-tanimlar-firma-arama-oge--aktif' : ''}${!f.aktif ? ' ap-tanimlar-firma-arama-oge--pasif' : ''}`}
                    onClick={() => {
                      onSec(f.id);
                      setAcik(false);
                      setSorgu('');
                    }}
                  >
                    <span className="ap-tanimlar-firma-arama-oge-ad">{f.firmaAdi}</span>
                    <span className="ap-tanimlar-firma-arama-oge-kod">{f.firmaKodu}</span>
                  </button>
                );
              })
            )}
          </div>
          {firmalar.length > 80 && sorgu.trim() === '' ? (
            <p className="ap-tanimlar-firma-arama-ipucu">
              {firmalar.length} firma — daraltmak için arayın
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
