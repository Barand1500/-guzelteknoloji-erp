import { useState, type ReactNode } from 'react';

export interface TanimSihirbazAdim {
  baslik: string;
  aciklama?: string;
  icerik: ReactNode;
}

export type TanimSihirbazFaz = {
  id: string;
  ad: string;
  ikon: string;
};

interface TanimSihirbazProps {
  baslik: string;
  adimlar: TanimSihirbazAdim[];
  aktifAdim: number;
  onAdimDegistir: (adim: number) => void;
  onIptal: () => void;
  onTamamla: () => void;
  adimDogrula?: (adim: number) => string | null;
  onAdimIleri?: (adim: number) => Promise<string | null>;
  onHata?: (mesaj: string) => void;
  tamamlaniyor?: boolean;
  fazlar?: TanimSihirbazFaz[];
  aktifFazId?: string;
  onFazSecildi?: (faz: TanimSihirbazFaz) => void;
  iptalMetin?: string;
  tamamlaMetin?: string;
  /** true ise üstteki iptal butonu ve başlık satırı gösterilmez */
  ustGizle?: boolean;
  /** Tam kurulumda ara faz bitince sonraki faza geçmek için son adımda İleri gösterir */
  sonAdimdaIleri?: boolean;
  onSonrakiFaza?: () => Promise<string | null>;
}

export function TanimSihirbaz({
  baslik,
  adimlar,
  aktifAdim,
  onAdimDegistir,
  onIptal,
  onTamamla,
  adimDogrula,
  onAdimIleri,
  onHata,
  tamamlaniyor = false,
  fazlar,
  aktifFazId,
  onFazSecildi,
  iptalMetin = '← Listeye dön',
  tamamlaMetin = 'Kaydet ve Bitir',
  ustGizle = false,
  sonAdimdaIleri = false,
  onSonrakiFaza,
}: TanimSihirbazProps) {
  const sonAdim = adimlar.length - 1;
  const adim = adimlar[aktifAdim];
  const [ileriYukleniyor, setIleriYukleniyor] = useState(false);

  const ileri = async () => {
    const hata = adimDogrula?.(aktifAdim);
    if (hata) {
      onHata?.(hata);
      return;
    }
    if (onAdimIleri) {
      setIleriYukleniyor(true);
      try {
        const asyncHata = await onAdimIleri(aktifAdim);
        if (asyncHata) {
          onHata?.(asyncHata);
          return;
        }
      } finally {
        setIleriYukleniyor(false);
      }
    }
    if (aktifAdim < sonAdim) onAdimDegistir(aktifAdim + 1);
  };

  const geri = () => {
    if (aktifAdim > 0) onAdimDegistir(aktifAdim - 1);
  };

  const tamamla = () => {
    const hata = adimDogrula?.(aktifAdim);
    if (hata) {
      onHata?.(hata);
      return;
    }
    onTamamla();
  };

  const sonAdimGosterIleri = aktifAdim < sonAdim || (aktifAdim === sonAdim && sonAdimdaIleri);

  const sonrakiFaza = async () => {
    const hata = adimDogrula?.(aktifAdim);
    if (hata) {
      onHata?.(hata);
      return;
    }
    if (onSonrakiFaza) {
      setIleriYukleniyor(true);
      try {
        const asyncHata = await onSonrakiFaza();
        if (asyncHata) {
          onHata?.(asyncHata);
        }
      } finally {
        setIleriYukleniyor(false);
      }
    }
  };

  return (
    <div className="ap-tanimlar-sihirbaz">
      {!ustGizle ? (
        <div className="ap-tanimlar-sihirbaz-ust">
          <button type="button" className="ap-tanimlar-sihirbaz-iptal" onClick={onIptal}>
            {iptalMetin}
          </button>
          <div className="ap-tanimlar-sihirbaz-baslik-alan">
            <h3 className="ap-tanimlar-sihirbaz-baslik">{baslik}</h3>
          </div>
        </div>
      ) : null}

      {fazlar && fazlar.length > 0 ? (
        <ol className="ap-tanimlar-sihirbaz-fazlar" aria-label="Kurulum fazları">
          {fazlar.map((f) => {
            const durum = aktifFazId === f.id ? 'aktif' : 'bekle';
            const tiklanabilir = !!onFazSecildi;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  className={`ap-tanimlar-sihirbaz-faz ap-tanimlar-sihirbaz-faz--${durum}${tiklanabilir ? ' ap-tanimlar-sihirbaz-faz--tiklanabilir' : ''}`}
                  onClick={() => onFazSecildi?.(f)}
                  aria-current={aktifFazId === f.id ? 'step' : undefined}
                >
                  <span className="ap-tanimlar-sihirbaz-faz-ikon" aria-hidden>
                    {f.ikon}
                  </span>
                  <span>{f.ad}</span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}

      <ol className="ap-tanimlar-sihirbaz-adimlar" aria-label="Kurulum adımları">
        {adimlar.map((a, i) => {
          const durum = i < aktifAdim ? 'tamam' : i === aktifAdim ? 'aktif' : 'bekle';
          return (
            <li
              key={a.baslik}
              className={`ap-tanimlar-sihirbaz-adim ap-tanimlar-sihirbaz-adim--${durum}`}
              aria-current={i === aktifAdim ? 'step' : undefined}
            >
              <span className="ap-tanimlar-sihirbaz-adim-no">{i + 1}</span>
              <span className="ap-tanimlar-sihirbaz-adim-metin">{a.baslik}</span>
            </li>
          );
        })}
      </ol>

      <div className="ap-tanimlar-sihirbaz-govde" key={aktifAdim}>
        <div className="ap-tanimlar-sihirbaz-adim-baslik">
          <h4>{adim.baslik}</h4>
          {adim.aciklama ? <p>{adim.aciklama}</p> : null}
        </div>
        <div className="ap-tanimlar-sihirbaz-adim-icerik">{adim.icerik}</div>
      </div>

      <div className="ap-tanimlar-sihirbaz-tuslar">
        <button
          type="button"
          className="ap-tanimlar-sihirbaz-dugme ap-tanimlar-sihirbaz-dugme--ikincil"
          onClick={geri}
          disabled={aktifAdim === 0 || tamamlaniyor}
        >
          Geri
        </button>
        <span className="ap-tanimlar-sihirbaz-adim-sayac" aria-live="polite">
          Adım {aktifAdim + 1} / {adimlar.length}
        </span>
        {sonAdimGosterIleri ? (
          <button
            type="button"
            className="ap-tanimlar-sihirbaz-dugme ap-tanimlar-sihirbaz-dugme--birincil"
            onClick={() => void (aktifAdim === sonAdim && sonAdimdaIleri ? sonrakiFaza() : ileri())}
            disabled={tamamlaniyor || ileriYukleniyor}
          >
            {ileriYukleniyor ? 'Kaydediliyor…' : 'İleri'}
          </button>
        ) : (
          <button
            type="button"
            className="ap-tanimlar-sihirbaz-dugme ap-tanimlar-sihirbaz-dugme--birincil"
            onClick={tamamla}
            disabled={tamamlaniyor}
          >
            {tamamlaniyor ? 'Kaydediliyor…' : tamamlaMetin}
          </button>
        )}
      </div>
    </div>
  );
}
