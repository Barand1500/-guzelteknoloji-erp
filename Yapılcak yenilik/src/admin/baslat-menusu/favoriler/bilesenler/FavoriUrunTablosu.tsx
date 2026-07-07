import { useMemo, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import {
  bosFavoriTabloFiltre,
  FAVORI_MENULERI,
  type FavoriKayit,
  type FavoriTabloFiltre,
  type FavoriUrunOge,
} from '@/admin/baslat-menusu/favoriler/tipler';

interface FavoriUrunTablosuProps {
  urunler: FavoriUrunOge[];
  kayit: FavoriKayit;
  onKayitDegistir: (kayit: FavoriKayit) => void;
}

function filtreEslesir(deger: string, filtre: string) {
  const q = filtre.trim().toLocaleLowerCase('tr');
  if (!q) return true;
  return deger.toLocaleLowerCase('tr').includes(q);
}

function urunFiltrele(urun: FavoriUrunOge, favori: string, filtre: FavoriTabloFiltre) {
  return (
    filtreEslesir(urun.ad, filtre.ad) &&
    filtreEslesir(urun.urunGrubu, filtre.urunGrubu) &&
    filtreEslesir(urun.faturaGrubu, filtre.faturaGrubu) &&
    filtreEslesir(favori, filtre.favori)
  );
}

export function FavoriUrunTablosu({ urunler, kayit, onKayitDegistir }: FavoriUrunTablosuProps) {
  const [filtre, setFiltre] = useState<FavoriTabloFiltre>(bosFavoriTabloFiltre);
  const [seciliIdler, setSeciliIdler] = useState<Set<string>>(new Set());
  const [favoriMenu, setFavoriMenu] = useState<string>(FAVORI_MENULERI[1]);

  const gorunen = useMemo(() => {
    return urunler
      .map((u) => ({ ...u, favori: kayit.atamalar[u.id] ?? u.favori }))
      .filter((u) => urunFiltrele(u, u.favori, filtre));
  }, [urunler, kayit.atamalar, filtre]);

  const tumuSecili = gorunen.length > 0 && gorunen.every((u) => seciliIdler.has(u.id));

  const filtreGuncelle = (alan: keyof FavoriTabloFiltre, deger: string) => {
    setFiltre((f) => ({ ...f, [alan]: deger }));
  };

  const satirSec = (id: string) => {
    setSeciliIdler((onceki) => {
      const yeni = new Set(onceki);
      if (yeni.has(id)) yeni.delete(id);
      else yeni.add(id);
      return yeni;
    });
  };

  const tumunuSec = () => {
    if (tumuSecili) {
      setSeciliIdler((onceki) => {
        const yeni = new Set(onceki);
        for (const u of gorunen) yeni.delete(u.id);
        return yeni;
      });
      return;
    }
    setSeciliIdler((onceki) => {
      const yeni = new Set(onceki);
      for (const u of gorunen) yeni.add(u.id);
      return yeni;
    });
  };

  const secililereAta = () => {
    if (seciliIdler.size === 0) return;
    const yeni = { ...kayit.atamalar };
    for (const id of seciliIdler) yeni[id] = favoriMenu;
    onKayitDegistir({ atamalar: yeni });
  };

  const favoriGuncelle = (id: string, favori: string) => {
    onKayitDegistir({ atamalar: { ...kayit.atamalar, [id]: favori } });
  };

  return (
    <div className="ap-favoriler-panel">
      <div className="ap-favoriler-ust">
        <div className="ap-favoriler-menu-satir">
          <label className="ap-favoriler-etiket">
            Favoriler Menüsü
            <select
              className={formSelectSinifi}
              value={favoriMenu}
              onChange={(e) => setFavoriMenu(e.target.value)}
              aria-label="Favoriler menüsü"
            >
              {FAVORI_MENULERI.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
            disabled={seciliIdler.size === 0}
            onClick={secililereAta}
          >
            Seçililere ata
          </button>
        </div>
        <button
          type="button"
          className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
          disabled={gorunen.length === 0}
          onClick={tumunuSec}
        >
          {tumuSecili ? 'Seçimi kaldır' : 'Tümünü Seç'}
        </button>
      </div>

      <div className="ap-master-excel-wrap ap-favoriler-tablo">
        <div className="ap-master-excel-scroll">
          <table className="ap-master-excel-tablo">
            <thead>
              <tr>
                <th className="ap-favoriler-th-secim" aria-label="Seçim" />
                <th>Ürün Adı</th>
                <th>Ürün Grubu</th>
                <th>Fatura Grubu</th>
                <th>Favoriler</th>
              </tr>
              <tr className="ap-favoriler-filtre-satir">
                <th />
                <th>
                  <input
                    type="search"
                    className={`${formInputSinifi} ap-master-excel-input`}
                    placeholder="Filtrele…"
                    value={filtre.ad}
                    onChange={(e) => filtreGuncelle('ad', e.target.value)}
                    aria-label="Ürün adına göre filtrele"
                  />
                </th>
                <th>
                  <input
                    type="search"
                    className={`${formInputSinifi} ap-master-excel-input`}
                    placeholder="Filtrele…"
                    value={filtre.urunGrubu}
                    onChange={(e) => filtreGuncelle('urunGrubu', e.target.value)}
                    aria-label="Ürün grubuna göre filtrele"
                  />
                </th>
                <th>
                  <input
                    type="search"
                    className={`${formInputSinifi} ap-master-excel-input`}
                    placeholder="Filtrele…"
                    value={filtre.faturaGrubu}
                    onChange={(e) => filtreGuncelle('faturaGrubu', e.target.value)}
                    aria-label="Fatura grubuna göre filtrele"
                  />
                </th>
                <th>
                  <input
                    type="search"
                    className={`${formInputSinifi} ap-master-excel-input`}
                    placeholder="Filtrele…"
                    value={filtre.favori}
                    onChange={(e) => filtreGuncelle('favori', e.target.value)}
                    aria-label="Favoriye göre filtrele"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {gorunen.map((u) => {
                const secili = seciliIdler.has(u.id);
                return (
                  <tr
                    key={u.id}
                    className={secili ? 'ap-master-excel-satir-secili' : ''}
                    onClick={() => satirSec(u.id)}
                  >
                    <td className="ap-master-excel-hucre ap-favoriler-secim-hucre" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="ap-tartilacak-checkbox"
                        checked={secili}
                        onChange={() => satirSec(u.id)}
                        aria-label={`${u.ad} seç`}
                      />
                    </td>
                    <td className="ap-master-excel-hucre">{u.ad}</td>
                    <td className="ap-master-excel-hucre">{u.urunGrubu}</td>
                    <td className="ap-master-excel-hucre">{u.faturaGrubu}</td>
                    <td className="ap-master-excel-hucre" onClick={(e) => e.stopPropagation()}>
                      <select
                        className="ap-favoriler-hucre-select"
                        value={u.favori}
                        onChange={(e) => favoriGuncelle(u.id, e.target.value)}
                        aria-label={`${u.ad} favori menüsü`}
                      >
                        {FAVORI_MENULERI.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {gorunen.length === 0 && (
          <p className="ap-muted py-8 text-center text-sm">Filtreye uygun ürün bulunamadı.</p>
        )}
      </div>

      {seciliIdler.size > 0 && (
        <p className="ap-favoriler-secim-ozet ap-muted text-xs">
          {seciliIdler.size} ürün seçili — üstten menü seçip &quot;Seçililere ata&quot; ile toplu atayabilirsiniz.
        </p>
      )}
    </div>
  );
}
