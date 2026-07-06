import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';

interface TanimlarBosSayfaProps {
  baslik: string;
  aciklama?: string;
}

export function TanimlarBosSayfa({ baslik, aciklama }: TanimlarBosSayfaProps) {
  return (
    <AdminModulKabuk baslik={baslik} aciklama={aciklama} onizleGoster={false}>
      <AdminPanelKarti baslik="İçerik hazırlanıyor" altBaslik="Bu sayfa yakında doldurulacak">
        <div className="ap-master-bos-durum py-10">
          <p className="text-4xl" aria-hidden>
            📋
          </p>
          <p className="ap-heading mt-4 text-sm font-semibold">{baslik}</p>
          <p className="ap-muted mt-2 max-w-md text-sm">
            Tanımlar modülü iskeleti oluşturuldu. Kayıt ekleme ve düzenleme ekranları sonraki adımda eklenecek.
          </p>
        </div>
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
