import type { ReactNode } from 'react';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';

interface TanimDuzenleEkraniProps {
  baslik: string;
  altBaslik?: string;
  olusturma?: string;
  guncelleme?: string;
  onGeri: () => void;
  children: ReactNode;
}

export function TanimDuzenleEkrani({
  baslik,
  altBaslik,
  olusturma,
  guncelleme,
  onGeri,
  children,
}: TanimDuzenleEkraniProps) {
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
