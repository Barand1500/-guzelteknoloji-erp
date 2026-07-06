import { GECERLI_YETKILER } from './mappers.js';
import { tokenUret } from './jwt.js';

export function mockAuthAktif(): boolean {
  const deger = process.env.MOCK_AUTH?.trim().toLowerCase();
  return deger === '1' || deger === 'true' || deger === 'yes';
}

export const MOCK_OTURUM_SECENEKLERI = {
  firmalar: [
    {
      id: 1,
      firmaKodu: 'F001',
      firmaAdi: 'GUZEL IC VE DIS TICARET LIMITED SIRKETI',
      donemler: [{ id: 1, donemKodu: 'D001', donemAdi: '2026' }],
      subeler: [
        {
          id: 1,
          subeKodu: 'MERKEZ',
          subeAdi: 'MERKEZ',
          kasalar: [{ id: 1, kasaKodu: 'MERKEZ', kasaAdi: 'MERKEZ' }],
        },
      ],
    },
  ],
  kullaniciKodlari: [process.env.SEED_ADMIN_KODU?.trim().toUpperCase() || 'ADMIN'],
};

export function mockGirisDogrula(kullaniciKodu: string, sifre: string): boolean {
  const kod = (process.env.SEED_ADMIN_KODU ?? 'ADMIN').trim().toUpperCase();
  const pass = process.env.SEED_ADMIN_PASSWORD ?? 'eRc241016!';
  return kullaniciKodu.trim().toUpperCase() === kod && sifre === pass;
}

export function mockKullaniciYanit(kullaniciKodu?: string) {
  const kod = kullaniciKodu?.trim().toUpperCase() || process.env.SEED_ADMIN_KODU?.trim().toUpperCase() || 'ADMIN';
  return {
    id: 1,
    kullaniciKodu: kod,
    ad: 'ERCAN GUZEL',
    rol: 'YONETICI',
    yetkiler: [...GECERLI_YETKILER],
    oturum: {
      firmaKodu: 'F001',
      firmaAdi: 'GUZEL IC VE DIS TICARET LIMITED SIRKETI',
      donemKodu: 'D001',
      donemAdi: '2026',
      subeKodu: 'MERKEZ',
      subeAdi: 'MERKEZ',
      kasaKodu: 'MERKEZ',
      kasaAdi: 'MERKEZ',
    },
  };
}

export function mockGirisYanit(kullaniciKodu?: string) {
  return {
    token: tokenUret(1, kullaniciKodu?.trim().toUpperCase() || 'ADMIN'),
    kullanici: mockKullaniciYanit(kullaniciKodu),
  };
}

export function mockTokenMi(sub: string): boolean {
  return sub === '1';
}
