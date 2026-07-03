import type { ReactNode } from 'react';

interface AltPanelProps {
  acik: boolean;
  onKapat: () => void;
  baslik: string;
  ustAksiyon?: ReactNode;
  children: ReactNode;
}

export function AltPanel({ acik, onKapat, baslik, ustAksiyon, children }: AltPanelProps) {
  if (!acik) return null;

  return (
    <>
      <button type="button" className="ap-alt-panel-backdrop" aria-label="Paneli kapat" onClick={onKapat} />
      <div className="ap-alt-panel">
        <div className="ap-alt-panel-baslik">
          <h3 className="ap-alt-panel-baslik-metin">{baslik}</h3>
          {ustAksiyon}
        </div>
        <div className="ap-alt-panel-icerik">{children}</div>
      </div>
    </>
  );
}

function zamanFormat(iso: string) {
  const tarih = new Date(iso);
  const fark = Date.now() - tarih.getTime();
  const dk = Math.floor(fark / 60000);
  if (dk < 1) return 'Az önce';
  if (dk < 60) return `${dk} dk önce`;
  const saat = Math.floor(dk / 60);
  if (saat < 24) return `${saat} sa önce`;
  return tarih.toLocaleDateString('tr-TR');
}

export function AltPanelBos({ mesaj }: { mesaj: string }) {
  return <p className="ap-alt-panel-bos">{mesaj}</p>;
}

export function AltPanelYukleniyor() {
  return <p className="ap-alt-panel-bos">Yükleniyor...</p>;
}

export function AltPanelOge({
  baslik,
  alt,
  zaman,
  okunmamis,
  onClick,
  sinif,
}: {
  baslik: string;
  alt: string;
  zaman?: string;
  okunmamis?: boolean;
  onClick?: () => void;
  sinif?: string;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`ap-alt-panel-oge ${okunmamis ? 'ap-alt-panel-oge-okunmamis' : ''} ${sinif ?? ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="ap-alt-panel-oge-baslik">{baslik}</span>
        {okunmamis && <span className="ap-alt-panel-nokta" aria-hidden />}
      </div>
      <span className="ap-alt-panel-oge-alt">{alt}</span>
      {zaman && <span className="ap-alt-panel-oge-zaman">{zamanFormat(zaman)}</span>}
    </Tag>
  );
}
