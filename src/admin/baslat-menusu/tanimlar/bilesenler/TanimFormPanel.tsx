import type { ReactNode } from 'react';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';

interface TanimFormPanelProps {
  baslik: string;
  altBaslik?: string;
  duzenleme?: boolean;
  icKaydirma?: boolean;
  olusturma?: string;
  guncelleme?: string;
  children: ReactNode;
}

export function TanimFormPanel({
  baslik,
  altBaslik,
  duzenleme = false,
  icKaydirma = true,
  olusturma,
  guncelleme,
  children,
}: TanimFormPanelProps) {
  const tarihGoster = duzenleme && (olusturma || guncelleme);

  return (
    <div className={`ap-tanimlar-form-panel ${icKaydirma ? '' : 'ap-tanimlar-form-panel--tam'}`}>
      <div className="ap-tanimlar-form-baslik">
        <div className="ap-tanimlar-form-baslik-metin">
          <h3>{baslik}</h3>
          {altBaslik ? <p>{altBaslik}</p> : null}
          {tarihGoster ? (
            <div className="ap-tanimlar-form-kayit-tarihleri">
              {olusturma ? (
                <span>
                  <em>Kayıt</em> {tarihSaatFormatla(olusturma)}
                </span>
              ) : null}
              {olusturma && guncelleme ? <span className="ap-tanimlar-form-kayit-ayrac" aria-hidden>·</span> : null}
              {guncelleme ? (
                <span>
                  <em>Güncelleme</em> {tarihSaatFormatla(guncelleme)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <span
          className={`ap-tanimlar-form-rozet ${duzenleme ? 'ap-tanimlar-form-rozet--duzenle' : 'ap-tanimlar-form-rozet--yeni'}`}
        >
          {duzenleme ? 'Düzenle' : 'Yeni'}
        </span>
      </div>
      <div className={`ap-tanimlar-form-govde ${icKaydirma ? 'ap-scroll' : ''}`}>{children}</div>
    </div>
  );
}
