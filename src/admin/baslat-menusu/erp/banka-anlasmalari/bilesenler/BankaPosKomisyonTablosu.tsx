import { useState, type InputHTMLAttributes } from 'react';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import type { PosKomisyonSatir } from '../tipler';
import { bosPosKomisyonSatir } from '../tipler';
import {
  gunSayisiFiltrele,
  kartLimitiFiltrele,
  satisSekliBicimle,
  satisSekliTekrarVarMi,
} from '../bankaYardimci';

/** Placeholder yalnızca odaklanınca görünür (Cari outlined gibi). */
function OdakHucreInput({
  odakPlaceholder,
  className,
  onFocus,
  onBlur,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> & {
  odakPlaceholder?: string;
}) {
  const [odak, setOdak] = useState(false);
  return (
    <input
      {...rest}
      className={className}
      placeholder={odak ? odakPlaceholder : undefined}
      onFocus={(e) => {
        setOdak(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setOdak(false);
        onBlur?.(e);
      }}
    />
  );
}

export function BankaPosKomisyonTablosu({
  satirlar,
  disabled,
  onChange,
}: {
  satirlar: PosKomisyonSatir[];
  disabled?: boolean;
  onChange: (satirlar: PosKomisyonSatir[]) => void;
}) {
  const guncelle = (id: string, parca: Partial<PosKomisyonSatir>) => {
    onChange(satirlar.map((s) => (s.id === id ? { ...s, ...parca } : s)));
  };

  const satisSekliOnayla = (id: string, ham: string) => {
    const bicimli = satisSekliBicimle(ham);
    if (!bicimli) {
      guncelle(id, { satisSekli: '' });
      return;
    }
    if (satisSekliTekrarVarMi(satirlar, id, bicimli)) {
      const onceki = satirlar.find((s) => s.id === id)?.satisSekli ?? '';
      guncelle(id, { satisSekli: onceki === bicimli ? onceki : '' });
      return;
    }
    guncelle(id, { satisSekli: bicimli });
  };

  const ekle = () => {
    onChange([...satirlar, bosPosKomisyonSatir()]);
  };

  const sil = (id: string) => {
    onChange(satirlar.filter((s) => s.id !== id));
  };

  return (
    <section className="ba-pos-tablo-bolum">
      <div className="ba-pos-tablo-baslik">
        <h3 className="ba-pos-tablo-baslik-metin">Komisyon / Puan Tanımları</h3>
        {!disabled ? (
          <button
            type="button"
            className="cari-iletisim-ekle"
            onClick={ekle}
            title="Satır ekle"
            aria-label="Komisyon satırı ekle"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {satirlar.length === 0 ? (
        <p className="ba-pos-tablo-bos">
          Henüz satır yok — + ile kart / taksit tanımı ekleyin.
        </p>
      ) : (
        <div className="ba-pos-tablo-sarici">
          <table className="ba-pos-tablo">
            <thead>
              <tr>
                <th>Kart Adı</th>
                <th>Satış Şekli</th>
                <th>Komisyon</th>
                <th>Puan</th>
                <th>Bloke Gün</th>
                <th>Tahsilat Şekli</th>
                {!disabled ? <th className="ba-pos-tablo-islem" /> : null}
              </tr>
            </thead>
            <tbody>
              {satirlar.map((s) => (
                <tr key={s.id}>
                  <td>
                    <OdakHucreInput
                      className="ba-pos-hucre-input"
                      value={s.kartAdi}
                      disabled={disabled}
                      odakPlaceholder="Kredi Kartı"
                      onChange={(e) => guncelle(s.id, { kartAdi: e.target.value })}
                    />
                  </td>
                  <td>
                    <OdakHucreInput
                      className="ba-pos-hucre-input"
                      value={s.satisSekli}
                      disabled={disabled}
                      odakPlaceholder="örn. 1 → Enter"
                      inputMode="numeric"
                      title="Sayı yazıp Enter: örn. 1 → 1 Taksit"
                      onChange={(e) => guncelle(s.id, { satisSekli: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return;
                        e.preventDefault();
                        satisSekliOnayla(s.id, (e.target as HTMLInputElement).value);
                      }}
                      onBlur={(e) => satisSekliOnayla(s.id, e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="ba-pos-gun-hucre">
                      <OdakHucreInput
                        className="ba-pos-hucre-input ba-pos-hucre-input--sayi"
                        value={s.komisyon}
                        disabled={disabled}
                        odakPlaceholder="0,00"
                        inputMode="decimal"
                        onChange={(e) =>
                          guncelle(s.id, { komisyon: kartLimitiFiltrele(e.target.value) })
                        }
                      />
                      {s.komisyon ? <span className="ba-gun-sonek">%</span> : null}
                    </div>
                  </td>
                  <td>
                    <div className="ba-pos-gun-hucre">
                      <OdakHucreInput
                        className="ba-pos-hucre-input ba-pos-hucre-input--sayi"
                        value={s.puan}
                        disabled={disabled}
                        odakPlaceholder="0"
                        inputMode="decimal"
                        onChange={(e) =>
                          guncelle(s.id, { puan: kartLimitiFiltrele(e.target.value) })
                        }
                      />
                      {s.puan ? <span className="ba-gun-sonek">%</span> : null}
                    </div>
                  </td>
                  <td>
                    <div className="ba-pos-gun-hucre">
                      <OdakHucreInput
                        className="ba-pos-hucre-input ba-pos-hucre-input--sayi"
                        value={s.blokeGun}
                        disabled={disabled}
                        odakPlaceholder="0"
                        inputMode="numeric"
                        onChange={(e) =>
                          guncelle(s.id, { blokeGun: gunSayisiFiltrele(e.target.value, 365) })
                        }
                      />
                      {s.blokeGun ? <span className="ba-gun-sonek">gün</span> : null}
                    </div>
                  </td>
                  <td>
                    <div className="ba-pos-gun-hucre">
                      <OdakHucreInput
                        className="ba-pos-hucre-input ba-pos-hucre-input--sayi"
                        value={s.tahsilatSekli}
                        disabled={disabled}
                        odakPlaceholder="0"
                        inputMode="numeric"
                        onChange={(e) =>
                          guncelle(s.id, {
                            tahsilatSekli: gunSayisiFiltrele(e.target.value, 365),
                          })
                        }
                      />
                      {s.tahsilatSekli ? <span className="ba-gun-sonek">gün</span> : null}
                    </div>
                  </td>
                  {!disabled ? (
                    <td className="ba-pos-tablo-islem">
                      <button
                        type="button"
                        className="ba-pos-satir-sil"
                        title="Satırı sil"
                        aria-label="Satırı sil"
                        onClick={() => sil(s.id)}
                      >
                        <DgIkon ad="sil" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
