import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { formInputSinifi, formSelectSinifi } from '@/formlar/FormAlani';
import { iskontoGoster, iskontoIfadesiHesapla } from '@/araclar/iskontoYardimci';
import { DurumAnahtari } from '@/admin/baslat-menusu/sistem/ayarlar/bilesenler/SistemSekmeCubugu';
import {
  BayiKayitPanel,
  BOS_BAYI_PANEL,
  bayiPaneldenGirdi,
  bayidenPanel,
  type BayiPanelForm,
} from '@/admin/baslat-menusu/master/bilesenler/BayiKayitPanel';
import { DuzenleIkonu } from '@/admin/baslat-menusu/master/bilesenler/DuzenleIkonu';
import { MasterTabloSayfalama } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSayfalama';
import { MasterTabloSutunAyarlari } from '@/admin/baslat-menusu/master/bilesenler/MasterTabloSutunAyarlari';
import {
  MasterUstFiltreSatiri,
  useMasterKartDurumFiltre,
} from '@/admin/baslat-menusu/master/bilesenler/MasterKartUstAksiyon';
import {
  BAYI_TABLO_SUTUNLARI,
  BAYI_TABLO_VARSAYILAN_SIRA,
  bayiTabloSutunlariKaydet,
  bayiTabloSutunlariOku,
  bayiTabloSutunTanimiBul,
} from '@/admin/baslat-menusu/master/bayiler/bayiTabloSutunlari';
import {
  bayiTarihGoster,
  masterBayiGuncelle,
  masterBayiOlustur,
  masterBayileriGetir,
  masterBayiSil,
  type BayiFormGirdi,
  type MasterBayi,
} from '@/admin/baslat-menusu/master/bayiler/api';
import { HataDurumu, YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { BayiAgacGorunumu } from '@/admin/baslat-menusu/master/bilesenler/agac/BayiAgacGorunumu';
import type { MasterGorunum } from '@/admin/baslat-menusu/master/bilesenler/MasterGorunumSegici';

type BayiInlineAlan = 'unvan' | 'eposta' | 'konum' | 'ustBayi' | 'vergiDairesi' | 'vergiNo' | 'iskonto';

function konumGoster(il: string | null, ilce: string | null): string {
  const metin = [il, ilce].filter(Boolean).join(' / ');
  return metin || '—';
}

function konumAyristir(metin: string): { il?: string; ilce?: string } {
  const parcalar = metin.split('/').map((s) => s.trim());
  if (parcalar.length <= 1) {
    return { il: parcalar[0] || undefined, ilce: undefined };
  }
  return { il: parcalar[0] || undefined, ilce: parcalar.slice(1).join(' / ') || undefined };
}

interface TabloHucreProps {
  alan: BayiInlineAlan;
  gosterim: string;
  duzenlemeAktif: boolean;
  inputDeger: string;
  onBasla: () => void;
  onDegistir: (deger: string) => void;
  onBitir: () => void;
  className?: string;
  inputTipi?: 'text' | 'number';
  maxLength?: number;
}

function TabloHucre({
  alan,
  gosterim,
  duzenlemeAktif,
  inputDeger,
  onBasla,
  onDegistir,
  onBitir,
  className = '',
  inputTipi = 'text',
  maxLength,
}: TabloHucreProps) {
  function tusBas(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      onBitir();
    }
  }

  if (duzenlemeAktif) {
    return (
      <input
        type={inputTipi}
        className={`${formInputSinifi} ap-master-excel-input`}
        value={inputDeger}
        maxLength={maxLength}
        onChange={(e) => onDegistir(e.target.value)}
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

interface UstBayiHucreProps {
  bayiId: number;
  ustId: number | null;
  gosterim: string;
  secenekler: MasterBayi[];
  duzenlemeAktif: boolean;
  onBasla: () => void;
  onSec: (ustId: number | null) => void;
  onBitir: () => void;
}

function UstBayiHucre({
  bayiId,
  ustId,
  gosterim,
  secenekler,
  duzenlemeAktif,
  onBasla,
  onSec,
  onBitir,
}: UstBayiHucreProps) {
  const uygunSecenekler = secenekler.filter((b) => b.id !== bayiId && b.aktif);

  if (duzenlemeAktif) {
    return (
      <select
        className={`${formSelectSinifi} ap-master-excel-input`}
        value={ustId ?? ''}
        onChange={(e) => {
          onSec(e.target.value ? Number(e.target.value) : null);
          onBitir();
        }}
        onBlur={onBitir}
        onClick={(e) => e.stopPropagation()}
        autoFocus
        aria-label="Üst bayi"
      >
        <option value="">Bağımsız (ana bayi)</option>
        {uygunSecenekler.map((b) => (
          <option key={b.id} value={b.id}>
            {b.unvan}
          </option>
        ))}
      </select>
    );
  }

  return (
    <span
      className="ap-master-excel-hucre-tiklanabilir ap-muted"
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

export function BayilerSekme({ gorunum = 'tablo' }: { gorunum?: MasterGorunum }) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [bayiler, setBayiler] = useState<MasterBayi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [arama, setArama] = useState('');
  const [filtre, setFiltre] = useState<'tumu' | 'aktif' | 'pasif'>('tumu');
  const [gorunurSutunlar, setGorunurSutunlar] = useState(() => bayiTabloSutunlariOku());
  const [sayfa, setSayfa] = useState(0);
  const [sayfaBoyutu, setSayfaBoyutu] = useState(10);
  const [seciliId, setSeciliId] = useState<number | null>(null);
  const [eklemeAcik, setEklemeAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MasterBayi | null>(null);
  const [panelForm, setPanelForm] = useState<BayiPanelForm>(BOS_BAYI_PANEL);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [islemId, setIslemId] = useState<number | null>(null);
  const [taslakMap, setTaslakMap] = useState<Record<number, Partial<BayiFormGirdi>>>({});
  const [duzenlemeHucre, setDuzenlemeHucre] = useState<{ bayiId: number; alan: BayiInlineAlan } | null>(null);

  const panelAcik = eklemeAcik || duzenlenen != null;

  useMasterKartDurumFiltre(filtre, setFiltre);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const veri = await masterBayileriGetir();
      setBayiler(veri.bayiler ?? []);
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Bayiler alınamadı');
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
    return bayiler.filter((b) => {
      if (filtre === 'aktif' && !b.aktif) return false;
      if (filtre === 'pasif' && b.aktif) return false;
      if (!q) return true;
      return (
        b.unvan.toLowerCase().includes(q) ||
        (b.il?.toLowerCase().includes(q) ?? false) ||
        (b.ustUnvan?.toLowerCase().includes(q) ?? false) ||
        (b.vergiNo?.toLowerCase().includes(q) ?? false) ||
        (b.vergiDairesi?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [bayiler, arama, filtre]);

  const sayfalanmisListe = useMemo(() => {
    const bas = sayfa * sayfaBoyutu;
    return liste.slice(bas, bas + sayfaBoyutu);
  }, [liste, sayfa, sayfaBoyutu]);

  const seciliTaslak = seciliId != null ? taslakMap[seciliId] : undefined;
  const seciliDegisiklikVar = seciliTaslak != null && Object.keys(seciliTaslak).length > 0;

  function sutunlariDegistir(sira: string[]) {
    setGorunurSutunlar(sira);
    bayiTabloSutunlariKaydet(sira);
  }

  function sutunBaslik(id: string) {
    return bayiTabloSutunTanimiBul(id)?.etiket ?? id;
  }

  function bayiBirlestir(bayi: MasterBayi): MasterBayi & { konumMetin: string; ustUnvanGoster: string } {
    const taslak = taslakMap[bayi.id];
    const il = taslak?.il !== undefined ? taslak.il ?? null : bayi.il;
    const ilce = taslak?.ilce !== undefined ? taslak.ilce ?? null : bayi.ilce;
    const ustId = taslak?.ustId !== undefined ? taslak.ustId ?? null : bayi.ustId;
    const ustUnvan =
      ustId != null ? (bayiler.find((x) => x.id === ustId)?.unvan ?? bayi.ustUnvan) : null;
    return {
      ...bayi,
      ustId,
      ustUnvan,
      unvan: taslak?.unvan ?? bayi.unvan,
      eposta: taslak?.eposta !== undefined ? taslak.eposta ?? null : bayi.eposta,
      il,
      ilce,
      vergiDairesi: taslak?.vergiDairesi !== undefined ? taslak.vergiDairesi ?? null : bayi.vergiDairesi,
      vergiNo: taslak?.vergiNo !== undefined ? taslak.vergiNo ?? null : bayi.vergiNo,
      iskonto: taslak?.iskonto !== undefined ? taslak.iskonto ?? null : bayi.iskonto,
      konumMetin: konumGoster(il, ilce),
      ustUnvanGoster: ustUnvan ?? 'Bağımsız',
    };
  }

  const hucreBasla = useCallback((bayiId: number, alan: BayiInlineAlan) => {
    setSeciliId(bayiId);
    setDuzenlemeHucre({ bayiId, alan });
  }, []);

  const hucreBitir = useCallback(() => {
    setDuzenlemeHucre(null);
  }, []);

  const ustBayiSec = useCallback((bayiId: number, ustId: number | null) => {
    setSeciliId(bayiId);
    setTaslakMap((onceki) => ({
      ...onceki,
      [bayiId]: { ...(onceki[bayiId] ?? {}), ustId },
    }));
  }, []);

  const hucreGuncelle = useCallback((bayiId: number, alan: BayiInlineAlan, ham: string) => {
    setSeciliId(bayiId);
    setTaslakMap((onceki) => {
      const mevcut = onceki[bayiId] ?? {};
      const bayi = bayiler.find((b) => b.id === bayiId);
      if (!bayi) return onceki;

      if (alan === 'konum') {
        const { il, ilce } = konumAyristir(ham);
        return { ...onceki, [bayiId]: { ...mevcut, il, ilce } };
      }

      if (alan === 'iskonto') {
        const iskonto = ham.trim() === '' ? null : iskontoIfadesiHesapla(ham);
        return { ...onceki, [bayiId]: { ...mevcut, iskonto } };
      }

      if (alan === 'vergiNo') {
        const vergiNo = ham.replace(/\D/g, '').slice(0, 10);
        return { ...onceki, [bayiId]: { ...mevcut, vergiNo: vergiNo || undefined } };
      }

      const alanMap: Record<Exclude<BayiInlineAlan, 'konum' | 'iskonto' | 'ustBayi' | 'vergiNo'>, keyof BayiFormGirdi> = {
        unvan: 'unvan',
        eposta: 'eposta',
        vergiDairesi: 'vergiDairesi',
      };
      const anahtar = alanMap[alan as keyof typeof alanMap];
      return { ...onceki, [bayiId]: { ...mevcut, [anahtar]: ham.trim() || undefined } };
    });
  }, [bayiler]);

  const panelIptal = useCallback(() => {
    setEklemeAcik(false);
    setDuzenlenen(null);
    setPanelForm(BOS_BAYI_PANEL);
  }, []);

  const yeniBayi = useCallback(() => {
    setEklemeAcik(true);
    setDuzenlenen(null);
    setPanelForm(BOS_BAYI_PANEL);
    setSeciliId(null);
  }, []);

  const bayiDuzenle = useCallback((bayi: MasterBayi) => {
    setEklemeAcik(false);
    setDuzenlenen(bayi);
    setPanelForm(bayidenPanel(bayi));
    setSeciliId(bayi.id);
  }, []);

  const inlineKaydet = useCallback(async () => {
    if (seciliId == null || !seciliDegisiklikVar || !seciliTaslak) return;

    const unvan = seciliTaslak.unvan?.trim();
    if (unvan != null && unvan.length < 2) {
      hataBildir('Unvan en az 2 karakter olmalı');
      return;
    }

    if (seciliTaslak.iskonto != null && (seciliTaslak.iskonto < 0 || seciliTaslak.iskonto > 100)) {
      hataBildir('İskonto 0–100 arasında olmalı');
      return;
    }

    if (seciliTaslak.vergiNo != null && seciliTaslak.vergiNo.replace(/\D/g, '').length > 10) {
      hataBildir('Vergi no en fazla 10 haneli olmalı');
      return;
    }

    setKaydediliyor(true);
    try {
      await masterBayiGuncelle(seciliId, seciliTaslak);
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

  const panelKaydet = useCallback(async () => {
    const sonuc = bayiPaneldenGirdi(panelForm);
    if (sonuc.hata || !sonuc.girdi) {
      hataBildir(sonuc.hata ?? 'Geçersiz form');
      return;
    }

    setKaydediliyor(true);
    try {
      if (duzenlenen) {
        await masterBayiGuncelle(duzenlenen.id, sonuc.girdi);
        setTaslakMap((onceki) => {
          const yeni = { ...onceki };
          delete yeni[duzenlenen.id];
          return yeni;
        });
        basariBildir(`${sonuc.girdi.unvan} güncellendi.`);
      } else {
        await masterBayiOlustur(sonuc.girdi);
        basariBildir(`${sonuc.girdi.unvan} eklendi.`);
      }
      panelIptal();
      await yukle();
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [panelForm, duzenlenen, panelIptal, yukle, basariBildir, hataBildir]);

  const bayiSil = useCallback(async () => {
    if (seciliId == null) return;
    const bayi = bayiler.find((b) => b.id === seciliId);
    if (!bayi) return;
    if (!confirm(`"${bayi.unvan}" bayisini silmek istediğinize emin misiniz?`)) return;

    setKaydediliyor(true);
    try {
      await masterBayiSil(seciliId);
      setSeciliId(null);
      setDuzenlenen(null);
      setEklemeAcik(false);
      setTaslakMap((onceki) => {
        const yeni = { ...onceki };
        delete yeni[seciliId];
        return yeni;
      });
      await yukle();
      basariBildir(`${bayi.unvan} silindi.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setKaydediliyor(false);
    }
  }, [seciliId, bayiler, yukle, basariBildir, hataBildir]);

  const islemde = kaydediliyor || islemId !== null;
  const kirli = panelAcik || seciliDegisiklikVar || duzenlemeHucre != null;

  useModulAksiyonlari(
    {
      ekle: yeniBayi,
      sil: panelAcik ? panelIptal : bayiSil,
      kaydet: panelAcik ? panelKaydet : inlineKaydet,
    },
    {
      ekle: !islemde && !panelAcik,
      sil: (panelAcik || seciliId != null) && !islemde && !seciliDegisiklikVar,
      kaydet: panelAcik ? !kaydediliyor : seciliDegisiklikVar && !kaydediliyor,
    },
    kirli
  );

  async function durumDegistir(bayi: MasterBayi, aktif: boolean) {
    setIslemId(bayi.id);
    try {
      await masterBayiGuncelle(bayi.id, { aktif });
      await yukle();
      basariBildir(`${bayi.unvan} ${aktif ? 'aktif' : 'pasif'} yapıldı.`);
    } catch (err) {
      hataBildir(err instanceof Error ? err.message : 'Durum güncellenemedi');
    } finally {
      setIslemId(null);
    }
  }

  function sutunHucre(b: ReturnType<typeof bayiBirlestir>, ham: MasterBayi, sutunId: string) {
    switch (sutunId) {
      case 'unvan':
        return (
          <td key={sutunId} className="ap-master-excel-hucre">
            <TabloHucre
              alan="unvan"
              gosterim={b.unvan}
              duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'unvan'}
              inputDeger={b.unvan}
              onBasla={() => hucreBasla(b.id, 'unvan')}
              onDegistir={(v) => hucreGuncelle(b.id, 'unvan', v)}
              onBitir={hucreBitir}
              className="ap-heading font-medium"
            />
            <TabloHucre
              alan="eposta"
              gosterim={b.eposta ?? '—'}
              duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'eposta'}
              inputDeger={b.eposta ?? ''}
              onBasla={() => hucreBasla(b.id, 'eposta')}
              onDegistir={(v) => hucreGuncelle(b.id, 'eposta', v)}
              onBitir={hucreBitir}
              className="ap-muted ap-master-tablo-alt-satir block truncate"
            />
          </td>
        );
      case 'konum':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-muted">
            <TabloHucre
              alan="konum"
              gosterim={b.konumMetin}
              duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'konum'}
              inputDeger={b.konumMetin === '—' ? '' : b.konumMetin}
              onBasla={() => hucreBasla(b.id, 'konum')}
              onDegistir={(v) => hucreGuncelle(b.id, 'konum', v)}
              onBitir={hucreBitir}
            />
          </td>
        );
      case 'ustBayi':
        return (
          <td key={sutunId} className="ap-master-excel-hucre">
            <UstBayiHucre
              bayiId={b.id}
              ustId={b.ustId}
              gosterim={b.ustUnvanGoster}
              secenekler={bayiler}
              duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'ustBayi'}
              onBasla={() => hucreBasla(b.id, 'ustBayi')}
              onSec={(ustId) => ustBayiSec(b.id, ustId)}
              onBitir={hucreBitir}
            />
          </td>
        );
      case 'vergiDairesi':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-muted">
            <TabloHucre
              alan="vergiDairesi"
              gosterim={b.vergiDairesi ?? '—'}
              duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'vergiDairesi'}
              inputDeger={b.vergiDairesi ?? ''}
              onBasla={() => hucreBasla(b.id, 'vergiDairesi')}
              onDegistir={(v) => hucreGuncelle(b.id, 'vergiDairesi', v)}
              onBitir={hucreBitir}
            />
          </td>
        );
      case 'vergiNo':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-muted">
            <TabloHucre
              alan="vergiNo"
              gosterim={b.vergiNo ?? '—'}
              duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'vergiNo'}
              inputDeger={b.vergiNo ?? ''}
              onBasla={() => hucreBasla(b.id, 'vergiNo')}
              onDegistir={(v) => hucreGuncelle(b.id, 'vergiNo', v)}
              onBitir={hucreBitir}
              maxLength={10}
            />
          </td>
        );
      case 'iskonto':
        return (
          <td key={sutunId} className="ap-master-excel-hucre">
            <TabloHucre
              alan="iskonto"
              gosterim={iskontoGoster(b.iskonto)}
              duzenlemeAktif={duzenlemeHucre?.bayiId === b.id && duzenlemeHucre.alan === 'iskonto'}
              inputDeger={b.iskonto != null ? String(b.iskonto) : ''}
              onBasla={() => hucreBasla(b.id, 'iskonto')}
              onDegistir={(v) => hucreGuncelle(b.id, 'iskonto', v)}
              onBitir={hucreBitir}
            />
          </td>
        );
      case 'firmaSayisi':
        return (
          <td
            key={sutunId}
            className="ap-master-excel-hucre ap-master-excel-hucre-sayi ap-muted"
            title="Bağlı müşteri firma adedi"
          >
            <span className="ap-master-etiket">{b.firmaSayisi}</span>
            {b.altBayiSayisi > 0 && (
              <span className="ap-master-tablo-alt-satir ml-1" title="Alt bayi sayısı">
                · {b.altBayiSayisi} alt
              </span>
            )}
          </td>
        );
      case 'kayitTarihi':
        return (
          <td key={sutunId} className="ap-master-excel-hucre-tarih">
            {bayiTarihGoster(b.kayitTarihi)}
          </td>
        );
      case 'guncellemeTarihi':
        return (
          <td key={sutunId} className="ap-master-excel-hucre-tarih">
            {bayiTarihGoster(b.guncellemeTarihi)}
          </td>
        );
      case 'aktif':
        return (
          <td key={sutunId} className="ap-master-excel-hucre ap-master-tablo-toggle-hucre" onClick={(e) => e.stopPropagation()}>
            <div className="ap-master-toggle-mini">
              <DurumAnahtari
                etiket={b.aktif ? 'Aktif bayi' : 'Pasif bayi'}
                acik={b.aktif}
                devreDisi={islemId === b.id}
                onChange={(v) => void durumDegistir(ham, v)}
                renk={b.aktif ? 'yesil' : 'turuncu'}
                sadeceToggle
              />
            </div>
          </td>
        );
      default:
        return null;
    }
  }

  if (yukleniyor) return <YukleniyorDurumu mesaj="Bayiler yükleniyor…" />;
  if (hata) return <HataDurumu mesaj={hata} />;

  const tabloGoster = panelAcik || liste.length > 0;

  return (
    <div className="ap-master-sekme">
      <MasterUstFiltreSatiri
        arama={arama}
        onArama={setArama}
        placeholder="Unvan, il, vergi no veya üst bayi ara…"
        sag={
          <MasterTabloSutunAyarlari
            baslik="Bayi tablosu sütunları"
            sutunlar={BAYI_TABLO_SUTUNLARI}
            gorunurSira={gorunurSutunlar}
            varsayilanSira={BAYI_TABLO_VARSAYILAN_SIRA}
            onDegistir={sutunlariDegistir}
          />
        }
      />

      {panelAcik && (
        <BayiKayitPanel
          acik
          yeniKayit={eklemeAcik}
          duzenlenen={duzenlenen}
          form={panelForm}
          onFormDegistir={setPanelForm}
          ustBayiSecenekleri={bayiler}
          kaydediliyor={kaydediliyor}
        />
      )}

      {seciliDegisiklikVar && !panelAcik && (
        <p className="ap-muted mb-2 text-xs">
          Kaydedilmemiş değişiklikler var — alttaki <strong className="ap-heading">Kaydet</strong> ile onaylayın.
        </p>
      )}

      {!tabloGoster ? (
        <div className="ap-master-bos-durum">
          <p className="ap-muted text-sm">
            {arama || filtre !== 'tumu'
              ? 'Filtreye uygun bayi bulunamadı.'
              : 'Henüz bayi kaydı yok. Alt çubuktan Yeni Ekle ile başlayın.'}
          </p>
        </div>
      ) : gorunum === 'agac' ? (
        <BayiAgacGorunumu bayiler={liste} arama={arama} filtre={filtre} />
      ) : (
        <>
          <div className="ap-master-excel-wrap">
            <div className="ap-master-excel-scroll">
              <table className="ap-master-excel-tablo ap-master-bayi-tablo">
                <thead>
                  <tr>
                    {gorunurSutunlar.map((id) => (
                      <th
                        key={id}
                        className={id === 'firmaSayisi' ? 'ap-master-tablo-bilgi-baslik' : undefined}
                        title={
                          id === 'firmaSayisi'
                            ? 'Bu bayiye bağlı müşteri firma adedi — Firmalar sekmesinden yönetilir'
                            : undefined
                        }
                      >
                        {sutunBaslik(id)}
                      </th>
                    ))}
                    <th className="ap-master-excel-th-aksiyon" />
                  </tr>
                </thead>
                <tbody>
                  {sayfalanmisListe.map((ham) => {
                    const b = bayiBirlestir(ham);
                    const satirDegisti = taslakMap[ham.id] != null && Object.keys(taslakMap[ham.id]).length > 0;

                    return (
                      <tr
                        key={b.id}
                        className={[
                          !b.aktif ? 'ap-master-tablo-pasif' : undefined,
                          seciliId === b.id ? 'ap-master-excel-satir-secili' : undefined,
                          satirDegisti ? 'ap-master-tablo-degisti' : undefined,
                        ]
                          .filter(Boolean)
                          .join(' ') || undefined}
                        onClick={() => {
                          if (panelAcik) panelIptal();
                          setSeciliId(b.id);
                        }}
                      >
                        {gorunurSutunlar.map((id) => sutunHucre(b, ham, id))}
                        <td className="ap-master-excel-hucre ap-master-excel-th-aksiyon" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="ap-master-tablo-ikon-btn"
                            onClick={() => bayiDuzenle(ham)}
                            aria-label="Bayi düzenle"
                            title="Tüm alanları düzenle"
                          >
                            <DuzenleIkonu />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
