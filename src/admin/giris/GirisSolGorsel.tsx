import { GIRIS_GORSEL_URL } from '@/admin/giris/girisYapilandirma';

interface GirisSolGorselProps {
  gorselUrl?: string;
  altMetin?: string;
}

/** Sol panel logo / degistirilebilir gorsel (eski kompakt tasarim) */
export function GirisSolGorsel({
  gorselUrl = GIRIS_GORSEL_URL,
  altMetin = 'Güzel Teknoloji',
}: GirisSolGorselProps) {
  const url = gorselUrl.trim();

  return (
    <div className="erp-giris-logo-wrap mb-8 inline-flex">
      <span className="erp-giris-logo-halka" aria-hidden />
      <div className="erp-giris-logo relative inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/10 text-3xl font-bold text-white backdrop-blur">
        {url ? (
          <img src={url} alt={altMetin} className="h-full w-full object-cover" />
        ) : (
          'GT'
        )}
      </div>
    </div>
  );
}
