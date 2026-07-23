import { useCallback, useRef } from 'react';
import type { AdresFormDegeri } from '@/admin/baslat-menusu/tanimlar/tipler';
import { tanimBuyukHarf } from '@/admin/baslat-menusu/tanimlar/alanKurallari';
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
      const buyuk: Partial<AdresFormDegeri> = {};
      for (const [k, v] of Object.entries(alanlar)) {
        buyuk[k as keyof AdresFormDegeri] =
          typeof v === 'string' ? tanimBuyukHarf(v) : (v as never);
      }
      onChange(adresSifirla(degerRef.current, buyuk));
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
          onChange={(e) =>
            adresGuncelle({ adres: tanimBuyukHarf(e.target.value).slice(0, 500) })
          }
          maxLength={500}
          rows={3}
          placeholder="CADDE, SOKAK, BINA NO VE DIĞER ADRES BİLGİLERİ"
          aria-label="Adres"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          data-form-type="other"
          name="ap-tanim-adres-metin"
        />
      </label>
      <label className="ap-tanimlar-secim-alan block">
        <span className="ap-tanim-girdi-etiket">İl</span>
        <FormAramaSecim
          value={deger.il}
          buyukHarf
          onChange={(il) => {
            const mevcut = degerRef.current;
            const kanonikHam = turkiyeIlKayitliMi(il) ? turkiyeIlAdiniDuzelt(il) : il;
            const kanonik = tanimBuyukHarf(kanonikHam);
            if (kanonik !== mevcut.il) void turkiyeIlceOnbellekYukle(kanonikHam);
            adresGuncelle({
              il: kanonik,
              ilce: kanonik !== mevcut.il ? '' : mevcut.ilce,
              mahalle: '',
              postaKodu: '',
            });
          }}
          onSecildi={(il) => {
            const duzeltilmisHam = turkiyeIlAdiniDuzelt(il);
            const duzeltilmis = tanimBuyukHarf(duzeltilmisHam);
            void turkiyeIlceOnbellekYukle(duzeltilmisHam);
            if (duzeltilmis !== tanimBuyukHarf(il)) {
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
          placeholder="EN AZ 2 HARF YAZIN…"
          aria-label="İl"
        />
      </label>
      <label className="ap-tanimlar-secim-alan block">
        <span className="ap-tanim-girdi-etiket">İlçe</span>
        <FormAramaSecim
          value={deger.ilce}
          buyukHarf
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
          placeholder={ilSecildi ? 'EN AZ 2 HARF YAZIN…' : 'ÖNCE İL SEÇİN'}
          aria-label="İlçe"
        />
      </label>
    </div>
  );

  if (bolumsuz) return icerik;
  return <TanimFormBolum baslik="Adres">{icerik}</TanimFormBolum>;
}
