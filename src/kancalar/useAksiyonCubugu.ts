import { useMemo } from 'react';
import { useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { usePanelDil } from '@/baglamlar/PanelDilContext';
import type { AksiyonButonu } from '@/admin/ortak/tipler/admin';
import type { AksiyonId } from '@/baglamlar/AdminAksiyonContext';
import { useYetkiler } from '@/kancalar/useYetkiler';
import type { YetkiKodu } from '@/admin/baslat-menusu/musteri-ajans/roller/api';

const STANDART_AKSIYON_SIRASI = ['kaydet', 'ekle', 'sil', 'guncelle'] as const;
type StandartAksiyonId = (typeof STANDART_AKSIYON_SIRASI)[number];

type AksiyonVarsayilan = { aktif?: boolean; birincil?: boolean };

const A = (
  id: string,
  etiket: string,
  aktif: boolean,
  birincil?: boolean
): AksiyonButonu => ({
  id,
  etiket,
  aktif,
  ...(birincil ? { birincil: true } : {}),
});

function standartCubuk(
  varsayilan: Partial<Record<StandartAksiyonId, AksiyonVarsayilan>> = {}
): AksiyonButonu[] {
  const etiketler: Record<StandartAksiyonId, string> = {
    kaydet: 'Kaydet',
    ekle: 'Yeni Ekle',
    sil: 'Sil',
    guncelle: 'Güncelle',
  };

  return STANDART_AKSIYON_SIRASI.map((id) => {
    const o = varsayilan[id] ?? {};
    return A(id, etiketler[id], o.aktif ?? false, o.birincil);
  });
}

const a = (birincil?: boolean): AksiyonVarsayilan => ({ aktif: true, birincil });

/** Modül açıldığında handler kaydı gelmeden önceki varsayılan aktiflik */
const MODUL_VARSAYILAN: Record<string, Partial<Record<StandartAksiyonId, AksiyonVarsayilan>>> = {
  ayarlar: { kaydet: a(true) },
  'sekme-yonetimi': { kaydet: a(true) },
  'kisayol-ayarlari': { kaydet: a(true) },
  kullanicilar: { kaydet: a(true), ekle: a(), sil: a() },
  roller: { kaydet: a(), ekle: a(), sil: a() },
  'datagrid-demo': { sil: { aktif: false } },
  loglar: { sil: a() },
};

const STOK_CUBUK: AksiyonButonu[] = [
  A('kaydet', 'Kaydet', false),
  A('ekle', 'Yeni', false),
  A('guncelle', 'Düzenle', false),
  A('stokAra', 'Ara', false),
  A('stokFiyatAnaliz', 'Fiyat Analiz', false),
  A('stokEnvanterAnaliz', 'Envanter Analiz', false),
  A('stokBirimListesi', 'Birim Listesi', false),
  A('stokFiyatDuzenle', 'Fiyat Düzenle', false),
];

const MODUL_OZEL_CUBUK: Record<string, AksiyonButonu[]> = {
  stoklar: STOK_CUBUK,
};

const varsayilanAksiyonlar = standartCubuk({ kaydet: { aktif: true } });

const MODUL_AKSIYON_YETKI: Partial<Record<string, Partial<Record<AksiyonId, YetkiKodu>>>> = {
  kullanicilar: {
    kaydet: 'kullanici_yonetimi',
    ekle: 'kullanici_yonetimi',
    sil: 'kullanici_yonetimi',
  },
  roller: {
    kaydet: 'kullanici_yonetimi',
    ekle: 'kullanici_yonetimi',
    sil: 'kullanici_yonetimi',
  },
  tanimlar: {
    kaydet: 'duzenleme',
    ekle: 'ekleme',
    sil: 'silme',
  },
  'datagrid-demo': {
    kaydet: 'duzenleme',
    ekle: 'ekleme',
    sil: 'silme',
  },
  stoklar: {
    // kaydet yetkisi durumlar icinde (yeni=ekleme, duzenle=duzenleme) kontrol edilir
    ekle: 'ekleme',
    guncelle: 'duzenleme',
    stokAra: 'goruntuleme',
    stokFiyatAnaliz: 'goruntuleme',
    stokEnvanterAnaliz: 'goruntuleme',
    stokBirimListesi: 'goruntuleme',
    stokFiyatDuzenle: 'duzenleme',
  },
};

const AKSIYON_YETKI: Partial<Record<string, YetkiKodu>> = {
  kaydet: 'duzenleme',
  ekle: 'ekleme',
  sil: 'silme',
  guncelle: 'duzenleme',
  onizle: 'goruntuleme',
};

export function useAksiyonCubugu(modulId: string) {
  const { aksiyonDurumlari } = useAdminAksiyon();
  const { t } = usePanelDil();
  const { yetkiler: modulYetkiler } = useYetkiler(modulId);
  const { yetkiler: genelYetkiler } = useYetkiler();

  return useMemo(() => {
    const temel =
      MODUL_OZEL_CUBUK[modulId] ??
      (MODUL_VARSAYILAN[modulId] ? standartCubuk(MODUL_VARSAYILAN[modulId]) : varsayilanAksiyonlar);
    const modulYetki = MODUL_AKSIYON_YETKI[modulId] ?? {};
    /** Stoklar: modul matrisi eksikse genel yetkiye de bak (Kaydet/Düzenle kilitlenmesin) */
    const yetkiVar = (kod: YetkiKodu) =>
      modulId === 'stoklar'
        ? modulYetkiler.includes(kod) || genelYetkiler.includes(kod)
        : modulYetkiler.includes(kod);

    return temel.map((aksiyon) => {
      const dinamik = aksiyonDurumlari[aksiyon.id as AksiyonId];
      const modulEtiket = t(`aksiyon.${aksiyon.id}.${modulId}`, '');
      const etiket =
        modulEtiket && modulEtiket !== `aksiyon.${aksiyon.id}.${modulId}`
          ? modulEtiket
          : t(`aksiyon.${aksiyon.id}`, aksiyon.etiket);
      const guncel = { ...aksiyon, etiket };

      const yetkiKodu = modulYetki[aksiyon.id as AksiyonId] ?? AKSIYON_YETKI[aksiyon.id];
      const yetkiUygun = !yetkiKodu || yetkiVar(yetkiKodu);
      const temelAktif = dinamik !== undefined ? dinamik : aksiyon.aktif;

      return { ...guncel, aktif: temelAktif && yetkiUygun };
    });
  }, [modulId, aksiyonDurumlari, t, modulYetkiler, genelYetkiler]);
}
