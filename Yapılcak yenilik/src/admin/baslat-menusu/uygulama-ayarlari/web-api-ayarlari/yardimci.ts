import type { WebApiKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/web-api-ayarlari/tipler';
import { varsayilanWebApiKayit } from '@/admin/baslat-menusu/uygulama-ayarlari/web-api-ayarlari/tipler';

const STORAGE_KEY = 'restorant-web-api-ayarlari';

export function webApiKaydiOku(): WebApiKayit {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanWebApiKayit();
    const parsed = JSON.parse(ham) as Partial<WebApiKayit>;
    const varsayilan = varsayilanWebApiKayit();
    return {
      sunucuIp: String(parsed.sunucuIp ?? varsayilan.sunucuIp),
      veritabaniAdi: String(parsed.veritabaniAdi ?? varsayilan.veritabaniAdi),
      kullaniciAdi: String(parsed.kullaniciAdi ?? varsayilan.kullaniciAdi),
      kullaniciParola: String(parsed.kullaniciParola ?? varsayilan.kullaniciParola),
      tokenUrl: String(parsed.tokenUrl ?? varsayilan.tokenUrl),
      servisUrl: String(parsed.servisUrl ?? varsayilan.servisUrl),
      vePosDbAdi: String(parsed.vePosDbAdi ?? varsayilan.vePosDbAdi),
      dailyBillNumberWithDatePrefix: Boolean(
        parsed.dailyBillNumberWithDatePrefix ?? varsayilan.dailyBillNumberWithDatePrefix
      ),
      telsamCalls: Boolean(parsed.telsamCalls ?? varsayilan.telsamCalls),
      transferUseMatching: Boolean(parsed.transferUseMatching ?? varsayilan.transferUseMatching),
      transferOptions: Boolean(parsed.transferOptions ?? varsayilan.transferOptions),
    };
  } catch {
    return varsayilanWebApiKayit();
  }
}

export function webApiKaydiKaydet(kayit: WebApiKayit) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kayit));
}

export function webApiKayitEsit(a: WebApiKayit, b: WebApiKayit) {
  return (
    a.sunucuIp === b.sunucuIp &&
    a.veritabaniAdi === b.veritabaniAdi &&
    a.kullaniciAdi === b.kullaniciAdi &&
    a.kullaniciParola === b.kullaniciParola &&
    a.tokenUrl === b.tokenUrl &&
    a.servisUrl === b.servisUrl &&
    a.vePosDbAdi === b.vePosDbAdi &&
    a.dailyBillNumberWithDatePrefix === b.dailyBillNumberWithDatePrefix &&
    a.telsamCalls === b.telsamCalls &&
    a.transferUseMatching === b.transferUseMatching &&
    a.transferOptions === b.transferOptions
  );
}

export function webApiKayitGecerli(kayit: WebApiKayit) {
  return (
    kayit.sunucuIp.trim().length > 0 &&
    kayit.veritabaniAdi.trim().length > 0 &&
    kayit.tokenUrl.trim().length > 0 &&
    kayit.servisUrl.trim().length > 0
  );
}
