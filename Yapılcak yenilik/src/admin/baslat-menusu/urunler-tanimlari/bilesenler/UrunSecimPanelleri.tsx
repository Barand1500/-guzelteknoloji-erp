import { useState } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { AdminAnahtarDugme, AdminSekmeler } from '@/admin/ortak/AdminFormBilesenleri';
import { FiyatTanimlariButonu } from '@/admin/baslat-menusu/urunler-tanimlari/bilesenler/FiyatTanimlariModal';
import { bosFiyatListesi } from '@/admin/baslat-menusu/urunler-tanimlari/fiyatListesiTipler';
import type { FiyatListesiKaydi } from '@/admin/baslat-menusu/urunler-tanimlari/fiyatListesiTipler';
import {
  SECENEK_KATEGORILERI,
  type UrunSecenekKategori,
  type UrunSecenekSatiri,
  type UrunSecimSatiri,
  type UrunTanimi,
} from '@/admin/baslat-menusu/urunler-tanimlari/tipler';

function yeniId() {
  return `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function yeniKategoriId() {
  return `kat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function SilTusu({ onClick, etiket }: { onClick: () => void; etiket: string }) {
  return (
    <button type="button" className="ap-urun-satir-sil" onClick={onClick} title={etiket} aria-label={etiket}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

interface UrunSecimPanelProps {
  baslik: string;
  aciklama: string;
  satirlar: UrunSecimSatiri[];
  onDegistir: (satirlar: UrunSecimSatiri[]) => void;
}

export function UrunSecimPanel({ baslik, aciklama, satirlar, onDegistir }: UrunSecimPanelProps) {
  const satirGuncelle = (id: string, parca: Partial<UrunSecimSatiri>) => {
    onDegistir(satirlar.map((s) => (s.id === id ? { ...s, ...parca } : s)));
  };

  const satirEkle = () => {
    const sira = satirlar.reduce((max, s) => Math.max(max, s.sira), 0) + 1;
    onDegistir([
      ...satirlar,
      { id: yeniId(), sira, secim: '', fiyat: 0, fiyatListeleri: bosFiyatListesi() },
    ]);
  };

  const satirSil = (id: string) => {
    onDegistir(satirlar.filter((s) => s.id !== id));
  };

  return (
    <div className="ap-urun-secim-icerik">
      <div className="ap-urun-secim-ust">
        <p className="ap-muted text-xs">{aciklama}</p>
        <button type="button" className="ap-urun-secim-ekle-tus" onClick={satirEkle}>
          + Seçim ekle
        </button>
      </div>

      {satirlar.length === 0 ? (
        <div className="ap-urun-secim-bos">
          <p className="ap-muted text-sm">Henüz {baslik.toLowerCase()} tanımlanmadı.</p>
          <button type="button" className="ap-urun-secim-ekle-tus" onClick={satirEkle}>
            İlk seçimi ekle
          </button>
        </div>
      ) : (
        <div className="ap-urun-secim-tablo-wrap">
          <table className="ap-urun-secim-tablo">
            <thead>
              <tr>
                <th>Sıra</th>
                <th>Seçim</th>
                <th>Fiyat (+/-)</th>
                <th aria-label="İşlem" />
              </tr>
            </thead>
            <tbody>
              {satirlar.map((s) => (
                <tr key={s.id}>
                  <td>
                    <input
                      type="number"
                      className={formInputSinifi}
                      value={s.sira}
                      min={1}
                      onChange={(e) => satirGuncelle(s.id, { sira: Number(e.target.value) || 1 })}
                    />
                  </td>
                  <td>
                    <input
                      className={formInputSinifi}
                      value={s.secim}
                      onChange={(e) => satirGuncelle(s.id, { secim: e.target.value })}
                      placeholder="Seçim adı"
                    />
                  </td>
                  <td>
                    <div className="ap-urun-fiyat-satir">
                      <input
                        type="number"
                        className={formInputSinifi}
                        value={s.fiyat}
                        step={0.01}
                        onChange={(e) => satirGuncelle(s.id, { fiyat: Number(e.target.value) || 0 })}
                      />
                      <FiyatTanimlariButonu
                        liste={s.fiyatListeleri}
                        modalBaslik={`${s.secim || 'Seçim'} — Fiyat Tanımları`}
                        modalAltBaslik="Bu seçim için liste bazlı özel fiyatlar"
                        onKaydet={(fiyatListeleri) => satirGuncelle(s.id, { fiyatListeleri })}
                      />
                    </div>
                  </td>
                  <td className="ap-urun-secim-tablo-islem">
                    <SilTusu onClick={() => satirSil(s.id)} etiket="Seçimi sil" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type SecenekSekme = 'secenekler' | 'kategoriler';

interface UrunSecenekPanelProps {
  urun: UrunTanimi;
  onDegistir: (urun: UrunTanimi) => void;
}

export function UrunSecenekPanel({ urun, onDegistir }: UrunSecenekPanelProps) {
  const [sekme, setSekme] = useState<SecenekSekme>('secenekler');
  const [yeniKategori, setYeniKategori] = useState('');

  const kategoriler = urun.secenekKategorileri;

  const kategoriEkle = (ad: string) => {
    const temiz = ad.trim();
    if (!temiz || kategoriler.some((k) => k.kategori === temiz)) return;
    const sira = kategoriler.reduce((max, k) => Math.max(max, k.sira), 0) + 1;
    const yeni: UrunSecenekKategori = {
      id: yeniKategoriId(),
      sira,
      kategori: temiz,
      enAzSecim: 0,
      enFazlaSecim: 1,
    };
    onDegistir({ ...urun, secenekKategorileri: [...kategoriler, yeni] });
    setYeniKategori('');
  };

  const kategoriGuncelle = (id: string, parca: Partial<UrunSecenekKategori>) => {
    const eski = kategoriler.find((k) => k.id === id);
    if (!eski) return;
    const yeniAd = parca.kategori?.trim() ?? eski.kategori;
    const guncelKategoriler = kategoriler.map((k) => (k.id === id ? { ...k, ...parca, kategori: yeniAd } : k));
    const guncelSecenekler =
      parca.kategori && parca.kategori !== eski.kategori
        ? urun.secenekler.map((s) => (s.kategori === eski.kategori ? { ...s, kategori: yeniAd } : s))
        : urun.secenekler;
    onDegistir({ ...urun, secenekKategorileri: guncelKategoriler, secenekler: guncelSecenekler });
  };

  const kategoriSil = (id: string) => {
    const kat = kategoriler.find((k) => k.id === id);
    if (!kat) return;
    if (!confirm(`"${kat.kategori}" kategorisini ve içindeki tüm seçenekleri silmek istiyor musunuz?`)) return;
    onDegistir({
      ...urun,
      secenekKategorileri: kategoriler.filter((k) => k.id !== id),
      secenekler: urun.secenekler.filter((s) => s.kategori !== kat.kategori),
    });
  };

  const secenekGuncelle = (id: string, parca: Partial<UrunSecenekSatiri>) => {
    onDegistir({
      ...urun,
      secenekler: urun.secenekler.map((s) => (s.id === id ? { ...s, ...parca } : s)),
    });
  };

  const secenekEkle = (kategoriAd: string) => {
    const sira = urun.secenekler.reduce((max, s) => Math.max(max, s.sira), 0) + 1;
    const yeni: UrunSecenekSatiri = {
      id: yeniId(),
      sira,
      secenekAdi: '',
      kategori: kategoriAd,
      fiyat: 0,
      miktarli: false,
      fiyatListeleri: bosFiyatListesi(),
    };
    onDegistir({ ...urun, secenekler: [...urun.secenekler, yeni] });
  };

  const secenekSil = (id: string) => {
    onDegistir({ ...urun, secenekler: urun.secenekler.filter((s) => s.id !== id) });
  };

  return (
    <div className="ap-urun-secim-icerik">
      <div className="ap-urun-secim-ust ap-urun-secenek-ust">
        <AdminSekmeler
          sekmeler={[
            { id: 'secenekler', etiket: 'Seçenekler' },
            { id: 'kategoriler', etiket: 'Kategoriler' },
          ]}
          aktif={sekme}
          onDegistir={setSekme}
        />
      </div>

      {sekme === 'kategoriler' ? (
        <div className="ap-urun-kategori-bolum">
          <div className="ap-urun-kategori-ekle">
            <select
              className={formSelectSinifi}
              value=""
              onChange={(e) => {
                if (e.target.value) kategoriEkle(e.target.value);
              }}
            >
              <option value="">Hazır kategori seç…</option>
              {SECENEK_KATEGORILERI.filter((k) => !kategoriler.some((kat) => kat.kategori === k)).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <input
              className={formInputSinifi}
              value={yeniKategori}
              onChange={(e) => setYeniKategori(e.target.value)}
              placeholder="Yeni kategori adı"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  kategoriEkle(yeniKategori);
                }
              }}
            />
            <button type="button" className="ap-urun-secim-ekle-tus" onClick={() => kategoriEkle(yeniKategori)}>
              + Kategori
            </button>
          </div>

          {kategoriler.length === 0 ? (
            <div className="ap-urun-secim-bos">
              <p className="ap-muted text-sm">Henüz seçenek kategorisi yok.</p>
            </div>
          ) : (
            <div className="ap-urun-secim-tablo-wrap">
              <table className="ap-urun-secim-tablo">
                <thead>
                  <tr>
                    <th>Sıra</th>
                    <th>Kategori</th>
                    <th>En az</th>
                    <th>En fazla</th>
                    <th aria-label="İşlem" />
                  </tr>
                </thead>
                <tbody>
                  {kategoriler.map((kat) => (
                    <tr key={kat.id}>
                      <td>
                        <input
                          type="number"
                          className={formInputSinifi}
                          value={kat.sira}
                          min={1}
                          onChange={(e) => kategoriGuncelle(kat.id, { sira: Number(e.target.value) || 1 })}
                        />
                      </td>
                      <td>
                        <input
                          className={formInputSinifi}
                          value={kat.kategori}
                          onChange={(e) => kategoriGuncelle(kat.id, { kategori: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className={formInputSinifi}
                          value={kat.enAzSecim}
                          min={0}
                          onChange={(e) => kategoriGuncelle(kat.id, { enAzSecim: Number(e.target.value) || 0 })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className={formInputSinifi}
                          value={kat.enFazlaSecim}
                          min={0}
                          onChange={(e) =>
                            kategoriGuncelle(kat.id, { enFazlaSecim: Number(e.target.value) || 0 })
                          }
                        />
                      </td>
                      <td className="ap-urun-secim-tablo-islem">
                        <SilTusu onClick={() => kategoriSil(kat.id)} etiket="Kategoriyi sil" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : kategoriler.length === 0 ? (
        <div className="ap-urun-secim-bos">
          <p className="ap-muted text-sm">Önce kategori ekleyin.</p>
          <button type="button" className="ap-urun-secim-ekle-tus" onClick={() => setSekme('kategoriler')}>
            Kategorilere git
          </button>
        </div>
      ) : (
        <div className="ap-urun-secenek-gruplar">
          {kategoriler.map((kat) => {
            const satirlar = urun.secenekler.filter((s) => s.kategori === kat.kategori);
            return (
              <div key={kat.id} className="ap-urun-secenek-grup">
                <div className="ap-urun-secenek-grup-baslik">
                  <div className="min-w-0">
                    <h4 className="ap-heading text-xs font-semibold">{kat.kategori}</h4>
                    <p className="ap-muted text-[10px]">
                      Min {kat.enAzSecim} · Max {kat.enFazlaSecim} · {satirlar.length} seçenek
                    </p>
                  </div>
                  <button type="button" className="ap-urun-secim-ekle-tus" onClick={() => secenekEkle(kat.kategori)}>
                    + Seçenek
                  </button>
                </div>

                {satirlar.length === 0 ? (
                  <p className="ap-muted px-3 py-4 text-xs">Bu kategoride seçenek yok.</p>
                ) : (
                  <div className="ap-urun-secim-tablo-wrap ap-urun-secim-tablo-wrap--ic">
                    <table className="ap-urun-secim-tablo">
                      <thead>
                        <tr>
                          <th>Sıra</th>
                          <th>Seçenek</th>
                          <th>Fiyat (+/-)</th>
                          <th>Miktarlı</th>
                          <th aria-label="İşlem" />
                        </tr>
                      </thead>
                      <tbody>
                        {satirlar.map((s) => (
                          <tr key={s.id}>
                            <td>
                              <input
                                type="number"
                                className={formInputSinifi}
                                value={s.sira}
                                min={1}
                                onChange={(e) =>
                                  secenekGuncelle(s.id, { sira: Number(e.target.value) || 1 })
                                }
                              />
                            </td>
                            <td>
                              <input
                                className={formInputSinifi}
                                value={s.secenekAdi}
                                onChange={(e) => secenekGuncelle(s.id, { secenekAdi: e.target.value })}
                                placeholder="Seçenek adı"
                              />
                            </td>
                            <td>
                              <div className="ap-urun-fiyat-satir">
                                <input
                                  type="number"
                                  className={formInputSinifi}
                                  value={s.fiyat}
                                  step={0.01}
                                  onChange={(e) =>
                                    secenekGuncelle(s.id, { fiyat: Number(e.target.value) || 0 })
                                  }
                                />
                                <FiyatTanimlariButonu
                                  liste={s.fiyatListeleri}
                                  modalBaslik={`${s.secenekAdi || 'Seçenek'} — Fiyat Tanımları`}
                                  onKaydet={(fiyatListeleri: FiyatListesiKaydi[]) =>
                                    secenekGuncelle(s.id, { fiyatListeleri })
                                  }
                                />
                              </div>
                            </td>
                            <td>
                              <AdminAnahtarDugme
                                etiket={s.miktarli ? 'Evet' : 'Hayır'}
                                acik={s.miktarli}
                                onDegistir={(miktarli: boolean) => secenekGuncelle(s.id, { miktarli })}
                              />
                            </td>
                            <td className="ap-urun-secim-tablo-islem">
                              <SilTusu onClick={() => secenekSil(s.id)} etiket="Seçeneği sil" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
