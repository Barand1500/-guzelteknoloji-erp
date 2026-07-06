import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { kategoriYolu, type DemoKategori } from './kategoriVeri';

interface KategoriYonetimModalProps {
  acik: boolean;
  onKapat: () => void;
  kategoriler: DemoKategori[];
  onDegistir: (kategoriler: DemoKategori[]) => void;
}

export function KategoriYonetimModal({ acik, onKapat, kategoriler, onDegistir }: KategoriYonetimModalProps) {
  const [yeniAd, setYeniAd] = useState('');
  const [ustId, setUstId] = useState('');
  const portalKok = useMemo(() => document.querySelector('.admin-panel') ?? document.body, []);

  useEffect(() => {
    if (!acik) return;
    function tus(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onKapat();
      }
    }
    document.addEventListener('keydown', tus);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tus);
      document.body.style.overflow = '';
    };
  }, [acik, onKapat]);

  const ekle = useCallback(() => {
    const ad = yeniAd.trim();
    if (!ad) return;
    const id = `kat-${Date.now()}`;
    onDegistir([...kategoriler, { id, ad, ustId: ustId || null }]);
    setYeniAd('');
  }, [yeniAd, ustId, kategoriler, onDegistir]);

  const sil = useCallback(
    (id: string) => {
      const altlar = new Set<string>();
      const topla = (ust: string) => {
        kategoriler.filter((k) => k.ustId === ust).forEach((k) => {
          altlar.add(k.id);
          topla(k.id);
        });
      };
      topla(id);
      onDegistir(kategoriler.filter((k) => k.id !== id && !altlar.has(k.id)));
    },
    [kategoriler, onDegistir]
  );

  const kokler = useMemo(() => kategoriler.filter((k) => !k.ustId), [kategoriler]);

  const altKategoriler = useCallback(
    (ust: string) => kategoriler.filter((k) => k.ustId === ust),
    [kategoriler]
  );

  if (!acik) return null;

  const icerik = (
    <div className="dg-kat-overlay" role="dialog" aria-modal="true" aria-labelledby="dg-kat-baslik">
      <div className="dg-kat-backdrop" aria-hidden="true" />
      <div className="dg-kat-modal">
        <header className="dg-kat-baslik">
          <h2 id="dg-kat-baslik">Kategori Yönetimi</h2>
          <button type="button" className="dg-kat-kapat" onClick={onKapat}>
            ✕ <span className="dg-kat-esc">ESC</span>
          </button>
        </header>

        <div className="dg-kat-ekle-alan">
          <select
            className="dg-kat-secim"
            value={ustId}
            onChange={(e) => setUstId(e.target.value)}
          >
            <option value="">— Ana Kategori (İsteğe Bağlı) —</option>
            {kategoriler.map((k) => (
              <option key={k.id} value={k.id}>
                {kategoriYolu(kategoriler, k.id)}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="dg-kat-girdi"
            placeholder="Kategori adı — ↵ Enter ile ekle"
            value={yeniAd}
            onChange={(e) => setYeniAd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                ekle();
              }
            }}
          />
        </div>

        <div className="dg-kat-liste">
          {kokler.map((kok) => (
            <div key={kok.id} className="dg-kat-grup">
              <div className="dg-kat-oge dg-kat-oge--kok">
                <span className="dg-kat-ikon" aria-hidden>
                  📁
                </span>
                <span className="dg-kat-ad">{kok.ad}</span>
                <div className="dg-kat-aksiyonlar">
                  <button type="button" className="dg-kat-aksiyon dg-kat-aksiyon--sil" title="Sil" onClick={() => sil(kok.id)}>
                    ✕
                  </button>
                </div>
              </div>
              {altKategoriler(kok.id).map((alt) => (
                <div key={alt.id} className="dg-kat-oge dg-kat-oge--alt">
                  <span className="dg-kat-ikon dg-kat-ikon--alt" aria-hidden>
                    ↳
                  </span>
                  <div className="dg-kat-alt-metin">
                    <span className="dg-kat-ad">{alt.ad}</span>
                    <span className="dg-kat-yol">{kategoriYolu(kategoriler, alt.id)}</span>
                  </div>
                  <div className="dg-kat-aksiyonlar">
                    <button type="button" className="dg-kat-aksiyon dg-kat-aksiyon--sil" title="Sil" onClick={() => sil(alt.id)}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(icerik, portalKok);
}
