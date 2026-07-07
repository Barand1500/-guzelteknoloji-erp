import { useMemo } from 'react';
import { formSelectSinifi } from '@/formlar/FormAlani';
import type { FirmaDonemKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/firma-donem-secimi/tipler';
import {
  DEPO_SECENEKLERI,
  DONEM_SECENEKLERI,
  FIRMA_SECENEKLERI,
  KASA_SECENEKLERI,
  SUBE_SECENEKLERI,
} from '@/admin/baslat-menusu/uygulama-ayarlari/firma-donem-secimi/varsayilanVeri';

interface FirmaDonemSecimFormProps {
  kayit: FirmaDonemKayit;
  onKayitDegistir: (kayit: FirmaDonemKayit) => void;
}

export function FirmaDonemSecimForm({ kayit, onKayitDegistir }: FirmaDonemSecimFormProps) {
  const donemler = useMemo(() => {
    if (!kayit.firma) return [];
    return DONEM_SECENEKLERI[kayit.firma] ?? [];
  }, [kayit.firma]);

  const firmaDegistir = (firma: string) => {
    const yeniDonemler = DONEM_SECENEKLERI[firma] ?? [];
    const donem = yeniDonemler.some((d) => d.id === kayit.donem) ? kayit.donem : '';
    onKayitDegistir({ ...kayit, firma, donem });
  };

  const secim = (
    alan: keyof FirmaDonemKayit,
    etiket: string,
    secenekler: { id: string; ad: string }[],
    onChange?: (deger: string) => void,
    devreDisi?: boolean
  ) => (
    <label className="ap-firma-donem-alan">
      <span className="ap-firma-donem-etiket">{etiket}</span>
      <select
        className={formSelectSinifi}
        value={kayit[alan]}
        disabled={devreDisi}
        onChange={(e) => {
          const deger = e.target.value;
          if (onChange) onChange(deger);
          else onKayitDegistir({ ...kayit, [alan]: deger });
        }}
      >
        <option value="">Seçiniz</option>
        {secenekler.map((s) => (
          <option key={s.id} value={s.id}>
            {s.ad}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="ap-firma-donem-form">
      <header className="ap-firma-donem-baslik">
        <span className="ap-firma-donem-baslik-ikon" aria-hidden>
          🏢
        </span>
        <div>
          <h2 className="ap-firma-donem-baslik-metin">Firma / Dönem / Depo Seçimi</h2>
          <p className="ap-firma-donem-baslik-alt">
            Aktif çalışma firma, dönem, depo, şube ve kasayı belirleyin
          </p>
        </div>
      </header>

      <div className="ap-firma-donem-alanlar">
        <div className="ap-firma-donem-satir">
          {secim('firma', 'Firma', [...FIRMA_SECENEKLERI], firmaDegistir)}
          {secim('donem', 'Dönem', donemler, undefined, !kayit.firma)}
        </div>
        <div className="ap-firma-donem-satir">
          {secim('depo', 'Depo', [...DEPO_SECENEKLERI])}
          {secim('sube', 'Şube', [...SUBE_SECENEKLERI])}
        </div>
        <div className="ap-firma-donem-satir ap-firma-donem-satir-tek">
          {secim('kasa', 'Kasa', [...KASA_SECENEKLERI])}
        </div>
      </div>
    </div>
  );
}
