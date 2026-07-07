import { useCallback, useEffect, useMemo, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { RestoranVardiyaSaatSecici } from '@/admin/baslat-menusu/tanimlar/bilesenler/restoran-durumu/RestoranVardiyaSaatSecici';
import {
  RESTORAN_DURUMU_VARSAYILAN,
  type RestoranDurumuAlan,
  type RestoranDurumuAyar,
} from '@/admin/baslat-menusu/tanimlar/restoran-durumu/tipler';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

const VARDIYA_ALANLARI: { alan: RestoranDurumuAlan; baslik: string; ikon: string }[] = [
  { alan: 'sabah', baslik: 'Sabah', ikon: '🌅' },
  { alan: 'ogle', baslik: 'Öğle', ikon: '☀️' },
  { alan: 'aksam', baslik: 'Akşam', ikon: '🌙' },
];

export function TanimlarRestoranDurumuSekme({ onKirliDegisti }: { onKirliDegisti?: (kirli: boolean) => void }) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [ayar, setAyar] = useState<RestoranDurumuAyar>(() => ({ ...RESTORAN_DURUMU_VARSAYILAN }));
  const [sonKayitli, setSonKayitli] = useState<RestoranDurumuAyar>(() => ({ ...RESTORAN_DURUMU_VARSAYILAN }));

  const kirli = useMemo(() => JSON.stringify(ayar) !== JSON.stringify(sonKayitli), [ayar, sonKayitli]);

  useEffect(() => {
    onKirliDegisti?.(kirli);
  }, [kirli, onKirliDegisti]);

  const alanDegistir = useCallback((alan: RestoranDurumuAlan, deger: string) => {
    setAyar((onceki) => ({ ...onceki, [alan]: deger }));
  }, []);

  const kaydet = useCallback(() => {
    for (const { alan, baslik } of VARDIYA_ALANLARI) {
      if (!ayar[alan]) {
        hataBildir(`${baslik} vardiya saati girilmelidir`);
        return;
      }
    }
    const dakika = Number(ayar.rezervasyonUyariDakika);
    if (!ayar.rezervasyonUyariDakika.trim() || Number.isNaN(dakika) || dakika < 0) {
      hataBildir('Rezervasyon uyarı süresi geçerli bir dakika değeri olmalıdır');
      return;
    }
    basariBildir('Restoran durumu kaydedildi.');
    setSonKayitli({ ...ayar });
  }, [ayar, basariBildir, hataBildir]);

  useModulAksiyonlari(
    { kaydet },
    { kaydet: kirli, ekle: false, sil: false, onizle: false, yayinla: false },
    kirli
  );

  return (
    <div className="ap-tanimlar-restoran-sekme">
      <p className="ap-muted mb-4 text-xs">
        Gün içi vardiya başlangıç saatlerini ve rezervasyon uyarı süresini tanımlayın. Alt çubuktan{' '}
        <strong className="ap-heading">Kaydet</strong> ile onaylayın.
      </p>

      <div className="ap-tanimlar-restoran-kart">
        <h4 className="ap-tanimlar-restoran-kart-baslik">Vardiya Saatleri</h4>
        <div className="ap-tanimlar-restoran-vardiya-izgara">
          {VARDIYA_ALANLARI.map(({ alan, baslik, ikon }) => (
            <div key={alan} className="ap-tanimlar-restoran-alan">
              <span className="ap-tanimlar-restoran-alan-baslik">
                <span aria-hidden>{ikon}</span> {baslik}
              </span>
              <RestoranVardiyaSaatSecici
                baslik={baslik}
                ikon={ikon}
                deger={ayar[alan]}
                onDegistir={(v) => alanDegistir(alan, v)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="ap-tanimlar-restoran-kart ap-tanimlar-restoran-kart-dar">
        <label className="ap-tanimlar-restoran-alan">
          <span className="ap-tanimlar-restoran-alan-baslik">
            <span aria-hidden>⏱️</span> Rezervasyon Uyarı Süresi
          </span>
          <div className="ap-tanimlar-restoran-dakika-wrap">
            <input
              type="text"
              inputMode="numeric"
              className={`${formInputSinifi} ap-tanimlar-restoran-dakika`}
              value={ayar.rezervasyonUyariDakika}
              onChange={(e) => alanDegistir('rezervasyonUyariDakika', e.target.value.replace(/\D/g, ''))}
              placeholder="30"
              aria-label="Rezervasyon uyarı süresi dakika"
            />
            <span className="ap-tanimlar-paket-birim">dk</span>
          </div>
          <p className="ap-tanimlar-restoran-alan-ipucu">
            Rezervasyon saatine bu kadar dakika kala uyarı verilir.
          </p>
        </label>
      </div>
    </div>
  );
}
