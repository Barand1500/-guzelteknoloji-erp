import { useEffect, useMemo, useState } from 'react';
import { CariOutlinedAcilir } from '@/admin/baslat-menusu/erp/cari/bilesenler/CariOutlinedAcilir';
import '@/admin/baslat-menusu/erp/cari/cari.css';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import {
  VERGI_TURLERI_GUNCELLENDI,
  vergiTurleriAktifGetir,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/vergiTurleri';
import { CariOutlinedSayi } from './stokYeniBirimlerYardimci';

type EkVergiTipi = string;

const SABIT_EK_VERGI: { value: string; label: string }[] = [
  { value: 'oiv', label: 'ÖİV' },
  { value: 'alisOtv', label: 'Alış ÖTV' },
  { value: 'satisOtv', label: 'Satış ÖTV' },
  { value: 'konaklama', label: 'Konaklama Vergisi' },
];

function digerVergiSecenekleri(): { value: string; label: string }[] {
  const ot = vergiTurleriAktifGetir()
    .filter((t) => t.kisaAdi.toLocaleUpperCase('tr') !== 'KDV')
    .map((t) => ({ value: t.id, label: t.kisaAdi || t.adi }));
  const mevcut = new Set(ot.map((o) => o.label.toLocaleUpperCase('tr')));
  const sabit = SABIT_EK_VERGI.filter((s) => !mevcut.has(s.label.toLocaleUpperCase('tr')));
  return [...ot, ...sabit];
}

export function StokDigerVergiBlok() {
  const [liste, setListe] = useState<{ tip: EkVergiTipi; deger: number | null }[]>([]);
  const [secim, setSecim] = useState('');
  const [silinecekIdx, setSilinecekIdx] = useState<number | null>(null);
  const [turSurum, setTurSurum] = useState(0);

  useEffect(() => {
    const yenile = () => setTurSurum((n) => n + 1);
    window.addEventListener(VERGI_TURLERI_GUNCELLENDI, yenile);
    return () => window.removeEventListener(VERGI_TURLERI_GUNCELLENDI, yenile);
  }, []);

  const tumSecenekler = useMemo(() => digerVergiSecenekleri(), [turSurum]);

  const eklenebilir = useMemo(
    () => tumSecenekler.filter((o) => !liste.some((e) => e.tip === o.value)),
    [liste, tumSecenekler]
  );

  const secenekler = useMemo(
    () => [{ value: '', label: 'Seçilmedi' }, ...eklenebilir.map((o) => ({ ...o }))],
    [eklenebilir]
  );

  const etiketBul = (tip: string) =>
    tumSecenekler.find((o) => o.value === tip)?.label ??
    SABIT_EK_VERGI.find((o) => o.value === tip)?.label ??
    tip;

  const vergiEkle = (deger: string) => {
    if (!deger) {
      setSecim('');
      return;
    }
    const tip = tumSecenekler.find((o) => o.value === deger)?.value;
    if (!tip || liste.some((e) => e.tip === tip)) return;
    setListe((l) => [...l, { tip, deger: null }]);
    setSecim('');
  };

  const silinecek =
    silinecekIdx !== null && liste[silinecekIdx] ? etiketBul(liste[silinecekIdx]!.tip) : '';

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
        const etiket = etiketBul(ev.tip);
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
        baslik="Vergiyi kaldırmak istediğinize emin misiniz?"
        hedefMetin={silinecek || 'Vergi'}
        ariaLabel="Diğer vergi kaldırma onayı"
      />
    </div>
  );
}
