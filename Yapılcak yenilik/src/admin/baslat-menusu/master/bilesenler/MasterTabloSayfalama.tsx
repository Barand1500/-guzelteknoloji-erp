interface MasterTabloSayfalamaProps {
  toplam: number;
  sayfa: number;
  sayfaBoyutu: number;
  onSayfaDegistir: (sayfa: number) => void;
  onSayfaBoyutuDegistir: (boyut: number) => void;
  boyutSecenekleri?: number[];
}

export function MasterTabloSayfalama({
  toplam,
  sayfa,
  sayfaBoyutu,
  onSayfaDegistir,
  onSayfaBoyutuDegistir,
  boyutSecenekleri = [5, 10, 20],
}: MasterTabloSayfalamaProps) {
  const sayfaSayisi = Math.max(1, Math.ceil(toplam / sayfaBoyutu));
  const gosterilenBas = toplam === 0 ? 0 : sayfa * sayfaBoyutu + 1;
  const gosterilenSon = Math.min(toplam, (sayfa + 1) * sayfaBoyutu);

  return (
    <div className="ap-master-tablo-sayfalama">
      <div className="ap-master-tablo-sayfalama-sol">
        <span className="ap-muted text-xs">
          {toplam === 0 ? 'Kayıt yok' : `${gosterilenBas}–${gosterilenSon} / ${toplam}`}
        </span>
        <label className="ap-master-tablo-sayfalama-boyut">
          <span className="ap-muted text-xs">Sayfa</span>
          <select
            className="ap-master-tablo-sayfalama-select"
            value={sayfaBoyutu}
            onChange={(e) => {
              onSayfaBoyutuDegistir(Number(e.target.value));
              onSayfaDegistir(0);
            }}
            aria-label="Sayfa başına kayıt"
          >
            {boyutSecenekleri.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="ap-seo-sayfalama">
        <button
          type="button"
          className="ap-seo-sayfa-btn"
          disabled={sayfa <= 0}
          onClick={() => onSayfaDegistir(sayfa - 1)}
        >
          Önceki
        </button>
        <span className="ap-muted text-xs">
          {sayfa + 1} / {sayfaSayisi}
        </span>
        <button
          type="button"
          className="ap-seo-sayfa-btn"
          disabled={sayfa >= sayfaSayisi - 1}
          onClick={() => onSayfaDegistir(sayfa + 1)}
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}
