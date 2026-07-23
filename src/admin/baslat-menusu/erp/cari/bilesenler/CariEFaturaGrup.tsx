import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { EFATURA_EVET_HAYIR, FATURA_TIPLERI } from '../tipler';
import { CariOutlinedSarmalayici } from './CariOutlinedGirdi';

export function CariEFaturaGrup({
  efatura,
  onEfaturaChange,
  tip,
  onTipChange,
  disabled = false,
}: {
  efatura: boolean;
  onEfaturaChange: (evet: boolean) => void;
  tip: string;
  onTipChange: (tip: string) => void;
  disabled?: boolean;
}) {
  const tipAktif = efatura && !disabled;
  const tipEtiket =
    FATURA_TIPLERI.find((t) => t.value === tip)?.label ??
    FATURA_TIPLERI.find((t) => t.value === 'TEMEL')?.label ??
    'Temel';
  const durumEtiket = efatura ? 'Evet' : 'Hayır';

  return (
    <CariOutlinedSarmalayici
      etiket="E-Fatura"
      disabled={disabled}
      className="cari-outlined-acilir cari-fiyat-tanim-grup cari-efatura-grup"
    >
      <div className="cari-fiyat-tanim-grup-icerik" role="group" aria-label="E-Fatura">
        <div className="cari-fiyat-tanim-grup-hucre cari-fiyat-tanim-grup-hucre--tanim ap-form-acilir-secim-liste-anchor">
          <FormAcilirSecim
            value={efatura ? 'EVET' : 'HAYIR'}
            onChange={(v) => onEfaturaChange(v === 'EVET')}
            secenekler={[...EFATURA_EVET_HAYIR]}
            disabled={disabled}
            aria-label="E-Fatura"
            className="cari-outlined-acilir-tus cari-fiyat-tanim-grup-tanim"
            listeSinifi="cari-fiyat-tanim-grup-liste"
            listeAnchor="self"
            listeMinGenislik={112}
            tusMetin={durumEtiket}
          />
        </div>
        <span className="cari-fiyat-tanim-grup-ayirici" aria-hidden />
        <div
          className={`cari-fiyat-tanim-grup-hucre cari-fiyat-tanim-grup-hucre--fiyat ap-form-acilir-secim-liste-anchor${tipAktif ? '' : ' cari-efatura-grup-tip--pasif'}`}
        >
          <FormAcilirSecim
            value={tip || 'TEMEL'}
            onChange={onTipChange}
            secenekler={[...FATURA_TIPLERI]}
            disabled={!tipAktif}
            aria-label="Fatura tipi"
            className="cari-outlined-acilir-tus cari-fiyat-tanim-grup-fiyat"
            listeSinifi="cari-fiyat-tanim-grup-liste"
            listeAnchor="self"
            listeMinGenislik={140}
            tusMetin={tipEtiket}
          />
        </div>
      </div>
    </CariOutlinedSarmalayici>
  );
}
