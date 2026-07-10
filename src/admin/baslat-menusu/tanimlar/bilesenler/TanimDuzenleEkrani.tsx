import type { ReactNode } from 'react';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';

interface TanimDuzenleEkraniProps {
  baslik: string;
  altBaslik?: string;
  kod?: string;
  ustEtiket?: string;
  olusturma?: string;
  guncelleme?: string;
  onGeri: () => void;
  onKaydet?: () => void;
  kaydediliyor?: boolean;
  panel?: boolean;
  children: ReactNode;
}

export function TanimDuzenleEkrani({
  baslik,
  altBaslik,
  kod,
  ustEtiket = 'Kayıt düzenle',
  olusturma,
  guncelleme,
  onGeri,
  onKaydet,
  kaydediliyor = false,
  panel = false,
  children,
}: TanimDuzenleEkraniProps) {
  if (panel) {
    return (
      <div className="dg-duzenle">
        <button type="button" className="dg-duzenle-tutamac-alan" onClick={onGeri} aria-label="Paneli kapat">
          <div className="dg-duzenle-tutamac" />
        </button>
        <header className="dg-duzenle-baslik">
          <p className="dg-duzenle-ust-etiket">{ustEtiket}</p>
          {kod ? (
            <p className="dg-duzenle-urun-meta dg-duzenle-urun-meta--ust">
              <span className="dg-duzenle-sku">{kod}</span>
            </p>
          ) : null}
          <h3 className="dg-duzenle-urun-ad">{baslik}</h3>
          {altBaslik ? <p className="ap-tanimlar-panel-alt">{altBaslik}</p> : null}
          {olusturma || guncelleme ? (
            <p className="ap-tanimlar-panel-tarih">
              {olusturma ? <>Kayıt {tarihSaatFormatla(olusturma)}</> : null}
              {olusturma && guncelleme ? ' · ' : null}
              {guncelleme ? <>Güncelleme {tarihSaatFormatla(guncelleme)}</> : null}
            </p>
          ) : null}
        </header>
        <div className="dg-duzenle-govde ap-scroll ap-tanimlar-panel-govde">{children}</div>
        <footer className="dg-duzenle-alt">
          <button
            type="button"
            className="dg-duzenle-btn dg-duzenle-btn--iptal"
            onClick={onGeri}
            disabled={kaydediliyor}
          >
            İptal
          </button>
          <button
            type="button"
            className="dg-duzenle-btn dg-duzenle-btn--kaydet"
            onClick={onKaydet}
            disabled={kaydediliyor || !onKaydet}
          >
            {kaydediliyor ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="ap-tanimlar-duzenle">
      <header className="ap-tanimlar-duzenle-ust">
        <button type="button" className="ap-tanimlar-duzenle-geri" onClick={onGeri}>
          ← Listeye dön
        </button>
        <div className="ap-tanimlar-duzenle-baslik-alan">
          <h3 className="ap-tanimlar-duzenle-baslik">{baslik}</h3>
          {altBaslik ? <p className="ap-tanimlar-duzenle-alt">{altBaslik}</p> : null}
          {olusturma || guncelleme ? (
            <div className="ap-tanimlar-duzenle-tarihler">
              {olusturma ? (
                <span>
                  <em>Kayıt</em> {tarihSaatFormatla(olusturma)}
                </span>
              ) : null}
              {olusturma && guncelleme ? <span className="ap-tanimlar-duzenle-ayrac">·</span> : null}
              {guncelleme ? (
                <span>
                  <em>Güncelleme</em> {tarihSaatFormatla(guncelleme)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <span className="ap-tanimlar-duzenle-rozet">Düzenle</span>
      </header>
      <div className="ap-tanimlar-duzenle-govde">{children}</div>
    </div>
  );
}
