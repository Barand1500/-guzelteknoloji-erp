import type { TanimlarSekmeId } from '@/admin/baslat-menusu/tanimlar/tipler';
import { tanimlarSekmeBul } from '@/admin/baslat-menusu/tanimlar/tipler';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

interface TanimlarBosSekmeProps {
  sekme: TanimlarSekmeId;
}

export function TanimlarBosSekme({ sekme }: TanimlarBosSekmeProps) {
  const tanim = tanimlarSekmeBul(sekme);

  useModulAksiyonlari(
    {},
    {
      kaydet: false,
      ekle: false,
      sil: false,
      onizle: false,
      yayinla: false,
    }
  );

  return (
    <div className="ap-master-bos-durum py-10">
      <p className="text-4xl" aria-hidden>
        {tanim.ikon}
      </p>
      <p className="ap-heading mt-4 text-sm font-semibold">{tanim.ad}</p>
      <p className="ap-muted mt-2 max-w-md text-sm">
        Bu sekmenin içeriği henüz eklenmedi. Kayıt listesi ve formlar sonraki adımda doldurulacak.
      </p>
    </div>
  );
}
