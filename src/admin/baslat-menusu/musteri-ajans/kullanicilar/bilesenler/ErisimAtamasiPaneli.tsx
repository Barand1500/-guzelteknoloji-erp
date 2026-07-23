import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  adminKullaniciGuncelle,
  adminKullanicilariGetir,
  kullanicidanForm,
  type AdminKullanici,
  type KullaniciFormDegeri,
  type KullaniciOturumYetkisi,
} from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/api';
import type { KullaniciOturumSecenekleri } from '@/admin/baslat-menusu/musteri-ajans/kullanicilar/kullaniciOturumYardimci';
import {
  depolariGetir,
  donemleriGetir,
  firmalariGetir,
  kasalariGetir,
  subeleriGetir,
} from '@/admin/baslat-menusu/tanimlar/api';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { YukleniyorDurumu } from '@/admin/ortak/AdminBilesenleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';

export interface ErisimSatir {
  id: string;
  firmaId: string;
  donemId: string;
  subeId: string;
  depoId: string;
  kasaId: string;
}

const TASLAK_ID = '__erisim_taslak__';
const SECIM_SABIT_ANAHTAR = 'kullanicilar-erisim-secim-sabit-v2';

type SecimSabitSeviye = 'yok' | 'firma' | 'donem' | 'sube' | 'depo';

const SECIM_SABIT_SECENEKLER: { id: SecimSabitSeviye; baslik: string; aciklama: string }[] = [
  { id: 'yok', baslik: 'Sabitleme yok', aciklama: 'Ekle sonrası satır boşalır' },
  { id: 'firma', baslik: 'Firmayı sabitle', aciklama: 'Sadece firma kalır' },
  { id: 'donem', baslik: 'Döneme kadar', aciklama: 'Firma + dönem kalır' },
  { id: 'sube', baslik: 'Şubeye kadar', aciklama: 'Firma + dönem + şube' },
  { id: 'depo', baslik: 'Depoya kadar', aciklama: 'Firma + dönem + şube + depo' },
];

function secimSabitOku(): SecimSabitSeviye {
  try {
    const v = localStorage.getItem(SECIM_SABIT_ANAHTAR);
    if (v === 'firma' || v === 'donem' || v === 'sube' || v === 'depo' || v === 'yok') return v;
    // Eski anahtar (boolean)
    if (localStorage.getItem('roller-erisim-secim-sabit') === '1') return 'donem';
    if (localStorage.getItem('kullanicilar-erisim-secim-sabit') === '1') return 'donem';
    return 'yok';
  } catch {
    return 'yok';
  }
}

function secimSabitYaz(seviye: SecimSabitSeviye) {
  try {
    localStorage.setItem(SECIM_SABIT_ANAHTAR, seviye);
  } catch {
    /* ignore */
  }
}

function diziAl<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function yeniSatirId() {
  return `erisim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function bosErisimSatiri(id = yeniSatirId()): ErisimSatir {
  return {
    id,
    firmaId: '',
    donemId: '',
    subeId: '',
    depoId: '',
    kasaId: '',
  };
}

function bosTaslak(): ErisimSatir {
  return bosErisimSatiri(TASLAK_ID);
}

function sabitliTaslak(kaynak: ErisimSatir, seviye: SecimSabitSeviye): ErisimSatir {
  if (seviye === 'yok') return bosTaslak();
  const sonraki = bosTaslak();
  if (seviye === 'firma' || seviye === 'donem' || seviye === 'sube' || seviye === 'depo') {
    sonraki.firmaId = kaynak.firmaId;
  }
  if (seviye === 'donem' || seviye === 'sube' || seviye === 'depo') {
    sonraki.donemId = kaynak.donemId;
  }
  if (seviye === 'sube' || seviye === 'depo') {
    sonraki.subeId = kaynak.subeId;
  }
  if (seviye === 'depo') {
    sonraki.depoId = kaynak.depoId;
  }
  return sonraki;
}

function erisimOzetMetni(
  s: ErisimSatir,
  secenekler: KullaniciOturumSecenekleri
): string {
  const firma = diziAl(secenekler.firmalar).find((f) => f.id === s.firmaId);
  const donem = diziAl(secenekler.donemler).find((d) => d.id === s.donemId);
  const sube = diziAl(secenekler.subeler).find((x) => x.id === s.subeId);
  const depo = diziAl(secenekler.depolar).find((d) => d.id === s.depoId);
  const kasa = diziAl(secenekler.kasalar).find((k) => k.id === s.kasaId);
  const parcalar = [
    firma ? `${firma.firmaKodu}` : null,
    donem ? `${donem.donemKodu}` : null,
    sube ? `${sube.subeKodu}` : null,
    depo ? `${depo.depoKodu}` : null,
    kasa ? `${kasa.kasaKodu}` : null,
  ].filter(Boolean);
  return parcalar.length > 0 ? parcalar.join(' · ') : 'Erişim satırı';
}

function SecimSabitAraci({
  seviye,
  onDegistir,
}: {
  seviye: SecimSabitSeviye;
  onDegistir: (seviye: SecimSabitSeviye) => void;
}) {
  const [bilgiAcik, setBilgiAcik] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const aktif = seviye !== 'yok';

  useEffect(() => {
    if (!bilgiAcik) return;
    function disTik(e: MouseEvent) {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setBilgiAcik(false);
    }
    document.addEventListener('mousedown', disTik);
    return () => document.removeEventListener('mousedown', disTik);
  }, [bilgiAcik]);

  return (
    <div className="ap-erisim-sabit-wrap dg-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`dg-tus dg-tus-ikon${aktif ? ' dg-tus-aktif' : ''}${bilgiAcik ? ' dg-tus-aktif' : ''}`}
        title="Seçimi sabitle"
        aria-label="Seçimi sabitle"
        aria-expanded={bilgiAcik}
        aria-pressed={aktif}
        onClick={() => setBilgiAcik((v) => !v)}
      >
        <DgIkon ad="igne" />
      </button>
      {bilgiAcik ? (
        <div className="ap-erisim-sabit-bilgi" role="dialog" aria-label="Seçimi sabitle">
          <p className="ap-erisim-sabit-bilgi-ust">
            Ekle’den sonra hangi alanlar kalsın?
          </p>
          <div className="ap-erisim-sabit-liste" role="radiogroup" aria-label="Sabitleme seviyesi">
            {SECIM_SABIT_SECENEKLER.map((s) => {
              const secili = seviye === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={secili}
                  className={`ap-erisim-sabit-secenek${secili ? ' ap-erisim-sabit-secenek--aktif' : ''}`}
                  onClick={() => onDegistir(s.id)}
                >
                  <span className="ap-erisim-sabit-radyo" aria-hidden />
                  <span className="ap-erisim-sabit-secenek-metin">
                    <span className="ap-erisim-sabit-secenek-baslik">{s.baslik}</span>
                    <span className="ap-erisim-sabit-secenek-aciklama">{s.aciklama}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formdanSatirlar(
  form: KullaniciFormDegeri,
  secenekler: KullaniciOturumSecenekleri
): ErisimSatir[] {
  const subeler = diziAl<typeof secenekler.subeler[number]>(secenekler.subeler);
  const depolar = diziAl<typeof secenekler.depolar[number]>(secenekler.depolar);
  const kasalar = diziAl<typeof secenekler.kasalar[number]>(secenekler.kasalar);
  const yetkiler = diziAl<KullaniciOturumYetkisi>(form.oturumYetkileri);
  const subeIds = diziAl<string>(form.subeIds);
  const depoIds = diziAl<string>(form.depoIds);
  const kasaIds = diziAl<string>(form.kasaIds);

  const satirlar: ErisimSatir[] = [];
  const kullanilanSube = new Set<string>();

  for (const y of yetkiler) {
    if (!y?.firmaId || !y?.donemId) continue;
    const firmaSubeleri = subeIds.filter((id) =>
      subeler.some((s) => s.id === id && s.firmaId === y.firmaId)
    );
    if (firmaSubeleri.length === 0) {
      satirlar.push({
        id: yeniSatirId(),
        firmaId: y.firmaId,
        donemId: y.donemId,
        subeId: '',
        depoId: '',
        kasaId: '',
      });
      continue;
    }
    for (const subeId of firmaSubeleri) {
      kullanilanSube.add(subeId);
      const depoAday = depoIds.filter((id) =>
        depolar.some((d) => d.id === id && d.subeId === subeId)
      );
      const kasaAday = kasaIds.filter((id) =>
        kasalar.some((k) => k.id === id && k.subeId === subeId)
      );
      const adet = Math.max(depoAday.length, kasaAday.length, 1);
      for (let i = 0; i < adet; i++) {
        satirlar.push({
          id: yeniSatirId(),
          firmaId: y.firmaId,
          donemId: y.donemId,
          subeId,
          depoId: depoAday[i] ?? depoAday[0] ?? '',
          kasaId: kasaAday[i] ?? kasaAday[0] ?? '',
        });
      }
    }
  }

  for (const subeId of subeIds) {
    if (kullanilanSube.has(subeId)) continue;
    const sube = subeler.find((s) => s.id === subeId);
    if (!sube) continue;
    const donemId = yetkiler.find((y) => y.firmaId === sube.firmaId)?.donemId ?? '';
    satirlar.push({
      id: yeniSatirId(),
      firmaId: sube.firmaId,
      donemId,
      subeId,
      depoId: depoIds.find((id) => depolar.some((d) => d.id === id && d.subeId === subeId)) ?? '',
      kasaId: kasaIds.find((id) => kasalar.some((k) => k.id === id && k.subeId === subeId)) ?? '',
    });
  }

  return satirlar;
}

function satirlardanForm(
  form: KullaniciFormDegeri,
  satirlar: ErisimSatir[]
): KullaniciFormDegeri {
  const kayitlar = diziAl<ErisimSatir>(satirlar).filter((s) => s.id !== TASLAK_ID);
  const yetkiler = kayitlar
    .filter((s) => s.firmaId && s.donemId)
    .map((s) => ({ firmaId: s.firmaId, donemId: s.donemId }));
  const benzersizYetki = [
    ...new Map(yetkiler.map((y) => [`${y.firmaId}:${y.donemId}`, y])).values(),
  ];
  const subeIds = [...new Set(kayitlar.map((s) => s.subeId).filter(Boolean))];
  const depoIds = [...new Set(kayitlar.map((s) => s.depoId).filter(Boolean))];
  const kasaIds = [...new Set(kayitlar.map((s) => s.kasaId).filter(Boolean))];
  const ilk = kayitlar.find((s) => s.firmaId && s.donemId) ?? kayitlar[0];

  return {
    ...form,
    oturumYetkileri: benzersizYetki,
    firmaId: ilk?.firmaId ?? '',
    donemId: ilk?.donemId ?? '',
    subeId: ilk?.subeId || subeIds[0] || '',
    depoId: ilk?.depoId || depoIds[0] || '',
    kasaId: ilk?.kasaId || kasaIds[0] || '',
    subeIds,
    depoIds,
    kasaIds,
  };
}

function satirlarEsitMi(a: ErisimSatir[], b: ErisimSatir[]): boolean {
  const A = diziAl<ErisimSatir>(a);
  const B = diziAl<ErisimSatir>(b);
  if (A.length !== B.length) return false;
  return A.map(erisimAnahtari).sort().join(';') === B.map(erisimAnahtari).sort().join(';');
}

function erisimAnahtari(s: Pick<ErisimSatir, 'firmaId' | 'donemId' | 'subeId' | 'depoId' | 'kasaId'>) {
  return `${s.firmaId}|${s.donemId}|${s.subeId}|${s.depoId}|${s.kasaId}`;
}

function ayniErisimVarMi(
  aday: Pick<ErisimSatir, 'firmaId' | 'donemId' | 'subeId' | 'depoId' | 'kasaId'>,
  liste: ErisimSatir[],
  haricId?: string
) {
  const anahtar = erisimAnahtari(aday);
  return diziAl<ErisimSatir>(liste).some(
    (s) => s.id !== haricId && s.id !== TASLAK_ID && erisimAnahtari(s) === anahtar
  );
}

function SecimHucre({
  value,
  secenekler,
  onChange,
  disabled,
  ariaLabel,
  taslak,
}: {
  value: string;
  secenekler: { value: string; label: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
  ariaLabel: string;
  taslak?: boolean;
}) {
  const liste = diziAl<{ value: string; label: string }>(secenekler);
  const etiket = liste.find((s) => s.value === value)?.label;

  if (!taslak) {
    return (
      <span className={`ap-erisim-hucre-metin${value ? '' : ' ap-erisim-hucre-bos'}`}>
        {value ? etiket || value : '—'}
      </span>
    );
  }

  return (
    <div className="ap-erisim-dg-secim ap-erisim-dg-secim--taslak" onClick={(e) => e.stopPropagation()}>
      <FormAcilirSecim
        aria-label={ariaLabel}
        value={value}
        onChange={onChange}
        secenekler={liste}
        disabled={disabled}
        tusMetin={value ? undefined : 'seçiniz'}
      />
    </div>
  );
}

export interface ErisimAtamasiPaneliProps {
  duzenlenebilir?: boolean;
  onDegisti?: (degisti: boolean) => void;
  kaydetKayit?: (kaydet: (() => Promise<void>) | null) => void;
  ekleKayit?: (ekle: (() => void) | null) => void;
  silKayit?: (sil: (() => void) | null) => void;
  onSecimDegisti?: (seciliVar: boolean) => void;
}

export function ErisimAtamasiPaneli({
  duzenlenebilir = true,
  onDegisti,
  kaydetKayit,
  ekleKayit,
  silKayit,
  onSecimDegisti,
}: ErisimAtamasiPaneliProps) {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState('');
  const [kullanicilar, setKullanicilar] = useState<AdminKullanici[]>([]);
  const [arama, setArama] = useState('');
  const [secenekler, setSecenekler] = useState<KullaniciOturumSecenekleri>({
    firmalar: [],
    donemler: [],
    subeler: [],
    depolar: [],
    kasalar: [],
  });
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [form, setForm] = useState<KullaniciFormDegeri | null>(null);
  const [taslak, setTaslak] = useState<ErisimSatir>(bosTaslak);
  const [satirlar, setSatirlar] = useState<ErisimSatir[]>([]);
  const [kayitliSatirlar, setKayitliSatirlar] = useState<ErisimSatir[]>([]);
  const [seciliSatirIdleri, setSeciliSatirIdleri] = useState<string[]>([]);
  const [secimSabit, setSecimSabit] = useState<SecimSabitSeviye>(secimSabitOku);
  const [silinecek, setSilinecek] = useState<ErisimSatir | null>(null);

  const taslakDolu = Boolean(
    taslak.firmaId || taslak.donemId || taslak.subeId || taslak.depoId || taslak.kasaId
  );
  const degisti = Boolean(form && (!satirlarEsitMi(satirlar, kayitliSatirlar) || taslakDolu));
  const saltOkunur = !duzenlenebilir || kaydediliyor || !form;

  const gosterilenSatirlar = useMemo(() => [taslak, ...satirlar], [taslak, satirlar]);

  useEffect(() => {
    onDegisti?.(degisti);
  }, [degisti, onDegisti]);

  useEffect(() => {
    const gercekSecim = seciliSatirIdleri.filter((id) => id !== TASLAK_ID);
    onSecimDegisti?.(gercekSecim.length > 0);
  }, [seciliSatirIdleri, onSecimDegisti]);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      const [liste, firmalar, donemler, subeler, depolar, kasalar] = await Promise.all([
        adminKullanicilariGetir(),
        firmalariGetir(),
        donemleriGetir(),
        subeleriGetir(),
        depolariGetir(),
        kasalariGetir(),
      ]);
      setKullanicilar(diziAl(liste));
      setSecenekler({
        firmalar: diziAl(firmalar),
        donemler: diziAl(donemler),
        subeler: diziAl(subeler),
        depolar: diziAl(depolar),
        kasalar: diziAl(kasalar),
      });
      setSeciliId((onceki) => {
        const guvenli = diziAl<AdminKullanici>(liste);
        if (onceki && guvenli.some((k) => k.id === onceki)) return onceki;
        return guvenli[0]?.id ?? null;
      });
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Veriler alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  useEffect(() => {
    if (!seciliId) {
      setForm(null);
      setSatirlar([]);
      setKayitliSatirlar([]);
      setTaslak(bosTaslak());
      return;
    }
    const k = kullanicilar.find((x) => x.id === seciliId);
    if (!k) return;
    const f = kullanicidanForm(k);
    const s = formdanSatirlar(f, secenekler);
    setForm(f);
    setSatirlar(s);
    setKayitliSatirlar(s);
    setTaslak(bosTaslak());
    setSeciliSatirIdleri([]);
  }, [seciliId, kullanicilar, secenekler]);

  const filtreliKullanicilar = useMemo(() => {
    const liste = diziAl<AdminKullanici>(kullanicilar);
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return liste;
    return liste.filter(
      (k) =>
        k.ad.toLocaleLowerCase('tr').includes(q) ||
        k.kullaniciKodu.toLocaleLowerCase('tr').includes(q)
    );
  }, [kullanicilar, arama]);

  const satirGuncelle = useCallback(
    (id: string, yama: Partial<ErisimSatir>) => {
      const uygula = (s: ErisimSatir): ErisimSatir => {
        const sonraki = { ...s, ...yama };
        if (yama.firmaId !== undefined && yama.firmaId !== s.firmaId) {
          sonraki.donemId = '';
          sonraki.subeId = '';
          sonraki.depoId = '';
          sonraki.kasaId = '';
        } else if (yama.subeId !== undefined && yama.subeId !== s.subeId) {
          sonraki.depoId = '';
          sonraki.kasaId = '';
        }
        return sonraki;
      };

      if (id === TASLAK_ID) {
        setTaslak((onceki) => uygula(onceki));
        setHata('');
        return;
      }

      const hedef = satirlar.find((s) => s.id === id);
      if (!hedef) return;
      const sonraki = uygula(hedef);
      if (sonraki.firmaId && sonraki.donemId && ayniErisimVarMi(sonraki, satirlar, id)) {
        setHata('Bu firma, dönem, şube, depo ve kasa kombinasyonu zaten ekli');
        return;
      }
      setHata('');
      setSatirlar((onceki) => onceki.map((s) => (s.id === id ? sonraki : s)));
    },
    [satirlar]
  );

  const satirEkle = useCallback(() => {
    if (saltOkunur) return;
    if (!taslak.firmaId || !taslak.donemId) {
      setHata('Eklemek için en az firma ve dönem seçin');
      return;
    }
    if (ayniErisimVarMi(taslak, satirlar)) {
      setHata('Aynı firma, dönem, şube, depo ve kasa kaydı zaten var');
      return;
    }
    const yeni: ErisimSatir = {
      ...taslak,
      id: yeniSatirId(),
    };
    setSatirlar((onceki) => [yeni, ...onceki]);
    setTaslak(sabitliTaslak(taslak, secimSabit));
    setHata('');
  }, [saltOkunur, taslak, satirlar, secimSabit]);

  const secimSabitDegistir = useCallback((seviye: SecimSabitSeviye) => {
    setSecimSabit(seviye);
    secimSabitYaz(seviye);
  }, []);

  const satirSilOnayla = useCallback(() => {
    if (!silinecek || silinecek.id === TASLAK_ID) {
      setSilinecek(null);
      return;
    }
    const id = silinecek.id;
    setSatirlar((onceki) => onceki.filter((x) => x.id !== id));
    setSeciliSatirIdleri((onceki) => onceki.filter((x) => x !== id));
    setSilinecek(null);
    setHata('');
  }, [silinecek]);

  const satirSil = useCallback(() => {
    if (saltOkunur) return;
    const silinecek = new Set(seciliSatirIdleri.filter((id) => id !== TASLAK_ID));
    if (silinecek.size === 0) return;
    setSatirlar((onceki) => onceki.filter((s) => !silinecek.has(s.id)));
    setSeciliSatirIdleri([]);
    setHata('');
  }, [saltOkunur, seciliSatirIdleri]);

  const kaydet = useCallback(async () => {
    if (!form || !seciliId || !degisti) return;
    let kayitSatirlari = satirlar;
    if (taslak.firmaId && taslak.donemId) {
      if (ayniErisimVarMi(taslak, satirlar)) {
        setHata('Aynı firma, dönem, şube, depo ve kasa kaydı zaten var');
        return;
      }
      kayitSatirlari = [{ ...taslak, id: yeniSatirId() }, ...satirlar];
    }
    const anahtarlar = kayitSatirlari.map(erisimAnahtari);
    if (new Set(anahtarlar).size !== anahtarlar.length) {
      setHata('Aynı erişim satırı birden fazla olamaz');
      return;
    }
    const eksik = kayitSatirlari.some((s) => s.firmaId && !s.donemId);
    if (eksik) {
      setHata('Firma seçilen satırlarda dönem zorunludur');
      return;
    }
    const guncelForm = satirlardanForm(form, kayitSatirlari);
    if (guncelForm.oturumYetkileri.length === 0) {
      setHata('En az bir firma ve dönem satırı ekleyin');
      return;
    }
    setKaydediliyor(true);
    setHata('');
    try {
      const guncel = await adminKullaniciGuncelle(seciliId, guncelForm, false);
      setKullanicilar((onceki) =>
        diziAl<AdminKullanici>(onceki).map((k) => (k.id === guncel.id ? guncel : k))
      );
      const f = kullanicidanForm(guncel);
      const s = formdanSatirlar(f, secenekler);
      setForm(f);
      setSatirlar(s);
      setKayitliSatirlar(s);
      setTaslak(bosTaslak());
    } catch (err) {
      const mesaj = err instanceof Error ? err.message : 'Kaydetme başarısız';
      setHata(
        mesaj.includes('.map is not a function')
          ? 'Erişim kaydı başarısız — veriyi kontrol edip tekrar deneyin.'
          : mesaj
      );
    } finally {
      setKaydediliyor(false);
    }
  }, [form, seciliId, degisti, satirlar, taslak, secenekler]);

  useEffect(() => {
    kaydetKayit?.(degisti ? kaydet : null);
    return () => kaydetKayit?.(null);
  }, [kaydet, degisti, kaydetKayit]);

  useEffect(() => {
    ekleKayit?.(duzenlenebilir && !!form && !kaydediliyor ? satirEkle : null);
    return () => ekleKayit?.(null);
  }, [ekleKayit, duzenlenebilir, form, kaydediliyor, satirEkle]);

  useEffect(() => {
    const secimVar = seciliSatirIdleri.some((id) => id !== TASLAK_ID);
    silKayit?.(duzenlenebilir && !!form && !kaydediliyor && secimVar ? satirSil : null);
    return () => silKayit?.(null);
  }, [silKayit, duzenlenebilir, form, kaydediliyor, seciliSatirIdleri, satirSil]);

  const kolonlar = useMemo((): KolonTanimi<ErisimSatir>[] => {
    const firmalar = diziAl(secenekler.firmalar);
    const donemler = diziAl(secenekler.donemler);
    const subeler = diziAl(secenekler.subeler);
    const depolar = diziAl(secenekler.depolar);
    const kasalar = diziAl(secenekler.kasalar);

    const firmaSecenekleri = firmalar.map((f) => ({
      value: f.id,
      label: `${f.firmaKodu} — ${f.firmaAdi}`,
    }));

    return [
      {
        id: 'firmaId',
        baslik: 'Firma',
        tip: 'metin',
        genislik: 220,
        minGenislik: 160,
        degerAl: (s) => s.firmaId,
        goster: (s) => (
          <SecimHucre
            ariaLabel="Firma"
            taslak={s.id === TASLAK_ID}
            value={s.firmaId}
            secenekler={firmaSecenekleri}
            disabled={saltOkunur}
            onChange={(v) => satirGuncelle(s.id, { firmaId: v })}
          />
        ),
      },
      {
        id: 'donemId',
        baslik: 'Dönem',
        tip: 'metin',
        genislik: 170,
        minGenislik: 130,
        degerAl: (s) => s.donemId,
        goster: (s) => (
          <SecimHucre
            ariaLabel="Dönem"
            taslak={s.id === TASLAK_ID}
            value={s.donemId}
            disabled={saltOkunur || !s.firmaId}
            secenekler={donemler
              .filter((d) => d.firmaId === s.firmaId)
              .map((d) => ({ value: d.id, label: `${d.donemKodu} — ${d.donemAdi}` }))}
            onChange={(v) => satirGuncelle(s.id, { donemId: v })}
          />
        ),
      },
      {
        id: 'subeId',
        baslik: 'Şube',
        tip: 'metin',
        genislik: 170,
        minGenislik: 130,
        degerAl: (s) => s.subeId,
        goster: (s) => (
          <SecimHucre
            ariaLabel="Şube"
            taslak={s.id === TASLAK_ID}
            value={s.subeId}
            disabled={saltOkunur || !s.firmaId}
            secenekler={subeler
              .filter((x) => x.firmaId === s.firmaId)
              .map((x) => ({ value: x.id, label: `${x.subeKodu} — ${x.subeAdi}` }))}
            onChange={(v) => satirGuncelle(s.id, { subeId: v })}
          />
        ),
      },
      {
        id: 'depoId',
        baslik: 'Depo',
        tip: 'metin',
        genislik: 170,
        minGenislik: 130,
        degerAl: (s) => s.depoId,
        goster: (s) => (
          <SecimHucre
            ariaLabel="Depo"
            taslak={s.id === TASLAK_ID}
            value={s.depoId}
            disabled={saltOkunur || !s.subeId}
            secenekler={depolar
              .filter((d) => d.subeId === s.subeId)
              .map((d) => ({ value: d.id, label: `${d.depoKodu} — ${d.depoAdi}` }))}
            onChange={(v) => satirGuncelle(s.id, { depoId: v })}
          />
        ),
      },
      {
        id: 'kasaId',
        baslik: 'Kasa',
        tip: 'metin',
        genislik: 170,
        minGenislik: 130,
        degerAl: (s) => s.kasaId,
        goster: (s) => (
          <SecimHucre
            ariaLabel="Kasa"
            taslak={s.id === TASLAK_ID}
            value={s.kasaId}
            disabled={saltOkunur || !s.subeId}
            secenekler={kasalar
              .filter((k) => k.subeId === s.subeId)
              .map((k) => ({ value: k.id, label: `${k.kasaKodu} — ${k.kasaAdi}` }))}
            onChange={(v) => satirGuncelle(s.id, { kasaId: v })}
          />
        ),
      },
      {
        id: 'aksiyon',
        baslik: '#',
        tip: 'salt-okunur',
        genislik: 56,
        minGenislik: 48,
        sabitSag: true,
        siralama: false,
        degerAl: () => null,
        goster: (s) => {
          if (s.id === TASLAK_ID) {
            return (
              <div className="dg-islem-grup" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="dg-islem-tus ap-erisim-ekle-tus"
                  title="Satır ekle (Enter)"
                  aria-label="Satır ekle"
                  disabled={saltOkunur}
                  onClick={() => satirEkle()}
                >
                  +
                </button>
              </div>
            );
          }
          if (saltOkunur) return null;
          return (
            <div className="dg-islem-grup" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="dg-islem-tus dg-islem-tus--tehlike"
                title="Satırı sil"
                aria-label="Satırı sil"
                onClick={() => setSilinecek(s)}
              >
                <DgIkon ad="sil" />
              </button>
            </div>
          );
        },
      },
    ];
  }, [secenekler, saltOkunur, satirGuncelle, satirEkle]);

  useEffect(() => {
    if (saltOkunur) return;

    function enterIleEkle(e: KeyboardEvent) {
      if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
      const hedef = e.target as HTMLElement | null;
      if (!hedef) return;
      if (!hedef.closest('.ap-erisim-ana')) return;
      if (hedef.closest('textarea, input, .ap-erisim-sabit-bilgi, .ap-sil-onay-modal')) return;
      if (hedef.closest('.ap-erisim-ekle-tus')) return;
      if (document.querySelector('.ap-form-acilir-secim-liste, .ap-sil-onay-modal')) return;

      const taslakCombobox = hedef.closest('.ap-erisim-satir--taslak .ap-form-acilir-secim-tus');
      const hucreOdak = hedef.closest('.ap-erisim-satir--taslak td.dg-hucre');
      if (!taslakCombobox && !hucreOdak) return;

      e.preventDefault();
      e.stopPropagation();
      satirEkle();
    }

    document.addEventListener('keydown', enterIleEkle, true);
    return () => document.removeEventListener('keydown', enterIleEkle, true);
  }, [saltOkunur, satirEkle]);

  if (yukleniyor) {
    return <YukleniyorDurumu mesaj="Kullanıcı erişimleri yükleniyor..." />;
  }

  return (
    <div className="ap-erisim-duzen">
      <aside className="ap-erisim-kullanici-liste" aria-label="Kullanıcılar">
        <div className="ap-erisim-arama">
          <input
            type="search"
            className="ap-erisim-arama-input"
            placeholder="Kullanıcı ara…"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            aria-label="Kullanıcı ara"
          />
        </div>
        <div className="ap-erisim-kullanici-scroll">
          {filtreliKullanicilar.length === 0 ? (
            <p className="ap-erisim-bos-liste">Kullanıcı bulunamadı</p>
          ) : (
            filtreliKullanicilar.map((k) => {
              const secili = k.id === seciliId;
              return (
                <button
                  key={k.id}
                  type="button"
                  className={`ap-erisim-kullanici-oge${secili ? ' ap-erisim-kullanici-oge--aktif' : ''}${!k.aktif ? ' ap-erisim-kullanici-oge--pasif' : ''}`}
                  onClick={() => {
                    if (
                      degisti &&
                      !window.confirm('Kaydedilmemiş değişiklikler var. Yine de değiştirilsin mi?')
                    ) {
                      return;
                    }
                    setSeciliId(k.id);
                  }}
                >
                  <span className="ap-erisim-kullanici-ad">{k.ad}</span>
                  <span className="ap-erisim-kullanici-kod">{k.kullaniciKodu}</span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div className="ap-erisim-ana">
        {hata && <div className="ap-bildirim ap-bildirim-hata rounded-xl p-3 text-sm">{hata}</div>}

        {!form ? (
          <p className="ap-erisim-bos-liste">Soldan bir kullanıcı seçin</p>
        ) : (
          <DataGrid
            tabloBaslik="Erişim satırları"
            kolonlar={kolonlar}
            satirlar={gosterilenSatirlar}
            depolamaAnahtari="kullanicilar-erisim-atamasi-v1"
            kompakt
            formulMenuGoster={false}
            sutunSabitleGoster={false}
            ustSagEk={
              <SecimSabitAraci seviye={secimSabit} onDegistir={secimSabitDegistir} />
            }
            bosMesaj="Üst satırdan seçim yapıp + veya Ekle’ye basın"
            onSecimDegistir={setSeciliSatirIdleri}
            satirSinifAdi={(s) =>
              s.id === TASLAK_ID ? 'ap-erisim-satir--taslak' : 'ap-erisim-satir--kayit'
            }
          />
        )}
      </div>

      <SilmeOnayModal
        acik={!!silinecek}
        onKapat={() => setSilinecek(null)}
        onOnayla={satirSilOnayla}
        baslik="Bu erişim satırını silmek istiyor musunuz?"
        hedefMetin={silinecek ? erisimOzetMetni(silinecek, secenekler) : ''}
        ariaLabel="Erişim satırı silme onayı"
      />
    </div>
  );
}
