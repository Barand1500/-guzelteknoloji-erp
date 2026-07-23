import { useMemo, useState } from 'react';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';

interface BasitKayitPaneliProps<T> {
  kayitlar: T[];
  yatayKart?: boolean;
  araPlaceholder: string;
  ekleEtiket: string;
  bosMesaj: string;
  bulunamadiMesaj: string;
  eklemeVar: boolean;
  duzenlemeVar: boolean;
  silmeVar: boolean;
  ekleKapali?: boolean;
  ekleKapaliTitle?: string;
  idAl: (k: T) => string;
  adAl: (k: T) => string;
  metaAl: (k: T) => string;
  aktifMi: (k: T) => boolean;
  araEsles: (k: T, q: string) => boolean;
  onEkle: () => void;
  onDuzenle: (k: T) => void;
  onSil: (k: T) => void;
  onKayitHover?: (k: T | null) => void;
}

export function BasitKayitPaneli<T>({
  kayitlar,
  yatayKart = false,
  araPlaceholder,
  ekleEtiket,
  bosMesaj,
  bulunamadiMesaj,
  eklemeVar,
  duzenlemeVar,
  silmeVar,
  ekleKapali = false,
  ekleKapaliTitle,
  idAl,
  adAl,
  metaAl,
  aktifMi,
  araEsles,
  onEkle,
  onDuzenle,
  onSil,
  onKayitHover,
}: BasitKayitPaneliProps<T>) {
  const [sorgu, setSorgu] = useState('');

  const filtreli = useMemo(() => {
    const q = sorgu.trim().toLocaleLowerCase('tr');
    if (!q) return kayitlar;
    return kayitlar.filter((k) => araEsles(k, q));
  }, [kayitlar, sorgu, araEsles]);

  return (
    <div className="ap-tanimlar-hiyerarsi">
      <div className="ap-tanimlar-hiyerarsi-ust">
        <input
          type="search"
          className="ap-tanimlar-hiyerarsi-arama"
          placeholder={araPlaceholder}
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          aria-label={araPlaceholder}
        />
        {eklemeVar ? (
          <button
            type="button"
            className="ap-tanimlar-ekle-tus ap-tanimlar-ekle-tus--birincil"
            disabled={ekleKapali}
            onClick={onEkle}
            title={ekleKapali ? ekleKapaliTitle : ekleEtiket}
          >
            {ekleEtiket}
          </button>
        ) : null}
      </div>

      {filtreli.length === 0 ? (
        <p className="ap-tanimlar-firma-bos">
          {kayitlar.length === 0 ? bosMesaj : bulunamadiMesaj}
        </p>
      ) : (
        <ul
          className={`ap-tanimlar-donem-liste${yatayKart ? ' ap-tanimlar-donem-liste--yatay' : ''}`}
        >
          {filtreli.map((k) => {
            const ad = adAl(k);
            const aktif = aktifMi(k);
            return (
              <li
                key={idAl(k)}
                className={`ap-tanimlar-donem-satir${yatayKart ? ' ap-tanimlar-donem-satir--yatay' : ''}${!aktif ? ' ap-tanimlar-donem-satir--pasif' : ''}`}
                title={duzenlemeVar ? 'G: düzenle' : undefined}
                onMouseEnter={() => onKayitHover?.(k)}
                onMouseLeave={() => onKayitHover?.(null)}
              >
                <div className="ap-tanimlar-donem-bilgi">
                  <span className="ap-tanimlar-donem-ad">{ad}</span>
                  <span className="ap-tanimlar-donem-meta">{metaAl(k)}</span>
                </div>
                <div className="ap-tanimlar-sube-aksiyon">
                  {duzenlemeVar ? (
                    <button
                      type="button"
                      className="ap-tanimlar-ikon-tus"
                      title="Düzenle"
                      aria-label={`${ad} düzenle`}
                      onClick={() => onDuzenle(k)}
                    >
                      <DgIkon ad="duzenle" />
                    </button>
                  ) : null}
                  {silmeVar ? (
                    <button
                      type="button"
                      className="ap-tanimlar-ikon-tus ap-tanimlar-ikon-tus--tehlike"
                      title="Sil"
                      aria-label={`${ad} sil`}
                      onClick={() => onSil(k)}
                    >
                      <DgIkon ad="sil" />
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
