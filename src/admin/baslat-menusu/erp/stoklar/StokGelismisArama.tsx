import { useCallback, useEffect } from 'react';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { TanimGirdi } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimGirdi';
import { URUN_TIPLERI } from '@/admin/baslat-menusu/erp/urun-yonetimi/tipler';
import type { StokGelismisFiltre } from './tipler';

interface StokGelismisAramaProps {
  acik: boolean;
  filtre: StokGelismisFiltre;
  onFiltreDegistir: (f: StokGelismisFiltre) => void;
  onUygula: () => void;
  onKapat: () => void;
  sonucSayisi: number;
}

export function StokGelismisArama({
  acik,
  filtre,
  onFiltreDegistir,
  onUygula,
  onKapat,
  sonucSayisi,
}: StokGelismisAramaProps) {
  const klavyeIsle = useCallback(
    (e: KeyboardEvent) => {
      if (!acik) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onKapat();
      }
    },
    [acik, onKapat]
  );

  useEffect(() => {
    if (!acik) return;
    window.addEventListener('keydown', klavyeIsle);
    return () => window.removeEventListener('keydown', klavyeIsle);
  }, [acik, klavyeIsle]);

  if (!acik) return null;

  return (
    <div className="dg-urun-slayt-sonuc dg-urun-slayt-sonuc--acik" role="dialog" aria-label="Gelişmiş stok arama">
      <div className="dg-urun-arama">
        <header className="dg-urun-arama-baslik">
          <div className="dg-urun-arama-baslik-sol">
            <p className="dg-urun-arama-etiket">Gelişmiş Stok Arama</p>
            <p className="dg-urun-arama-adet">{sonucSayisi} sonuç</p>
          </div>
          <button type="button" className="dg-urun-arama-geri" onClick={onKapat} aria-label="Kapat">
            ESC
          </button>
        </header>

        <div className="ap-tanimlar-bolum-icerik p-4">
          <div className="ap-tanimlar-alan-grid ap-tanimlar-alan-grid--2">
            <label className="ap-tanimlar-secim-alan block">
              <span className="ap-tanim-girdi-etiket">Stok Tipi</span>
              <FormAcilirSecim
                value={filtre.urunTipi}
                onChange={(urunTipi) => onFiltreDegistir({ ...filtre, urunTipi })}
                secenekler={[{ value: '', label: 'Tümü' }, ...URUN_TIPLERI.map((x) => ({ ...x }))]}
              />
            </label>
            <TanimGirdi
              etiket="Stok Kodu"
              deger={filtre.urunKodu}
              maxLength={30}
              onChange={(urunKodu) => onFiltreDegistir({ ...filtre, urunKodu })}
            />
            <TanimGirdi
              etiket="Sınıf Grup"
              deger={filtre.sinifGrup}
              maxLength={50}
              onChange={(sinifGrup) => onFiltreDegistir({ ...filtre, sinifGrup })}
            />
            <TanimGirdi
              etiket="Stok Adı"
              deger={filtre.urunAdi}
              maxLength={255}
              onChange={(urunAdi) => onFiltreDegistir({ ...filtre, urunAdi })}
            />
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button
              type="button"
              className="ap-tanimlar-duzenle-geri"
              onClick={() =>
                onFiltreDegistir({ urunTipi: '', urunKodu: '', sinifGrup: '', urunAdi: '' })
              }
            >
              Temizle
            </button>
            <button type="button" className="ap-tanimlar-yeni-ekle" onClick={onUygula}>
              Uygula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
