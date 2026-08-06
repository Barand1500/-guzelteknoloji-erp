import { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { tarihAnahtari } from '@/admin/kabuk/alt-panel/takvimNotlari';
import './tarihSecici.css';

const AYLAR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];
const GUNLER = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

function isoToTr(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function bugunIso(): string {
  const d = new Date();
  return tarihAnahtari(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseAy(iso: string | undefined): { yil: number; ay: number } {
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m] = iso.split('-').map(Number);
    if (y && m) return { yil: y, ay: m - 1 };
  }
  const d = new Date();
  return { yil: d.getFullYear(), ay: d.getMonth() };
}

function ayHucreleri(yil: number, ay: number) {
  const ilkGun = new Date(yil, ay, 1).getDay();
  const baslangic = ilkGun === 0 ? 6 : ilkGun - 1;
  const gunSayisi = new Date(yil, ay + 1, 0).getDate();
  const oncekiAyGun = new Date(yil, ay, 0).getDate();
  const hucreler: { gun: number; ayOffset: -1 | 0 | 1; tarih: string }[] = [];

  for (let i = 0; i < baslangic; i++) {
    const gun = oncekiAyGun - baslangic + 1 + i;
    const d = new Date(yil, ay - 1, gun);
    hucreler.push({
      gun,
      ayOffset: -1,
      tarih: tarihAnahtari(d.getFullYear(), d.getMonth(), d.getDate()),
    });
  }
  for (let g = 1; g <= gunSayisi; g++) {
    hucreler.push({ gun: g, ayOffset: 0, tarih: tarihAnahtari(yil, ay, g) });
  }
  while (hucreler.length < 42) {
    const i = hucreler.length - (baslangic + gunSayisi);
    const g = i + 1;
    const d = new Date(yil, ay + 1, g);
    hucreler.push({
      gun: g,
      ayOffset: 1,
      tarih: tarihAnahtari(d.getFullYear(), d.getMonth(), d.getDate()),
    });
  }
  return hucreler;
}

function TakvimIkon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export interface TarihSeciciProps {
  id?: string;
  deger: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  ariaLabel: string;
  /** satir: kompakt alan içi; alan: form input görünümü */
  varyant?: 'satir' | 'alan';
  className?: string;
  /** Popup yatay kaydırma (px) — varsayılan 10 */
  sagKaydirma?: number;
  onChange: (deger: string) => void;
  onFocusChange?: (odak: boolean) => void;
}

/** Admin temalı tek gün tarih seçici (gg.aa.yyyy) */
export function TarihSecici({
  id,
  deger,
  min,
  max,
  disabled,
  ariaLabel,
  varyant = 'satir',
  className = '',
  sagKaydirma = 10,
  onChange,
  onFocusChange,
}: TarihSeciciProps) {
  const [acik, setAcik] = useState(false);
  const [gorunen, setGorunen] = useState(() => parseAy(deger));
  const [konum, setKonum] = useState<{ top: number; left: number } | null>(null);
  const tetikRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bugun = bugunIso();
  const portalKok = useMemo(
    () => document.querySelector('.admin-panel') ?? document.body,
    []
  );

  useEffect(() => {
    if (acik) setGorunen(parseAy(deger || min || max));
  }, [acik, deger, min, max]);

  useEffect(() => {
    if (!acik) {
      setKonum(null);
      return;
    }

    function konumGuncelle() {
      const el = tetikRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const panel = panelRef.current;
      const genislik = panel?.offsetWidth || 272;
      const yukseklik = panel?.offsetHeight || 320;
      const kenar = 8;
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;

      /* Tetik alanının soluna hizala (+ bir tık sağ); sağda taşarsa sağ kenara yasla */
      let sol = r.left + sagKaydirma;
      if (sol + genislik > vw - kenar) {
        sol = r.right - genislik;
      }
      sol = Math.max(kenar, Math.min(sol, vw - genislik - kenar));

      let ust = r.bottom + 6;
      if (ust + yukseklik > vh - kenar && r.top - yukseklik - 6 >= kenar) {
        ust = r.top - yukseklik - 6;
      } else {
        ust = Math.min(ust, Math.max(kenar, vh - yukseklik - kenar));
      }
      setKonum({ top: ust, left: sol });
    }

    konumGuncelle();
    const raf = requestAnimationFrame(() => {
      konumGuncelle();
      requestAnimationFrame(konumGuncelle);
    });
    window.addEventListener('resize', konumGuncelle);
    window.addEventListener('scroll', konumGuncelle, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', konumGuncelle);
      window.removeEventListener('scroll', konumGuncelle, true);
    };
  }, [acik, sagKaydirma]);

  useEffect(() => {
    if (!acik) return;

    function disari(e: MouseEvent) {
      const t = e.target as Node;
      if (tetikRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setAcik(false);
      onFocusChange?.(false);
    }
    function tus(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      setAcik(false);
      onFocusChange?.(false);
      tetikRef.current?.focus();
    }
    window.addEventListener('mousedown', disari);
    window.addEventListener('keydown', tus, true);
    return () => {
      window.removeEventListener('mousedown', disari);
      window.removeEventListener('keydown', tus, true);
    };
  }, [acik, onFocusChange]);

  const hucreler = useMemo(() => ayHucreleri(gorunen.yil, gorunen.ay), [gorunen]);

  function acKapat() {
    if (disabled) return;
    setAcik((v) => {
      const sonraki = !v;
      onFocusChange?.(sonraki);
      return sonraki;
    });
  }

  function sec(tarih: string) {
    if (min && tarih < min) return;
    if (max && tarih > max) return;
    onChange(tarih);
    setAcik(false);
    onFocusChange?.(false);
  }

  function temizle() {
    onChange('');
    setAcik(false);
    onFocusChange?.(false);
  }

  function bugunuSec() {
    if (min && bugun < min) return;
    if (max && bugun > max) return;
    sec(bugun);
  }

  return (
    <div className={`ap-tarih-secici ap-tarih-secici--${varyant}${className ? ` ${className}` : ''}`}>
      <button
        ref={tetikRef}
        id={id}
        type="button"
        className={`ap-tarih-tetik ap-tarih-tetik--${varyant}${acik ? ' ap-tarih-tetik--acik' : ''}${!deger ? ' ap-tarih-tetik--bos' : ''}`}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={acik}
        onClick={acKapat}
      >
        <span className="ap-tarih-tetik-metin">{deger ? isoToTr(deger) : 'gg.aa.yyyy'}</span>
        <span className="ap-tarih-tetik-ikon">
          <TakvimIkon />
        </span>
      </button>

      {acik
        ? createPortal(
            <div
              ref={panelRef}
              className="ap-takvim-popup"
              style={{
                top: konum?.top ?? 0,
                left: konum?.left ?? 0,
                visibility: konum ? 'visible' : 'hidden',
              }}
              role="dialog"
              aria-label={ariaLabel}
            >
              <div className="ap-takvim-popup-ust">
                <button
                  type="button"
                  className="ap-takvim-popup-nav"
                  aria-label="Önceki ay"
                  onClick={() =>
                    setGorunen((o) => {
                      const d = new Date(o.yil, o.ay - 1, 1);
                      return { yil: d.getFullYear(), ay: d.getMonth() };
                    })
                  }
                >
                  ‹
                </button>
                <p className="ap-takvim-popup-baslik">
                  {AYLAR[gorunen.ay]} {gorunen.yil}
                </p>
                <button
                  type="button"
                  className="ap-takvim-popup-nav"
                  aria-label="Sonraki ay"
                  onClick={() =>
                    setGorunen((o) => {
                      const d = new Date(o.yil, o.ay + 1, 1);
                      return { yil: d.getFullYear(), ay: d.getMonth() };
                    })
                  }
                >
                  ›
                </button>
              </div>

              <div className="ap-takvim-popup-grid" role="grid">
                {GUNLER.map((g) => (
                  <span key={g} className="ap-takvim-popup-gun-baslik">
                    {g}
                  </span>
                ))}
                {hucreler.map((h) => {
                  const disarda = (min && h.tarih < min) || (max && h.tarih > max);
                  const secili = deger === h.tarih;
                  const bugunku = h.tarih === bugun;
                  return (
                    <button
                      key={h.tarih}
                      type="button"
                      role="gridcell"
                      disabled={!!disarda}
                      className={[
                        'ap-takvim-popup-gun',
                        h.ayOffset !== 0 ? 'ap-takvim-popup-gun--dis' : '',
                        secili ? 'ap-takvim-popup-gun--secili' : '',
                        bugunku ? 'ap-takvim-popup-gun--bugun' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => sec(h.tarih)}
                    >
                      {h.gun}
                    </button>
                  );
                })}
              </div>

              <div className="ap-takvim-popup-alt">
                <button type="button" className="ap-takvim-popup-alt-tus" onClick={temizle}>
                  Temizle
                </button>
                <button
                  type="button"
                  className="ap-takvim-popup-alt-tus ap-takvim-popup-alt-tus--birincil"
                  disabled={(!!min && bugun < min) || (!!max && bugun > max)}
                  onClick={bugunuSec}
                >
                  Bugün
                </button>
              </div>
            </div>,
            portalKok
          )
        : null}
    </div>
  );
}
