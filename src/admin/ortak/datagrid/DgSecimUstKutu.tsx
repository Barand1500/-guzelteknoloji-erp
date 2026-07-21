/**
 * Seçim işlemleri kutusu — DataGrid üst barı ve modül başlığı için ortak.
 * Sıra: Aktif Yap · Pasif Yap · | · N kayıt seçili · Dışa Aktar · Seçimi Temizle
 */
export function DgSecimUstKutu({
  sayi,
  durumTuslari = true,
  onAktif,
  onPasif,
  onDisaAktar,
  onTemizle,
}: {
  sayi: number;
  durumTuslari?: boolean;
  onAktif?: () => void;
  onPasif?: () => void;
  onDisaAktar: () => void;
  onTemizle: () => void;
}) {
  if (sayi <= 0) return null;

  return (
    <div className="dg-secim-ust-kutu" role="group" aria-label="Seçim işlemleri">
      {durumTuslari ? (
        <>
          <button type="button" className="dg-tus dg-secim-ust-tus" onClick={onAktif}>
            Aktif Yap
          </button>
          <button type="button" className="dg-tus dg-secim-ust-tus" onClick={onPasif}>
            Pasif Yap
          </button>
          <span className="dg-secim-ust-ayrac" aria-hidden />
        </>
      ) : null}
      <span className="dg-secim-ust-metin">{sayi} kayıt seçili</span>
      <button type="button" className="dg-tus dg-secim-ust-tus" onClick={onDisaAktar}>
        Dışa Aktar
      </button>
      <button type="button" className="dg-tus dg-secim-ust-tus" onClick={onTemizle}>
        Seçimi Temizle
      </button>
    </div>
  );
}
