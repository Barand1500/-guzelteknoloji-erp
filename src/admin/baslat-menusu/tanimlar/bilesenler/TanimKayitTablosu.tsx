import { useMemo, useState, type ReactNode } from 'react';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { formInputSinifi } from '@/formlar/FormAlani';

export interface TanimTabloKolon<T> {
  id: string;
  baslik: string;
  hucre: (satir: T) => ReactNode;
  sinif?: string;
}

interface TanimKayitTablosuProps<T extends { id: string }> {
  baslik: string;
  kayitlar: T[];
  kolonlar: TanimTabloKolon<T>[];
  aramaMetni?: (satir: T) => string;
  pasifMi?: (satir: T) => boolean;
  onSatirTikla: (satir: T) => void;
  onDuzenle?: (satir: T) => void;
  onSil?: (satir: T) => void;
  filtre?: ReactNode;
  bosMesaj?: string;
}

export function TanimDurumRozeti({ aktif }: { aktif: boolean }) {
  return (
    <span
      className={`ap-tanimlar-tablo-durum ${aktif ? 'ap-tanimlar-tablo-durum--aktif' : 'ap-tanimlar-tablo-durum--pasif'}`}
    >
      {aktif ? 'Aktif' : 'Pasif'}
    </span>
  );
}

export function TanimKayitTablosu<T extends { id: string }>({
  baslik,
  kayitlar,
  kolonlar,
  aramaMetni,
  pasifMi,
  onSatirTikla,
  onDuzenle,
  onSil,
  filtre,
  bosMesaj = 'Henüz kayıt yok',
}: TanimKayitTablosuProps<T>) {
  const islemVar = Boolean(onDuzenle || onSil);
  const kolonSayisi = kolonlar.length + (islemVar ? 1 : 0);
  const [arama, setArama] = useState('');

  const filtrelenmis = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return kayitlar;
    return kayitlar.filter((k) => {
      const metin = aramaMetni ? aramaMetni(k) : '';
      return metin.toLocaleLowerCase('tr').includes(q);
    });
  }, [arama, aramaMetni, kayitlar]);

  return (
    <div className="ap-tanimlar-tablo-kapsayici">
      <div className="ap-tanimlar-tablo-ust">
        <div className="ap-tanimlar-tablo-ust-sol">
          <h3 className="ap-tanimlar-tablo-baslik">{baslik}</h3>
          <span className="ap-tanimlar-tablo-sayi">{kayitlar.length}</span>
        </div>
        <div className="ap-tanimlar-tablo-ust-sag">
          {filtre}
          <input
            type="search"
            className={`${formInputSinifi} ap-tanimlar-tablo-arama`}
            placeholder="Ara…"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            aria-label={`${baslik} ara`}
          />
        </div>
      </div>

      <div className="ap-tanimlar-tablo-sarmal">
        <table className="ap-tanimlar-tablo">
          <thead>
            <tr>
              {kolonlar.map((k) => (
                <th key={k.id} className={k.sinif}>
                  {k.baslik}
                </th>
              ))}
              {islemVar && (
                <th className="ap-tanimlar-tablo-islem" aria-label="İşlemler">
                  <span className="ap-tanimlar-tablo-islem-baslik">İşlemler</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtrelenmis.length === 0 ? (
              <tr>
                <td colSpan={kolonSayisi} className="ap-tanimlar-tablo-bos">
                  {kayitlar.length === 0 ? bosMesaj : 'Arama sonucu bulunamadı'}
                </td>
              </tr>
            ) : (
              filtrelenmis.map((satir) => {
                const pasif = pasifMi?.(satir) ?? false;
                return (
                  <tr
                    key={satir.id}
                    className={`ap-tanimlar-tablo-satir${pasif ? ' ap-tanimlar-tablo-satir--pasif' : ''}`}
                    onClick={() => onSatirTikla(satir)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSatirTikla(satir);
                      }
                    }}
                  >
                    {kolonlar.map((k) => (
                      <td key={k.id} className={k.sinif}>
                        {k.hucre(satir)}
                      </td>
                    ))}
                    {islemVar && (
                      <td
                        className="ap-tanimlar-tablo-islem"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="ap-tanimlar-tablo-islem-tuslar">
                          {onDuzenle && (
                            <button
                              type="button"
                              className="ap-tanimlar-tablo-duzenle-tus"
                              title="Kaydı düzenle"
                              aria-label="Kaydı düzenle"
                              onClick={() => onDuzenle(satir)}
                            >
                              <DgIkon ad="duzenle" />
                            </button>
                          )}
                          {onSil && (
                            <button
                              type="button"
                              className="ap-tanimlar-tablo-sil-tus"
                              title="Kaydı sil"
                              aria-label="Kaydı sil"
                              onClick={() => onSil(satir)}
                            >
                              <DgIkon ad="sil" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
