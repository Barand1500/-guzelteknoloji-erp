import { type DragEvent, useMemo, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { TanimlarPanelGeriTusu } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimlarPanelGeriTusu';
import type { TanimlarKullanici } from '@/admin/baslat-menusu/tanimlar/kullanicilar/tipler';
import {
  TANIMLAR_URUN_GRUPLARI,
  TANIMLAR_URUN_KATALOGU,
  type TanimlarUrun,
  type TanimlarUrunYetkiKaydi,
} from '@/admin/baslat-menusu/tanimlar/kullanicilar/urunYetkiTipler';

interface TanimlarKullaniciUrunYetkiPanelProps {
  kullanici: TanimlarKullanici;
  digerKullanicilar: TanimlarKullanici[];
  kayit: TanimlarUrunYetkiKaydi;
  panoDolu: boolean;
  onKayitDegistir: (kayit: TanimlarUrunYetkiKaydi) => void;
  onPersoneldenKopyala: (kaynakKullaniciId: number) => void;
  onYapistir: () => void;
  onGeri: () => void;
}

type ListeTarafi = 'sol' | 'sag';

function aramaEslesir(urun: TanimlarUrun, arama: string) {
  const q = arama.trim().toLocaleLowerCase('tr');
  if (!q) return true;
  return (
    urun.ad.toLocaleLowerCase('tr').includes(q) || urun.grup.toLocaleLowerCase('tr').includes(q)
  );
}

function secimToggle(onceki: Set<string>, id: string) {
  const yeni = new Set(onceki);
  if (yeni.has(id)) yeni.delete(id);
  else yeni.add(id);
  return yeni;
}

export function TanimlarKullaniciUrunYetkiPanel({
  kullanici,
  digerKullanicilar,
  kayit,
  panoDolu,
  onKayitDegistir,
  onPersoneldenKopyala,
  onYapistir,
  onGeri,
}: TanimlarKullaniciUrunYetkiPanelProps) {
  const [arama, setArama] = useState('');
  const [grupFiltre, setGrupFiltre] = useState<string>('Tümü');
  const [solSecili, setSolSecili] = useState<Set<string>>(new Set());
  const [sagSecili, setSagSecili] = useState<Set<string>>(new Set());
  const [suruklenen, setSuruklenen] = useState<{ taraf: ListeTarafi; idler: string[] } | null>(null);
  const [kopyaKaynakId, setKopyaKaynakId] = useState<number | ''>('');

  const yetkiliSet = useMemo(() => new Set(kayit.yetkiliUrunIdleri), [kayit.yetkiliUrunIdleri]);

  const solListe = useMemo(() => {
    return TANIMLAR_URUN_KATALOGU.filter((u) => {
      if (yetkiliSet.has(u.id)) return false;
      if (grupFiltre !== 'Tümü' && u.grup !== grupFiltre) return false;
      return aramaEslesir(u, arama);
    });
  }, [yetkiliSet, grupFiltre, arama]);

  const sagListe = useMemo(() => {
    return TANIMLAR_URUN_KATALOGU.filter((u) => yetkiliSet.has(u.id));
  }, [yetkiliSet]);

  function yetkiliGuncelle(idler: string[]) {
    onKayitDegistir({ yetkiliUrunIdleri: idler });
  }

  function ekle(idler: string[]) {
    if (idler.length === 0) return;
    const birlesik = new Set(kayit.yetkiliUrunIdleri);
    for (const id of idler) birlesik.add(id);
    yetkiliGuncelle([...birlesik]);
    setSolSecili(new Set());
  }

  function kaldir(idler: string[]) {
    if (idler.length === 0) return;
    const sil = new Set(idler);
    yetkiliGuncelle(kayit.yetkiliUrunIdleri.filter((id) => !sil.has(id)));
    setSagSecili(new Set());
  }

  function tumunuEkle() {
    ekle(solListe.map((u) => u.id));
  }

  function secilenleriEkle() {
    ekle([...solSecili]);
  }

  function tumunuSil() {
    yetkiliGuncelle([]);
    setSagSecili(new Set());
  }

  function secilenleriSil() {
    kaldir([...sagSecili]);
  }

  function surukleBasla(taraf: ListeTarafi, urunId: string, e: DragEvent) {
    const idler = (taraf === 'sol' ? solSecili : sagSecili).has(urunId)
      ? [...(taraf === 'sol' ? solSecili : sagSecili)]
      : [urunId];
    setSuruklenen({ taraf, idler });
    e.dataTransfer.setData('text/plain', idler.join(','));
    e.dataTransfer.effectAllowed = 'move';
  }

  function birakHedef(taraf: ListeTarafi, e: DragEvent) {
    e.preventDefault();
    const ham = e.dataTransfer.getData('text/plain');
    const idler = ham ? ham.split(',').filter(Boolean) : suruklenen?.idler ?? [];
    if (idler.length === 0) return;

    if (taraf === 'sag' && suruklenen?.taraf === 'sol') ekle(idler);
    if (taraf === 'sol' && suruklenen?.taraf === 'sag') kaldir(idler);
    setSuruklenen(null);
  }

  function personeldenKopyala() {
    if (kopyaKaynakId === '') return;
    onPersoneldenKopyala(kopyaKaynakId);
  }

  function solTumunuSec() {
    setSolSecili(new Set(solListe.map((u) => u.id)));
  }

  function sagTumunuSec() {
    setSagSecili(new Set(sagListe.map((u) => u.id)));
  }

  function listeOgesi(
    urun: TanimlarUrun,
    taraf: ListeTarafi,
    secili: Set<string>,
    onSecim: (id: string) => void
  ) {
    const aktif = secili.has(urun.id);
    return (
      <li
        key={urun.id}
        draggable
        onDragStart={(e) => surukleBasla(taraf, urun.id, e)}
        onDragEnd={() => setSuruklenen(null)}
        className={`ap-tanimlar-urun-oge ${aktif ? 'ap-tanimlar-urun-oge-secili' : ''}`}
      >
        <label className="ap-tanimlar-urun-oge-etiket">
          <input
            type="checkbox"
            checked={aktif}
            onChange={() => onSecim(urun.id)}
            onClick={(e) => e.stopPropagation()}
          />
          <span>
            <span className="ap-tanimlar-urun-oge-ad">{urun.ad}</span>
            <span className="ap-tanimlar-urun-oge-grup">{urun.grup}</span>
          </span>
        </label>
      </li>
    );
  }

  return (
    <div className="ap-tanimlar-urun-yetki-panel">
      <div className="ap-tanimlar-panel-geri-sarmal">
        <TanimlarPanelGeriTusu onGeri={onGeri} />
      </div>
      <header className="ap-tanimlar-panel-baslik">
        <h3 className="ap-tanimlar-yetki-baslik">{kullanici.kullaniciAdi} — Ürün Yetkilendir</h3>
        <p className="ap-tanimlar-yetki-alt">
          &quot;{kullanici.kullaniciAdi}&quot; kullanıcısı için yetkilendirilmiş ürünler sağ listede
          görünür. ({sagListe.length} ürün)
        </p>
      </header>

      <div className="ap-tanimlar-urun-filtre-satir">
        <label className="ap-tanimlar-urun-filtre">
          <span>Ürün grubu</span>
          <select
            className={formSelectSinifi}
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
          aria-label="Ürün ara"
        />
      </div>

      <div className="ap-tanimlar-urun-cift-liste">
        <section className="ap-tanimlar-urun-kolon">
          <div className="ap-tanimlar-urun-kolon-baslik">
            <h4>Ürün Grubu</h4>
            <button type="button" className="ap-tanimlar-urun-mini-tus" onClick={solTumunuSec}>
              Tümünü seç
            </button>
          </div>
          <ul
            className="ap-tanimlar-urun-liste"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => birakHedef('sol', e)}
          >
            {solListe.length === 0 ? (
              <li className="ap-tanimlar-urun-bos">Gösterilecek ürün yok.</li>
            ) : (
              solListe.map((u) =>
                listeOgesi(u, 'sol', solSecili, (id) => setSolSecili((s) => secimToggle(s, id)))
              )
            )}
          </ul>
        </section>

        <div className="ap-tanimlar-urun-orta-tuslar">
          <button type="button" className="ap-tanimlar-tablo-btn" onClick={tumunuEkle} disabled={solListe.length === 0}>
            Tümünü Ekle »
          </button>
          <button
            type="button"
            className="ap-tanimlar-tablo-btn"
            onClick={secilenleriEkle}
            disabled={solSecili.size === 0}
          >
            Seçilenleri Ekle »
          </button>
          <button
            type="button"
            className="ap-tanimlar-tablo-btn"
            onClick={secilenleriSil}
            disabled={sagSecili.size === 0}
          >
            « Seçilenleri Sil
          </button>
          <button type="button" className="ap-tanimlar-tablo-btn" onClick={tumunuSil} disabled={sagListe.length === 0}>
            « Tümünü Sil
          </button>
        </div>

        <section className="ap-tanimlar-urun-kolon">
          <div className="ap-tanimlar-urun-kolon-baslik">
            <h4>Yetkili Olduğu Ürünler</h4>
            <button type="button" className="ap-tanimlar-urun-mini-tus" onClick={sagTumunuSec}>
              Tümünü seç
            </button>
          </div>
          <ul
            className="ap-tanimlar-urun-liste"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => birakHedef('sag', e)}
          >
            {sagListe.length === 0 ? (
              <li className="ap-tanimlar-urun-bos">Henüz yetkili ürün yok. Sürükleyin veya ekleyin.</li>
            ) : (
              sagListe.map((u) =>
                listeOgesi(u, 'sag', sagSecili, (id) => setSagSecili((s) => secimToggle(s, id)))
              )
            )}
          </ul>
        </section>
      </div>

      <p className="ap-muted text-xs">İpucu: Ürünleri listeden sürükleyip karşı tarafa bırakabilirsiniz.</p>

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
          onClick={onYapistir}
        >
          Yapıştır
        </button>
      </footer>
    </div>
  );
}
