import { useCallback, useEffect, useMemo, useState } from 'react';
import { TanimlarMasaGrubuAyarlarPanel } from '@/admin/baslat-menusu/tanimlar/bilesenler/masa-gruplari/TanimlarMasaGrubuAyarlarPanel';
import { TanimlarMasaGrubuExcelTablo } from '@/admin/baslat-menusu/tanimlar/bilesenler/masa-gruplari/TanimlarMasaGrubuExcelTablo';
import { TanimlarUyariSeridi } from '@/admin/baslat-menusu/tanimlar/bilesenler/kullanicilar/TanimlarUyariSeridi';
import { masaGrubuKaydiKaydet, masaGrubuKaydiOku } from '@/admin/baslat-menusu/tanimlar/masa-gruplari/yardimci';
import {
  bosMasaGrubuAyarlar,
  masaGrubuAyarlarKopyala,
  type TanimlarMasaGrubu,
  type TanimlarMasaGrubuAlan,
  type TanimlarMasaGrubuAyarlar,
  type TanimlarMasaGrubuKayit,
} from '@/admin/baslat-menusu/tanimlar/masa-gruplari/tipler';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

type Gorunum = 'liste' | 'ayarlar';

const YENI_SATIR_ID = 0;

function sonrakiId(liste: TanimlarMasaGrubu[]) {
  return liste.reduce((max, g) => Math.max(max, g.id), 0) + 1;
}

function hucreDeger(g: TanimlarMasaGrubu, alan: TanimlarMasaGrubuAlan): string {
  if (alan === 'masaSayisi') return String(g.masaSayisi);
  return g[alan];
}

export function TanimlarMasaGruplariSekme({ onKirliDegisti }: { onKirliDegisti?: (kirli: boolean) => void }) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayit, setKayit] = useState<TanimlarMasaGrubuKayit>(() => masaGrubuKaydiOku());
  const [sonKayitli, setSonKayitli] = useState<TanimlarMasaGrubuKayit>(() => masaGrubuKaydiOku());
  const [gorunum, setGorunum] = useState<Gorunum>('liste');
  const [ayarGrupId, setAyarGrupId] = useState<number | null>(null);
  const [seciliId, setSeciliId] = useState<number | null>(1);
  const [aktifHucre, setAktifHucre] = useState<{ id: number; alan: TanimlarMasaGrubuAlan } | null>(null);
  const [hucreTaslak, setHucreTaslak] = useState('');
  const [uyariMesaji, setUyariMesaji] = useState<string | null>(null);

  const ayarGrup = useMemo(
    () => (ayarGrupId != null ? kayit.gruplar.find((g) => g.id === ayarGrupId) ?? null : null),
    [ayarGrupId, kayit.gruplar]
  );

  const hucreIptal = useCallback(() => {
    setAktifHucre(null);
    setHucreTaslak('');
  }, []);

  const listeGorunumuneDon = useCallback(() => {
    setGorunum('liste');
    setAyarGrupId(null);
  }, []);

  const hucreBaslat = useCallback((grup: TanimlarMasaGrubu | null, alan: TanimlarMasaGrubuAlan) => {
    if (!grup) {
      setAktifHucre({ id: YENI_SATIR_ID, alan });
      setHucreTaslak('');
      return;
    }
    setAktifHucre({ id: grup.id, alan });
    setHucreTaslak(hucreDeger(grup, alan));
  }, []);

  const yeniGrupEkle = useCallback(
    (grup: string, prefixIsimler: string, masaSayisi: number) => {
      const id = sonrakiId(kayit.gruplar);
      const yeni: TanimlarMasaGrubu = { id, grup, prefixIsimler, masaSayisi };
      setKayit((onceki) => ({
        gruplar: [...onceki.gruplar, yeni],
        ayarlar: { ...onceki.ayarlar, [id]: bosMasaGrubuAyarlar() },
      }));
      setSeciliId(id);
    },
    [kayit.gruplar]
  );

  const hucreBitir = useCallback(() => {
    if (!aktifHucre) return;
    const { id, alan } = aktifHucre;
    const ham = hucreTaslak.trim();

    if (id === YENI_SATIR_ID) {
      if (alan !== 'grup' || !ham) {
        hucreIptal();
        return;
      }
      yeniGrupEkle(ham, '', 0);
      hucreIptal();
      return;
    }

    const mevcut = kayit.gruplar.find((g) => g.id === id);
    if (!mevcut) {
      hucreIptal();
      return;
    }

    if (alan === 'grup' && ham.length < 1) {
      hataBildir('Grup adı boş olamaz');
      return;
    }

    const yeniDeger = alan === 'masaSayisi' ? Math.max(0, Number.parseInt(ham, 10) || 0) : ham;
    const eskiDeger = alan === 'masaSayisi' ? mevcut.masaSayisi : mevcut[alan];

    if (eskiDeger === yeniDeger) {
      hucreIptal();
      return;
    }

    setKayit((onceki) => ({
      ...onceki,
      gruplar: onceki.gruplar.map((g) => (g.id === id ? { ...g, [alan]: yeniDeger } : g)),
    }));
    hucreIptal();
  }, [aktifHucre, hucreTaslak, kayit.gruplar, hucreIptal, hataBildir, yeniGrupEkle]);

  const ayarlarAc = useCallback(
    (grup: TanimlarMasaGrubu) => {
      if (gorunum === 'ayarlar' && ayarGrupId === grup.id) {
        listeGorunumuneDon();
        return;
      }
      setAyarGrupId(grup.id);
      setGorunum('ayarlar');
    },
    [gorunum, ayarGrupId, listeGorunumuneDon]
  );

  const ayarlarGuncelle = useCallback((ayarlar: TanimlarMasaGrubuAyarlar) => {
    if (ayarGrupId == null) return;
    setKayit((onceki) => ({
      ...onceki,
      ayarlar: { ...onceki.ayarlar, [ayarGrupId]: masaGrubuAyarlarKopyala(ayarlar) },
    }));
  }, [ayarGrupId]);

  const kirli = useMemo(
    () => JSON.stringify(kayit) !== JSON.stringify(sonKayitli) || aktifHucre != null,
    [kayit, sonKayitli, aktifHucre]
  );

  useEffect(() => {
    onKirliDegisti?.(kirli);
  }, [kirli, onKirliDegisti]);

  const kaydet = useCallback(() => {
    masaGrubuKaydiKaydet(kayit);
    setSonKayitli(JSON.parse(JSON.stringify(kayit)) as TanimlarMasaGrubuKayit);
    basariBildir('Masa grupları kaydedildi.');
  }, [kayit, basariBildir]);

  const grupSil = useCallback(() => {
    if (seciliId == null || seciliId === YENI_SATIR_ID) {
      hataBildir('Silmek için bir masa grubu seçin.');
      return;
    }
    const yeniGruplar = kayit.gruplar.filter((g) => g.id !== seciliId);
    const { [seciliId]: _silinen, ...kalanAyarlar } = kayit.ayarlar;
    setKayit({ gruplar: yeniGruplar, ayarlar: kalanAyarlar });
    setSeciliId(yeniGruplar[0]?.id ?? null);
    basariBildir('Masa grubu silindi.');
  }, [seciliId, kayit, hataBildir, basariBildir]);

  const yeniEkle = useCallback(() => {
    if (gorunum !== 'liste') {
      listeGorunumuneDon();
    }
    setSeciliId(YENI_SATIR_ID);
    hucreBaslat(null, 'grup');
  }, [gorunum, listeGorunumuneDon, hucreBaslat]);

  useModulAksiyonlari(
    gorunum === 'liste' ? { kaydet, ekle: yeniEkle, sil: grupSil } : { kaydet },
    {
      kaydet: kirli,
      ekle: gorunum === 'liste',
      sil: gorunum === 'liste' && seciliId != null && seciliId !== YENI_SATIR_ID,
    },
    kirli
  );

  return (
    <div className="ap-tanimlar-masa-grup-sekme">
      {uyariMesaji && <TanimlarUyariSeridi mesaj={uyariMesaji} onKapat={() => setUyariMesaji(null)} />}

      <div className="ap-tanimlar-yan-gecis">
        <div className={`ap-tanimlar-yan-gecis-izgara ${gorunum !== 'liste' ? 'ap-tanimlar-yan-gecis-aktif' : ''}`}>
          <div className="ap-tanimlar-yan-gecis-panel">
            <p className="ap-muted mb-3 text-xs">
              Satır seçmek için tıklayın; Grup, Prefix ve Masa Sayısı alanlarını çift tıklayarak düzenleyin.
              Alt çubuktan <strong className="ap-heading">Yeni Ekle</strong> ile yeni masa grubu satırı açabilirsiniz.
            </p>

            <TanimlarMasaGrubuExcelTablo
              gruplar={kayit.gruplar}
              seciliId={seciliId}
              aktifHucre={aktifHucre}
              hucreTaslak={hucreTaslak}
              onSatirSec={setSeciliId}
              onHucreBaslat={hucreBaslat}
              onHucreTaslak={setHucreTaslak}
              onHucreBitir={hucreBitir}
              onAyarlar={ayarlarAc}
            />
          </div>

          <div className="ap-tanimlar-yan-gecis-panel">
            {gorunum === 'ayarlar' && ayarGrup && (
              <TanimlarMasaGrubuAyarlarPanel
                grup={ayarGrup}
                ayarlar={kayit.ayarlar[ayarGrup.id] ?? bosMasaGrubuAyarlar()}
                onAyarlarDegistir={ayarlarGuncelle}
                onGeri={listeGorunumuneDon}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
