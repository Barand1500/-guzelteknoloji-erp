import type { EklentiKart } from '@/admin/ortak/tipler/eklenti';

function yildizGoster(puan: number) {
  const dolu = Math.round(puan);
  return '★'.repeat(dolu) + '☆'.repeat(5 - dolu);
}

function kurulumMetni(sayi: number) {
  if (sayi >= 1000) return `${Math.round(sayi / 100) / 10}K+ etkin kurulum`;
  return `${sayi}+ etkin kurulum`;
}

interface EklentiKartiProps {
  eklenti: EklentiKart;
  islemde?: boolean;
  onKur: () => void;
  onAktif: () => void;
  onPasif: () => void;
  onKaldir: () => void;
  onDetay: () => void;
}

export function EklentiKarti({
  eklenti,
  islemde,
  onKur,
  onAktif,
  onPasif,
  onKaldir,
  onDetay,
}: EklentiKartiProps) {
  const kurulu = eklenti.kurulu;
  const aktif = eklenti.durum === 'aktif';

  return (
    <article className="ap-eklenti-kart">
      <div className="ap-eklenti-kart-ust">
        <div className="ap-eklenti-kart-baslik-alan">
          <span className="ap-eklenti-kart-ikon" aria-hidden>
            {eklenti.ikon}
          </span>
          <div className="ap-eklenti-kart-baslik-metin">
            <h4 className="ap-eklenti-kart-ad">{eklenti.ad}</h4>
            <p className="ap-eklenti-kart-gelistirici">
              Geliştirici: <strong>{eklenti.gelistirici}</strong>
              {eklenti.kaynak === 'yukleme' && (
                <span className="ap-eklenti-rozet ap-eklenti-rozet-yukleme">Yüklenen</span>
              )}
            </p>
          </div>
        </div>
        <div className="ap-eklenti-kart-aksiyonlar">
          {!kurulu && (
            <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil" disabled={islemde} onClick={onKur}>
              Şimdi kur
            </button>
          )}
          {kurulu && !aktif && (
            <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil" disabled={islemde} onClick={onAktif}>
              Etkinleştir
            </button>
          )}
          {kurulu && aktif && (
            <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil" disabled={islemde} onClick={onPasif}>
              Pasifleştir
            </button>
          )}
          {kurulu && (
            <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ghost" disabled={islemde} onClick={onKaldir}>
              Kaldır
            </button>
          )}
          <button type="button" className="ap-eklenti-detay-link" onClick={onDetay}>
            Diğer ayrıntılar
          </button>
        </div>
      </div>
      <p className="ap-eklenti-kart-aciklama">{eklenti.aciklama}</p>
      <div className="ap-eklenti-kart-alt">
        <span className="ap-eklenti-puan" title={`${eklenti.puan} / 5`}>
          {yildizGoster(eklenti.puan)} ({Math.round(eklenti.puan * 20)})
        </span>
        <span>{kurulumMetni(eklenti.etkinKurulum)}</span>
        <span>Son güncelleme: {eklenti.sonGuncelleme}</span>
        <span className="ap-eklenti-uyum">✓ Uyumlu</span>
      </div>
    </article>
  );
}
