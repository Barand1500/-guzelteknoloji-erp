import { useEffect, useMemo, useState } from 'react';
import { RESMI_TATILLER_GUNCELLENDI } from '@/admin/baslat-menusu/ozel-tanimlar/veri/resmiTatiller';
import { odemeTarihiOnizle } from '../odemeTakvimi';

export function BankaOdemeIpucu({
  hesapKesimGunu,
  odemeGunu,
}: {
  hesapKesimGunu: string;
  odemeGunu: string;
}) {
  const [acik, setAcik] = useState(false);
  const [tatilSurum, setTatilSurum] = useState(0);

  useEffect(() => {
    const dinle = () => setTatilSurum((s) => s + 1);
    window.addEventListener(RESMI_TATILLER_GUNCELLENDI, dinle);
    return () => window.removeEventListener(RESMI_TATILLER_GUNCELLENDI, dinle);
  }, []);

  const onizleme = useMemo(
    () => odemeTarihiOnizle(hesapKesimGunu, odemeGunu),
    // tatilSurum: Özel Tanımlar'daki tatil listesi değişince yeniden hesapla
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hesapKesimGunu, odemeGunu, tatilSurum]
  );

  if (!onizleme) return null;

  const uyariVar = onizleme.haftaSonu || Boolean(onizleme.tatilAdi);

  return (
    <span className="ba-ipucu-sarmal">
      <button
        type="button"
        className={`ba-ipucu-dugme${uyariVar ? ' ba-ipucu-dugme--uyari' : ''}`}
        aria-label="Sıradaki ödeme tarihi bilgisi"
        aria-expanded={acik}
        onMouseEnter={() => setAcik(true)}
        onMouseLeave={() => setAcik(false)}
        onFocus={() => setAcik(true)}
        onBlur={() => setAcik(false)}
        onClick={(e) => {
          e.preventDefault();
          setAcik((a) => !a);
        }}
      >
        {uyariVar ? '!' : 'i'}
      </button>
      {acik ? (
        <span className="ba-ipucu-balon" role="tooltip">
          <span className="ba-ipucu-satir">
            <span className="ba-ipucu-etiket">Kesim</span>
            <span className="ba-ipucu-deger">{onizleme.kesimEtiket}</span>
          </span>
          <span className="ba-ipucu-satir">
            <span className="ba-ipucu-etiket">Ödeme</span>
            <span className="ba-ipucu-deger">
              {onizleme.odemeEtiket} · {onizleme.odemeGunAdi}
            </span>
          </span>
          {onizleme.tatilAdi ? (
            <span className="ba-ipucu-uyari">Resmi tatil: {onizleme.tatilAdi}</span>
          ) : null}
          {onizleme.haftaSonu && !onizleme.tatilAdi ? (
            <span className="ba-ipucu-uyari">Hafta sonuna denk geliyor</span>
          ) : null}
          {onizleme.sonrakiIsGunuEtiket ? (
            <span className="ba-ipucu-alt">İlk iş günü: {onizleme.sonrakiIsGunuEtiket}</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
