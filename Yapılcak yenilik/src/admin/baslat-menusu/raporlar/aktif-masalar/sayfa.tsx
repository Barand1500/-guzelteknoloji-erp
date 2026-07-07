import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { formSelectSinifi } from '@/formlar/FormAlani';
import { AcikPusulaTablosu } from '@/admin/baslat-menusu/raporlar/aktif-masalar/bilesenler/AcikPusulaTablosu';
import {
  AKTIF_MASALAR_GRUPLAMA_SECENEKLERI,
  acikPusulaToplamlar,
  type AktifMasalarGruplama,
} from '@/admin/baslat-menusu/raporlar/aktif-masalar/tipler';
import { ornekAcikPusulalar } from '@/admin/baslat-menusu/raporlar/aktif-masalar/varsayilanVeri';
import {
  aktifMasalarGorunumKaydet,
  aktifMasalarGorunumOku,
} from '@/admin/baslat-menusu/raporlar/aktif-masalar/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

const OTOMATIK_ARALIK_MS = 15_000;

function zamanEtiketi(tarih: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(tarih);
}

export function AktifMasalarSayfasi() {
  const { basariBildir } = useAdminSayfaBildirimi();
  const [gorunum, setGorunum] = useState(() => aktifMasalarGorunumOku());
  const [satirlar, setSatirlar] = useState(() => ornekAcikPusulalar());
  const [sonGuncelleme, setSonGuncelleme] = useState(() => new Date());
  const [yenileniyor, setYenileniyor] = useState(false);

  const toplamlar = useMemo(() => acikPusulaToplamlar(satirlar), [satirlar]);
  const masaSayisi = useMemo(() => new Set(satirlar.map((s) => s.masaNo)).size, [satirlar]);

  const guncelle = useCallback(() => {
    setYenileniyor(true);
    setSatirlar(ornekAcikPusulalar());
    setSonGuncelleme(new Date());
    window.setTimeout(() => setYenileniyor(false), 350);
    basariBildir('Açık pusulalar güncellendi.');
  }, [basariBildir]);

  const yazdir = useCallback(() => {
    window.print();
  }, []);

  const gruplamaDegistir = useCallback((gruplama: AktifMasalarGruplama) => {
    setGorunum((g) => {
      const yeni = { ...g, gruplama };
      aktifMasalarGorunumKaydet(yeni);
      return yeni;
    });
  }, []);

  const otomatikDegistir = useCallback((otomatikGuncelleme: boolean) => {
    setGorunum((g) => {
      const yeni = { ...g, otomatikGuncelleme };
      aktifMasalarGorunumKaydet(yeni);
      return yeni;
    });
  }, []);

  useEffect(() => {
    if (!gorunum.otomatikGuncelleme) return;
    const zamanlayici = window.setInterval(() => {
      setSatirlar(ornekAcikPusulalar());
      setSonGuncelleme(new Date());
    }, OTOMATIK_ARALIK_MS);
    return () => window.clearInterval(zamanlayici);
  }, [gorunum.otomatikGuncelleme]);

  useModulAksiyonlari(
    { guncelle, kaydet: yazdir },
    { guncelle: true, kaydet: satirlar.length > 0 }
  );

  return (
    <AdminModulKabuk
      baslik="Aktif Masalar"
      aciklama="Açık pusulalar — henüz kapanmamış masa ve sipariş kalemleri"
      onizleGoster={false}
    >
      <div className="ap-aktif-masalar-sayfa">
        <div className="ap-aktif-masalar-ozet-kartlar">
          <div className="ap-aktif-masalar-ozet">
            <span className="ap-aktif-masalar-ozet-etiket">Açık masa</span>
            <strong className="ap-aktif-masalar-ozet-deger">{masaSayisi}</strong>
          </div>
          <div className="ap-aktif-masalar-ozet">
            <span className="ap-aktif-masalar-ozet-etiket">Açık kalem</span>
            <strong className="ap-aktif-masalar-ozet-deger">{satirlar.length}</strong>
          </div>
          <div className="ap-aktif-masalar-ozet">
            <span className="ap-aktif-masalar-ozet-etiket">Toplam tutar</span>
            <strong className="ap-aktif-masalar-ozet-deger">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(toplamlar.tutar)}
            </strong>
          </div>
        </div>

        <AdminPanelKarti
          baslik="Açık Pusulalar"
          altBaslik={`Son güncelleme: ${zamanEtiketi(sonGuncelleme)}${yenileniyor ? ' · yenileniyor…' : ''}`}
        >
          <AcikPusulaTablosu satirlar={satirlar} gruplama={gorunum.gruplama} />

          <footer className="ap-aktif-masalar-alt">
            <label className="ap-aktif-masalar-otomatik">
              <input
                type="checkbox"
                className="ap-tartilacak-checkbox"
                checked={gorunum.otomatikGuncelleme}
                onChange={(e) => otomatikDegistir(e.target.checked)}
              />
              <span>Otomatik güncelleme aktif</span>
              {gorunum.otomatikGuncelleme && (
                <span className="ap-muted text-xs">(15 sn)</span>
              )}
            </label>

            <div className="ap-aktif-masalar-alt-sag">
              <label className="ap-aktif-masalar-gruplama">
                Gruplama
                <select
                  className={formSelectSinifi}
                  value={gorunum.gruplama}
                  onChange={(e) => gruplamaDegistir(e.target.value as AktifMasalarGruplama)}
                  aria-label="Gruplama"
                >
                  {AKTIF_MASALAR_GRUPLAMA_SECENEKLERI.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.etiket}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil"
                onClick={guncelle}
              >
                Güncelle
              </button>
            </div>
          </footer>
        </AdminPanelKarti>
      </div>
    </AdminModulKabuk>
  );
}
