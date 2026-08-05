import { useEffect, useMemo, useState } from 'react';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  BELGE_CARI_ALAN_ALT_MAX,
  BELGE_CARI_ALAN_BOS,
  BELGE_CARI_ALAN_ETIKET,
  BELGE_CARI_ALAN_UST_MAX,
  BELGE_CARI_ALAN_VARSAYILAN,
  BELGE_CARI_SATIR_SUTUN_MAX,
  belgeCariAlanCikar,
  belgeCariAlanDuzeniKaydet,
  belgeCariAlanHavuz,
  belgeCariAlanSatiraEkle,
  belgeCariAltToplam,
  belgeCariBosSatirEkle,
  belgeCariSatirSil,
  belgeCariSatirTasi,
  belgeCariUsteEkle,
  belgeCariUstenCikar,
  belgeCariUstSirala,
  type BelgeCariAlanDuzeni,
  type BelgeCariAlanHedef,
  type BelgeCariAlanId,
} from './belgeCariAlanDuzeni';

interface BelgeCariAlanYonetModalProps {
  acik: boolean;
  baslangic: BelgeCariAlanDuzeni;
  onKapat: () => void;
  onKaydet: (duzen: BelgeCariAlanDuzeni) => void;
}

type SatirHedefleri = number[];

function duzenKopyala(d: BelgeCariAlanDuzeni): BelgeCariAlanDuzeni {
  return {
    ust: [...d.ust],
    satirlar: d.satirlar.map((s) => [...s]),
  };
}

function hedefKopyala(duzen: BelgeCariAlanDuzeni): SatirHedefleri {
  return duzen.satirlar.map((s) => Math.max(1, Math.min(BELGE_CARI_SATIR_SUTUN_MAX, s.length || 1)));
}

export function BelgeCariAlanYonetModal({
  acik,
  baslangic,
  onKapat,
  onKaydet,
}: BelgeCariAlanYonetModalProps) {
  const [duzen, setDuzen] = useState<BelgeCariAlanDuzeni>(() => duzenKopyala(baslangic));
  const [hedefler, setHedefler] = useState<SatirHedefleri>(() => hedefKopyala(baslangic));
  const [hedefBolum, setHedefBolum] = useState<BelgeCariAlanHedef>('ust');
  const [aktifSatir, setAktifSatir] = useState<number | null>(null);
  const [seciliUst, setSeciliUst] = useState<number | null>(null);
  const [yardimAcik, setYardimAcik] = useState(false);

  const havuz = useMemo(() => belgeCariAlanHavuz(duzen), [duzen]);
  const altToplam = belgeCariAltToplam(duzen);
  const altKalan = BELGE_CARI_ALAN_ALT_MAX - altToplam;
  const ustDolu = duzen.ust.length >= BELGE_CARI_ALAN_UST_MAX;
  const altDolu = altKalan <= 0;

  useEffect(() => {
    if (!acik) return;
    const kopya = duzenKopyala(baslangic);
    setDuzen(kopya);
    setHedefler(hedefKopyala(kopya));
    setHedefBolum('ust');
    setAktifSatir(kopya.satirlar.length > 0 ? 0 : null);
    setSeciliUst(null);
    setYardimAcik(false);
  }, [acik, baslangic]);

  function kaydet() {
    const temiz = belgeCariAlanDuzeniKaydet(duzen);
    onKaydet(temiz);
    onKapat();
  }

  function sifirla() {
    setDuzen(duzenKopyala(BELGE_CARI_ALAN_BOS));
    setHedefler([]);
    setAktifSatir(null);
    setSeciliUst(null);
  }

  function varsayilanaDon() {
    const kopya = duzenKopyala(BELGE_CARI_ALAN_VARSAYILAN);
    setDuzen(kopya);
    setHedefler(hedefKopyala(kopya));
    setAktifSatir(0);
    setSeciliUst(null);
    setHedefBolum('ust');
  }

  function satirEkle(sutun: number) {
    if (altKalan <= 0) return;
    const { duzen: yeni, satirIndeks, sutun: gercek } = belgeCariBosSatirEkle(duzen, sutun);
    if (satirIndeks < 0) return;
    setDuzen(yeni);
    setHedefler((onceki) => [...onceki, gercek]);
    setAktifSatir(satirIndeks);
    setHedefBolum('alt');
  }

  function satirSil(indeks: number) {
    setDuzen((onceki) => belgeCariSatirSil(onceki, indeks));
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
    setDuzen((onceki) => belgeCariSatirTasi(onceki, indeks, hedef));
    setHedefler((onceki) => {
      const kopya = [...onceki];
      const [oge] = kopya.splice(indeks, 1);
      kopya.splice(hedef, 0, oge);
      return kopya;
    });
    setAktifSatir(hedef);
    setHedefBolum('alt');
  }

  function slotBosalt(satirIndeks: number, slotIndeks: number) {
    setDuzen((onceki) => belgeCariAlanCikar(onceki, satirIndeks, slotIndeks));
  }

  function havuzdanEkle(id: BelgeCariAlanId) {
    if (hedefBolum === 'ust') {
      if (ustDolu) return;
      setDuzen((onceki) => belgeCariUsteEkle(onceki, id));
      return;
    }

    if (altKalan <= 0) return;
    let hedef = aktifSatir;
    if (hedef == null || hedef < 0 || hedef >= duzen.satirlar.length) {
      const ek = belgeCariBosSatirEkle(duzen, 1);
      if (ek.satirIndeks < 0) return;
      setDuzen(belgeCariAlanSatiraEkle(ek.duzen, ek.satirIndeks, id, ek.sutun));
      setHedefler((onceki) => [...onceki, ek.sutun]);
      setAktifSatir(ek.satirIndeks);
      return;
    }
    const sutun = hedefler[hedef] ?? 1;
    const satir = duzen.satirlar[hedef] ?? [];
    if (satir.length >= sutun) {
      const ek = belgeCariBosSatirEkle(duzen, 1);
      if (ek.satirIndeks < 0) return;
      setDuzen(belgeCariAlanSatiraEkle(ek.duzen, ek.satirIndeks, id, ek.sutun));
      setHedefler((onceki) => [...onceki, ek.sutun]);
      setAktifSatir(ek.satirIndeks);
      return;
    }
    setDuzen((onceki) => belgeCariAlanSatiraEkle(onceki, hedef!, id, sutun));
  }

  function ustBirAdim(yon: -1 | 1) {
    if (seciliUst == null) return;
    const yeni = seciliUst + yon;
    if (yeni < 0 || yeni >= duzen.ust.length) return;
    setDuzen((onceki) => belgeCariUstSirala(onceki, seciliUst, yeni));
    setSeciliUst(yeni);
  }

  const hedefDolu = hedefBolum === 'ust' ? ustDolu : altDolu;
  const satirOzeti =
    duzen.satirlar.length === 0
      ? '—'
      : duzen.satirlar.map((s, i) => hedefler[i] ?? (s.length || 1)).join(' · ');

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Alanları Yönet"
      altBaslik="Üst yan yana · alt satır satır · en fazla 5+8 alan"
      genislik="md"
      ustCizgi={false}
      disariTiklaKapat={false}
      footer={
        <SistemModalAksiyonlar>
          <button type="button" className="ap-sistem-modal-btn" onClick={sifirla}>
            Sıfırla
          </button>
          <button type="button" className="ap-sistem-modal-btn" onClick={varsayilanaDon}>
            Varsayılan
          </button>
          <button type="button" className="ap-sistem-modal-btn" onClick={onKapat}>
            Vazgeç
          </button>
          <button type="button" className="ap-sistem-modal-btn ap-sistem-modal-btn-birincil" onClick={kaydet}>
            Kaydet
          </button>
        </SistemModalAksiyonlar>
      }
      yanIcerik={
        <aside
          id="fatura-alan-yonet-yardim"
          className={`fatura-alan-yonet-yardim${yardimAcik ? ' fatura-alan-yonet-yardim--acik' : ''}`}
          aria-hidden={!yardimAcik}
          aria-label="Nasıl kullanılır"
        >
          <div className="fatura-alan-yonet-yardim-ic">
            <div className="fatura-alan-yonet-yardim-baslik">
              <strong>Nasıl kullanılır?</strong>
              <button
                type="button"
                className="fatura-alan-yonet-yardim-kapat"
                onClick={() => setYardimAcik(false)}
                aria-label="Yardımı kapat"
              >
                ✕
              </button>
            </div>

            <div className="fatura-alan-yonet-yardim-kart">
              <div className="fatura-alan-yonet-yardim-kart-ust">
                <span className="fatura-alan-yonet-yardim-badge">1</span>
                <span>Üst alanlar</span>
              </div>
              <p className="fatura-alan-yonet-yardim-kisa">Cari adının yanında, yan yana.</p>
              <div className="fatura-alan-yonet-viz fatura-alan-yonet-viz--ust" aria-hidden>
                <div className="fatura-alan-yonet-viz-cari">
                  <i />
                  <b>Cari Adı</b>
                </div>
                <div className="fatura-alan-yonet-viz-ust-sira">
                  <span>Tip</span>
                  <span>Vergi</span>
                  <span>E-Fat.</span>
                </div>
              </div>
              <div className="fatura-alan-yonet-viz-adim">
                <span className="fatura-alan-yonet-viz-pill">Üste ekle</span>
                <span className="fatura-alan-yonet-viz-ok" aria-hidden>
                  →
                </span>
                <span className="fatura-alan-yonet-viz-chip">+ Alan</span>
              </div>
            </div>

            <div className="fatura-alan-yonet-yardim-kart">
              <div className="fatura-alan-yonet-yardim-kart-ust">
                <span className="fatura-alan-yonet-yardim-badge">2</span>
                <span>Alt satırlar</span>
              </div>
              <p className="fatura-alan-yonet-yardim-kisa">Önce satır aç, sonra alan doldur.</p>

              <div className="fatura-alan-yonet-viz-satirlar" aria-hidden>
                <div className="fatura-alan-yonet-viz-ornek">
                  <span className="fatura-alan-yonet-viz-etiket">+1</span>
                  <div className="fatura-alan-yonet-viz-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <i>Adres</i>
                  </div>
                </div>
                <div className="fatura-alan-yonet-viz-ornek fatura-alan-yonet-viz-ornek--vurgu">
                  <span className="fatura-alan-yonet-viz-etiket">+2</span>
                  <div className="fatura-alan-yonet-viz-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <i>Tel</i>
                    <i>GSM</i>
                  </div>
                </div>
                <div className="fatura-alan-yonet-viz-ornek">
                  <span className="fatura-alan-yonet-viz-etiket">+3</span>
                  <div className="fatura-alan-yonet-viz-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <div className="fatura-alan-yonet-viz-ornek">
                  <span className="fatura-alan-yonet-viz-etiket">+4</span>
                  <div className="fatura-alan-yonet-viz-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>

              <div className="fatura-alan-yonet-viz-adim">
                <span className="fatura-alan-yonet-viz-pill fatura-alan-yonet-viz-pill--alt">Alta ekle</span>
                <span className="fatura-alan-yonet-viz-ok" aria-hidden>
                  →
                </span>
                <span className="fatura-alan-yonet-viz-bos">boş yuva</span>
              </div>
            </div>

            <div className="fatura-alan-yonet-yardim-limit">
              <span>
                Üst <b>5</b>
              </span>
              <span className="fatura-alan-yonet-yardim-limit-ayrac" aria-hidden />
              <span>
                Alt <b>8</b>
              </span>
              <span className="fatura-alan-yonet-yardim-limit-ayrac" aria-hidden />
              <span>Tekrar yok</span>
            </div>
          </div>
        </aside>
      }
    >
      <div className="fatura-alan-yonet">
        <div className="fatura-alan-yonet-ust-serit">
          <button
            type="button"
            className={`fatura-alan-yonet-yardim-tus${yardimAcik ? ' fatura-alan-yonet-yardim-tus--aktif' : ''}`}
            onClick={() => setYardimAcik((v) => !v)}
            aria-expanded={yardimAcik}
            aria-controls="fatura-alan-yonet-yardim"
            title="Nasıl kullanılır?"
          >
            <span>Nasıl kullanılır</span>
          </button>
        </div>

        <div className="fatura-alan-yonet-hedef-secim" role="tablist" aria-label="Ekleme hedefi">
          <button
            type="button"
            role="tab"
            aria-selected={hedefBolum === 'ust'}
            className={`fatura-alan-yonet-hedef-tus${hedefBolum === 'ust' ? ' fatura-alan-yonet-hedef-tus--aktif' : ''}`}
            onClick={() => setHedefBolum('ust')}
          >
            Üste ekle
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={hedefBolum === 'alt'}
            className={`fatura-alan-yonet-hedef-tus${hedefBolum === 'alt' ? ' fatura-alan-yonet-hedef-tus--aktif' : ''}`}
            onClick={() => setHedefBolum('alt')}
          >
            Alta ekle
          </button>
        </div>

        <section className="fatura-alan-yonet-bolum" aria-label="Üst alanlar">
          <div className="fatura-alan-yonet-bolum-baslik">
            <strong>Üst alanlar</strong>
            <span>Yan yana · {duzen.ust.length}/{BELGE_CARI_ALAN_UST_MAX}</span>
          </div>
          <div className="fatura-alan-yonet-ust-liste">
            {duzen.ust.length === 0 ? (
              <p className="fatura-alan-yonet-bos">Üstte alan yok — «Üste ekle» ile seçin.</p>
            ) : (
              duzen.ust.map((id, indeks) => (
                <div
                  key={`ust-${id}`}
                  className={`fatura-alan-yonet-ust-chip${seciliUst === indeks ? ' fatura-alan-yonet-ust-chip--aktif' : ''}`}
                  onClick={() => setSeciliUst((o) => (o === indeks ? null : indeks))}
                >
                  <span>{BELGE_CARI_ALAN_ETIKET[id]}</span>
                  <button
                    type="button"
                    className="fatura-alan-yonet-slot-kaldir"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDuzen((onceki) => belgeCariUstenCikar(onceki, indeks));
                      setSeciliUst(null);
                    }}
                    aria-label="Kaldır"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
          {duzen.ust.length > 1 ? (
            <div className="fatura-alan-yonet-ust-araclar">
              <button
                type="button"
                className="ap-sistem-modal-btn fatura-alan-yonet-ok"
                disabled={seciliUst == null || seciliUst === 0}
                onClick={() => ustBirAdim(-1)}
              >
                ◀
              </button>
              <button
                type="button"
                className="ap-sistem-modal-btn fatura-alan-yonet-ok"
                disabled={seciliUst == null || seciliUst >= duzen.ust.length - 1}
                onClick={() => ustBirAdim(1)}
              >
                ▶
              </button>
            </div>
          ) : null}
        </section>

        <section className="fatura-alan-yonet-bolum" aria-label="Alt satırlar">
          <div className="fatura-alan-yonet-bolum-baslik">
            <strong>Alt satırlar</strong>
            <span>
              {altToplam}/{BELGE_CARI_ALAN_ALT_MAX} · {satirOzeti}
            </span>
          </div>

          <div className="fatura-alan-yonet-satir-ekle" role="group" aria-label="Satır ekle">
            <span className="fatura-alan-yonet-satir-ekle-label">Satır</span>
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <button
                key={n}
                type="button"
                className="fatura-alan-yonet-satir-tus"
                disabled={altKalan < 1 || n > altKalan}
                onClick={() => satirEkle(n)}
                title={`${n} sütunlu satır`}
              >
                +{n}
              </button>
            ))}
          </div>

          <div className="fatura-alan-yonet-grid">
            {duzen.satirlar.length === 0 ? (
              <p className="fatura-alan-yonet-bos">
                Alt satır yok. +1 … +6 ekleyin, «Alta ekle» ile alan seçin.
              </p>
            ) : (
              duzen.satirlar.map((satir, sira) => {
                const hedef = hedefler[sira] ?? Math.max(1, satir.length);
                const aktif = hedefBolum === 'alt' && aktifSatir === sira;
                const slotlar: (BelgeCariAlanId | null)[] = Array.from({ length: hedef }, (_, i) =>
                  satir[i] ?? null
                );
                return (
                  <div
                    key={`satir-${sira}`}
                    className={`fatura-alan-yonet-satir${aktif ? ' fatura-alan-yonet-satir--aktif' : ''}`}
                    onClick={() => {
                      setHedefBolum('alt');
                      setAktifSatir(sira);
                    }}
                  >
                    <div className="fatura-alan-yonet-satir-ust">
                      <span className="fatura-alan-yonet-satir-no">Satır {sira + 1}</span>
                      <span className="fatura-alan-yonet-satir-meta">
                        {satir.length}/{hedef}
                      </span>
                      {aktif ? (
                        <div className="fatura-alan-yonet-satir-tasima" onClick={(e) => e.stopPropagation()}>
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
                            <span className="fatura-alan-yonet-slot-ad">{BELGE_CARI_ALAN_ETIKET[id]}</span>
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
                              setHedefBolum('alt');
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
            <strong>Alanlar</strong>
            <span>
              {hedefBolum === 'ust'
                ? `→ Üst (${duzen.ust.length}/${BELGE_CARI_ALAN_UST_MAX})`
                : aktifSatir != null
                  ? `→ Satır ${aktifSatir + 1}`
                  : '→ Alt satır'}
            </span>
          </div>
          <div className="fatura-alan-yonet-havuz-chip-ler">
            {havuz.length === 0 ? (
              <p className="fatura-alan-yonet-bos">Eklenecek alan kalmadı</p>
            ) : (
              havuz.map((id) => (
                <button
                  key={`h-${id}`}
                  type="button"
                  className={`fatura-alan-yonet-havuz-chip${hedefDolu ? ' fatura-alan-yonet-havuz-chip--kapali' : ''}`}
                  disabled={hedefDolu}
                  onClick={() => havuzdanEkle(id)}
                  title={BELGE_CARI_ALAN_ETIKET[id]}
                >
                  + {BELGE_CARI_ALAN_ETIKET[id]}
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </SistemModal>
  );
}
