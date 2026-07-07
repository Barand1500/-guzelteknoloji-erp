import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { paraFormatla, yuzdeFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { birimEtiketi } from './birimVeri';
import type { UrunKaydi } from './urunAramaYardimci';

interface UrunAramaSlaytProps {
  mod: 'tablo' | 'arama';
  sorgu: string;
  sonuclar: UrunKaydi[];
  seciliIndeks: number;
  onSorguDegistir: (sorgu: string) => void;
  onSeciliDegistir: (indeks: number) => void;
  onSec: (urun: UrunKaydi) => void;
  onGeri: () => void;
  children: ReactNode;
}

const TABLO_KOLONLARI = ['Ürün Kodu', 'Adı', 'Birimi', 'Fiyatı', 'Envanter', 'KDV'] as const;

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
  onSorguDegistir,
  onSeciliDegistir,
  onSec,
  onGeri,
  children,
}: UrunAramaSlaytProps) {
  const listeRef = useRef<HTMLDivElement>(null);
  const girdiRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (!aramaMod) return;
    const id = requestAnimationFrame(() => {
      const el = girdiRef.current;
      if (!el) return;
      el.focus();
      const son = el.value.length;
      el.setSelectionRange(son, son);
    });
    return () => cancelAnimationFrame(id);
  }, [aramaMod]);

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
            <div className="dg-urun-arama-baslik-sol">
              <p className="dg-urun-arama-etiket">Ürün arama</p>
              <div className="dg-urun-arama-girdi-kabuk">
                <span className="dg-urun-arama-yuzde" aria-hidden>
                  %
                </span>
                <input
                  ref={girdiRef}
                  type="search"
                  className="dg-urun-arama-girdi"
                  value={sorgu}
                  onChange={(e) => onSorguDegistir(e.target.value)}
                  placeholder="Yazmaya devam edin…"
                  aria-label="Ürün ara"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <p className="dg-urun-arama-adet">
                {sonuclar.length} Sonuç{sorgu.trim() ? '' : ' — Tüm Ürünler'}
              </p>
            </div>
            <button type="button" className="dg-urun-arama-geri" onClick={onGeri} aria-label="ESC ile tabloya dön">
              ESC
            </button>
          </header>

          <div ref={listeRef} className="dg-urun-arama-liste ap-scroll" role="listbox" aria-label="Arama sonuçları">
            {sonuclar.length === 0 ? (
              <div className="dg-urun-arama-bos">
                <p>Sonuç bulunamadı.</p>
                <span>Aramayı değiştirin veya ESC ile tabloya dönün.</span>
              </div>
            ) : (
              <table className="dg-urun-arama-tablo">
                <thead>
                  <tr>
                    {TABLO_KOLONLARI.map((baslik) => (
                      <th key={baslik} scope="col" className="dg-urun-arama-th">
                        {baslik}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sonuclar.map((urun, i) => {
                    const secili = i === seciliIndeks;
                    return (
                      <tr
                        key={`${urun.sku}-${i}`}
                        role="option"
                        aria-selected={secili}
                        data-secili={secili ? 'true' : undefined}
                        className={`dg-urun-arama-satir${secili ? ' dg-urun-arama-satir--secili' : ''}`}
                        onMouseEnter={() => onSeciliDegistir(i)}
                        onClick={() => onSec(urun)}
                      >
                        <td className="dg-urun-arama-hucre dg-urun-arama-hucre--kod">{urun.sku}</td>
                        <td className="dg-urun-arama-hucre dg-urun-arama-hucre--ad">{urun.ad}</td>
                        <td className="dg-urun-arama-hucre dg-urun-arama-hucre--birim">{birimEtiketi(urun.birim)}</td>
                        <td className="dg-urun-arama-hucre dg-urun-arama-hucre--sayi">{paraFormatla(urun.fiyat)}</td>
                        <td className="dg-urun-arama-hucre dg-urun-arama-hucre--sayi">
                          {urun.envanter.toLocaleString('tr-TR')}
                        </td>
                        <td className="dg-urun-arama-hucre dg-urun-arama-hucre--sayi">{yuzdeFormatla(urun.kdv)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <footer className="dg-urun-arama-ipucu">
            <span>Yazarak Filtrele</span>
            <span>↑ ↓ Gezin</span>
            <span>Enter Seç ve Ekle</span>
            <span>ESC Geri</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
