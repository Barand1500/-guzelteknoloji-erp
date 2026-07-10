import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';

interface OrtakDurumAlaniProps {
  aktif: boolean;
  onChange: (aktif: boolean) => void;
}

export function OrtakDurumAlani({ aktif, onChange }: OrtakDurumAlaniProps) {
  return (
    <DurumAnahtari
      etiket="Aktif"
      acik={aktif}
      onChange={onChange}
      renk="yesil"
      ikon="✅"
    />
  );
}
