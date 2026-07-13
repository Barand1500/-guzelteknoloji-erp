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
import './cariAdres.css';

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
    <div className="ap-cari-adres-kart">
      <div className="ap-cari-adres-konum-satir">
        <label className="ap-cari-adres-alan">
          <span className="ap-cari-adres-alan-etiket">İl</span>
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
            onSecildi={(il) => {
              const duzeltilmis = turkiyeIlAdiniDuzelt(il);
              void turkiyeIlceOnbellekYukle(duzeltilmis);
              if (duzeltilmis !== il) {
                adresGuncelle({ il: duzeltilmis, ilce: '' });
              }
            }}
            secenekAra={turkiyeIlAra}
            minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
            placeholder="En az 2 harf yazın…"
            aria-label="İl"
          />
        </label>

        <span className="ap-cari-adres-ok" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </span>

        <label className="ap-cari-adres-alan">
          <span className="ap-cari-adres-alan-etiket">İlçe</span>
          <FormAramaSecim
            value={deger.ilce}
            onChange={(ilce) => adresGuncelle({ ilce })}
            secenekAra={ilSecildi ? ilceAra : undefined}
            minAramaUzunlugu={MIN_ADRES_ARAMA_UZUNLUGU}
            placeholder={ilSecildi ? 'En az 2 harf yazın…' : 'Önce il seçin'}
            disabled={!ilSecildi}
            aria-label="İlçe"
          />
        </label>
      </div>

      <label className="ap-cari-adres-metin-alan">
        <span className="ap-cari-adres-alan-etiket">Açık Adres</span>
        <textarea
          className={`${formInputSinifi} ap-cari-adres-metin`}
          value={deger.adres}
          onChange={(e) => adresGuncelle({ adres: e.target.value.slice(0, 500) })}
          maxLength={500}
          rows={2}
          placeholder="Cadde, sokak, bina no…"
          aria-label="Açık adres"
        />
        <div className="ap-cari-adres-alt-satir">
          <span className="ap-cari-adres-sayac">{deger.adres.length}/500</span>
        </div>
      </label>
    </div>
  );

  if (bolumsuz) return icerik;
  return (
    <TanimFormBolum baslik="Adres" className="ap-cari-adres-bolum">
      {icerik}
    </TanimFormBolum>
  );
}
