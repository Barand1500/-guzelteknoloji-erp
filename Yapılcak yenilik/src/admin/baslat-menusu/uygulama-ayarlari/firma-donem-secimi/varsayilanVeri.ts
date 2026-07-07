export const FIRMA_SECENEKLERI = [
  { id: 'merkez', ad: 'Güzel Döner Merkez A.Ş.' },
  { id: 'kadikoy', ad: 'Güzel Döner Kadıköy Şubesi' },
] as const;

export const DONEM_SECENEKLERI: Record<string, { id: string; ad: string }[]> = {
  merkez: [
    { id: '2026-01', ad: '2026 / Ocak' },
    { id: '2026-02', ad: '2026 / Şubat' },
    { id: '2026-03', ad: '2026 / Mart' },
  ],
  kadikoy: [
    { id: '2026-01', ad: '2026 / Ocak' },
    { id: '2026-02', ad: '2026 / Şubat' },
  ],
};

export const DEPO_SECENEKLERI = [
  { id: 'ana-depo', ad: 'Ana Depo' },
  { id: 'mutfak-depo', ad: 'Mutfak Deposu' },
  { id: 'paket-depo', ad: 'Paket Deposu' },
] as const;

export const SUBE_SECENEKLERI = [
  { id: 'merkez-salon', ad: 'Merkez Salon' },
  { id: 'kadikoy-salon', ad: 'Kadıköy Salon' },
  { id: 'paket-servis', ad: 'Paket Servis' },
] as const;

export const KASA_SECENEKLERI = [
  { id: 'kasa-1', ad: 'Ana Kasa' },
  { id: 'kasa-2', ad: 'Paket Kasa' },
  { id: 'kasa-3', ad: 'Online Tahsilat' },
] as const;
