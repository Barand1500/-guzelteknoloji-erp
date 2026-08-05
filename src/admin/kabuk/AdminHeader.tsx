import { useEffect, useRef, useState } from 'react';
import { useSistemKesifOptional } from '@/baglamlar/SistemKesifContext';
import { AdminProfilModal } from '@/admin/ortak/AdminProfilModal';
import { BaslatMenu } from './baslat-menusu/BaslatMenu';
import { UstSekmeCubugu } from './sekme-cubugu/UstSekmeCubugu';
import type { AdminModul, AdminSekme } from '@/admin/ortak/tipler/admin';
import type { SekmeSagTikIslem } from '@/admin/kabuk/sekme-cubugu/sekmeSagTikYardimci';
import { sekmeAyarlariOku, sekmeTabCssDegiskenleri } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';

interface AdminHeaderProps {
  sekmeler: AdminSekme[];
  aktifSekmeId: string;
  kapananGecmisSayisi?: number;
  onSekmeSec: (id: string) => void;
  onSekmeKapat: (id: string) => void;
  onSekmeTasi: (kaynakId: string, hedefId: string, mod: 'once' | 'sonra') => void;
  onSekmeBirlestir: (kaynakId: string, hedefId: string) => void;
  onModulSec: (modul: AdminModul) => void;
  onSekmeAyir?: (sekmeId: string) => void;
  onSekmeSagTikIslem?: (sekmeId: string, islem: SekmeSagTikIslem) => void;
  baslatMenuAcik?: boolean;
  onBaslatMenuAcikDegistir?: (acik: boolean) => void;
}

export function AdminHeader({
  sekmeler,
  aktifSekmeId,
  kapananGecmisSayisi = 0,
  onSekmeSec,
  onSekmeKapat,
  onSekmeTasi,
  onSekmeBirlestir,
  onModulSec,
  onSekmeAyir,
  onSekmeSagTikIslem,
  baslatMenuAcik: disBaslatMenuAcik,
  onBaslatMenuAcikDegistir,
}: AdminHeaderProps) {
  const kesif = useSistemKesifOptional();
  const [menuAcikIc, setMenuAcikIc] = useState(false);
  const [profilAcik, setProfilAcik] = useState(false);
  const [kareYerlesim, setKareYerlesim] = useState(() => sekmeAyarlariOku().sekmeYerlesim === 'kare');
  const baslatBtnRef = useRef<HTMLButtonElement>(null);

  const menuAcik = disBaslatMenuAcik ?? menuAcikIc;
  const menuAcikDegistir = onBaslatMenuAcikDegistir ?? setMenuAcikIc;
  const headerStil = kareYerlesim ? sekmeTabCssDegiskenleri(sekmeAyarlariOku()) : undefined;

  useEffect(() => {
    kesif?.baslatMenuKaydet(
      () => menuAcikDegistir(true),
      () => menuAcikDegistir(false)
    );
  }, [kesif, menuAcikDegistir]);

  useEffect(() => {
    const guncelle = () => setKareYerlesim(sekmeAyarlariOku().sekmeYerlesim === 'kare');
    window.addEventListener('ap-sekme-ayarlari-guncellendi', guncelle);
    return () => window.removeEventListener('ap-sekme-ayarlari-guncellendi', guncelle);
  }, []);

  const profilAc = () => {
    menuAcikDegistir(false);
    setProfilAcik(true);
  };

  return (
    <>
      <header
        className={`ap-header flex h-12 shrink-0 border-b ${kareYerlesim ? 'ap-header--sekme-kare items-end' : 'items-stretch'}${
          menuAcik ? ' ap-header--baslat-acik' : ''
        }`}
        style={headerStil}
      >
        <button
          ref={baslatBtnRef}
          type="button"
          onClick={() => menuAcikDegistir(!menuAcik)}
          className={
            kareYerlesim
              ? `ap-baslat-menu-btn ap-baslat-menu-btn--kare relative shrink-0 ${menuAcik ? 'ap-baslat-menu-btn--kare-aktif ap-baslat-menu-btn--kenarlik-aktif' : ''}`
              : `ap-baslat-menu-btn ap-baslat-menu-btn--dikdortgen relative flex w-14 shrink-0 items-center justify-center ${menuAcik ? 'ap-baslat-menu-btn--dikdortgen-aktif ap-baslat-menu-btn--kenarlik-aktif' : 'border-r border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'}`
          }
          title="Başlat Menüsü"
          data-ap-kesif="baslat-menu"
          aria-expanded={menuAcik}
        >
          <svg viewBox="0 0 24 24" className={kareYerlesim ? 'ap-baslat-menu-btn-ikon' : 'h-5 w-5'} fill="currentColor" aria-hidden>
            <rect x="3" y="3" width="8" height="8" rx="1" />
            <rect x="13" y="3" width="8" height="8" rx="1" />
            <rect x="3" y="13" width="8" height="8" rx="1" />
            <rect x="13" y="13" width="8" height="8" rx="1" />
          </svg>
        </button>

        <UstSekmeCubugu
          sekmeler={sekmeler}
          aktifSekmeId={aktifSekmeId}
          kapananGecmisSayisi={kapananGecmisSayisi}
          onSekmeSec={onSekmeSec}
          onSekmeKapat={onSekmeKapat}
          onSekmeTasi={onSekmeTasi}
          onSekmeBirlestir={onSekmeBirlestir}
          onSekmeAyir={onSekmeAyir}
          onSekmeSagTikIslem={onSekmeSagTikIslem}
          baslatMenuAcik={menuAcik}
        />
      </header>

      <AdminProfilModal acik={profilAcik} onKapat={() => setProfilAcik(false)} />

      <BaslatMenu
        acik={menuAcik}
        onKapat={() => menuAcikDegistir(false)}
        onModulSec={onModulSec}
        onProfilAc={profilAc}
        baslatButonRef={baslatBtnRef}
        kareMod={kareYerlesim}
      />
    </>
  );
}
