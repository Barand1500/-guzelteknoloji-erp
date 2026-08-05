import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
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
  /** Birden fazla işaretli ürünü seçim sırasıyla gönderir */
  onTopluSec?: (urunler: UrunKaydi[]) => void;
  onGeri: () => void;
  /** Verilirse sonuç bulunamadığında hızlı stok kartı açma butonu görünür */
  onHizliEkle?: (sorgu: string) => void;
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
  onTopluSec,
  onGeri,
  onHizliEkle,
  children,
}: UrunAramaSlaytProps) {
  const listeRef = useRef<HTMLDivElement>(null);
  const girdiRef = useRef<HTMLInputElement>(null);
  const acilisKilidiRef = useRef(false);
  const aramaMod = mod === 'arama';
  /** Seçim sırası korunur (sku listesi) */
  const [isaretliSku, setIsaretliSku] = useState<string[]>([]);

  const topluAktif = sonuclar.length > 1;

  useEffect(() => {
    setIsaretliSku([]);
  }, [sorgu, aramaMod]);

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

  const isaretToggle = useCallback((sku: string) => {
    setIsaretliSku((onceki) => {
      if (onceki.includes(sku)) return onceki.filter((s) => s !== sku);
      return [...onceki, sku];
    });
  }, []);

  const tumunuSecToggle = useCallback(() => {
    setIsaretliSku((onceki) => {
      const gorunenSku = sonuclar.map((u) => u.sku);
      const hepsiSecili =
        gorunenSku.length > 0 && gorunenSku.every((sku) => onceki.includes(sku));
      if (hepsiSecili) return onceki.filter((sku) => !gorunenSku.includes(sku));
      const eklenen = gorunenSku.filter((sku) => !onceki.includes(sku));
      return [...onceki, ...eklenen];
    });
  }, [sonuclar]);

  const secimiUygula = useCallback(() => {
    if (acilisKilidiRef.current) return;
    if (!sonuclar.length) return;

    if (topluAktif && isaretliSku.length > 0) {
      const sirali = isaretliSku
        .map((sku) => sonuclar.find((u) => u.sku === sku))
        .filter((u): u is UrunKaydi => Boolean(u));
      if (!sirali.length) return;
      if (sirali.length === 1) {
        onSec(sirali[0]!);
        return;
      }
      if (onTopluSec) onTopluSec(sirali);
      else onSec(sirali[0]!);
      return;
    }

    const urun = sonuclar[seciliIndeks];
    if (urun) onSec(urun);
  }, [isaretliSku, onSec, onTopluSec, seciliIndeks, sonuclar, topluAktif]);

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
      if ((e.key === ' ' || e.code === 'Space') && topluAktif && sonuclar.length && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const urun = sonuclar[seciliIndeks];
        if (urun) isaretToggle(urun.sku);
        return;
      }
      if (e.key === 'Enter' && sonuclar.length) {
        if (acilisKilidiRef.current) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        secimiUygula();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onGeri();
      }
    },
    [
      aramaMod,
      isaretToggle,
      onGeri,
      onSeciliDegistir,
      seciliIndeks,
      secimiUygula,
      sonuclar,
      topluAktif,
    ]
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

  const isaretliAdet = isaretliSku.filter((sku) => sonuclar.some((u) => u.sku === sku)).length;
  const tumuSecili = sonuclar.length > 0 && isaretliAdet === sonuclar.length;
  const kismiSecili = isaretliAdet > 0 && !tumuSecili;
  const tumunuSecRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tumunuSecRef.current) tumunuSecRef.current.indeterminate = kismiSecili;
  }, [kismiSecili]);

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
                  placeholder=""
                  aria-label="Ürün ara"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <p className="dg-urun-arama-adet">
                {sonuclar.length} Sonuç{sorgu.trim() ? '' : ' — Tüm Ürünler'}
                {isaretliAdet > 0 ? ` · ${isaretliAdet} seçili` : ''}
              </p>
            </div>
            <div className="dg-urun-arama-baslik-sag">
              {topluAktif && isaretliAdet > 0 ? (
                <button
                  type="button"
                  className="dg-urun-arama-toplu-ekle"
                  onClick={secimiUygula}
                >
                  Seçilenleri ekle ({isaretliAdet})
                </button>
              ) : null}
              <button type="button" className="dg-urun-arama-geri" onClick={onGeri} aria-label="ESC ile tabloya dön">
                ESC
              </button>
            </div>
          </header>

          <div ref={listeRef} className="dg-urun-arama-liste ap-scroll" role="listbox" aria-label="Arama sonuçları" aria-multiselectable={topluAktif}>
            {sonuclar.length === 0 ? (
              <div className="dg-urun-arama-bos">
                <p>Böyle bir stoğunuz yok.</p>
                <span>Aramayı değiştirin, ESC ile dönün veya hızlı stok kartı açın.</span>
                {onHizliEkle ? (
                  <button
                    type="button"
                    className="dg-urun-arama-hizli-ekle"
                    onClick={() => onHizliEkle(sorgu)}
                  >
                    + Hızlı Ekle
                  </button>
                ) : null}
              </div>
            ) : (
              <table className="dg-urun-arama-tablo">
                <thead>
                  <tr>
                    {topluAktif ? (
                      <th scope="col" className="dg-urun-arama-th dg-urun-arama-th--secim">
                        <label className="dg-urun-arama-secim dg-urun-arama-secim--tum" title="Tümünü seç">
                          <input
                            ref={tumunuSecRef}
                            type="checkbox"
                            checked={tumuSecili}
                            onChange={tumunuSecToggle}
                            aria-label="Tümünü seç"
                          />
                        </label>
                      </th>
                    ) : null}
                    {TABLO_KOLONLARI.map((baslik) => (
                      <th key={baslik} scope="col" className="dg-urun-arama-th">
                        {baslik}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sonuclar.map((urun, i) => {
                    const odakli = i === seciliIndeks;
                    const isaretli = isaretliSku.includes(urun.sku);
                    const siraNo = isaretli ? isaretliSku.indexOf(urun.sku) + 1 : 0;
                    return (
                      <tr
                        key={`${urun.sku}-${i}`}
                        role="option"
                        aria-selected={odakli || isaretli}
                        data-secili={odakli ? 'true' : undefined}
                        className={`dg-urun-arama-satir${odakli ? ' dg-urun-arama-satir--secili' : ''}${isaretli ? ' dg-urun-arama-satir--isaretli' : ''}`}
                        onMouseEnter={() => onSeciliDegistir(i)}
                        onClick={() => onSec(urun)}
                      >
                        {topluAktif ? (
                          <td className="dg-urun-arama-hucre dg-urun-arama-hucre--secim">
                            <label
                              className="dg-urun-arama-secim"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isaretli}
                                onChange={() => isaretToggle(urun.sku)}
                                aria-label={`${urun.sku} seç`}
                              />
                              {isaretli ? (
                                <span className="dg-urun-arama-secim-sira" aria-hidden>
                                  {siraNo}
                                </span>
                              ) : null}
                            </label>
                          </td>
                        ) : null}
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
            {topluAktif ? (
              <span>□ İşaretle · Ctrl+Space · Enter: fiyatlılar satıra · 0 ₺ düzenleme</span>
            ) : (
              <span>Enter Seç (alanlar dolar)</span>
            )}
            <span>ESC Geri</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
