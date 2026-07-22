import type { FormAcilirSecimSecenek } from '@/formlar/FormAcilirSecim';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { CariOutlinedSarmalayici } from './CariOutlinedGirdi';

export function CariFiyatTanimiGrup({
  etiket,
  tanimDeger,
  tanimSecenekler,
  onTanimChange,
  fiyatDeger,
  fiyatSecenekler,
  onFiyatChange,
  disabled = false,
  tanimBosMetin = 'Standart',
  fiyatBosMetin = 'Ana Fiyat',
}: {
  etiket: string;
  tanimDeger: string;
  tanimSecenekler: readonly FormAcilirSecimSecenek[];
  onTanimChange: (deger: string) => void;
  fiyatDeger: string;
  fiyatSecenekler: readonly FormAcilirSecimSecenek[];
  onFiyatChange: (deger: string) => void;
  disabled?: boolean;
  tanimBosMetin?: string;
  fiyatBosMetin?: string;
}) {
  const tanimEtiket =
    tanimSecenekler.find((s) => s.value === tanimDeger)?.label ?? tanimBosMetin;
  const fiyatEtiket =
    fiyatSecenekler.find((s) => s.value === fiyatDeger)?.label ?? fiyatBosMetin;

  return (
    <CariOutlinedSarmalayici
      etiket={etiket}
      disabled={disabled}
      className="cari-outlined-acilir cari-fiyat-tanim-grup"
    >
      <div className="cari-fiyat-tanim-grup-icerik" role="group" aria-label={etiket}>
        <div className="cari-fiyat-tanim-grup-hucre cari-fiyat-tanim-grup-hucre--tanim ap-form-acilir-secim-liste-anchor">
          <FormAcilirSecim
            value={tanimDeger}
            onChange={onTanimChange}
            secenekler={tanimSecenekler}
            disabled={disabled}
            aria-label={`${etiket} tanımı`}
            className="cari-outlined-acilir-tus cari-fiyat-tanim-grup-tanim"
            listeSinifi="cari-fiyat-tanim-grup-liste"
            listeAnchor="self"
            listeMinGenislik={0}
            tusMetin={tanimEtiket}
          />
        </div>
        <span className="cari-fiyat-tanim-grup-ayirici" aria-hidden />
        <div className="cari-fiyat-tanim-grup-hucre cari-fiyat-tanim-grup-hucre--fiyat ap-form-acilir-secim-liste-anchor">
          <FormAcilirSecim
            value={fiyatDeger}
            onChange={onFiyatChange}
            secenekler={fiyatSecenekler}
            disabled={disabled}
            aria-label={`${etiket} fiyatı`}
            className="cari-outlined-acilir-tus cari-fiyat-tanim-grup-fiyat"
            listeSinifi="cari-fiyat-tanim-grup-liste"
            listeAnchor="self"
            listeMinGenislik={0}
            tusMetin={fiyatEtiket}
          />
        </div>
      </div>
    </CariOutlinedSarmalayici>
  );
}
