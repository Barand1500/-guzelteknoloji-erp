import { useCallback, useRef } from 'react';
import type { AdresFormDegeri } from '@/admin/baslat-menusu/tanimlar/tipler';
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

interface OrtakAdresFormuProps {
  deger: AdresFormDegeri;
  onChange: (deger: AdresFormDegeri) => void;
  bolumsuz?: boolean;
}

function adresSifirla(
  deger: AdresFormDegeri,
  alanlar: Partial<AdresFormDegeri>
): AdresFormDegeri {
  return { ...deger, ...alanlar };
}

export function OrtakAdresFormu({ deger, onChange, bolumsuz = false }: OrtakAdresFormuProps) {
  const degerRef = useRef(deger);
  degerRef.current = deger;

  const adresGuncelle = useCallback(
    (alanlar: Partial<AdresFormDegeri>) => {
      onChange(adresSifirla(degerRef.current, alanlar));
    },
    [onChange]
  );

  const ilceAra = useCallback(
    (arama: string) => turkiyeIlceAra(degerRef.current.il, arama),
    []
  );

  const ilSecildi = turkiyeIlKayitliMi(deger.il);

  const icerik = (
    <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
      <label className="ap-tanim-girdi block ap-tanimlar-adres-tam">
        <span className="ap-tanim-girdi-etiket">Adres</span>
        <textarea
          className={`${formInputSinifi} ap-tanimlar-adres-metin`}
          value={deger.adres}
          onChange={(e) => adresGuncelle({ adres: e.target.value.slice(0, 500) })}
          maxLength={500}
          rows={3}
          placeholder="Cadde, sokak, bina no ve diğer adres bilgileri"
          aria-label="Adres"
        />
      </label>
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
              mahalle: '',
              postaKodu: '',
            });
          }}
          onSecildi={(il) => {
            const duzeltilmis = turkiyeIlAdiniDuzelt(il);
            void turkiyeIlceOnbellekYukle(duzeltilmis);
            if (duzeltilmis !== il) {
              adresGuncelle({
                il: duzeltilmis,
                ilce: '',
                mahalle: '',
                postaKodu: '',
              });
            }
          }}
          secenekAra={turkiyeIlAra}
          minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
          placeholder="En az 2 harf yazın…"
          aria-label="İl"
        />
      </label>
      <label className="ap-tanimlar-secim-alan block">
        <span className="ap-tanim-girdi-etiket">İlçe</span>
        <FormAramaSecim
          value={deger.ilce}
          onChange={(ilce) => {
            adresGuncelle({
              ilce,
              mahalle: '',
              postaKodu: '',
            });
          }}
          secenekAra={ilSecildi ? ilceAra : undefined}
          minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
          disabled={!ilSecildi}
          placeholder={ilSecildi ? 'En az 2 harf yazın…' : 'Önce il seçin'}
          aria-label="İlçe"
        />
      </label>
    </div>
  );

  if (bolumsuz) return icerik;
  return <TanimFormBolum baslik="Adres">{icerik}</TanimFormBolum>;
}
