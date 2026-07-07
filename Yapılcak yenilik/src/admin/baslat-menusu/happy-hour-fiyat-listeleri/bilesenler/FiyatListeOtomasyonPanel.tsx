import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { formInputSinifi } from '@/formlar/FormAlani';
import { AKTIF_GUN_SECENEKLERI } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/varsayilanVeri';
import type { FiyatOtomasyonKaydi } from '@/admin/baslat-menusu/happy-hour-fiyat-listeleri/tipler';

interface FiyatListeOtomasyonPanelProps {
  otomasyonlar: FiyatOtomasyonKaydi[];
  sablonAdlari: string[];
  onKayitDegistir: (id: string, alan: keyof FiyatOtomasyonKaydi, deger: string) => void;
}

export function FiyatListeOtomasyonPanel({
  otomasyonlar,
  sablonAdlari,
  onKayitDegistir,
}: FiyatListeOtomasyonPanelProps) {
  const sablonSecenekleri = [
    { value: '', label: '— Seçin —' },
    ...sablonAdlari.map((ad) => ({ value: ad, label: ad })),
  ];

  return (
    <div className="ap-fiyat-otomasyon-icerik">
      <div className="ap-fiyat-otomasyon-bilgi">
        <p>
          Burada belirttiğiniz dönem aralığında geçerli olmak üzere, belirtilen saat ve hafta günlerinde seçilen
          fiyatlar otomatik olarak devreye girer.
        </p>
        <p>1-Fiyatların otomatik olarak devreye girebilmesi için Host programı açık olmalıdır.</p>
        <p>2-İki farklı fiyat şablonu aynı zamanda veya çakışacak şekilde tanım yapılmamalıdır.</p>
      </div>

      <div className="ap-fiyat-kural-tablo-scroll">
        <table className="ap-fiyat-kural-tablo">
          <thead>
            <tr>
              <th>Fiyat Şablonu</th>
              <th>Dönem Başlangıcı</th>
              <th>Dönem Sonu</th>
              <th>Başlangıç Saati</th>
              <th>Bitiş Saati</th>
              <th>Aktif Günler</th>
            </tr>
          </thead>
          <tbody>
            {otomasyonlar.length === 0 ? (
              <tr>
                <td colSpan={6} className="ap-fiyat-tablo-bos">
                  Otomasyon eklemek için aksiyon çubuğundan Yeni Ekle kullanın.
                </td>
              </tr>
            ) : (
              otomasyonlar.map((kayit) => (
                <tr key={kayit.id}>
                  <td>
                    <FormAcilirSecim
                      aria-label="Fiyat şablonu"
                      value={kayit.fiyatSablonu}
                      onChange={(v) => onKayitDegistir(kayit.id, 'fiyatSablonu', v)}
                      secenekler={sablonSecenekleri}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      className={formInputSinifi}
                      value={kayit.donemBaslangic}
                      onChange={(e) => onKayitDegistir(kayit.id, 'donemBaslangic', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      className={formInputSinifi}
                      value={kayit.donemSonu}
                      onChange={(e) => onKayitDegistir(kayit.id, 'donemSonu', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      className={formInputSinifi}
                      value={kayit.baslangicSaati}
                      onChange={(e) => onKayitDegistir(kayit.id, 'baslangicSaati', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      className={formInputSinifi}
                      value={kayit.bitisSaati}
                      onChange={(e) => onKayitDegistir(kayit.id, 'bitisSaati', e.target.value)}
                    />
                  </td>
                  <td>
                    <FormAcilirSecim
                      aria-label="Aktif günler"
                      value={kayit.aktifGunler}
                      onChange={(v) => onKayitDegistir(kayit.id, 'aktifGunler', v)}
                      secenekler={AKTIF_GUN_SECENEKLERI}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
