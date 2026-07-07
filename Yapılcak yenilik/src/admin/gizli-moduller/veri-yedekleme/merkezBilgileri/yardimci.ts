import type { SefimMerkezKayit } from '@/admin/gizli-moduller/veri-yedekleme/merkezBilgileri/tipler';
import { varsayilanSefimMerkezKayit } from '@/admin/gizli-moduller/veri-yedekleme/merkezBilgileri/tipler';

const STORAGE_KEY = 'restorant-sefim-merkez-bilgileri';

export function sefimMerkezKaydiOku(): SefimMerkezKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanSefimMerkezKayit();
    const parsed = JSON.parse(ham) as Partial<SefimMerkezKayit>;
    const varsayilan = varsayilanSefimMerkezKayit();
    return {
      sunucuIp: String(parsed.sunucuIp ?? varsayilan.sunucuIp),
      kullaniciAdi: String(parsed.kullaniciAdi ?? varsayilan.kullaniciAdi),
      kullaniciParola: String(parsed.kullaniciParola ?? varsayilan.kullaniciParola),
      veritabaniAdi: String(parsed.veritabaniAdi ?? varsayilan.veritabaniAdi),
      tamVeriAktarimi: Boolean(parsed.tamVeriAktarimi ?? varsayilan.tamVeriAktarimi),
    };
  } catch {
    return varsayilanSefimMerkezKayit();
  }
}

export function sefimMerkezKaydiKaydet(kayit: SefimMerkezKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}

export function sefimMerkezKayitEsit(a: SefimMerkezKayit, b: SefimMerkezKayit) {
  return (
    a.sunucuIp === b.sunucuIp &&
    a.kullaniciAdi === b.kullaniciAdi &&
    a.kullaniciParola === b.kullaniciParola &&
    a.veritabaniAdi === b.veritabaniAdi &&
    a.tamVeriAktarimi === b.tamVeriAktarimi
  );
}

export function sefimMerkezBaglantiGecerli(kayit: SefimMerkezKayit) {
  return (
    kayit.sunucuIp.trim().length > 0 &&
    kayit.kullaniciAdi.trim().length > 0 &&
    kayit.veritabaniAdi.trim().length > 0
  );
}
