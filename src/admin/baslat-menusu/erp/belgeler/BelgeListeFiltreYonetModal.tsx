import { useEffect, useMemo, useState } from 'react';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  LISTE_FILTRE_VARSAYILAN,
  LISTE_TARIH_ETIKET,
  LISTE_TARIH_HAVUZ,
  LISTE_TARIH_SECILI_MAX,
  LISTE_UST_BILESEN_ETIKET,
  LISTE_UST_BILESEN_HAVUZ,
  belgeListeFiltreDuzeniDuzelt,
  belgeListeFiltreDuzeniKaydet,
  belgeListeSiradaTasi,
  type BelgeListeFiltreDuzeni,
  type ListeTarihDonemSecilebilir,
  type ListeUstBilesenId,
} from './belgeListeFiltreDuzeni';

interface BelgeListeFiltreYonetModalProps {
  acik: boolean;
  baslangic: BelgeListeFiltreDuzeni;
  onKapat: () => void;
  onKaydet: (duzen: BelgeListeFiltreDuzeni) => void;
}

export function BelgeListeFiltreYonetModal({
  acik,
  baslangic,
  onKapat,
  onKaydet,
}: BelgeListeFiltreYonetModalProps) {
  const [ust, setUst] = useState<ListeUstBilesenId[]>(baslangic.ustBilesenler);
  const [tarih, setTarih] = useState<ListeTarihDonemSecilebilir[]>(baslangic.tarihFiltreleri);
  const [aktifUst, setAktifUst] = useState<number | null>(null);
  const [aktifTarih, setAktifTarih] = useState<number | null>(null);

  useEffect(() => {
    if (!acik) return;
    const temiz = belgeListeFiltreDuzeniDuzelt(baslangic);
    setUst(temiz.ustBilesenler);
    setTarih(temiz.tarihFiltreleri);
    setAktifUst(null);
    setAktifTarih(null);
  }, [acik, baslangic]);

  const ustHavuz = useMemo(
    () => LISTE_UST_BILESEN_HAVUZ.filter((d) => !ust.includes(d.id)),
    [ust]
  );
  const tarihHavuz = useMemo(
    () => LISTE_TARIH_HAVUZ.filter((d) => !tarih.includes(d.id)),
    [tarih]
  );
  const tarihDolu = tarih.length >= LISTE_TARIH_SECILI_MAX;

  function kaydet() {
    const temiz = belgeListeFiltreDuzeniKaydet({ ustBilesenler: ust, tarihFiltreleri: tarih });
    onKaydet(temiz);
    onKapat();
  }

  function varsayilan() {
    setUst([...LISTE_FILTRE_VARSAYILAN.ustBilesenler]);
    setTarih([...LISTE_FILTRE_VARSAYILAN.tarihFiltreleri]);
    setAktifUst(null);
    setAktifTarih(null);
  }

  function ustEkle(id: ListeUstBilesenId) {
    if (ust.includes(id)) return;
    setUst((onceki) => [...onceki, id]);
  }

  function ustKaldir(indeks: number) {
    setUst((onceki) => onceki.filter((_, i) => i !== indeks));
    setAktifUst(null);
  }

  function ustBirAdim(yon: -1 | 1) {
    if (aktifUst == null) return;
    const yeni = aktifUst + yon;
    if (yeni < 0 || yeni >= ust.length) return;
    setUst((onceki) => belgeListeSiradaTasi(onceki, aktifUst, yeni));
    setAktifUst(yeni);
  }

  function tarihEkle(id: ListeTarihDonemSecilebilir) {
    if (tarihDolu || tarih.includes(id)) return;
    setTarih((onceki) => [...onceki, id]);
  }

  function tarihKaldir(indeks: number) {
    setTarih((onceki) => onceki.filter((_, i) => i !== indeks));
    setAktifTarih(null);
  }

  function tarihBirAdim(yon: -1 | 1) {
    if (aktifTarih == null) return;
    const yeni = aktifTarih + yon;
    if (yeni < 0 || yeni >= tarih.length) return;
    setTarih((onceki) => belgeListeSiradaTasi(onceki, aktifTarih, yeni));
    setAktifTarih(yeni);
  }

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Filtreleri Düzenle"
      genislik="lg"
      ustCizgi={false}
      disariTiklaKapat={false}
      footer={
        <SistemModalAksiyonlar>
          <button type="button" className="ap-sistem-modal-btn" onClick={varsayilan}>
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
      <div className="fatura-liste-filtre-yonet">
        <section className="fatura-liste-filtre-yonet-kart">
          <div className="fatura-liste-filtre-yonet-baslik">
            <strong>Üst bar</strong>
            <span>
              {ust.length}/{LISTE_UST_BILESEN_HAVUZ.length}
            </span>
          </div>

          <div className="fatura-liste-filtre-yonet-satir">
            <ul className="fatura-liste-filtre-yonet-ul fatura-liste-filtre-yonet-ul--yatay">
              {ust.map((id, indeks) => (
                <li
                  key={id}
                  className={`fatura-liste-filtre-yonet-oge${aktifUst === indeks ? ' fatura-liste-filtre-yonet-oge--aktif' : ''}`}
                  onClick={() => setAktifUst((onceki) => (onceki === indeks ? null : indeks))}
                >
                  <span className="fatura-liste-filtre-yonet-sira">{indeks + 1}</span>
                  <span className="fatura-liste-filtre-yonet-ad">{LISTE_UST_BILESEN_ETIKET[id]}</span>
                  <button
                    type="button"
                    className="fatura-liste-filtre-yonet-kaldir"
                    onClick={(e) => {
                      e.stopPropagation();
                      ustKaldir(indeks);
                    }}
                    title="Kaldır"
                  >
                    ×
                  </button>
                </li>
              ))}
              {ust.length === 0 ? (
                <li className="fatura-liste-filtre-yonet-bos">Alttan öğe ekleyin</li>
              ) : null}
            </ul>
            <div className="fatura-liste-filtre-yonet-araclar">
              <button
                type="button"
                className="ap-sistem-modal-btn"
                disabled={aktifUst == null || aktifUst === 0}
                onClick={() => ustBirAdim(-1)}
                title="Sola taşı"
              >
                ◀
              </button>
              <button
                type="button"
                className="ap-sistem-modal-btn"
                disabled={aktifUst == null || aktifUst >= ust.length - 1}
                onClick={() => ustBirAdim(1)}
                title="Sağa taşı"
              >
                ▶
              </button>
            </div>
          </div>

          {ustHavuz.length > 0 ? (
            <div className="fatura-liste-filtre-yonet-alt">
              <span className="fatura-liste-filtre-yonet-alt-etiket">Eklenebilir</span>
              <div className="fatura-liste-filtre-yonet-havuz">
                {ustHavuz.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="fatura-liste-filtre-yonet-chip"
                    onClick={() => ustEkle(d.id)}
                    title={d.aciklama}
                  >
                    + {d.etiket}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <div className="fatura-liste-filtre-yonet-tarih-grid">
          <section className="fatura-liste-filtre-yonet-kart">
            <div className="fatura-liste-filtre-yonet-baslik">
              <strong>Tarih filtreleri</strong>
              <span>
                {tarih.length}/{LISTE_TARIH_SECILI_MAX}
              </span>
            </div>
            <ul className="fatura-liste-filtre-yonet-ul">
              <li className="fatura-liste-filtre-yonet-oge fatura-liste-filtre-yonet-oge--sabit">
                <span className="fatura-liste-filtre-yonet-sira">1</span>
                <span className="fatura-liste-filtre-yonet-ad">{LISTE_TARIH_ETIKET.HEPSI}</span>
                <span className="fatura-liste-filtre-yonet-sabit-etiket">Sabit</span>
              </li>
              {tarih.map((id, indeks) => (
                <li
                  key={id}
                  className={`fatura-liste-filtre-yonet-oge${aktifTarih === indeks ? ' fatura-liste-filtre-yonet-oge--aktif' : ''}`}
                  onClick={() => setAktifTarih((onceki) => (onceki === indeks ? null : indeks))}
                >
                  <span className="fatura-liste-filtre-yonet-sira">{indeks + 2}</span>
                  <span className="fatura-liste-filtre-yonet-ad">{LISTE_TARIH_ETIKET[id]}</span>
                  <button
                    type="button"
                    className="fatura-liste-filtre-yonet-kaldir"
                    onClick={(e) => {
                      e.stopPropagation();
                      tarihKaldir(indeks);
                    }}
                    title="Kaldır"
                  >
                    ×
                  </button>
                </li>
              ))}
              {tarih.length === 0 ? (
                <li className="fatura-liste-filtre-yonet-bos">Sağdan filtre ekleyin</li>
              ) : null}
            </ul>
            <div className="fatura-liste-filtre-yonet-araclar">
              <button
                type="button"
                className="ap-sistem-modal-btn"
                disabled={aktifTarih == null || aktifTarih === 0}
                onClick={() => tarihBirAdim(-1)}
              >
                ▲
              </button>
              <button
                type="button"
                className="ap-sistem-modal-btn"
                disabled={aktifTarih == null || aktifTarih >= tarih.length - 1}
                onClick={() => tarihBirAdim(1)}
              >
                ▼
              </button>
            </div>
          </section>

          <section className="fatura-liste-filtre-yonet-kart">
            <div className="fatura-liste-filtre-yonet-baslik">
              <strong>Eklenebilir</strong>
              <span>{tarihHavuz.length}</span>
            </div>
            <div className="fatura-liste-filtre-yonet-havuz">
              {tarihHavuz.length === 0 ? (
                <p className="fatura-liste-filtre-yonet-bos">Hepsi eklendi</p>
              ) : (
                tarihHavuz.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="fatura-liste-filtre-yonet-chip"
                    disabled={tarihDolu}
                    onClick={() => tarihEkle(d.id)}
                    title={tarihDolu ? 'En fazla 5 filtre' : `${d.etiket} ekle`}
                  >
                    + {d.etiket}
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </SistemModal>
  );
}
