import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { telefonFormatla, yalnizcaRakam } from '../cariFormatYardimci';
import {
  telefonDegeriniParcala,
  telefonKayitDegeri,
  telefonPlaceholder,
  telefonUlkeAra,
  telefonUlkeBul,
  ulusalRakamlariDuzenle,
  ulusalTelefonFormatla,
  type TelefonUlke,
  VARSAYILAN_TELEFON_ULKE,
} from '../telefonUlkeKodlari';
import { CariOutlinedEtiket } from './CariOutlinedGirdi';

type DogrulaAsama = 'alan' | 'kod';

function portalHedefiBul(): HTMLElement {
  return (document.querySelector('.admin-panel') as HTMLElement | null) ?? document.body;
}

export function CariOutlinedTelefon({
  deger,
  onChange,
  disabled = false,
  etiket = 'Telefon',
  dogrulaAktif = false,
  ulkeKoduGoster = true,
  gsmMi = false,
}: {
  deger: string;
  onChange: (deger: string) => void;
  disabled?: boolean;
  etiket?: string;
  /** Doğrula butonu ve kod girişi akışı */
  dogrulaAktif?: boolean;
  /** false ise ülke kodu seçici gösterilmez */
  ulkeKoduGoster?: boolean;
  /** GSM: TR'de 5 ile başlamalı */
  gsmMi?: boolean;
}) {
  const inputId = useId();
  const listeId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const onEkRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [asama, setAsama] = useState<DogrulaAsama>('alan');
  const [kod, setKod] = useState('');
  const [dogrulananAnahtar, setDogrulananAnahtar] = useState<string | null>(null);
  const [gecis, setGecis] = useState(false);
  const [basariAnim, setBasariAnim] = useState(false);
  const sonYazilanRef = useRef(deger);

  const parcali = telefonDegeriniParcala(deger);
  const [ulke, setUlke] = useState<TelefonUlke>(
    ulkeKoduGoster ? parcali.ulke : VARSAYILAN_TELEFON_ULKE
  );
  const [ulusal, setUlusal] = useState(
    ulkeKoduGoster ? parcali.ulusal : telefonFormatla(yalnizcaRakam(deger, 11))
  );
  const [listeAcik, setListeAcik] = useState(false);
  const [arama, setArama] = useState('');
  const [listeStil, setListeStil] = useState<CSSProperties>({});

  const ulusalRakam = yalnizcaRakam(ulkeKoduGoster ? ulusal : deger);
  const guncelAnahtar = ulkeKoduGoster ? `${ulke.dial}|${ulusalRakam}` : ulusalRakam;
  const dogrulandi =
    dogrulananAnahtar !== null && dogrulananAnahtar === guncelAnahtar && ulusalRakam.length > 0;
  const rakamSayisi = ulusalRakam.length;
  const dogrulaButonuGoster =
    dogrulaAktif && !disabled && (asama === 'kod' || dogrulandi || rakamSayisi > 0);

  useEffect(() => {
    if (deger === sonYazilanRef.current) return;
    if (ulkeKoduGoster) {
      const p = telefonDegeriniParcala(deger);
      setUlke(p.ulke);
      setUlusal(p.ulusal);
    } else {
      setUlusal(telefonFormatla(yalnizcaRakam(deger, 11)));
    }
    sonYazilanRef.current = deger;
  }, [deger, ulkeKoduGoster]);

  useEffect(() => {
    if (dogrulandi || !basariAnim) return;
    setBasariAnim(false);
  }, [dogrulandi, basariAnim]);

  useEffect(() => {
    if (asama === 'kod' && !disabled) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 180);
      return () => window.clearTimeout(t);
    }
  }, [asama, disabled]);

  useLayoutEffect(() => {
    if (!listeAcik || !onEkRef.current) return;
    const rect = onEkRef.current.getBoundingClientRect();
    const genislik = Math.max(220, rect.width + 40);
    let left = rect.left;
    if (left + genislik > window.innerWidth - 8) left = window.innerWidth - genislik - 8;
    if (left < 8) left = 8;
    let top = rect.bottom + 4;
    const maxH = 260;
    if (top + maxH > window.innerHeight - 8 && rect.top > maxH + 12) {
      top = rect.top - maxH - 4;
    }
    setListeStil({
      position: 'fixed',
      top,
      left,
      width: genislik,
      maxHeight: maxH,
      zIndex: 12050,
    });
  }, [listeAcik]);

  useEffect(() => {
    if (!listeAcik) return;
    function disTik(e: MouseEvent) {
      const hedef = e.target as Node;
      if (onEkRef.current?.contains(hedef) || panelRef.current?.contains(hedef)) return;
      setListeAcik(false);
      setArama('');
    }
    document.addEventListener('mousedown', disTik);
    return () => document.removeEventListener('mousedown', disTik);
  }, [listeAcik]);

  const etiketMetin = asama === 'kod' ? 'Doğrulama kodunu giriniz' : etiket;
  const gosterilenDeger = asama === 'kod' ? kod : ulkeKoduGoster ? ulusal : deger;
  const filtreliUlkeler = telefonUlkeAra(arama);

  const ulusalYaz = (yeniUlusal: string, hedefUlke: TelefonUlke = ulke) => {
    const duzenli = ulusalRakamlariDuzenle(yeniUlusal, hedefUlke, {
      ulkeKoduVar: ulkeKoduGoster,
      gsm: gsmMi,
    });
    if (duzenli === null) return;

    if (!ulkeKoduGoster) {
      const kayit = telefonFormatla(duzenli);
      sonYazilanRef.current = kayit;
      onChange(kayit);
      return;
    }
    const bicimli = ulusalTelefonFormatla(duzenli, hedefUlke);
    setUlusal(bicimli);
    const kayit = telefonKayitDegeri(hedefUlke, bicimli);
    sonYazilanRef.current = kayit;
    onChange(kayit);
  };

  const ulkeSec = (secilen: TelefonUlke) => {
    setUlke(secilen);
    setListeAcik(false);
    setArama('');
    const rakamlar = ulusalRakamlariDuzenle(ulusal, secilen, {
      ulkeKoduVar: ulkeKoduGoster,
      gsm: gsmMi,
    });
    if (rakamlar !== null) ulusalYaz(rakamlar, secilen);
    else {
      setUlusal('');
      sonYazilanRef.current = '';
      onChange('');
    }
    inputRef.current?.focus();
  };

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
    setDogrulananAnahtar(guncelAnahtar);
    setBasariAnim(true);
    setKod('');
    animasyonluGecis('alan', () => {
      window.setTimeout(() => setBasariAnim(false), 900);
    });
  };

  const dogrulaTikla = () => {
    if (disabled || !dogrulaAktif) return;
    if (dogrulandi && asama === 'alan') return;

    if (asama === 'alan') {
      if (rakamSayisi < 7) {
        inputRef.current?.focus();
        return;
      }
      setKod('');
      animasyonluGecis('kod');
      return;
    }

    koduDogrula();
  };

  return (
    <div
      className={[
        'cari-outlined-field',
        focused || listeAcik ? 'cari-outlined-field--focus' : '',
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
      <div className={`cari-outlined-cerceve${ulkeKoduGoster ? ' cari-telefon-cerceve' : ''}`}>
        {ulkeKoduGoster && asama === 'alan' ? (
          <button
            ref={onEkRef}
            type="button"
            className="cari-telefon-ulke"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={listeAcik}
            aria-controls={listeAcik ? listeId : undefined}
            title={`${ulke.ad} (+${ulke.dial})`}
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) return;
              setListeAcik((a) => !a);
            }}
          >
            <span className="cari-telefon-ulke-bayrak" aria-hidden>
              {ulke.bayrak}
            </span>
            <span className="cari-telefon-ulke-kod">+{ulke.dial}</span>
            <span className="cari-telefon-ulke-ok" aria-hidden>
              ▾
            </span>
          </button>
        ) : null}

        <input
          ref={inputRef}
          id={inputId}
          className="cari-outlined-input cari-dogrula-alan-girdi"
          value={gosterilenDeger}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={asama === 'kod' ? 'one-time-code' : 'tel-national'}
          maxLength={asama === 'kod' ? 6 : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            focused
              ? asama === 'kod'
                ? '····'
                : telefonPlaceholder(ulke, { gsm: gsmMi })
              : undefined
          }
          onChange={(e) => {
            if (asama === 'kod') {
              setKod(yalnizcaRakam(e.target.value, 6));
              return;
            }
            ulusalYaz(e.target.value);
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
                  ? 'GSM doğrulandı'
                  : asama === 'kod'
                    ? 'Kodu doğrula'
                    : 'GSM doğrulama kodu gönder'
              }
              disabled={dogrulandi && asama === 'alan'}
            >
              {dogrulandi && asama === 'alan' ? 'Doğrulandı' : 'Doğrula'}
            </button>
          </div>
        ) : null}
      </div>

      {ulkeKoduGoster && listeAcik
        ? createPortal(
            <div ref={panelRef} className="cari-telefon-ulke-panel" style={listeStil} role="presentation">
              <input
                type="search"
                className="cari-telefon-ulke-ara"
                value={arama}
                placeholder="Ülke veya kod ara…"
                autoFocus
                onChange={(e) => setArama(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setListeAcik(false);
                    setArama('');
                  }
                }}
              />
              <ul id={listeId} className="cari-telefon-ulke-liste" role="listbox">
                {filtreliUlkeler.length === 0 ? (
                  <li className="cari-telefon-ulke-bos">Ülke bulunamadı</li>
                ) : (
                  filtreliUlkeler.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={u.id === ulke.id}
                        className={`cari-telefon-ulke-oge${u.id === ulke.id ? ' cari-telefon-ulke-oge--secili' : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => ulkeSec(telefonUlkeBul(u.id))}
                      >
                        <span className="cari-telefon-ulke-oge-bayrak" aria-hidden>
                          {u.bayrak}
                        </span>
                        <span className="cari-telefon-ulke-oge-ad">{u.ad}</span>
                        <span className="cari-telefon-ulke-oge-dial">+{u.dial}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>,
            portalHedefiBul()
          )
        : null}
    </div>
  );
}
