import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  BELGE_CARI_ALAN_BOS,
  BELGE_CARI_ALAN_ETIKET,
  BELGE_CARI_ALAN_UST_MAX,
  BELGE_CARI_ALAN_VARSAYILAN,
  BELGE_CARI_ALT_DUZEN_SECENEKLERI,
  belgeCariAlanCikar,
  belgeCariAlanDuzeniKaydet,
  belgeCariAlanEkle,
  belgeCariAlanHavuz,
  belgeCariAlanSiradaTasi,
  belgeCariAlanTakas,
  belgeCariAltDuzenDegistir,
  belgeCariAltDuzenId,
  belgeCariAltKapasite,
  belgeCariAltSatirlariBol,
  type BelgeCariAlanBolum,
  type BelgeCariAlanDuzeni,
  type BelgeCariAlanId,
  type BelgeCariAltSatirlar,
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
  const [hedefBolum, setHedefBolum] = useState<BelgeCariAlanBolum>('ust');
  const [seciliUst, setSeciliUst] = useState<number | null>(null);
  const [seciliAlt, setSeciliAlt] = useState<number | null>(null);
  const [surukle, setSurukle] = useState<SurukleKaynak>(null);
  const [hedef, setHedef] = useState<{ bolum: BelgeCariAlanBolum; indeks: number } | null>(null);
  const surukleRef = useRef<SurukleKaynak>(null);

  const havuz = useMemo(() => belgeCariAlanHavuz(duzen), [duzen]);
  const altMax = belgeCariAltKapasite(duzen.altSatirlar);
  const altSatirGruplari = useMemo(
    () => belgeCariAltSatirlariBol(duzen.alt, duzen.altSatirlar),
    [duzen.alt, duzen.altSatirlar]
  );
  const aktifDuzenId = belgeCariAltDuzenId(duzen.altSatirlar);
  const seciliIndeks = hedefBolum === 'ust' ? seciliUst : seciliAlt;

  useEffect(() => {
    if (!acik) return;
    setDuzen({
      ust: [...baslangic.ust],
      alt: [...baslangic.alt],
      altSatirlar: [...baslangic.altSatirlar],
    });
    setHedefBolum('ust');
    setSeciliUst(null);
    setSeciliAlt(null);
    setSurukle(null);
    surukleRef.current = null;
    setHedef(null);
  }, [acik, baslangic]);

  function secimleriTemizle() {
    setSeciliUst(null);
    setSeciliAlt(null);
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
      altSatirlar: [...BELGE_CARI_ALAN_VARSAYILAN.altSatirlar],
    });
    secimleriTemizle();
  }

  function sifirla() {
    setDuzen({
      ust: [...BELGE_CARI_ALAN_BOS.ust],
      alt: [...BELGE_CARI_ALAN_BOS.alt],
      altSatirlar: [...BELGE_CARI_ALAN_BOS.altSatirlar],
    });
    secimleriTemizle();
  }

  function altDuzenSec(satirlar: BelgeCariAltSatirlar) {
    setDuzen((onceki) => belgeCariAltDuzenDegistir(onceki, satirlar));
    setSeciliAlt(null);
  }

  function bolumSec(bolum: BelgeCariAlanBolum, indeks: number) {
    setHedefBolum(bolum);
    if (bolum === 'ust') {
      setSeciliUst((onceki) => (onceki === indeks ? null : indeks));
      setSeciliAlt(null);
    } else {
      setSeciliAlt((onceki) => (onceki === indeks ? null : indeks));
      setSeciliUst(null);
    }
  }

  function havuzdanEkle(id: BelgeCariAlanId) {
    const max = hedefBolum === 'ust' ? BELGE_CARI_ALAN_UST_MAX : altMax;
    if (duzen[hedefBolum].length >= max) return;
    setDuzen((onceki) => belgeCariAlanEkle(onceki, hedefBolum, id));
    const yeniIndeks = duzen[hedefBolum].length;
    if (hedefBolum === 'ust') setSeciliUst(yeniIndeks);
    else setSeciliAlt(yeniIndeks);
  }

  function seciliyiKaldir() {
    if (seciliIndeks == null) return;
    setDuzen((onceki) => belgeCariAlanCikar(onceki, hedefBolum, seciliIndeks));
    if (hedefBolum === 'ust') setSeciliUst(null);
    else setSeciliAlt(null);
  }

  function birAdim(yon: -1 | 1) {
    if (seciliIndeks == null) return;
    const liste = duzen[hedefBolum];
    const yeniIndeks = seciliIndeks + yon;
    if (yeniIndeks < 0 || yeniIndeks >= liste.length) return;
    setDuzen((onceki) => ({
      ...onceki,
      [hedefBolum]: belgeCariAlanSiradaTasi(onceki[hedefBolum], seciliIndeks, yeniIndeks),
    }));
    if (hedefBolum === 'ust') setSeciliUst(yeniIndeks);
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
    setHedefBolum(bolum);
    if (bolum === 'ust') {
      setSeciliUst(indeks);
      setSeciliAlt(null);
    } else {
      setSeciliAlt(indeks);
      setSeciliUst(null);
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    surukleHayaletAyarla(e, BELGE_CARI_ALAN_ETIKET[id]);
  }

  function onDragStartHavuz(e: DragEvent, id: BelgeCariAlanId) {
    const kaynak: SurukleKaynak = { tur: 'havuz', id };
    surukleRef.current = kaynak;
    setSurukle(kaynak);
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
      setHedefBolum(bolum);
      if (bolum === 'ust') setSeciliUst(indeks);
      else setSeciliAlt(indeks);
    } else if (kaynak.bolum === bolum) {
      setDuzen((onceki) => ({
        ...onceki,
        [bolum]: belgeCariAlanSiradaTasi(onceki[bolum], kaynak.indeks, indeks),
      }));
      setHedefBolum(bolum);
      if (bolum === 'ust') setSeciliUst(indeks);
      else setSeciliAlt(indeks);
    } else {
      setDuzen((onceki) => belgeCariAlanTakas(onceki, kaynak.bolum, kaynak.indeks, bolum, indeks));
      setHedefBolum(bolum);
      if (bolum === 'ust') {
        setSeciliUst(indeks);
        setSeciliAlt(null);
      } else {
        setSeciliAlt(indeks);
        setSeciliUst(null);
      }
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
    aciklama,
  }: {
    bolum: BelgeCariAlanBolum;
    baslik: string;
    max: number;
    idler: BelgeCariAlanId[];
    aciklama: string;
  }) {
    const secili = bolum === 'ust' ? seciliUst : seciliAlt;
    const aktifHedef = hedefBolum === bolum;
    return (
      <div
        className={`fatura-alan-yonet-liste fatura-alan-yonet-liste--${bolum}${aktifHedef ? ' fatura-alan-yonet-liste--hedef' : ''}`}
        onDragOver={(e) => onDragOverListe(e, bolum)}
        onDrop={(e) => onDropListeSonu(e, bolum)}
        onClick={() => setHedefBolum(bolum)}
      >
        <div className="fatura-alan-yonet-liste-baslik">
          <div className="fatura-alan-yonet-liste-baslik-sol">
            <strong>{baslik}</strong>
            <span className="fatura-alan-yonet-liste-aciklama">{aciklama}</span>
          </div>
          <span className="fatura-alan-yonet-adet">
            {idler.length}/{max}
          </span>
        </div>
        <ul className="fatura-alan-yonet-ul">
          {idler.length === 0 ? (
            <li className="fatura-alan-yonet-bos">Boş — alttan alan ekleyin</li>
          ) : (
            idler.map((id, indeks) => {
              const aktif = secili === indeks;
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
                  onClick={(e) => {
                    e.stopPropagation();
                    bolumSec(bolum, indeks);
                  }}
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

  const ustDolu = duzen.ust.length >= BELGE_CARI_ALAN_UST_MAX;
  const altDolu = duzen.alt.length >= altMax;
  const hedefDolu = hedefBolum === 'ust' ? ustDolu : altDolu;

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Alanları Yönet"
      altBaslik="Alan seç · sırala · alt düzenini ayarla"
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
        {/* Satır 1: üst önizleme | üst alanlar */}
        <section className="fatura-alan-yonet-onizle fatura-alan-yonet-onizle--ust" aria-label="Üst önizleme">
          <span className="fatura-alan-yonet-onizle-etiket">Üst görünüm</span>
          <div className="fatura-alan-yonet-onizle-ust">
            {duzen.ust.length === 0 ? (
              <span className="fatura-alan-yonet-chip fatura-alan-yonet-chip--bos">Alan yok</span>
            ) : (
              duzen.ust.map((id) => (
                <span key={`u-${id}`} className="fatura-alan-yonet-chip" title={BELGE_CARI_ALAN_ETIKET[id]}>
                  {BELGE_CARI_ALAN_ETIKET[id]}
                </span>
              ))
            )}
          </div>
          <p className="fatura-alan-yonet-onizle-uyari">
            Belgede yan yana durur — burada satır kırılması yalnızca önizlemedir.
          </p>
        </section>

        <Liste
          bolum="ust"
          baslik="Üst alanlar"
          max={BELGE_CARI_ALAN_UST_MAX}
          idler={duzen.ust}
          aciklama="Yan yana"
        />

        {/* Satır 2: alt düzen | üste/alta ekle */}
        <div className="fatura-alan-yonet-duzen" role="group" aria-label="Alt satır düzeni">
          <span className="fatura-alan-yonet-duzen-label">Alt düzen</span>
          <div className="fatura-alan-yonet-duzen-satir">
            {BELGE_CARI_ALT_DUZEN_SECENEKLERI.map((secenek) => {
              const aktif = aktifDuzenId === secenek.id;
              return (
                <button
                  key={secenek.id}
                  type="button"
                  className={`fatura-alan-yonet-duzen-pill${aktif ? ' fatura-alan-yonet-duzen-pill--aktif' : ''}`}
                  title={secenek.aciklama}
                  aria-pressed={aktif}
                  onClick={() => altDuzenSec(secenek.satirlar)}
                >
                  {secenek.etiket}
                </button>
              );
            })}
          </div>
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

        {/* Satır 3: alt önizleme | alt alanlar */}
        <section className="fatura-alan-yonet-onizle fatura-alan-yonet-onizle--alt" aria-label="Alt önizleme">
          <span className="fatura-alan-yonet-onizle-etiket">Alt görünüm</span>
          <div className="fatura-alan-yonet-onizle-alt">
            {duzen.alt.length === 0 ? (
              <span className="fatura-alan-yonet-chip fatura-alan-yonet-chip--bos">Alan yok</span>
            ) : (
              altSatirGruplari.map((satir, sira) => {
                const sutun = duzen.altSatirlar[sira] ?? satir.length;
                return (
                  <div
                    key={`as-${sira}`}
                    className="fatura-alan-yonet-alt-satir"
                    style={{ gridTemplateColumns: `repeat(${sutun}, minmax(0, 1fr))` }}
                  >
                    {satir.map((id) => (
                      <span
                        key={`a-${sira}-${id}`}
                        className="fatura-alan-yonet-chip"
                        title={BELGE_CARI_ALAN_ETIKET[id]}
                      >
                        {BELGE_CARI_ALAN_ETIKET[id]}
                      </span>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <Liste
          bolum="alt"
          baslik="Alt alanlar"
          max={altMax}
          idler={duzen.alt}
          aciklama={duzen.altSatirlar.join(' · ')}
        />

        {/* Alt şerit: havuz + araçlar */}
        <section className="fatura-alan-yonet-havuz">
          <div className="fatura-alan-yonet-havuz-baslik">
            <strong>Eklenecek alanlar</strong>
            <span>{havuz.length}</span>
          </div>
          <div className="fatura-alan-yonet-havuz-chip-ler">
            {havuz.length === 0 ? (
              <p className="fatura-alan-yonet-bos">Hepsi yerleşti</p>
            ) : (
              havuz.map((id) => {
                const surukleniyor = surukle?.tur === 'havuz' && surukle.id === id;
                return (
                  <button
                    key={`h-${id}`}
                    type="button"
                    className={`fatura-alan-yonet-havuz-chip${surukleniyor ? ' fatura-alan-yonet-havuz-chip--surukleniyor' : ''}${
                      hedefDolu ? ' fatura-alan-yonet-havuz-chip--kapali' : ''
                    }`}
                    disabled={hedefDolu}
                    draggable={!hedefDolu}
                    onDragStart={(e) => onDragStartHavuz(e, id)}
                    onDragEnd={onDragEnd}
                    onClick={() => havuzdanEkle(id)}
                    title={hedefDolu ? 'Seçili bölüm dolu' : `${BELGE_CARI_ALAN_ETIKET[id]} ekle`}
                  >
                    + {BELGE_CARI_ALAN_ETIKET[id]}
                  </button>
                );
              })
            )}
          </div>
        </section>

        <div className="fatura-alan-yonet-alt-bar">
          <div className="fatura-alan-yonet-araclar">
            <button
              type="button"
              className="ap-sistem-modal-btn fatura-alan-yonet-ok"
              disabled={seciliIndeks == null || seciliIndeks === 0}
              onClick={() => birAdim(-1)}
              title="Yukarı"
            >
              ▲
            </button>
            <button
              type="button"
              className="ap-sistem-modal-btn fatura-alan-yonet-ok"
              disabled={seciliIndeks == null || seciliIndeks >= duzen[hedefBolum].length - 1}
              onClick={() => birAdim(1)}
              title="Aşağı"
            >
              ▼
            </button>
            <button
              type="button"
              className="ap-sistem-modal-btn"
              disabled={seciliIndeks == null}
              onClick={seciliyiKaldir}
            >
              Kaldır
            </button>
          </div>
          <p className="fatura-alan-yonet-ipucu">
            Ortadaki hedefe göre alan ekle · sürükle veya ▲▼ ile sırala
          </p>
        </div>
      </div>
    </SistemModal>
  );
}
