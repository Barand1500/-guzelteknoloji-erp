import type { BankaKisimId } from '../tipler';

/** Bölüm yokken gösterilir; tıklanınca menü sormadan Adres / İletişim ekler. */
export function BankaKisimEkle({
  acikKisismlar,
  disabled,
  onEkle,
}: {
  acikKisismlar: BankaKisimId[];
  disabled?: boolean;
  onEkle: (kisim: BankaKisimId) => void;
}) {
  if (disabled || acikKisismlar.includes('adres-iletisim')) return null;

  return (
    <div className="ba-kisim-ekle">
      <button
        type="button"
        className="ba-kisim-ekle-tus"
        onClick={() => onEkle('adres-iletisim')}
      >
        <span className="ba-kisim-ekle-ikon" aria-hidden>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <path
              d="M8 3v10M3 8h10"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        İletişim Ekle
      </button>
    </div>
  );
}
