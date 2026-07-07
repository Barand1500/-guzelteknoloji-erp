export const ODEME_GRUBU_ONERILERI = [
  'Nakit',
  'Kredi Kartı',
  'Banka Kartı',
  'Yemek Kartı',
  'Online Ödeme',
  'Açık Hesap',
  'Ticket',
  'Diğer',
] as const;

export const ODEME_YONTEMI_ONERILERI = [
  'Nakit',
  'Kredi Kartı',
  'Banka Kartı',
  'Ticket',
  'Multinet',
  'Sodexo',
  'Setcard',
  'Metropol',
  'Online',
  'Havale / EFT',
  'Açık Hesap',
] as const;

export const UYGULAMA_ONERILERI = [
  'Kasa',
  'Garson',
  'Paket Servis',
  'Trendyol',
  'Getir',
  'Yemeksepeti',
  'Tümü',
] as const;

export type OdemeGrupAlan = 'odemeGrubu' | 'odemeYontemi' | 'uygulama';

export interface OdemeGrupSatiri {
  id: string;
  odemeGrubu: string;
  odemeYontemi: string;
  uygulama: string;
}

export interface OdemeGruplariKayit {
  satirlar: OdemeGrupSatiri[];
}

export function yeniOdemeGrupSatiri(): OdemeGrupSatiri {
  return {
    id: `og-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    odemeGrubu: '',
    odemeYontemi: '',
    uygulama: '',
  };
}

export function odemeGruplariKayitKopyala(k: OdemeGruplariKayit): OdemeGruplariKayit {
  return { satirlar: k.satirlar.map((s) => ({ ...s })) };
}

export function odemeGruplariKayitlariEsit(a: OdemeGruplariKayit, b: OdemeGruplariKayit): boolean {
  if (a.satirlar.length !== b.satirlar.length) return false;
  return a.satirlar.every((s, i) => {
    const t = b.satirlar[i];
    return (
      s.id === t.id &&
      s.odemeGrubu === t.odemeGrubu &&
      s.odemeYontemi === t.odemeYontemi &&
      s.uygulama === t.uygulama
    );
  });
}
