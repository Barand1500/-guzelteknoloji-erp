import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import { useAdminSekmeler } from '@/kancalar/useAdminSekmeler';
import { useAksiyonCubugu } from '@/kancalar/useAksiyonCubugu';
import { AdminAksiyonProvider, useAdminAksiyon } from '@/baglamlar/AdminAksiyonContext';
import { AdminUyariBildirimProvider } from '@/baglamlar/AdminUyariBildirimContext';
import { AdminTemaProvider, useAdminTema } from '@/baglamlar/AdminTemaContext';
import { ModulKatalogProvider } from '@/baglamlar/ModulKatalogContext';
import { AdminHeader } from './AdminHeader';
import { AltAksiyonCubugu } from './aksiyon-cubugu/AltAksiyonCubugu';
import { modulBul, modulYolundanBul } from '@/admin/veri/adminMenuYapisi';
import { AdminModulIcerik } from './AdminModulIcerik';
import { varsayilanLogMesaji } from '@/admin/ortak/logMesajiYardimci';
import { adminLogApi } from '@/admin/ortak/api/adminSistemApi';
import { adminBildirimleriYenile } from '@/araclar/adminBildirimOlaylari';
import { GirisSayfasi } from '@/admin/giris/sayfa';
import { ModulRehberSistemi } from '@/admin/ortak/ModulRehberSistemi';
import { SistemKesifProvider, useSistemKesifOptional } from '@/baglamlar/SistemKesifContext';
import { SagTikPanelProvider } from '@/baglamlar/SagTikPanelContext';
import { AdminSagTikMenu } from '@/admin/kabuk/sag-tik/AdminSagTikMenu';
import { PanelDilKabuk } from '@/admin/kabuk/PanelDilKabuk';
import { sekmeAyarlariOku, splitSekmeleriHesapla } from '@/admin/baslat-menusu/sistem/sekme-yonetimi/yardimci';
import {
  kenarlikAyariOku,
  kenarlikRenkCssDegiskeni,
  type KenarlikRenkAyari,
} from '@/admin/baslat-menusu/sistem/ayarlar/kenarlikRenkYardimci';
import { sekmeOnizlemeSil } from '@/admin/kabuk/sekme-cubugu/sekmeOnizlemeOnbellek';
import { sekmeOnizlemeGuncelle } from '@/admin/kabuk/sekme-cubugu/sekmeOnizlemeYakala';
import { kisayolAyarlariOku, klavyeOlayiEslesir } from '@/admin/baslat-menusu/sistem/kisayol-ayarlari/yardimci';
import {
  kapatilacakSekmeIdleri,
  kirliKapatilacakSekmeler,
  sekmeKapatSonrasiAktifId,
  type SekmeSagTikIslem,
} from '@/admin/kabuk/sekme-cubugu/sekmeSagTikYardimci';
import { SekmeKapatOnayModal } from '@/admin/kabuk/sekme-cubugu/SekmeKapatOnayModal';
import { SekmeGecisOnayModal } from '@/admin/kabuk/sekme-cubugu/SekmeGecisOnayModal';
import { AdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import type { AdminModul, AdminSekme } from '@/admin/ortak/tipler/admin';
import '@/stiller/adminTema.css';

interface AyriPencere {
  sekmeId: string;
  modulId: string;
  baslik: string;
}

function AdminPanelGovde() {
  const {
    sekmeler,
    aktifSekmeId,
    aktifModul,
    setAktifSekmeId,
    sekmeAc,
    sekmeKapat,
    sekmeTopluKapat,
    sekmeTasi,
    sekmeBirlestir,
    kaydedilmediIsaretle,
    kapananGecmisSayisi,
    sonKapananlariGeriGetir,
  } = useAdminSekmeler();

  const { tema, temaDegistir } = useAdminTema();
  const { focusModulId, setFocusModulId, aksiyonCalistir, aksiyonCalistirModul, modulAksiyonVarMi, logMesajiAl } =
    useAdminAksiyon();
  const location = useLocation();
  const navigate = useNavigate();
  const aksiyonlar = useAksiyonCubugu(focusModulId);
  const [sekmeAyarlari, setSekmeAyarlari] = useState(sekmeAyarlariOku);
  const [kenarlikAyar, setKenarlikAyar] = useState<KenarlikRenkAyari>(() => kenarlikAyariOku());
  const [baslatMenuAcik, setBaslatMenuAcik] = useState(false);
  const [ayriPencereler, setAyriPencereler] = useState<AyriPencere[]>([]);
  const [rehberAcik, setRehberAcik] = useState(false);
  const [sekmeKapatOnay, setSekmeKapatOnay] = useState<{
    hedefId: string;
    islem: SekmeSagTikIslem;
    kirliSayisi: number;
  } | null>(null);
  const [sekmeKapatYukleniyor, setSekmeKapatYukleniyor] = useState(false);
  const [sekmeGecisOnay, setSekmeGecisOnay] = useState<{
    kaynakSekmeId: string;
    hedefSekmeId?: string;
    hedefModulId?: string;
  } | null>(null);
  const [sekmeGecisYukleniyor, setSekmeGecisYukleniyor] = useState(false);
  /** Kapatılan sekmenin modülü — URL gecikince useEffect'in sekmeyi yeniden açmasını engeller */
  const sonKapatilanModulRef = useRef<string | null>(null);
  /** Üst sekme tıklaması sonrası URL senkronunu bekletir (eski URL ile yanlış sekmeye dönmeyi önler) */
  const beklenenSekmeIdRef = useRef<string | null>(null);
  const sonUrlRef = useRef<string | null>(null);
  const sekmelerRef = useRef(sekmeler);
  const aktifSekmeIdRef = useRef(aktifSekmeId);
  sekmelerRef.current = sekmeler;
  aktifSekmeIdRef.current = aktifSekmeId;

  useEffect(() => {
    const handler = () => setSekmeAyarlari(sekmeAyarlariOku());
    window.addEventListener('ap-sekme-ayarlari-guncellendi', handler);
    return () => window.removeEventListener('ap-sekme-ayarlari-guncellendi', handler);
  }, []);

  useEffect(() => {
    const handler = () => setKenarlikAyar(kenarlikAyariOku());
    window.addEventListener('ap-kenarlik-renk-guncellendi', handler);
    return () => window.removeEventListener('ap-kenarlik-renk-guncellendi', handler);
  }, []);

  const panelStil = useMemo(
    () => kenarlikRenkCssDegiskeni(kenarlikAyar, tema),
    [kenarlikAyar, tema]
  );

  const aktifSekme = sekmeler.find((s) => s.id === aktifSekmeId);
  const splitSekmeler = useMemo(
    () => splitSekmeleriHesapla(sekmeler, aktifSekme, sekmeAyarlari.yanYanaAcilabilir),
    [sekmeler, aktifSekme, sekmeAyarlari.yanYanaAcilabilir]
  );

  useEffect(() => {
    if (!sekmeAyarlari.hoverOnizleme) return;
    const zamanlayici = window.setTimeout(() => {
      void sekmeOnizlemeGuncelle(aktifSekmeId);
    }, 1400);
    return () => window.clearTimeout(zamanlayici);
  }, [aktifSekmeId, location.pathname, sekmeAyarlari.hoverOnizleme]);

  useEffect(() => {
    if (aktifModul?.id) setFocusModulId(aktifModul.id);
  }, [aktifModul?.id, setFocusModulId]);

  useEffect(() => {
    function tusHandler(e: KeyboardEvent) {
      const harita = kisayolAyarlariOku();
      const hedef = e.target as HTMLElement;
      const inputIcinde =
        hedef.tagName === 'INPUT' || hedef.tagName === 'TEXTAREA' || hedef.isContentEditable;
      const rehberTusu = klavyeOlayiEslesir(e, harita.rehber);

      if (inputIcinde && !e.ctrlKey && !e.metaKey && !rehberTusu) return;

      if (rehberTusu) {
        e.preventDefault();
        setRehberAcik(true);
        return;
      }
      if (klavyeOlayiEslesir(e, harita.kaydet)) {
        e.preventDefault();
        void aksiyonCalistir('kaydet');
        return;
      }
      if (klavyeOlayiEslesir(e, harita.ekle)) {
        e.preventDefault();
        void aksiyonCalistir('ekle');
        return;
      }
      if (klavyeOlayiEslesir(e, harita.guncelle)) {
        e.preventDefault();
        void aksiyonCalistir('guncelle');
        return;
      }
      if (klavyeOlayiEslesir(e, harita.sil)) {
        e.preventDefault();
        void aksiyonCalistir('sil');
        return;
      }
      if (klavyeOlayiEslesir(e, harita.oncekiKayit)) {
        e.preventDefault();
        void aksiyonCalistir('oncekiKayit');
        return;
      }
      if (klavyeOlayiEslesir(e, harita.sonrakiKayit)) {
        e.preventDefault();
        void aksiyonCalistir('sonrakiKayit');
      }
    }

    window.addEventListener('keydown', tusHandler);
    return () => window.removeEventListener('keydown', tusHandler);
  }, [aksiyonCalistir, focusModulId]);

  function modulAcUygula(modul: AdminModul) {
    const hedefSekmeId = sekmeAc(modul);
    beklenenSekmeIdRef.current = hedefSekmeId;
    setFocusModulId(modul.id);

    const hedef = modul.yol.replace(/\/+$/, '') || '/gt-admin';
    const mevcut = location.pathname.replace(/\/+$/, '') || '/gt-admin';
    if (mevcut !== hedef) {
      navigate(hedef);
      return;
    }

    beklenenSekmeIdRef.current = null;
  }

  async function modulAcHandler(modul: AdminModul) {
    setSekmeGecisOnay(null);
    const otomatikKaydetAcik = sekmeAyarlariOku().sekmeGecisindeOtomatikKaydet;
    const aktifSekmeKirli = sekmelerRef.current.find((s) => s.id === aktifSekmeIdRef.current)?.kaydedilmedi;
    const modulDegisiyor = modul.id !== sekmelerRef.current.find((s) => s.id === aktifSekmeIdRef.current)?.modulId;
    if (aktifSekmeKirli && modulDegisiyor) {
      if (otomatikKaydetAcik) {
        await sekmeKaydetAsync(aktifSekmeIdRef.current);
      } else {
        setSekmeGecisOnay({
          kaynakSekmeId: aktifSekmeIdRef.current,
          hedefModulId: modul.id,
        });
        return;
      }
    }
    modulAcUygula(modul);
  }

  function modulSecHandler(modulId: string) {
    const modul = modulBul(modulId);
    if (modul) {
      setFocusModulId(modulId);
      void modulAcHandler(modul);
    }
  }

  function sekmeKapatHandler(sekmeId: string) {
    if (sekmeler.length <= 1) return;

    const kapatilan = sekmeler.find((s) => s.id === sekmeId);
    if (!kapatilan) return;

    if (sekmeAyarlari.hoverOnizleme && aktifSekmeId === sekmeId) {
      void sekmeOnizlemeGuncelle(sekmeId);
    }
    sekmeOnizlemeSil(sekmeId);

    const kapatildiAktif = aktifSekmeId === sekmeId;
    const mevcutPathModul = modulYolundanBul(location.pathname);
    const urlKapaliModulleEslesiyor = mevcutPathModul?.id === kapatilan.modulId;

    let hedefModul: AdminModul | undefined;
    if (kapatildiAktif) {
      const idx = sekmeler.findIndex((s) => s.id === sekmeId);
      const komşu = sekmeler[idx + 1] ?? sekmeler[idx - 1];
      hedefModul = komşu ? modulBul(komşu.modulId) : undefined;
    } else if (urlKapaliModulleEslesiyor) {
      const aktifKalan = sekmeler.find((s) => s.id === aktifSekmeId && s.id !== sekmeId);
      hedefModul = aktifKalan ? modulBul(aktifKalan.modulId) : undefined;
    }

    sonKapatilanModulRef.current = kapatilan.modulId;

    if ((kapatildiAktif || urlKapaliModulleEslesiyor) && hedefModul) {
      const hedef = hedefModul.yol.replace(/\/+$/, '') || '/gt-admin';
      navigate(hedef, { replace: true });
    }

    sekmeKapat(sekmeId);
  }

  function sekmeSecUygula(sekmeId: string) {
    const sekme = sekmeler.find((s) => s.id === sekmeId);
    const modul = sekme ? modulBul(sekme.modulId) : undefined;
    if (!modul) return;

    if (sekmeAyarlari.hoverOnizleme && aktifSekmeId !== sekmeId) {
      void sekmeOnizlemeGuncelle(aktifSekmeId);
    }

    setFocusModulId(modul.id);
    setAktifSekmeId(sekmeId);

    const hedef = modul.yol.replace(/\/+$/, '') || '/gt-admin';
    const mevcut = location.pathname.replace(/\/+$/, '') || '/gt-admin';
    if (mevcut !== hedef) {
      navigate(hedef);
    }
  }

  async function sekmeSecHandler(sekmeId: string) {
    if (sekmeId === aktifSekmeIdRef.current) return;
    setSekmeGecisOnay(null);
    const otomatikKaydetAcik = sekmeAyarlariOku().sekmeGecisindeOtomatikKaydet;
    const aktifSekmeKirli = sekmelerRef.current.find((s) => s.id === aktifSekmeIdRef.current)?.kaydedilmedi;
    if (aktifSekmeKirli) {
      if (otomatikKaydetAcik) {
        await sekmeKaydetAsync(aktifSekmeIdRef.current);
      } else {
        setSekmeGecisOnay({
          kaynakSekmeId: aktifSekmeIdRef.current,
          hedefSekmeId: sekmeId,
        });
        return;
      }
    }
    sekmeSecUygula(sekmeId);
  }

  async function modulKaydetHandlerBekle(modulId: string) {
    for (let i = 0; i < 40; i++) {
      if (modulAksiyonVarMi(modulId, 'kaydet')) return true;
      await new Promise((r) => setTimeout(r, 50));
    }
    return false;
  }

  async function sekmeKaydetAsync(sekmeId: string) {
    const liste = sekmelerRef.current;
    const sekme = liste.find((s) => s.id === sekmeId);
    if (!sekme?.kaydedilmedi) return;

    if (aktifSekmeIdRef.current !== sekmeId) {
      sekmeSecHandler(sekmeId);
      await modulKaydetHandlerBekle(sekme.modulId);
    }

    setFocusModulId(sekme.modulId);
    await aksiyonCalistirModul(sekme.modulId, 'kaydet');
    kaydedilmediIsaretle(sekmeId, false);
  }

  function topluKapatUrlSenkron(
    liste: AdminSekme[],
    kapatilacakIds: string[],
    yeniAktifId: string
  ) {
    const mevcutPathModul = modulYolundanBul(location.pathname);
    const kapatilanUrlModulu =
      mevcutPathModul &&
      kapatilacakIds.some((id) => liste.find((s) => s.id === id)?.modulId === mevcutPathModul.id);
    const aktifDegisti = aktifSekmeIdRef.current !== yeniAktifId;

    if (kapatilanUrlModulu || aktifDegisti) {
      const yeniSekme = liste.find((s) => s.id === yeniAktifId);
      const modul = yeniSekme ? modulBul(yeniSekme.modulId) : undefined;
      if (modul) {
        const hedef = modul.yol.replace(/\/+$/, '') || '/gt-admin';
        navigate(hedef, { replace: true });
      }
    }

    for (const id of kapatilacakIds) {
      const kapatilan = liste.find((s) => s.id === id);
      if (kapatilan) sonKapatilanModulRef.current = kapatilan.modulId;
    }
    beklenenSekmeIdRef.current = yeniAktifId;
  }

  async function sekmeKapatUygula(hedefId: string, islem: SekmeSagTikIslem, kaydet: boolean) {
    const liste = sekmelerRef.current;
    const kapatilacak = kapatilacakSekmeIdleri(liste, hedefId, islem);
    if (islem === 'kapat' && liste.length <= 1) {
      setSekmeKapatOnay(null);
      return;
    }
    if (islem !== 'kapat' && kapatilacak.length === 0) {
      setSekmeKapatOnay(null);
      return;
    }

    if (kaydet) {
      setSekmeKapatYukleniyor(true);
      const kirli = kirliKapatilacakSekmeler(liste, kapatilacak);
      for (const sekme of kirli) {
        await sekmeKaydetAsync(sekme.id);
      }
      setSekmeKapatYukleniyor(false);
    }

    if (islem === 'kapat') {
      sekmeKapatHandler(hedefId);
    } else {
      const yeniAktif = sekmeKapatSonrasiAktifId(liste, hedefId, islem, aktifSekmeIdRef.current);
      topluKapatUrlSenkron(liste, kapatilacak, yeniAktif);
      sekmeTopluKapat(kapatilacak, yeniAktif);
    }

    setSekmeKapatOnay(null);
  }

  function sekmeSagTikIslemHandler(hedefId: string, islem: SekmeSagTikIslem) {
    if (islem === 'sonKapananlariGeriGetir') {
      const hedef = sonKapananlariGeriGetir();
      if (!hedef) return;
      const modul = modulBul(hedef.modulId);
      if (!modul) return;
      beklenenSekmeIdRef.current = hedef.id;
      setFocusModulId(modul.id);
      const yol = modul.yol.replace(/\/+$/, '') || '/gt-admin';
      navigate(yol);
      return;
    }

    const liste = sekmelerRef.current;
    const kapatilacak = kapatilacakSekmeIdleri(liste, hedefId, islem);
    if (islem === 'kapat' && liste.length <= 1) return;
    if (islem !== 'kapat' && kapatilacak.length === 0) return;

    const kirli = kirliKapatilacakSekmeler(liste, kapatilacak);
    if (kirli.length > 0) {
      setSekmeKapatOnay({ hedefId, islem, kirliSayisi: kirli.length });
      return;
    }

    void sekmeKapatUygula(hedefId, islem, false);
  }

  useEffect(() => {
    const modul = modulYolundanBul(location.pathname);
    if (!modul) return;

    const liste = sekmelerRef.current;
    const urlDegisti = sonUrlRef.current !== location.pathname;
    sonUrlRef.current = location.pathname;

    if (beklenenSekmeIdRef.current) {
      const beklenenId = beklenenSekmeIdRef.current;
      const beklenenSekme = liste.find((s) => s.id === beklenenId);
      if (!beklenenSekme) {
        beklenenSekmeIdRef.current = null;
      } else if (beklenenSekme.modulId === modul.id) {
        beklenenSekmeIdRef.current = null;
        return;
      } else {
        return;
      }
    }

    if (sonKapatilanModulRef.current) {
      if (sonKapatilanModulRef.current === modul.id) return;
      sonKapatilanModulRef.current = null;
    }

    // Sekme listesi güncellenince (navigate öncesi) eski URL'ye göre aktif sekmeyi geri alma
    if (!urlDegisti) return;

    const aktifModulId = liste.find((s) => s.id === aktifSekmeIdRef.current)?.modulId;
    if (aktifModulId === modul.id) return;

    const mevcutSekme = liste.find((s) => s.modulId === modul.id);
    if (mevcutSekme) {
      setAktifSekmeId(mevcutSekme.id);
      return;
    }

    sekmeAc(modul);
  }, [location.pathname, sekmeAc, setAktifSekmeId]);

  async function logKaydet(islem: string, modulId?: string, aksiyonId?: string) {
    try {
      const mesaj = [islem, modulId && `modul:${modulId}`, aksiyonId && `aksiyon:${aksiyonId}`]
        .filter(Boolean)
        .join(' | ');
      await adminLogApi.kaydet({ mesaj });
      adminBildirimleriYenile();
    } catch {
      // log hatasi paneli bloke etmesin
    }
  }

  async function aksiyonHandler(aksiyonId: string) {
    const modul = modulBul(focusModulId);
    const aksiyon = aksiyonlar.find((a) => a.id === aksiyonId);
    if (!aksiyon) return;

    const basarili = await aksiyonCalistirModul(focusModulId, aksiyonId);
    if (!basarili) return;

    const ozelMesaj = logMesajiAl();
    const mesaj =
      ozelMesaj ??
      varsayilanLogMesaji(modul?.baslik ?? 'Panel', aksiyonId, aksiyon.etiket);

    await logKaydet(mesaj, modul?.id, aksiyonId);
  }

  const sekmeAyir = useCallback(
    (sekmeId: string) => {
      const sekme = sekmeler.find((s) => s.id === sekmeId);
      if (!sekme) return;
      setAyriPencereler((p) => {
        if (p.some((x) => x.sekmeId === sekmeId)) return p;
        return [...p, { sekmeId, modulId: sekme.modulId, baslik: sekme.baslik }];
      });
    },
    [sekmeler]
  );

  function pencereKapat(sekmeId: string) {
    setAyriPencereler((p) => p.filter((x) => x.sekmeId !== sekmeId));
  }

  function pencereDock(sekmeId: string) {
    void sekmeSecHandler(sekmeId);
    pencereKapat(sekmeId);
  }

  function icerikPanel(sekme: AdminSekme, sekmeAktif: boolean, split = false) {
    return (
      <div
        key={sekme.id}
        className={`ap-sekme-split-pane flex min-h-0 min-w-0 flex-1 flex-col ${sekmeAktif ? 'ap-modul-panel-odak' : ''}`}
      >
        {split && (
          <div
            className="ap-sekme-split-baslik flex shrink-0 items-center border-b px-4 py-2 text-xs font-semibold"
            style={{ borderColor: 'var(--ap-border)', background: 'var(--ap-surface)', color: 'var(--ap-heading)' }}
          >
            {sekme.baslik}
          </div>
        )}
        <div
          className="ap-modul-panel min-h-0 flex-1 overflow-y-auto p-6"
          data-ap-kesif="modul-icerik"
          data-ap-kesif-modul={sekme.modulId}
          data-ap-sekme-id={sekme.id}
          data-ap-kesif-aktif={sekmeAktif ? 'true' : undefined}
          onMouseDown={() => setFocusModulId(sekme.modulId)}
          onFocusCapture={() => setFocusModulId(sekme.modulId)}
        >
          <AdminSekmeKabuk sekmeId={sekme.id} kaydedilmediIsaretle={kaydedilmediIsaretle}>
            <AdminModulIcerik modulId={sekme.modulId} onModulAc={modulSecHandler} />
          </AdminSekmeKabuk>
        </div>
      </div>
    );
  }

  return (
    <SistemKesifProvider onModulAc={modulSecHandler}>
    <div
      className={`admin-panel flex h-screen min-h-0 w-full flex-col overflow-hidden${kenarlikAyar.neon ? ' admin-panel--kenarlik-neon' : ''}`}
      data-tema={tema}
      style={panelStil}
    >
      <AdminHeader
        sekmeler={sekmeler}
        aktifSekmeId={aktifSekmeId}
        kapananGecmisSayisi={kapananGecmisSayisi}
        onSekmeSec={sekmeSecHandler}
        onSekmeKapat={sekmeKapatHandler}
        onSekmeTasi={sekmeTasi}
        onSekmeBirlestir={sekmeBirlestir}
        onModulSec={modulAcHandler}
        onSekmeAyir={sekmeAyarlari.surukleAyirPencere ? sekmeAyir : undefined}
        onSekmeSagTikIslem={sekmeSagTikIslemHandler}
        baslatMenuAcik={baslatMenuAcik}
        onBaslatMenuAcikDegistir={setBaslatMenuAcik}
      />

      <div className="ap-govde-alan flex min-h-0 flex-1 overflow-hidden">
        <main className="ap-scroll flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--ap-bg)]">
          {splitSekmeler ? (
            <div className="ap-sekme-split-alan flex min-h-0 flex-1">
              {splitSekmeler.map((sekme) => icerikPanel(sekme, aktifSekmeId === sekme.id, true))}
            </div>
          ) : (
            aktifModul &&
            !ayriPencereler.some((p) => p.sekmeId === aktifSekmeId) &&
            icerikPanel(
              aktifSekme ?? { id: aktifSekmeId, modulId: aktifModul.id, baslik: aktifModul.baslik },
              true
            )
          )}
          <Outlet context={{ aktifModul }} />
        </main>
      </div>

      {ayriPencereler.map((pencere) => (
        <div key={pencere.sekmeId} className="ap-ayri-pencere">
          <div className="ap-ayri-pencere-baslik flex items-center justify-between">
            <span className="ap-heading text-sm font-semibold">{pencere.baslik}</span>
            <div className="flex gap-2">
              <button type="button" className="text-xs text-blue-400 hover:underline" onClick={() => pencereDock(pencere.sekmeId)}>
                Dock et
              </button>
              <button type="button" className="text-xs text-slate-400 hover:text-white" onClick={() => pencereKapat(pencere.sekmeId)}>
                ×
              </button>
            </div>
          </div>
          <div
            className="ap-ayri-pencere-icerik overflow-y-auto p-4"
            onMouseDown={() => setFocusModulId(pencere.modulId)}
          >
            <AdminSekmeKabuk sekmeId={pencere.sekmeId} kaydedilmediIsaretle={kaydedilmediIsaretle}>
              <AdminModulIcerik modulId={pencere.modulId} onModulAc={modulSecHandler} />
            </AdminSekmeKabuk>
          </div>
        </div>
      ))}

      <AltAksiyonCubugu
        aksiyonlar={aksiyonlar}
        onAksiyon={(id) => void aksiyonHandler(id)}
        onModulAc={modulSecHandler}
        focusModulId={focusModulId}
        onRehberAc={() => setRehberAcik(true)}
      />

      <ModulRehberSistemi modulId={focusModulId} zorlaAcik={rehberAcik} onAcikDegisti={setRehberAcik} gizliButon />

      <AdminSagTikMenuKabuk
        onModulAc={modulSecHandler}
        onKaydet={() => void aksiyonCalistir('kaydet')}
        onGuncelle={() => void aksiyonCalistir('guncelle')}
        onTemaDegistir={temaDegistir}
      />

      <SekmeKapatOnayModal
        acik={sekmeKapatOnay !== null}
        kirliSayisi={sekmeKapatOnay?.kirliSayisi ?? 0}
        yukleniyor={sekmeKapatYukleniyor}
        onKapat={() => !sekmeKapatYukleniyor && setSekmeKapatOnay(null)}
        onKaydetVeKapat={() => {
          if (!sekmeKapatOnay) return;
          void sekmeKapatUygula(sekmeKapatOnay.hedefId, sekmeKapatOnay.islem, true);
        }}
        onKaydetmedenKapat={() => {
          if (!sekmeKapatOnay) return;
          void sekmeKapatUygula(sekmeKapatOnay.hedefId, sekmeKapatOnay.islem, false);
        }}
      />
      <SekmeGecisOnayModal
        acik={sekmeGecisOnay !== null}
        yukleniyor={sekmeGecisYukleniyor}
        onKapat={() => !sekmeGecisYukleniyor && setSekmeGecisOnay(null)}
        onKaydetVeGec={() => {
          if (!sekmeGecisOnay) return;
          void (async () => {
            setSekmeGecisYukleniyor(true);
            await sekmeKaydetAsync(sekmeGecisOnay.kaynakSekmeId);
            setSekmeGecisYukleniyor(false);
            const hedefSekmeId = sekmeGecisOnay.hedefSekmeId;
            const hedefModulId = sekmeGecisOnay.hedefModulId;
            setSekmeGecisOnay(null);
            if (hedefSekmeId) sekmeSecUygula(hedefSekmeId);
            if (hedefModulId) {
              const modul = modulBul(hedefModulId);
              if (modul) modulAcUygula(modul);
            }
          })();
        }}
        onKaydetmedenGec={() => {
          if (!sekmeGecisOnay) return;
          const hedefSekmeId = sekmeGecisOnay.hedefSekmeId;
          const hedefModulId = sekmeGecisOnay.hedefModulId;
          setSekmeGecisOnay(null);
          if (hedefSekmeId) sekmeSecUygula(hedefSekmeId);
          if (hedefModulId) {
            const modul = modulBul(hedefModulId);
            if (modul) modulAcUygula(modul);
          }
        }}
      />
    </div>
    </SistemKesifProvider>
  );
}

function AdminSagTikMenuKabuk({
  onModulAc,
  onKaydet,
  onGuncelle,
  onTemaDegistir,
}: {
  onModulAc: (modulId: string) => void;
  onKaydet: () => void;
  onGuncelle: () => void;
  onTemaDegistir: () => void;
}) {
  const kesif = useSistemKesifOptional();
  const aksiyonlar = useMemo(
    () => ({
      onModulAc,
      onKaydet,
      onGuncelle,
      onTemaDegistir,
      onSistemKesif: () => kesif?.modalAc(),
    }),
    [onModulAc, onKaydet, onGuncelle, onTemaDegistir, kesif]
  );
  return <AdminSagTikMenu aksiyonlar={aksiyonlar} />;
}

function AdminLayoutIcerik() {
  const { kullanici, yukleniyor } = useAuth();
  const { tema } = useAdminTema();

  if (yukleniyor) {
    return (
      <div className="admin-panel flex h-screen items-center justify-center" data-tema={tema}>
        <span className="ap-muted">Yükleniyor...</span>
      </div>
    );
  }

  if (!kullanici) {
    return <GirisSayfasi />;
  }

  return (
    <SagTikPanelProvider>
      <AdminPanelGovde />
    </SagTikPanelProvider>
  );
}

export function AdminLayout() {
  return (
    <AdminTemaProvider>
      <AdminAksiyonProvider>
        <ModulKatalogProvider>
          <AdminUyariBildirimProvider>
            <PanelDilKabuk>
              <AdminLayoutIcerik />
            </PanelDilKabuk>
          </AdminUyariBildirimProvider>
        </ModulKatalogProvider>
      </AdminAksiyonProvider>
    </AdminTemaProvider>
  );
}
