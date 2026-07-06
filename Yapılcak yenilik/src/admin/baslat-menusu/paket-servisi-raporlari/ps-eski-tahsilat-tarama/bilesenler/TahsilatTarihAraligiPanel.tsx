import { formInputSinifi } from '@/formlar/FormAlani';
import type { TahsilatTaramaModu } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/tipler';
import { TAHSILAT_TARAMA_MOD_ETIKET } from '@/admin/baslat-menusu/paket-servisi-raporlari/ps-eski-tahsilat-tarama/tipler';

function tarihGoster(ymd: string) {
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return new Intl.DateTimeFormat('tr-TR').format(d);
}

interface TahsilatTarihAraligiPanelProps {
  mod: TahsilatTaramaModu;
  baslangic: string;
  bitis: string;
  onBaslangicDegistir: (deger: string) => void;
  onBitisDegistir: (deger: string) => void;
  onGeri: () => void;
  onIleri: () => void;
}

export function TahsilatTarihAraligiPanel({
  mod,
  baslangic,
  bitis,
  onBaslangicDegistir,
  onBitisDegistir,
  onGeri,
  onIleri,
}: TahsilatTarihAraligiPanelProps) {
  const modEtiket = TAHSILAT_TARAMA_MOD_ETIKET[mod].toLowerCase();

  return (
    <section className="ap-tahsilat-tarama-kutu" aria-label="Tarih aralığı">
      <h3 className="ap-tahsilat-tarama-kutu-baslik">Tarih Aralığı</h3>

      <div className="ap-tahsilat-tarama-tarih-satir">
        <button
          type="button"
          className="ap-tahsilat-tarama-nav-tus"
          onClick={onGeri}
          title={`Önceki ${modEtiket} dönem`}
          aria-label={`Önceki ${modEtiket} dönem`}
        >
          ‹‹
        </button>

        <div className="ap-tahsilat-tarama-tarih-alanlar">
          <label className="ap-tahsilat-tarama-tarih-etiket">
            <span>Başlangıç</span>
            <input
              type="date"
              className={formInputSinifi}
              value={baslangic}
              onChange={(e) => onBaslangicDegistir(e.target.value)}
            />
            <span className="ap-tahsilat-tarama-tarih-ozet" aria-hidden>
              {tarihGoster(baslangic)}
            </span>
          </label>

          <span className="ap-tahsilat-tarama-tarih-ayrac" aria-hidden>
            —
          </span>

          <label className="ap-tahsilat-tarama-tarih-etiket">
            <span>Bitiş</span>
            <input
              type="date"
              className={formInputSinifi}
              value={bitis}
              onChange={(e) => onBitisDegistir(e.target.value)}
            />
            <span className="ap-tahsilat-tarama-tarih-ozet" aria-hidden>
              {tarihGoster(bitis)}
            </span>
          </label>
        </div>

        <button
          type="button"
          className="ap-tahsilat-tarama-nav-tus"
          onClick={onIleri}
          title={`Sonraki ${modEtiket} dönem`}
          aria-label={`Sonraki ${modEtiket} dönem`}
        >
          ››
        </button>
      </div>
    </section>
  );
}
