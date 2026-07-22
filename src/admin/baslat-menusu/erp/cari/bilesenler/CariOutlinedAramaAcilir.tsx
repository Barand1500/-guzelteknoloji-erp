import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { FormAcilirSecimSecenek } from '@/formlar/FormAcilirSecim';
import { sekmeGecisTiklamasiMi, sekmePortalHedefi } from '@/araclar/sekmePortal';
import { CariOutlinedEtiket } from './CariOutlinedGirdi';

function normalizeMetin(metin: string) {
  return metin.trim().toLocaleLowerCase('tr');
}

export function CariOutlinedAramaAcilir({
  etiket,
  deger,
  onChange,
  secenekler,
  zorunlu,
  disabled = false,
  onYonet,
  aramaPlaceholder = 'Ara…',
  /** Boşken gösterilecek metin; '' ise placeholder yazılmaz */
  bosMetin = 'Seçiniz…',
  /** Açılınca arama alanı kutunun içinde olur; liste alta açılır */
  kutuIciArama = false,
}: {
  etiket: string;
  deger: string;
  onChange: (deger: string) => void;
  secenekler: readonly FormAcilirSecimSecenek[];
  zorunlu?: boolean;
  disabled?: boolean;
  onYonet?: () => void;
  aramaPlaceholder?: string;
  bosMetin?: string;
  kutuIciArama?: boolean;
}) {
  const inputId = useId();
  const listeId = useId();
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);
  const araRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [acik, setAcik] = useState(false);
  const [arama, setArama] = useState('');

  const secili = useMemo(
    () => secenekler.find((s) => s.value === deger) ?? null,
    [deger, secenekler]
  );

  const filtrelenmis = useMemo(() => {
    const q = normalizeMetin(arama);
    if (!q) return secenekler;
    return secenekler.filter((s) => normalizeMetin(s.label).includes(q));
  }, [arama, secenekler]);

  useEffect(() => {
    if (!acik) return;
    if (kutuIciArama) {
      requestAnimationFrame(() => araRef.current?.focus());
    }
  }, [acik, kutuIciArama]);

  useEffect(() => {
    if (!acik) return;
    function disTik(e: MouseEvent) {
      if (sekmeGecisTiklamasiMi(e.target)) return;
      const hedef = e.target as Node;
      if (kapsayiciRef.current?.contains(hedef)) return;
      if (!kutuIciArama && listeRef.current?.contains(hedef)) return;
      setAcik(false);
      setArama('');
    }
    document.addEventListener('mousedown', disTik);
    return () => document.removeEventListener('mousedown', disTik);
  }, [acik, kutuIciArama]);

  const sec = (value: string) => {
    onChange(value);
    setAcik(false);
    setArama('');
  };

  const acKapat = () => {
    if (disabled) return;
    setAcik((v) => {
      if (!v) setArama('');
      return !v;
    });
  };

  const listeIcerik = (
    <ul ref={listeRef} id={listeId} className="cari-arama-acilir-liste" role="listbox">
      {filtrelenmis.length === 0 ? (
        <li className="cari-arama-acilir-bos">Sonuç bulunamadı</li>
      ) : (
        filtrelenmis.map((s) => (
          <li key={s.value}>
            <button
              type="button"
              role="option"
              aria-selected={s.value === deger}
              className={`cari-arama-acilir-oge${s.value === deger ? ' cari-arama-acilir-oge--secili' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => sec(s.value)}
            >
              {s.label}
            </button>
          </li>
        ))
      )}
    </ul>
  );

  return (
    <div
      ref={kapsayiciRef}
      className={`cari-outlined-field cari-arama-acilir${focused || acik ? ' cari-outlined-field--focus' : ''}${disabled ? ' cari-outlined-field--pasif' : ''}${kutuIciArama ? ' cari-arama-acilir--kutu-ici' : ''}${acik ? ' cari-arama-acilir--acik' : ''}`}
    >
      <CariOutlinedEtiket etiket={etiket} zorunlu={zorunlu} htmlFor={inputId}>
        {!disabled && onYonet ? (
          <button
            type="button"
            className="cari-secili-yonet"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onYonet();
            }}
            title={`${etiket} yönet`}
            aria-label={`${etiket} yönet`}
          >
            +
          </button>
        ) : null}
      </CariOutlinedEtiket>
      <div className="cari-outlined-cerceve cari-arama-acilir-cerceve">
        {kutuIciArama && acik && !disabled ? (
          <div className="cari-arama-acilir-kutu-satir">
            <input
              ref={araRef}
              id={inputId}
              type="search"
              className="cari-arama-acilir-kutu-girdi"
              value={arama}
              placeholder={aramaPlaceholder}
              disabled={disabled}
              aria-autocomplete="list"
              aria-expanded
              aria-controls={listeId}
              onChange={(e) => setArama(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filtrelenmis.length === 1) {
                  e.preventDefault();
                  sec(filtrelenmis[0].value);
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setAcik(false);
                  setArama('');
                }
              }}
            />
            <span className="ap-form-acilir-secim-ok" aria-hidden>
              ▾
            </span>
          </div>
        ) : (
          <button
            id={inputId}
            type="button"
            className="cari-arama-acilir-tus"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={acik}
            aria-controls={acik ? listeId : undefined}
            onClick={acKapat}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
            <span
              className={
                secili
                  ? 'cari-arama-acilir-deger'
                  : bosMetin
                    ? 'cari-arama-acilir-placeholder'
                    : 'cari-arama-acilir-deger cari-arama-acilir-deger--bos'
              }
            >
              {secili?.label ?? bosMetin}
            </span>
            <span className="ap-form-acilir-secim-ok" aria-hidden>
              ▾
            </span>
          </button>
        )}
      </div>

      {acik && !disabled && kutuIciArama ? (
        <div className="cari-arama-acilir-panel cari-arama-acilir-panel--kutu-ici">{listeIcerik}</div>
      ) : null}

      {acik && !disabled && !kutuIciArama
        ? createPortal(
            <div
              className="cari-arama-acilir-panel"
              style={{
                position: 'fixed',
                top: (kapsayiciRef.current?.getBoundingClientRect().bottom ?? 0) + 4,
                left: kapsayiciRef.current?.getBoundingClientRect().left ?? 0,
                width: kapsayiciRef.current?.getBoundingClientRect().width ?? 200,
                maxHeight: 280,
                zIndex: 10050,
              }}
            >
              <div className="cari-arama-acilir-ara">
                <input
                  type="search"
                  className="cari-arama-acilir-ara-girdi"
                  value={arama}
                  placeholder={aramaPlaceholder}
                  autoFocus
                  onChange={(e) => setArama(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filtrelenmis.length === 1) {
                      e.preventDefault();
                      sec(filtrelenmis[0].value);
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setAcik(false);
                      setArama('');
                    }
                  }}
                />
              </div>
              {listeIcerik}
            </div>,
            sekmePortalHedefi(kapsayiciRef.current)
          )
        : null}
    </div>
  );
}
