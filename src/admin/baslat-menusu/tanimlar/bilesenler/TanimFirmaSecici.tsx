import type { AdminFirma } from '@/admin/baslat-menusu/tanimlar/tipler';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';

interface TanimFirmaSeciciProps {
  firmalar: AdminFirma[];
  value: string;
  onChange?: (firmaId: string) => void;
  /** Düzenleme veya toplu kurulumda MERKEZ şube gibi bağlı firma değiştirilemez */
  saltOkunur?: boolean;
}

export function TanimFirmaSecici({
  firmalar,
  value,
  onChange,
  saltOkunur = false,
}: TanimFirmaSeciciProps) {
  const secenekler = firmalar.map((f) => ({
    value: f.id,
    label: `${f.firmaKodu} — ${f.firmaAdi}`,
  }));

  return (
    <label className="ap-tanimlar-secim-alan block">
      <span className="ap-tanim-girdi-etiket">Firma *</span>
      <FormAcilirSecim
        value={value}
        onChange={onChange ?? (() => {})}
        secenekler={secenekler}
        disabled={saltOkunur || !onChange}
      />
    </label>
  );
}

export function firmaEtiketi(firmalar: AdminFirma[], firmaId: string): string {
  const firma = firmalar.find((f) => f.id === firmaId);
  return firma ? `${firma.firmaKodu} — ${firma.firmaAdi}` : '—';
}
