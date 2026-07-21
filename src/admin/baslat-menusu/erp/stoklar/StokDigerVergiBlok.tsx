import { useMemo, useState } from 'react';
import { CariOutlinedAcilir } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedAcilir';
import '@/admin/baslat-menusu/erp/cari/cari.css';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { CariOutlinedSayi } from './stokYeniBirimlerYardimci';

type EkVergiTipi = 'oiv' | 'alisOtv' | 'satisOtv' | 'konaklama';

const DIGER_VERGI_SECENEKLERI: { value: EkVergiTipi; label: string }[] = [
  { value: 'oiv', label: 'ÖİV' },
  { value: 'alisOtv', label: 'Alış ÖTV' },
  { value: 'satisOtv', label: 'Satış ÖTV' },
  { value: 'konaklama', label: 'Konaklama Vergisi' },
];

export function StokDigerVergiBlok() {
  const [liste, setListe] = useState<{ tip: EkVergiTipi; deger: number | null }[]>([]);
  const [secim, setSecim] = useState('');
  const [silinecekIdx, setSilinecekIdx] = useState<number | null>(null);

  const eklenebilir = useMemo(
    () => DIGER_VERGI_SECENEKLERI.filter((o) => !liste.some((e) => e.tip === o.value)),
    [liste]
  );

  const secenekler = useMemo(
    () => [{ value: '', label: 'Seçilmedi' }, ...eklenebilir.map((o) => ({ ...o }))],
    [eklenebilir]
  );

  const vergiEkle = (deger: string) => {
    if (!deger) {
      setSecim('');
      return;
    }
    const tip = DIGER_VERGI_SECENEKLERI.find((o) => o.value === deger)?.value;
    if (!tip || liste.some((e) => e.tip === tip)) return;
    setListe((l) => [...l, { tip, deger: null }]);
    setSecim('');
  };

  const silinecek =
    silinecekIdx !== null && liste[silinecekIdx]
      ? DIGER_VERGI_SECENEKLERI.find((o) => o.value === liste[silinecekIdx]!.tip)?.label ??
        liste[silinecekIdx]!.tip
      : '';

  return (
    <div className="stok-karti-diger-vergi">
      <CariOutlinedAcilir
        etiket="Diğer Vergi Ekle"
        deger={secim}
        disabled={eklenebilir.length === 0}
        secenekler={secenekler}
        sinif="stok-karti-diger-vergi-acilir"
        listeMinGenislik={204}
        onChange={vergiEkle}
      />
      {liste.map((ev, idx) => {
        const etiket = DIGER_VERGI_SECENEKLERI.find((o) => o.value === ev.tip)?.label ?? ev.tip;
        return (
          <div key={`${ev.tip}-${idx}`} className="stok-karti-diger-vergi-ek">
            <CariOutlinedSayi
              etiket={etiket}
              deger={ev.deger}
              placeholder="0"
              yuzde
              onDegistir={(deger) =>
                setListe((l) => l.map((x, i) => (i === idx ? { ...x, deger } : x)))
              }
            />
            <button
              type="button"
              className="stok-karti-diger-vergi-ek-sil"
              title={`${etiket} kaldır`}
              aria-label={`${etiket} kaldır`}
              onClick={() => setSilinecekIdx(idx)}
            >
              ×
            </button>
          </div>
        );
      })}

      <SilmeOnayModal
        acik={silinecekIdx !== null}
        onKapat={() => setSilinecekIdx(null)}
        onOnayla={() => {
          if (silinecekIdx === null) return;
          setListe((l) => l.filter((_, i) => i !== silinecekIdx));
          setSilinecekIdx(null);
        }}
        baslik="Silmek istediğinize emin misiniz?"
        hedefMetin={silinecek || 'Vergi'}
        ariaLabel="Vergi silme onayı"
      />
    </div>
  );
}
