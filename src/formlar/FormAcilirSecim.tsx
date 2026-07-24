import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { formSelectSinifi } from '@/formlar/FormAlani';
import {
  sekmeGecisTiklamasiMi,
  sekmePortalHedefi,
  useSekmeDegisinceYenile,
} from '@/araclar/sekmePortal';

export interface FormAcilirSecimSecenek {
  value: string;
  label: string;
  /** Opsiyonel küçük ikon / logo */
  ikonUrl?: string;
}

export interface FormAcilirSecimProps {
  value?: string;
  onChange?: (value: string) => void;
  /** Çoklu seçim: seçili değerler */
  values?: readonly string[];
  onChangeCoklu?: (values: string[]) => void;
  /** true ise listede checkbox ile birden fazla seçim */
  coklu?: boolean;
  secenekler: readonly FormAcilirSecimSecenek[];
  className?: string;
  listeSinifi?: string;
  listeMinGenislik?: number;
  listeAnchor?: 'self' | 'cerceve';
  /** Tetikleyici ile liste arası dikey boşluk (px). 0 = bitişik */
  listeDikeyBosluk?: number;
  /** true ise liste portal yerine tetikleyicinin altında inline render edilir */
  listeInline?: boolean;
  /** asagi: tetikleyicinin altina; yukari: tetikleyicinin ustune acilir */
  listeYonu?: 'asagi' | 'yukari';
  /** Kapalıyken tetikleyicide gösterilecek metin (liste etiketinden farklı olabilir) */
  tusMetin?: string;
  /** Boş seçimde tetikleyici metni (varsayılan: seçiniz) */
  bosEtiket?: string;
  /** Açık listede yazarak filtreleme */
  aranabilir?: boolean;
  /** Arama kutusu placeholder (varsayılan: bosEtiket) */
  aramaPlaceholder?: string;
  /** Liste max yüksekliği (px); aşarsa scroll */
  listeMaxYukseklik?: number;
  disabled?: boolean;
  'aria-label'?: string;
}

const KENAR_BOSLUK = 8;

function acilirListeGorunurKaydir(
  trigger: HTMLElement,
  liste: HTMLElement,
  kenarBosluk = 16,
  yon: 'asagi' | 'yukari' = 'asagi'
) {
  let scrollParent: HTMLElement | null = trigger.parentElement;
  while (scrollParent) {
    const { overflowY } = getComputedStyle(scrollParent);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      scrollParent.scrollHeight > scrollParent.clientHeight + 1
    ) {
      break;
    }
    scrollParent = scrollParent.parentElement;
  }

  const listeRect = liste.getBoundingClientRect();

  if (yon === 'yukari') {
    const ustAsimi = KENAR_BOSLUK - listeRect.top;
    if (ustAsimi <= 0) return;
    if (scrollParent) {
      scrollParent.scrollBy({ top: -ustAsimi, behavior: 'smooth' });
      return;
    }
    window.scrollBy({ top: -ustAsimi, behavior: 'smooth' });
    return;
  }

  if (scrollParent) {
    const containerRect = scrollParent.getBoundingClientRect();
    const delta = listeRect.bottom - containerRect.bottom + kenarBosluk;
    if (delta > 0) scrollParent.scrollBy({ top: delta, behavior: 'smooth' });
    return;
  }

  const delta = listeRect.bottom - window.innerHeight + kenarBosluk;
  if (delta > 0) window.scrollBy({ top: delta, behavior: 'smooth' });
}

function anchorBul(trigger: HTMLElement, listeAnchor: 'self' | 'cerceve'): HTMLElement {
  if (listeAnchor === 'self') {
    return (
      (trigger.closest('.ap-form-acilir-secim-liste-anchor') as HTMLElement | null) ??
      (trigger.closest('.ap-form-acilir-secim') as HTMLElement | null) ??
      trigger
    );
  }

  return (
    (trigger.closest('.cari-outlined-cerceve') as HTMLElement | null) ??
    (trigger.closest('.ap-form-acilir-secim') as HTMLElement | null) ??
    trigger
  );
}

function listeKonumuHesapla(
  trigger: HTMLButtonElement,
  minGenislik = 0,
  listeAnchor: 'self' | 'cerceve' = 'cerceve',
  dikeyBosluk = 4,
  yon: 'asagi' | 'yukari' = 'asagi'
) {
  const rect = anchorBul(trigger, listeAnchor).getBoundingClientRect();
  const genislik = Math.max(rect.width, minGenislik);
  let left = rect.left;

  if (left + genislik > window.innerWidth - KENAR_BOSLUK) {
    left = window.innerWidth - genislik - KENAR_BOSLUK;
  }
  if (left < KENAR_BOSLUK) left = KENAR_BOSLUK;

  if (yon === 'yukari') {
    return {
      bottom: window.innerHeight - rect.top + dikeyBosluk,
      left,
      width: genislik,
      maxHeight: Math.max(120, rect.top - KENAR_BOSLUK - dikeyBosluk),
      usteAc: true as const,
    };
  }

  const ust = rect.bottom + dikeyBosluk;
  const maxHeight = Math.max(120, window.innerHeight - ust - KENAR_BOSLUK);

  return { top: ust, left, width: genislik, maxHeight, usteAc: false as const };
}

function cokluEtiket(
  secenekler: readonly FormAcilirSecimSecenek[],
  values: readonly string[],
  bosEtiket: string
): string {
  if (!values.length) return bosEtiket;
  const etiketler = values
    .map((v) => secenekler.find((s) => s.value === v)?.label)
    .filter(Boolean) as string[];
  if (!etiketler.length) return `${values.length} seçili`;
  if (etiketler.length === 1) return etiketler[0];
  if (etiketler.length === 2) return `${etiketler[0]}, ${etiketler[1]}`;
  return `${etiketler[0]} +${etiketler.length - 1}`;
}

export function FormAcilirSecim({
  value = '',
  onChange,
  values,
  onChangeCoklu,
  coklu = false,
  secenekler: seceneklerHam = [],
  className = '',
  listeSinifi = '',
  listeMinGenislik = 0,
  listeAnchor = 'cerceve',
  listeDikeyBosluk = 4,
  listeInline = false,
  listeYonu = 'asagi',
  tusMetin,
  bosEtiket = 'seçiniz',
  aranabilir = false,
  aramaPlaceholder,
  listeMaxYukseklik,
  disabled = false,
  'aria-label': ariaLabel,
}: FormAcilirSecimProps) {
  const secenekler = Array.isArray(seceneklerHam) ? seceneklerHam : [];
  const listeId = useId();
  const tusRef = useRef<HTMLButtonElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const aramaRef = useRef<HTMLInputElement>(null);
  const [acik, setAcik] = useState(false);
  const [listeStil, setListeStil] = useState<CSSProperties>({});
  const [usteAcik, setUsteAcik] = useState(false);
  const [odakIndex, setOdakIndex] = useState(0);
  const [arama, setArama] = useState('');

  const seciliDegerler = useMemo(
    () => (coklu ? [...(values ?? [])] : value ? [value] : []),
    [coklu, values, value]
  );
  const seciliSet = useMemo(() => new Set(seciliDegerler), [seciliDegerler]);

  const gorunenSecenekler = useMemo(() => {
    if (!aranabilir) return secenekler;
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return secenekler;
    return secenekler.filter(
      (s) =>
        s.label.toLocaleLowerCase('tr').includes(q) ||
        s.value.toLocaleLowerCase('tr').includes(q)
    );
  }, [aranabilir, arama, secenekler]);

  const secili = secenekler.find((s) => s.value === value);
  const gosterilenEtiket =
    tusMetin ??
    (coklu
      ? cokluEtiket(secenekler, seciliDegerler, bosEtiket)
      : (secili?.label ?? (value ? String(value) : bosEtiket)));
  const inlineListe = listeInline;
  const aramaYazi = aramaPlaceholder ?? bosEtiket;

  const seciliIndex = Math.max(
    0,
    gorunenSecenekler.findIndex((s) => seciliSet.has(s.value))
  );

  const stilHesapla = useCallback((): { stil: CSSProperties; usteAc: boolean } | null => {
    if (!tusRef.current || inlineListe) return null;
    /** Düzenle / satır panelinde portal listeyi her zaman aşağı aç */
    const panelIci = Boolean(
      tusRef.current.closest('.dg-duzenle, .dg-satir-panel-cubuk, .ap-tanimlar-duzenle')
    );
    const yon = panelIci ? 'asagi' : listeYonu;
    const sonuc = listeKonumuHesapla(
      tusRef.current,
      listeMinGenislik,
      listeAnchor,
      listeDikeyBosluk,
      yon
    );
    const maxHeight =
      typeof listeMaxYukseklik === 'number'
        ? Math.min(sonuc.maxHeight, Math.max(120, listeMaxYukseklik))
        : sonuc.maxHeight;
    return {
      usteAc: sonuc.usteAc,
      stil: {
        position: 'fixed',
        left: sonuc.left,
        width: sonuc.width,
        maxHeight,
        zIndex: 13000,
        ...(sonuc.usteAc
          ? { top: 'auto', bottom: sonuc.bottom }
          : { bottom: 'auto', top: sonuc.top }),
      },
    };
  }, [
    inlineListe,
    listeMinGenislik,
    listeAnchor,
    listeDikeyBosluk,
    listeYonu,
    listeMaxYukseklik,
  ]);

  const konumGuncelle = useCallback(() => {
    const hesap = stilHesapla();
    if (!hesap) return;
    setUsteAcik(hesap.usteAc);
    setListeStil(hesap.stil);
  }, [stilHesapla]);

  const listeyiAc = useCallback(() => {
    const hesap = stilHesapla();
    if (hesap) {
      setUsteAcik(hesap.usteAc);
      setListeStil(hesap.stil);
    }
    setArama('');
    setOdakIndex(seciliIndex);
    setAcik(true);
  }, [stilHesapla, seciliIndex]);

  const sekmeSonrasi = useCallback(() => {
    if (!acik || inlineListe) return;
    requestAnimationFrame(() => konumGuncelle());
  }, [acik, inlineListe, konumGuncelle]);

  useSekmeDegisinceYenile(sekmeSonrasi);

  useLayoutEffect(() => {
    if (!acik || inlineListe) return;
    konumGuncelle();
    window.addEventListener('resize', konumGuncelle);
    window.addEventListener('scroll', konumGuncelle, true);
    return () => {
      window.removeEventListener('resize', konumGuncelle);
      window.removeEventListener('scroll', konumGuncelle, true);
    };
  }, [acik, inlineListe, konumGuncelle]);

  useEffect(() => {
    if (!acik || inlineListe) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!tusRef.current || !listeRef.current) return;
        /** Portal overlay: düzenle panelini kaydırma — modal yapısı bozulmasın */
        if (tusRef.current.closest('.dg-duzenle, .dg-satir-panel-cubuk, .ap-tanimlar-duzenle')) {
          return;
        }
        acilirListeGorunurKaydir(tusRef.current, listeRef.current, 16, listeYonu);
      });
    });
  }, [acik, inlineListe, listeYonu]);

  useEffect(() => {
    if (!acik || !aranabilir) return;
    requestAnimationFrame(() => aramaRef.current?.focus());
  }, [acik, aranabilir]);

  useEffect(() => {
    if (!acik || !aranabilir) return;
    setOdakIndex(0);
  }, [arama, acik, aranabilir]);

  useLayoutEffect(() => {
    if (!acik) return;
    const liste = listeRef.current;
    const el = document.getElementById(`${listeId}-oge-${odakIndex}`);
    if (!liste || !el) return;
    /** scrollIntoView dış paneli kaydırır → liste alanın üstüne biner; sadece liste içinde kaydır */
    const lRect = liste.getBoundingClientRect();
    const oRect = el.getBoundingClientRect();
    if (oRect.bottom > lRect.bottom) liste.scrollTop += oRect.bottom - lRect.bottom;
    else if (oRect.top < lRect.top) liste.scrollTop -= lRect.top - oRect.top;
  }, [acik, odakIndex, listeId, gorunenSecenekler.length]);

  useEffect(() => {
    if (!acik) return;

    function disTik(e: MouseEvent) {
      if (sekmeGecisTiklamasiMi(e.target)) return;
      const hedef = e.target as Node;
      if (
        tusRef.current?.contains(hedef) ||
        listeRef.current?.contains(hedef) ||
        panelRef.current?.contains(hedef)
      ) {
        return;
      }
      setAcik(false);
    }

    document.addEventListener('mousedown', disTik, true);
    return () => document.removeEventListener('mousedown', disTik, true);
  }, [acik]);

  const tekSec = (yeni: string) => {
    onChange?.(yeni);
    setAcik(false);
    setArama('');
    tusRef.current?.focus();
  };

  const cokluToggle = (yeni: string) => {
    if (!onChangeCoklu) return;
    const mevcut = seciliDegerler;
    const sonraki = mevcut.includes(yeni)
      ? mevcut.filter((v) => v !== yeni)
      : [...mevcut, yeni];
    onChangeCoklu(sonraki);
  };

  const acKapat = () => {
    if (disabled) return;
    if (acik) setAcik(false);
    else listeyiAc();
  };

  const listeTuslari = (e: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOdakIndex((i) => Math.min(i + 1, Math.max(0, gorunenSecenekler.length - 1)));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOdakIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const hedef = gorunenSecenekler[odakIndex];
      if (!hedef) return;
      if (coklu) cokluToggle(hedef.value);
      else tekSec(hedef.value);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setAcik(false);
      tusRef.current?.focus();
    }
  };

  const tusTuslari = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!acik) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        listeyiAc();
      }
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      const hedef = gorunenSecenekler[odakIndex];
      if (!hedef) return;
      if (coklu) cokluToggle(hedef.value);
      else tekSec(hedef.value);
      return;
    }

    listeTuslari(e);
  };

  const listeOgeleri =
    gorunenSecenekler.length === 0 ? (
      <li className="ap-form-acilir-secim-bos">Seçenek yok</li>
    ) : (
      gorunenSecenekler.map((s, index) => {
        const seciliMi = seciliSet.has(s.value);
        const odakMi = index === odakIndex;
        return (
          <li key={s.value}>
            <button
              type="button"
              id={`${listeId}-oge-${index}`}
              role={coklu ? 'checkbox' : 'option'}
              aria-checked={coklu ? seciliMi : undefined}
              aria-selected={!coklu ? seciliMi || odakMi : undefined}
              className={`ap-form-acilir-secim-oge${coklu ? ' ap-form-acilir-secim-oge--coklu' : ''}${seciliMi ? ' ap-form-acilir-secim-oge-secili' : ''}${odakMi ? ' ap-form-acilir-secim-oge-odak' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setOdakIndex(index)}
              onClick={() => (coklu ? cokluToggle(s.value) : tekSec(s.value))}
            >
              {coklu ? (
                <span
                  className={`ap-form-acilir-secim-check${seciliMi ? ' ap-form-acilir-secim-check--on' : ''}`}
                  aria-hidden
                >
                  {seciliMi ? '✓' : ''}
                </span>
              ) : null}
              {s.ikonUrl ? (
                <img src={s.ikonUrl} alt="" className="ap-form-acilir-secim-oge-ikon" />
              ) : null}
              <span className="ap-form-acilir-secim-oge-metin">{s.label}</span>
            </button>
          </li>
        );
      })
    );

  const listeIcerik = aranabilir ? (
    <div
      ref={panelRef}
      className={`ap-form-acilir-secim-panel${listeSinifi ? ` ${listeSinifi}` : ''}${inlineListe ? ' ap-form-acilir-secim-panel--inline' : ''}${usteAcik ? ' ap-form-acilir-secim-panel--uste' : ''}`}
      style={inlineListe ? undefined : listeStil}
    >
      <div className="ap-form-acilir-secim-arama-sarici">
        <input
          ref={aramaRef}
          type="search"
          className="ap-form-acilir-secim-arama"
          value={arama}
          placeholder={aramaYazi}
          aria-label={aramaYazi}
          onChange={(e) => setArama(e.target.value)}
          onKeyDown={listeTuslari}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <ul
        ref={listeRef}
        id={listeId}
        className={`ap-form-acilir-secim-liste ap-form-acilir-secim-liste--panel${coklu ? ' ap-form-acilir-secim-liste--coklu' : ''}`}
        role={coklu ? 'group' : 'listbox'}
        aria-label={ariaLabel}
      >
        {listeOgeleri}
      </ul>
    </div>
  ) : (
    <ul
      ref={listeRef}
      id={listeId}
      className={`ap-form-acilir-secim-liste${listeSinifi ? ` ${listeSinifi}` : ''}${inlineListe ? ' ap-form-acilir-secim-liste--inline' : ''}${usteAcik ? ' ap-form-acilir-secim-liste--uste' : ''}${coklu ? ' ap-form-acilir-secim-liste--coklu' : ''}`.trim()}
      role={coklu ? 'group' : 'listbox'}
      aria-label={ariaLabel}
      style={inlineListe ? undefined : listeStil}
    >
      {listeOgeleri}
    </ul>
  );

  return (
    <div className={`ap-form-acilir-secim${inlineListe ? ' ap-form-acilir-secim--inline' : ''}`.trim()}>
      <button
        ref={tusRef}
        type="button"
        className={`${formSelectSinifi} ap-form-acilir-secim-tus ${className}`.trim()}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup={coklu ? 'true' : 'listbox'}
        aria-expanded={acik}
        aria-controls={acik ? listeId : undefined}
        aria-activedescendant={acik ? `${listeId}-oge-${odakIndex}` : undefined}
        onClick={acKapat}
        onKeyDown={tusTuslari}
      >
        <span
          className={`ap-form-acilir-secim-tus-metin${!secili && !coklu && !value && !tusMetin ? ' ap-form-acilir-secim-tus-metin--bos' : ''}`}
        >
          {secili?.ikonUrl ? (
            <img src={secili.ikonUrl} alt="" className="ap-form-acilir-secim-tus-ikon" />
          ) : null}
          {gosterilenEtiket}
        </span>
        <span className="ap-form-acilir-secim-ok" aria-hidden>
          ▾
        </span>
      </button>

      {acik
        ? inlineListe
          ? listeIcerik
          : listeStil.position === 'fixed'
            ? createPortal(listeIcerik, sekmePortalHedefi(tusRef.current))
            : null
        : null}
    </div>
  );
}
