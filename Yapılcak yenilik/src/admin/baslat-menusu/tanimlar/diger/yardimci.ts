import { varsayilanTanimlarDigerForm, type TanimlarDigerForm } from '@/admin/baslat-menusu/tanimlar/diger/tipler';

const STORAGE_KEY = 'restorant-tanimlar-diger';

export function tanimlarDigerOku(): TanimlarDigerForm {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanTanimlarDigerForm();
    const parsed = JSON.parse(ham) as Partial<TanimlarDigerForm>;
    return { ...varsayilanTanimlarDigerForm(), ...parsed };
  } catch {
    return varsayilanTanimlarDigerForm();
  }
}

export function tanimlarDigerKaydet(form: TanimlarDigerForm) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
}

export function tanimlarDigerFormEsit(a: TanimlarDigerForm, b: TanimlarDigerForm): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
