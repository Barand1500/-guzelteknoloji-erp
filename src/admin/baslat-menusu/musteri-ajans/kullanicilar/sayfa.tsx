import { useRollerTasarimModu } from '@/admin/kancalar/useRollerTasarimModu';
import { KullanicilarSayfasiYeni } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/KullanicilarSayfasiYeni';
import { KullanicilarSayfasiEski } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/KullanicilarSayfasiEski';

export function KullanicilarSayfasi() {
  const tasarim = useRollerTasarimModu();
  if (tasarim === 'eski-sade') return <KullanicilarSayfasiEski />;
  return <KullanicilarSayfasiYeni />;
}
