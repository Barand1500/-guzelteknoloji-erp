import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';

interface SekmeKapatOnayModalProps {
  acik: boolean;
  kirliSayisi: number;
  yukleniyor?: boolean;
  onKapat: () => void;
  onKaydetVeKapat: () => void;
  onKaydetmedenKapat: () => void;
}

export function SekmeKapatOnayModal({
  acik,
  kirliSayisi,
  yukleniyor,
  onKapat,
  onKaydetVeKapat,
  onKaydetmedenKapat,
}: SekmeKapatOnayModalProps) {
  const metin =
    kirliSayisi === 1
      ? 'Kapatılacak sekmede kaydedilmemiş değişiklik var. Değişiklikler kaydedilsin mi?'
      : `Kapatılacak ${kirliSayisi} sekmede kaydedilmemiş değişiklik var. Değişiklikler kaydedilsin mi?`;

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Kaydedilmemiş değişiklikler"
      altBaslik={metin}
      ikon="⚠️"
      genislik="sm"
      kapatmaDevreDisi={yukleniyor}
      footer={
        <SistemModalAksiyonlar>
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ghost"
            onClick={onKapat}
            disabled={yukleniyor}
          >
            İptal
          </button>
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
            onClick={onKaydetmedenKapat}
            disabled={yukleniyor}
          >
            Kaydetmeden Kapat
          </button>
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil"
            onClick={onKaydetVeKapat}
            disabled={yukleniyor}
          >
            {yukleniyor ? 'Kaydediliyor…' : 'Kaydet ve Kapat'}
          </button>
        </SistemModalAksiyonlar>
      }
    >
      <p className="ap-muted text-sm leading-relaxed">
        Evet derseniz ilgili sekmeler kaydedilip kapatılır. Kaydetmeden Kapat seçeneği değişiklikleri
        kaybetmeden kapatır.
      </p>
    </SistemModal>
  );
}
