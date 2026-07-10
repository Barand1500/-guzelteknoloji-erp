interface OrtakDurumAlaniProps {
  aktif: boolean;
  onChange: (aktif: boolean) => void;
}

export function OrtakDurumAlani({ aktif, onChange }: OrtakDurumAlaniProps) {
  return (
    <div className="ap-tanimlar-aktif-satir">
      <span
        className={`ap-tanimlar-aktif-etiket ${aktif ? 'ap-tanimlar-aktif-etiket--aktif' : 'ap-tanimlar-aktif-etiket--pasif'}`}
      >
        {aktif ? 'Aktif' : 'Pasif'}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={aktif}
        aria-label={aktif ? 'Aktif' : 'Pasif'}
        onClick={() => onChange(!aktif)}
        className={`ap-tanimlar-toggle ${aktif ? 'ap-tanimlar-toggle--acik' : ''}`}
      >
        <span className="ap-tanimlar-toggle-dugme" aria-hidden />
      </button>
    </div>
  );
}
