import { CariOutlinedAcilir } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedAcilir';
import { CariOutlinedGirdi } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedGirdi';
import { EFATURA_EVET_HAYIR } from '@/admin/baslat-menusu/erp/cari/tipler';
import type { StokForm } from './tipler';

type EnvanterDetayForm = Pick<
  StokForm,
  | 'asgariStok'
  | 'azamiStok'
  | 'seriNoZorunlu'
  | 'seriNoOneki'
  | 'lotZorunlu'
  | 'sktTakibi'
  | 'lotOneki'
  | 'rafOmruGun'
  | 'opsGun'
  | 'sktZorunlu'
>;

export function StokEnvanterTakibiDetay({
  envanterTakibi,
  form,
  disabled = false,
  onAlan,
}: {
  envanterTakibi: string;
  form: EnvanterDetayForm;
  disabled?: boolean;
  onAlan: <K extends keyof EnvanterDetayForm>(alan: K, deger: EnvanterDetayForm[K]) => void;
}) {
  const tip = envanterTakibi || 'YOK';
  if (tip === 'YOK') return null;

  const evetHayir = [...EFATURA_EVET_HAYIR];

  if (tip === 'NORMAL') {
    return (
      <>
        <CariOutlinedGirdi
          etiket="Alt Limit"
          deger={form.asgariStok}
          disabled={disabled}
          inputMode="numeric"
          odakPlaceholder="0"
          onChange={(asgariStok) => onAlan('asgariStok', asgariStok)}
        />
        <CariOutlinedGirdi
          etiket="Üst Limit"
          deger={form.azamiStok}
          disabled={disabled}
          inputMode="numeric"
          odakPlaceholder="0"
          onChange={(azamiStok) => onAlan('azamiStok', azamiStok)}
        />
      </>
    );
  }

  if (tip === 'SERI_NO') {
    return (
      <>
        <CariOutlinedAcilir
          etiket="Seri No Zorunlu"
          deger={form.seriNoZorunlu || 'HAYIR'}
          disabled={disabled}
          secenekler={evetHayir}
          onChange={(seriNoZorunlu) => onAlan('seriNoZorunlu', seriNoZorunlu)}
        />
        <CariOutlinedGirdi
          etiket="Seri No Öneki"
          deger={form.seriNoOneki}
          disabled={disabled}
          maxLength={20}
          buyukHarf
          odakPlaceholder="Örn. SN-"
          onChange={(seriNoOneki) => onAlan('seriNoOneki', seriNoOneki)}
        />
      </>
    );
  }

  if (tip === 'LOT') {
    return (
      <>
        <CariOutlinedAcilir
          etiket="LOT Zorunlu"
          deger={form.lotZorunlu || 'HAYIR'}
          disabled={disabled}
          secenekler={evetHayir}
          onChange={(lotZorunlu) => onAlan('lotZorunlu', lotZorunlu)}
        />
        <CariOutlinedAcilir
          etiket="SKT Takibi"
          deger={form.sktTakibi || 'HAYIR'}
          disabled={disabled}
          secenekler={evetHayir}
          onChange={(sktTakibi) => onAlan('sktTakibi', sktTakibi)}
        />
        <CariOutlinedGirdi
          etiket="LOT Öneki"
          deger={form.lotOneki}
          disabled={disabled}
          maxLength={20}
          buyukHarf
          odakPlaceholder="Örn. LOT-"
          onChange={(lotOneki) => onAlan('lotOneki', lotOneki)}
        />
      </>
    );
  }

  if (tip === 'OMUR') {
    return (
      <>
        <CariOutlinedAcilir
          etiket="SKT Zorunlu"
          deger={form.sktZorunlu || 'HAYIR'}
          disabled={disabled}
          secenekler={evetHayir}
          onChange={(sktZorunlu) => onAlan('sktZorunlu', sktZorunlu)}
        />
        <CariOutlinedGirdi
          etiket="Raf Ömrü (Gün)"
          deger={form.rafOmruGun}
          disabled={disabled}
          inputMode="numeric"
          odakPlaceholder="0"
          onChange={(rafOmruGun) => onAlan('rafOmruGun', rafOmruGun)}
        />
        <CariOutlinedGirdi
          etiket="Risk (Gün)"
          deger={form.opsGun}
          disabled={disabled}
          inputMode="numeric"
          odakPlaceholder="0"
          onChange={(opsGun) => onAlan('opsGun', opsGun)}
        />
      </>
    );
  }

  return null;
}
