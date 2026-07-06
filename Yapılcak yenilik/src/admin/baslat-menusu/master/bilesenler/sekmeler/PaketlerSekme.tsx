import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import { DuzenleIkonu } from '@/admin/baslat-menusu/master/bilesenler/DuzenleIkonu';
import { MasterTabloSayfalama } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSayfalama';
import { MasterTabloSutunAyarlari } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSutunAyarlari';
import {
  MasterUstFiltreSatiri,
  useMasterKartDurumFiltre,
} from '@/admin/baslat-menusu/master/bilesenler/MasterKartUstAksiyon';
import {
  PaketKayitPanel,
  BOS_PAKET_PANEL,
  ondalikKabul,
  paketPaneldenGirdi,
  pakettenPanel,
  tamSayiKabul,
  type PaketPanelForm,
} from '@/admin/baslat-menusu/master/bilesenler/PaketKayitPanel';
import { BOS_PAKET_TASLAK, PaketYeniKart } from '@/admin/baslat-menusu/master/bilesenler/PaketYeniKart';
import {
  masterPaketGuncelle,
  masterPaketOlustur,
  masterPaketleriGetir,
  masterPaketSil,
  type MasterPaket,
  type PaketFormGirdi,
} from '@/admin/baslat-menusu/master/paketler/api';
import {
  PAKET_KART_ALANLARI,
  PAKET_KART_VARSAYILAN_SIRA,
  paketKartAlanlariKaydet,
  paketKartAlanlariOku,
} from '@/admin/baslat-menusu/master/paketler/paketKartAlanlari';
import { paketParaBirimiNormallestir, paketParaBirimiSembol } from '@/admin/baslat-menusu/master/paketler/paraBirimi';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

type PaketInlineAlan = 'paketAdi' | 'subeSayisi' | 'personelSayisi' | 'masaSayisi' | 'fiyat';

interface KartHucreProps {
  alan: PaketInlineAlan;
  gosterim: string;
  duzenlemeAktif: boolean;
  inputDeger: string;
  onBasla: () => void;
  onDegistir: (deger: string) => void;
  onBitir: () => void;
  className?: string;
  ondalik?: boolean;
}

function KartHucre({
  alan,
  gosterim,
  duzenlemeAktif,
  inputDeger,
  onBasla,
  onDegistir,
  onBitir,
  className = '',
  ondalik = false,
}: KartHucreProps) {
  function tusBas(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      onBitir();
    }
  }

  if (duzenlemeAktif) {
    return (
      <input
        type="text"
        inputMode={ondalik ? 'decimal' : 'numeric'}
        className={`${formInputSinifi} ap-master-excel-input w-full`}
        value={inputDeger}
        onChange={(e) => {
          const v = ondalik ? e.target.value.replace(',', '.') : e.target.value;
          if (ondalik ? ondalikKabul(v) : tamSayiKabul(v)) onDegistir(v);
        }}
        onBlur={onBitir}
        onKeyDown={tusBas}
        onClick={(e) => e.stopPropagation()}
        autoFocus
        aria-label={alan}
      />
    );
  }

  return (
    <span
      className={`ap-master-excel-hucre-tiklanabilir ${className}`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onBasla();
      }}
      title="Düzenlemek için çift tıklayın"
    >
      {gosterim}
    </span>
  );
}

export function PaketlerSekme() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [paketler, setPaketler] = useState<MasterPaket[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [gorunurAlanlar, setGorunurAlanlar] = useState(() => paketKartAlanlariOku());
  const [sayfa, setSayfa] = useState(0);
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [seciliId, setSeciliId] = useState<number | null>(null);
  const [eklemeAcik, setEklemeAcik] = useState(false);
  const [yeniTaslak, setYeniTaslak] = useState<PaketPanelForm>(BOS_PAKET_TASLAK);
  const [duzenlenen, setDuzenlenen] = useState<MasterPaket | null>(null);
  const [panelForm, setPanelForm] = useState<PaketPanelForm>(BOS_PAKET_PANEL);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);
  const [taslakMap, setTaslakMap] = useState<Record<number, Partial<PaketFormGirdi>>>({});
  const [duzenlemeHucre, setDuzenlemeHucre] = useState<{ paketId: number; alan: PaketInlineAlan } | null>(null);
  const [duzenlemeMetin, setDuzenlemeMetin] = useState('');

  const panelAcik = duzenlenen != null;

  useMasterKartDurumFiltre(filtre, setFiltre);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const veri = await masterPaketleriGetir();
      setPaketler(veri.paketler ?? []);
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Paketler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  useEffect(() => {
    setSayfa(0);
  }, [arama, filtre, sayfaBoyutu]);

  const liste = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return paketler.filter((p) => {
      if (filtre === 'aktif' && !p.aktif) return false;
      if (filtre === 'pasif' && p.aktif) return false;
      if (!q) return true;
      return p.paketAdi.toLowerCase().includes(q);
    });
  }, [paketler, arama, filtre]);

  const sayfalanmisListe = useMemo(() => {
    const bas = sayfa * sayfaBoyutu;
    return liste.slice(bas, bas + sayfaBoyutu);
  }, [liste, sayfa, sayfaBoyutu]);

  const seciliTaslak = seciliId != null ? taslakMap[seciliId] : undefined;
  const seciliDegisiklikVar = seciliTaslak != null && Object.keys(seciliTaslak).length > 0;

  function paketBirlestir(paket: MasterPaket): MasterPaket {
    const taslak = taslakMap[paket.id];
    return {
      ...paket,
      paketAdi: taslak?.paketAdi ?? paket.paketAdi,
      subeSayisi: taslak?.subeSayisi ?? paket.subeSayisi,
      personelSayisi: taslak?.personelSayisi ?? paket.personelSayisi,
      masaSayisi: taslak?.masaSayisi ?? paket.masaSayisi,
      fiyat: taslak?.fiyat ?? paket.fiyat,
      paraBirimi: paketParaBirimiNormallestir(taslak?.paraBirimi ?? paket.paraBirimi),
    };
  }

  const hucreBasla = useCallback((paketId: number, alan: PaketInlineAlan, mevcut: string) => {
    if (eklemeAcik || panelAcik) return;
    setSeciliId(paketId);
    setDuzenlemeHucre({ paketId, alan });
    setDuzenlemeMetin(mevcut);
  }, [eklemeAcik, panelAcik]);

  const hucreBitir = useCallback(() => {
    if (!duzenlemeHucre) {
      setDuzenlemeMetin('');
      return;
    }

    const { paketId, alan } = duzenlemeHucre;
    const ham = duzenlemeMetin.trim();

    setTaslakMap((onceki) => {
      const mevcut = onceki[paketId] ?? {};
      if (alan === 'paketAdi') {
        if (!ham) return onceki;
        return { ...onceki, [paketId]: { ...mevcut, paketAdi: ham } };
      }
      if (alan === 'fiyat') {
        if (ham === '') return onceki;
        const fiyat = Number(ham);
        if (Number.isNaN(fiyat) || fiyat < 0) return onceki;
        return { ...onceki, [paketId]: { ...mevcut, fiyat } };
      }
      if (ham === '') return onceki;
      const n = Number(ham);
      if (!Number.isInteger(n) || n < 1) return onceki;
      const anahtar = alan as 'subeSayisi' | 'personelSayisi' | 'masaSayisi';
      return { ...onceki, [paketId]: { ...mevcut, [anahtar]: n } };
    });

    setDuzenlemeHucre(null);
    setDuzenlemeMetin('');
  }, [duzenlemeHucre, duzenlemeMetin]);

  const panelIptal = useCallback(() => {
    setDuzenlenen(null);
    setPanelForm(BOS_PAKET_PANEL);
    setDuzenlemeHucre(null);
    setDuzenlemeMetin('');
  }, []);

  const iptalEkle = useCallback(() => {
    setEklemeAcik(false);
    setYeniTaslak(BOS_PAKET_TASLAK);
    setDuzenlemeHucre(null);
    setDuzenlemeMetin('');
  }, []);

  const yeniPaket = useCallback(() => {
    setEklemeAcik(true);
    setYeniTaslak(BOS_PAKET_TASLAK);
    setDuzenlenen(null);
    setPanelForm(BOS_PAKET_PANEL);
    setSeciliId(null);
    setDuzenlemeHucre(null);
    setDuzenlemeMetin('');
    setSayfa(0);
  }, []);

  const paketDuzenle = useCallback((paket: MasterPaket) => {
    setEklemeAcik(false);
    setDuzenlenen(paket);
    setPanelForm(pakettenPanel(paket));
    setSeciliId(paket.id);
    setDuzenlemeHucre(null);
    setDuzenlemeMetin('');
  }, []);

  const inlineKaydet = useCallback(async () => {
    if (seciliId == null || !seciliDegisiklikVar || !seciliTaslak) return;

    const ad = seciliTaslak.paketAdi?.trim();
    if (ad != null && ad.length < 2) {
      hataBildir('Paket adı en az 2 karakter olmalı');
      return;
    }
    for (const [alan, etiket] of [
      ['subeSayisi', 'Şube sayısı'],
      ['personelSayisi', 'Personel sayısı'],
      ['masaSayisi', 'Masa sayısı'],
    ] as const) {
      const n = seciliTaslak[alan];
      if (n != null && (!Number.isInteger(n) || n < 1)) {
        hataBildir(`${etiket} en az 1 olmalı`);
        return;
      }
    }
    if (seciliTaslak.fiyat != null && (Number.isNaN(seciliTaslak.fiyat) || seciliTaslak.fiyat < 0)) {
      hataBildir('Geçerli bir fiyat girin');
      return;
    }

    setKaydediliyor(true);
    try {
      await masterPaketGuncelle(seciliId, seciliTaslak);
      setTaslakMap((onceki) => {
        const yeni = { ...onceki };
        delete yeni[seciliId];
        return yeni;
      });
      await yukle();
      basariBildir('Değişiklikler kaydedildi.');
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, seciliDegisiklikVar, seciliTaslak, yukle, basariBildir, hataBildir]);

  const yeniKaydet = useCallback(async () => {
    const sonuc = paketPaneldenGirdi(yeniTaslak);
    if (sonuc.hata || !sonuc.girdi) {
      hataBildir(sonuc.hata ?? 'Geçersiz form');
      return;
    }

    setKaydediliyor(true);
    try {
      const { paket } = await masterPaketOlustur(sonuc.girdi);
      setEklemeAcik(false);
      setYeniTaslak(BOS_PAKET_TASLAK);
      await yukle();
      setSeciliId(paket.id);
      basariBildir(`${sonuc.girdi.paketAdi} eklendi.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [yeniTaslak, yukle, basariBildir, hataBildir]);

  const panelKaydet = useCallback(async () => {
    if (!duzenlenen) return;

    const sonuc = paketPaneldenGirdi(panelForm);
    if (sonuc.hata || !sonuc.girdi) {
      hataBildir(sonuc.hata ?? 'Geçersiz form');
      return;
    }

    setKaydediliyor(true);
    try {
      await masterPaketGuncelle(duzenlenen.id, sonuc.girdi);
      setTaslakMap((onceki) => {
        const yeni = { ...onceki };
        delete yeni[duzenlenen.id];
        return yeni;
      });
      basariBildir(`${sonuc.girdi.paketAdi} güncellendi.`);
      panelIptal();
      await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [panelForm, duzenlenen, panelIptal, yukle, basariBildir, hataBildir]);

  const paketSil = useCallback(async () => {
    if (seciliId == null) return;
    const paket = paketler.find((p) => p.id === seciliId);
    if (!paket) return;
    if (!confirm(`"${paket.paketAdi}" paketini silmek istediğinize emin misiniz?`)) return;

    setKaydediliyor(true);
    try {
      await masterPaketSil(seciliId);
      setSeciliId(null);
      setDuzenlenen(null);
      setEklemeAcik(false);
      setTaslakMap((onceki) => {
        const yeni = { ...onceki };
        delete yeni[seciliId];
        return yeni;
      });
      await yukle();
      basariBildir(`${paket.paketAdi} silindi.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, paketler, yukle, basariBildir, hataBildir]);

  const alanlariDegistir = useCallback((sira: string[]) => {
    setGorunurAlanlar(sira);
    paketKartAlanlariKaydet(sira);
  }, []);

  const islemde = kaydediliyor || islemId !== null;
  const kirli = panelAcik || eklemeAcik || seciliDegisiklikVar;

  useModulAksiyonlari(
    {
      ekle: yeniPaket,
      sil: eklemeAcik ? iptalEkle : panelAcik ? panelIptal : paketSil,
      kaydet: eklemeAcik ? yeniKaydet : panelAcik ? panelKaydet : inlineKaydet,
    },
    {
      ekle: !islemde && !eklemeAcik && !panelAcik,
      sil: (eklemeAcik || panelAcik || seciliId != null) && !islemde && !seciliDegisiklikVar,
      kaydet: eklemeAcik
        ? !kaydediliyor
        : panelAcik
          ? !kaydediliyor
          : seciliDegisiklikVar && !kaydediliyor,
    },
    kirli
  );

  async function durumDegistir(p: MasterPaket, aktif: boolean) {
    setIslemId(p.id);
    try {
      await masterPaketGuncelle(p.id, { aktif });
      await yukle();
      basariBildir(`${p.paketAdi} ${aktif ? 'aktif' : 'pasif'} yapıldı.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Durum güncellenemedi');
    } finally {
      setIslemId(null);
    }
  }

  if (yukleniyor) return <YukleniyorDurumu mesaj="Paketler yükleniyor…" />;
  if (hata) return <HataDurumu mesaj={hata} />;

  const kartGoster = eklemeAcik || liste.length > 0;

  return (
    <div className="ap-master-sekme">
      <MasterUstFiltreSatiri
        arama={arama}
        onArama={setArama}
        placeholder="Paket adı ara…"
        sag={
          <MasterTabloSutunAyarlari
            baslik="Paket kartı alanları"
            sutunlar={PAKET_KART_ALANLARI}
            gorunurSira={gorunurAlanlar}
            varsayilanSira={PAKET_KART_VARSAYILAN_SIRA}
            onDegistir={alanlariDegistir}
          />
        }
      />

      {panelAcik && (
        <PaketKayitPanel
          acik
          yeniKayit={false}
          duzenlenen={duzenlenen}
          form={panelForm}
          onFormDegistir={setPanelForm}
          kaydediliyor={kaydediliyor}
        />
      )}

      {seciliDegisiklikVar && !panelAcik && !eklemeAcik && (
        <p className="ap-muted mb-2 text-xs">
          Kaydedilmemiş değişiklikler var — alttaki <strong className="ap-heading">Kaydet</strong> ile onaylayın.
        </p>
      )}

      {!kartGoster ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu'
              ? 'Filtreye uygun paket bulunamadı.'
              : 'Henüz paket kaydı yok. Alt çubuktan Yeni Ekle ile başlayın.'}
          </p>
        </div>
      ) : (
        <>
          <div className="ap-master-paket-grid">
            {eklemeAcik && (
              <PaketYeniKart
                taslak={yeniTaslak}
                gorunurAlanlar={gorunurAlanlar}
                kaydediliyor={kaydediliyor}
                onTaslakDegistir={setYeniTaslak}
              />
            )}

            {sayfalanmisListe.map((ham) => {
              const p = paketBirlestir(ham);
              const kartDegisti = taslakMap[ham.id] != null && Object.keys(taslakMap[ham.id]).length > 0;

              return (
                <article
                  key={p.id}
                  className={[
                    'ap-master-paket-kart',
                    !p.aktif ? 'ap-master-modul-kart-pasif' : undefined,
                    seciliId === p.id ? 'ap-master-paket-kart-secili' : undefined,
                    kartDegisti ? 'ap-master-paket-kart-degisti' : undefined,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    if (eklemeAcik) iptalEkle();
                    if (panelAcik) panelIptal();
                    setSeciliId(p.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="ap-heading ap-master-paket-baslik min-w-0 flex-1 font-bold">
                      <KartHucre
                        alan="paketAdi"
                        gosterim={p.paketAdi}
                        duzenlemeAktif={duzenlemeHucre?.paketId === p.id && duzenlemeHucre.alan === 'paketAdi'}
                        inputDeger={duzenlemeMetin}
                        onBasla={() => hucreBasla(p.id, 'paketAdi', p.paketAdi)}
                        onDegistir={setDuzenlemeMetin}
                        onBitir={hucreBitir}
                      />
                    </h3>
                    <button
                      type="button"
                      className="ap-master-tablo-ikon-btn shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        paketDuzenle(ham);
                      }}
                      aria-label="Paket düzenle"
                      title="Tüm alanları düzenle"
                    >
                      <DuzenleIkonu />
                    </button>
                  </div>

                  {gorunurAlanlar.includes('fiyat') && (
                    <p className="ap-master-paket-fiyat">
                      <span className="ap-master-paket-fiyat-deger font-bold">
                        {paketParaBirimiSembol(p.paraBirimi)}
                        <KartHucre
                          alan="fiyat"
                          gosterim={p.fiyat.toLocaleString('tr-TR')}
                          duzenlemeAktif={duzenlemeHucre?.paketId === p.id && duzenlemeHucre.alan === 'fiyat'}
                          inputDeger={duzenlemeMetin}
                          onBasla={() => hucreBasla(p.id, 'fiyat', String(p.fiyat))}
                          onDegistir={setDuzenlemeMetin}
                          onBitir={hucreBitir}
                          ondalik
                          className="inline"
                        />
                      </span>
                    </p>
                  )}

                  <ul className="ap-master-paket-ozellikler">
                    {gorunurAlanlar.includes('subeSayisi') && (
                      <li>
                        <KartHucre
                          alan="subeSayisi"
                          gosterim={String(p.subeSayisi)}
                          duzenlemeAktif={duzenlemeHucre?.paketId === p.id && duzenlemeHucre.alan === 'subeSayisi'}
                          inputDeger={duzenlemeMetin}
                          onBasla={() => hucreBasla(p.id, 'subeSayisi', String(p.subeSayisi))}
                          onDegistir={setDuzenlemeMetin}
                          onBitir={hucreBitir}
                          className="inline font-semibold"
                        />{' '}
                        şube
                      </li>
                    )}
                    {gorunurAlanlar.includes('personelSayisi') && (
                      <li>
                        <KartHucre
                          alan="personelSayisi"
                          gosterim={String(p.personelSayisi)}
                          duzenlemeAktif={
                            duzenlemeHucre?.paketId === p.id && duzenlemeHucre.alan === 'personelSayisi'
                          }
                          inputDeger={duzenlemeMetin}
                          onBasla={() => hucreBasla(p.id, 'personelSayisi', String(p.personelSayisi))}
                          onDegistir={setDuzenlemeMetin}
                          onBitir={hucreBitir}
                          className="inline font-semibold"
                        />{' '}
                        personel
                      </li>
                    )}
                    {gorunurAlanlar.includes('masaSayisi') && (
                      <li>
                        <KartHucre
                          alan="masaSayisi"
                          gosterim={String(p.masaSayisi)}
                          duzenlemeAktif={duzenlemeHucre?.paketId === p.id && duzenlemeHucre.alan === 'masaSayisi'}
                          inputDeger={duzenlemeMetin}
                          onBasla={() => hucreBasla(p.id, 'masaSayisi', String(p.masaSayisi))}
                          onDegistir={setDuzenlemeMetin}
                          onBitir={hucreBitir}
                          className="inline font-semibold"
                        />{' '}
                        masa
                      </li>
                    )}
                    {gorunurAlanlar.includes('aktifLisansSayisi') && (
                      <li>{p.aktifLisansSayisi} aktif lisans</li>
                    )}
                  </ul>

                  <div className="ap-master-paket-toggle mt-3" onClick={(e) => e.stopPropagation()}>
                    <div className="ap-master-toggle-mini">
                      <DurumAnahtari
                        etiket={p.aktif ? 'Satışta' : 'Pasif paket'}
                        acik={p.aktif}
                        devreDisi={islemId === p.id}
                        onChange={(v) => void durumDegistir(ham, v)}
                        renk={p.aktif ? 'yesil' : 'turuncu'}
                        sadeceToggle
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {liste.length > 0 && (
            <MasterTabloSayfalama
              toplam={liste.length}
              sayfa={sayfa}
              sayfaBoyutu={sayfaBoyutu}
              onSayfaDegistir={setSayfa}
              onSayfaBoyutuDegistir={setSayfaBoyutu}
            />
          )}
        </>
      )}
    </div>
  );
}
