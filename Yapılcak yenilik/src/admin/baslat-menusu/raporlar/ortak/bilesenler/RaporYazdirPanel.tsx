import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { formSelectSinifi } from '@/formlar/FormAlani';
import {
  RAPOR_YAZICILARI,
  raporSablonlari,
  type RaporSablonTipi,
  type RaporYazdirAyar,
} from '@/admin/baslat-menusu/raporlar/ortak/tipler';
import { ozelSablonlarOku } from '@/admin/baslat-menusu/raporlar/ortak/yardimci';

interface RaporYazdirPanelProps {
  raporTipi: RaporSablonTipi;
  ayar: RaporYazdirAyar;
  sablonYenile?: number;
  onAyarDegistir: (ayar: RaporYazdirAyar) => void;
  onYeniRapor: () => void;
  onDuzenle: () => void;
  onOnizleme: () => void;
  onTamam: () => void;
  onIptal?: () => void;
}

export function RaporYazdirPanel({
  raporTipi,
  ayar,
  sablonYenile = 0,
  onAyarDegistir,
  onYeniRapor,
  onDuzenle,
  onOnizleme,
  onTamam,
  onIptal,
}: RaporYazdirPanelProps) {
  const sablonlar = useMemo(() => {
    const varsayilan = raporSablonlari(raporTipi);
    const ozel = ozelSablonlarOku(raporTipi).map((dosya, i) => ({
      id: `ozel-${i}`,
      ad: dosya.replace(/\.frx$/i, ''),
      dosya,
    }));
    return [...varsayilan, ...ozel];
  }, [raporTipi, sablonYenile]);

  return (
    <div className="ap-rapor-yazdir-panel">
      <section className="ap-rapor-yazdir-bolum">
        <h3 className="ap-rapor-yazdir-bolum-baslik">Yazıcı</h3>
        <label className="ap-rapor-yazdir-alan">
          <span className="sr-only">Yazıcı seçin</span>
          <select
            className={formSelectSinifi}
            value={ayar.yazici}
            onChange={(e) => onAyarDegistir({ ...ayar, yazici: e.target.value })}
            aria-label="Yazıcı"
          >
            {RAPOR_YAZICILARI.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="ap-rapor-yazdir-bolum">
        <h3 className="ap-rapor-yazdir-bolum-baslik">Tasarım</h3>
        <label className="ap-rapor-yazdir-alan">
          <span className="sr-only">Rapor şablonu</span>
          <select
            className={formSelectSinifi}
            value={ayar.sablon}
            onChange={(e) => onAyarDegistir({ ...ayar, sablon: e.target.value })}
            aria-label="Rapor şablonu"
          >
            {sablonlar.map((s) => (
              <option key={s.dosya} value={s.dosya}>
                {s.ad} ({s.dosya})
              </option>
            ))}
          </select>
        </label>

        <div className="ap-rapor-yazdir-sablon-tuslar">
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
            onClick={onYeniRapor}
          >
            Yeni Rapor
          </button>
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
            onClick={onDuzenle}
          >
            Düzenle
          </button>
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
            onClick={onOnizleme}
          >
            Önizleme
          </button>
        </div>
      </section>

      <footer className="ap-rapor-yazdir-alt">
        {onIptal && (
          <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil" onClick={onIptal}>
            İptal
          </button>
        )}
        <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil" onClick={onTamam}>
          Tamam
        </button>
      </footer>
    </div>
  );
}

interface RaporOnizlemeModalProps {
  acik: boolean;
  baslik: string;
  altBaslik: string;
  yazici: string;
  sablon: string;
  children: ReactNode;
  onKapat: () => void;
  onYazdir: () => void;
}

export function RaporOnizlemeModal({
  acik,
  baslik,
  altBaslik,
  yazici,
  sablon,
  children,
  onKapat,
  onYazdir,
}: RaporOnizlemeModalProps) {
  if (!acik) return null;

  return (
    <div className="ap-rapor-onizleme-kapak" role="dialog" aria-modal="true" aria-labelledby="rapor-onizleme-baslik">
      <button type="button" className="ap-rapor-onizleme-kapak-arka" aria-label="Kapat" onClick={onKapat} />
      <div className="ap-rapor-onizleme-modal">
        <header className="ap-rapor-onizleme-baslik">
          <div>
            <h2 id="rapor-onizleme-baslik" className="ap-heading text-base font-semibold">
              {baslik}
            </h2>
            <p className="ap-muted mt-0.5 text-xs">{altBaslik}</p>
            <p className="ap-muted mt-1 text-xs">
              {yazici} · {sablon}
            </p>
          </div>
          <button type="button" className="ap-rapor-onizleme-kapat" onClick={onKapat} aria-label="Kapat">
            ×
          </button>
        </header>
        <div className="ap-rapor-onizleme-icerik ap-scroll">{children}</div>
        <footer className="ap-rapor-onizleme-alt">
          <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil" onClick={onKapat}>
            Kapat
          </button>
          <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil" onClick={onYazdir}>
            Yazdır
          </button>
        </footer>
      </div>
    </div>
  );
}
