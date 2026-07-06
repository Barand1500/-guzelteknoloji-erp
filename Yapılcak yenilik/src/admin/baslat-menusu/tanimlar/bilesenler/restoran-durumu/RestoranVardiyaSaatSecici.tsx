import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { formInputSinifi } from '@/formlar/FormAlani';

interface RestoranVardiyaSaatSeciciProps {
  baslik: string;
  ikon: string;
  deger: string;
  onDegistir: (deger: string) => void;
}

type SecimModu = 'saat' | 'dakika';

const PANEL_GENISLIK = 280;
const KENAR_BOSLUK = 8;

function saatParcala(deger: string) {
  const [h, m] = deger.split(':').map((x) => Number(x));
  return {
    saat: Number.isFinite(h) ? Math.min(23, Math.max(0, h)) : 0,
    dakika: Number.isFinite(m) ? Math.min(59, Math.max(0, m)) : 0,
  };
}

function saatBirlestir(saat: number, dakika: number) {
  return `${String(saat).padStart(2, '0')}:${String(dakika).padStart(2, '0')}`;
}

function saatGosterim(deger: string) {
  const { saat, dakika } = saatParcala(deger);
  return saatBirlestir(saat, dakika);
}

function metindenSaat(metin: string, mevcutDakika: number): { saat: number; dakika: number } | null {
  const s = metin.trim();
  if (!s) return null;

  if (/^\d{1,2}:\d{1,2}$/.test(s)) {
    const [h, m] = s.split(':').map(Number);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return { saat: h, dakika: m };
    return null;
  }

  if (/^\d{4}$/.test(s)) {
    const h = Number(s.slice(0, 2));
    const m = Number(s.slice(2, 4));
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return { saat: h, dakika: m };
    return null;
  }

  if (/^\d{1,2}$/.test(s)) {
    const h = Number(s);
    if (h >= 0 && h <= 23) return { saat: h, dakika: mevcutDakika };
  }

  return null;
}

function portalHedefiBul(): HTMLElement {
  return (document.querySelector('.admin-panel') as HTMLElement | null) ?? document.body;
}

function panelKonumuHesapla(btn: HTMLButtonElement) {
  const rect = btn.getBoundingClientRect();
  const genislik = Math.min(window.innerWidth - KENAR_BOSLUK * 2, PANEL_GENISLIK);
  let left = rect.left;
  if (left + genislik > window.innerWidth - KENAR_BOSLUK) {
    left = window.innerWidth - genislik - KENAR_BOSLUK;
  }
  if (left < KENAR_BOSLUK) left = KENAR_BOSLUK;

  const tahminiYukseklik = 380;
  const altAlan = window.innerHeight - rect.bottom - 6 - KENAR_BOSLUK;
  const ustAlan = rect.top - 6 - KENAR_BOSLUK;

  if (altAlan >= tahminiYukseklik || altAlan >= ustAlan) {
    return { top: rect.bottom + 6, left, width: genislik };
  }

  return { top: Math.max(KENAR_BOSLUK, rect.top - tahminiYukseklik - 6), left, width: genislik };
}

export function RestoranVardiyaSaatSecici({ baslik, ikon, deger, onDegistir }: RestoranVardiyaSaatSeciciProps) {
  const panelId = useId();
  const ikonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const odaktaRef = useRef(false);

  const [acik, setAcik] = useState(false);
  const [mod, setMod] = useState<SecimModu>('saat');
  const [{ saat, dakika }, setTaslak] = useState(() => saatParcala(deger));
  const [metin, setMetin] = useState(() => saatGosterim(deger));
  const [panelStil, setPanelStil] = useState<CSSProperties>({});

  useEffect(() => {
    if (!odaktaRef.current) setMetin(saatGosterim(deger));
  }, [deger]);

  const konumGuncelle = useCallback(() => {
    if (!ikonRef.current) return;
    const { top, left, width } = panelKonumuHesapla(ikonRef.current);
    setPanelStil({
      position: 'fixed',
      top,
      left,
      width,
      zIndex: 10050,
    });
  }, []);

  useLayoutEffect(() => {
    if (!acik) return;
    setTaslak(saatParcala(deger));
    setMod('saat');
    konumGuncelle();
  }, [acik, deger, konumGuncelle]);

  const panelKapat = useCallback(
    (kaydet: boolean) => {
      if (kaydet) onDegistir(saatBirlestir(saat, dakika));
      setAcik(false);
    },
    [dakika, onDegistir, saat]
  );

  useEffect(() => {
    if (!acik) return;

    function disariTik(e: MouseEvent) {
      const hedef = e.target as Node;
      if (ikonRef.current?.contains(hedef) || panelRef.current?.contains(hedef)) return;
      panelKapat(true);
    }

    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') panelKapat(true);
    }

    function yenidenKonumla() {
      konumGuncelle();
    }

    document.addEventListener('mousedown', disariTik);
    document.addEventListener('keydown', esc);
    window.addEventListener('resize', yenidenKonumla);
    window.addEventListener('scroll', yenidenKonumla, true);

    return () => {
      document.removeEventListener('mousedown', disariTik);
      document.removeEventListener('keydown', esc);
      window.removeEventListener('resize', yenidenKonumla);
      window.removeEventListener('scroll', yenidenKonumla, true);
    };
  }, [acik, konumGuncelle, panelKapat]);

  const saatAcisi = ((saat % 12) + dakika / 60) * 30 - 90;
  const dakikaAcisi = dakika * 6 - 90;

  function kadranTik(e: React.MouseEvent<SVGSVGElement>) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    let aci = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (aci < 0) aci += 360;

    if (mod === 'saat') {
      let h12 = Math.round(aci / 30) % 12;
      if (h12 === 0) h12 = 12;
      const yeniSaat =
        saat >= 12 ? (h12 === 12 ? 12 : h12 + 12) : h12 === 12 ? 0 : h12;
      setTaslak({ saat: yeniSaat, dakika });
      setMod('dakika');
      return;
    }

    const yeniDakika = Math.round(aci / 6) % 60;
    setTaslak({ saat, dakika: yeniDakika });
  }

  function metinDegistir(v: string) {
    const temiz = v.replace(/[^\d:]/g, '').slice(0, 5);
    setMetin(temiz);
  }

  function metinOnayla() {
    odaktaRef.current = false;
    const sonuc = metindenSaat(metin, saatParcala(deger).dakika);
    if (sonuc) {
      const normalized = saatBirlestir(sonuc.saat, sonuc.dakika);
      setMetin(normalized);
      onDegistir(normalized);
      return;
    }
    setMetin(saatGosterim(deger));
  }

  function ikonTikla() {
    if (acik) {
      panelKapat(true);
      return;
    }
    setAcik(true);
  }

  const saatEtiketleri = Array.from({ length: 12 }, (_, i) => {
    const n = i === 0 ? 12 : i;
    const aci = n * 30 - 90;
    const r = 78;
    const x = 100 + r * Math.cos((aci * Math.PI) / 180);
    const y = 100 + r * Math.sin((aci * Math.PI) / 180);
    return { n, x, y };
  });

  const panelIcerik = (
    <div
      id={panelId}
      ref={panelRef}
      className="ap-tanimlar-vardiya-saat-panel ap-tanimlar-vardiya-saat-panel-portal"
      style={panelStil}
      role="dialog"
      aria-label={`${baslik} saati`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <header className="ap-tanimlar-vardiya-saat-panel-baslik">
        <span aria-hidden>{ikon}</span>
        <div>
          <strong>{baslik}</strong>
          <span>Saat seçimi</span>
        </div>
      </header>

      <p className="ap-tanimlar-vardiya-saat-dijital">{saatBirlestir(saat, dakika)}</p>

      <div className="ap-tanimlar-vardiya-saat-mod">
        <button
          type="button"
          className={mod === 'saat' ? 'ap-tanimlar-vardiya-saat-mod-aktif' : ''}
          onClick={() => setMod('saat')}
        >
          Saat (akrep)
        </button>
        <button
          type="button"
          className={mod === 'dakika' ? 'ap-tanimlar-vardiya-saat-mod-aktif' : ''}
          onClick={() => setMod('dakika')}
        >
          Dakika (yelkovan)
        </button>
      </div>

      <svg
        className="ap-tanimlar-vardiya-saat-kadran"
        viewBox="0 0 200 200"
        onClick={kadranTik}
        role="img"
        aria-label="Saat kadranı"
      >
        <circle cx="100" cy="100" r="92" className="ap-tanimlar-vardiya-saat-cerceve" />
        <circle cx="100" cy="100" r="86" className="ap-tanimlar-vardiya-saat-yuz" />
        {Array.from({ length: 60 }, (_, i) => {
          if (i % 5 !== 0) return null;
          const aci = i * 6 - 90;
          const r1 = i % 15 === 0 ? 72 : 78;
          const x1 = 100 + r1 * Math.cos((aci * Math.PI) / 180);
          const y1 = 100 + r1 * Math.sin((aci * Math.PI) / 180);
          const x2 = 100 + 86 * Math.cos((aci * Math.PI) / 180);
          const y2 = 100 + 86 * Math.sin((aci * Math.PI) / 180);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="ap-tanimlar-vardiya-saat-tik" />
          );
        })}
        {saatEtiketleri.map(({ n, x, y }) => (
          <text
            key={n}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="ap-tanimlar-vardiya-saat-rakam"
          >
            {n}
          </text>
        ))}
        <line
          x1="100"
          y1="100"
          x2={100 + 42 * Math.cos((saatAcisi * Math.PI) / 180)}
          y2={100 + 42 * Math.sin((saatAcisi * Math.PI) / 180)}
          className="ap-tanimlar-vardiya-saat-akrep"
        />
        <line
          x1="100"
          y1="100"
          x2={100 + 58 * Math.cos((dakikaAcisi * Math.PI) / 180)}
          y2={100 + 58 * Math.sin((dakikaAcisi * Math.PI) / 180)}
          className="ap-tanimlar-vardiya-saat-yelkovan"
        />
        <circle cx="100" cy="100" r="4" className="ap-tanimlar-vardiya-saat-merkez" />
      </svg>

      <p className="ap-tanimlar-vardiya-saat-ipucu">
        Kadrana tıklayın: önce saat, sonra dakika seçilir. İbreler otomatik güncellenir.
      </p>

      <button
        type="button"
        className="ap-tanimlar-tablo-btn ap-tanimlar-tablo-btn-birincil ap-tanimlar-vardiya-saat-tamam"
        onClick={() => panelKapat(true)}
      >
        Tamam
      </button>
    </div>
  );

  return (
    <div className="ap-tanimlar-vardiya-saat-wrap">
      <div className="ap-tanimlar-vardiya-saat-satir">
        <input
          type="text"
          inputMode="numeric"
          className={`${formInputSinifi} ap-tanimlar-vardiya-saat-girdi`}
          value={metin}
          onChange={(e) => metinDegistir(e.target.value)}
          onFocus={() => {
            odaktaRef.current = true;
          }}
          onBlur={metinOnayla}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          placeholder="08:00"
          aria-label={`${baslik} saati`}
        />
        <button
          ref={ikonRef}
          type="button"
          className="ap-tanimlar-vardiya-saat-ikon-tus"
          onClick={ikonTikla}
          aria-expanded={acik}
          aria-controls={panelId}
          title="Saat seçici"
        >
          <span aria-hidden>🕐</span>
        </button>
      </div>

      {acik && createPortal(panelIcerik, portalHedefiBul())}
    </div>
  );
}
