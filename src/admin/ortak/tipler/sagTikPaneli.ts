export type SagTikOgeId =
  | 'kes'
  | 'kopyala'
  | 'yapistir'
  | 'tumunuSec'
  | 'ayirici1'
  | 'moduller'
  | 'ayirici2'
  | 'kaydet'
  | 'guncelle'
  | 'tema';

export interface SagTikOgeAyari {
  id: SagTikOgeId;
  aktif: boolean;
}

export interface SagTikPanelAyarlari {
  /** Sağ tık menüsü açık mı */
  aktif: boolean;
  /** Görünen öğeler (sıralı) */
  ogeler: SagTikOgeAyari[];
  /** Modüller alt menüsünde listelenecek modül id'leri */
  modulIdler: string[];
}

export const VARSAYILAN_SAG_TIK_PANEL: SagTikPanelAyarlari = {
  aktif: true,
  ogeler: [
    { id: 'kopyala', aktif: true },
    { id: 'kes', aktif: true },
    { id: 'yapistir', aktif: true },
    { id: 'tumunuSec', aktif: true },
    { id: 'ayirici1', aktif: true },
    { id: 'moduller', aktif: true },
    { id: 'ayirici2', aktif: true },
    { id: 'kaydet', aktif: true },
    { id: 'guncelle', aktif: true },
    { id: 'tema', aktif: true },
  ],
  modulIdler: [
    'dashboard',
    'sayfalar',
    'widget-yonetimi',
    'seo',
    'header',
    'hero',
    'footer',
    'blog',
    'formlar',
    'medya',
    'site-ayarlari',
    'ayarlar',
  ],
};
