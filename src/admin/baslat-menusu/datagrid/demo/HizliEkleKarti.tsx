import type { ReactNode } from 'react';
import type { HizliGirisApi, HizliGirisKolonu } from '@/admin/ortak/datagrid/types';

const GRUP_BASLIK: Record<string, string> = {
  temel: 'Ürün',
  fiyat: 'Fiyatlandırma',
  ekstra: 'Etiketler',
};

function etiketBul(k: HizliGirisKolonu): string {
  const harita: Record<string, string> = {
    stokKodu: 'Stok kodu',
    urun: 'Ürün adı',
    kategori: 'Kategori',
    miktar: 'Miktar',
    fiyat: 'Birim fiyat',
    satirIskonto: 'Satır iskontosu',
    altIskonto: 'Alt iskonto',
    toplamKdv: 'KDV',
    etiketler: 'Etiketler',
  };
  return harita[k.kolonId] ?? k.kolonId;
}

function AlanGoster({ k, api }: { k: HizliGirisKolonu; api: HizliGirisApi }) {
  const deger = api.degerler[k.kolonId] ?? k.varsayilan ?? '';

  return (
    <label className={`dg-he-alan dg-he-alan--${k.kolonId}`}>
      <span className="dg-he-etiket">{etiketBul(k)}</span>
      {k.ipucu ? <span className="dg-he-alan-ipucu">{k.ipucu}</span> : null}
      {k.tip === 'secim' && k.secenekler?.length ? (
        <select
          className="dg-he-girdi dg-he-secim"
          value={deger}
          onChange={(e) => api.alanAyarla(k.kolonId, e.target.value)}
        >
          <option value="">{k.placeholder ?? 'Seçin'}</option>
          {k.secenekler.map((s) => (
            <option key={s.deger} value={s.deger}>
              {s.etiket}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          className="dg-he-girdi"
          placeholder={k.placeholder}
          value={deger}
          onChange={(e) => api.alanAyarla(k.kolonId, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              api.onEkle();
            }
          }}
        />
      )}
    </label>
  );
}

function OzetHucre({ etiket, deger, vurgu }: { etiket: string; deger?: ReactNode; vurgu?: boolean }) {
  if (!deger) return null;
  return (
    <div className={`dg-he-ozet-hucre${vurgu ? ' dg-he-ozet-hucre--vurgu' : ''}`}>
      <span className="dg-he-ozet-etiket">{etiket}</span>
      <span className="dg-he-ozet-deger">{deger}</span>
    </div>
  );
}

export function HizliEkleKarti(api: HizliGirisApi) {
  const temel = api.kolonlar.filter((k) => !k.grup || k.grup === 'temel');
  const fiyat = api.kolonlar.filter((k) => k.grup === 'fiyat');
  const ekstra = api.kolonlar.filter((k) => k.grup === 'ekstra');
  const ekstraVar = fiyat.length > 0 || ekstra.length > 0;

  return (
    <section className="dg-he-kart" aria-label="Hızlı ekle">
      <header className="dg-he-baslik-cubuk">
        <div className="dg-he-baslik-sol">
          <span className="dg-he-ikon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h3 className="dg-he-baslik">Hızlı ekle</h3>
            <p className="dg-he-alt-baslik">Tabloya yeni satır ekleyin · Enter ile kaydedin</p>
          </div>
        </div>
        <button type="button" className="dg-he-ekle-ust" onClick={api.onEkle}>
          Satır ekle
        </button>
      </header>

      <div className="dg-he-govde">
        <div className="dg-he-form">
          <div className="dg-he-bolum">
            <p className="dg-he-bolum-baslik">{GRUP_BASLIK.temel}</p>
            <div className="dg-he-alanlar dg-he-alanlar--temel">
              {temel.map((k) => (
                <AlanGoster key={k.kolonId} k={k} api={api} />
              ))}
            </div>
          </div>

          {(api.genisletildi || !ekstraVar) && fiyat.length > 0 && (
            <div className="dg-he-bolum">
              <p className="dg-he-bolum-baslik">{GRUP_BASLIK.fiyat}</p>
              <div className="dg-he-alanlar dg-he-alanlar--fiyat">
                {fiyat.map((k) => (
                  <AlanGoster key={k.kolonId} k={k} api={api} />
                ))}
              </div>
            </div>
          )}

          {(api.genisletildi || !ekstraVar) && ekstra.length > 0 && (
            <div className="dg-he-bolum">
              <p className="dg-he-bolum-baslik">{GRUP_BASLIK.ekstra}</p>
              <div className="dg-he-alanlar dg-he-alanlar--ekstra">
                {ekstra.map((k) => (
                  <AlanGoster key={k.kolonId} k={k} api={api} />
                ))}
              </div>
            </div>
          )}

          {ekstraVar && (
            <button type="button" className="dg-he-genislet" onClick={api.genisletToggle}>
              {api.genisletildi ? 'Fiyatlandırmayı gizle' : 'Fiyatlandırma ve etiketleri göster'}
            </button>
          )}
        </div>

        <aside className="dg-he-ozet-panel">
          <p className="dg-he-ozet-baslik">Canlı özet</p>
          <OzetHucre etiket="Tutar" deger={api.onizleme.tutar} />
          <OzetHucre etiket="Net" deger={api.onizleme.netTutar} />
          <OzetHucre etiket="Gerçek" deger={api.onizleme.gercekToplam} />
          <OzetHucre etiket="KDV" deger={api.onizleme.toplamKdv} />
          <OzetHucre etiket="Toplam" deger={api.onizleme.toplamTutar} vurgu />
          <button type="button" className="dg-he-ekle-alt" onClick={api.onEkle}>
            Satır ekle
          </button>
        </aside>
      </div>
    </section>
  );
}
