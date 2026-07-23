import type {
  AdminDepo,
  AdminDonem,
  AdminFirma,
  AdminKasa,
  AdminSube,
  TanimSekmeId,
} from '@/admin/baslat-menusu/tanimlar/tipler';

export type KayitTipi = TanimSekmeId;

export interface TanimSatir {
  id: string;
  tip: KayitTipi;
  kod: string;
  ad: string;
  /** Tip’e göre tek bağlam: dönem adı veya şube adı */
  baglamMetin: string;
  aktif: boolean;
  olusturma: string;
  guncelleme: string;
  firmaId: string;
  subeId?: string;
  kayit: AdminFirma | AdminSube | AdminDepo | AdminKasa | AdminDonem;
}

export type SilmeHedef =
  | { tip: 'firma'; kayit: AdminFirma }
  | { tip: 'sube'; kayit: AdminSube }
  | { tip: 'depo'; kayit: AdminDepo }
  | { tip: 'kasa'; kayit: AdminKasa }
  | { tip: 'donem'; kayit: AdminDonem };

export const TIP_ETIKET: Record<KayitTipi, string> = {
  firma: 'Firma',
  sube: 'Şube',
  depo: 'Depo',
  kasa: 'Kasa',
  donem: 'Dönem',
};

export const TIP_SIRASI: Record<KayitTipi, number> = {
  firma: 0,
  donem: 1,
  sube: 2,
  depo: 3,
  kasa: 4,
};

export const EKLE_BUTONLARI: { tip: KayitTipi; etiket: string; ikon: string }[] = [
  { tip: 'firma', etiket: 'Firma', ikon: '🏢' },
  { tip: 'sube', etiket: 'Şube', ikon: '🏪' },
  { tip: 'depo', etiket: 'Depo', ikon: '📦' },
  { tip: 'kasa', etiket: 'Kasa', ikon: '💰' },
  { tip: 'donem', etiket: 'Dönem', ikon: '📅' },
];

export const TIP_FILTRE_SECENEKLER = [
  { value: '', label: 'Tümü' },
  { value: 'firma', label: 'Firma' },
  { value: 'sube', label: 'Şube' },
  { value: 'depo', label: 'Depo' },
  { value: 'kasa', label: 'Kasa' },
  { value: 'donem', label: 'Dönem' },
];
