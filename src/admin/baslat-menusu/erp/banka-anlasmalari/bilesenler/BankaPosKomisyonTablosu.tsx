import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import type { KrediKartTuru, PosKomisyonFiltre, PosKomisyonSatir } from '../tipler';
import {
  bosPosKomisyonSatir,
  POS_KOMISYON_FILTRELER,
  posKomisyonSatirBosMu,
} from '../tipler';
import {
  gunSayisiFiltrele,
  kartLimitiFiltrele,
  satisSekliBicimle,
  satisSekliTekrarVarMi,
} from '../bankaYardimci';

const HUCELER = [
  'satisSekli',
  'komisyon',
  'puan',
  'blokeGun',
  'tahsilatSekli',
] as const;

type HucreAdi = (typeof HUCELER)[number];

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

function hedefSegment(filtre: PosKomisyonFiltre): KrediKartTuru {
  return filtre === 'TICARI' ? 'TICARI' : 'BIREYSEL';
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
  const [filtre, setFiltre] = useState<PosKomisyonFiltre>('TUMU');
  const tabloRef = useRef<HTMLTableElement>(null);
  const odakBekleyenRef = useRef<{ satirId: string; hucre: HucreAdi } | null>(null);

  const gorunen = useMemo(() => {
    if (filtre === 'TUMU') return satirlar;
    return satirlar.filter((s) => s.kartSegment === filtre);
  }, [filtre, satirlar]);

  /** Yazıldıkça sonda boş satır açılsın; + butonu yok */
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (disabled) return;
    const segment = hedefSegment(filtre);
    const kapsanan =
      filtre === 'TUMU' ? satirlar : satirlar.filter((s) => s.kartSegment === segment);
    const sondaBos = kapsanan.length > 0 && posKomisyonSatirBosMu(kapsanan[kapsanan.length - 1]!);
    if (sondaBos) return;
    onChangeRef.current([...satirlar, bosPosKomisyonSatir(segment)]);
  }, [disabled, filtre, satirlar]);

  const hucreOdakla = (satirId: string, hucre: HucreAdi) => {
    const el = tabloRef.current?.querySelector(
      `tr[data-satir-id="${CSS.escape(satirId)}"] input[data-hucre="${hucre}"]`
    ) as HTMLInputElement | null;
    if (!el) return false;
    el.focus();
    el.select();
    return true;
  };

  useEffect(() => {
    const bekleyen = odakBekleyenRef.current;
    if (!bekleyen) return;
    if (hucreOdakla(bekleyen.satirId, bekleyen.hucre)) {
      odakBekleyenRef.current = null;
    }
  }, [gorunen]);

  const guncelle = (id: string, parca: Partial<PosKomisyonSatir>) => {
    onChange(satirlar.map((s) => (s.id === id ? { ...s, ...parca } : s)));
  };

  const satisSekliOnayla = (id: string, ham: string) => {
    const bicimli = satisSekliBicimle(ham);
    if (!bicimli) {
      guncelle(id, { satisSekli: '' });
      return;
    }
    const ayniSegment = satirlar.filter((s) => {
      const hedef = satirlar.find((x) => x.id === id);
      return hedef ? s.kartSegment === hedef.kartSegment : true;
    });
    if (satisSekliTekrarVarMi(ayniSegment, id, bicimli)) {
      const onceki = satirlar.find((s) => s.id === id)?.satisSekli ?? '';
      guncelle(id, { satisSekli: onceki === bicimli ? onceki : '' });
      return;
    }
    guncelle(id, { satisSekli: bicimli });
  };

  const sil = (id: string) => {
    const kalan = satirlar.filter((s) => s.id !== id);
    const segment = hedefSegment(filtre);
    const kapsanan =
      filtre === 'TUMU' ? kalan : kalan.filter((s) => s.kartSegment === segment);
    if (kapsanan.length === 0 || !posKomisyonSatirBosMu(kapsanan[kapsanan.length - 1]!)) {
      onChange([...kalan, bosPosKomisyonSatir(segment)]);
      return;
    }
    onChange(kalan);
  };

  /** Enter = yana geç; son hücrede Enter = alt satır (yoksa yeni satır aç) */
  const enterIleIlerle = (
    e: KeyboardEvent<HTMLInputElement>,
    satirId: string,
    hucreIndex: number,
    ekstra?: () => void
  ) => {
    if (e.key !== 'Enter' || disabled) return;
    e.preventDefault();
    ekstra?.();

    if (hucreIndex < HUCELER.length - 1) {
      const sonrakiHucre = HUCELER[hucreIndex + 1]!;
      if (!hucreOdakla(satirId, sonrakiHucre)) {
        odakBekleyenRef.current = { satirId, hucre: sonrakiHucre };
      }
      return;
    }

    const idx = gorunen.findIndex((s) => s.id === satirId);
    const sonrakiSatir = idx >= 0 ? gorunen[idx + 1] : undefined;
    if (sonrakiSatir) {
      if (!hucreOdakla(sonrakiSatir.id, 'satisSekli')) {
        odakBekleyenRef.current = { satirId: sonrakiSatir.id, hucre: 'satisSekli' };
      }
      return;
    }

    const yeni = bosPosKomisyonSatir(hedefSegment(filtre));
    odakBekleyenRef.current = { satirId: yeni.id, hucre: 'satisSekli' };
    onChange([...satirlar, yeni]);
  };

  /** Delete/Backspace: hücre boşsa önceki hücreye; satır boşsa önceki satıra */
  const silIleGeri = (
    e: KeyboardEvent<HTMLInputElement>,
    satirId: string,
    hucreIndex: number
  ) => {
    if (disabled) return;
    if (e.key !== 'Delete' && e.key !== 'Backspace') return;
    const el = e.currentTarget;
    if (el.value !== '') return;
    if (e.key === 'Backspace' && (el.selectionStart ?? 0) > 0) return;

    e.preventDefault();

    if (hucreIndex > 0) {
      const oncekiHucre = HUCELER[hucreIndex - 1]!;
      if (!hucreOdakla(satirId, oncekiHucre)) {
        odakBekleyenRef.current = { satirId, hucre: oncekiHucre };
      }
      return;
    }

    const satir = satirlar.find((s) => s.id === satirId);
    if (!satir || !posKomisyonSatirBosMu(satir)) return;

    const idx = gorunen.findIndex((s) => s.id === satirId);
    const oncekiSatir = idx > 0 ? gorunen[idx - 1] : undefined;
    if (!oncekiSatir) return;

    const sonHucre = HUCELER[HUCELER.length - 1]!;
    if (!hucreOdakla(oncekiSatir.id, sonHucre)) {
      odakBekleyenRef.current = { satirId: oncekiSatir.id, hucre: sonHucre };
    }
  };

  const hucreTus = (
    e: KeyboardEvent<HTMLInputElement>,
    satirId: string,
    hucreIndex: number,
    enterEkstra?: () => void
  ) => {
    enterIleIlerle(e, satirId, hucreIndex, enterEkstra);
    silIleGeri(e, satirId, hucreIndex);
  };

  return (
    <section className="ba-pos-tablo-bolum">
      <div className="ba-pos-tablo-baslik">
        <h3 className="ba-pos-tablo-baslik-metin">Komisyon / Puan Tanımları</h3>
        <div className="ba-pos-filtre" role="group" aria-label="Kart segmenti">
          {POS_KOMISYON_FILTRELER.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`cari-secili-chip${filtre === s.value ? ' cari-secili-chip--aktif' : ''}`}
              disabled={disabled}
              onClick={() => setFiltre(s.value)}
              aria-pressed={filtre === s.value}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ba-pos-tablo-sarici">
        <table className="ba-pos-tablo" ref={tabloRef}>
          <colgroup>
            <col className="ba-pos-col-veri" />
            <col className="ba-pos-col-veri" />
            <col className="ba-pos-col-veri" />
            <col className="ba-pos-col-veri" />
            <col className="ba-pos-col-veri" />
            {!disabled ? <col className="ba-pos-col-islem" /> : null}
          </colgroup>
          <thead>
            <tr>
              <th>Satış Şekli</th>
              <th>Komisyon</th>
              <th>Puan</th>
              <th>Bloke Gün</th>
              <th>Tahsilat Şekli</th>
              {!disabled ? <th className="ba-pos-tablo-islem" /> : null}
            </tr>
          </thead>
          <tbody>
            {gorunen.map((s) => (
              <tr key={s.id} data-satir-id={s.id}>
                <td>
                  <OdakHucreInput
                    className="ba-pos-hucre-input"
                    data-hucre="satisSekli"
                    value={s.satisSekli}
                    disabled={disabled}
                    odakPlaceholder="örn. 1 → Enter"
                    inputMode="numeric"
                    title="Enter: biçimle ve sonraki hücreye geç"
                    onChange={(e) => guncelle(s.id, { satisSekli: e.target.value })}
                    onKeyDown={(e) =>
                      hucreTus(e, s.id, 0, () =>
                        satisSekliOnayla(s.id, (e.target as HTMLInputElement).value)
                      )
                    }
                    onBlur={(e) => satisSekliOnayla(s.id, e.target.value)}
                  />
                </td>
                <td>
                  <div className="ba-pos-gun-hucre">
                    <OdakHucreInput
                      className="ba-pos-hucre-input ba-pos-hucre-input--sayi"
                      data-hucre="komisyon"
                      value={s.komisyon}
                      disabled={disabled}
                      odakPlaceholder="0,00"
                      inputMode="decimal"
                      onChange={(e) =>
                        guncelle(s.id, { komisyon: kartLimitiFiltrele(e.target.value) })
                      }
                      onKeyDown={(e) => hucreTus(e, s.id, 1)}
                    />
                    <span
                      className={`ba-gun-sonek${!s.komisyon ? ' ba-gun-sonek--bos' : ''}`}
                      aria-hidden={!s.komisyon}
                    >
                      %
                    </span>
                  </div>
                </td>
                <td>
                  <div className="ba-pos-gun-hucre">
                    <OdakHucreInput
                      className="ba-pos-hucre-input ba-pos-hucre-input--sayi"
                      data-hucre="puan"
                      value={s.puan}
                      disabled={disabled}
                      odakPlaceholder="0"
                      inputMode="decimal"
                      onChange={(e) =>
                        guncelle(s.id, { puan: kartLimitiFiltrele(e.target.value) })
                      }
                      onKeyDown={(e) => hucreTus(e, s.id, 2)}
                    />
                    <span
                      className={`ba-gun-sonek${!s.puan ? ' ba-gun-sonek--bos' : ''}`}
                      aria-hidden={!s.puan}
                    >
                      %
                    </span>
                  </div>
                </td>
                <td>
                  <div className="ba-pos-gun-hucre">
                    <OdakHucreInput
                      className="ba-pos-hucre-input ba-pos-hucre-input--sayi"
                      data-hucre="blokeGun"
                      value={s.blokeGun}
                      disabled={disabled}
                      odakPlaceholder="0"
                      inputMode="numeric"
                      onChange={(e) =>
                        guncelle(s.id, { blokeGun: gunSayisiFiltrele(e.target.value, 365) })
                      }
                      onKeyDown={(e) => hucreTus(e, s.id, 3)}
                    />
                    <span
                      className={`ba-gun-sonek${!s.blokeGun ? ' ba-gun-sonek--bos' : ''}`}
                      aria-hidden={!s.blokeGun}
                    >
                      gün
                    </span>
                  </div>
                </td>
                <td>
                  <div className="ba-pos-gun-hucre">
                    <OdakHucreInput
                      className="ba-pos-hucre-input ba-pos-hucre-input--sayi"
                      data-hucre="tahsilatSekli"
                      value={s.tahsilatSekli}
                      disabled={disabled}
                      odakPlaceholder="0"
                      inputMode="numeric"
                      onChange={(e) =>
                        guncelle(s.id, {
                          tahsilatSekli: gunSayisiFiltrele(e.target.value, 365),
                        })
                      }
                      onKeyDown={(e) => hucreTus(e, s.id, 4)}
                    />
                    <span
                      className={`ba-gun-sonek${!s.tahsilatSekli ? ' ba-gun-sonek--bos' : ''}`}
                      aria-hidden={!s.tahsilatSekli}
                    >
                      gün
                    </span>
                  </div>
                </td>
                {!disabled ? (
                  <td className="ba-pos-tablo-islem">
                    <button
                      type="button"
                      className="ba-pos-satir-sil"
                      title="Satırı sil"
                      aria-label="Satırı sil"
                      disabled={posKomisyonSatirBosMu(s) && gorunen.length <= 1}
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
    </section>
  );
}
