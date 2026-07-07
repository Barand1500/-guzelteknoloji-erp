import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';

interface AyarlarBosSayfaProps {
  baslik: string;
  aciklama?: string;
}

export function AyarlarBosSayfa({ baslik, aciklama }: AyarlarBosSayfaProps) {
  return (
    <AdminModulKabuk baslik={baslik} aciklama={aciklama} onizleGoster={false}>
      <AdminPanelKarti baslik="Ayar ekranı hazırlanıyor" altBaslik="Bu sayfa yakında doldurulacak">
        <div className="ap-master-bos-durum py-10">
          <p className="text-4xl" aria-hidden>
            ⚙️
          </p>
          <p className="ap-heading mt-4 text-sm font-semibold">{baslik}</p>
          <p className="ap-muted mt-2 max-w-md text-sm">
            Ayar modülü iskeleti oluşturuldu. Yapılandırma alanları sonraki adımda eklenecek.
          </p>
        </div>
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
