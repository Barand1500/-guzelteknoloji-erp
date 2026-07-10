import { useCallback, useRef } from 'react';
import type { AdresFormDegeri } from '@/admin/baslat-menusu/tanimlar/tipler';
import { TanimFormBolum } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimFormBolum';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { FormAramaSecim } from '@/formlar/FormAramaSecim';
import {
  MIN_ADRES_ARAMA_UZUNLUGU,
  turkiyeIlAra,
  turkiyeIlceAra,
  turkiyeIlceOnbellekYukle,
  turkiyeMahalleAra,
  turkiyeMahallePostaKoduBul,
  turkiyeSokakAra,
} from '@/veri/turkiyeIlIlce';

interface OrtakAdresFormuProps {
  deger: AdresFormDegeri;
  onChange: (deger: AdresFormDegeri) => void;
}

function adresSifirla(
  deger: AdresFormDegeri,
  alanlar: Partial<AdresFormDegeri>
): AdresFormDegeri {
  return { ...deger, ...alanlar };
}

export function OrtakAdresFormu({ deger, onChange }: OrtakAdresFormuProps) {
  const degerRef = useRef(deger);
  degerRef.current = deger;

  const ilceAra = useCallback((arama: string) => turkiyeIlceAra(deger.il, arama), [deger.il]);
  const mahalleAra = useCallback(
    (arama: string) => turkiyeMahalleAra(deger.il, deger.ilce, arama),
    [deger.il, deger.ilce]
  );
  const sokakAra = useCallback(
    (arama: string) => turkiyeSokakAra(deger.il, deger.ilce, deger.mahalle, arama),
    [deger.il, deger.ilce, deger.mahalle]
  );

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

  return (
    <TanimFormBolum baslik="Adres">
      <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-muted">İl</span>
          <FormAramaSecim
            value={deger.il}
            onChange={(il) => {
              if (il !== deger.il) void turkiyeIlceOnbellekYukle(il);
              onChange(
                adresSifirla(deger, {
                  il,
                  ilce: il !== deger.il ? '' : deger.ilce,
                  mahalle: il !== deger.il ? '' : deger.mahalle,
                  sokak: il !== deger.il ? '' : deger.sokak,
                  postaKodu: il !== deger.il ? '' : deger.postaKodu,
                })
              );
            }}
            onSecildi={(il) => void turkiyeIlceOnbellekYukle(il)}
            secenekAra={turkiyeIlAra}
            minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
            placeholder="En az 2 harf yazın…"
            aria-label="İl"
          />
        </label>
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-muted">İlçe</span>
          <FormAramaSecim
            value={deger.ilce}
            onChange={(ilce) =>
              onChange(
                adresSifirla(deger, {
                  ilce,
                  mahalle: ilce !== deger.ilce ? '' : deger.mahalle,
                  sokak: ilce !== deger.ilce ? '' : deger.sokak,
                  postaKodu: ilce !== deger.ilce ? '' : deger.postaKodu,
                })
              )
            }
            secenekAra={deger.il ? ilceAra : undefined}
            minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
            disabled={!deger.il}
            placeholder={deger.il ? 'En az 2 harf yazın…' : 'Önce il seçin'}
            aria-label="İlçe"
          />
        </label>
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-muted">Mahalle</span>
          <FormAramaSecim
            value={deger.mahalle}
            onChange={(mahalle) =>
              onChange(
                adresSifirla(deger, {
                  mahalle,
                  sokak: mahalle !== deger.mahalle ? '' : deger.sokak,
                  postaKodu: mahalle !== deger.mahalle ? '' : deger.postaKodu,
                })
              )
            }
            onSecildi={(mahalle) =>
              void mahallePostaKoduDoldur(mahalle, deger.il, deger.ilce)
            }
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
        <TanimGirdi
          etiket="Cadde"
          deger={deger.cadde}
          kural="serbestMetin"
          maxLength={100}
          onChange={(cadde) => onChange({ ...deger, cadde })}
        />
        <label className="ap-tanimlar-secim-alan block">
          <span className="ap-muted">Sokak</span>
          <FormAramaSecim
            value={deger.sokak}
            onChange={(sokak) => onChange({ ...deger, sokak })}
            secenekAra={deger.il && deger.ilce ? sokakAra : undefined}
            minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
            disabled={!deger.ilce}
            placeholder={deger.ilce ? 'En az 2 harf yazın…' : 'Önce ilçe seçin'}
            aria-label="Sokak"
          />
        </label>
        <TanimGirdi
          etiket="Bina"
          deger={deger.bina}
          kural="serbestMetin"
          maxLength={50}
          onChange={(bina) => onChange({ ...deger, bina })}
        />
        <TanimGirdi
          etiket="No"
          deger={deger.no}
          kural="binaNo"
          onChange={(no) => onChange({ ...deger, no })}
        />
      </div>
    </TanimFormBolum>
  );
}
