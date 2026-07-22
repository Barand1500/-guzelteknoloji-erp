import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { epostaOnerileri, yalnizcaRakam } from '../cariFormatYardimci';
import { sekmeGecisTiklamasiMi, sekmePortalHedefi, useSekmeDegisinceYenile } from '@/araclar/sekmePortal';
import { CariOutlinedEtiket } from './CariOutlinedGirdi';

const KENAR_BOSLUK = 8;

type DogrulaAsama = 'alan' | 'kod';

function listeKonumuHesapla(anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const genislik = rect.width;
  let left = rect.left;
  if (left + genislik > window.innerWidth - KENAR_BOSLUK) left = window.innerWidth - genislik - KENAR_BOSLUK;
  if (left < KENAR_BOSLUK) left = KENAR_BOSLUK;
  const ust = rect.bottom + 4;
  const maxHeight = Math.max(120, window.innerHeight - ust - KENAR_BOSLUK);
  return { top: ust, left, width: genislik, maxHeight };
}

export function CariOutlinedEposta({
  deger,
  onChange,
  disabled = false,
  dogrulaAktif = false,
}: {
  deger: string;
  onChange: (deger: string) => void;
  disabled?: boolean;
  /** Doğrula butonu ve kod girişi akışı */
  dogrulaAktif?: boolean;
}) {
  const inputId = useId();
  const listeId = useId();
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);
  const [focused, setFocused] = useState(false);
  const [acik, setAcik] = useState(false);
  const [listeStil, setListeStil] = useState<CSSProperties>({});
  const [asama, setAsama] = useState<DogrulaAsama>('alan');
  const [kod, setKod] = useState('');
  const [dogrulandi, setDogrulandi] = useState(false);
  const [gecis, setGecis] = useState(false);
  const [basariAnim, setBasariAnim] = useState(false);
  const oncekiDeger = useRef(deger);

  const epostaGirildi = deger.trim().length > 0;
  const dogrulaButonuGoster =
    dogrulaAktif && !disabled && (asama === 'kod' || dogrulandi || epostaGirildi);

  const oneriler = useMemo(() => (asama === 'alan' ? epostaOnerileri(deger) : []), [deger, asama]);
  const oneriGoster = asama === 'alan' && acik && focused && oneriler.length > 0 && !disabled;

  const konumGuncelle = useCallback(() => {
    if (!kapsayiciRef.current) return;
    const { top, left, width, maxHeight } = listeKonumuHesapla(kapsayiciRef.current);
    setListeStil({ position: 'fixed', top, left, width, maxHeight, zIndex: 10050 });
  }, []);

  const sekmeSonrasi = useCallback(() => {
    if (!acik) return;
    requestAnimationFrame(() => konumGuncelle());
  }, [acik, konumGuncelle]);
  useSekmeDegisinceYenile(sekmeSonrasi);

  useLayoutEffect(() => {
    if (!oneriGoster) return;
    konumGuncelle();
    window.addEventListener('resize', konumGuncelle);
    window.addEventListener('scroll', konumGuncelle, true);
    return () => {
      window.removeEventListener('resize', konumGuncelle);
      window.removeEventListener('scroll', konumGuncelle, true);
    };
  }, [oneriGoster, konumGuncelle, oneriler.length]);

  useEffect(() => {
    if (!acik) return;
    function disTik(e: MouseEvent) {
      if (sekmeGecisTiklamasiMi(e.target)) return;
      const hedef = e.target as Node;
      if (kapsayiciRef.current?.contains(hedef) || listeRef.current?.contains(hedef)) return;
      setAcik(false);
    }
    document.addEventListener('mousedown', disTik);
    return () => document.removeEventListener('mousedown', disTik);
  }, [acik]);

  useEffect(() => {
    if (!dogrulaAktif) return;
    if (oncekiDeger.current !== deger && asama === 'alan') {
      setDogrulandi(false);
      setBasariAnim(false);
    }
    oncekiDeger.current = deger;
  }, [deger, dogrulaAktif, asama]);

  useEffect(() => {
    if (asama === 'kod' && !disabled) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 180);
      return () => window.clearTimeout(t);
    }
  }, [asama, disabled]);

  const sec = (eposta: string) => {
    onChange(eposta);
    setAcik(false);
  };

  const etiketMetin = asama === 'kod' ? 'Doğrulama kodunu giriniz' : 'E-Posta';
  const gosterilenDeger = asama === 'kod' ? kod : deger;

  const animasyonluGecis = (sonraki: DogrulaAsama, sonra?: () => void) => {
    setGecis(true);
    window.setTimeout(() => {
      setAsama(sonraki);
      sonra?.();
      window.setTimeout(() => setGecis(false), 40);
    }, 160);
  };

  const koduDogrula = () => {
    const temiz = yalnizcaRakam(kod, 6);
    if (temiz.length < 4) {
      inputRef.current?.focus();
      return;
    }
    setDogrulandi(true);
    setBasariAnim(true);
    setKod('');
    setAcik(false);
    animasyonluGecis('alan', () => {
      window.setTimeout(() => setBasariAnim(false), 900);
    });
  };

  const dogrulaTikla = () => {
    if (disabled || !dogrulaAktif) return;
    if (dogrulandi && asama === 'alan') return;

    if (asama === 'alan') {
      if (!epostaGirildi) {
        inputRef.current?.focus();
        return;
      }
      setKod('');
      setAcik(false);
      animasyonluGecis('kod');
      return;
    }

    koduDogrula();
  };

  return (
    <div
      ref={kapsayiciRef}
      className={[
        'cari-outlined-field',
        'cari-eposta-alan',
        focused ? 'cari-outlined-field--focus' : '',
        disabled ? 'cari-outlined-field--pasif' : '',
        dogrulaAktif ? 'cari-dogrula-alan' : '',
        asama === 'kod' ? 'cari-dogrula-alan--kod' : '',
        dogrulandi ? 'cari-dogrula-alan--dogrulandi' : '',
        gecis ? 'cari-dogrula-alan--gecis' : '',
        basariAnim ? 'cari-dogrula-alan--basari' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CariOutlinedEtiket etiket={etiketMetin} htmlFor={inputId} />
      <div className="cari-outlined-cerceve">
        <input
          ref={inputRef}
          id={inputId}
          type={asama === 'kod' ? 'text' : 'email'}
          className="cari-outlined-input cari-dogrula-alan-girdi"
          value={gosterilenDeger}
          disabled={disabled}
          autoComplete={asama === 'kod' ? 'one-time-code' : 'off'}
          inputMode={asama === 'kod' ? 'numeric' : 'email'}
          maxLength={asama === 'kod' ? 6 : 120}
          onFocus={() => {
            setFocused(true);
            if (asama === 'alan') setAcik(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder={
            focused
              ? asama === 'kod'
                ? '····'
                : 'ornek@mail.com'
              : undefined
          }
          onChange={(e) => {
            if (asama === 'kod') {
              setKod(yalnizcaRakam(e.target.value, 6));
              return;
            }
            onChange(e.target.value.slice(0, 120));
            setAcik(true);
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' || !dogrulaAktif || disabled) return;
            e.preventDefault();
            if (asama === 'kod') koduDogrula();
            else if (dogrulaButonuGoster) dogrulaTikla();
          }}
        />
        {dogrulaButonuGoster ? (
          <div className="cari-outlined-sonek">
            <button
              type="button"
              className={`cari-adres-cek${dogrulandi && asama === 'alan' ? ' cari-adres-cek--basarili' : ''}`}
              onClick={dogrulaTikla}
              title={
                dogrulandi && asama === 'alan'
                  ? 'E-posta doğrulandı'
                  : asama === 'kod'
                    ? 'Kodu doğrula'
                    : 'E-posta doğrulama kodu gönder'
              }
              disabled={dogrulandi && asama === 'alan'}
            >
              {dogrulandi && asama === 'alan' ? 'Doğrulandı' : 'Doğrula'}
            </button>
          </div>
        ) : null}
      </div>

      {oneriGoster
        ? createPortal(
            <ul
              ref={listeRef}
              id={listeId}
              className="ap-form-acilir-secim-liste ap-form-arama-secim-liste"
              role="listbox"
              aria-label="E-posta önerileri"
              style={listeStil}
            >
              {oneriler.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    role="option"
                    className="ap-form-acilir-secim-oge"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => sec(o)}
                  >
                    {o}
                  </button>
                </li>
              ))}
            </ul>,
            sekmePortalHedefi(kapsayiciRef.current)
          )
        : null}
    </div>
  );
}
