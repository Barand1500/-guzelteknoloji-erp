import type { ReactNode } from 'react';

interface TanimFormPanelProps {
  baslik: string;
  altBaslik?: string;
  duzenleme?: boolean;
  icKaydirma?: boolean;
  children: ReactNode;
}

export function TanimFormPanel({
  baslik,
  altBaslik,
  duzenleme = false,
  icKaydirma = true,
  children,
}: TanimFormPanelProps) {
  return (
    <div className={`ap-tanimlar-form-panel ${icKaydirma ? '' : 'ap-tanimlar-form-panel--tam'}`}>
      <div className="ap-tanimlar-form-baslik">
        <div>
          <h3>{baslik}</h3>
          {altBaslik ? <p>{altBaslik}</p> : null}
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
