import type { SagTikPanelAyarlari } from '@/admin/ortak/tipler/sagTikPaneli';
import { VARSAYILAN_SAG_TIK_PANEL } from '@/admin/ortak/tipler/sagTikPaneli';
import { sagTikPanelNormalize } from '@/admin/baslat-menusu/sistem/ayarlar/yardimci-sag-tik';
import { kenarlikAyariNormalize, type KenarlikRenkAyari } from '@/admin/baslat-menusu/sistem/ayarlar/kenarlikRenkYardimci';
import { VARSAYILAN_YEDEKLEME_FORMATI, yedeklemeFormatiNormalize, type YedeklemeFormati } from '@/types/yedekleme';
import {
  VARSAYILAN_AYARLAR,
  varsayilanAyarlarNormalize,
  type VarsayilanAyarlar,
} from '@/admin/baslat-menusu/sistem/ayarlar/varsayilanAyarlar';

export type { VarsayilanAyarlar };

export type Sayfa404MenuTipi = 'ust' | 'footer' | 'her-ikisi' | 'yok';

export interface ScriptAyarlari {
  googleAnalytics: string;
  headerScript: string;
  bodyAcilisScript: string;
  footerScript: string;
}

export const varsayilanScriptAyarlari: ScriptAyarlari = {
  googleAnalytics: '',
  headerScript: '',
  bodyAcilisScript: '',
  footerScript: '',
};

export type { KenarlikRenkAyari };

export interface SistemAyarlariJson {
  bakimModu?: boolean;
  bakimMesaji?: string;
  bakimBaslik?: string;
  bakimGorselUrl?: string;
  bakimTahminiSure?: string;
  logSaklamaGun?: number;
  kenarlikRenk?: string;
  kenarlikNeon?: boolean;
  panelDili?: string;
  panelCeviriler?: Record<string, Record<string, string>>;
  sayfa404?: Partial<Sayfa404Ayarlari>;
  otomatikYedekleme?: boolean;
  otomatikYedeklemeGun?: number;
  yedeklemeFormati?: YedeklemeFormati;
  guvenlikBasliklari?: boolean;
  robotsEngelle?: boolean;
  scriptAyarlari?: ScriptAyarlari;
}

export interface Sayfa404Ayarlari {
  baslik: string;
  mesaj: string;
  gorselUrl: string;
  menuTipi: Sayfa404MenuTipi;
  oneriSayfaId: string | null;
  anaSayfaButonu: boolean;
}

export interface SistemAyarlariForm {
  siteAktif: boolean;
  domain: string;
  bakimModu: boolean;
  bakimBaslik: string;
  bakimMesaji: string;
  bakimGorselUrl: string;
  bakimTahminiSure: string;
  bakimIpBeyazListe: string[];
  logSaklamaGun: number;
  kenarlikRenk: string;
  kenarlikNeon: boolean;
  panelDili: string;
  panelCeviriler: Record<string, Record<string, string>>;
  sayfa404: Sayfa404Ayarlari;
  otomatikYedekleme: boolean;
  otomatikYedeklemeGun: number;
  yedeklemeFormati: YedeklemeFormati;
  guvenlikBasliklari: boolean;
  robotsEngelle: boolean;
  sagTikPaneli: SagTikPanelAyarlari;
  scriptAyarlari: ScriptAyarlari;
  varsayilanAyarlar: VarsayilanAyarlar;
}

export type SistemSekmeId = 'genel' | 'bakim' | 'sayfa404' | 'dil' | 'guvenlik' | 'script' | 'sagTik' | 'eklentiler';

export const SISTEM_SEKMELER: { id: SistemSekmeId; ad: string; ikon: string }[] = [
  { id: 'genel', ad: 'Genel', ikon: '⚡' },
  { id: 'bakim', ad: 'Bakım Modu', ikon: '🔧' },
  { id: 'sayfa404', ad: '404 Sayfası', ikon: '🚫' },
  { id: 'dil', ad: 'Panel Dili', ikon: '🌐' },
  { id: 'guvenlik', ad: 'Güvenlik', ikon: '🛡️' },
  { id: 'script', ad: 'Script Ayarları', ikon: '</>' },
  { id: 'eklentiler', ad: 'Eklentiler', ikon: '🧩' },
  { id: 'sagTik', ad: 'Sağ Tık Paneli', ikon: '🖱️' },
];

export const SEKME_BASLIK: Record<SistemSekmeId, string> = {
  genel: 'Genel Ayarlar',
  bakim: 'Bakım Modu',
  sayfa404: '404 Sayfası',
  dil: 'Panel Dili & Çeviriler',
  guvenlik: 'Güvenlik',
  script: 'Script Ayarları',
  eklentiler: 'Eklentiler',
  sagTik: 'Sağ Tık Paneli',
};

export const SEKME_ALT: Record<SistemSekmeId, string> = {
  genel: 'Yayın durumu ve domain',
  bakim: 'Bakım ekranı ve görsel',
  sayfa404: 'Menü ve içerik yapılandırması',
  dil: 'JSON çeviri editörü',
  guvenlik: 'HTTP güvenlik başlıkları ve arama motoru ayarları',
  script: 'Google Analytics ve özel script kodları',
  eklentiler: 'Site eklentilerini kur, etkinleştir veya kaldır',
  sagTik: 'Admin panel sağ tık menüsü öğeleri ve modül listesi',
};

export const PANEL_DILLERI: { kod: string; ad: string }[] = [
  { kod: 'tr', ad: 'Türkçe' },
  { kod: 'en', ad: 'English' },
  { kod: 'de', ad: 'Deutsch' },
  { kod: 'fr', ad: 'Français' },
  { kod: 'ar', ad: 'العربية' },
];

export const SAYFA404_MENU_SECENEKLERI: { deger: Sayfa404MenuTipi; ad: string; aciklama: string }[] = [
  { deger: 'ust', ad: 'Üst Menü', aciklama: 'Header menüsü 404 sayfasında görünür' },
  { deger: 'footer', ad: 'Footer Menü', aciklama: 'Alt menü ve linkler gösterilir' },
  { deger: 'her-ikisi', ad: 'Her İkisi', aciklama: 'Header ve footer birlikte' },
  { deger: 'yok', ad: 'Menü Yok', aciklama: 'Sadece 404 içeriği, menü gizli' },
];

export const varsayilanSayfa404: Sayfa404Ayarlari = {
  baslik: 'Sayfa Bulunamadı',
  mesaj: 'Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.',
  gorselUrl: '',
  menuTipi: 'ust',
  oneriSayfaId: null,
  anaSayfaButonu: true,
};

export const bosSistemForm: SistemAyarlariForm = {
  siteAktif: true,
  domain: '',
  bakimModu: false,
  bakimBaslik: 'Bakım Çalışması',
  bakimMesaji: 'Site geçici olarak bakımda. Lütfen daha sonra tekrar deneyin.',
  bakimGorselUrl: '',
  bakimTahminiSure: '',
  bakimIpBeyazListe: [],
  logSaklamaGun: 90,
  kenarlikRenk: 'turuncu',
  kenarlikNeon: false,
  panelDili: 'tr',
  panelCeviriler: {},
  sayfa404: { ...varsayilanSayfa404 },
  otomatikYedekleme: false,
  otomatikYedeklemeGun: 7,
  yedeklemeFormati: VARSAYILAN_YEDEKLEME_FORMATI,
  guvenlikBasliklari: true,
  robotsEngelle: false,
  sagTikPaneli: { ...VARSAYILAN_SAG_TIK_PANEL, ogeler: [...VARSAYILAN_SAG_TIK_PANEL.ogeler] },
  scriptAyarlari: { ...varsayilanScriptAyarlari },
  varsayilanAyarlar: { ...VARSAYILAN_AYARLAR, sekme: { ...VARSAYILAN_AYARLAR.sekme } },
};

export function sistemdenForm(
  site: { aktif: boolean; domain: string | null },
  sistem: Partial<SistemAyarlariForm>
): SistemAyarlariForm {
  return {
    siteAktif: site.aktif,
    domain: site.domain ?? '',
    bakimModu: sistem.bakimModu ?? bosSistemForm.bakimModu,
    bakimBaslik: sistem.bakimBaslik ?? bosSistemForm.bakimBaslik,
    bakimMesaji: sistem.bakimMesaji ?? bosSistemForm.bakimMesaji,
    bakimGorselUrl: sistem.bakimGorselUrl ?? '',
    bakimTahminiSure: sistem.bakimTahminiSure ?? '',
    bakimIpBeyazListe: sistem.bakimIpBeyazListe ?? [],
    logSaklamaGun: sistem.logSaklamaGun ?? 90,
    kenarlikRenk: kenarlikAyariNormalize(sistem.kenarlikRenk, sistem.kenarlikNeon).renk,
    kenarlikNeon: kenarlikAyariNormalize(sistem.kenarlikRenk, sistem.kenarlikNeon).neon,
    panelDili: sistem.panelDili ?? 'tr',
    panelCeviriler: sistem.panelCeviriler ?? {},
    sayfa404: { ...varsayilanSayfa404, ...sistem.sayfa404 },
    otomatikYedekleme: sistem.otomatikYedekleme ?? false,
    otomatikYedeklemeGun: sistem.otomatikYedeklemeGun ?? 7,
    yedeklemeFormati: yedeklemeFormatiNormalize(sistem.yedeklemeFormati),
    guvenlikBasliklari: sistem.guvenlikBasliklari ?? true,
    robotsEngelle: sistem.robotsEngelle ?? false,
    sagTikPaneli: sagTikPanelNormalize(sistem.sagTikPaneli),
    scriptAyarlari: { ...varsayilanScriptAyarlari, ...sistem.scriptAyarlari },
    varsayilanAyarlar: varsayilanAyarlarNormalize(sistem.varsayilanAyarlar),
  };
}
