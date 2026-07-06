import { formInputSinifi } from '@/formlar/FormAlani';
import {
  ucretDegeriTemizle,
  ucretOnizleme,
  type PaketServisUcretAlan,
  type PaketServisUcretKurali,
  type PaketUcretTipi,
} from '@/admin/baslat-menusu/tanimlar/paket-servisi-ucretleri/tipler';

interface PaketServisUcretTabloProps {
  kurallar: PaketServisUcretKurali[];
  seciliId: number | null;
  onSatirSec: (id: number) => void;
  onKuralDegistir: (id: number, alan: PaketServisUcretAlan, deger: string) => void;
  onUcretTipiDegistir: (id: number, tip: PaketUcretTipi) => void;
}

function UcretTipiSecici({
  tip,
  onDegistir,
}: {
  tip: PaketUcretTipi;
  onDegistir: (tip: PaketUcretTipi) => void;
}) {
  return (
    <div className="ap-tanimlar-paket-tip-secici" role="group" aria-label="Ücret tipi">
      <button
        type="button"
        className={`ap-tanimlar-paket-tip-tus ${tip === 'tutar' ? 'ap-tanimlar-paket-tip-tus-aktif' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onDegistir('tutar');
        }}
      >
        Tutar
      </button>
      <button
        type="button"
        className={`ap-tanimlar-paket-tip-tus ${tip === 'oran' ? 'ap-tanimlar-paket-tip-tus-aktif' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onDegistir('oran');
        }}
      >
        Oran
      </button>
    </div>
  );
}

export function PaketServisUcretTablo({
  kurallar,
  seciliId,
  onSatirSec,
  onKuralDegistir,
  onUcretTipiDegistir,
}: PaketServisUcretTabloProps) {
  return (
    <div className="ap-master-excel-wrap ap-tanimlar-paket-tablo">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              <th>Bu Tutara Kadar</th>
              <th>Servis Olarak Eklenecek Ürün</th>
              <th>Uygulanacak Servis Ücreti</th>
            </tr>
          </thead>
          <tbody>
            {kurallar.map((k) => (
              <tr
                key={k.id}
                className={seciliId === k.id ? 'ap-master-excel-satir-secili' : ''}
                onClick={() => onSatirSec(k.id)}
              >
                <td className="ap-master-excel-hucre">
                  <div className="ap-tanimlar-paket-hucre-input">
                    <input
                      type="text"
                      inputMode="decimal"
                      className={`${formInputSinifi} ap-master-excel-input w-full`}
                      value={k.tutaraKadar}
                      onChange={(e) => onKuralDegistir(k.id, 'tutaraKadar', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="0"
                      aria-label="Bu tutara kadar"
                    />
                    <span className="ap-tanimlar-paket-birim">₺</span>
                  </div>
                </td>
                <td className="ap-master-excel-hucre">
                  <input
                    type="text"
                    className={`${formInputSinifi} ap-master-excel-input w-full`}
                    value={k.servisUrunu}
                    onChange={(e) => onKuralDegistir(k.id, 'servisUrunu', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Servis olarak eklenecek ürün"
                  />
                </td>
                <td className="ap-master-excel-hucre">
                  <UcretTipiSecici
                    tip={k.ucretTipi}
                    onDegistir={(tip) => onUcretTipiDegistir(k.id, tip)}
                  />
                  <div className="ap-tanimlar-paket-hucre-input ap-tanimlar-paket-ucret-hucre">
                    {k.ucretTipi === 'oran' && (
                      <span className="ap-tanimlar-paket-yuzde-on">%</span>
                    )}
                    <input
                      type="text"
                      inputMode="decimal"
                      className={`${formInputSinifi} ap-master-excel-input w-full`}
                      value={k.ucretDegeri}
                      onChange={(e) =>
                        onKuralDegistir(k.id, 'ucretDegeri', ucretDegeriTemizle(e.target.value))
                      }
                      onClick={(e) => e.stopPropagation()}
                      placeholder={k.ucretTipi === 'oran' ? '5' : '25'}
                      aria-label="Servis ücreti değeri"
                    />
                    {k.ucretTipi === 'tutar' && (
                      <span className="ap-tanimlar-paket-birim">₺</span>
                    )}
                  </div>
                  {k.ucretDegeri.trim() && (
                    <p className="ap-tanimlar-paket-ucret-onizleme">
                      Önizleme: {ucretOnizleme(k.ucretTipi, k.ucretDegeri)}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ap-tanimlar-paket-ipucu">
        <strong>Servis ücreti:</strong> Tutar veya Oran seçeneğine tıklayarak değiştirin. Oran
        modunda <code>%</code> otomatik eklenir; tutar modunda yalnızca rakam girin.
      </div>
    </div>
  );
}
