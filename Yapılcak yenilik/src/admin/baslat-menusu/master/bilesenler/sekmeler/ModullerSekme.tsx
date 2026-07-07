import { useCallback, useEffect, useMemo, useState } from 'react';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import {
  MasterUstFiltreSatiri,
  useMasterKartDurumFiltre,
} from '@/admin/baslat-menusu/master/bilesenler/MasterKartUstAksiyon';
import {
  BOS_MODUL_TASLAK,
  ModulYeniKart,
  modulTaslakDogrula,
  type ModulYeniTaslak,
} from '@/admin/baslat-menusu/master/bilesenler/ModulYeniKart';
import {
  masterModulGuncelle,
  masterModulOlustur,
  masterModulSil,
  masterModulleriGetir,
  type MasterModul,
} from '@/admin/baslat-menusu/master/moduller/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { modulKatalogYenile } from '@/baglamlar/ModulKatalogContext';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';

export function ModullerSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [moduller, setModuller] = useState<MasterModul[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [eklemeAcik, setEklemeAcik] = useState(false);
  const [yeniTaslak, setYeniTaslak] = useState<ModulYeniTaslak>(BOS_MODUL_TASLAK);
  const [prefixElle, setPrefixElle] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);
  const [seciliId, setSeciliId] = useState<number | null>(null);

  useMasterKartDurumFiltre(filtre, setFiltre);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const veri = await masterModulleriGetir();
      setModuller(veri.moduller);
      setSeciliId((onceki) => {
        if (onceki !== null && !veri.moduller.some((m) => m.id === onceki)) return null;
        return onceki;
      });
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Modüller alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const mevcutPrefixler = useMemo(() => moduller.map((m) => m.prefix), [moduller]);

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return moduller.filter((m) => {
      if (filtre === 'aktif' && !m.aktif) return false;
      if (filtre === 'pasif' && m.aktif) return false;
      if (!q) return true;
      return m.ad.toLowerCase().includes(q) || m.prefix.includes(q);
    });
  }, [moduller, arama, filtre]);

  const seciliModul = useMemo(
    () => (seciliId !== null ? moduller.find((m) => m.id === seciliId) ?? null : null),
    [moduller, seciliId]
  );

  const ekleAc = useCallback(() => {
    setEklemeAcik(true);
    setYeniTaslak(BOS_MODUL_TASLAK);
    setPrefixElle(false);
    setSeciliId(null);
  }, []);

  const iptalEkle = useCallback(() => {
    setEklemeAcik(false);
    setYeniTaslak(BOS_MODUL_TASLAK);
    setPrefixElle(false);
  }, []);

  async function durumDegistir(modul: MasterModul, aktif: boolean) {
    setIslemId(modul.id);
    try {
      await masterModulGuncelle(modul.id, { aktif });
      setModuller((onceki) => onceki.map((m) => (m.id === modul.id ? { ...m, aktif } : m)));
      modulKatalogYenile();
      basariBildir(`${modul.ad} ${aktif ? 'aktif' : 'pasif'} yapıldı.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Durum güncellenemedi');
      await yukle();
    } finally {
      setIslemId(null);
    }
  }

  const yeniKaydet = useCallback(async () => {
    const sonuc = modulTaslakDogrula(yeniTaslak, mevcutPrefixler);
    if (sonuc.hata || !sonuc.girdi) {
      hataBildir(sonuc.hata ?? 'Geçersiz form');
      return;
    }

    setKaydediliyor(true);
    try {
      const { modul } = await masterModulOlustur(sonuc.girdi);
      setEklemeAcik(false);
      setYeniTaslak(BOS_MODUL_TASLAK);
      setPrefixElle(false);
      await yukle();
      modulKatalogYenile();
      setSeciliId(modul.id);
      basariBildir(`${modul.ad} eklendi — ${modul.rolSayisi} rol otomatik oluşturuldu.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Modül eklenemedi');
    } finally {
      setKaydediliyor(false);
    }
  }, [yeniTaslak, mevcutPrefixler, yukle, basariBildir, hataBildir]);

  const modulSil = useCallback(async () => {
    if (!seciliModul) return;
    if (!confirm(`"${seciliModul.ad}" modülünü silmek istediğinize emin misiniz? İlişkili roller de kaldırılır.`)) {
      return;
    }
    setIslemId(seciliModul.id);
    try {
      await masterModulSil(seciliModul.id);
      setSeciliId(null);
      await yukle();
      modulKatalogYenile();
      basariBildir(`${seciliModul.ad} silindi.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Modül silinemedi');
    } finally {
      setIslemId(null);
    }
  }, [seciliModul, yukle, basariBildir, hataBildir]);

  const islemde = kaydediliyor || islemId !== null;
  const kirli = eklemeAcik;

  useModulAksiyonlari(
    {
      ekle: ekleAc,
      kaydet: yeniKaydet,
      sil: eklemeAcik ? iptalEkle : modulSil,
    },
    {
      kaydet: eklemeAcik && !kaydediliyor,
      ekle: !islemde && !eklemeAcik,
      sil: (eklemeAcik || !!seciliModul) && !islemde,
    },
    kirli
  );

  if (yukleniyor) return <YukleniyorDurumu mesaj="Modüller yükleniyor…" />;
  if (hata) return <HataDurumu mesaj={hata} />;

  const kartGoster = eklemeAcik || liste.length > 0;

  return (
    <div className="ap-master-sekme">
      <MasterUstFiltreSatiri
        arama={arama}
        onArama={setArama}
        placeholder="Modül adı veya prefix ara…"
        sag={null}
      />

      {!kartGoster ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu' ? 'Filtreye uygun modül bulunamadı.' : 'Henüz modül kaydı yok. Alt çubuktan Yeni Ekle ile başlayın.'}
          </p>
        </div>
      ) : (
        <div className="ap-master-kart-grid">
          {eklemeAcik && (
            <ModulYeniKart
              taslak={yeniTaslak}
              mevcutPrefixler={mevcutPrefixler}
              prefixElle={prefixElle}
              kaydediliyor={kaydediliyor}
              onTaslakDegistir={setYeniTaslak}
              onPrefixElleDegistir={setPrefixElle}
            />
          )}

          {liste.map((m) => (
            <article
              key={m.id}
              role="button"
              tabIndex={0}
              className={`ap-master-kart ap-master-modul-kart ap-master-kart-tiklanabilir ${
                seciliId === m.id ? 'ap-master-kart-secili' : ''
              } ${!m.aktif ? 'ap-master-modul-kart-pasif' : ''}`}
              onClick={() => {
                if (eklemeAcik) iptalEkle();
                setSeciliId(m.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (eklemeAcik) iptalEkle();
                  setSeciliId(m.id);
                }
              }}
            >
              <div className="ap-master-kart-ust">
                <span className="ap-master-kart-ikon">🧩</span>
                <span className={`ap-master-durum ${m.aktif ? 'ap-master-durum-aktif' : ''}`}>
                  {m.aktif ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <h3 className="ap-heading text-sm font-semibold">{m.ad}</h3>
              <p className="ap-muted mt-1 font-mono text-xs">{m.prefix}</p>

              <div className="ap-master-modul-toggle ap-master-modul-toggle-sade" onClick={(e) => e.stopPropagation()}>
                <DurumAnahtari
                  etiket={m.aktif ? 'Aktif modül' : 'Pasif modül'}
                  acik={m.aktif}
                  devreDisi={islemId === m.id}
                  onChange={(v) => void durumDegistir(m, v)}
                  renk={m.aktif ? 'yesil' : 'turuncu'}
                  sadeceToggle
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
