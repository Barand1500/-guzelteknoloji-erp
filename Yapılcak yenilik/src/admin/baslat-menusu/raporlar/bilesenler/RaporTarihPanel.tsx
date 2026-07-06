import { formInputSinifi } from '@/formlar/FormAlani';
import type { RaporKayit } from '@/admin/baslat-menusu/raporlar/tipler';
import { KOLAY_SAAT_SECENEKLERI, KOLAY_TARIH_SECENEKLERI } from '@/admin/baslat-menusu/raporlar/varsayilanVeri';
import { kolaySaatUygula, kolayTarihUygula, saatAraligiHesapla, saatAraligiMetni } from '@/admin/baslat-menusu/raporlar/yardimci';
import { RaporTarihAlani } from '@/admin/baslat-menusu/raporlar/bilesenler/RaporTarihAlani';

interface RaporTarihPanelProps {
  kayit: RaporKayit;
  onKayitDegistir: (kayit: RaporKayit) => void;
}

export function RaporTarihPanel({ kayit, onKayitDegistir }: RaporTarihPanelProps) {
  const aralikSaat = saatAraligiHesapla(kayit);

  return (
    <section className="ap-rapor-tarih-panel" aria-label="Tarih seçimi">
      <h3 className="ap-rapor-panel-baslik">Tarih</h3>

      <div className="ap-rapor-kolay-secim-grid">
        <div className="ap-rapor-kolay-kutu">
          <p className="ap-rapor-kolay-baslik">Kolay Tarih Seçimi</p>
          <ul className="ap-rapor-kolay-liste" role="listbox" aria-label="Kolay tarih seçimi">
            {KOLAY_TARIH_SECENEKLERI.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={kayit.kolayTarih === s.id}
                  className={`ap-rapor-kolay-oge${kayit.kolayTarih === s.id ? ' ap-rapor-kolay-oge-secili' : ''}`}
                  onClick={() => {
                    const tarihler = kolayTarihUygula(s.id);
                    onKayitDegistir({ ...kayit, kolayTarih: s.id, ...tarihler });
                  }}
                >
                  {s.etiket}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="ap-rapor-kolay-kutu">
          <p className="ap-rapor-kolay-baslik">Kolay saat seçimi</p>
          <ul className="ap-rapor-kolay-liste" role="listbox" aria-label="Kolay saat seçimi">
            {KOLAY_SAAT_SECENEKLERI.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={kayit.kolaySaat === s.id}
                  className={`ap-rapor-kolay-oge${kayit.kolaySaat === s.id ? ' ap-rapor-kolay-oge-secili' : ''}`}
                  onClick={() => {
                    const saatler = kolaySaatUygula(s.id);
                    onKayitDegistir({ ...kayit, kolaySaat: s.id, ...saatler });
                  }}
                >
                  {s.etiket}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ap-rapor-aralik-kutu">
        <p className="ap-rapor-aralik-baslik">Tarih aralığı</p>

        <div className="ap-rapor-aralik-satir">
          <span className="ap-rapor-aralik-etiket">Tarih:</span>
          <RaporTarihAlani
            deger={kayit.baslangicTarih}
            onDegistir={(baslangicTarih) => onKayitDegistir({ ...kayit, baslangicTarih })}
            ariaLabel="Başlangıç tarihi"
          />
          <span className="ap-rapor-aralik-etiket">Saat:</span>
          <input
            type="time"
            className={`${formInputSinifi} ap-rapor-saat-girdi`}
            value={kayit.baslangicSaat}
            onChange={(e) => onKayitDegistir({ ...kayit, baslangicSaat: e.target.value })}
          />
        </div>

        <div className="ap-rapor-aralik-satir">
          <span className="ap-rapor-aralik-etiket">Tarih:</span>
          <RaporTarihAlani
            deger={kayit.bitisTarih}
            onDegistir={(bitisTarih) => onKayitDegistir({ ...kayit, bitisTarih })}
            ariaLabel="Bitiş tarihi"
          />
          <span className="ap-rapor-aralik-etiket">Saat:</span>
          <input
            type="time"
            className={`${formInputSinifi} ap-rapor-saat-girdi`}
            value={kayit.bitisSaat}
            onChange={(e) => onKayitDegistir({ ...kayit, bitisSaat: e.target.value })}
          />
        </div>

        <p className="ap-rapor-aralik-ozet">{aralikSaat > 0 ? saatAraligiMetni(aralikSaat) : 'Geçerli bir tarih aralığı seçin.'}</p>
      </div>
    </section>
  );
}
