import { useRollerTasarimModu } from '@/admin/kancalar/useRollerTasarimModu';
import { RollerSayfasiYeni } from '@/admin/baslat-menusu/musteri-ajans/roller/RollerSayfasiYeni';
import { RollerSayfasiEski } from '@/admin/baslat-menusu/musteri-ajans/roller/RollerSayfasiEski';

export function RollerSayfasi() {
  const tasarim = useRollerTasarimModu();
  if (tasarim === 'eski-sade') return <RollerSayfasiEski />;
  return <RollerSayfasiYeni />;
}
