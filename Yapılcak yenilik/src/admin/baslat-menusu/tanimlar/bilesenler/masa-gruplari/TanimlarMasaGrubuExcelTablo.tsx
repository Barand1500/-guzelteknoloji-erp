import { type KeyboardEvent } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import type { TanimlarMasaGrubu, TanimlarMasaGrubuAlan } from '@/admin/baslat-menusu/tanimlar/masa-gruplari/tipler';

const YENI_SATIR_ID = 0;

interface AktifHucre {
  id: number;
  alan: TanimlarMasaGrubuAlan;
}

interface TanimlarMasaGrubuExcelTabloProps {
  gruplar: TanimlarMasaGrubu[];
  seciliId: number | null;
  aktifHucre: AktifHucre | null;
  hucreTaslak: string;
  onSatirSec: (id: number) => void;
  onHucreBaslat: (grup: TanimlarMasaGrubu | null, alan: TanimlarMasaGrubuAlan) => void;
  onHucreTaslak: (deger: string) => void;
  onHucreBitir: () => void;
  onAyarlar: (grup: TanimlarMasaGrubu) => void;
}

function Hucre({
  alan,
  gosterim,
  duzenlemeAktif,
  inputDeger,
  onBasla,
  onDegistir,
  onBitir,
  inputTipi = 'text',
}: {
  alan: string;
  gosterim: string;
  duzenlemeAktif: boolean;
  inputDeger: string;
  onBasla: () => void;
  onDegistir: (v: string) => void;
  onBitir: () => void;
  inputTipi?: 'text' | 'number';
}) {
  function tusBas(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      onBitir();
    }
  }

  if (duzenlemeAktif) {
    return (
      <input
        type={inputTipi}
        className={`${formInputSinifi} ap-master-excel-input w-full`}
        value={inputDeger}
        onChange={(e) => onDegistir(e.target.value)}
        onBlur={onBitir}
        onKeyDown={tusBas}
        onClick={(e) => e.stopPropagation()}
        autoFocus
        aria-label={alan}
      />
    );
  }

  return (
    <span
      className="ap-master-excel-hucre-tiklanabilir block min-h-[1.25rem]"
      onDoubleClick={(e) => {
        e.stopPropagation();
        onBasla();
      }}
      title="Düzenlemek için çift tıklayın"
    >
      {gosterim || <span className="ap-muted">—</span>}
    </span>
  );
}

export function TanimlarMasaGrubuExcelTablo({
  gruplar,
  seciliId,
  aktifHucre,
  hucreTaslak,
  onSatirSec,
  onHucreBaslat,
  onHucreTaslak,
  onHucreBitir,
  onAyarlar,
}: TanimlarMasaGrubuExcelTabloProps) {
  function hucreAktif(id: number, alan: TanimlarMasaGrubuAlan) {
    return aktifHucre?.id === id && aktifHucre.alan === alan;
  }

  const yeniSatir = { id: YENI_SATIR_ID, grup: '', prefixIsimler: '', masaSayisi: 0 };

  function satirlar(): (TanimlarMasaGrubu | typeof yeniSatir)[] {
    return [...gruplar, yeniSatir];
  }

  return (
    <div className="ap-master-excel-wrap ap-tanimlar-masa-grup-tablo">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              <th>Grup</th>
              <th>Prefix / İsimler</th>
              <th>Masa Sayısı</th>
              <th>Ayarlar</th>
            </tr>
          </thead>
          <tbody>
            {satirlar().map((g) => {
              const yeni = g.id === YENI_SATIR_ID;
              return (
                <tr
                  key={g.id}
                  className={seciliId === g.id ? 'ap-master-excel-satir-secili' : ''}
                  onClick={() => onSatirSec(g.id)}
                >
                  <td className="ap-master-excel-hucre">
                    <Hucre
                      alan="grup"
                      gosterim={g.grup}
                      duzenlemeAktif={hucreAktif(g.id, 'grup')}
                      inputDeger={hucreTaslak}
                      onBasla={() => onHucreBaslat(yeni ? null : g, 'grup')}
                      onDegistir={onHucreTaslak}
                      onBitir={onHucreBitir}
                    />
                  </td>
                  <td className="ap-master-excel-hucre">
                    <Hucre
                      alan="prefixIsimler"
                      gosterim={g.prefixIsimler}
                      duzenlemeAktif={hucreAktif(g.id, 'prefixIsimler')}
                      inputDeger={hucreTaslak}
                      onBasla={() => onHucreBaslat(yeni ? null : g, 'prefixIsimler')}
                      onDegistir={onHucreTaslak}
                      onBitir={onHucreBitir}
                    />
                  </td>
                  <td className="ap-master-excel-hucre">
                    <Hucre
                      alan="masaSayisi"
                      gosterim={g.masaSayisi > 0 ? String(g.masaSayisi) : ''}
                      duzenlemeAktif={hucreAktif(g.id, 'masaSayisi')}
                      inputDeger={hucreTaslak}
                      onBasla={() => onHucreBaslat(yeni ? null : g, 'masaSayisi')}
                      onDegistir={onHucreTaslak}
                      onBitir={onHucreBitir}
                      inputTipi="number"
                    />
                  </td>
                  <td className="ap-master-excel-hucre" onClick={(e) => e.stopPropagation()}>
                    {!yeni ? (
                      <button type="button" className="ap-tanimlar-tablo-btn" onClick={() => onAyarlar(g)}>
                        Ayarlar
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
