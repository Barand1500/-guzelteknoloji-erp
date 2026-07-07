import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { UrunKaydi } from './urunAramaYardimci';

interface UrunAramaSlaytProps {
  mod: 'tablo' | 'arama';
  sorgu: string;
  sonuclar: UrunKaydi[];
  seciliIndeks: number;
  onSeciliDegistir: (indeks: number) => void;
  onSec: (urun: UrunKaydi) => void;
  onGeri: () => void;
  children: ReactNode;
}

function listeIcindeKaydir(liste: HTMLElement, oge: HTMLElement) {
  const ogeUst = oge.offsetTop;
  const ogeAlt = ogeUst + oge.offsetHeight;
  const gorunurUst = liste.scrollTop;
  const gorunurAlt = gorunurUst + liste.clientHeight;

  if (ogeUst < gorunurUst) {
    liste.scrollTop = ogeUst;
  } else if (ogeAlt > gorunurAlt) {
    liste.scrollTop = ogeAlt - liste.clientHeight;
  }
}

export function UrunAramaSlayt({
  mod,
  sorgu,
  sonuclar,
  seciliIndeks,
  onSeciliDegistir,
  onSec,
  onGeri,
  children,
}: UrunAramaSlaytProps) {
  const listeRef = useRef<HTMLDivElement>(null);
  const acilisKilidiRef = useRef(false);
  const aramaMod = mod === 'arama';

  useEffect(() => {
    if (!aramaMod) return;
    acilisKilidiRef.current = true;
    const zamanlayici = window.setTimeout(() => {
      acilisKilidiRef.current = false;
    }, 280);
    return () => window.clearTimeout(zamanlayici);
  }, [aramaMod, sorgu]);

  const klavyeIsle = useCallback(
    (e: KeyboardEvent) => {
      if (!aramaMod) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!sonuclar.length) return;
        onSeciliDegistir(Math.min(seciliIndeks + 1, sonuclar.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!sonuclar.length) return;
        onSeciliDegistir(Math.max(seciliIndeks - 1, 0));
        return;
      }
      if (e.key === 'Enter' && sonuclar.length) {
        if (acilisKilidiRef.current) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        const urun = sonuclar[seciliIndeks];
        if (urun) onSec(urun);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onGeri();
      }
    },
    [aramaMod, onGeri, onSec, onSeciliDegistir, seciliIndeks, sonuclar]
  );

  useEffect(() => {
    if (!aramaMod) return;
    window.addEventListener('keydown', klavyeIsle);
    return () => window.removeEventListener('keydown', klavyeIsle);
  }, [aramaMod, klavyeIsle]);

  useEffect(() => {
    if (!aramaMod || !listeRef.current) return;
    const secili = listeRef.current.querySelector<HTMLElement>('[data-secili="true"]');
    if (secili) listeIcindeKaydir(listeRef.current, secili);
  }, [aramaMod, seciliIndeks, sonuclar]);

  return (
    <div className={`dg-urun-slayt-kabuk${aramaMod ? ' dg-urun-slayt-kabuk--arama' : ''}`}>
      <div className="dg-urun-slayt-tablo">{children}</div>

      <div
        className={`dg-urun-slayt-sonuc${aramaMod ? ' dg-urun-slayt-sonuc--acik' : ''}`}
        aria-hidden={!aramaMod}
      >
        <div className="dg-urun-arama">
          <header className="dg-urun-arama-baslik">
            <div>
              <p className="dg-urun-arama-etiket">Ürün arama</p>
              <h3 className="dg-urun-arama-sorgu">
                {sorgu ? (
                  <>
                    <span className="dg-urun-arama-yuzde">%</span>
                    {sorgu}
                  </>
                ) : (
                  <span className="dg-urun-arama-tumu">Tüm ürünler</span>
                )}
              </h3>
              {sonuclar.length > 0 ? (
                <p className="dg-urun-arama-adet">{sonuclar.length} sonuç</p>
              ) : null}
            </div>
            <button type="button" className="dg-urun-arama-geri" onClick={onGeri}>
              ← Tabloya dön
            </button>
          </header>

          <div ref={listeRef} className="dg-urun-arama-liste ap-scroll" role="listbox" aria-label="Arama sonuçları">
            {sonuclar.length === 0 ? (
              <div className="dg-urun-arama-bos">
                <p>Sonuç bulunamadı.</p>
                <span>Esc ile tabloya dönebilirsiniz.</span>
              </div>
            ) : (
              sonuclar.map((urun, i) => {
                const secili = i === seciliIndeks;
                return (
                  <button
                    key={`${urun.sku}-${i}`}
                    type="button"
                    role="option"
                    aria-selected={secili}
                    data-secili={secili ? 'true' : undefined}
                    className={`dg-urun-arama-oge${secili ? ' dg-urun-arama-oge--secili' : ''}`}
                    onMouseEnter={() => onSeciliDegistir(i)}
                    onClick={() => onSec(urun)}
                  >
                    <span className="dg-urun-arama-sku">{urun.sku}</span>
                    <span className="dg-urun-arama-ad">{urun.ad}</span>
                    {urun.kategori ? <span className="dg-urun-arama-kat">{urun.kategori}</span> : null}
                  </button>
                );
              })
            )}
          </div>

          <footer className="dg-urun-arama-ipucu">
            <span>↑ ↓ gezin</span>
            <span>Enter seç ve ekle</span>
            <span>Esc geri</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
