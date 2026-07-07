import type { SagTikOgeId } from '@/admin/ortak/tipler/sagTikPaneli';

export interface SagTikOgeTanim {
  id: SagTikOgeId;
  etiket: string;
  aciklama: string;
  ikon: string;
  ayarlanabilir: boolean;
  ayirici?: boolean;
}

export const SAG_TIK_OGE_TANIMLARI: SagTikOgeTanim[] = [
  { id: 'kopyala', etiket: 'Kopyala', aciklama: 'Seçili metni panoya kopyalar', ikon: '📋', ayarlanabilir: true },
  { id: 'kes', etiket: 'Kes', aciklama: 'Seçili metni keser', ikon: '✂️', ayarlanabilir: true },
  { id: 'yapistir', etiket: 'Yapıştır', aciklama: 'Panodaki metni yapıştırır', ikon: '📥', ayarlanabilir: true },
  { id: 'tumunuSec', etiket: 'Tümünü Seç', aciklama: 'Aktif alandaki metni seçer', ikon: '▣', ayarlanabilir: true },
  { id: 'ayirici1', etiket: 'Ayırıcı', aciklama: 'Düzenleme ve gezinme arası çizgi', ikon: '—', ayarlanabilir: true, ayirici: true },
  { id: 'moduller', etiket: 'Modüller', aciklama: 'Hızlı modül listesi (alt menü)', ikon: '🧩', ayarlanabilir: true },
  { id: 'sayfalar', etiket: 'Tüm Sayfalar', aciklama: 'Site sayfalarına hızlı git', ikon: '📄', ayarlanabilir: true },
  { id: 'yeniSayfa', etiket: 'Yeni Sayfa', aciklama: 'Sayfa modülünü yeni kayıt ile açar', ikon: '➕', ayarlanabilir: true },
  { id: 'dashboard', etiket: 'Dashboard', aciklama: 'Ana panele dön', ikon: '📊', ayarlanabilir: true },
  { id: 'ayirici2', etiket: 'Ayırıcı', aciklama: 'Gezinme ve işlemler arası çizgi', ikon: '—', ayarlanabilir: true, ayirici: true },
  { id: 'kaydet', etiket: 'Kaydet', aciklama: 'Aktif modülde kaydet', ikon: '💾', ayarlanabilir: true },
  { id: 'guncelle', etiket: 'Güncelle', aciklama: 'Aktif modülde güncelle / yazdır / önizle', ikon: '🔄', ayarlanabilir: true },
  { id: 'siteAc', etiket: 'Siteyi Aç', aciklama: 'Canlı siteyi yeni sekmede açar', ikon: '🌐', ayarlanabilir: true },
  { id: 'tema', etiket: 'Tema Değiştir', aciklama: 'Gece / gündüz modu', ikon: '🌓', ayarlanabilir: true },
  { id: 'sistemKesif', etiket: 'Sistemi Keşfet', aciklama: 'İnteraktif panel turu', ikon: '✨', ayarlanabilir: true },
];

export function sagTikOgeTanimBul(id: SagTikOgeId) {
  return SAG_TIK_OGE_TANIMLARI.find((o) => o.id === id);
}
