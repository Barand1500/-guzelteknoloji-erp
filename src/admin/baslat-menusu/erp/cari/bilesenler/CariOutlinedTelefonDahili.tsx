import { CariOutlinedTelefon } from './CariOutlinedTelefon';

/** Telefon alanının içinde sağda küçük Dahili (max 4 rakam). GSM için kullanma. */
export function CariOutlinedTelefonDahili({
  deger,
  dahili,
  onChange,
  onDahiliChange,
  disabled = false,
  etiket = 'Telefon',
  dogrulaAktif = false,
  ulkeKoduGoster = true,
}: {
  deger: string;
  dahili: string;
  onChange: (deger: string) => void;
  onDahiliChange: (dahili: string) => void;
  disabled?: boolean;
  etiket?: string;
  dogrulaAktif?: boolean;
  ulkeKoduGoster?: boolean;
}) {
  return (
    <CariOutlinedTelefon
      etiket={etiket}
      deger={deger}
      disabled={disabled}
      dogrulaAktif={dogrulaAktif}
      ulkeKoduGoster={ulkeKoduGoster}
      onChange={onChange}
      dahili={dahili}
      onDahiliChange={onDahiliChange}
    />
  );
}
