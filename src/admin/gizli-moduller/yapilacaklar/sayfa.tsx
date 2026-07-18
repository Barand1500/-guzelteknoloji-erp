import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { tarihAnahtari } from '@/admin/kabuk/alt-panel/takvimNotlari';
import { GorevModal } from './GorevModal';
import {
  basHarfler,
  gorevEkle,
  gorevFiltrele,
  gorevGunRolu,
  gorevGuncelle,
  gorevGuneDuserMi,
  gorevSil,
  gorevleriGetir,
  kisaTarihEtiketi,
  type GorevKayitGirdi,
  type YapilacakFiltre,
  type YapilacakGorev,
} from './yapilacaklarDepo';
import './yapilacaklar.css';

const AYLAR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];
const GUNLER = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

type Gorunum = 'liste' | 'takvim';

const FILTRELER: { id: YapilacakFiltre; ad: string; ikon: string }[] = [
  { id: 'tumu', ad: 'Tümü', ikon: '☰' },
  { id: 'aktif', ad: 'Görevlerim', ikon: '◎' },
  { id: 'onemli', ad: 'Önemli', ikon: '★' },
  { id: 'tamamlandi', ad: 'Tamamlandı', ikon: '✓' },
  { id: 'tarihsiz', ad: 'Tarihsiz', ikon: '◌' },
];

function ayHucreleri(yil: number, ay: number) {
  const ilk = new Date(yil, ay, 1);
  const baslangic = ilk.getDay(); // 0=Pazar
  const gunSayisi = new Date(yil, ay + 1, 0).getDate();
  const oncekiAyGun = new Date(yil, ay, 0).getDate();
  const hucreler: { gun: number; ayOffset: -1 | 0 | 1; tarih: string }[] = [];

  for (let i = 0; i < baslangic; i++) {
    const gun = oncekiAyGun - baslangic + 1 + i;
    const d = new Date(yil, ay - 1, gun);
    hucreler.push({
      gun,
      ayOffset: -1,
      tarih: tarihAnahtari(d.getFullYear(), d.getMonth(), d.getDate()),
    });
  }
  for (let g = 1; g <= gunSayisi; g++) {
    hucreler.push({
      gun: g,
      ayOffset: 0,
      tarih: tarihAnahtari(yil, ay, g),
    });
  }
  while (hucreler.length % 7 !== 0 || hucreler.length < 42) {
    const i = hucreler.length - (baslangic + gunSayisi);
    const g = i + 1;
    const d = new Date(yil, ay + 1, g);
    hucreler.push({
      gun: g,
      ayOffset: 1,
      tarih: tarihAnahtari(d.getFullYear(), d.getMonth(), d.getDate()),
    });
    if (hucreler.length >= 42) break;
  }
  return hucreler;
}

export function YapilacaklarSayfasi() {
  const { kullanici } = useAuth();
  const avatar = basHarfler(kullanici?.ad || 'Kullanıcı');
  const [gorevler, setGorevler] = useState<YapilacakGorev[]>([]);
  const [filtre, setFiltre] = useState<YapilacakFiltre>('tumu');
  const [gorunum, setGorunum] = useState<Gorunum>('liste');
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<YapilacakGorev | null>(null);
  const [silinecek, setSilinecek] = useState<YapilacakGorev | null>(null);
  const [ay, setAy] = useState(() => {
    const d = new Date();
    return { yil: d.getFullYear(), ay: d.getMonth() };
  });

  const yenile = useCallback(() => {
    setGorevler(gorevleriGetir());
  }, []);

  useEffect(() => {
    yenile();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'erp-yapilacaklar' || e.key === 'erp-takvim-notlari') yenile();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', yenile);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', yenile);
    };
  }, [yenile]);

  useModulAksiyonlari({
    ekle: () => {
      setDuzenlenen(null);
      setModalAcik(true);
    },
  });

  const filtrelenmis = useMemo(() => gorevFiltrele(gorevler, filtre), [gorevler, filtre]);
  const tarihsizler = useMemo(
    () => filtrelenmis.filter((g) => !g.tarih),
    [filtrelenmis]
  );
  const tarihliListe = useMemo(
    () => filtrelenmis.filter((g) => Boolean(g.tarih)),
    [filtrelenmis]
  );

  const hucreler = useMemo(() => ayHucreleri(ay.yil, ay.ay), [ay]);

  const tariheGore = useMemo(() => {
    const map = new Map<string, YapilacakGorev[]>();
    for (const h of hucreler) {
      const gunGorevleri = gorevler.filter((g) => gorevGuneDuserMi(g, h.tarih));
      if (gunGorevleri.length) map.set(h.tarih, gunGorevleri);
    }
    return map;
  }, [gorevler, hucreler]);

  const kaydet = useCallback(
    (deger: GorevKayitGirdi) => {
      if (duzenlenen) {
        gorevGuncelle(duzenlenen.id, deger);
      } else {
        gorevEkle(deger);
      }
      setModalAcik(false);
      setDuzenlenen(null);
      yenile();
    },
    [duzenlenen, yenile]
  );

  const tamamToggle = (g: YapilacakGorev) => {
    gorevGuncelle(g.id, { tamamlandi: !g.tamamlandi });
    yenile();
  };

  const onemliToggle = (g: YapilacakGorev) => {
    gorevGuncelle(g.id, { onemli: !g.onemli });
    yenile();
  };

  return (
    <div className="yap-sayfa">
      <aside className="yap-yan">
        <button
          type="button"
          className="yap-ekle-tus"
          onClick={() => {
            setDuzenlenen(null);
            setModalAcik(true);
          }}
        >
          Görev Ekle
        </button>

        <nav className="yap-filtre-liste" aria-label="Görev filtreleri">
          {FILTRELER.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`yap-filtre${filtre === f.id ? ' yap-filtre--aktif' : ''}`}
              onClick={() => {
                setFiltre(f.id);
                setGorunum('liste');
              }}
            >
              <span className="yap-filtre-ikon" aria-hidden>
                {f.ikon}
              </span>
              {f.ad}
            </button>
          ))}
        </nav>

        <div className="yap-gorunum-grup" role="group" aria-label="Görünüm">
          <button
            type="button"
            className={`yap-gorunum-tus${gorunum === 'liste' ? ' yap-gorunum-tus--aktif' : ''}`}
            onClick={() => setGorunum('liste')}
          >
            Liste
          </button>
          <button
            type="button"
            className={`yap-gorunum-tus${gorunum === 'takvim' ? ' yap-gorunum-tus--aktif' : ''}`}
            onClick={() => setGorunum('takvim')}
          >
            Takvim
          </button>
        </div>
      </aside>

      <section className="yap-ana">
        {gorunum === 'liste' ? (
          <div className="yap-liste-kabuk">
            <header className="yap-liste-baslik">
              <h1>Yapılacaklar</h1>
              <p>
                {filtrelenmis.length} görev
                {filtre === 'tarihsiz' ? ' · tarihsiz' : ''}
              </p>
            </header>

            {filtrelenmis.length === 0 ? (
              <div className="yap-bos">
                <p>Henüz görev yok.</p>
                <button
                  type="button"
                  className="yap-ekle-tus yap-ekle-tus--ikincil"
                  onClick={() => {
                    setDuzenlenen(null);
                    setModalAcik(true);
                  }}
                >
                  İlk görevi ekle
                </button>
              </div>
            ) : filtre === 'tumu' || filtre === 'aktif' ? (
              <>
                {tarihliListe.length > 0 ? (
                  <ul className="yap-liste">
                    {tarihliListe.map((g) => (
                      <GorevSatir
                        key={g.id}
                        gorev={g}
                        avatar={avatar}
                        onTamam={() => tamamToggle(g)}
                        onOnemli={() => onemliToggle(g)}
                        onDuzenle={() => {
                          setDuzenlenen(g);
                          setModalAcik(true);
                        }}
                        onSil={() => setSilinecek(g)}
                      />
                    ))}
                  </ul>
                ) : null}

                <div className="yap-tarihsiz-bolum">
                  <h2>Tarihsiz görevler</h2>
                  {tarihsizler.length === 0 ? (
                    <p className="yap-tarihsiz-bos">Tarihsiz görev bulunmuyor.</p>
                  ) : (
                    <ul className="yap-liste">
                      {tarihsizler.map((g) => (
                        <GorevSatir
                          key={g.id}
                          gorev={g}
                          avatar={avatar}
                          onTamam={() => tamamToggle(g)}
                          onOnemli={() => onemliToggle(g)}
                          onDuzenle={() => {
                            setDuzenlenen(g);
                            setModalAcik(true);
                          }}
                          onSil={() => setSilinecek(g)}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <ul className="yap-liste">
                {filtrelenmis.map((g) => (
                  <GorevSatir
                    key={g.id}
                    gorev={g}
                    avatar={avatar}
                    onTamam={() => tamamToggle(g)}
                    onOnemli={() => onemliToggle(g)}
                    onDuzenle={() => {
                      setDuzenlenen(g);
                      setModalAcik(true);
                    }}
                    onSil={() => setSilinecek(g)}
                  />
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="yap-takvim-kabuk">
            <header className="yap-takvim-ust">
              <div className="yap-takvim-nav">
                <button
                  type="button"
                  aria-label="Önceki ay"
                  onClick={() =>
                    setAy((o) => {
                      const d = new Date(o.yil, o.ay - 1, 1);
                      return { yil: d.getFullYear(), ay: d.getMonth() };
                    })
                  }
                >
                  ‹
                </button>
                <h1>
                  {AYLAR[ay.ay]} {ay.yil}
                </h1>
                <button
                  type="button"
                  aria-label="Sonraki ay"
                  onClick={() =>
                    setAy((o) => {
                      const d = new Date(o.yil, o.ay + 1, 1);
                      return { yil: d.getFullYear(), ay: d.getMonth() };
                    })
                  }
                >
                  ›
                </button>
              </div>
            </header>

            <div className="yap-takvim-grid">
              {GUNLER.map((g) => (
                <div key={g} className="yap-takvim-gun-baslik">
                  {g}
                </div>
              ))}
              {hucreler.map((h) => {
                const gunGorevleri = tariheGore.get(h.tarih) ?? [];
                return (
                  <div
                    key={h.tarih}
                    className={`yap-takvim-hucre${h.ayOffset !== 0 ? ' yap-takvim-hucre--dis' : ''}`}
                  >
                    <span className="yap-takvim-gun-no">{h.gun}</span>
                    <div className="yap-takvim-chip-liste">
                      {gunGorevleri.slice(0, 3).map((g) => {
                        const rol = gorevGunRolu(g, h.tarih);
                        const metinGoster = rol === 'tek' || rol === 'bas';
                        return (
                          <button
                            key={g.id}
                            type="button"
                            className={`yap-takvim-chip yap-takvim-chip--${rol ?? 'tek'}${g.tamamlandi ? ' yap-takvim-chip--tamam' : ''}${g.onemli ? ' yap-takvim-chip--onemli' : ''}`}
                            title={kisaTarihEtiketi(g) === 'Tarihsiz' ? g.baslik : `${g.baslik} (${kisaTarihEtiketi(g)})`}
                            onClick={() => {
                              setDuzenlenen(g);
                              setModalAcik(true);
                            }}
                          >
                            {metinGoster ? g.baslik : '\u00A0'}
                          </button>
                        );
                      })}
                      {gunGorevleri.length > 3 ? (
                        <span className="yap-takvim-daha">+{gunGorevleri.length - 3}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="yap-tarihsiz-bolum yap-tarihsiz-bolum--takvim">
              <h2>Tarihsiz görevler</h2>
              {gorevFiltrele(gorevler, 'tarihsiz').length === 0 ? (
                <p className="yap-tarihsiz-bos">Tarihsiz görev bulunmuyor.</p>
              ) : (
                <ul className="yap-liste">
                  {gorevFiltrele(gorevler, 'tarihsiz').map((g) => (
                    <GorevSatir
                      key={g.id}
                      gorev={g}
                      avatar={avatar}
                      onTamam={() => tamamToggle(g)}
                      onOnemli={() => onemliToggle(g)}
                      onDuzenle={() => {
                        setDuzenlenen(g);
                        setModalAcik(true);
                      }}
                      onSil={() => setSilinecek(g)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      <GorevModal
        acik={modalAcik}
        baslik={duzenlenen ? 'Görevi düzenle' : 'Yeni görev'}
        gorev={duzenlenen}
        onKaydet={kaydet}
        onKapat={() => {
          setModalAcik(false);
          setDuzenlenen(null);
        }}
      />

      <SilmeOnayModal
        acik={Boolean(silinecek)}
        onKapat={() => setSilinecek(null)}
        onOnayla={() => {
          if (silinecek) {
            gorevSil(silinecek.id);
            setSilinecek(null);
            yenile();
          }
        }}
        baslik="Bu görevi silmek istiyor musunuz?"
        hedefMetin={silinecek?.baslik ?? ''}
        ariaLabel="Görev silme onayı"
      />
    </div>
  );
}

function GorevSatir({
  gorev,
  avatar,
  onTamam,
  onOnemli,
  onDuzenle,
  onSil,
}: {
  gorev: YapilacakGorev;
  avatar: string;
  onTamam: () => void;
  onOnemli: () => void;
  onDuzenle: () => void;
  onSil: () => void;
}) {
  return (
    <li className={`yap-satir${gorev.tamamlandi ? ' yap-satir--tamam' : ''}`}>
      <button
        type="button"
        className={`yap-check${gorev.tamamlandi ? ' yap-check--acik' : ''}`}
        aria-label={gorev.tamamlandi ? 'Tamamlanmadı işaretle' : 'Tamamlandı işaretle'}
        onClick={onTamam}
      >
        {gorev.tamamlandi ? '✓' : ''}
      </button>
      <button type="button" className="yap-satir-metin" onClick={onDuzenle}>
        <span className="yap-satir-baslik">{gorev.baslik}</span>
      </button>
      <button
        type="button"
        className={`yap-yildiz${gorev.onemli ? ' yap-yildiz--acik' : ''}`}
        aria-label={gorev.onemli ? 'Önemliden çıkar' : 'Önemli yap'}
        onClick={onOnemli}
      >
        ★
      </button>
      <span className="yap-satir-tarih">{kisaTarihEtiketi(gorev)}</span>
      <span className="yap-avatar" title="Atanan">
        {avatar}
      </span>
      <button type="button" className="yap-satir-sil" onClick={onSil} aria-label="Sil">
        ✕
      </button>
    </li>
  );
}
