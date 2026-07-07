import { useCallback, useState, type ReactNode } from 'react';

export function useAgacAcik() {
  const [acikIdler, setAcikIdler] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setAcikIdler((onceki) => {
      const yeni = new Set(onceki);
      if (yeni.has(id)) yeni.delete(id);
      else yeni.add(id);
      return yeni;
    });
  }, []);

  const tumunuKapat = useCallback(() => setAcikIdler(new Set()), []);

  const acikMi = useCallback((id: string) => acikIdler.has(id), [acikIdler]);

  return { acikIdler, toggle, tumunuKapat, acikMi };
}

interface MasterAgacAracProps {
  baslik: string;
  aciklama: string;
  onTumunuKapat: () => void;
  acikSayisi: number;
  children: ReactNode;
}

export function MasterAgacArac({ baslik, aciklama, onTumunuKapat, acikSayisi, children }: MasterAgacAracProps) {
  return (
    <div className="ap-master-agac-wrap">
      <div className="ap-master-agac-ust">
        <div className="min-w-0">
          <p className="ap-master-agac-sekme-etiket">{baslik}</p>
          <p className="ap-muted text-xs">{aciklama}</p>
        </div>
        {acikSayisi > 0 && (
          <button type="button" className="ap-master-agac-tumunu-kapat" onClick={onTumunuKapat}>
            Tümünü Kapat
            <span aria-hidden>⌃</span>
          </button>
        )}
      </div>
      <div className="ap-master-agac-liste">{children}</div>
    </div>
  );
}

interface MasterAgacKartProps {
  id: string;
  acik: boolean;
  onToggle: () => void;
  ikon: string;
  baslik: string;
  altMetin?: string | null;
  sayacEtiket?: string;
  aktif?: boolean;
  vurgulu?: boolean;
  children?: ReactNode;
}

export function MasterAgacKart({
  acik,
  onToggle,
  ikon,
  baslik,
  altMetin,
  sayacEtiket,
  aktif = true,
  vurgulu,
  children,
}: MasterAgacKartProps) {
  const genisletilebilir = children != null;

  return (
    <article className={`ap-master-agac-kart ${acik ? 'ap-master-agac-kart-acik' : ''} ${vurgulu ? 'ap-master-agac-kart-vurgulu' : ''}`}>
      <button
        type="button"
        className="ap-master-agac-kart-baslik"
        onClick={genisletilebilir ? onToggle : undefined}
        aria-expanded={genisletilebilir ? acik : undefined}
        disabled={!genisletilebilir}
      >
        <span className="ap-master-agac-kart-ikon" aria-hidden>
          {ikon}
        </span>
        <span className="ap-master-agac-kart-metin min-w-0 text-left">
          <span className="ap-heading block truncate text-sm font-semibold">{baslik}</span>
          {altMetin && <span className="ap-muted block truncate text-xs">{altMetin}</span>}
        </span>
        <span className="ap-master-agac-kart-rozetler">
          <span className={`ap-master-durum ${aktif ? 'ap-master-durum-aktif' : ''}`}>
            {aktif ? 'Aktif' : 'Pasif'}
          </span>
          {sayacEtiket && <span className="ap-master-agac-sayac">{sayacEtiket}</span>}
        </span>
        {genisletilebilir && (
          <span className={`ap-master-agac-ok ${acik ? 'ap-master-agac-ok-acik' : ''}`} aria-hidden>
            ⌄
          </span>
        )}
      </button>
      {acik && children && <div className="ap-master-agac-kart-icerik">{children}</div>}
    </article>
  );
}

export function MasterAgacBos({ mesaj }: { mesaj: string }) {
  return <p className="ap-master-agac-bos">{mesaj}</p>;
}

interface MasterAgacDugumProps {
  ikon?: string;
  baslik: string;
  altMetin?: string;
  aktif?: boolean;
  ek?: ReactNode;
  girinti?: boolean;
}

export function MasterAgacDugum({ ikon = '·', baslik, altMetin, aktif = true, ek, girinti }: MasterAgacDugumProps) {
  return (
    <div className={`ap-master-agac-dugum ${girinti ? 'ap-master-agac-dugum-girinti' : ''}`}>
      <span className="ap-master-agac-dugum-cizgi" aria-hidden />
      <span className="ap-master-agac-dugum-ikon" aria-hidden>
        {ikon}
      </span>
      <div className="ap-master-agac-dugum-metin min-w-0">
        <span className="block truncate text-sm font-medium">{baslik}</span>
        {altMetin && <span className="ap-muted block truncate text-xs">{altMetin}</span>}
        {ek}
      </div>
      <span className={`ap-master-durum shrink-0 text-xs ${aktif ? 'ap-master-durum-aktif' : ''}`}>
        {aktif ? 'Aktif' : 'Pasif'}
      </span>
    </div>
  );
}

export function MasterAgacPaketRozet({
  paketAdi,
  durum,
}: {
  paketAdi: string;
  durum: 'aktif' | 'pasif' | 'yakinda';
}) {
  const sinif =
    durum === 'aktif' ? 'ap-master-agac-paket-aktif' : durum === 'yakinda' ? 'ap-master-agac-paket-uyari' : '';
  return (
    <span className={`ap-master-agac-paket ${sinif}`}>
      📦 {paketAdi}
    </span>
  );
}
