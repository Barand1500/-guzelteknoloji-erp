import type { EklentiKart } from '@/admin/ortak/tipler/eklenti';

interface EklentiDetayModalProps {
  eklenti: EklentiKart | null;
  onKapat: () => void;
}

export function EklentiDetayModal({ eklenti, onKapat }: EklentiDetayModalProps) {
  if (!eklenti) return null;

  return (
    <div className="ap-sistem-modal-arka" role="presentation" onClick={onKapat}>
      <div
        className="ap-eklenti-detay-modal"
        role="dialog"
        aria-modal
        aria-labelledby="eklenti-detay-baslik"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ap-eklenti-detay-baslik">
          <span className="ap-eklenti-kart-ikon" aria-hidden>
            {eklenti.ikon}
          </span>
          <div>
            <h3 id="eklenti-detay-baslik" className="ap-heading text-lg font-semibold">
              {eklenti.ad}
            </h3>
            <p className="ap-muted text-sm">Sürüm {eklenti.surum} — {eklenti.gelistirici}</p>
          </div>
          <button type="button" className="ap-eklenti-detay-kapat" onClick={onKapat} aria-label="Kapat">
            ×
          </button>
        </div>
        <div className="ap-eklenti-detay-icerik">
          <p>{eklenti.aciklama}</p>
          <dl className="ap-eklenti-detay-liste">
            <div>
              <dt>Durum</dt>
              <dd>
                {!eklenti.kurulu && 'Kurulu değil'}
                {eklenti.kurulu && eklenti.durum === 'aktif' && 'Etkin'}
                {eklenti.kurulu && eklenti.durum === 'pasif' && 'Pasif'}
                {eklenti.kurulu && eklenti.durum === 'kurulu' && 'Kurulu (etkin değil)'}
              </dd>
            </div>
            <div>
              <dt>Kaynak</dt>
              <dd>{eklenti.kaynak === 'yukleme' ? 'Zip yükleme' : 'Katalog'}</dd>
            </div>
            <div>
              <dt>Kategori</dt>
              <dd>{eklenti.kategori}</dd>
            </div>
            {eklenti.publicHook && (
              <div>
                <dt>Site bileşeni</dt>
                <dd>{eklenti.publicHook}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
