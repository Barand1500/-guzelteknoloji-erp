import { DonenMaviCerceve } from '@/admin/giris/DonenMaviCerceve';

const IKONLAR = {
  telefon: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.56 1 1 0 0 1-.25 1.01l-2.2 2.22Z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  ),
  eposta: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z" />
    </svg>
  ),
  destek: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a8 8 0 0 0-8 8v5a3 3 0 0 0 3 3h1v-6H5a6 6 0 1 1 12 0h-1v6h1a3 3 0 0 0 3-3v-5a8 8 0 0 0-8-8Zm-1 17h2v2h-2v-2Z" />
    </svg>
  ),
} as const;

interface GirisIletisimKartProps {
  id: keyof typeof IKONLAR;
  baslik: string;
  alt?: string;
  satirlar?: readonly string[];
  href: string;
  yeniSekme?: boolean;
  genis?: boolean;
}

export function GirisIletisimKart({
  id,
  baslik,
  alt,
  satirlar,
  href,
  yeniSekme = false,
  genis = false,
}: GirisIletisimKartProps) {
  const etiket = satirlar?.join(' / ') ?? alt ?? baslik;

  return (
    <DonenMaviCerceve
      className={`erp-giris-iletisim-donen${genis ? ' erp-giris-iletisim-donen--genis' : ''}${satirlar ? ' erp-giris-iletisim-donen--coksatir' : ''}`}
    >
      <a
        href={href}
        target={yeniSekme ? '_blank' : undefined}
        rel={yeniSekme ? 'noopener noreferrer' : undefined}
        className="erp-giris-iletisim-kutu"
        aria-label={`${baslik}: ${etiket}`}
      >
        <span className="erp-giris-iletisim-ikon">{IKONLAR[id]}</span>
        <span className="erp-giris-iletisim-yazi">
          {satirlar ? (
            satirlar.map((satir) => (
              <span key={satir} className="erp-giris-iletisim-alt">
                {satir}
              </span>
            ))
          ) : (
            <span className="erp-giris-iletisim-alt">{alt}</span>
          )}
        </span>
      </a>
    </DonenMaviCerceve>
  );
}
