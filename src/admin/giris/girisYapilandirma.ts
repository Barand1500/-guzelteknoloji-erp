/**
 * Login sol panel gorseli — .env ile degistirilebilir.
 * Ornek: VITE_GIRIS_GORSEL_URL=/giris-panel.jpg
 */
export const GIRIS_GORSEL_URL = (import.meta.env.VITE_GIRIS_GORSEL_URL ?? '').trim();

export const GIRIS_SITE_URL = 'https://guzelteknoloji.com/';

export const GIRIS_TEKNOPARK_METIN = '+90 850 885 12 60';
export const GIRIS_GSM_METIN = '+90 540 885 12 60';
export const GIRIS_TEKNOPARK_HREF = 'tel:+908508851260';
export const GIRIS_GSM_HREF = 'tel:+905408851260';
export const GIRIS_WHATSAPP_HREF = 'https://wa.me/905408851260';
export const GIRIS_DESTEK_EPOSTA = 'destek@guzelteknoloji.com';

export const GIRIS_ILETISIM = [
  {
    id: 'telefon',
    baslik: 'Telefon',
    alt: GIRIS_TEKNOPARK_METIN,
    href: GIRIS_TEKNOPARK_HREF,
    yeniSekme: false,
  },
  {
    id: 'whatsapp',
    baslik: 'WhatsApp',
    alt: GIRIS_GSM_METIN,
    href: GIRIS_WHATSAPP_HREF,
    yeniSekme: true,
  },
  {
    id: 'eposta',
    baslik: 'E-Posta',
    alt: GIRIS_DESTEK_EPOSTA,
    href: `mailto:${GIRIS_DESTEK_EPOSTA}`,
    yeniSekme: false,
    genis: true,
  },
  {
    id: 'destek',
    baslik: 'Destek',
    alt: 'ONLINE DESTEK',
    href: `mailto:${GIRIS_DESTEK_EPOSTA}?subject=ERP%20Online%20Destek`,
    yeniSekme: false,
  },
] as const;
