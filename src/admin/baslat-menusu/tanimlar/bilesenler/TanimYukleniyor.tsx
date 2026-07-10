export function TanimYukleniyor({ metin = 'Yükleniyor…' }: { metin?: string }) {
  return (
    <div className="ap-tanimlar-yukleniyor" role="status" aria-live="polite">
      <div className="ap-tanimlar-yukleniyor-cubuk" aria-hidden />
      <span>{metin}</span>
    </div>
  );
}
