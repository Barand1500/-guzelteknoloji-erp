import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';

interface RaporlarBosSayfaProps {
  baslik: string;
  aciklama?: string;
}

export function RaporlarBosSayfa({ baslik, aciklama }: RaporlarBosSayfaProps) {
  return (
    <AdminModulKabuk baslik={baslik} aciklama={aciklama} onizleGoster={false}>
      <AdminPanelKarti baslik="Rapor hazırlanıyor" altBaslik="Bu sayfa yakında doldurulacak">
        <div className="ap-master-bos-durum py-10">
          <p className="text-4xl" aria-hidden>
            📊
          </p>
          <p className="ap-heading mt-4 text-sm font-semibold">{baslik}</p>
          <p className="ap-muted mt-2 max-w-md text-sm">
            Rapor modülü iskeleti oluşturuldu. Filtre, tablo ve dışa aktarma ekranları sırayla eklenecek.
          </p>
        </div>
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
