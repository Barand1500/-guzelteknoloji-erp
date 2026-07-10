interface ModalTusIcerikProps {
  metin: string;
  kisayol?: 'Esc' | 'Enter';
}

export function ModalTusIcerik({ metin, kisayol }: ModalTusIcerikProps) {
  return (
    <>
      <span className="ap-modal-tus-metin">{metin}</span>
      {kisayol ? <span className="ap-modal-tus-kisayol">({kisayol})</span> : null}
    </>
  );
}
