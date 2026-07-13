import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { tarihSaatFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { ModalTusIcerik } from '@/admin/ortak/ModalTusIcerik';

const KAYDET_ESIGI = 72;

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
  saltOkunur?: boolean;
  children: ReactNode;
}

export function TanimDuzenleEkrani({
  baslik,
  altBaslik,
  ustEtiket = 'Kayıt düzenle',
  olusturma,
  guncelleme,
  onGeri,
  onKaydet,
  kaydediliyor = false,
  panel = false,
  saltOkunur = false,
  children,
}: TanimDuzenleEkraniProps) {
  if (panel) {
    return (
      <TanimDuzenlePanel
        ustEtiket={ustEtiket}
        onGeri={onGeri}
        onKaydet={saltOkunur ? undefined : onKaydet}
        kaydediliyor={kaydediliyor}
        saltOkunur={saltOkunur}
      >
        {children}
      </TanimDuzenlePanel>
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

function TanimDuzenlePanel({
  ustEtiket,
  onGeri,
  onKaydet,
  kaydediliyor,
  saltOkunur = false,
  children,
}: {
  ustEtiket: string;
  onGeri: () => void;
  onKaydet?: () => void;
  kaydediliyor?: boolean;
  saltOkunur?: boolean;
  children: ReactNode;
}) {
  const [surukleY, setSurukleY] = useState(0);
  const [surukleniyor, setSurukleniyor] = useState(false);
  const baslangicY = useRef(0);
  const tutamacRef = useRef<HTMLDivElement>(null);

  const kaydet = useCallback(() => {
    if (kaydediliyor || !onKaydet) return;
    onKaydet();
  }, [kaydediliyor, onKaydet]);

  const tutamacBasla = (e: React.PointerEvent) => {
    if (kaydediliyor) return;
    baslangicY.current = e.clientY;
    setSurukleniyor(true);
    tutamacRef.current?.setPointerCapture(e.pointerId);
  };

  const tutamacSurukle = (e: React.PointerEvent) => {
    if (!surukleniyor || kaydediliyor) return;
    setSurukleY(Math.max(0, e.clientY - baslangicY.current));
  };

  const tutamacBitir = () => {
    if (surukleY >= KAYDET_ESIGI) {
      kaydet();
      setSurukleY(0);
      setSurukleniyor(false);
      return;
    }
    setSurukleY(0);
    setSurukleniyor(false);
  };

  useEffect(() => {
    function tusHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onGeri();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        const hedef = e.target as HTMLElement | null;
        const tag = hedef?.tagName;
        if (tag === 'TEXTAREA') return;
        e.preventDefault();
        kaydet();
      }
    }

    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [onGeri, kaydet]);

  return (
    <div
      className={`dg-duzenle dg-duzenle--tanim${surukleniyor ? ' dg-duzenle--surukleniyor' : ''}`}
      style={{ transform: surukleY ? `translateY(${surukleY}px)` : undefined }}
    >
      <div
        ref={tutamacRef}
        className="dg-duzenle-tutamac-alan"
        onPointerDown={tutamacBasla}
        onPointerMove={tutamacSurukle}
        onPointerUp={tutamacBitir}
        onPointerCancel={tutamacBitir}
        role="button"
        tabIndex={0}
        aria-label="Aşağı kaydırarak kaydet"
      >
        <div className="dg-duzenle-tutamac" />
        <span className="dg-duzenle-tutamac-metin">
          {saltOkunur ? 'Salt okunur' : 'Aşağı çekerek kaydet'}
        </span>
      </div>

      <header className="dg-duzenle-baslik ap-tanimlar-duzenle-panel-baslik">
        <h3 className="dg-duzenle-urun-ad">{ustEtiket}</h3>
      </header>

      <div className="dg-duzenle-govde ap-scroll ap-tanimlar-panel-govde">
        {children}
      </div>

      <footer className="dg-duzenle-alt dg-duzenle-alt--genis">
        <button
          type="button"
          className="dg-duzenle-btn dg-duzenle-btn--iptal"
          onClick={onGeri}
          disabled={kaydediliyor}
        >
          <ModalTusIcerik metin="Vazgeç" kisayol="Esc" />
        </button>
        <button
          type="button"
          className="dg-duzenle-btn dg-duzenle-btn--kaydet"
          onClick={kaydet}
          disabled={kaydediliyor || !onKaydet}
        >
          <ModalTusIcerik
            metin={kaydediliyor ? 'Kaydediliyor…' : 'Kaydet'}
            kisayol="Enter"
          />
        </button>
      </footer>
    </div>
  );
}
