import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import { useSistemKesifOptional } from '@/baglamlar/SistemKesifContext';
import { AdminProfilModal } from '@/admin/ortak/AdminProfilModal';
import { BaslatMenu } from './baslat-menusu/BaslatMenu';
import { UstSekmeCubugu } from './sekme-cubugu/UstSekmeCubugu';
import type { AdminModul, AdminSekme } from '@/admin/ortak/tipler/admin';
import type { SekmeSagTikIslem } from '@/admin/kabuk/sekme-cubugu/sekmeSagTikYardimci';

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
  const { kullanici } = useAuth();
  const kesif = useSistemKesifOptional();
  const [menuAcikIc, setMenuAcikIc] = useState(false);
  const [profilAcik, setProfilAcik] = useState(false);
  const baslatBtnRef = useRef<HTMLButtonElement>(null);

  const menuAcik = disBaslatMenuAcik ?? menuAcikIc;
  const menuAcikDegistir = onBaslatMenuAcikDegistir ?? setMenuAcikIc;

  useEffect(() => {
    kesif?.baslatMenuKaydet(
      () => menuAcikDegistir(true),
      () => menuAcikDegistir(false)
    );
  }, [kesif, menuAcikDegistir]);

  const basHarf = kullanici?.ad?.charAt(0).toUpperCase() ?? '?';

  return (
    <>
      <header
        className={`ap-header flex h-12 shrink-0 items-stretch border-b${menuAcik ? ' ap-header--baslat-acik' : ''}`}
      >
        <button
          ref={baslatBtnRef}
          type="button"
          onClick={() => menuAcikDegistir(!menuAcik)}
          className={`ap-baslat-menu-btn ap-baslat-menu-btn--dikdortgen relative flex w-14 shrink-0 items-center justify-center ${menuAcik ? 'ap-baslat-menu-btn--dikdortgen-aktif ap-baslat-menu-btn--kenarlik-aktif' : 'border-r border-[var(--ap-border)] hover:bg-[var(--ap-hover)]'}`}
          title="Başlat menüsü"
          data-ap-kesif="baslat-menu"
          aria-expanded={menuAcik}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
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

        <div className="flex items-center gap-3 border-l border-[var(--ap-border)] px-4">
          <button
            type="button"
            onClick={() => setProfilAcik(true)}
            className="ap-profil-btn"
            title="Profil ayarları"
          >
            <span className="ap-profil-avatar">{basHarf}</span>
            <span className="ap-profil-ad hidden sm:block">{kullanici?.ad ?? 'Profil'}</span>
            <svg viewBox="0 0 20 20" className="ap-profil-ok hidden h-3.5 w-3.5 opacity-60 sm:block" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </header>

      <AdminProfilModal acik={profilAcik} onKapat={() => setProfilAcik(false)} />

      <BaslatMenu
        acik={menuAcik}
        onKapat={() => menuAcikDegistir(false)}
        onModulSec={onModulSec}
        baslatButonRef={baslatBtnRef}
      />
    </>
  );
}
