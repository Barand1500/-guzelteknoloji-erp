import { useId } from 'react';
import { kartNoFiltrele, sonKullanmaFiltrele } from '../bankaYardimci';

export function BankaKrediKartGorsel({
  kartNo,
  sonKullanma,
  hesapIsmi,
  bankaAdi,
  disabled,
  onKartNoChange,
  onSonKullanmaChange,
}: {
  kartNo: string;
  sonKullanma: string;
  hesapIsmi: string;
  bankaAdi?: string;
  disabled?: boolean;
  onKartNoChange: (deger: string) => void;
  onSonKullanmaChange: (deger: string) => void;
}) {
  const noId = useId();
  const sktId = useId();
  const hane = kartNo.replace(/\D/g, '').length;
  const maxHane = 16;
  const noBos = hane === 0;

  return (
    <div className={`ba-kk-gorsel${disabled ? ' ba-kk-gorsel--pasif' : ''}`}>
      <div className="ba-kk-gorsel-ust">
        <span className="ba-kk-gorsel-chip" aria-hidden />
        <span className="ba-kk-gorsel-banka">{bankaAdi?.trim() || 'Kredi Kartı'}</span>
      </div>

      <label className="ba-kk-gorsel-no-alan" htmlFor={noId}>
        <span className="ba-kk-gorsel-etiket">Kart No</span>
        <input
          id={noId}
          className="ba-kk-gorsel-no-input"
          value={kartNo}
          disabled={disabled}
          maxLength={19}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="•••• •••• •••• ••••"
          spellCheck={false}
          onChange={(e) => onKartNoChange(kartNoFiltrele(e.target.value))}
          aria-label="Kart numarası"
          aria-describedby={`${noId}-alt`}
        />
        <span
          id={`${noId}-alt`}
          className={`ba-kk-gorsel-alt-satir${noBos ? ' ba-kk-gorsel-alt-satir--uyari' : ' ba-kk-gorsel-alt-satir--sayac'}`}
          aria-live="polite"
        >
          {noBos ? 'Kart numaranızı giriniz' : `${hane}/${maxHane}`}
        </span>
      </label>

      <div className="ba-kk-gorsel-alt">
        <div className="ba-kk-gorsel-sahip">
          <span className="ba-kk-gorsel-etiket">Kart Sahibi</span>
          <span className="ba-kk-gorsel-sahip-ad">
            {hesapIsmi.trim() || 'HESAP ADI'}
          </span>
        </div>
        <label className="ba-kk-gorsel-skt-alan" htmlFor={sktId}>
          <span className="ba-kk-gorsel-etiket ba-kk-gorsel-etiket--yatay">Son Kullanma</span>
          <input
            id={sktId}
            className="ba-kk-gorsel-skt-input"
            value={sonKullanma}
            disabled={disabled}
            maxLength={5}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="AA/YY"
            spellCheck={false}
            onChange={(e) => onSonKullanmaChange(sonKullanmaFiltrele(e.target.value))}
            aria-label="Son kullanma tarihi"
          />
        </label>
      </div>
    </div>
  );
}
