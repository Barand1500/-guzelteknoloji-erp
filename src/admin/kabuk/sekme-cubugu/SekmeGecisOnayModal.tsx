import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';

interface SekmeGecisOnayModalProps {
  acik: boolean;
  yukleniyor?: boolean;
  onKapat: () => void;
  onKaydetVeGec: () => void;
  onKaydetmedenGec: () => void;
}

export function SekmeGecisOnayModal({
  acik,
  yukleniyor,
  onKapat,
  onKaydetVeGec,
  onKaydetmedenGec,
}: SekmeGecisOnayModalProps) {
  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik="Sekme değiştirilsin mi?"
      altBaslik="Bu sekmede kaydedilmemiş değişiklikler var. Diğer sekmeye geçmeden önce nasıl devam edilsin?"
      ikon="📝"
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
            onClick={onKaydetmedenGec}
            disabled={yukleniyor}
          >
            Kaydetmeden Geç
          </button>
          <button
            type="button"
            className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil"
            onClick={onKaydetVeGec}
            disabled={yukleniyor}
          >
            {yukleniyor ? 'Kaydediliyor…' : 'Kaydet ve Geç'}
          </button>
        </SistemModalAksiyonlar>
      }
    >
      <p className="ap-muted text-sm leading-relaxed">
        Kaydet ve Geç seçeneği değişiklikleri kaydedip diğer sekmeye taşır. Kaydetmeden Geç seçeneği kaydedilmemiş
        değişiklikleri bırakarak sekme değiştirir.
      </p>
    </SistemModal>
  );
}
