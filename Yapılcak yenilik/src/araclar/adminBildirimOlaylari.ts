export const ADMIN_BILDIRIM_YENILE = 'admin-bildirim-yenile';
export const ADMIN_ISLEM_BILDIRIMI = 'admin-islem-bildirimi';

export type AdminIslemBildirimTur = 'basari' | 'hata' | 'bilgi';

export interface AdminIslemBildirimDetay {
  baslik: string;
  mesaj: string;
  tur: AdminIslemBildirimTur;
}

export function adminBildirimleriYenile() {
  window.dispatchEvent(new CustomEvent(ADMIN_BILDIRIM_YENILE));
}

export function adminIslemBildirimi(
  mesaj: string,
  tur: AdminIslemBildirimTur = 'basari',
  baslik?: string
) {
  const detay: AdminIslemBildirimDetay = {
    baslik: baslik ?? (tur === 'hata' ? 'İşlem başarısız' : 'İşlem tamamlandı'),
    mesaj,
    tur,
  };
  window.dispatchEvent(new CustomEvent(ADMIN_ISLEM_BILDIRIMI, { detail: detay }));
  adminBildirimleriYenile();
}
