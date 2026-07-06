interface SatisRaporAltCubukProps {
  miktarToplam: number;
  tutarToplam: number;
  subeEtiket: string;
  onSubeDepartman: () => void;
  onExcel: () => void;
  excelAktif?: boolean;
  tutarEtiket?: string;
  miktarEtiket?: string;
  ozetTutarOnce?: boolean;
}

function para(deger: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(deger);
}

export function SatisRaporAltCubuk({
  miktarToplam,
  tutarToplam,
  subeEtiket,
  onSubeDepartman,
  onExcel,
  excelAktif = true,
  tutarEtiket = 'Tutar',
  miktarEtiket = 'Miktar',
  ozetTutarOnce = false,
}: SatisRaporAltCubukProps) {
  const miktarKutu = (
    <div className="ap-satis-rapor-ozet-kutu">
      <span className="ap-satis-rapor-ozet-etiket">{miktarEtiket}</span>
      <strong>{miktarToplam}</strong>
    </div>
  );
  const tutarKutu = (
    <div className="ap-satis-rapor-ozet-kutu">
      <span className="ap-satis-rapor-ozet-etiket">{tutarEtiket}</span>
      <strong>{para(tutarToplam)}</strong>
    </div>
  );

  return (
    <footer className="ap-satis-rapor-alt">
      <div className="ap-satis-rapor-alt-sol">
        <button type="button" className="ap-satis-rapor-sube-tus" onClick={onSubeDepartman}>
          Şube / Departman
          {subeEtiket && <span className="ap-satis-rapor-sube-etiket">{subeEtiket}</span>}
        </button>
      </div>

      <div className="ap-satis-rapor-alt-ozet">
        {ozetTutarOnce ? (
          <>
            {tutarKutu}
            {miktarKutu}
          </>
        ) : (
          <>
            {miktarKutu}
            {tutarKutu}
          </>
        )}
      </div>

      <div className="ap-satis-rapor-alt-sag">
        <button type="button" className="ap-satis-rapor-aksiyon-tus" onClick={onExcel} disabled={!excelAktif}>
          Excel
        </button>
      </div>
    </footer>
  );
}
