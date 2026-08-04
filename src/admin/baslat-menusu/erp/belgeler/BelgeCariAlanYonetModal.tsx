import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  BELGE_CARI_ALAN_ALT_MAX,
  BELGE_CARI_ALAN_BOS,
  BELGE_CARI_ALAN_ETIKET,
  BELGE_CARI_ALAN_UST_MAX,
  BELGE_CARI_ALAN_VARSAYILAN,
  belgeCariAlanCikar,
  belgeCariAlanDuzeniKaydet,
  belgeCariAlanEkle,
  belgeCariAlanHavuz,
  belgeCariAlanSiradaTasi,
  belgeCariAlanTakas,
  type BelgeCariAlanBolum,
  type BelgeCariAlanDuzeni,
  type BelgeCariAlanId,
} from './belgeCariAlanDuzeni';

interface BelgeCariAlanYonetModalProps {
  acik: boolean;
  baslangic: BelgeCariAlanDuzeni;
  onKapat: () => void;
  onKaydet: (duzen: BelgeCariAlanDuzeni) => void;
}

type SurukleKaynak =
  | { tur: 'bolum'; bolum: BelgeCariAlanBolum; indeks: number; id: BelgeCariAlanId }
  | { tur: 'havuz'; id: BelgeCariAlanId }
  | null;

function surukleHayaletAyarla(e: DragEvent, etiket: string) {
  e.stopPropagation();
  const hayalet = document.createElement('div');
  hayalet.className = 'fatura-alan-yonet-hayalet';
  hayalet.textContent = etiket;
  document.body.appendChild(hayalet);
  e.dataTransfer.setDragImage(hayalet, 16, 16);
  requestAnimationFrame(() => {
    hayalet.remove();
  });
}

export function BelgeCariAlanYonetModal({
  acik,
  baslangic,
  onKapat,
  onKaydet,
}: BelgeCariAlanYonetModalProps) {
  const [duzen, setDuzen] = useState<BelgeCariAlanDuzeni>(baslangic);
  const [seciliUst, setSeciliUst] = useState<number | null>(null);
  const [seciliAlt, setSeciliAlt] = useState<number | null>(null);
  const [seciliHavuz, setSeciliHavuz] = useState<BelgeCariAlanId | null>(null);
  const [sonBolum, setSonBolum] = useState<BelgeCariAlanBolum | null>(null);
  const [surukle, setSurukle] = useState<SurukleKaynak>(null);
  const [hedef, setHedef] = useState<{ bolum: BelgeCariAlanBolum; indeks: number } | null>(null);
  const surukleRef = useRef<SurukleKaynak>(null);

  const havuz = useMemo(() => belgeCariAlanHavuz(duzen), [duzen]);
  const degistirGorunur = seciliUst != null && seciliAlt != null;

  useEffect(() => {
    if (!acik) return;
    setDuzen({
      ust: [...baslangic.ust],
      alt: [...baslangic.alt],
    });
    setSeciliUst(null);
    setSeciliAlt(null);
    setSeciliHavuz(null);
    setSonBolum(null);
    setSurukle(null);
    surukleRef.current = null;
    setHedef(null);
  }, [acik, baslangic]);

  function secimleriTemizle() {
    setSeciliUst(null);
    setSeciliAlt(null);
    setSeciliHavuz(null);
    setSonBolum(null);
  }

  function kaydet() {
    const temiz = belgeCariAlanDuzeniKaydet(duzen);
    onKaydet(temiz);
    onKapat();
  }

  function varsayilanaDon() {
    setDuzen({
      ust: [...BELGE_CARI_ALAN_VARSAYILAN.ust],
      alt: [...BELGE_CARI_ALAN_VARSAYILAN.alt],
    });
    secimleriTemizle();
  }

  function sifirla() {
    setDuzen({ ust: [...BELGE_CARI_ALAN_BOS.ust], alt: [...BELGE_CARI_ALAN_BOS.alt] });
    secimleriTemizle();
  }

  function bolumSec(bolum: BelgeCariAlanBolum, indeks: number, zorla = false) {
    setSeciliHavuz(null);
    setSonBolum(bolum);
    if (bolum === 'ust') {
      setSeciliUst((onceki) => (!zorla && onceki === indeks ? null : indeks));
    } else {
      setSeciliAlt((onceki) => (!zorla && onceki === indeks ? null : indeks));
    }
  }

  function havuzSec(id: BelgeCariAlanId, zorla = false) {
    setSeciliUst(null);
    setSeciliAlt(null);
    setSonBolum(null);
    setSeciliHavuz((onceki) => (!zorla && onceki === id ? null : id));
  }

  function seciliyiTasi(hedefBolum: BelgeCariAlanBolum) {
    const max = hedefBolum === 'ust' ? BELGE_CARI_ALAN_UST_MAX : BELGE_CARI_ALAN_ALT_MAX;

    if (seciliHavuz) {
      if (duzen[hedefBolum].length >= max) return;
      const id = seciliHavuz;
      setDuzen((onceki) => belgeCariAlanEkle(onceki, hedefBolum, id));
      setSeciliHavuz(null);
      if (hedefBolum === 'ust') setSeciliUst(duzen.ust.length);
      else setSeciliAlt(duzen.alt.length);
      setSonBolum(hedefBolum);
      return;
    }

    const kaynakBolum: BelgeCariAlanBolum | null =
      hedefBolum === 'ust' ? (seciliAlt != null ? 'alt' : null) : seciliUst != null ? 'ust' : null;
    const kaynakIndeks = kaynakBolum === 'ust' ? seciliUst : kaynakBolum === 'alt' ? seciliAlt : null;
    if (kaynakBolum == null || kaynakIndeks == null) return;
    if (kaynakBolum === hedefBolum) return;

    if (duzen[hedefBolum].length >= max) {
      const hedefIndeks = Math.min(kaynakIndeks, Math.max(0, duzen[hedefBolum].length - 1));
      setDuzen((onceki) =>
        belgeCariAlanTakas(onceki, kaynakBolum, kaynakIndeks, hedefBolum, hedefIndeks)
      );
      if (hedefBolum === 'ust') {
        setSeciliUst(hedefIndeks);
        setSeciliAlt(null);
      } else {
        setSeciliAlt(hedefIndeks);
        setSeciliUst(null);
      }
      setSonBolum(hedefBolum);
      return;
    }

    const id = duzen[kaynakBolum][kaynakIndeks];
    if (!id) return;
    setDuzen((onceki) => {
      const cikarildi = belgeCariAlanCikar(onceki, kaynakBolum, kaynakIndeks);
      return belgeCariAlanEkle(cikarildi, hedefBolum, id);
    });
    if (hedefBolum === 'ust') {
      setSeciliUst(duzen.ust.length);
      setSeciliAlt(null);
    } else {
      setSeciliAlt(duzen.alt.length);
      setSeciliUst(null);
    }
    setSonBolum(hedefBolum);
  }

  function degistir() {
    if (seciliUst == null || seciliAlt == null) return;
    setDuzen((onceki) => belgeCariAlanTakas(onceki, 'ust', seciliUst, 'alt', seciliAlt));
  }

  function seciliyiKaldir() {
    if (sonBolum == null) return;
    const indeks = sonBolum === 'ust' ? seciliUst : seciliAlt;
    if (indeks == null) return;
    setDuzen((onceki) => belgeCariAlanCikar(onceki, sonBolum, indeks));
    if (sonBolum === 'ust') setSeciliUst(null);
    else setSeciliAlt(null);
    setSonBolum(null);
  }

  function birAdim(yon: -1 | 1) {
    if (sonBolum == null) return;
    const indeks = sonBolum === 'ust' ? seciliUst : seciliAlt;
    if (indeks == null) return;
    const liste = duzen[sonBolum];
    const yeniIndeks = indeks + yon;
    if (yeniIndeks < 0 || yeniIndeks >= liste.length) return;
    setDuzen((onceki) => ({
      ...onceki,
      [sonBolum]: belgeCariAlanSiradaTasi(onceki[sonBolum], indeks, yeniIndeks),
    }));
    if (sonBolum === 'ust') setSeciliUst(yeniIndeks);
    else setSeciliAlt(yeniIndeks);
  }

  function onDragStartBolum(
    e: DragEvent,
    bolum: BelgeCariAlanBolum,
    indeks: number,
    id: BelgeCariAlanId
  ) {
    const kaynak: SurukleKaynak = { tur: 'bolum', bolum, indeks, id };
    surukleRef.current = kaynak;
    setSurukle(kaynak);
    bolumSec(bolum, indeks, true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    surukleHayaletAyarla(e, BELGE_CARI_ALAN_ETIKET[id]);
  }

  function onDragStartHavuz(e: DragEvent, id: BelgeCariAlanId) {
    const kaynak: SurukleKaynak = { tur: 'havuz', id };
    surukleRef.current = kaynak;
    setSurukle(kaynak);
    havuzSec(id, true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    surukleHayaletAyarla(e, BELGE_CARI_ALAN_ETIKET[id]);
  }

  function onDragOverBolum(e: DragEvent, bolum: BelgeCariAlanBolum, indeks: number) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!hedef || hedef.bolum !== bolum || hedef.indeks !== indeks) {
      setHedef({ bolum, indeks });
    }
  }

  function onDragOverListe(e: DragEvent, bolum: BelgeCariAlanBolum) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const indeks = duzen[bolum].length;
    if (!hedef || hedef.bolum !== bolum || hedef.indeks !== indeks) {
      setHedef({ bolum, indeks });
    }
  }

  function onDropBolum(e: DragEvent, bolum: BelgeCariAlanBolum, indeks: number) {
    e.preventDefault();
    e.stopPropagation();
    const kaynak = surukleRef.current ?? surukle;
    if (!kaynak) return;

    if (kaynak.tur === 'havuz') {
      setDuzen((onceki) => belgeCariAlanEkle(onceki, bolum, kaynak.id, indeks));
      if (bolum === 'ust') setSeciliUst(indeks);
      else setSeciliAlt(indeks);
      setSeciliHavuz(null);
      setSonBolum(bolum);
    } else if (kaynak.bolum === bolum) {
      setDuzen((onceki) => ({
        ...onceki,
        [bolum]: belgeCariAlanSiradaTasi(onceki[bolum], kaynak.indeks, indeks),
      }));
      if (bolum === 'ust') setSeciliUst(indeks);
      else setSeciliAlt(indeks);
      setSonBolum(bolum);
    } else {
      setDuzen((onceki) =>
        belgeCariAlanTakas(onceki, kaynak.bolum, kaynak.indeks, bolum, indeks)
      );
      if (bolum === 'ust') {
        setSeciliUst(indeks);
        setSeciliAlt(kaynak.indeks);
      } else {
        setSeciliAlt(indeks);
        setSeciliUst(kaynak.indeks);
      }
      setSonBolum(bolum);
    }

    surukleRef.current = null;
    setSurukle(null);
    setHedef(null);
  }

  function onDropListeSonu(e: DragEvent, bolum: BelgeCariAlanBolum) {
    onDropBolum(e, bolum, duzen[bolum].length);
  }

  function onDragEnd() {
    surukleRef.current = null;
    setSurukle(null);
    setHedef(null);
  }

  function Liste({
    bolum,
    baslik,
    max,
    idler,
  }: {
    bolum: BelgeCariAlanBolum;
    baslik: string;
    max: number;
    idler: BelgeCariAlanId[];
  }) {
    const seciliIndeks = bolum === 'ust' ? seciliUst : seciliAlt;
    return (
      <div
        className="fatura-alan-yonet-liste"
        onDragOver={(e) => onDragOverListe(e, bolum)}
        onDrop={(e) => onDropListeSonu(e, bolum)}
      >
        <div className="fatura-alan-yonet-liste-baslik">
          <strong>{baslik}</strong>
          <span>
            {idler.length}/{max}
          </span>
        </div>
        <ul className="fatura-alan-yonet-ul">
          {idler.length === 0 ? (
            <li className="fatura-alan-yonet-bos">Boş — havuzdan ekle</li>
          ) : (
            idler.map((id, indeks) => {
              const aktif = seciliIndeks === indeks;
              const hedefMi = hedef?.bolum === bolum && hedef.indeks === indeks;
              const surukleniyor =
                surukle?.tur === 'bolum' && surukle.bolum === bolum && surukle.indeks === indeks;
              return (
                <li
                  key={`${bolum}-${id}`}
                  className={`fatura-alan-yonet-oge${aktif ? ' fatura-alan-yonet-oge--aktif' : ''}${
                    hedefMi ? ' fatura-alan-yonet-oge--hedef' : ''
                  }${surukleniyor ? ' fatura-alan-yonet-oge--surukleniyor' : ''}`}
                  draggable
                  onDragStart={(e) => onDragStartBolum(e, bolum, indeks, id)}
                  onDragOver={(e) => onDragOverBolum(e, bolum, indeks)}
                  onDrop={(e) => onDropBolum(e, bolum, indeks)}
                  onDragEnd={onDragEnd}
                  onClick={() => bolumSec(bolum, indeks)}
                >
                  <span className="fatura-alan-yonet-surukle" aria-hidden>
                    ⠿
                  </span>
                  <span className="fatura-alan-yonet-sira">{indeks + 1}</span>
                  <span className="fatura-alan-yonet-ad">{BELGE_CARI_ALAN_ETIKET[id]}</span>
                </li>
              );
            })
          )}
        </ul>
      </div>
    );
  }

  const aktifIndeks = sonBolum === 'ust' ? seciliUst : sonBolum === 'alt' ? seciliAlt : null;
  const ustTasiKapali =
    (!seciliHavuz && seciliAlt == null) ||
    (Boolean(seciliHavuz) && duzen.ust.length >= BELGE_CARI_ALAN_UST_MAX);
  const altTasiKapali =
    (!seciliHavuz && seciliUst == null) ||
    (Boolean(seciliHavuz) && duzen.alt.length >= BELGE_CARI_ALAN_ALT_MAX);

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Alanları Yönet"
      altBaslik={`Üst en fazla ${BELGE_CARI_ALAN_UST_MAX} · Alt en fazla ${BELGE_CARI_ALAN_ALT_MAX} (2+4+2)`}
      genislik="lg"
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
    >
      <div className="fatura-alan-yonet">
        <div className="fatura-alan-yonet-sol">
          <div className="fatura-alan-yonet-kart">
            <p className="fatura-alan-yonet-bolum-etiket">Üst önizleme (yan yana)</p>
            <div className="fatura-alan-yonet-ust-onizle">
              {duzen.ust.length === 0 ? (
                <span className="fatura-alan-yonet-chip fatura-alan-yonet-chip--bos">Alan yok</span>
              ) : (
                duzen.ust.map((id) => (
                  <span key={`u-${id}`} className="fatura-alan-yonet-chip">
                    {BELGE_CARI_ALAN_ETIKET[id]}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="fatura-alan-yonet-kart">
            <p className="fatura-alan-yonet-bolum-etiket">Alt önizleme (2 · 4 · 2)</p>
            <div className="fatura-alan-yonet-alt-onizle">
              {duzen.alt.length === 0 ? (
                <span className="fatura-alan-yonet-chip fatura-alan-yonet-chip--bos">Alan yok</span>
              ) : (
                <>
                  <div className="fatura-alan-yonet-alt-satir fatura-alan-yonet-alt-satir--2">
                    {duzen.alt.slice(0, 2).map((id) => (
                      <span key={`a0-${id}`} className="fatura-alan-yonet-chip">
                        {BELGE_CARI_ALAN_ETIKET[id]}
                      </span>
                    ))}
                  </div>
                  {duzen.alt.length > 2 ? (
                    <div className="fatura-alan-yonet-alt-satir fatura-alan-yonet-alt-satir--4">
                      {duzen.alt.slice(2, 6).map((id) => (
                        <span key={`a1-${id}`} className="fatura-alan-yonet-chip">
                          {BELGE_CARI_ALAN_ETIKET[id]}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {duzen.alt.length > 6 ? (
                    <div className="fatura-alan-yonet-alt-satir fatura-alan-yonet-alt-satir--2">
                      {duzen.alt.slice(6, 8).map((id) => (
                        <span key={`a2-${id}`} className="fatura-alan-yonet-chip">
                          {BELGE_CARI_ALAN_ETIKET[id]}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div className="fatura-alan-yonet-kart fatura-alan-yonet-kart--havuz">
            <div className="fatura-alan-yonet-liste-baslik">
              <strong>Kullanılmayan alanlar</strong>
              <span>{havuz.length}</span>
            </div>
            <ul className="fatura-alan-yonet-ul fatura-alan-yonet-ul--havuz">
              {havuz.length === 0 ? (
                <li className="fatura-alan-yonet-bos">Tüm alanlar yerleştirildi</li>
              ) : (
                havuz.map((id) => {
                  const aktif = seciliHavuz === id;
                  const surukleniyor = surukle?.tur === 'havuz' && surukle.id === id;
                  return (
                    <li
                      key={`h-${id}`}
                      className={`fatura-alan-yonet-oge${aktif ? ' fatura-alan-yonet-oge--aktif' : ''}${
                        surukleniyor ? ' fatura-alan-yonet-oge--surukleniyor' : ''
                      }`}
                      draggable
                      onDragStart={(e) => onDragStartHavuz(e, id)}
                      onDragEnd={onDragEnd}
                      onClick={() => havuzSec(id)}
                    >
                      <span className="fatura-alan-yonet-surukle" aria-hidden>
                        ⠿
                      </span>
                      <span className="fatura-alan-yonet-ad">{BELGE_CARI_ALAN_ETIKET[id]}</span>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        <div className="fatura-alan-yonet-sag">
          <div className="fatura-alan-yonet-araclar">
            <div className="fatura-alan-yonet-tasi-sutun">
              <button
                type="button"
                className="ap-sistem-modal-btn"
                disabled={ustTasiKapali}
                onClick={() => seciliyiTasi('ust')}
              >
                Üste ekle
              </button>
              <button
                type="button"
                className="ap-sistem-modal-btn"
                disabled={altTasiKapali}
                onClick={() => seciliyiTasi('alt')}
              >
                Alta ekle
              </button>
            </div>
            <button
              type="button"
              className="ap-sistem-modal-btn"
              disabled={!degistirGorunur}
              onClick={degistir}
            >
              Değiştir
            </button>
            <button
              type="button"
              className="ap-sistem-modal-btn"
              disabled={aktifIndeks == null || sonBolum == null}
              onClick={seciliyiKaldir}
            >
              Kaldır
            </button>
            <div className="fatura-alan-yonet-oklar">
              <button
                type="button"
                className="ap-sistem-modal-btn fatura-alan-yonet-ok"
                disabled={aktifIndeks == null || sonBolum == null || aktifIndeks === 0}
                onClick={() => birAdim(-1)}
                title="Yukarı"
              >
                ▲
              </button>
              <button
                type="button"
                className="ap-sistem-modal-btn fatura-alan-yonet-ok"
                disabled={
                  aktifIndeks == null ||
                  sonBolum == null ||
                  aktifIndeks >= duzen[sonBolum].length - 1
                }
                onClick={() => birAdim(1)}
                title="Aşağı"
              >
                ▼
              </button>
            </div>
          </div>
          <Liste bolum="ust" baslik="Üst alanlar" max={BELGE_CARI_ALAN_UST_MAX} idler={duzen.ust} />
          <Liste bolum="alt" baslik="Alt alanlar" max={BELGE_CARI_ALAN_ALT_MAX} idler={duzen.alt} />
          <p className="fatura-alan-yonet-ipucu">
            Üst ve alttan birer alan seçince Değiştir görünür. Havuzdan seçip Üste/Alta ekle veya sürükle.
          </p>
        </div>
      </div>
    </SistemModal>
  );
}
