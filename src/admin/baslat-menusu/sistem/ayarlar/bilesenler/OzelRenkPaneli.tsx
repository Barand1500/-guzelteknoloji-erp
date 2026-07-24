import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { sekmePortalHedefi } from '@/araclar/sekmePortal';
import {
  hexRenkNormalize,
  hexToHsv,
  hexToRgb,
  hsvKonumdan,
  hsvKonumaDonustur,
  hsvToHex,
} from './renkDonusum';

const TEKER_CAPI = 152;
const TEKER_IC = 52;
const TEKER_DIS = 74;
const PANEL_GENISLIK = 184;
const PANEL_YUKSEKLIK = 250;

interface OzelRenkPaneliProps {
  acik: boolean;
  onKapat: () => void;
  renk: string;
  onRenkChange: (hex: string) => void;
  capRef: RefObject<HTMLElement | null>;
}

function sinirla(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function panelKonumu(cap: DOMRect | undefined): CSSProperties {
  if (!cap) return { top: 16, left: 16 };
  let left = cap.left + cap.width / 2 - PANEL_GENISLIK / 2;
  left = sinirla(left, 8, window.innerWidth - PANEL_GENISLIK - 8);

  const ustYeter = cap.top >= PANEL_YUKSEKLIK + 16;
  let top = ustYeter ? cap.top - PANEL_YUKSEKLIK - 10 : cap.bottom + 10;
  top = sinirla(top, 8, window.innerHeight - PANEL_YUKSEKLIK - 8);

  return { top, left };
}

export function OzelRenkPaneli({ acik, onKapat, renk, onRenkChange, capRef }: OzelRenkPaneliProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const tekerRef = useRef<HTMLDivElement>(null);
  const slRef = useRef<HTMLDivElement>(null);
  const [hsv, setHsv] = useState(() => hexToHsv(renk));
  const [hexMetin, setHexMetin] = useState(renk.toUpperCase());
  const [stil, setStil] = useState<CSSProperties>({ top: 0, left: 0 });
  const [portalHedef, setPortalHedef] = useState<HTMLElement | null>(null);
  const suruklemeRef = useRef<'teker' | 'sl' | null>(null);

  useEffect(() => {
    if (!acik) return;
    const yeni = hexToHsv(renk);
    setHsv(yeni);
    setHexMetin(renk.toUpperCase());
  }, [acik, renk]);

  const konumGuncelle = useCallback(() => {
    setStil(panelKonumu(capRef.current?.getBoundingClientRect()));
  }, [capRef]);

  useLayoutEffect(() => {
    if (!acik) {
      setPortalHedef(null);
      return;
    }
    // Modal içindeyse aynı arka plana bas — form alanlarının üstünde kalsın
    const cap = capRef.current;
    const modalArka = cap?.closest('.ap-sistem-modal-arka');
    setPortalHedef(
      modalArka instanceof HTMLElement ? modalArka : sekmePortalHedefi(cap)
    );
    konumGuncelle();
  }, [acik, capRef, konumGuncelle]);

  useEffect(() => {
    if (!acik) return;
    const yenile = () => konumGuncelle();
    window.addEventListener('resize', yenile);
    window.addEventListener('scroll', yenile, true);
    return () => {
      window.removeEventListener('resize', yenile);
      window.removeEventListener('scroll', yenile, true);
    };
  }, [acik, konumGuncelle]);

  const renkYayinla = useCallback(
    (yeni: { h: number; s: number; v: number }) => {
      setHsv(yeni);
      const hex = hsvToHex(yeni.h, yeni.s, yeni.v);
      setHexMetin(hex);
      onRenkChange(hex);
    },
    [onRenkChange]
  );

  useEffect(() => {
    if (!acik) return;
    const disari = (e: MouseEvent) => {
      const hedef = e.target as Node;
      if (panelRef.current?.contains(hedef) || capRef.current?.contains(hedef)) return;
      onKapat();
    };
    // Tıklama ile açılışın aynı mousedown'ında kapanmasın
    const id = window.setTimeout(() => {
      document.addEventListener('mousedown', disari);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', disari);
    };
  }, [acik, capRef, onKapat]);

  useEffect(() => {
    if (!acik) return;
    function esc(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      onKapat();
    }
    document.addEventListener('keydown', esc, true);
    return () => document.removeEventListener('keydown', esc, true);
  }, [acik, onKapat]);

  useEffect(() => {
    const birak = () => {
      suruklemeRef.current = null;
    };
    window.addEventListener('mouseup', birak);
    return () => window.removeEventListener('mouseup', birak);
  }, []);

  const tekerGuncelle = (clientX: number, clientY: number) => {
    const el = tekerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = clientX - cx;
    const y = clientY - cy;
    const uzaklik = Math.hypot(x, y);
    if (uzaklik < TEKER_IC || uzaklik > TEKER_DIS + 8) return;
    const aci = (Math.atan2(y, x) * 180) / Math.PI;
    const h = (aci + 360) % 360;
    renkYayinla({ ...hsv, h });
  };

  const slGuncelle = (clientX: number, clientY: number) => {
    const el = slRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = sinirla((clientX - rect.left) / rect.width, 0, 1);
    const y = sinirla((clientY - rect.top) / rect.height, 0, 1);
    renkYayinla(hsvKonumdan(x, y, hsv.h));
  };

  const tekerSurukle = (e: React.PointerEvent) => {
    suruklemeRef.current = 'teker';
    tekerGuncelle(e.clientX, e.clientY);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const slSurukle = (e: React.PointerEvent) => {
    suruklemeRef.current = 'sl';
    slGuncelle(e.clientX, e.clientY);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const pointerHareket = (e: React.PointerEvent) => {
    if (suruklemeRef.current === 'teker') tekerGuncelle(e.clientX, e.clientY);
    if (suruklemeRef.current === 'sl') slGuncelle(e.clientX, e.clientY);
  };

  const hexUygula = () => {
    const v = hexRenkNormalize(hexMetin);
    if (!hexToRgb(v)) return;
    renkYayinla(hexToHsv(v));
  };

  const guncelHex = hsvToHex(hsv.h, hsv.s, hsv.v);
  const slKonum = hsvKonumaDonustur(hsv.s, hsv.v);
  const tekerAci = (hsv.h * Math.PI) / 180;
  const tekerYaricap = (TEKER_IC + TEKER_DIS) / 2;
  const tekerMerkez = TEKER_CAPI / 2;
  const tekerX = tekerMerkez + Math.cos(tekerAci) * tekerYaricap;
  const tekerY = tekerMerkez + Math.sin(tekerAci) * tekerYaricap;

  if (!acik || !portalHedef) return null;

  return createPortal(
    <div
      ref={panelRef}
      className="ap-ozel-renk-panel ap-ozel-renk-panel--portal"
      role="dialog"
      aria-label="Özel renk seçici"
      style={stil}
    >
      <div
        ref={tekerRef}
        className="ap-ozel-renk-teker"
        style={{ width: TEKER_CAPI, height: TEKER_CAPI }}
        onPointerDown={tekerSurukle}
        onPointerMove={pointerHareket}
      >
        <div className="ap-ozel-renk-teker-halka" aria-hidden />
        <div
          ref={slRef}
          className="ap-ozel-renk-sl"
          style={{
            width: TEKER_IC * 2 - 4,
            height: TEKER_IC * 2 - 4,
            backgroundColor: `hsl(${hsv.h} 100% 50%)`,
          }}
          onPointerDown={slSurukle}
          onPointerMove={pointerHareket}
        >
          <span
            className="ap-ozel-renk-imlec ap-ozel-renk-imlec--sl"
            style={{
              left: `${slKonum.x * 100}%`,
              top: `${slKonum.y * 100}%`,
            }}
          />
        </div>
        <span
          className="ap-ozel-renk-imlec ap-ozel-renk-imlec--teker"
          style={{
            left: tekerX,
            top: tekerY,
            backgroundColor: `hsl(${hsv.h} 100% 50%)`,
          }}
          aria-hidden
        />
      </div>

      <div className="ap-ozel-renk-alt">
        <span className="ap-ozel-renk-onizleme" style={{ backgroundColor: guncelHex }} aria-hidden />
        <input
          type="text"
          value={hexMetin}
          onChange={(e) => setHexMetin(e.target.value.toUpperCase())}
          onBlur={hexUygula}
          onKeyDown={(e) => {
            if (e.key === 'Enter') hexUygula();
          }}
          className="ap-ozel-renk-hex"
          aria-label="HEX renk kodu"
          spellCheck={false}
        />
      </div>
    </div>,
    portalHedef
  );
}
