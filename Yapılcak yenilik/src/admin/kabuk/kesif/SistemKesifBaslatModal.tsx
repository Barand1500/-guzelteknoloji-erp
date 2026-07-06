import { SISTEM_KESIF_TURLARI } from '@/admin/kabuk/kesif/veri-kesif';

interface SistemKesifBaslatModalProps {
  acik: boolean;
  onKapat: () => void;
  onTurBaslat: (turId: string) => void;
}

export function SistemKesifBaslatModal({ acik, onKapat, onTurBaslat }: SistemKesifBaslatModalProps) {
  if (!acik) return null;

  const konular = SISTEM_KESIF_TURLARI.filter((t) => t.id !== 'tam-tur');

  return (
    <div className="ap-kesif-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="kesif-modal-baslik">
      <button type="button" className="ap-kesif-modal-backdrop" aria-label="Kapat" onClick={onKapat} />
      <div className="ap-kesif-modal">
        <header className="ap-kesif-modal-header">
          <div>
            <p className="ap-kesif-modal-etiket">İnteraktif tanıtım</p>
            <h2 id="kesif-modal-baslik" className="ap-kesif-modal-baslik">
              ✨ Sistemi Keşfet
            </h2>
            <p className="ap-kesif-modal-alt">
              Paneli adım adım gezin; oklar ve vurgularla her bölümü canlı olarak görün.
            </p>
          </div>
          <button type="button" className="ap-kesif-modal-kapat" onClick={onKapat} aria-label="Kapat">
            ✕
          </button>
        </header>

        <div className="ap-kesif-modal-tam-tur">
          <button type="button" className="ap-kesif-tam-tur-btn" onClick={() => onTurBaslat('tam-tur')}>
            <span className="ap-kesif-tam-tur-ikon">🚀</span>
            <span>
              <strong>Tam Turu Başlat</strong>
              <small>Panel arayüzü + dashboard — yaklaşık 2 dk</small>
            </span>
            <span className="ap-kesif-tam-tur-ok">→</span>
          </button>
        </div>

        <p className="ap-kesif-konu-etiket">Belirli bir konu seçin</p>
        <div className="ap-kesif-konu-grid">
          {konular.map((tur) => (
            <button
              key={tur.id}
              type="button"
              className="ap-kesif-konu-kart"
              onClick={() => onTurBaslat(tur.id)}
            >
              <span className="ap-kesif-konu-ikon">{tur.ikon}</span>
              <span className="ap-kesif-konu-baslik">{tur.baslik}</span>
              <span className="ap-kesif-konu-aciklama">{tur.aciklama}</span>
              <span className="ap-kesif-konu-adim">{tur.adimlar.length} adım</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
