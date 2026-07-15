import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import type {
  AdminBirim, AdminMaliyet, AdminUrun, BirimForm, MaliyetForm, UrunForm,
} from './tipler';

const TABAN = '/urun-yonetimi';

async function liste<T>(yol: string, anahtar: string): Promise<T[]> {
  const veri = await adminJsonFetch<Record<string, T[]>>(`${TABAN}/${yol}`, { headers: adminHeaders() });
  return veri[anahtar] ?? [];
}

async function kaydet<T>(yol: string, tekil: string, form: unknown, id?: string): Promise<T> {
  const veri = await adminJsonFetch<Record<string, T>>(`${TABAN}/${yol}${id ? `/${id}` : ''}`, {
    method: id ? 'PUT' : 'POST', headers: adminHeaders(), body: JSON.stringify(form),
  });
  return veri[tekil];
}

async function sil(yol: string, id: string): Promise<void> {
  await adminJsonFetch(`${TABAN}/${yol}/${id}`, { method: 'DELETE', headers: adminHeaders() });
}

export const urunleriGetir = () => liste<AdminUrun>('urunler', 'urunler');
export const urunOlustur = (form: UrunForm & { aktif: boolean }) => kaydet<AdminUrun>('urunler', 'urun', form);
export const urunGuncelle = (id: string, form: UrunForm & { aktif: boolean }) => kaydet<AdminUrun>('urunler', 'urun', form, id);
export const urunSil = (id: string) => sil('urunler', id);

export const birimleriGetir = (urunId?: string) =>
  liste<AdminBirim>(
    urunId ? `birimler?urunId=${encodeURIComponent(urunId)}` : 'birimler',
    'birimler'
  );
export const birimOlustur = (form: BirimForm) => kaydet<AdminBirim>('birimler', 'birim', form);
export const birimGuncelle = (id: string, form: BirimForm) => kaydet<AdminBirim>('birimler', 'birim', form, id);
export const birimSil = (id: string) => sil('birimler', id);

export const maliyetleriGetir = () => liste<AdminMaliyet>('maliyetler', 'maliyetler');
export const maliyetOlustur = (form: MaliyetForm) => kaydet<AdminMaliyet>('maliyetler', 'maliyet', form);
export const maliyetGuncelle = (id: string, form: MaliyetForm) => kaydet<AdminMaliyet>('maliyetler', 'maliyet', form, id);
export const maliyetSil = (id: string) => sil('maliyetler', id);
