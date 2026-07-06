import {
  bosDizaynSatir,
  varsayilanTanimlarGenelForm,
  type TanimlarGenelForm,
} from '@/admin/baslat-menusu/tanimlar/genel/tipler';
import { MARKA_SATIR_ALANLARI } from '@/admin/baslat-menusu/tanimlar/genel/veri';

const STORAGE_KEY = 'restorant-tanimlar-genel';

export function tanimlarGenelOku(): TanimlarGenelForm {
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (!ham) return varsayilanTanimlarGenelForm();
    const parsed = JSON.parse(ham) as Partial<TanimlarGenelForm>;
    const varsayilan = varsayilanTanimlarGenelForm();
    return {
      ...varsayilan,
      ...parsed,
      baslikSatirlari: parsed.baslikSatirlari ?? varsayilan.baslikSatirlari,
      satirAlanlari:
        parsed.satirAlanlari?.length === MARKA_SATIR_ALANLARI.length
          ? parsed.satirAlanlari
          : varsayilan.satirAlanlari,
      ozetSatirlari: parsed.ozetSatirlari ?? varsayilan.ozetSatirlari,
    };
  } catch {
    return varsayilanTanimlarGenelForm();
  }
}

export function tanimlarGenelKaydet(form: TanimlarGenelForm) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
}

export function tanimlarGenelFormEsit(a: TanimlarGenelForm, b: TanimlarGenelForm): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Eksik alan eklenmiş eski kayıtları tamamla */
export function tanimlarGenelFormNormalize(form: TanimlarGenelForm): TanimlarGenelForm {
  const mevcutAlanlar = new Set(form.satirAlanlari.map((s) => s.alan));
  const eksik = MARKA_SATIR_ALANLARI.filter((a) => !mevcutAlanlar.has(a)).map((a) =>
    bosDizaynSatir(a)
  );
  if (eksik.length === 0) return form;
  return { ...form, satirAlanlari: [...form.satirAlanlari, ...eksik] };
}
