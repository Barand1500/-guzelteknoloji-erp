import { formInputSinifi } from '@/formlar/FormAlani';
import {
  yeniEslestirmeOpsiyon,
  type PlatformEslestirme,
  type UrunEslestirmeOpsiyon,
  type UrunEslestirOge,
} from '@/admin/baslat-menusu/urun-eslestir/tipler';

interface UrunEslestirPanelProps {
  urun: UrunEslestirOge;
  platform: string;
  eslestirme: PlatformEslestirme;
  onDegistir: (eslestirme: PlatformEslestirme) => void;
  onKapat: () => void;
}

function OpsiyonSatiri({
  opsiyon,
  onDegistir,
  onSil,
}: {
  opsiyon: UrunEslestirmeOpsiyon;
  onDegistir: (o: UrunEslestirmeOpsiyon) => void;
  onSil: () => void;
}) {
  return (
    <tr>
      <td className="ap-master-excel-hucre">
        <input
          type="text"
          className={`${formInputSinifi} ap-urun-eslestir-panel-input w-full`}
          value={opsiyon.opsiyon}
          onChange={(e) => onDegistir({ ...opsiyon, opsiyon: e.target.value })}
          placeholder="Opsiyon adı"
          aria-label="Opsiyon"
        />
      </td>
      <td className="ap-master-excel-hucre">
        <input
          type="text"
          className={`${formInputSinifi} ap-urun-eslestir-panel-input w-full`}
          value={opsiyon.product}
          onChange={(e) => onDegistir({ ...opsiyon, product: e.target.value })}
          placeholder="Platform ürünü"
          aria-label="Product"
        />
      </td>
      <td className="ap-master-excel-hucre ap-urun-eslestir-ana-urun-hucre">
        <input
          type="checkbox"
          className="ap-tartilacak-checkbox"
          checked={opsiyon.anaUrun}
          onChange={(e) => onDegistir({ ...opsiyon, anaUrun: e.target.checked })}
          aria-label="Ana ürün"
        />
      </td>
      <td className="ap-master-excel-hucre">
        <input
          type="text"
          inputMode="decimal"
          className={`${formInputSinifi} ap-urun-eslestir-panel-input w-full`}
          value={opsiyon.menuYuzdesi}
          onChange={(e) => onDegistir({ ...opsiyon, menuYuzdesi: e.target.value })}
          placeholder="%"
          aria-label="Menü yüzdesi"
        />
      </td>
      <td className="ap-master-excel-hucre">
        <input
          type="text"
          inputMode="decimal"
          className={`${formInputSinifi} ap-urun-eslestir-panel-input w-full`}
          value={opsiyon.miktar}
          onChange={(e) => onDegistir({ ...opsiyon, miktar: e.target.value })}
          placeholder="0"
          aria-label="Miktar"
        />
      </td>
      <td className="ap-master-excel-hucre">
        <div className="ap-urun-eslestir-opsiyon-son">
          <input
            type="text"
            inputMode="decimal"
            className={`${formInputSinifi} ap-urun-eslestir-panel-input w-full`}
            value={opsiyon.menuFiyat}
            onChange={(e) => onDegistir({ ...opsiyon, menuFiyat: e.target.value })}
            placeholder="₺"
            aria-label="Menü fiyat"
          />
          <button
            type="button"
            className="ap-urun-eslestir-opsiyon-sil"
            onClick={onSil}
            title="Satırı sil"
            aria-label="Opsiyon satırını sil"
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  );
}

export function UrunEslestirPanel({
  urun,
  platform,
  eslestirme,
  onDegistir,
  onKapat,
}: UrunEslestirPanelProps) {
  const opsiyonGuncelle = (id: string, guncel: UrunEslestirmeOpsiyon) => {
    onDegistir({
      ...eslestirme,
      opsiyonlar: eslestirme.opsiyonlar.map((o) => (o.id === id ? guncel : o)),
    });
  };

  const opsiyonSil = (id: string) => {
    onDegistir({
      ...eslestirme,
      opsiyonlar: eslestirme.opsiyonlar.filter((o) => o.id !== id),
    });
  };

  const opsiyonEkle = () => {
    onDegistir({
      ...eslestirme,
      opsiyonlar: [...eslestirme.opsiyonlar, yeniEslestirmeOpsiyon()],
    });
  };

  return (
    <aside className="ap-urun-eslestir-panel">
      <header className="ap-urun-eslestir-panel-baslik">
        <div>
          <h3 className="ap-heading text-sm font-semibold">Ürün Eşleştirme</h3>
          <p className="ap-muted mt-0.5 text-xs">
            {platform} · {urun.ad}
          </p>
        </div>
        <button
          type="button"
          className="ap-urun-eslestir-panel-kapat"
          onClick={onKapat}
          aria-label="Paneli kapat"
        >
          ×
        </button>
      </header>

      <div className="ap-urun-eslestir-panel-icerik ap-scroll">
        <p className="ap-urun-eslestir-panel-aciklama ap-muted text-xs">
          Restoran ürününüzü <strong className="ap-heading">{platform}</strong> platformundaki karşılığıyla
          eşleştirin. Çarpan, platform fiyatını iç sisteme çevirmek için kullanılır.
        </p>

        <div className="ap-urun-eslestir-panel-alanlar">
          <label className="ap-urun-eslestir-panel-etiket">
            Ürün Adı
            <input
              type="text"
              className={`${formInputSinifi} ap-urun-eslestir-panel-input`}
              value={urun.ad}
              readOnly
              aria-readonly
            />
          </label>

          <label className="ap-urun-eslestir-panel-etiket">
            Eş Değer Ürün
            <input
              type="text"
              className={`${formInputSinifi} ap-urun-eslestir-panel-input`}
              value={eslestirme.esDegerUrun}
              onChange={(e) => onDegistir({ ...eslestirme, esDegerUrun: e.target.value })}
              placeholder={`${platform} ürün adı`}
              aria-label="Eş değer ürün"
            />
          </label>

          <label className="ap-urun-eslestir-panel-etiket ap-urun-eslestir-panel-etiket-kisa">
            Çarpan
            <input
              type="number"
              step="0.01"
              min="0"
              className={`${formInputSinifi} ap-urun-eslestir-panel-input`}
              value={eslestirme.carpan}
              onChange={(e) =>
                onDegistir({
                  ...eslestirme,
                  carpan: Number.parseFloat(e.target.value) || 0,
                })
              }
              aria-label="Çarpan"
            />
          </label>
        </div>

        <div className="ap-urun-eslestir-panel-ozet">
          <label className="ap-urun-eslestir-panel-etiket">
            Seçenek 1 özeti
            <input
              type="text"
              className={`${formInputSinifi} ap-urun-eslestir-panel-input`}
              value={eslestirme.secenek1}
              onChange={(e) => onDegistir({ ...eslestirme, secenek1: e.target.value })}
              placeholder="Listede görünecek kısa metin"
            />
          </label>
          <label className="ap-urun-eslestir-panel-etiket">
            Seçenek 2 özeti
            <input
              type="text"
              className={`${formInputSinifi} ap-urun-eslestir-panel-input`}
              value={eslestirme.secenek2}
              onChange={(e) => onDegistir({ ...eslestirme, secenek2: e.target.value })}
              placeholder="İkinci özet alan"
            />
          </label>
        </div>

        <div className="ap-urun-eslestir-opsiyon-bolum">
          <div className="ap-urun-eslestir-opsiyon-ust">
            <h4 className="ap-heading text-xs font-semibold">Opsiyon eşleştirmeleri</h4>
            <button
              type="button"
              className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil ap-urun-eslestir-opsiyon-ekle"
              onClick={opsiyonEkle}
            >
              + Satır
            </button>
          </div>

          {eslestirme.opsiyonlar.length === 0 ? (
            <p className="ap-muted text-xs">Menü opsiyonları için platform karşılığı ekleyebilirsiniz.</p>
          ) : (
            <div className="ap-master-excel-wrap ap-urun-eslestir-opsiyon-tablo">
              <div className="ap-master-excel-scroll">
                <table className="ap-master-excel-tablo">
                  <thead>
                    <tr>
                      <th>Opsiyon</th>
                      <th>Product</th>
                      <th>Ana Ürün</th>
                      <th>Menü %</th>
                      <th>Miktar</th>
                      <th>Menü Fiyat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eslestirme.opsiyonlar.map((o) => (
                      <OpsiyonSatiri
                        key={o.id}
                        opsiyon={o}
                        onDegistir={(g) => opsiyonGuncelle(o.id, g)}
                        onSil={() => opsiyonSil(o.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
