import { useCallback, useEffect, useState } from 'react';
import { formSelectSinifi } from '@/formlar/FormAlani';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import {
  BUTON_BOYUTU_SECENEKLERI,
  GARSON_GIRIS_SECENEKLERI,
  HESAP_PUSULA_BILGI,
  TANIMLAR_YAZICI_SECENEKLERI,
  UYARI_FIS_FATURA,
  UYARI_KAYDEDILMEDI,
  UYARI_MUTFAK_LISTESI,
} from '@/admin/baslat-menusu/tanimlar/genel/veri';
import type { TanimlarGenelForm } from '@/admin/baslat-menusu/tanimlar/genel/tipler';
import { tanimlarGenelFormEsit, tanimlarGenelKaydet, tanimlarGenelOku } from '@/admin/baslat-menusu/tanimlar/genel/yardimci';
import { TanimlarEAdisyonPanel } from '@/admin/baslat-menusu/tanimlar/bilesenler/genel/TanimlarEAdisyonPanel';
import { TanimlarGeciciUyari } from '@/admin/baslat-menusu/tanimlar/bilesenler/genel/TanimlarGeciciUyari';
import { TanimlarMarkaDizaynPanel } from '@/admin/baslat-menusu/tanimlar/bilesenler/genel/TanimlarMarkaDizaynPanel';
import { TanimlarPrintPanel } from '@/admin/baslat-menusu/tanimlar/bilesenler/genel/TanimlarPrintPanel';

type PusulaPanelId = 'kapali' | 'pusula-print' | 'marka-dizayn' | 'e-adisyon';
type GeciciUyariId = 'fis-fatura' | 'mutfak-listesi' | 'kaydedilmedi' | null;

const PUSULA_BUTONLARI: { id: PusulaPanelId | 'fis-fatura' | 'mutfak-listesi'; etiket: string }[] = [
  { id: 'pusula-print', etiket: 'Pusula Tasarımı' },
  { id: 'fis-fatura', etiket: 'Fiş/Fatura tasarımı' },
  { id: 'mutfak-listesi', etiket: 'Mutfak Listesi tasarımı' },
  { id: 'marka-dizayn', etiket: 'Marka çıktı tasarımı' },
  { id: 'e-adisyon', etiket: 'E Adisyon Tasarımı' },
];

interface TanimlarGenelSekmeProps {
  onKirliDegisti?: (kirli: boolean) => void;
}

export function TanimlarGenelSekme({ onKirliDegisti }: TanimlarGenelSekmeProps) {
  const [form, setForm] = useState<TanimlarGenelForm>(() => tanimlarGenelOku());
  const [sonKayitliForm, setSonKayitliForm] = useState<TanimlarGenelForm>(() => tanimlarGenelOku());
  const [panel, setPanel] = useState<PusulaPanelId>('kapali');
  const [geciciUyari, setGeciciUyari] = useState<GeciciUyariId>(null);
  const [kaydedildi, setKaydedildi] = useState(false);

  const kirli = !tanimlarGenelFormEsit(form, sonKayitliForm);

  useEffect(() => {
    onKirliDegisti?.(kirli);
  }, [kirli, onKirliDegisti]);

  const geciciUyariGoster = useCallback((id: GeciciUyariId) => {
    setGeciciUyari(id);
  }, []);

  const kaydedilmediUyar = useCallback(() => {
    geciciUyariGoster('kaydedilmedi');
  }, [geciciUyariGoster]);

  const panelDegistir = useCallback(
    (hedef: PusulaPanelId) => {
      if (hedef !== 'kapali' && panel !== 'kapali' && hedef !== panel && kirli) {
        kaydedilmediUyar();
        return;
      }
      setPanel(hedef);
    },
    [panel, kirli, kaydedilmediUyar]
  );

  const pusulaButonTikla = (hedef: PusulaPanelId | 'fis-fatura' | 'mutfak-listesi') => {
    if (hedef === 'fis-fatura') {
      geciciUyariGoster('fis-fatura');
      return;
    }
    if (hedef === 'mutfak-listesi') {
      geciciUyariGoster('mutfak-listesi');
      return;
    }

    if (panel === hedef) {
      setPanel('kapali');
      return;
    }

    panelDegistir(hedef);
  };

  const onKaydet = useCallback(() => {
    tanimlarGenelKaydet(form);
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

  const geciciMesaj =
    geciciUyari === 'fis-fatura'
      ? UYARI_FIS_FATURA
      : geciciUyari === 'mutfak-listesi'
        ? UYARI_MUTFAK_LISTESI
        : geciciUyari === 'kaydedilmedi'
          ? UYARI_KAYDEDILMEDI
          : null;

  const panelAktif = (id: PusulaPanelId) => panel === id;

  return (
    <div className="ap-tanimlar-genel">
      <TanimlarGeciciUyari mesaj={geciciMesaj} onTemizle={() => setGeciciUyari(null)} />

      {kaydedildi ? (
        <div className="ap-tanimlar-kayit-basarili" role="status">
          Ayarlar kaydedildi.
        </div>
      ) : null}

      <div className="ap-tanimlar-genel-ust">
        <div className="ap-tanimlar-genel-alan">
          <label className="ap-muted mb-2 block text-xs font-semibold uppercase">Garson girişi yapılsın</label>
          <select
            className={formSelectSinifi}
            value={form.garsonGirisi}
            onChange={(e) => setForm((f) => ({ ...f, garsonGirisi: e.target.value as TanimlarGenelForm['garsonGirisi'] }))}
          >
            {GARSON_GIRIS_SECENEKLERI.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="ap-tanimlar-genel-alan">
          <label className="ap-muted mb-2 block text-xs font-semibold uppercase">Buton boyutu</label>
          <select
            className={formSelectSinifi}
            value={form.butonBoyutu}
            onChange={(e) => setForm((f) => ({ ...f, butonBoyutu: e.target.value as TanimlarGenelForm['butonBoyutu'] }))}
          >
            {BUTON_BOYUTU_SECENEKLERI.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="ap-tanimlar-hesap-pusula" aria-labelledby="hesap-pusula-baslik">
        <h3 id="hesap-pusula-baslik" className="ap-tanimlar-hesap-pusula-baslik">
          Hesap Pusula
        </h3>

        <div className="ap-tanimlar-pusula-butonlar-yatay" role="toolbar" aria-label="Hesap pusula tasarım araçları">
          {PUSULA_BUTONLARI.map((b) => {
            const aktif = b.id === 'pusula-print' || b.id === 'marka-dizayn' || b.id === 'e-adisyon' ? panelAktif(b.id) : false;
            return (
              <button
                key={b.id}
                type="button"
                className={`ap-eklenti-islem-btn ap-tanimlar-pusula-sekme-btn${aktif ? ' ap-tanimlar-pusula-sekme-btn-aktif' : ''}`}
                onClick={() => pusulaButonTikla(b.id)}
                aria-pressed={aktif}
              >
                {b.etiket}
              </button>
            );
          })}
        </div>

        {panel !== 'kapali' ? (
          <div className="ap-tanimlar-hesap-pusula-panel">
            {panel === 'pusula-print' ? (
              <TanimlarPrintPanel form={form} onFormDegistir={setForm} />
            ) : null}
            {panel === 'marka-dizayn' ? (
              <TanimlarMarkaDizaynPanel form={form} onFormDegistir={setForm} />
            ) : null}
            {panel === 'e-adisyon' ? (
              <TanimlarEAdisyonPanel form={form} onFormDegistir={setForm} />
            ) : null}
          </div>
        ) : (
          <div className="ap-tanimlar-hesap-pusula-alt">
            <div className="ap-tanimlar-genel-alan">
              <label className="ap-muted mb-2 block text-xs font-semibold uppercase">Fatura Yazıcısı</label>
              <FormAcilirSecim
                aria-label="Fatura yazıcısı"
                value={form.faturaYazicisi}
                onChange={(faturaYazicisi) => setForm((f) => ({ ...f, faturaYazicisi }))}
                secenekler={TANIMLAR_YAZICI_SECENEKLERI}
              />
            </div>

            <p className="ap-muted ap-tanimlar-hesap-pusula-bilgi text-sm leading-relaxed">{HESAP_PUSULA_BILGI}</p>
          </div>
        )}
      </section>
    </div>
  );
}
