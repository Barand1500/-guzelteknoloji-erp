import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { MenuDetayPanel } from '@/admin/baslat-menusu/menu-tanimlari/bilesenler/MenuDetayPanel';
import { MenuListesiPanel } from '@/admin/baslat-menusu/menu-tanimlari/bilesenler/MenuListesiPanel';
import { MenuUrunFiyatModal } from '@/admin/baslat-menusu/menu-tanimlari/bilesenler/MenuUrunFiyatModal';
import { MenuUrunSecimModal } from '@/admin/baslat-menusu/menu-tanimlari/bilesenler/MenuUrunSecimModal';
import { MenuUrunTablo } from '@/admin/baslat-menusu/menu-tanimlari/bilesenler/MenuUrunTablo';
import { bosMenuUrunFiyatlari } from '@/admin/baslat-menusu/menu-tanimlari/veri';
import {
  bosMenuTanim,
  menuTanimKopyala,
  type MenuDuzenlemeModu,
  type MenuKayit,
  type MenuTanim,
} from '@/admin/baslat-menusu/menu-tanimlari/tipler';
import {
  menuKaydiKaydet,
  menuKaydiOku,
  menuTanimEsit,
  sonrakiMenuId,
} from '@/admin/baslat-menusu/menu-tanimlari/yardimci';
import { TanimlarGeciciUyari } from '@/admin/baslat-menusu/tanimlar/bilesenler/genel/TanimlarGeciciUyari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

function kayitliMenuBul(kayit: MenuKayit, id: number | null): MenuTanim | null {
  if (id == null) return null;
  return kayit.menuler.find((m) => m.id === id) ?? null;
}

export function MenuTanimlariSayfa() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayit, setKayit] = useState<MenuKayit>(() => menuKaydiOku());
  const [seciliId, setSeciliId] = useState<number | null>(() => menuKaydiOku().menuler[0]?.id ?? null);
  const [mod, setMod] = useState<MenuDuzenlemeModu>('pasif');
  const [taslak, setTaslak] = useState<MenuTanim | null>(() => {
    const ilk = menuKaydiOku().menuler[0];
    return ilk ? menuTanimKopyala(ilk) : null;
  });
  const [uyari, setUyari] = useState<string | null>(null);
  const [urunSecimAcik, setUrunSecimAcik] = useState(false);
  const [fiyatSatirId, setFiyatSatirId] = useState<string | null>(null);

  const duzenlenebilir = mod === 'duzenle' || mod === 'yeni';

  const kirli = useMemo(() => {
    if (!duzenlenebilir || !taslak) return false;
    if (mod === 'yeni') {
      const bos = bosMenuTanim(taslak.id);
      return !menuTanimEsit(taslak, bos);
    }
    const kayitli = kayitliMenuBul(kayit, seciliId);
    if (!kayitli) return true;
    return !menuTanimEsit(taslak, kayitli);
  }, [duzenlenebilir, taslak, mod, kayit, seciliId]);

  const mevcutUrunIdleri = useMemo(
    () => new Set(taslak?.urunler.map((u) => u.urunId) ?? []),
    [taslak?.urunler]
  );

  const fiyatSatir = useMemo(
    () => taslak?.urunler.find((u) => u.id === fiyatSatirId) ?? null,
    [taslak?.urunler, fiyatSatirId]
  );

  const pasifeAl = useCallback(
    (yeniKayit: MenuKayit, yeniSeciliId: number | null) => {
      setKayit(yeniKayit);
      setSeciliId(yeniSeciliId);
      setMod('pasif');
      const menu = kayitliMenuBul(yeniKayit, yeniSeciliId);
      setTaslak(menu ? menuTanimKopyala(menu) : null);
    },
    []
  );

  const menuSec = useCallback(
    (id: number) => {
      if (kirli) {
        setUyari('Değişiklik yapıldı, kaydedilmedi.');
        return;
      }
      const menu = kayitliMenuBul(kayit, id);
      setSeciliId(id);
      setMod('pasif');
      setTaslak(menu ? menuTanimKopyala(menu) : null);
      setUyari(null);
    },
    [kirli, kayit]
  );

  const yeniMenu = useCallback(() => {
    if (kirli) {
      setUyari('Değişiklik yapıldı, kaydedilmedi.');
      return;
    }
    const id = sonrakiMenuId(kayit.menuler);
    setMod('yeni');
    setSeciliId(null);
    setTaslak(bosMenuTanim(id));
    setUyari(null);
  }, [kirli, kayit.menuler]);

  const duzelt = useCallback(() => {
    if (mod === 'yeni') return;
    if (seciliId == null) {
      hataBildir('Düzenlemek için soldan bir menü seçin.');
      return;
    }
    const menu = kayitliMenuBul(kayit, seciliId);
    if (!menu) return;
    setMod('duzenle');
    setTaslak(menuTanimKopyala(menu));
    setUyari(null);
  }, [mod, seciliId, kayit, hataBildir]);

  const kaydet = useCallback(() => {
    if (!taslak || !duzenlenebilir) {
      hataBildir('Kaydetmek için Yeni veya Düzelt ile düzenleme moduna geçin.');
      return;
    }
    const ad = taslak.ad.trim();
    if (ad.length < 2) {
      hataBildir('Menü adı en az 2 karakter olmalı.');
      return;
    }

    const kaydedilecek = { ...taslak, ad };

    if (mod === 'yeni') {
      const yeniKayit: MenuKayit = { menuler: [...kayit.menuler, kaydedilecek] };
      menuKaydiKaydet(yeniKayit);
      pasifeAl(yeniKayit, kaydedilecek.id);
      basariBildir('Menü eklendi.');
      return;
    }

    const yeniKayit: MenuKayit = {
      menuler: kayit.menuler.map((m) => (m.id === kaydedilecek.id ? kaydedilecek : m)),
    };
    menuKaydiKaydet(yeniKayit);
    pasifeAl(yeniKayit, kaydedilecek.id);
    basariBildir('Menü kaydedildi.');
  }, [taslak, duzenlenebilir, mod, kayit.menuler, pasifeAl, basariBildir, hataBildir]);

  const sil = useCallback(() => {
    if (seciliId == null || mod === 'yeni') {
      hataBildir('Silmek için listeden bir menü seçin.');
      return;
    }
    const yeniMenuler = kayit.menuler.filter((m) => m.id !== seciliId);
    const yeniKayit: MenuKayit = { menuler: yeniMenuler };
    const yeniSecili = yeniMenuler[0]?.id ?? null;
    menuKaydiKaydet(yeniKayit);
    pasifeAl(yeniKayit, yeniSecili);
    basariBildir('Menü silindi.');
  }, [seciliId, mod, kayit.menuler, pasifeAl, basariBildir, hataBildir]);

  const taslakGuncelle = useCallback((menu: MenuTanim) => {
    setTaslak(menu);
  }, []);

  const urunEkle = useCallback(
    (urunIdleri: string[]) => {
      if (!taslak) return;
      const yeniSatirlar = urunIdleri.map((urunId, i) => ({
        id: `mu-${Date.now()}-${i}`,
        urunId,
        fiyatFarki: 0,
        fiyatlar: bosMenuUrunFiyatlari(),
      }));
      setTaslak({ ...taslak, urunler: [...taslak.urunler, ...yeniSatirlar] });
    },
    [taslak]
  );

  useModulAksiyonlari(
    { kaydet, ekle: yeniMenu, guncelle: duzelt, sil },
    {
      kaydet: duzenlenebilir,
      ekle: !duzenlenebilir,
      guncelle: mod === 'pasif' && seciliId != null,
      sil: mod === 'pasif' && seciliId != null,
      onizle: false,
      yayinla: false,
    },
    kirli
  );

  const gosterilecekMenu = taslak ?? bosMenuTanim(0);

  return (
    <AdminModulKabuk
      baslik="Menü Tanımları"
      aciklama="Menü kartları, fiyat ve ürün eşleştirmeleri"
      onizleGoster={false}
    >
      <AdminPanelKarti baslik="Menü Listesi ve Ürün Detayı">
        <TanimlarGeciciUyari mesaj={uyari} onTemizle={() => setUyari(null)} />

        <div className="ap-menu-tanim-layout">
          <MenuListesiPanel
            menuler={kayit.menuler}
            seciliId={seciliId}
            yeniVurgu={mod === 'yeni'}
            onSec={menuSec}
          />

          <div className={`ap-menu-tanim-sag${duzenlenebilir ? ' ap-menu-tanim-sag-aktif' : ''}`}>
            {taslak || seciliId != null ? (
              <>
                <MenuDetayPanel menu={gosterilecekMenu} duzenlenebilir={duzenlenebilir} onDegistir={taslakGuncelle} />
                <MenuUrunTablo
                  urunler={gosterilecekMenu.urunler}
                  duzenlenebilir={duzenlenebilir}
                  onUrunSecAc={() => setUrunSecimAcik(true)}
                  onFiyatAc={setFiyatSatirId}
                  onFiyatFarkiDegistir={(satirId, fiyatFarki) => {
                    if (!taslak) return;
                    setTaslak({
                      ...taslak,
                      urunler: taslak.urunler.map((u) => (u.id === satirId ? { ...u, fiyatFarki } : u)),
                    });
                  }}
                  onUrunSil={(satirId) => {
                    if (!taslak) return;
                    setTaslak({ ...taslak, urunler: taslak.urunler.filter((u) => u.id !== satirId) });
                  }}
                />
              </>
            ) : (
              <div className="ap-menu-tanim-sag-bos ap-muted">
                Soldan bir menü seçin veya aksiyon çubuğundan Yeni ile menü oluşturun.
              </div>
            )}
          </div>
        </div>
      </AdminPanelKarti>

      <MenuUrunSecimModal
        acik={urunSecimAcik && duzenlenebilir}
        mevcutUrunIdleri={mevcutUrunIdleri}
        onKapat={() => setUrunSecimAcik(false)}
        onEkle={urunEkle}
      />

      <MenuUrunFiyatModal
        acik={fiyatSatirId != null && duzenlenebilir}
        urunId={fiyatSatir?.urunId ?? null}
        fiyatlar={fiyatSatir?.fiyatlar ?? []}
        onDegistir={(fiyatlar) => {
          if (!taslak || !fiyatSatirId) return;
          setTaslak({
            ...taslak,
            urunler: taslak.urunler.map((u) => (u.id === fiyatSatirId ? { ...u, fiyatlar } : u)),
          });
        }}
        onKapat={() => setFiyatSatirId(null)}
      />
    </AdminModulKabuk>
  );
}
