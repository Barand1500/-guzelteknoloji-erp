import { CariSekme } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariSekme';
import { AdminModulKabuk } from '@/admin/ortak/AdminBilesenleri';
import { YetkisizErisim } from '@/admin/ortak/YetkisizErisim';
import { useYetkiler } from '@/kancalar/useYetkiler';
import '@/admin/baslat-menusu/tanimlar/tanimlar.css';

export function CariSayfasi() {
  const { goruntulemeVar } = useYetkiler();

  if (!goruntulemeVar) {
    return (
      <AdminModulKabuk
        baslik="Cari Kartlar"
        aciklama="Müşteri ve tedarikçi cari kart tanımları"
        onizleGoster={false}
      >
        <YetkisizErisim aciklama="Cari kartları görmek için Görüntüleme yetkisi gerekir." />
      </AdminModulKabuk>
    );
  }

  return (
    <AdminModulKabuk
      baslik="Cari Kartlar"
      aciklama="Müşteri ve tedarikçi cari kart tanımları"
    >
      <CariSekme />
    </AdminModulKabuk>
  );
}
