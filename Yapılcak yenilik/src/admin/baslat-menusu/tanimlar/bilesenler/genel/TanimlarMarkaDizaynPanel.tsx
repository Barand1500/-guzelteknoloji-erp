import { formInputSinifi } from '@/formlar/FormAlani';
import type { DizaynBaslikSatir, DizaynSatir, TanimlarGenelForm } from '@/admin/baslat-menusu/tanimlar/genel/tipler';

interface TanimlarMarkaDizaynPanelProps {
  form: TanimlarGenelForm;
  onFormDegistir: (form: TanimlarGenelForm) => void;
}

function BaslikTablo({
  baslik,
  satirlar,
  onDegistir,
}: {
  baslik: string;
  satirlar: DizaynBaslikSatir[];
  onDegistir: (satirlar: DizaynBaslikSatir[]) => void;
}) {
  const guncelle = (idx: number, alan: keyof DizaynBaslikSatir, deger: string | number | boolean) => {
    const yeni = satirlar.map((s, i) => (i === idx ? { ...s, [alan]: deger } : s));
    onDegistir(yeni);
  };

  return (
    <div className="ap-tanimlar-dizayn-bolum">
      <h4 className="ap-tanimlar-dizayn-bolum-baslik">{baslik}</h4>
      <div className="ap-master-excel-wrap">
        <div className="ap-master-excel-scroll">
          <table className="ap-master-excel-tablo ap-tanimlar-dizayn-tablo">
            <thead>
              <tr>
                <th>Alan</th>
                <th>Satır</th>
                <th>Sütun</th>
                <th>Genişlik</th>
                <th>Sağa yaslı</th>
                <th>Font</th>
              </tr>
            </thead>
            <tbody>
              {satirlar.map((s, idx) => (
                <tr key={`${baslik}-${idx}`}>
                  <td className="ap-master-excel-hucre">
                    <input
                      className={`${formInputSinifi} ap-tanimlar-dizayn-input`}
                      value={s.alan}
                      onChange={(e) => guncelle(idx, 'alan', e.target.value)}
                    />
                  </td>
                  <td className="ap-master-excel-hucre">
                    <input
                      type="number"
                      className={`${formInputSinifi} ap-tanimlar-dizayn-input ap-tanimlar-dizayn-input-sayi`}
                      value={s.satir}
                      onChange={(e) => guncelle(idx, 'satir', Number(e.target.value))}
                    />
                  </td>
                  <td className="ap-master-excel-hucre">
                    <input
                      type="number"
                      className={`${formInputSinifi} ap-tanimlar-dizayn-input ap-tanimlar-dizayn-input-sayi`}
                      value={s.sutun}
                      onChange={(e) => guncelle(idx, 'sutun', Number(e.target.value))}
                    />
                  </td>
                  <td className="ap-master-excel-hucre">
                    <input
                      type="number"
                      className={`${formInputSinifi} ap-tanimlar-dizayn-input ap-tanimlar-dizayn-input-sayi`}
                      value={s.genislik}
                      onChange={(e) => guncelle(idx, 'genislik', Number(e.target.value))}
                    />
                  </td>
                  <td className="ap-master-excel-hucre ap-master-tablo-toggle-hucre">
                    <input
                      type="checkbox"
                      checked={s.sagaYasli}
                      onChange={(e) => guncelle(idx, 'sagaYasli', e.target.checked)}
                      aria-label={`${s.alan || 'Satır'} sağa yaslı`}
                    />
                  </td>
                  <td className="ap-master-excel-hucre">
                    <input
                      type="number"
                      className={`${formInputSinifi} ap-tanimlar-dizayn-input ap-tanimlar-dizayn-input-sayi`}
                      value={s.font}
                      onChange={(e) => guncelle(idx, 'font', Number(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SatirlarTablo({
  satirlar,
  onDegistir,
}: {
  satirlar: DizaynSatir[];
  onDegistir: (satirlar: DizaynSatir[]) => void;
}) {
  const guncelle = (idx: number, alan: keyof DizaynSatir, deger: string | number | boolean) => {
    const yeni = satirlar.map((s, i) => (i === idx ? { ...s, [alan]: deger } : s));
    onDegistir(yeni);
  };

  return (
    <div className="ap-tanimlar-dizayn-bolum">
      <h4 className="ap-tanimlar-dizayn-bolum-baslik">Satırlar Kısmı</h4>
      <div className="ap-master-excel-wrap">
        <div className="ap-master-excel-scroll ap-tanimlar-dizayn-scroll">
          <table className="ap-master-excel-tablo ap-tanimlar-dizayn-tablo">
            <thead>
              <tr>
                <th>Alan</th>
                <th>Alt satır</th>
                <th>Sütun</th>
                <th>Genişlik</th>
                <th>Sağa yaslı</th>
                <th>Font</th>
              </tr>
            </thead>
            <tbody>
              {satirlar.map((s, idx) => (
                <tr key={s.alan}>
                  <td className="ap-master-excel-hucre ap-tanimlar-dizayn-alan-hucre">{s.alan}</td>
                  <td className="ap-master-excel-hucre ap-master-tablo-toggle-hucre">
                    <input
                      type="checkbox"
                      checked={s.altSatir}
                      onChange={(e) => guncelle(idx, 'altSatir', e.target.checked)}
                      aria-label={`${s.alan} alt satır`}
                    />
                  </td>
                  <td className="ap-master-excel-hucre">
                    <input
                      type="number"
                      className={`${formInputSinifi} ap-tanimlar-dizayn-input ap-tanimlar-dizayn-input-sayi`}
                      value={s.sutun}
                      onChange={(e) => guncelle(idx, 'sutun', Number(e.target.value))}
                    />
                  </td>
                  <td className="ap-master-excel-hucre">
                    <input
                      type="number"
                      className={`${formInputSinifi} ap-tanimlar-dizayn-input ap-tanimlar-dizayn-input-sayi`}
                      value={s.genislik}
                      onChange={(e) => guncelle(idx, 'genislik', Number(e.target.value))}
                    />
                  </td>
                  <td className="ap-master-excel-hucre ap-master-tablo-toggle-hucre">
                    <input
                      type="checkbox"
                      checked={s.sagaYasli}
                      onChange={(e) => guncelle(idx, 'sagaYasli', e.target.checked)}
                      aria-label={`${s.alan} sağa yaslı`}
                    />
                  </td>
                  <td className="ap-master-excel-hucre">
                    <input
                      type="number"
                      className={`${formInputSinifi} ap-tanimlar-dizayn-input ap-tanimlar-dizayn-input-sayi`}
                      value={s.font}
                      onChange={(e) => guncelle(idx, 'font', Number(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function TanimlarMarkaDizaynPanel({
  form,
  onFormDegistir,
}: TanimlarMarkaDizaynPanelProps) {
  return (
    <section className="ap-tanimlar-inline-panel ap-tanimlar-inline-panel-genis" aria-label="Marka çıktı dizaynı">
      <div className="ap-tanimlar-inline-panel-baslik">
        <div>
          <h3 className="ap-heading text-sm font-semibold">Dizayn</h3>
          <p className="ap-muted mt-0.5 text-xs">Marka çıktısı başlık, satır ve özet alanları</p>
        </div>
      </div>

      <BaslikTablo
        baslik="Başlık Kısmı"
        satirlar={form.baslikSatirlari}
        onDegistir={(baslikSatirlari) => onFormDegistir({ ...form, baslikSatirlari })}
      />

      <SatirlarTablo
        satirlar={form.satirAlanlari}
        onDegistir={(satirAlanlari) => onFormDegistir({ ...form, satirAlanlari })}
      />

      <BaslikTablo
        baslik="Özet Kısmı"
        satirlar={form.ozetSatirlari}
        onDegistir={(ozetSatirlari) => onFormDegistir({ ...form, ozetSatirlari })}
      />
    </section>
  );
}
