import { FaturaModulu } from '@/admin/baslat-menusu/erp/belgeler/FaturaModulu';

/** Eski yol uyumluluğu — birleşik Belgeler ekranına yönlendirir */
export function SatisFaturasiSayfasi() {
  return <FaturaModulu modulId="belgeler" baslik="Belgeler" />;
}
