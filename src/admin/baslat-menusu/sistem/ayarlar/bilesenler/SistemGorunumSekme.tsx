import type { SistemAyarlariForm } from '@/admin/baslat-menusu/sistem/ayarlar/tipler';
import { VarsayilanAyarlarAkordiyon } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/VarsayilanAyarlarAkordiyon';

interface SistemGorunumSekmeProps {
  form: SistemAyarlariForm;
  onChange: (form: SistemAyarlariForm) => void;
}

export function SistemGorunumSekme({ form, onChange }: SistemGorunumSekmeProps) {
  return (
    <div className="ap-gorunum-sekme">
      <VarsayilanAyarlarAkordiyon form={form} onChange={onChange} />
    </div>
  );
}
