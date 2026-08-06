import { useEffect, useMemo, useState } from 'react';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  CARI_OZET_ALAN_BOS,
  CARI_OZET_ALAN_ETIKET,
  CARI_OZET_ALAN_MAX,
  CARI_OZET_ALAN_VARSAYILAN,
  CARI_OZET_GORUNUM_VARSAYILAN,
  CARI_OZET_KUTU_BOYUTLARI,
  CARI_OZET_SATIR_SUTUN_MAX,
  cariOzetAlanCikar,
  cariOzetAlanDuzeniDuzelt,
  cariOzetAlanHavuz,
  cariOzetAlanSatiraEkle,
  cariOzetAlanToplam,
  cariOzetBosSatirEkle,
  cariOzetGorunumDuzelt,
  cariOzetSatirSil,
  cariOzetSatirTasi,
  type CariOzetAlanDuzeni,
  type CariOzetAlanId,
  type CariOzetGorunum,
  type CariOzetKutuBoyutu,
  type CariOzetYaziAgirlik,
  type CariOzetYaziBoyut,
} from './cariOzetAlanDuzeni';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';
import './cariHareket.css';

interface CariOzetAlanYonetModalProps {
  acik: boolean;
  cariId: string;
  baslangic: CariOzetAlanDuzeni;
  onKapat: () => void;
  onKaydetCari: (duzen: CariOzetAlanDuzeni) => void;
  onKaydetTumu: (duzen: CariOzetAlanDuzeni) => void;
}

type SatirHedefleri = number[];

const AGIRLIK_SECENEK: { id: CariOzetYaziAgirlik; etiket: string }[] = [
  { id: 'ince', etiket: 'İnce' },
  { id: 'normal', etiket: 'Normal' },
  { id: 'kalin', etiket: 'Kalın' },
];

const BOYUT_SECENEK: { id: CariOzetYaziBoyut; etiket: string }[] = [
  { id: 'kucuk', etiket: 'Küçük' },
  { id: 'orta', etiket: 'Orta' },
  { id: 'buyuk', etiket: 'Büyük' },
];

function duzenKopyala(d: CariOzetAlanDuzeni): CariOzetAlanDuzeni {
  return {
    kutuBoyutu: d.kutuBoyutu ?? 'normal',
    gorunum: cariOzetGorunumDuzelt(d.gorunum),
    satirlar: d.satirlar.map((s) => [...s]),
  };
}

function hedefKopyala(duzen: CariOzetAlanDuzeni): SatirHedefleri {
  return duzen.satirlar.map((s) =>
    Math.max(1, Math.min(CARI_OZET_SATIR_SUTUN_MAX, s.length || 1))
  );
}

function gorunumSiniflari(g: CariOzetGorunum): string {
  return [
    `cari-hareket-ozet--etiket-${g.etiketAgirlik}`,
    `cari-hareket-ozet--etiket-boyut-${g.etiketBoyut}`,
    g.etiketBuyukHarf ? 'cari-hareket-ozet--etiket-buyuk-harf' : 'cari-hareket-ozet--etiket-normal-harf',
    `cari-hareket-ozet--deger-${g.degerAgirlik}`,
    `cari-hareket-ozet--deger-boyut-${g.degerBoyut}`,
  ].join(' ');
}

function SecenekGrup<T extends string>({
  etiket,
  deger,
  secenekler,
  onDegistir,
}: {
  etiket: string;
  deger: T;
  secenekler: { id: T; etiket: string }[];
  onDegistir: (v: T) => void;
}) {
  return (
    <div className="cari-ozet-ayar-grup">
      <span className="cari-ozet-ayar-grup-etiket">{etiket}</span>
      <div className="cari-ozet-ayar-secenekler" role="radiogroup" aria-label={etiket}>
        {secenekler.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={deger === s.id}
            className={`cari-ozet-ayar-chip${deger === s.id ? ' cari-ozet-ayar-chip--aktif' : ''}`}
            onClick={() => onDegistir(s.id)}
          >
            {s.etiket}
          </button>
        ))}
      </div>
    </div>
  );
}

function AnahtarSatir({
  etiket,
  acik,
  onDegistir,
}: {
  etiket: string;
  acik: boolean;
  onDegistir: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`cari-ozet-ayar-anahtar${acik ? ' cari-ozet-ayar-anahtar--acik' : ''}`}
      aria-pressed={acik}
      onClick={() => onDegistir(!acik)}
    >
      <span>{etiket}</span>
      <span className="cari-ozet-ayar-anahtar-pill" aria-hidden>
        <i />
      </span>
    </button>
  );
}

export function CariOzetAlanYonetModal({
  acik,
  cariId,
  baslangic,
  onKapat,
  onKaydetCari,
  onKaydetTumu,
}: CariOzetAlanYonetModalProps) {
  void cariId;
  const [duzen, setDuzen] = useState<CariOzetAlanDuzeni>(() => duzenKopyala(baslangic));
  const [hedefler, setHedefler] = useState<SatirHedefleri>(() => hedefKopyala(baslangic));
  const [aktifSatir, setAktifSatir] = useState<number | null>(null);
  const [ayarAcik, setAyarAcik] = useState(false);

  const havuz = useMemo(() => cariOzetAlanHavuz(duzen), [duzen]);
  const toplam = cariOzetAlanToplam(duzen);
  const kalan = CARI_OZET_ALAN_MAX - toplam;
  const kutuBoyutu = duzen.kutuBoyutu ?? 'normal';
  const gorunum = cariOzetGorunumDuzelt(duzen.gorunum);

  useEffect(() => {
    if (!acik) return;
    const kopya = duzenKopyala(cariOzetAlanDuzeniDuzelt(baslangic));
    setDuzen(kopya);
    setHedefler(hedefKopyala(kopya));
    setAktifSatir(kopya.satirlar.length > 0 ? 0 : null);
    setAyarAcik(false);
  }, [acik, baslangic]);

  function varsayilan() {
    const kopya = duzenKopyala(CARI_OZET_ALAN_VARSAYILAN);
    setDuzen(kopya);
    setHedefler(hedefKopyala(kopya));
    setAktifSatir(0);
  }

  function sifirla() {
    setDuzen(
      duzenKopyala({
        ...CARI_OZET_ALAN_BOS,
        kutuBoyutu,
        gorunum: { ...gorunum },
      })
    );
    setHedefler([]);
    setAktifSatir(null);
  }

  function kutuBoyutuAyarla(boyut: CariOzetKutuBoyutu) {
    setDuzen((onceki) => ({ ...onceki, kutuBoyutu: boyut }));
  }

  function gorunumAyarla(parca: Partial<CariOzetGorunum>) {
    setDuzen((onceki) => ({
      ...onceki,
      gorunum: cariOzetGorunumDuzelt({ ...onceki.gorunum, ...parca }),
    }));
  }

  function gorunumSifirla() {
    gorunumAyarla({ ...CARI_OZET_GORUNUM_VARSAYILAN });
  }

  function satirEkle(sutun: number) {
    if (kalan <= 0) return;
    const { duzen: yeni, satirIndeks, sutun: gercek } = cariOzetBosSatirEkle(duzen, sutun);
    if (satirIndeks < 0) return;
    setDuzen(yeni);
    setHedefler((onceki) => [...onceki, gercek]);
    setAktifSatir(satirIndeks);
  }

  function satirSil(indeks: number) {
    setDuzen((onceki) => cariOzetSatirSil(onceki, indeks));
    setHedefler((onceki) => onceki.filter((_, i) => i !== indeks));
    setAktifSatir((onceki) => {
      if (onceki == null) return null;
      if (onceki === indeks) return null;
      if (onceki > indeks) return onceki - 1;
      return onceki;
    });
  }

  function satirTasi(indeks: number, yon: -1 | 1) {
    const hedef = indeks + yon;
    if (hedef < 0 || hedef >= duzen.satirlar.length) return;
    setDuzen((onceki) => cariOzetSatirTasi(onceki, indeks, hedef));
    setHedefler((onceki) => {
      const kopya = [...onceki];
      const [oge] = kopya.splice(indeks, 1);
      kopya.splice(hedef, 0, oge);
      return kopya;
    });
    setAktifSatir(hedef);
  }

  function slotBosalt(satirIndeks: number, slotIndeks: number) {
    setDuzen((onceki) => cariOzetAlanCikar(onceki, satirIndeks, slotIndeks));
  }

  function havuzdanEkle(id: CariOzetAlanId) {
    if (kalan <= 0) return;
    let hedef = aktifSatir;
    if (hedef == null || hedef < 0 || hedef >= duzen.satirlar.length) {
      const ek = cariOzetBosSatirEkle(duzen, 1);
      if (ek.satirIndeks < 0) return;
      setDuzen(cariOzetAlanSatiraEkle(ek.duzen, ek.satirIndeks, id, ek.sutun));
      setHedefler((onceki) => [...onceki, ek.sutun]);
      setAktifSatir(ek.satirIndeks);
      return;
    }
    const sutun = hedefler[hedef] ?? 1;
    const satir = duzen.satirlar[hedef] ?? [];
    if (satir.length >= sutun) {
      const ek = cariOzetBosSatirEkle(duzen, 1);
      if (ek.satirIndeks < 0) return;
      setDuzen(cariOzetAlanSatiraEkle(ek.duzen, ek.satirIndeks, id, ek.sutun));
      setHedefler((onceki) => [...onceki, ek.sutun]);
      setAktifSatir(ek.satirIndeks);
      return;
    }
    setDuzen((onceki) => cariOzetAlanSatiraEkle(onceki, hedef!, id, sutun));
  }

  function duzenAl(): CariOzetAlanDuzeni {
    return cariOzetAlanDuzeniDuzelt(duzen);
  }

  const satirOzeti =
    duzen.satirlar.length === 0
      ? '—'
      : duzen.satirlar.map((s, i) => hedefler[i] ?? (s.length || 1)).join(' · ');

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Bilgi Düzenle"
      genislik="md"
      ustCizgi={false}
      disariTiklaKapat={false}
      baslikSag={
        <button
          type="button"
          className={`cari-ozet-ayar-baslik-tus${ayarAcik ? ' cari-ozet-ayar-baslik-tus--aktif' : ''}`}
          onClick={() => setAyarAcik((v) => !v)}
          aria-expanded={ayarAcik}
          aria-controls="cari-ozet-ayar-panel"
          title="Görünüm ayarları"
          aria-label="Görünüm ayarları"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden>
            <path
              d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M19.4 13.1c.05-.36.05-.74 0-1.1l1.7-1.3-1.6-2.8-2 .4a6.7 6.7 0 0 0-1-1l.4-2H9.1l.4 2a6.7 6.7 0 0 0-1 1l-2-.4-1.6 2.8 1.7 1.3c-.05.36-.05.74 0 1.1L4.9 14.4l1.6 2.8 2-.4a6.7 6.7 0 0 0 1 1l-.4 2h4.8l-.4-2a6.7 6.7 0 0 0 1-1l2 .4 1.6-2.8-1.7-1.3Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      }
      footer={
        <SistemModalAksiyonlar>
          <button type="button" className="ap-sistem-modal-btn" onClick={onKapat}>
            Vazgeç
          </button>
          <button type="button" className="ap-sistem-modal-btn" onClick={sifirla}>
            Sıfırla
          </button>
          <button type="button" className="ap-sistem-modal-btn" onClick={varsayilan}>
            Varsayılan
          </button>
          <button
            type="button"
            className="ap-sistem-modal-btn"
            onClick={() => {
              onKaydetCari(duzenAl());
              onKapat();
            }}
            title="Yalnızca bu cari kartında geçerli olur"
          >
            Sadece bu cari için
          </button>
          <button
            type="button"
            className="ap-sistem-modal-btn ap-sistem-modal-btn-birincil"
            onClick={() => {
              onKaydetTumu(duzenAl());
              onKapat();
            }}
            title="Tüm carilerde varsayılan düzen olur"
          >
            Tümü için kaydet
          </button>
        </SistemModalAksiyonlar>
      }
      yanIcerik={
        <aside
          id="cari-ozet-ayar-panel"
          className={`cari-ozet-ayar-panel${ayarAcik ? ' cari-ozet-ayar-panel--acik' : ''}`}
          aria-hidden={!ayarAcik}
          aria-label="Görünüm ayarları"
        >
          <div className="cari-ozet-ayar-panel-ic">
            <div className="cari-ozet-ayar-panel-baslik">
              <strong>Görünüm</strong>
              <button
                type="button"
                className="cari-ozet-ayar-panel-kapat"
                onClick={() => setAyarAcik(false)}
                aria-label="Paneli kapat"
              >
                ✕
              </button>
            </div>

            <div className="cari-ozet-ayar-bolum">
              <span className="cari-ozet-ayar-bolum-baslik">Başlık (etiket)</span>
              <SecenekGrup
                etiket="Kalınlık"
                deger={gorunum.etiketAgirlik}
                secenekler={AGIRLIK_SECENEK}
                onDegistir={(v) => gorunumAyarla({ etiketAgirlik: v })}
              />
              <SecenekGrup
                etiket="Boyut"
                deger={gorunum.etiketBoyut}
                secenekler={BOYUT_SECENEK}
                onDegistir={(v) => gorunumAyarla({ etiketBoyut: v })}
              />
              <AnahtarSatir
                etiket="Büyük harf"
                acik={gorunum.etiketBuyukHarf}
                onDegistir={(v) => gorunumAyarla({ etiketBuyukHarf: v })}
              />
            </div>

            <div className="cari-ozet-ayar-bolum">
              <span className="cari-ozet-ayar-bolum-baslik">Değer</span>
              <SecenekGrup
                etiket="Kalınlık"
                deger={gorunum.degerAgirlik}
                secenekler={AGIRLIK_SECENEK}
                onDegistir={(v) => gorunumAyarla({ degerAgirlik: v })}
              />
              <SecenekGrup
                etiket="Boyut"
                deger={gorunum.degerBoyut}
                secenekler={BOYUT_SECENEK}
                onDegistir={(v) => gorunumAyarla({ degerBoyut: v })}
              />
            </div>

            <div className="cari-ozet-ayar-bolum">
              <span className="cari-ozet-ayar-bolum-baslik">Davranış</span>
              <AnahtarSatir
                etiket="Özet başlangıçta açık"
                acik={gorunum.ozetBaslangicAcik}
                onDegistir={(v) => gorunumAyarla({ ozetBaslangicAcik: v })}
              />
              <AnahtarSatir
                etiket="Boş alanlarda — göster"
                acik={gorunum.bosAlanGoster}
                onDegistir={(v) => gorunumAyarla({ bosAlanGoster: v })}
              />
            </div>

            <button type="button" className="cari-ozet-ayar-sifirla" onClick={gorunumSifirla}>
              Görünümü Varsayılana Döndür
            </button>
          </div>
        </aside>
      }
    >
      <div className="fatura-alan-yonet cari-ozet-yonet">
        <section className="cari-ozet-kutu-ayar" aria-label="Kutu büyüklüğü">
          <div className="cari-ozet-kutu-ayar-baslik">
            <strong>Kutu büyüklüğü</strong>
          </div>
          <div className="cari-ozet-kutu-ayar-secenekler" role="radiogroup" aria-label="Kutu büyüklüğü">
            {CARI_OZET_KUTU_BOYUTLARI.map((b) => {
              const secili = kutuBoyutu === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={secili}
                  className={`cari-ozet-kutu-ayar-oge${secili ? ' cari-ozet-kutu-ayar-oge--aktif' : ''}`}
                  onClick={() => kutuBoyutuAyarla(b.id)}
                >
                  {b.etiket}
                </button>
              );
            })}
          </div>
          <div
            className={`cari-ozet-kutu-ayar-canli cari-hareket-ozet--kutu-${kutuBoyutu} ${gorunumSiniflari(gorunum)}`}
            aria-hidden
          >
            <div className="cari-hareket-ozet-satir" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="cari-hareket-ozet-kart">
                <span className="cari-hareket-ozet-kart-etiket">Örnek</span>
                <strong className="cari-hareket-ozet-kart-deger">Kart görünümü</strong>
              </div>
              <div className="cari-hareket-ozet-kart">
                <span className="cari-hareket-ozet-kart-etiket">Bakiye</span>
                <strong className="cari-hareket-ozet-kart-deger">0,00</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="fatura-alan-yonet-bolum" aria-label="Satırlar">
          <div className="fatura-alan-yonet-bolum-baslik">
            <strong>Satırlar</strong>
            <span>
              {toplam}/{CARI_OZET_ALAN_MAX} · {satirOzeti}
            </span>
          </div>

          <div className="fatura-alan-yonet-satir-ekle" role="group" aria-label="Satır ekle">
            <span className="fatura-alan-yonet-satir-ekle-label">Satır</span>
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <button
                key={n}
                type="button"
                className="fatura-alan-yonet-satir-tus"
                disabled={kalan < 1 || n > kalan}
                onClick={() => satirEkle(n)}
                title={`${n} sütunlu satır`}
              >
                +{n}
              </button>
            ))}
          </div>

          <div className="fatura-alan-yonet-grid">
            {duzen.satirlar.length === 0 ? (
              <p className="fatura-alan-yonet-bos">Satır yok. +1 … +6 ekleyin, alttan alan seçin.</p>
            ) : (
              duzen.satirlar.map((satir, sira) => {
                const hedef = hedefler[sira] ?? Math.max(1, satir.length);
                const aktif = aktifSatir === sira;
                const slotlar: (CariOzetAlanId | null)[] = Array.from(
                  { length: hedef },
                  (_, i) => satir[i] ?? null
                );
                return (
                  <div
                    key={`satir-${sira}`}
                    className={`fatura-alan-yonet-satir${aktif ? ' fatura-alan-yonet-satir--aktif' : ''}`}
                    onClick={() => setAktifSatir(sira)}
                  >
                    <div className="fatura-alan-yonet-satir-ust">
                      <span className="fatura-alan-yonet-satir-no">Satır {sira + 1}</span>
                      <span className="fatura-alan-yonet-satir-meta">
                        {satir.length}/{hedef}
                      </span>
                      {aktif ? (
                        <div
                          className="fatura-alan-yonet-satir-tasima"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="fatura-alan-yonet-satir-tasi"
                            disabled={sira === 0}
                            onClick={() => satirTasi(sira, -1)}
                            title="Yukarı taşı"
                            aria-label={`Satır ${sira + 1} yukarı`}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="fatura-alan-yonet-satir-tasi"
                            disabled={sira >= duzen.satirlar.length - 1}
                            onClick={() => satirTasi(sira, 1)}
                            title="Aşağı taşı"
                            aria-label={`Satır ${sira + 1} aşağı`}
                          >
                            ▼
                          </button>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        className="fatura-alan-yonet-satir-sil"
                        onClick={(e) => {
                          e.stopPropagation();
                          satirSil(sira);
                        }}
                        aria-label={`Satır ${sira + 1} sil`}
                      >
                        ✕
                      </button>
                    </div>
                    <div
                      className="fatura-alan-yonet-slotlar"
                      style={{ gridTemplateColumns: `repeat(${hedef}, minmax(0, 1fr))` }}
                    >
                      {slotlar.map((id, slot) =>
                        id ? (
                          <div
                            key={`${sira}-${id}`}
                            className="fatura-alan-yonet-slot fatura-alan-yonet-slot--dolu"
                          >
                            <span className="fatura-alan-yonet-slot-ad">
                              {CARI_OZET_ALAN_ETIKET[id]}
                            </span>
                            <button
                              type="button"
                              className="fatura-alan-yonet-slot-kaldir"
                              onClick={(e) => {
                                e.stopPropagation();
                                slotBosalt(sira, slot);
                              }}
                              aria-label="Kaldır"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            key={`${sira}-bos-${slot}`}
                            type="button"
                            className="fatura-alan-yonet-slot fatura-alan-yonet-slot--bos"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAktifSatir(sira);
                            }}
                          >
                            Boş
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="fatura-alan-yonet-havuz">
          <div className="fatura-alan-yonet-havuz-baslik">
            <strong>Alan havuzu</strong>
            <span>{havuz.length} kalan</span>
          </div>
          {havuz.length === 0 ? (
            <p className="fatura-alan-yonet-bos">Tüm alanlar ekli.</p>
          ) : (
            <div className="fatura-alan-yonet-havuz-chip-ler">
              {havuz.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="fatura-alan-yonet-havuz-chip"
                  disabled={kalan <= 0}
                  onClick={() => havuzdanEkle(id)}
                >
                  + {CARI_OZET_ALAN_ETIKET[id]}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </SistemModal>
  );
}
