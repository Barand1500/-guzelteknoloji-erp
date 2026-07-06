import { type KeyboardEvent } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import {
  TANIMLAR_FIYAT_LISTELERI,
  type TanimlarKullanici,
  type TanimlarKullaniciAlan,
} from '@/admin/baslat-menusu/tanimlar/kullanicilar/tipler';

interface AktifHucre {
  id: number;
  alan: TanimlarKullaniciAlan;
}

interface TanimlarKullaniciExcelTabloProps {
  kullanicilar: TanimlarKullanici[];
  seciliId: number | null;
  aktifHucre: AktifHucre | null;
  hucreTaslak: string;
  onSatirSec: (id: number) => void;
  onHucreBaslat: (k: TanimlarKullanici, alan: TanimlarKullaniciAlan) => void;
  onHucreTaslak: (deger: string) => void;
  onHucreBitir: () => void;
  onYetkiler: (k: TanimlarKullanici) => void;
  onSubeDepartman: (k: TanimlarKullanici) => void;
  onUrunYetkilendir: (k: TanimlarKullanici) => void;
}

function Hucre({
  alan,
  gosterim,
  duzenlemeAktif,
  inputDeger,
  onBasla,
  onDegistir,
  onBitir,
  inputTipi = 'text',
}: {
  alan: string;
  gosterim: string;
  duzenlemeAktif: boolean;
  inputDeger: string;
  onBasla: () => void;
  onDegistir: (v: string) => void;
  onBitir: () => void;
  inputTipi?: 'text' | 'password' | 'number';
}) {
  function tusBas(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      onBitir();
    }
  }

  if (duzenlemeAktif) {
    return (
      <input
        type={inputTipi}
        className={`${formInputSinifi} ap-master-excel-input w-full`}
        value={inputDeger}
        onChange={(e) => onDegistir(e.target.value)}
        onBlur={onBitir}
        onKeyDown={tusBas}
        onClick={(e) => e.stopPropagation()}
        autoFocus
        aria-label={alan}
      />
    );
  }

  return (
    <span
      className="ap-master-excel-hucre-tiklanabilir block min-h-[1.25rem]"
      onDoubleClick={(e) => {
        e.stopPropagation();
        onBasla();
      }}
      title="Düzenlemek için çift tıklayın"
    >
      {gosterim || <span className="ap-muted">—</span>}
    </span>
  );
}

function FiyatListesiHucre({
  k,
  duzenlemeAktif,
  inputDeger,
  onBasla,
  onDegistir,
  onBitir,
}: {
  k: TanimlarKullanici;
  duzenlemeAktif: boolean;
  inputDeger: string;
  onBasla: () => void;
  onDegistir: (v: string) => void;
  onBitir: () => void;
}) {
  if (duzenlemeAktif) {
    return (
      <select
        className={`${formSelectSinifi} ap-master-excel-input w-full`}
        value={inputDeger}
        onChange={(e) => {
          onDegistir(e.target.value);
          onBitir();
        }}
        onBlur={onBitir}
        onClick={(e) => e.stopPropagation()}
        autoFocus
        aria-label="Fiyat listesi"
      >
        {TANIMLAR_FIYAT_LISTELERI.map((f) => (
          <option key={f || 'bos'} value={f}>
            {f || '(Boş — Happy Hour)'}
          </option>
        ))}
      </select>
    );
  }

  return (
    <span
      className="ap-master-excel-hucre-tiklanabilir block min-h-[1.25rem]"
      onDoubleClick={(e) => {
        e.stopPropagation();
        onBasla();
      }}
      title="Düzenlemek için çift tıklayın"
    >
      {k.fiyatListesi || <span className="ap-muted italic">Boş</span>}
    </span>
  );
}

export function TanimlarKullaniciExcelTablo({
  kullanicilar,
  seciliId,
  aktifHucre,
  hucreTaslak,
  onSatirSec,
  onHucreBaslat,
  onHucreTaslak,
  onHucreBitir,
  onYetkiler,
  onSubeDepartman,
  onUrunYetkilendir,
}: TanimlarKullaniciExcelTabloProps) {
  function hucreAktif(id: number, alan: TanimlarKullaniciAlan) {
    return aktifHucre?.id === id && aktifHucre.alan === alan;
  }

  return (
    <div className="ap-master-excel-wrap ap-tanimlar-kullanici-tablo">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              <th>Kullanıcı Adı</th>
              <th>
                <span className="ap-tanimlar-zorunlu-isaret">*</span> Fiyat Listesi
              </th>
              <th>Şifre</th>
              <th>İskonto Oranı</th>
              <th>İskonto Tutarı</th>
              <th>Kasa Portu</th>
              <th>Yetkiler</th>
              <th>Şube/Departman</th>
              <th>Ürün Yetkilendir</th>
            </tr>
          </thead>
          <tbody>
            {kullanicilar.map((k) => (
              <tr
                key={k.id}
                className={seciliId === k.id ? 'ap-master-excel-satir-secili' : ''}
                onClick={() => onSatirSec(k.id)}
              >
                <td className="ap-master-excel-hucre">
                  <Hucre
                    alan="kullaniciAdi"
                    gosterim={k.kullaniciAdi}
                    duzenlemeAktif={hucreAktif(k.id, 'kullaniciAdi')}
                    inputDeger={hucreTaslak}
                    onBasla={() => onHucreBaslat(k, 'kullaniciAdi')}
                    onDegistir={onHucreTaslak}
                    onBitir={onHucreBitir}
                  />
                </td>
                <td className="ap-master-excel-hucre">
                  <FiyatListesiHucre
                    k={k}
                    duzenlemeAktif={hucreAktif(k.id, 'fiyatListesi')}
                    inputDeger={hucreTaslak}
                    onBasla={() => onHucreBaslat(k, 'fiyatListesi')}
                    onDegistir={onHucreTaslak}
                    onBitir={onHucreBitir}
                  />
                </td>
                <td className="ap-master-excel-hucre">
                  <Hucre
                    alan="sifre"
                    gosterim={k.sifre ? '••••' : ''}
                    duzenlemeAktif={hucreAktif(k.id, 'sifre')}
                    inputDeger={hucreTaslak}
                    onBasla={() => onHucreBaslat(k, 'sifre')}
                    onDegistir={onHucreTaslak}
                    onBitir={onHucreBitir}
                    inputTipi={hucreAktif(k.id, 'sifre') ? 'text' : 'password'}
                  />
                </td>
                <td className="ap-master-excel-hucre">
                  <Hucre
                    alan="iskontoOrani"
                    gosterim={k.iskontoOrani}
                    duzenlemeAktif={hucreAktif(k.id, 'iskontoOrani')}
                    inputDeger={hucreTaslak}
                    onBasla={() => onHucreBaslat(k, 'iskontoOrani')}
                    onDegistir={onHucreTaslak}
                    onBitir={onHucreBitir}
                    inputTipi="number"
                  />
                </td>
                <td className="ap-master-excel-hucre">
                  <Hucre
                    alan="iskontoTutari"
                    gosterim={k.iskontoTutari}
                    duzenlemeAktif={hucreAktif(k.id, 'iskontoTutari')}
                    inputDeger={hucreTaslak}
                    onBasla={() => onHucreBaslat(k, 'iskontoTutari')}
                    onDegistir={onHucreTaslak}
                    onBitir={onHucreBitir}
                    inputTipi="number"
                  />
                </td>
                <td className="ap-master-excel-hucre">
                  <Hucre
                    alan="kasaPortu"
                    gosterim={k.kasaPortu}
                    duzenlemeAktif={hucreAktif(k.id, 'kasaPortu')}
                    inputDeger={hucreTaslak}
                    onBasla={() => onHucreBaslat(k, 'kasaPortu')}
                    onDegistir={onHucreTaslak}
                    onBitir={onHucreBitir}
                  />
                </td>
                <td className="ap-master-excel-hucre" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="ap-tanimlar-tablo-btn" onClick={() => onYetkiler(k)}>
                    Yetkiler
                  </button>
                </td>
                <td className="ap-master-excel-hucre" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="ap-tanimlar-tablo-btn" onClick={() => onSubeDepartman(k)}>
                    Şube/Departman
                  </button>
                </td>
                <td className="ap-master-excel-hucre" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="ap-tanimlar-tablo-btn"
                    onClick={() => onUrunYetkilendir(k)}
                  >
                    Ürün Yetkilendir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ap-tanimlar-kullanici-ipucu">
        <span className="ap-tanimlar-zorunlu-isaret">*</span> İlgili personelin happy hours fiyatlarını
        kullanmasını istiyorsanız fiyat listesi alanını boş bırakınız.
      </p>
    </div>
  );
}
