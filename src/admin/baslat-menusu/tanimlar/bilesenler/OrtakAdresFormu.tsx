import type { AdresFormDegeri } from '@/admin/baslat-menusu/tanimlar/tipler';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import {
  ilcelerIlIle,
  TURKIYE_IL_ADLARI,
} from '@/admin/baslat-menusu/tanimlar/veri/vergiDaireleriVeri';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';

interface OrtakAdresFormuProps {
  deger: AdresFormDegeri;
  onChange: (deger: AdresFormDegeri) => void;
}

export function OrtakAdresFormu({ deger, onChange }: OrtakAdresFormuProps) {
  const ilceSecenekleri = ilcelerIlIle(deger.il);

  const alan = (k: keyof AdresFormDegeri, etiket: string, genis = false, kural?: Parameters<typeof TanimGirdi>[0]['kural']) => (
    <TanimGirdi
      className={genis ? 'md:col-span-2' : undefined}
      etiket={etiket}
      deger={deger[k]}
      kural={kural ?? 'serbestMetin'}
      maxLength={k === 'ilce' ? 50 : k === 'mahalle' || k === 'cadde' || k === 'sokak' ? 100 : k === 'bina' ? 50 : undefined}
      onChange={(v) => onChange({ ...deger, [k]: v })}
    />
  );

  return (
    <fieldset className="space-y-2">
      <legend className="ap-heading mb-2 text-sm font-semibold">Adres</legend>
      <div className="grid gap-3 md:grid-cols-2 md:items-end">
        <label className="block">
          <span className="ap-muted mb-1 block text-xs">İl</span>
          <FormAramaSecim
            value={deger.il}
            onChange={(il) => onChange({ ...deger, il, ilce: il !== deger.il ? '' : deger.ilce })}
            secenekler={TURKIYE_IL_ADLARI}
            placeholder="Yazın veya listeden seçin"
            aria-label="İl"
          />
        </label>
        <label className="block">
          <span className="ap-muted mb-1 block text-xs">İlçe</span>
          <FormAramaSecim
            value={deger.ilce}
            onChange={(ilce) => onChange({ ...deger, ilce })}
            secenekler={ilceSecenekleri}
            placeholder={deger.il ? 'Yazın veya listeden seçin' : 'Önce il seçin'}
            aria-label="İlçe"
          />
        </label>
        {alan('mahalle', 'Mahalle', true)}
        {alan('cadde', 'Cadde')}
        {alan('sokak', 'Sokak')}
        {alan('bina', 'Bina')}
        <TanimGirdi
          etiket="No"
          deger={deger.no}
          kural="binaNo"
          onChange={(v) => onChange({ ...deger, no: v })}
        />
        <TanimGirdi
          etiket="Posta Kodu"
          deger={deger.postaKodu}
          kural="postaKodu"
          onChange={(v) => onChange({ ...deger, postaKodu: v })}
        />
      </div>
    </fieldset>
  );
}
