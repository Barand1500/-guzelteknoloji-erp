import { useId } from 'react';
import { amexKartMi, kartNoFiltrele, sonKullanmaFiltrele } from '../bankaYardimci';

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
  const rakamlar = kartNo.replace(/\D/g, '');
  const hane = rakamlar.length;
  const amex = amexKartMi(rakamlar);
  const maxHane = amex ? 15 : 16;
  const maxLength = amex ? 17 : 19;
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
          maxLength={maxLength}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder={amex ? '•••• •••••• •••••' : '•••• •••• •••• ••••'}
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
