import { useEffect, useMemo, useRef, useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import type { TartilacakUrunKayit, TartilacakUrunOge } from '@/admin/baslat-menusu/tarilacak-urunler/tipler';

export const GRUP_GORUNUM_GRUPSUZ = '__grupsuz__';
export const GRUP_GORUNUM_TUM_GRUPLU = '__tum_gruplu__';

interface TartilacakUrunListesiProps {
  urunler: TartilacakUrunOge[];
  gruplar: string[];
  kayit: TartilacakUrunKayit;
  onKayitDegistir: (kayit: TartilacakUrunKayit) => void;
}

function aramaEslesir(urun: TartilacakUrunOge, arama: string) {
  const q = arama.trim().toLocaleLowerCase('tr');
  if (!q) return true;
  return (
    urun.ad.toLocaleLowerCase('tr').includes(q) ||
    urun.grup.toLocaleLowerCase('tr').includes(q) ||
    urun.stokKodu.toLocaleLowerCase('tr').includes(q)
  );
}

function GrupBaslikCheckbox({
  durum,
  onDegistir,
  etiket = 'Grubu seç',
}: {
  durum: 'hepsi' | 'hic' | 'kismi';
  onDegistir: (secili: boolean) => void;
  etiket?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = durum === 'kismi';
  }, [durum]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="ap-tartilacak-checkbox"
      checked={durum === 'hepsi'}
      onChange={(e) => onDegistir(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      aria-label={etiket}
    />
  );
}

function UrunSatiri({
  urun,
  secili,
  onToggle,
}: {
  urun: TartilacakUrunOge;
  secili: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="ap-tartilacak-urun-oge">
      <button
        type="button"
        role="checkbox"
        aria-checked={secili}
        className={`ap-tartilacak-urun-satir ${secili ? 'ap-tartilacak-urun-satir-secili' : ''}`}
        onClick={onToggle}
      >
        <span className="ap-tartilacak-checkbox-kutu" aria-hidden>
          {secili ? '✓' : ''}
        </span>
        <span className="ap-tartilacak-urun-ad">{urun.ad}</span>
        {urun.stokKodu ? <span className="ap-tartilacak-urun-kod">{urun.stokKodu}</span> : null}
      </button>
    </li>
  );
}

function listeDurumu(liste: TartilacakUrunOge[], seciliSet: Set<string>) {
  const secili = liste.filter((u) => seciliSet.has(u.id)).length;
  if (secili === 0) return 'hic' as const;
  if (secili === liste.length) return 'hepsi' as const;
  return 'kismi' as const;
}

export function TartilacakUrunListesi({
  urunler,
  gruplar,
  kayit,
  onKayitDegistir,
}: TartilacakUrunListesiProps) {
  const [arama, setArama] = useState('');
  const [grupGorunum, setGrupGorunum] = useState(GRUP_GORUNUM_GRUPSUZ);

  const seciliSet = useMemo(() => new Set(kayit.tartilanUrunIdleri), [kayit.tartilanUrunIdleri]);
  const grupsuzMod = grupGorunum === GRUP_GORUNUM_GRUPSUZ;
  const tumGrupluMod = grupGorunum === GRUP_GORUNUM_TUM_GRUPLU;

  const filtreli = useMemo(() => {
    return urunler.filter((u) => {
      if (!grupsuzMod && !tumGrupluMod && u.grup !== grupGorunum) return false;
      return aramaEslesir(u, arama);
    });
  }, [urunler, grupGorunum, grupsuzMod, tumGrupluMod, arama]);

  const gruplu = useMemo(() => {
    const harita = new Map<string, TartilacakUrunOge[]>();
    for (const u of filtreli) {
      const liste = harita.get(u.grup) ?? [];
      liste.push(u);
      harita.set(u.grup, liste);
    }
    return [...harita.entries()].sort(([a], [b]) => a.localeCompare(b, 'tr'));
  }, [filtreli]);

  const filtreSeciliSayisi = filtreli.filter((u) => seciliSet.has(u.id)).length;
  const duzListeDurum = listeDurumu(filtreli, seciliSet);

  const idleriGuncelle = (idler: string[], ekle: boolean) => {
    const yeni = new Set(kayit.tartilanUrunIdleri);
    for (const id of idler) {
      if (ekle) yeni.add(id);
      else yeni.delete(id);
    }
    onKayitDegistir({ tartilanUrunIdleri: [...yeni] });
  };

  const toggleUrun = (id: string) => {
    idleriGuncelle([id], !seciliSet.has(id));
  };

  return (
    <div className="ap-tartilacak-liste">
      <div className="ap-tartilacak-ust">
        <div className="ap-tartilacak-filtreler">
          <input
            type="search"
            className={`${formInputSinifi} ap-tartilacak-arama`}
            placeholder="Ürün veya kod ara…"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            aria-label="Ürün ara"
          />
          <select
            className={formSelectSinifi}
            value={grupGorunum}
            onChange={(e) => setGrupGorunum(e.target.value)}
            aria-label="Liste görünümü"
          >
            <option value={GRUP_GORUNUM_GRUPSUZ}>Grupsuz</option>
            <option value={GRUP_GORUNUM_TUM_GRUPLU}>Tüm gruplar (gruplu)</option>
            {gruplar.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="ap-tartilacak-ozet">
          <span className="ap-tartilacak-sayac">
            <strong>{seciliSet.size}</strong> / {urunler.length} ürün tartılı
          </span>
          {filtreli.length < urunler.length && (
            <span className="ap-muted text-xs">
              · Görünen: {filtreSeciliSayisi}/{filtreli.length}
            </span>
          )}
        </div>

        <div className="ap-tartilacak-toplu">
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
            disabled={filtreli.length === 0}
            onClick={() => idleriGuncelle(filtreli.map((u) => u.id), true)}
          >
            Görünenleri seç
          </button>
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
            disabled={filtreSeciliSayisi === 0}
            onClick={() => idleriGuncelle(filtreli.map((u) => u.id), false)}
          >
            Görünenleri kaldır
          </button>
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
            onClick={() => onKayitDegistir({ tartilanUrunIdleri: urunler.map((u) => u.id) })}
          >
            Tümünü seç
          </button>
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
            onClick={() => onKayitDegistir({ tartilanUrunIdleri: [] })}
          >
            Tümünü temizle
          </button>
        </div>
      </div>

      {filtreli.length === 0 ? (
        <p className="ap-tartilacak-bos">Aramanızla eşleşen ürün bulunamadı.</p>
      ) : grupsuzMod || !tumGrupluMod ? (
        <div className="ap-tartilacak-duz-kart">
          <header className="ap-tartilacak-duz-baslik">
            <GrupBaslikCheckbox
              durum={duzListeDurum}
              etiket="Görünen tümünü seç"
              onDegistir={(sec) => idleriGuncelle(filtreli.map((u) => u.id), sec)}
            />
            <div className="ap-tartilacak-grup-metin">
              <h3 className="ap-heading text-sm font-semibold">
                {grupsuzMod ? 'Tüm ürünler' : grupGorunum}
              </h3>
              <span className="ap-muted text-xs">
                {filtreSeciliSayisi} / {filtreli.length} tartılı
              </span>
            </div>
          </header>
          <ul className="ap-tartilacak-urunler ap-tartilacak-urunler-duz" role="list">
            {filtreli.map((u) => (
              <UrunSatiri
                key={u.id}
                urun={u}
                secili={seciliSet.has(u.id)}
                onToggle={() => toggleUrun(u.id)}
              />
            ))}
          </ul>
        </div>
      ) : (
        <div className="ap-tartilacak-gruplu-kart">
          <ul className="ap-tartilacak-urunler ap-tartilacak-urunler-gruplu" role="list">
            {gruplu.map(([grup, liste]) => {
              const durum = listeDurumu(liste, seciliSet);
              const grupSecili = liste.filter((u) => seciliSet.has(u.id)).length;
              return (
                <li key={grup} className="ap-tartilacak-grup-blok">
                  <div className="ap-tartilacak-grup-baslik ap-tartilacak-grup-baslik-satir">
                    <GrupBaslikCheckbox
                      durum={durum}
                      onDegistir={(sec) => idleriGuncelle(liste.map((u) => u.id), sec)}
                    />
                    <div className="ap-tartilacak-grup-metin">
                      <h3 className="ap-heading text-sm font-semibold">{grup}</h3>
                      <span className="ap-muted text-xs">
                        {grupSecili} / {liste.length} tartılı
                      </span>
                    </div>
                  </div>
                  <ul className="ap-tartilacak-grup-urunler" role="list">
                    {liste.map((u) => (
                      <UrunSatiri
                        key={u.id}
                        urun={u}
                        secili={seciliSet.has(u.id)}
                        onToggle={() => toggleUrun(u.id)}
                      />
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
