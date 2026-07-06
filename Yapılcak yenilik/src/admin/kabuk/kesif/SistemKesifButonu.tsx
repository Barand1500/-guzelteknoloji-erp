import { useSistemKesif } from '@/baglamlar/SistemKesifContext';

export function SistemKesifButonu() {
  const { modalAc, turAktif } = useSistemKesif();

  return (
    <button
      type="button"
      className="ap-kesif-baslat-btn"
      onClick={modalAc}
      disabled={turAktif}
      data-ap-kesif="kesif-buton"
    >
      <span className="ap-kesif-baslat-parilti" aria-hidden="true" />
      ✨ Sistemi Keşfet
    </button>
  );
}
