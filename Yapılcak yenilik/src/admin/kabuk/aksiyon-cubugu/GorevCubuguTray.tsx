interface GorevCubuguTrayProps {
  logAcik: boolean;
  yedekAcik: boolean;
  onLogToggle: () => void;
  onYedekToggle: () => void;
}

export function GorevCubuguTray({ logAcik, yedekAcik, onLogToggle, onYedekToggle }: GorevCubuguTrayProps) {
  return (
    <div className="ap-tray-grup flex items-center gap-1" data-ap-kesif="gorev-tray">
      <button
        type="button"
        onClick={onYedekToggle}
        className={`ap-tray-ikon ${yedekAcik ? 'ap-tray-ikon-aktif' : ''}`}
        title="Veri Yedekleme"
        aria-label="Veri Yedekleme"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onLogToggle}
        className={`ap-tray-ikon ${logAcik ? 'ap-tray-ikon-aktif' : ''}`}
        title="Log Takibi"
        aria-label="Log Takibi"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>
    </div>
  );
}
