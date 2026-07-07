import type { TahsilatTaramaModu } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/tipler';
import { TAHSILAT_TARAMA_MOD_ETIKET } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/tipler';

const MODLAR: TahsilatTaramaModu[] = ['gunluk', 'haftalik', 'aylik'];

interface TahsilatTaramaModuPanelProps {
  mod: TahsilatTaramaModu;
  onModDegistir: (mod: TahsilatTaramaModu) => void;
}

export function TahsilatTaramaModuPanel({ mod, onModDegistir }: TahsilatTaramaModuPanelProps) {
  return (
    <section className="ap-tahsilat-tarama-kutu" aria-label="Tarama modu">
      <h3 className="ap-tahsilat-tarama-kutu-baslik">Tarama Modu</h3>
      <div className="ap-tahsilat-tarama-modlar" role="radiogroup" aria-label="Tarama modu seçimi">
        {MODLAR.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mod === m}
            className={`ap-tahsilat-tarama-mod-tus${mod === m ? ' ap-tahsilat-tarama-mod-tus-secili' : ''}`}
            onClick={() => onModDegistir(m)}
          >
            {TAHSILAT_TARAMA_MOD_ETIKET[m]}
          </button>
        ))}
      </div>
    </section>
  );
}
