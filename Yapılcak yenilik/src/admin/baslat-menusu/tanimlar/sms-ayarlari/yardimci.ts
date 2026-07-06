import {
  varsayilanTanimlarSmsAyarlariForm,
  type TanimlarSmsAyarlariForm,
} from '@/admin/baslat-menusu/tanimlar/sms-ayarlari/tipler';

const STORAGE_KEY = 'restorant-tanimlar-sms-ayarlari';

export function tanimlarSmsAyarlariOku(): TanimlarSmsAyarlariForm {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanTanimlarSmsAyarlariForm();
    const parsed = JSON.parse(ham) as Partial<TanimlarSmsAyarlariForm>;
    return { ...varsayilanTanimlarSmsAyarlariForm(), ...parsed };
  } catch {
    return varsayilanTanimlarSmsAyarlariForm();
  }
}

export function tanimlarSmsAyarlariKaydet(form: TanimlarSmsAyarlariForm) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
}

export function tanimlarSmsAyarlariFormEsit(a: TanimlarSmsAyarlariForm, b: TanimlarSmsAyarlariForm): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
