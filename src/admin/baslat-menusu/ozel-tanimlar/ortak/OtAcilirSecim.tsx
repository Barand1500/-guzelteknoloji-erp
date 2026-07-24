import {
  FormAcilirSecim,
  type FormAcilirSecimProps,
} from '@/formlar/FormAcilirSecim';

/** Özel Tanımlar: aranabilir combobox — scroll + filtre */
export function OtAcilirSecim(props: FormAcilirSecimProps) {
  return (
    <FormAcilirSecim
      {...props}
      aranabilir
      bosEtiket={props.bosEtiket ?? 'Aramak istediğinizi yazın'}
      aramaPlaceholder={props.aramaPlaceholder ?? 'Aramak istediğinizi yazın'}
      listeMaxYukseklik={props.listeMaxYukseklik ?? 220}
    />
  );
}
