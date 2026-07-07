import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import type { SatisRaporFiltre } from '@/admin/baslat-menusu/raporlar/satis-ortak/tipler';
import {
  urunFiltreSecenekleri,
  urunGrubuFiltreSecenekleri,
} from '@/admin/baslat-menusu/raporlar/satis-ortak/yardimci';

interface SatisRaporFiltreleriProps {
  filtre: SatisRaporFiltre;
  onChange: (filtre: SatisRaporFiltre) => void;
  onFiltrele: () => void;
  filtreleniyor?: boolean;
}

export function SatisRaporFiltreleri({
  filtre,
  onChange,
  onFiltrele,
  filtreleniyor,
}: SatisRaporFiltreleriProps) {
  const urunler = urunFiltreSecenekleri();
  const gruplar = urunGrubuFiltreSecenekleri();

  return (
    <section className="ap-satis-rapor-filtre">
      <div className="ap-satis-rapor-filtre-ikon" aria-hidden>
        <span className="ap-satis-rapor-filtre-ikon-ic" />
      </div>

      <div className="ap-satis-rapor-filtre-alanlar">
        <div className="ap-satis-rapor-filtre-satir">
          <label className="ap-satis-rapor-etiket ap-satis-rapor-etiket-genis">
            <span>(Siparişin alındığı) Tarih Aralığı</span>
            <div className="ap-satis-rapor-tarih-cift">
              <input
                type="datetime-local"
                className={formInputSinifi}
                value={filtre.baslangic}
                onChange={(e) => onChange({ ...filtre, baslangic: e.target.value })}
              />
              <span className="ap-satis-rapor-tarih-ayrac">—</span>
              <input
                type="datetime-local"
                className={formInputSinifi}
                value={filtre.bitis}
                onChange={(e) => onChange({ ...filtre, bitis: e.target.value })}
              />
            </div>
          </label>

          <label className="ap-satis-rapor-etiket">
            <span>Ürün</span>
            <select
              className={formSelectSinifi}
              value={filtre.urun}
              onChange={(e) => onChange({ ...filtre, urun: e.target.value })}
            >
              <option value="">Tümü</option>
              {urunler
                .filter(Boolean)
                .map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
            </select>
          </label>

          <label className="ap-satis-rapor-etiket">
            <span>Ürün Grubu</span>
            <select
              className={formSelectSinifi}
              value={filtre.urunGrubu}
              onChange={(e) => onChange({ ...filtre, urunGrubu: e.target.value })}
            >
              <option value="">Tümü</option>
              {gruplar
                .filter(Boolean)
                .map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          className="ap-satis-rapor-filtre-tus"
          onClick={onFiltrele}
          disabled={filtreleniyor}
        >
          {filtreleniyor ? 'Filtreleniyor…' : 'Filtrele'}
        </button>
      </div>
    </section>
  );
}
