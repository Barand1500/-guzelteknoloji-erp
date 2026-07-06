import { useCallback, useEffect, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { URUN_ISMI_GORUNUM_SECENEKLERI } from '@/admin/baslat-menusu/tanimlar/diger/veri';
import type { TanimlarDigerForm } from '@/admin/baslat-menusu/tanimlar/diger/tipler';
import {
  tanimlarDigerFormEsit,
  tanimlarDigerKaydet,
  tanimlarDigerOku,
} from '@/admin/baslat-menusu/tanimlar/diger/yardimci';

interface TanimlarDigerSekmeProps {
  onKirliDegisti?: (kirli: boolean) => void;
}

export function TanimlarDigerSekme({ onKirliDegisti }: TanimlarDigerSekmeProps) {
  const [form, setForm] = useState<TanimlarDigerForm>(() => tanimlarDigerOku());
  const [sonKayitliForm, setSonKayitliForm] = useState<TanimlarDigerForm>(() => tanimlarDigerOku());
  const [kaydedildi, setKaydedildi] = useState(false);

  const kirli = !tanimlarDigerFormEsit(form, sonKayitliForm);

  useEffect(() => {
    onKirliDegisti?.(kirli);
  }, [kirli, onKirliDegisti]);

  const onKaydet = useCallback(() => {
    tanimlarDigerKaydet(form);
    setSonKayitliForm(form);
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2500);
  }, [form]);

  useModulAksiyonlari(
    { kaydet: onKaydet },
    {
      kaydet: true,
      ekle: false,
      sil: false,
      onizle: false,
      yayinla: false,
    }
  );

  return (
    <div className="ap-tanimlar-diger">
      {kaydedildi ? (
        <div className="ap-tanimlar-kayit-basarili" role="status">
          Ayarlar kaydedildi.
        </div>
      ) : null}

      <div className="ap-tanimlar-diger-satir">
        <label className="ap-tanimlar-diger-etiket" htmlFor="urun-ismi-gorunum">
          Ürün ismi listelerde nasıl görüntülensin ?
        </label>
        <select
          id="urun-ismi-gorunum"
          className={`${formSelectSinifi} ap-tanimlar-diger-secim`}
          value={form.urunIsmiGorunum}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              urunIsmiGorunum: e.target.value as TanimlarDigerForm['urunIsmiGorunum'],
            }))
          }
        >
          {URUN_ISMI_GORUNUM_SECENEKLERI.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ap-tanimlar-diger-satir">
        <label className="ap-tanimlar-diger-etiket" htmlFor="bilgisayar-adi">
          Bu bilgisayarın adı:
        </label>
        <input
          id="bilgisayar-adi"
          type="text"
          className={`${formInputSinifi} ap-tanimlar-diger-girdi`}
          value={form.bilgisayarAdi}
          onChange={(e) => setForm((f) => ({ ...f, bilgisayarAdi: e.target.value }))}
          placeholder="Bilgisayar adını yazın"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
