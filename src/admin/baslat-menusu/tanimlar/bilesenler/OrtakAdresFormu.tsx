import { useCallback, useRef } from 'react';
import type { AdresFormDegeri } from '@/admin/baslat-menusu/tanimlar/tipler';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { formInputSinifi } from '@/formlar/FormAlani';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import {
  MIN_ADRES_ARAMA_UZUNLUGU,
  turkiyeIlAra,
  turkiyeIlAdiniDuzelt,
  turkiyeIlceAra,
  turkiyeIlceOnbellekYukle,
  turkiyeIlKayitliMi,
  turkiyeMahalleAra,
  turkiyeMahallePostaKoduBul,
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

  const ilceAra = useCallback(
    (arama: string) => turkiyeIlceAra(degerRef.current.il, arama),
    []
  );
  const mahalleAra = useCallback(
    (arama: string) => turkiyeMahalleAra(degerRef.current.il, degerRef.current.ilce, arama),
    []
  );

  const ilSecildi = turkiyeIlKayitliMi(deger.il);

  const mahallePostaKoduDoldur = useCallback(
    async (mahalle: string, il: string, ilce: string) => {
      if (!mahalle.trim() || !il || !ilce) return;
      const postaKodu = await turkiyeMahallePostaKoduBul(il, ilce, mahalle);
      if (postaKodu) {
        onChange({ ...degerRef.current, mahalle, postaKodu });
      }
    },
    [onChange]
  );

  const icerik = (
    <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
      <label className="ap-tanimlar-secim-alan block">
        <span className="ap-tanim-girdi-etiket">İl</span>
        <FormAramaSecim
          value={deger.il}
          onChange={(il) => {
            const kanonik = turkiyeIlKayitliMi(il) ? turkiyeIlAdiniDuzelt(il) : il;
            if (kanonik !== deger.il) void turkiyeIlceOnbellekYukle(kanonik);
            onChange(
              adresSifirla(deger, {
                il: kanonik,
                ilce: kanonik !== deger.il ? '' : deger.ilce,
                mahalle: kanonik !== deger.il ? '' : deger.mahalle,
                postaKodu: kanonik !== deger.il ? '' : deger.postaKodu,
              })
            );
          }}
          onSecildi={(il) => {
            const duzeltilmis = turkiyeIlAdiniDuzelt(il);
            void turkiyeIlceOnbellekYukle(duzeltilmis);
            if (duzeltilmis !== il) {
              onChange(
                adresSifirla(deger, {
                  il: duzeltilmis,
                  ilce: '',
                  mahalle: '',
                  postaKodu: '',
                })
              );
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
          onChange={(ilce) =>
            onChange(
              adresSifirla(deger, {
                ilce,
                mahalle: ilce !== deger.ilce ? '' : deger.mahalle,
                postaKodu: ilce !== deger.ilce ? '' : deger.postaKodu,
              })
            )
          }
          secenekAra={ilSecildi ? ilceAra : undefined}
          minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
          disabled={!ilSecildi}
          placeholder={ilSecildi ? 'En az 2 harf yazın…' : 'Önce il seçin'}
          aria-label="İlçe"
        />
      </label>
      <label className="ap-tanimlar-secim-alan block">
        <span className="ap-tanim-girdi-etiket">Mahalle</span>
        <FormAramaSecim
          value={deger.mahalle}
          onChange={(mahalle) =>
            onChange(
              adresSifirla(deger, {
                mahalle,
                postaKodu: mahalle !== deger.mahalle ? '' : deger.postaKodu,
              })
            )
          }
          onSecildi={(mahalle) => void mahallePostaKoduDoldur(mahalle, deger.il, deger.ilce)}
          secenekAra={deger.il && deger.ilce ? mahalleAra : undefined}
          minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
          disabled={!deger.ilce}
          placeholder={deger.ilce ? 'En az 2 harf yazın…' : 'Önce ilçe seçin'}
          aria-label="Mahalle"
        />
      </label>
      <TanimGirdi
        etiket="Posta Kodu"
        deger={deger.postaKodu}
        kural="postaKodu"
        onChange={(postaKodu) => onChange({ ...deger, postaKodu })}
      />
      <label className="ap-tanim-girdi block ap-tanimlar-adres-tam">
        <span className="ap-tanim-girdi-etiket">Adres</span>
        <textarea
          className={`${formInputSinifi} ap-tanimlar-adres-metin`}
          value={deger.adres}
          onChange={(e) => onChange({ ...deger, adres: e.target.value.slice(0, 500) })}
          maxLength={500}
          rows={3}
          placeholder="Cadde, sokak, bina no ve diğer adres bilgileri"
          aria-label="Adres"
        />
      </label>
    </div>
  );

  if (bolumsuz) return icerik;
  return <TanimFormBolum baslik="Adres">{icerik}</TanimFormBolum>;
}
