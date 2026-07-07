import { useMemo, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import type { UrunTanimi } from '@/admin/baslat-menusu/urunler-tanimlari/tipler';

interface UrunListesiPanelProps {
  urunler: UrunTanimi[];
  seciliId: string | null;
  onSec: (id: string) => void;
}

function fiyatGoster(fiyat: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(fiyat);
}

export function UrunListesiPanel({ urunler, seciliId, onSec }: UrunListesiPanelProps) {
  const [arama, setArama] = useState('');

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return urunler;
    return urunler.filter(
      (u) =>
        u.ad.toLocaleLowerCase('tr').includes(q) ||
        u.stokKodu.toLocaleLowerCase('tr').includes(q) ||
        u.urunGrubu.toLocaleLowerCase('tr').includes(q)
    );
  }, [arama, urunler]);

  return (
    <aside className="ap-urun-tanim-liste-panel">
      <div className="ap-urun-tanim-liste-ust">
        <h3 className="ap-heading text-sm font-semibold">Ürünler</h3>
        <span className="ap-urun-tanim-liste-sayi">{filtreli.length}</span>
      </div>

      <div className="ap-urun-tanim-liste-arama-wrap">
        <svg className="ap-urun-tanim-liste-arama-ikon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          className={`${formInputSinifi} ap-urun-tanim-liste-arama`}
          placeholder="Ara…"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          aria-label="Ürün ara"
        />
      </div>

      <ul className="ap-urun-tanim-liste" role="listbox">
        {filtreli.map((u) => {
          const secili = seciliId === u.id;
          return (
            <li key={u.id}>
              <button
                type="button"
                role="option"
                aria-selected={secili}
                className={`ap-urun-tanim-liste-oge ${secili ? 'ap-urun-tanim-liste-oge-secili' : ''}`}
                onClick={() => onSec(u.id)}
              >
                {u.resimUrl ? (
                  <img src={u.resimUrl} alt="" className="ap-urun-tanim-liste-thumb" />
                ) : (
                  <span className="ap-urun-tanim-liste-thumb ap-urun-tanim-liste-thumb-bos" aria-hidden>
                    {u.ad.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
                <span className="ap-urun-tanim-liste-metin">
                  <span className="ap-urun-tanim-liste-ad">{u.ad || 'Yeni ürün'}</span>
                  <span className="ap-urun-tanim-liste-alt">
                    <span className="ap-urun-tanim-liste-kod">{u.stokKodu || '—'}</span>
                    <span className="ap-urun-tanim-liste-fiyat">{fiyatGoster(u.kdvDahilFiyat)}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {filtreli.length === 0 && (
          <li className="ap-urun-tanim-liste-bos">Eşleşen ürün bulunamadı.</li>
        )}
      </ul>
    </aside>
  );
}
