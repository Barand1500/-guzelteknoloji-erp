import { useEffect, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  fiyatListesiHazirla,
  fiyatListesiKaydet,
  type FiyatListesiKaydi,
} from '@/admin/baslat-menusu/urunler-tanimlari/fiyatListesiTipler';

interface FiyatTanimlariModalProps {
  acik: boolean;
  baslik: string;
  altBaslik?: string;
  liste: FiyatListesiKaydi[];
  onKapat: () => void;
  onKaydet: (liste: FiyatListesiKaydi[]) => void;
}

export function FiyatTanimlariModal({
  acik,
  baslik,
  altBaslik,
  liste,
  onKapat,
  onKaydet,
}: FiyatTanimlariModalProps) {
  const [taslak, setTaslak] = useState<FiyatListesiKaydi[]>(() => fiyatListesiHazirla(liste));
  const [yeniListe, setYeniListe] = useState('');

  useEffect(() => {
    if (acik) setTaslak(fiyatListesiHazirla(liste));
  }, [acik, liste]);

  const satirGuncelle = (index: number, fiyat: number | null) => {
    setTaslak((onceki) => onceki.map((s, i) => (i === index ? { ...s, fiyat } : s)));
  };

  const listeEkle = () => {
    const ad = yeniListe.trim().toUpperCase();
    if (!ad) return;
    if (taslak.some((s) => s.listeAdi === ad)) {
      setYeniListe('');
      return;
    }
    setTaslak((onceki) => [...onceki, { listeAdi: ad, fiyat: null }]);
    setYeniListe('');
  };

  const listeSil = (index: number) => {
    setTaslak((onceki) => onceki.filter((_, i) => i !== index));
  };

  const kaydet = () => {
    onKaydet(fiyatListesiKaydet(taslak));
    onKapat();
  };

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik={baslik}
      altBaslik={altBaslik ?? 'Fiyat listesine göre özel fiyat tanımlayın'}
      ikon="💰"
      genislik="sm"
      baslikId="fiyat-tanimlari-modal"
      footer={
        <SistemModalAksiyonlar>
          <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil" onClick={onKapat}>
            İptal
          </button>
          <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil" onClick={kaydet}>
            Kaydet
          </button>
        </SistemModalAksiyonlar>
      }
    >
      <div className="ap-urun-fiyat-modal">
        <div className="ap-urun-fiyat-modal-tablo">
          <div className="ap-urun-fiyat-modal-baslik-satir">
            <span>Fiyat Listesi</span>
            <span>Fiyat</span>
            <span aria-hidden />
          </div>
          {taslak.map((satir, index) => (
            <div key={`${satir.listeAdi}-${index}`} className="ap-urun-fiyat-modal-satir">
              <span className="ap-urun-fiyat-modal-liste-ad">{satir.listeAdi}</span>
              <input
                type="number"
                className={formInputSinifi}
                value={satir.fiyat ?? ''}
                placeholder="—"
                step={0.01}
                min={0}
                onChange={(e) => {
                  const ham = e.target.value;
                  satirGuncelle(index, ham === '' ? null : Number(ham) || 0);
                }}
              />
              <button
                type="button"
                className="ap-urun-fiyat-modal-sil"
                onClick={() => listeSil(index)}
                title="Listeyi kaldır"
                aria-label={`${satir.listeAdi} listesini kaldır`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="ap-urun-fiyat-modal-ekle">
          <input
            className={formInputSinifi}
            value={yeniListe}
            onChange={(e) => setYeniListe(e.target.value)}
            placeholder="Yeni fiyat listesi adı…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                listeEkle();
              }
            }}
          />
          <button type="button" className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil" onClick={listeEkle}>
            Liste Ekle
          </button>
        </div>
      </div>
    </SistemModal>
  );
}

interface FiyatTanimlariButonuProps {
  liste: FiyatListesiKaydi[] | undefined;
  modalBaslik: string;
  modalAltBaslik?: string;
  onKaydet: (liste: FiyatListesiKaydi[]) => void;
}

export function FiyatTanimlariButonu({
  liste,
  modalBaslik,
  modalAltBaslik,
  onKaydet,
}: FiyatTanimlariButonuProps) {
  const [acik, setAcik] = useState(false);
  const ozelSayi = (liste ?? []).filter((k) => k.fiyat != null).length;

  return (
    <>
      <button
        type="button"
        className={`ap-urun-fiyat-tanim-tus ${ozelSayi > 0 ? 'ap-urun-fiyat-tanim-tus-dolu' : ''}`}
        onClick={() => setAcik(true)}
        title="Fiyat tanımları"
        aria-label="Fiyat tanımları"
      >
        <span aria-hidden>⋯</span>
        {ozelSayi > 0 && <span className="ap-urun-fiyat-tanim-rozet">{ozelSayi}</span>}
      </button>
      <FiyatTanimlariModal
        acik={acik}
        baslik={modalBaslik}
        altBaslik={modalAltBaslik}
        liste={liste ?? []}
        onKapat={() => setAcik(false)}
        onKaydet={onKaydet}
      />
    </>
  );
}
