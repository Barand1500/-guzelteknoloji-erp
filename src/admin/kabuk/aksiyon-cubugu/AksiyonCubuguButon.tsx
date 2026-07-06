import type { CSSProperties } from 'react';

interface AksiyonCubuguButonProps {
  etiket: string;
  aktif: boolean;
  geriBildirim?: 'basari' | 'hata' | null;
  onClick: () => void;
}

export function AksiyonCubuguButon({ etiket, aktif, geriBildirim, onClick }: AksiyonCubuguButonProps) {
  const pasif = !aktif && !geriBildirim;
  const harfler = [...etiket];

  return (
    <button
      type="button"
      disabled={pasif}
      onClick={onClick}
      className={[
        'ap-aksiyon-btn shrink-0',
        pasif ? 'ap-aksiyon-pasif' : '',
        geriBildirim === 'basari' ? 'ap-aksiyon-basari' : '',
        geriBildirim === 'hata' ? 'ap-aksiyon-hata' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="ap-aksiyon-btn-metin" aria-hidden={false}>
        {harfler.map((harf, i) => (
          <span
            key={`${harf}-${i}`}
            className="ap-aksiyon-harf"
            style={{ '--harf-i': i } as CSSProperties}
          >
            {harf === ' ' ? '\u00A0' : harf}
          </span>
        ))}
      </span>
    </button>
  );
}
