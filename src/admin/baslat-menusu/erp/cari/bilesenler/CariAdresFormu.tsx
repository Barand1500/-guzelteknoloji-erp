import { useCallback, useRef } from 'react';
import type { CariAdresDegeri } from '@/admin/baslat-menusu/erp/cari/tipler';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { formInputSinifi } from '@/formlar/FormAlani';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import {
  MIN_ADRES_ARAMA_UZUNLUGU,
  turkiyeIlAra,
  turkiyeIlAdiniDuzelt,
  turkiyeIlceAra,
  turkiyeIlceOnbellekYukle,
  turkiyeIlKayitliMi,
} from '@/veri/turkiyeIlIlce';

interface CariAdresFormuProps {
  deger: CariAdresDegeri;
  onChange: (deger: CariAdresDegeri) => void;
  bolumsuz?: boolean;
}

export function CariAdresFormu({ deger, onChange, bolumsuz = false }: CariAdresFormuProps) {
  const degerRef = useRef(deger);
  degerRef.current = deger;

  const adresGuncelle = useCallback(
    (alanlar: Partial<CariAdresDegeri>) => {
      onChange({ ...degerRef.current, ...alanlar });
    },
    [onChange]
  );

  const ilceAra = useCallback((arama: string) => turkiyeIlceAra(degerRef.current.il, arama), []);

  const ilSecildi = turkiyeIlKayitliMi(deger.il);

  const icerik = (
    <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
      <label className="ap-tanimlar-secim-alan block">
        <span className="ap-tanim-girdi-etiket">İl</span>
        <FormAramaSecim
          value={deger.il}
          onChange={(il) => {
            const mevcut = degerRef.current;
            const kanonik = turkiyeIlKayitliMi(il) ? turkiyeIlAdiniDuzelt(il) : il;
            if (kanonik !== mevcut.il) void turkiyeIlceOnbellekYukle(kanonik);
            adresGuncelle({
              il: kanonik,
              ilce: kanonik !== mevcut.il ? '' : mevcut.ilce,
            });
          }}
          secenekAra={turkiyeIlAra}
          minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
          placeholder="İl seçin…"
          aria-label="İl"
        />
      </label>
      <label className="ap-tanimlar-secim-alan block">
        <span className="ap-tanim-girdi-etiket">İlçe</span>
        <FormAramaSecim
          value={deger.ilce}
          onChange={(ilce) => adresGuncelle({ ilce })}
          secenekAra={ilceAra}
          minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
          placeholder={ilSecildi ? 'İlçe seçin…' : 'Önce il seçin'}
          disabled={!ilSecildi}
          aria-label="İlçe"
        />
      </label>
      <label className="ap-tanimlar-secim-alan block ap-tanimlar-alan-grid--tam">
        <span className="ap-tanim-girdi-etiket">Adres</span>
        <textarea
          className={`${formInputSinifi} ap-tanimlar-adres-metin`}
          value={deger.adres}
          onChange={(e) => adresGuncelle({ adres: e.target.value.slice(0, 500) })}
          rows={3}
          placeholder="Cadde, sokak, bina no…"
          aria-label="Adres"
        />
      </label>
    </div>
  );

  if (bolumsuz) return icerik;
  return <TanimFormBolum baslik="Adres">{icerik}</TanimFormBolum>;
}
