import { LoglarSayfasi } from '@/admin/gizli-moduller/loglar/sayfa';
import { VeriYedeklemeSayfasi } from '@/admin/gizli-moduller/veri-yedekleme/sayfa';
import { SistemAyarlariSayfasi } from '@/admin/baslat-menusu/sistem/ayarlar/sayfa';
import { KullanicilarSayfasi } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/sayfa';
import { RollerSayfasi } from '@/admin/baslat-menusu/musteri-ajans/roller/sayfa';
import { SekmeYonetimiSayfasi } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/sayfa';
import { KisayolAyarlariSayfasi } from '@/admin/baslat-menusu/sistem/kisayol-ayarlari/sayfa';
import { DatagridDemoSayfasi } from '@/admin/baslat-menusu/datagrid/demo/sayfa';
import { TanimlarSayfasi } from '@/admin/baslat-menusu/tanimlar/sayfa';
import { CariSayfasi } from '@/admin/baslat-menusu/erp/cari/sayfa';
import { StoklarSayfasi } from '@/admin/baslat-menusu/erp/stoklar/StoklarSayfasi';
import { ModulKabuk } from '@/baglamlar/ModulKabukContext';

interface AdminModulIcerikProps {
  modulId: string;
  onModulAc: (modulId: string) => void;
}

export function AdminModulIcerik({ modulId, onModulAc }: AdminModulIcerikProps) {
  return (
    <ModulKabuk modulId={modulId}>
      <AdminModulGovde modulId={modulId} onModulAc={onModulAc} />
    </ModulKabuk>
  );
}

function AdminModulGovde({ modulId }: AdminModulIcerikProps) {
  switch (modulId) {
    case 'loglar':
      return <LoglarSayfasi />;
    case 'veri-yedekleme':
      return <VeriYedeklemeSayfasi />;
    case 'ayarlar':
      return <SistemAyarlariSayfasi />;
    case 'kullanicilar':
      return <KullanicilarSayfasi />;
    case 'roller':
      return <RollerSayfasi />;
    case 'sekme-yonetimi':
      return <SekmeYonetimiSayfasi />;
    case 'kisayol-ayarlari':
      return <KisayolAyarlariSayfasi />;
    case 'datagrid-demo':
      return <DatagridDemoSayfasi />;
    case 'tanimlar':
      return <TanimlarSayfasi />;
    case 'cari':
      return <CariSayfasi />;
    case 'stoklar':
      return <StoklarSayfasi />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl">🚧</p>
          <h1 className="ap-heading mt-4 text-xl font-bold">{modulId}</h1>
          <p className="ap-muted mt-2 text-sm">Bu modül bu projede tanımlı değil.</p>
        </div>
      );
  }
}
