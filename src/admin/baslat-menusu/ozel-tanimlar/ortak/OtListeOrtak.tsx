import type { ReactNode } from 'react';

/** Ortak satır aksiyon butonları (# sütunu) */
export function OtIslemButonlari({
  onDuzenle,
  onSil,
  onGoz,
  gozBaslik = 'Görüntüle',
  gozYeri = false,
}: {
  onDuzenle: () => void;
  onSil: () => void;
  onGoz?: () => void;
  gozBaslik?: string;
  /** true ise göz kolonu her satırda rezerve edilir (kayma olmaz) */
  gozYeri?: boolean;
}) {
  const gozKolonu = gozYeri || Boolean(onGoz);

  return (
    <div className={`ot-pb-islem-grup${gozKolonu ? ' ot-pb-islem-grup--goz' : ''}`}>
      {gozKolonu ? (
        onGoz ? (
          <button
            type="button"
            className="ot-pb-islem-btn ot-bk-goz-btn"
            title={gozBaslik}
            aria-label={gozBaslik}
            onClick={onGoz}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        ) : (
          <span className="ot-pb-islem-btn ot-pb-islem-btn-bos" aria-hidden />
        )
      ) : null}
      <button type="button" className="ot-pb-islem-btn" title="Düzenle" aria-label="Düzenle" onClick={onDuzenle}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M12 20h9" strokeLinecap="round" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className="ot-pb-islem-btn ot-pb-islem-btn-sil"
        title="Sil"
        aria-label="Sil"
        onClick={onSil}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M3 6h18" strokeLinecap="round" />
          <path d="M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinejoin="round" />
          <path d="M10 11v6M14 11v6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function OtSayfaAksiyonlari({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <div className="ot-pb-ust-aksiyonlar">{children}</div>;
}

/** @deprecated Başlık kaldırıldı — OtSayfaAksiyonlari veya kontroller satırını kullanın */
export function OtSayfaBaslik({
  ustAksiyon,
}: {
  baslik?: string;
  ustAksiyon?: ReactNode;
}) {
  return <OtSayfaAksiyonlari>{ustAksiyon}</OtSayfaAksiyonlari>;
}

export function OtSayfalama({
  guvenliSayfa,
  toplamSayfa,
  baslangic,
  bitis,
  toplam,
  onSayfa,
}: {
  guvenliSayfa: number;
  toplamSayfa: number;
  baslangic: number;
  bitis: number;
  toplam: number;
  onSayfa: (n: number) => void;
}) {
  return (
    <div className="ot-pb-alt">
      <p className="ap-muted text-sm">
        {toplam === 0
          ? 'Kayıt yok.'
          : `${baslangic + 1} ile ${bitis} arasında veri gösteriliyor. Toplam: ${toplam}`}
      </p>
      <div className="ot-pb-sayfalama">
        <button
          type="button"
          className="ot-pb-sayfa-tus"
          disabled={guvenliSayfa <= 1}
          onClick={() => onSayfa(Math.max(1, guvenliSayfa - 1))}
        >
          Geri
        </button>
        {Array.from({ length: toplamSayfa }, (_, i) => i + 1)
          .filter((n) => n === 1 || n === toplamSayfa || Math.abs(n - guvenliSayfa) <= 2)
          .map((n, idx, arr) => {
            const onceki = arr[idx - 1];
            const bosluk = onceki && n - onceki > 1;
            return (
              <span key={n} className="inline-flex items-center gap-0.5">
                {bosluk ? <span className="ap-muted px-1">…</span> : null}
                <button
                  type="button"
                  className={`ot-pb-sayfa-tus${n === guvenliSayfa ? ' ot-pb-sayfa-aktif' : ''}`}
                  onClick={() => onSayfa(n)}
                >
                  {n}
                </button>
              </span>
            );
          })}
        <button
          type="button"
          className="ot-pb-sayfa-tus"
          disabled={guvenliSayfa >= toplamSayfa}
          onClick={() => onSayfa(Math.min(toplamSayfa, guvenliSayfa + 1))}
        >
          İleri
        </button>
      </div>
    </div>
  );
}

export const OT_SAYFA_SECENEKLERI = [10, 25, 50] as const;

export function otSayfaDilimleri<T>(liste: T[], sayfa: number, sayfaBoyutu: number) {
  const toplamSayfa = Math.max(1, Math.ceil(liste.length / sayfaBoyutu));
  const guvenliSayfa = Math.min(sayfa, toplamSayfa);
  const baslangic = (guvenliSayfa - 1) * sayfaBoyutu;
  const kayitlar = liste.slice(baslangic, baslangic + sayfaBoyutu);
  const bitis = Math.min(baslangic + kayitlar.length, liste.length);
  return { toplamSayfa, guvenliSayfa, baslangic, kayitlar, bitis };
}
