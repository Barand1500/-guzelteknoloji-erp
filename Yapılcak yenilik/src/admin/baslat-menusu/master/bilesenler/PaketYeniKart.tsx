import { formSelectSinifi } from '@/formlar/FormAlani';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import {
  BOS_PAKET_PANEL,
  ondalikKabul,
  tamSayiKabul,
  type PaketPanelForm,
} from '@/admin/baslat-menusu/master/bilesenler/PaketKayitPanel';
import {
  PAKET_PARA_BIRIMLERI,
  paketParaBirimiNormallestir,
  paketParaBirimiSembol,
} from '@/admin/baslat-menusu/master/paketler/paraBirimi';

interface PaketYeniKartProps {
  taslak: PaketPanelForm;
  gorunurAlanlar: string[];
  kaydediliyor?: boolean;
  onTaslakDegistir: (taslak: PaketPanelForm) => void;
}

export { BOS_PAKET_PANEL as BOS_PAKET_TASLAK };

export function PaketYeniKart({ taslak, gorunurAlanlar, kaydediliyor, onTaslakDegistir }: PaketYeniKartProps) {
  const setForm = (guncelle: PaketPanelForm | ((f: PaketPanelForm) => PaketPanelForm)) => {
    if (typeof guncelle === 'function') {
      onTaslakDegistir(guncelle(taslak));
    } else {
      onTaslakDegistir(guncelle);
    }
  };

  const fiyatGoster =
    taslak.fiyat.trim() === '' ? '0' : Number(taslak.fiyat).toLocaleString('tr-TR');

  return (
    <article
      className="ap-master-paket-kart ap-master-paket-kart-yeni ap-master-paket-kart-secili"
      aria-label="Yeni paket"
    >
      <input
        type="text"
        className="ap-master-paket-kart-baslik"
        placeholder="Paket adı"
        value={taslak.paketAdi}
        onChange={(e) => setForm((f) => ({ ...f, paketAdi: e.target.value }))}
        disabled={kaydediliyor}
        autoFocus
        aria-label="Paket adı"
      />

      {gorunurAlanlar.includes('fiyat') && (
        <p className="ap-master-paket-fiyat">
          <span className="ap-master-paket-fiyat-deger font-bold">
            {paketParaBirimiSembol(taslak.paraBirimi)}
            <input
              type="text"
              inputMode="decimal"
              className="ap-master-paket-kart-fiyat"
              placeholder="0"
              value={taslak.fiyat}
              disabled={kaydediliyor}
              onChange={(e) => {
                const v = e.target.value.replace(',', '.');
                if (ondalikKabul(v)) setForm((f) => ({ ...f, fiyat: v }));
              }}
              aria-label="Fiyat"
            />
            <select
              className={`${formSelectSinifi} ap-master-paket-kart-para`}
              value={taslak.paraBirimi}
              disabled={kaydediliyor}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  paraBirimi: paketParaBirimiNormallestir(e.target.value),
                }))
              }
              aria-label="Para birimi"
            >
              {PAKET_PARA_BIRIMLERI.map((pb) => (
                <option key={pb.kod} value={pb.kod}>
                  {pb.sembol}
                </option>
              ))}
            </select>
          </span>
          {taslak.fiyat.trim() !== '' && (
            <span className="ap-muted ap-master-paket-fiyat-onizleme text-xs">≈ {fiyatGoster}</span>
          )}
        </p>
      )}

      <ul className="ap-master-paket-ozellikler">
        {gorunurAlanlar.includes('subeSayisi') && (
          <li>
            <input
              type="text"
              inputMode="numeric"
              className="ap-master-paket-kart-sayi"
              placeholder="1"
              value={taslak.subeSayisi}
              disabled={kaydediliyor}
              onChange={(e) => {
                const v = e.target.value;
                if (tamSayiKabul(v)) setForm((f) => ({ ...f, subeSayisi: v }));
              }}
              aria-label="Şube sayısı"
            />{' '}
            şube
          </li>
        )}
        {gorunurAlanlar.includes('personelSayisi') && (
          <li>
            <input
              type="text"
              inputMode="numeric"
              className="ap-master-paket-kart-sayi"
              placeholder="10"
              value={taslak.personelSayisi}
              disabled={kaydediliyor}
              onChange={(e) => {
                const v = e.target.value;
                if (tamSayiKabul(v)) setForm((f) => ({ ...f, personelSayisi: v }));
              }}
              aria-label="Personel sayısı"
            />{' '}
            personel
          </li>
        )}
        {gorunurAlanlar.includes('masaSayisi') && (
          <li>
            <input
              type="text"
              inputMode="numeric"
              className="ap-master-paket-kart-sayi"
              placeholder="50"
              value={taslak.masaSayisi}
              disabled={kaydediliyor}
              onChange={(e) => {
                const v = e.target.value;
                if (tamSayiKabul(v)) setForm((f) => ({ ...f, masaSayisi: v }));
              }}
              aria-label="Masa sayısı"
            />{' '}
            masa
          </li>
        )}
        {gorunurAlanlar.includes('aktifLisansSayisi') && <li>0 aktif lisans</li>}
      </ul>

      <div className="ap-master-paket-toggle mt-3">
        <div className="ap-master-toggle-mini">
          <DurumAnahtari
            etiket={taslak.aktif ? 'Satışta' : 'Pasif paket'}
            acik={taslak.aktif}
            devreDisi={kaydediliyor}
            onChange={(aktif) => setForm((f) => ({ ...f, aktif }))}
            renk={taslak.aktif ? 'yesil' : 'turuncu'}
            sadeceToggle
          />
        </div>
      </div>
    </article>
  );
}
