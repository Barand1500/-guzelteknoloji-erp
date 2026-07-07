import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import type { PsSatisRaporFiltre } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-raporu/tipler';
import { psUrunFiltreSecenekleri } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-satis-raporu/yardimci';

interface PsSatisRaporFiltreleriProps {
  filtre: PsSatisRaporFiltre;
  onChange: (filtre: PsSatisRaporFiltre) => void;
  onFiltrele: () => void;
  filtreleniyor?: boolean;
}

export function PsSatisRaporFiltreleri({
  filtre,
  onChange,
  onFiltrele,
  filtreleniyor,
}: PsSatisRaporFiltreleriProps) {
  const urunler = psUrunFiltreSecenekleri();

  return (
    <section className="ap-satis-rapor-filtre">
      <div className="ap-satis-rapor-filtre-ikon" aria-hidden>
        <span className="ap-satis-rapor-filtre-ikon-ic" />
      </div>

      <div className="ap-satis-rapor-filtre-alanlar">
        <div className="ap-satis-rapor-filtre-satir ap-ps-satis-rapor-filtre-satir">
          <label className="ap-satis-rapor-etiket ap-satis-rapor-etiket-genis">
            <span>Tarih Aralığı</span>
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
              {urunler.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          className="ap-satis-rapor-filtre-tus ap-ps-satis-rapor-filtre-tus"
          onClick={onFiltrele}
          disabled={filtreleniyor}
        >
          {filtreleniyor ? 'Filtreleniyor…' : 'Filtrele'}
        </button>
      </div>
    </section>
  );
}
