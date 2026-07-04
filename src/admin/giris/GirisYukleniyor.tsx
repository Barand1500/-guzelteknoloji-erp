import { DonenMaviCerceve } from '@/admin/giris/DonenMaviCerceve';

interface GirisYukleniyorProps {
  metin?: string;
}

export function GirisYukleniyor({ metin = 'Oturum seçenekleri yükleniyor...' }: GirisYukleniyorProps) {
  return (
    <DonenMaviCerceve surekli className="erp-giris-yukleniyor-donen">
      <div className="erp-giris-yukleniyor" role="status" aria-live="polite">
        <div className="erp-giris-yukleniyor-cerceve">
          <span className="erp-giris-yukleniyor-halka erp-giris-yukleniyor-halka-1" aria-hidden />
          <span className="erp-giris-yukleniyor-halka erp-giris-yukleniyor-halka-2" aria-hidden />
          <span className="erp-giris-yukleniyor-nokta" aria-hidden />
        </div>
        <p className="erp-giris-yukleniyor-metin">{metin}</p>
      </div>
    </DonenMaviCerceve>
  );
}
