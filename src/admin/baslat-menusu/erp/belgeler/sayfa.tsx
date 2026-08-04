import { FaturaModulu } from '@/admin/baslat-menusu/erp/belgeler/FaturaModulu';

export function BelgelerSayfasi({ onModulAc }: { onModulAc?: (modulId: string) => void } = {}) {
  return <FaturaModulu modulId="belgeler" baslik="Belgeler" onModulAc={onModulAc} />;
}
