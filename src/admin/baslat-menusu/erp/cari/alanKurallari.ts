import { adGecerliMi } from '@/admin/baslat-menusu/tanimlar/alanKurallari';
import type { CariFormDegeri, CariKartForm } from '@/admin/baslat-menusu/erp/cari/tipler';
import { kartFormdanApiForm } from '@/admin/baslat-menusu/erp/cari/cariYardimci';

export function cariKodGecerliMi(deger: string): boolean {
  const v = deger.trim();
  return v.length > 0 && v.length <= 30;
}

export function cariVergiNoGecerliMi(deger: string, isletmeTuru: string): boolean {
  const v = deger.trim();
  if (!v) return true;
  if (isletmeTuru === 'GERCEK') return /^\d{11}$/.test(v);
  return /^\d{10}$/.test(v);
}

export function cariFormDogrula(form: CariFormDegeri): string | null {
  if (!form.cariTipi) return 'Cari tipi zorunludur';
  if (!cariKodGecerliMi(form.cariKodu)) return 'Cari kodu zorunludur (en fazla 30 karakter)';
  if (!adGecerliMi(form.cariAdi, 255)) return 'Cari adı zorunludur (en fazla 255 karakter)';
  if (form.isletmeTuru && !['TUZEL', 'GERCEK'].includes(form.isletmeTuru) && form.isletmeTuru.length > 40) {
    return 'İşletme türü çok uzun';
  }
  if (!cariVergiNoGecerliMi(form.vergiNo, form.isletmeTuru)) {
    if (form.isletmeTuru === 'GERCEK') {
      return 'Gerçek kişi için vergi no (T.C.) 11 haneli olmalıdır';
    }
    return 'Vergi no 10 haneli olmalıdır (yalnızca rakam)';
  }
  return null;
}

export function cariKartFormDogrula(form: CariKartForm): string | null {
  if (!form.kartTipi.trim()) return 'Kart tipi zorunludur';
  if (!cariKodGecerliMi(form.firmaKodu)) return 'Firma kodu zorunludur (en fazla 30 karakter)';
  if (!adGecerliMi(form.firmaAdi, 255)) return 'Firma adı zorunludur (en fazla 255 karakter)';
  return cariFormDogrula(kartFormdanApiForm(form));
}
