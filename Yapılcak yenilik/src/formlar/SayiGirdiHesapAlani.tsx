import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formInputSinifi } from '@/formlar/FormAlani';
import { MinimalHesapMakinesi } from '@/formlar/MinimalHesapMakinesi';

interface SayiGirdiHesapAlaniProps {
  deger: string;
  onDegistir: (deger: string) => void;
  placeholder?: string;
  onEk?: string;
}

const HESAP_GENISLIK = 236;
const HESAP_YUKSEKLIK = 248;
const KENAR_BOSLUK = 8;
const AKSiyON_CUBUGU_PAY = 76;

function adminTemaOku(): 'koyu' | 'acik' {
  const tema = document.querySelector('.admin-panel')?.getAttribute('data-tema');
  return tema === 'acik' ? 'acik' : 'koyu';
}

function konumHesapla(tus: HTMLButtonElement, kutu: HTMLDivElement) {
  const tusRect = tus.getBoundingClientRect();
  const kutuRect = kutu.getBoundingClientRect();

  // Sağ kenar ikon/kutu ile hizalı, sabit genişlik
  let left = Math.max(kutuRect.right, tusRect.right) - HESAP_GENISLIK;
  if (left < KENAR_BOSLUK) left = KENAR_BOSLUK;
  if (left + HESAP_GENISLIK > window.innerWidth - KENAR_BOSLUK) {
    left = window.innerWidth - HESAP_GENISLIK - KENAR_BOSLUK;
  }

  const altAlan = window.innerHeight - tusRect.bottom - AKSiyON_CUBUGU_PAY;
  let top = tusRect.bottom + 6;
  let yukari = false;

  if (altAlan < HESAP_YUKSEKLIK) {
    top = Math.max(KENAR_BOSLUK, tusRect.top - HESAP_YUKSEKLIK - 6);
    yukari = true;
  }

  return { top, left, yukari };
}

export function SayiGirdiHesapAlani({ deger, onDegistir, placeholder, onEk }: SayiGirdiHesapAlaniProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const kutuRef = useRef<HTMLDivElement>(null);
  const tusRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [hesapAcik, setHesapAcik] = useState(false);
  const [konum, setKonum] = useState({ top: 0, left: 0, yukari: false });
  const [tema, setTema] = useState<'koyu' | 'acik'>(() => adminTemaOku());

  const konumGuncelle = () => {
    if (!tusRef.current || !kutuRef.current) return;
    setKonum(konumHesapla(tusRef.current, kutuRef.current));
  };

  useLayoutEffect(() => {
    if (!hesapAcik) return;
    setTema(adminTemaOku());
    konumGuncelle();
    window.addEventListener('resize', konumGuncelle);
    window.addEventListener('scroll', konumGuncelle, true);
    return () => {
      window.removeEventListener('resize', konumGuncelle);
      window.removeEventListener('scroll', konumGuncelle, true);
    };
  }, [hesapAcik]);

  useEffect(() => {
    if (!hesapAcik) return;

    const disTikla = (e: MouseEvent) => {
      const hedef = e.target as Node;
      if (wrapRef.current?.contains(hedef) || panelRef.current?.contains(hedef)) return;
      setHesapAcik(false);
    };

    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHesapAcik(false);
    };

    document.addEventListener('mousedown', disTikla);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', disTikla);
      document.removeEventListener('keydown', esc);
    };
  }, [hesapAcik]);

  const uygula = (yeni: string) => {
    onDegistir(yeni);
    setHesapAcik(false);
  };

  const hesapPanel =
    hesapAcik &&
    createPortal(
      <div
        ref={panelRef}
        className={`ap-mini-hesap-panel ap-mini-hesap-panel-portal ap-mini-hesap-tema-${tema}${konum.yukari ? ' ap-mini-hesap-panel-yukari' : ''}`}
        style={{ top: konum.top, left: konum.left }}
        role="dialog"
        aria-label="Hesap makinesi"
      >
        <MinimalHesapMakinesi baslangicDeger={deger} onUygula={uygula} />
      </div>,
      document.body
    );

  return (
    <div ref={wrapRef} className="ap-sayi-girdi-hesap-wrap">
      <div
        ref={kutuRef}
        className={`ap-sayi-girdi-hesap-kutu${onEk ? ' ap-sayi-girdi-hesap-kutu-on-ekli' : ''}${hesapAcik ? ' ap-sayi-girdi-hesap-kutu-hesap-acik' : ''}`}
      >
        {onEk ? (
          <span className="ap-sayi-girdi-hesap-on-ek" aria-hidden>
            {onEk}
          </span>
        ) : null}
        <input
          type="text"
          inputMode="decimal"
          className={`${formInputSinifi} ap-sayi-girdi-hesap-girdi`}
          value={deger}
          onChange={(e) => onDegistir(e.target.value)}
          placeholder={placeholder}
        />
        <button
          ref={tusRef}
          type="button"
          className="ap-sayi-girdi-hesap-tus"
          onClick={() => setHesapAcik((a) => !a)}
          aria-expanded={hesapAcik}
          aria-haspopup="dialog"
          title="Hesap makinesi"
        >
          <span className="ap-sayi-girdi-hesap-ikon" aria-hidden>
            🧮
          </span>
        </button>
      </div>

      {hesapPanel}
    </div>
  );
}
