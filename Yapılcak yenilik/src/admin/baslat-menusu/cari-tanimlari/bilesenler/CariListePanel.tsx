import type { CariTanim } from '@/admin/baslat-menusu/cari-tanimlari/tipler';

interface CariListePanelProps {
  cariler: CariTanim[];
  seciliId: number | null;
  filtre: string;
  pasifleriGizle: boolean;
  klavyeAcik: boolean;
  onFiltreAlaniTikla: () => void;
  onFiltreDegistir: (deger: string) => void;
  onPasifleriGizleDegistir: (deger: boolean) => void;
  onSatirSec: (id: number) => void;
}

export function CariListePanel({
  cariler,
  seciliId,
  filtre,
  pasifleriGizle,
  klavyeAcik,
  onFiltreAlaniTikla,
  onFiltreDegistir,
  onPasifleriGizleDegistir,
  onSatirSec,
}: CariListePanelProps) {
  return (
    <div className="ap-cari-liste-panel">
      <div className="ap-cari-filtre-satir">
        <button type="button" className="ap-cari-filtre-etiket" onClick={onFiltreAlaniTikla}>
          <span className="ap-cari-filtre-ikon" aria-hidden>
            ⌨
          </span>
          <span>Filtre girin yada müşteri kartını okutun:</span>
        </button>
        <input
          type="text"
          className={`ap-cari-filtre-input ${klavyeAcik ? 'ap-cari-filtre-input-aktif' : ''}`}
          value={filtre}
          onChange={(e) => onFiltreDegistir(e.target.value)}
          onFocus={onFiltreAlaniTikla}
          onClick={onFiltreAlaniTikla}
          placeholder="Ad, telefon, kart no..."
          autoComplete="off"
        />
      </div>

      <div className="ap-cari-tablo-scroll">
        <table className="ap-cari-tablo">
          <thead>
            <tr>
              <th>Ad</th>
              <th>Ünvan / Kategori</th>
              <th>Telefon</th>
              <th>Kod</th>
              <th className="ap-cari-tablo-aktif-baslik">Aktif</th>
            </tr>
          </thead>
          <tbody>
            {cariler.length === 0 ? (
              <tr>
                <td colSpan={5} className="ap-cari-tablo-bos">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              cariler.map((cari) => (
                <tr
                  key={cari.id}
                  className={seciliId === cari.id ? 'ap-cari-tablo-satir-secili' : ''}
                  onClick={() => onSatirSec(cari.id)}
                >
                  <td>{cari.ad || '—'}</td>
                  <td>{cari.unvan || cari.kategori || '—'}</td>
                  <td>{cari.telefon || '—'}</td>
                  <td>{cari.kod}</td>
                  <td className="ap-cari-tablo-aktif-hucre">
                    <input type="checkbox" checked={cari.aktif} readOnly tabIndex={-1} aria-label="Aktif" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <label className="ap-cari-pasif-gizle">
        <input
          type="checkbox"
          checked={pasifleriGizle}
          onChange={(e) => onPasifleriGizleDegistir(e.target.checked)}
        />
        <span>Pasifleri gizle</span>
      </label>
    </div>
  );
}
