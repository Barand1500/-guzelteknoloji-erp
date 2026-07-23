import { useMemo, useState } from 'react';
import type { AdminDonem } from '@/admin/baslat-menusu/tanimlar/tipler';
import type { TanimModalHedef } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimKayitModal';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';

type DuzenleHoverHedef = Extract<TanimModalHedef, { mod: 'duzenle' }>;

interface DonemlerPaneliProps {
  donemler: AdminDonem[];
  yatayKart?: boolean;
  eklemeVar: boolean;
  duzenlemeVar: boolean;
  silmeVar: boolean;
  firmaPasif: boolean;
  onKayitHover?: (hedef: DuzenleHoverHedef | null) => void;
  onDonemEkle: () => void;
  onDonemDuzenle: (d: AdminDonem) => void;
  onDonemSil: (d: AdminDonem) => void;
}

export function DonemlerPaneli({
  donemler,
  yatayKart = false,
  eklemeVar,
  duzenlemeVar,
  silmeVar,
  firmaPasif,
  onKayitHover,
  onDonemEkle,
  onDonemDuzenle,
  onDonemSil,
}: DonemlerPaneliProps) {
  const [sorgu, setSorgu] = useState('');

  const filtreli = useMemo(() => {
    const q = sorgu.trim().toLocaleLowerCase('tr');
    if (!q) return donemler;
    return donemler.filter(
      (d) =>
        d.donemAdi.toLocaleLowerCase('tr').includes(q) ||
        d.donemKodu.toLocaleLowerCase('tr').includes(q)
    );
  }, [donemler, sorgu]);

  return (
    <div className="ap-tanimlar-hiyerarsi">
      <div className="ap-tanimlar-hiyerarsi-ust">
        <input
          type="search"
          className="ap-tanimlar-hiyerarsi-arama"
          placeholder="Dönem ara…"
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          aria-label="Dönem ara"
        />
        {eklemeVar ? (
          <button
            type="button"
            className="ap-tanimlar-ekle-tus ap-tanimlar-ekle-tus--birincil"
            disabled={firmaPasif}
            onClick={onDonemEkle}
            title={firmaPasif ? 'Pasif firmaya dönem eklenemez' : 'Yeni dönem'}
          >
            Yeni Dönem
          </button>
        ) : null}
      </div>

      {filtreli.length === 0 ? (
        <p className="ap-tanimlar-firma-bos">
          {donemler.length === 0 ? 'Bu firmada dönem yok — Yeni Dönem ile ekleyin' : 'Dönem bulunamadı'}
        </p>
      ) : (
        <ul className={`ap-tanimlar-donem-liste${yatayKart ? ' ap-tanimlar-donem-liste--yatay' : ''}`}>
          {filtreli.map((d) => (
            <li
              key={d.id}
              className={`ap-tanimlar-donem-satir${yatayKart ? ' ap-tanimlar-donem-satir--yatay' : ''}${!d.aktif ? ' ap-tanimlar-donem-satir--pasif' : ''}`}
              title={duzenlemeVar ? 'G: düzenle' : undefined}
              onMouseEnter={() =>
                onKayitHover?.({ tip: 'donem', mod: 'duzenle', kayit: d })
              }
              onMouseLeave={() => onKayitHover?.(null)}
            >
              <div className="ap-tanimlar-donem-bilgi">
                <span className="ap-tanimlar-donem-ad">{d.donemAdi}</span>
                <span className="ap-tanimlar-donem-meta">
                  {d.donemKodu}
                  {!d.aktif ? ' · Pasif' : ''}
                </span>
              </div>
              <div className="ap-tanimlar-sube-aksiyon">
                {duzenlemeVar || silmeVar ? (
                  <span className="ap-tanimlar-cizgi-aksiyon">
                    {duzenlemeVar ? (
                      <button
                        type="button"
                        className="ap-tanimlar-ikon-tus"
                        title="Düzenle"
                        aria-label={`${d.donemAdi} düzenle`}
                        onClick={() => onDonemDuzenle(d)}
                      >
                        <DgIkon ad="duzenle" />
                      </button>
                    ) : null}
                    {silmeVar ? (
                      <button
                        type="button"
                        className="ap-tanimlar-ikon-tus ap-tanimlar-ikon-tus--tehlike"
                        title="Sil"
                        aria-label={`${d.donemAdi} sil`}
                        onClick={() => onDonemSil(d)}
                      >
                        <DgIkon ad="sil" />
                      </button>
                    ) : null}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
