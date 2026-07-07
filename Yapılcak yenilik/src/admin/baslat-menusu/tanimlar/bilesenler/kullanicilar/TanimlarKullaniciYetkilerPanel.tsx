import { useMemo, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { TanimlarPanelGeriTusu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarPanelGeriTusu';
import type { TanimlarKullanici } from '@/admin/baslat-menusu/tanimlar/kullanicilar/tipler';
import {
  TANIMLAR_YETKI_TANIMLARI,
  type TanimlarKullaniciYetkiKaydi,
} from '@/admin/baslat-menusu/tanimlar/kullanicilar/yetkiTanimlari';

interface TanimlarKullaniciYetkilerPanelProps {
  kullanici: TanimlarKullanici;
  digerKullanicilar: TanimlarKullanici[];
  kayit: TanimlarKullaniciYetkiKaydi;
  panoDolu: boolean;
  onKayitDegistir: (kayit: TanimlarKullaniciYetkiKaydi) => void;
  onPersoneldenKopyala: (kaynakKullaniciId: number) => void;
  onYetkiYapistir: () => void;
  onGeri: () => void;
}

function yetkiAramaEslesir(etiket: string, id: string, arama: string) {
  const q = arama.trim().toLocaleLowerCase('tr');
  if (!q) return true;
  return (
    etiket.toLocaleLowerCase('tr').includes(q) || id.toLocaleLowerCase('tr').includes(q)
  );
}

export function TanimlarKullaniciYetkilerPanel({
  kullanici,
  digerKullanicilar,
  kayit,
  panoDolu,
  onKayitDegistir,
  onPersoneldenKopyala,
  onYetkiYapistir,
  onGeri,
}: TanimlarKullaniciYetkilerPanelProps) {
  const [kopyaKaynakId, setKopyaKaynakId] = useState<number | ''>('');
  const [arama, setArama] = useState('');

  const acikYetkiSayisi = useMemo(
    () => Object.values(kayit.yetkiler).filter(Boolean).length,
    [kayit.yetkiler]
  );

  const filtreliYetkiler = useMemo(
    () => TANIMLAR_YETKI_TANIMLARI.filter((y) => yetkiAramaEslesir(y.etiket, y.id, arama)),
    [arama]
  );

  function yetkiDegistir(yetkiId: string, acik: boolean) {
    onKayitDegistir({
      yetkiler: { ...kayit.yetkiler, [yetkiId]: acik },
    });
  }

  function tumunuSec() {
    const hedef = filtreliYetkiler.length > 0 ? filtreliYetkiler : TANIMLAR_YETKI_TANIMLARI;
    const hepsiAcik = hedef.every((y) => kayit.yetkiler[y.id]);
    const yeni = { ...kayit.yetkiler };
    for (const y of hedef) yeni[y.id] = !hepsiAcik;
    onKayitDegistir({ yetkiler: yeni });
  }

  function personeldenKopyala() {
    if (kopyaKaynakId === '') return;
    onPersoneldenKopyala(kopyaKaynakId);
  }

  return (
    <div className="ap-tanimlar-yetki-panel">
      <div className="ap-tanimlar-panel-geri-sarmal">
        <TanimlarPanelGeriTusu onGeri={onGeri} />
      </div>
      <header className="ap-tanimlar-panel-baslik">
        <h3 className="ap-tanimlar-yetki-baslik">{kullanici.kullaniciAdi} — Yetkiler</h3>
        <p className="ap-tanimlar-yetki-alt">
          {acikYetkiSayisi} / {TANIMLAR_YETKI_TANIMLARI.length} yetki aktif
        </p>
      </header>

      <section className="ap-tanimlar-yetki-bolum ap-tanimlar-yetki-bolum-genis">
        <h4 className="ap-tanimlar-yetki-liste-baslik">Yetki Listesi</h4>

        <div className="ap-tanimlar-yetki-arama-satir">
          <input
            type="search"
            className={`${formInputSinifi} ap-tanimlar-yetki-arama`}
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Yetki ara…"
            aria-label="Yetki ara"
          />
          <button type="button" className="ap-tanimlar-tablo-btn ap-tanimlar-yetki-tumunu-sec" onClick={tumunuSec}>
            Tümünü Seç / Kaldır
          </button>
        </div>

        <div className="ap-tanimlar-yetki-izgara-scroll">
          {filtreliYetkiler.length === 0 ? (
            <p className="ap-tanimlar-yetki-bos">Aramanızla eşleşen yetki bulunamadı.</p>
          ) : (
            <div className="ap-tanimlar-yetki-izgara">
              {filtreliYetkiler.map((y) => {
                const acik = kayit.yetkiler[y.id] ?? false;
                return (
                  <button
                    key={y.id}
                    type="button"
                    className={`ap-tanimlar-yetki-kart ${acik ? 'ap-tanimlar-yetki-kart-acik' : 'ap-tanimlar-yetki-kart-kapali'}`}
                    onClick={() => yetkiDegistir(y.id, !acik)}
                  >
                    <span className="ap-tanimlar-yetki-kart-durum" aria-hidden>
                      {acik ? '✓' : '−'}
                    </span>
                    <span className="ap-tanimlar-yetki-kart-etiket">{y.etiket}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="ap-tanimlar-yetki-alt-cubuk">
        <label className="ap-tanimlar-yetki-kopya">
          <span>Kopyalanacak personel</span>
          <select
            className={formSelectSinifi}
            value={kopyaKaynakId}
            onChange={(e) => setKopyaKaynakId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Seçin…</option>
            {digerKullanicilar.map((k) => (
              <option key={k.id} value={k.id}>
                {k.kullaniciAdi}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="ap-tanimlar-tablo-btn"
          disabled={kopyaKaynakId === ''}
          onClick={personeldenKopyala}
        >
          Personelden Kopyala
        </button>
        <button
          type="button"
          className="ap-tanimlar-tablo-btn ap-tanimlar-tablo-btn-birincil"
          disabled={!panoDolu}
          onClick={onYetkiYapistir}
        >
          Yapıştır
        </button>
      </footer>
    </div>
  );
}
