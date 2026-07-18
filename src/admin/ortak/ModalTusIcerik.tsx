interface ModalTusIcerikProps {
  metin: string;
  kisayol?: string;
}

export function ModalTusIcerik({ metin, kisayol }: ModalTusIcerikProps) {
  return (
    <>
      <span className="ap-modal-tus-metin">{metin}</span>
      {kisayol ? <span className="ap-modal-tus-kisayol">({kisayol})</span> : null}
    </>
  );
}
