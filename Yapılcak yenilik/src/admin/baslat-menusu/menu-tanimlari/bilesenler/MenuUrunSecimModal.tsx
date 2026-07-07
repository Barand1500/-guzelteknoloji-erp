import { useMemo, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import {
  TANIMLAR_URUN_GRUPLARI,
  TANIMLAR_URUN_KATALOGU,
} from '@/admin/baslat-menusu/tanimlar/kullanicilar/urunYetkiTipler';

interface MenuUrunSecimModalProps {
  acik: boolean;
  mevcutUrunIdleri: Set<string>;
  onKapat: () => void;
  onEkle: (urunIdleri: string[]) => void;
}

export function MenuUrunSecimModal({ acik, mevcutUrunIdleri, onKapat, onEkle }: MenuUrunSecimModalProps) {
  const [arama, setArama] = useState('');
  const [grupFiltre, setGrupFiltre] = useState('Tümü');
  const [secili, setSecili] = useState<Set<string>>(new Set());

  const liste = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    return TANIMLAR_URUN_KATALOGU.filter((u) => {
      if (mevcutUrunIdleri.has(u.id)) return false;
      if (grupFiltre !== 'Tümü' && u.grup !== grupFiltre) return false;
      if (!q) return true;
      return u.ad.toLocaleLowerCase('tr').includes(q) || u.grup.toLocaleLowerCase('tr').includes(q);
    });
  }, [arama, grupFiltre, mevcutUrunIdleri]);

  if (!acik) return null;

  const tumunuSec = () => setSecili(new Set(liste.map((u) => u.id)));

  const secimDegistir = (id: string) => {
    setSecili((onceki) => {
      const yeni = new Set(onceki);
      if (yeni.has(id)) yeni.delete(id);
      else yeni.add(id);
      return yeni;
    });
  };

  const ekleVeKapat = () => {
    if (secili.size === 0) return;
    onEkle([...secili]);
    setSecili(new Set());
    setArama('');
    onKapat();
  };

  const kapat = () => {
    setSecili(new Set());
    setArama('');
    onKapat();
  };

  return (
    <div className="ap-admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="menu-urun-sec-baslik">
      <button type="button" className="ap-admin-modal-backdrop" aria-label="Kapat" onClick={kapat} />
      <div className="ap-admin-modal ap-menu-tanim-urun-modal">
        <header className="ap-admin-modal-header">
          <div>
            <h2 id="menu-urun-sec-baslik" className="ap-admin-modal-baslik">
              Ürün Seç
            </h2>
            <p className="ap-admin-modal-alt">Menüye eklenecek ürünleri işaretleyin</p>
          </div>
          <button type="button" className="ap-admin-modal-kapat" onClick={kapat}>
            ✕
          </button>
        </header>

        <div className="ap-admin-modal-icerik ap-menu-tanim-urun-modal-icerik">
          <div className="ap-tanimlar-urun-filtre-satir">
            <label className="ap-tanimlar-urun-filtre">
              <span>Ürün grubu</span>
              <select
                className={formInputSinifi}
                value={grupFiltre}
                onChange={(e) => setGrupFiltre(e.target.value)}
              >
                {TANIMLAR_URUN_GRUPLARI.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <input
              type="search"
              className={`${formInputSinifi} ap-tanimlar-urun-arama`}
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Ürün ara…"
            />
          </div>

          <section className="ap-tanimlar-urun-kolon ap-menu-tanim-urun-sec-kolon">
            <div className="ap-tanimlar-urun-kolon-baslik">
              <h4>Ürünler</h4>
              <button type="button" className="ap-tanimlar-urun-mini-tus" onClick={tumunuSec}>
                Tümünü seç
              </button>
            </div>
            <ul className="ap-tanimlar-urun-liste">
              {liste.length === 0 ? (
                <li className="ap-tanimlar-urun-bos">Eklenecek ürün kalmadı.</li>
              ) : (
                liste.map((u) => (
                  <li key={u.id} className={`ap-tanimlar-urun-oge${secili.has(u.id) ? ' ap-tanimlar-urun-oge-secili' : ''}`}>
                    <label className="ap-tanimlar-urun-oge-etiket">
                      <input
                        type="checkbox"
                        checked={secili.has(u.id)}
                        onChange={() => secimDegistir(u.id)}
                      />
                      <span>
                        <span className="ap-tanimlar-urun-oge-ad">{u.ad}</span>
                        <span className="ap-tanimlar-urun-oge-grup">{u.grup}</span>
                      </span>
                    </label>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <footer className="ap-admin-modal-footer">
          <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil" onClick={kapat}>
            Vazgeç
          </button>
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil"
            disabled={secili.size === 0}
            onClick={ekleVeKapat}
          >
            Seçilenleri menüye ekle ({secili.size})
          </button>
        </footer>
      </div>
    </div>
  );
}
