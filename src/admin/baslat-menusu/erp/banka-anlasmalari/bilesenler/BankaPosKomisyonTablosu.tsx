import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
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
  const [silinecekId, setSilinecekId] = useState<string | null>(null);
  const tabloRef = useRef<HTMLTableElement>(null);
  const odakBekleyenRef = useRef<{ satirId: string; hucre: HucreAdi } | null>(null);

  const gorunen = useMemo(() => {
    if (filtre === 'TUMU') return satirlar;
    return satirlar.filter((s) => s.kartSegment === filtre);
  }, [filtre, satirlar]);

  const silinecek = useMemo(
    () => (silinecekId ? satirlar.find((s) => s.id === silinecekId) ?? null : null),
    [silinecekId, satirlar]
  );

  /** Segmentte satır yoksa bir boş satır; dolu satırdan sonra tek şablon satır */
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const satirlarinSonaBosunuSagla = (liste: PosKomisyonSatir[], segment: KrediKartTuru): PosKomisyonSatir[] => {
    const kapsanan = filtre === 'TUMU' ? liste : liste.filter((s) => s.kartSegment === segment);
    if (kapsanan.length === 0) return [...liste, bosPosKomisyonSatir(segment)];
    if (!posKomisyonSatirBosMu(kapsanan[kapsanan.length - 1]!)) {
      return [...liste, bosPosKomisyonSatir(segment)];
    }
    return liste;
  };

  useEffect(() => {
    if (disabled) return;
    const segment = hedefSegment(filtre);
    const kapsanan =
      filtre === 'TUMU' ? satirlar : satirlar.filter((s) => s.kartSegment === segment);
    // Fazla sonda boş satırları tek satıra indir
    const sondakiBoslar: string[] = [];
    for (let i = kapsanan.length - 1; i >= 0; i -= 1) {
      const s = kapsanan[i]!;
      if (!posKomisyonSatirBosMu(s)) break;
      sondakiBoslar.push(s.id);
    }
    if (sondakiBoslar.length > 1) {
      const atilacak = new Set(sondakiBoslar.slice(0, -1));
      onChangeRef.current(satirlar.filter((s) => !atilacak.has(s.id)));
      return;
    }
    if (kapsanan.length === 0) {
      onChangeRef.current([...satirlar, bosPosKomisyonSatir(segment)]);
    }
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
    const segment = hedefSegment(filtre);
    const sonraki = satirlar.map((s) => (s.id === id ? { ...s, ...parca } : s));
    onChange(satirlarinSonaBosunuSagla(sonraki, segment));
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
    const hedef = satirlar.find((s) => s.id === id);
    const kalan = satirlar.filter((s) => s.id !== id);
    const segment = hedefSegment(filtre);
    const kapsanan =
      filtre === 'TUMU' ? kalan : kalan.filter((s) => s.kartSegment === segment);

    // Boş satır silindi: geri ekleme — kullanıcı bilinçli sildi
    if (hedef && posKomisyonSatirBosMu(hedef)) {
      if (kapsanan.length === 0) {
        onChange([...kalan, bosPosKomisyonSatir(segment)]);
        return;
      }
      onChange(kalan);
      return;
    }

    // Dolu satır silindi: giriş için sonda boş satır kalsın
    onChange(satirlarinSonaBosunuSagla(kalan, segment));
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

    // Son satır zaten boşsa yeni satır açma
    const buSatir = gorunen[idx];
    if (buSatir && posKomisyonSatirBosMu(buSatir)) return;

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

  /** Ok tuşları ile hücreler arası gezinme */
  const okIleGit = (
    e: KeyboardEvent<HTMLInputElement>,
    satirId: string,
    hucreIndex: number
  ) => {
    if (disabled) return;
    const key = e.key;
    if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown') {
      return;
    }

    const el = e.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const len = el.value.length;
    const secimYok = start === end;

    if (key === 'ArrowLeft') {
      if (!secimYok || start > 0) return;
      e.preventDefault();
      if (hucreIndex > 0) {
        const onceki = HUCELER[hucreIndex - 1]!;
        if (!hucreOdakla(satirId, onceki)) {
          odakBekleyenRef.current = { satirId, hucre: onceki };
        }
        return;
      }
      const idx = gorunen.findIndex((s) => s.id === satirId);
      const oncekiSatir = idx > 0 ? gorunen[idx - 1] : undefined;
      if (!oncekiSatir) return;
      const sonHucre = HUCELER[HUCELER.length - 1]!;
      if (!hucreOdakla(oncekiSatir.id, sonHucre)) {
        odakBekleyenRef.current = { satirId: oncekiSatir.id, hucre: sonHucre };
      }
      return;
    }

    if (key === 'ArrowRight') {
      if (!secimYok || start < len) return;
      e.preventDefault();
      if (hucreIndex < HUCELER.length - 1) {
        const sonraki = HUCELER[hucreIndex + 1]!;
        if (!hucreOdakla(satirId, sonraki)) {
          odakBekleyenRef.current = { satirId, hucre: sonraki };
        }
        return;
      }
      const idx = gorunen.findIndex((s) => s.id === satirId);
      const sonrakiSatir = idx >= 0 ? gorunen[idx + 1] : undefined;
      if (!sonrakiSatir) return;
      if (!hucreOdakla(sonrakiSatir.id, 'satisSekli')) {
        odakBekleyenRef.current = { satirId: sonrakiSatir.id, hucre: 'satisSekli' };
      }
      return;
    }

    e.preventDefault();
    const idx = gorunen.findIndex((s) => s.id === satirId);
    if (idx < 0) return;
    const hedefIdx = key === 'ArrowUp' ? idx - 1 : idx + 1;
    const hedefSatir = gorunen[hedefIdx];
    if (!hedefSatir) return;
    const hucre = HUCELER[hucreIndex]!;
    if (!hucreOdakla(hedefSatir.id, hucre)) {
      odakBekleyenRef.current = { satirId: hedefSatir.id, hucre };
    }
  };

  const hucreTus = (
    e: KeyboardEvent<HTMLInputElement>,
    satirId: string,
    hucreIndex: number,
    enterEkstra?: () => void
  ) => {
    okIleGit(e, satirId, hucreIndex);
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
                      disabled={gorunen.length <= 1 && posKomisyonSatirBosMu(s)}
                      onClick={() => setSilinecekId(s.id)}
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

      <SilmeOnayModal
        acik={!!silinecek}
        onKapat={() => setSilinecekId(null)}
        onOnayla={() => {
          if (!silinecekId) return;
          sil(silinecekId);
          setSilinecekId(null);
        }}
        baslik="Bu komisyon satırını silmek istediğinize emin misiniz?"
        hedefMetin={
          silinecek
            ? `«${silinecek.satisSekli.trim() || 'Boş satır'}»`
            : ''
        }
        ariaLabel="Komisyon satırı silme onayı"
      />
    </section>
  );
}
