interface TanimlarPanelGeriTusuProps {
  onGeri: () => void;
  etiket?: string;
}

export function TanimlarPanelGeriTusu({ onGeri, etiket = 'Geri' }: TanimlarPanelGeriTusuProps) {
  return (
    <button type="button" className="ap-tanimlar-panel-geri" onClick={onGeri} aria-label={etiket}>
      <span className="ap-tanimlar-panel-geri-ok" aria-hidden>
        ←
      </span>
      <span>{etiket}</span>
    </button>
  );
}
