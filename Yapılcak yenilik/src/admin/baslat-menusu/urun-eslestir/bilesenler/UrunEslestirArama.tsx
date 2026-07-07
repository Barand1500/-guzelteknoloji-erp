import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import {
  ESLESTIRME_DURUMLARI,
  PLATFORM_GRUPLARI,
  type EslestirmeDurumu,
  type PlatformGrubu,
} from '@/admin/baslat-menusu/urun-eslestir/tipler';

export interface UrunEslestirFiltre {
  stokAdi: string;
  eslestirme: EslestirmeDurumu;
  platform: PlatformGrubu | 'Tümü';
}

export function bosUrunEslestirFiltre(): UrunEslestirFiltre {
  return { stokAdi: '', eslestirme: 'tumu', platform: 'Getir' };
}

interface UrunEslestirAramaProps {
  filtre: UrunEslestirFiltre;
  onFiltreDegistir: (filtre: UrunEslestirFiltre) => void;
  onTemizle: () => void;
  onEslestir: () => void;
  eslestirAktif: boolean;
}

export function UrunEslestirArama({
  filtre,
  onFiltreDegistir,
  onTemizle,
  onEslestir,
  eslestirAktif,
}: UrunEslestirAramaProps) {
  return (
    <div className="ap-urun-eslestir-arama">
      <div className="ap-urun-eslestir-arama-alanlar">
        <label className="ap-urun-eslestir-etiket">
          Stok Adı
          <input
            type="search"
            className={formInputSinifi}
            placeholder="Ürün adı ara…"
            value={filtre.stokAdi}
            onChange={(e) => onFiltreDegistir({ ...filtre, stokAdi: e.target.value })}
            aria-label="Stok adı"
          />
        </label>

        <label className="ap-urun-eslestir-etiket">
          Eşleştirme
          <select
            className={formSelectSinifi}
            value={filtre.eslestirme}
            onChange={(e) =>
              onFiltreDegistir({ ...filtre, eslestirme: e.target.value as EslestirmeDurumu })
            }
            aria-label="Eşleştirme durumu"
          >
            {ESLESTIRME_DURUMLARI.map((d) => (
              <option key={d.id} value={d.id}>
                {d.etiket}
              </option>
            ))}
          </select>
        </label>

        <label className="ap-urun-eslestir-etiket">
          Platform
          <select
            className={formSelectSinifi}
            value={filtre.platform}
            onChange={(e) =>
              onFiltreDegistir({
                ...filtre,
                platform: e.target.value as UrunEslestirFiltre['platform'],
              })
            }
            aria-label="Platform grubu"
          >
            <option value="Tümü">Tümü</option>
            {PLATFORM_GRUPLARI.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="ap-urun-eslestir-arama-tuslar">
        <button
          type="button"
          className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
          onClick={onTemizle}
        >
          Temizle
        </button>
        <button
          type="button"
          className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil"
          disabled={!eslestirAktif}
          onClick={onEslestir}
        >
          Eşleştir
        </button>
      </div>
    </div>
  );
}
