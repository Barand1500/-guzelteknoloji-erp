export const LISANS_URUNLERI = [
  { id: 'sefim', ad: 'Şefim', seriOnek: 'SEF' },
  { id: 'sefim-paket', ad: 'Şefim Paket Servis', seriOnek: 'SPK' },
] as const;

export function urunAdiBul(urunId: string) {
  return LISANS_URUNLERI.find((u) => u.id === urunId)?.ad ?? urunId;
}

export function yeniSeriNo(urunId: string) {
  const urun = LISANS_URUNLERI.find((u) => u.id === urunId);
  const onek = urun?.seriOnek ?? 'LIS';
  const rastgele = Math.floor(100000 + Math.random() * 900000);
  return `${onek}-${rastgele}`;
}

export const ORNEK_LISANSLAR = [
  {
    id: 'lis-1',
    urun: 'sefim',
    seriNo: 'SEF-482910',
    kullaniciAdi: 'merkez_admin',
    parola: '••••••',
    isletmeKodu: 'GZ001',
    lisansAnahtari: 'SEFIM-XXXX-YYYY-ZZZZ-AAAA',
  },
  {
    id: 'lis-2',
    urun: 'sefim-paket',
    seriNo: 'SPK-719304',
    kullaniciAdi: 'paket_admin',
    parola: '••••••',
    isletmeKodu: 'GZ002',
    lisansAnahtari: 'SPKSRV-XXXX-YYYY-ZZZZ-BBBB',
  },
] as const;
