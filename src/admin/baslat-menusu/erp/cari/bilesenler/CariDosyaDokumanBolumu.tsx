import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/baglamlar/AuthContext';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import { sekmePortalHedefi } from '@/araclar/sekmePortal';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { yeniKayitId } from '../cariDosyaDokumanDeposu';
import { pdfDosyalariniBirlestir } from '../pdfBirlestir';
import type { CariDosya, CariDosyaDokuman, CariNot } from '../tipler';

const KABUL_EDILEN_TIPLER = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const KABUL_UZANTILAR = '.pdf,.png,.jpg,.jpeg,.gif,.webp';
const MAKS_BOYUT = 10 * 1024 * 1024;
const MAKS_DOSYA_NOT = 5;

const AY_KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function notTarihEtiketi(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const gun = d.getDate();
  const ay = AY_KISA[d.getMonth()] ?? '';
  const yil = d.getFullYear();
  const saat = String(d.getHours()).padStart(2, '0');
  const dakika = String(d.getMinutes()).padStart(2, '0');
  return `${gun} ${ay} ${yil} ${saat}:${dakika}`;
}

function boyutEtiketi(bayt: number): string {
  if (bayt < 1024) return `${bayt} B`;
  if (bayt < 1024 * 1024) return `${(bayt / 1024).toFixed(1)} KB`;
  return `${(bayt / (1024 * 1024)).toFixed(1)} MB`;
}

function dosyaOkunabilirMi(dosya: File): string | null {
  const tipUygun =
    KABUL_EDILEN_TIPLER.includes(dosya.type) ||
    /\.(pdf|png|jpe?g|gif|webp)$/i.test(dosya.name);
  if (!tipUygun) return 'Yalnızca PDF, PNG, JPG, GIF veya WEBP yüklenebilir.';
  if (dosya.size > MAKS_BOYUT) return 'Dosya boyutu en fazla 10MB olabilir.';
  return null;
}

function dosyaTipiBelirle(dosya: File): string {
  if (dosya.type) return dosya.type;
  const ad = dosya.name.toLowerCase();
  if (ad.endsWith('.pdf')) return 'application/pdf';
  if (ad.endsWith('.jpg') || ad.endsWith('.jpeg')) return 'image/jpeg';
  if (ad.endsWith('.png')) return 'image/png';
  if (ad.endsWith('.gif')) return 'image/gif';
  if (ad.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

function dosyayiOku(dosya: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const okuyucu = new FileReader();
    okuyucu.onload = () => resolve(String(okuyucu.result ?? ''));
    okuyucu.onerror = () => reject(new Error('Dosya okunamadı'));
    okuyucu.readAsDataURL(dosya);
  });
}

function fileResimMi(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return /\.(png|jpe?g|gif|webp)$/i.test(file.name);
}

function filePdfMi(file: File): boolean {
  if (file.type === 'application/pdf') return true;
  return /\.pdf$/i.test(file.name);
}

function dosyaAdiAyir(ad: string): { kok: string; uzanti: string } {
  const indeks = ad.lastIndexOf('.');
  if (indeks <= 0) return { kok: ad, uzanti: '' };
  return { kok: ad.slice(0, indeks), uzanti: ad.slice(indeks) };
}

function dosyaAdiBirlestir(kok: string, uzanti: string): string {
  const temiz = kok.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '').replace(/\.+$/g, '');
  return `${temiz || 'dosya'}${uzanti}`;
}

function dosyaResimMi(dosya: CariDosya): boolean {
  if (dosya.tip.startsWith('image/')) return true;
  return /\.(png|jpe?g|gif|webp)$/i.test(dosya.ad);
}

function dosyaPdfMi(dosya: CariDosya): boolean {
  if (dosya.tip === 'application/pdf') return true;
  return /\.pdf$/i.test(dosya.ad);
}

function dosyaOnizlenebilirMi(dosya: CariDosya): boolean {
  return dosyaResimMi(dosya) || dosyaPdfMi(dosya);
}

function DosyaNotTextarea({
  value,
  disabled,
  autoFocus,
  placeholder,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const MAKS_YUKSEKLIK = 96;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    const hedef = Math.max(el.scrollHeight, 44);
    el.style.height = `${Math.min(hedef, MAKS_YUKSEKLIK)}px`;
    el.style.overflowY = hedef > MAKS_YUKSEKLIK ? 'auto' : 'hidden';
  }, [value]);

  return (
    <textarea
      ref={ref}
      className="cari-dokuman-cift-not-girdi"
      value={value}
      placeholder={placeholder ?? 'Not yazın…'}
      rows={1}
      maxLength={500}
      disabled={disabled}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function CiftSatir({
  onizleme,
  notlar,
  notSayisi,
  onNotEkle,
  notEkleDisabled,
}: {
  onizleme: ReactNode;
  notlar: ReactNode;
  notSayisi: number;
  onNotEkle?: () => void;
  notEkleDisabled?: boolean;
}) {
  const onizlemeRef = useRef<HTMLDivElement>(null);
  const [notYukseklik, setNotYukseklik] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = onizlemeRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const guncelle = () => {
      const olculen = Math.round(el.getBoundingClientRect().height);
      setNotYukseklik(Math.max(224, olculen));
    };

    guncelle();
    const gozlemci = new ResizeObserver(guncelle);
    gozlemci.observe(el);
    window.addEventListener('resize', guncelle);
    return () => {
      gozlemci.disconnect();
      window.removeEventListener('resize', guncelle);
    };
  }, []);

  const limitDoldu = notSayisi >= MAKS_DOSYA_NOT;
  const ekleKapali = Boolean(notEkleDisabled) || limitDoldu;

  return (
    <div className="cari-dokuman-cift-satir">
      <div
        ref={onizlemeRef}
        className="cari-dokuman-cift-panel cari-dokuman-cift-panel--onizleme"
      >
        {onizleme}
      </div>
      <div
        className="cari-dokuman-cift-panel cari-dokuman-cift-panel--not"
        style={
          notYukseklik
            ? { height: notYukseklik, maxHeight: notYukseklik, minHeight: notYukseklik }
            : undefined
        }
      >
        {onNotEkle ? (
          <button
            type="button"
            className={`cari-dokuman-cift-not-ekle${notEkleDisabled ? ' cari-dokuman-cift-not-ekle--bekliyor' : ''}`}
            disabled={ekleKapali}
            title={
              limitDoldu
                ? `En fazla ${MAKS_DOSYA_NOT} not eklenebilir`
                : undefined
            }
            onClick={() => {
              if (!ekleKapali) onNotEkle();
            }}
          >
            + Not ekle
          </button>
        ) : null}
        <div className="cari-dokuman-cift-not-liste">{notlar}</div>
      </div>
    </div>
  );
}

type BekleyenDosya = {
  yerelId: string;
  file: File;
  /** Kullanıcının düzenleyebildiği ad (uzantı sabit). */
  ad: string;
  notlar: string[];
  onizlemeUrl: string;
};

export function CariDosyaDokumanBolumu({
  deger,
  disabled,
  onChange,
  onHata,
}: {
  deger: CariDosyaDokuman;
  disabled?: boolean;
  onChange: (deger: CariDosyaDokuman) => void;
  onHata?: (mesaj: string) => void;
}) {
  const { kullanici } = useAuth();
  const sekme = useAdminSekmeKabuk();
  const dosyaInputId = useId();
  const dosyaInputRef = useRef<HTMLInputElement>(null);
  const [notMetin, setNotMetin] = useState('');
  const [duzenlenenNotId, setDuzenlenenNotId] = useState<string | null>(null);
  const [duzenlenenMetin, setDuzenlenenMetin] = useState('');
  const [bekleyenDosyalar, setBekleyenDosyalar] = useState<BekleyenDosya[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [surukleUzerinde, setSurukleUzerinde] = useState(false);
  const [silinecek, setSilinecek] = useState<
    | { tur: 'not'; id: string; metin: string }
    | { tur: 'dosya'; id: string; metin: string }
    | null
  >(null);
  const [onizleme, setOnizleme] = useState<CariDosya | null>(null);

  const yukleModalAcik = bekleyenDosyalar.length > 0;
  const portalKok = useMemo(
    () =>
      yukleModalAcik || onizleme ? sekmePortalHedefi(null, sekme?.sekmeId) : null,
    [yukleModalAcik, onizleme, sekme?.sekmeId]
  );

  const veriVar = deger.notlar.length > 0 || deger.dosyalar.length > 0;
  const [acik, setAcik] = useState(veriVar);
  const panelAcik = acik || veriVar;

  const yazarAdi = kullanici?.ad?.trim() || 'Kullanıcı';

  const guncelle = useCallback(
    (parca: Partial<CariDosyaDokuman>) => {
      onChange({ ...deger, ...parca });
    },
    [deger, onChange]
  );

  const bekleyenTemizle = useCallback((liste: BekleyenDosya[]) => {
    for (const b of liste) {
      URL.revokeObjectURL(b.onizlemeUrl);
    }
  }, []);

  const bekleyenRef = useRef(bekleyenDosyalar);
  bekleyenRef.current = bekleyenDosyalar;

  const bekleyenleriIptal = useCallback(() => {
    setBekleyenDosyalar((onceki) => {
      bekleyenTemizle(onceki);
      return [];
    });
  }, [bekleyenTemizle]);

  useEffect(() => {
    return () => {
      bekleyenTemizle(bekleyenRef.current);
    };
  }, [bekleyenTemizle]);

  const notEkle = () => {
    const metin = notMetin.trim();
    if (!metin || disabled) return;
    const yeni: CariNot = {
      id: yeniKayitId('cn'),
      metin,
      yazar: yazarAdi,
      tarih: new Date().toISOString(),
    };
    guncelle({ notlar: [yeni, ...deger.notlar] });
    setNotMetin('');
  };

  const notDuzenleBaslat = (not: CariNot) => {
    if (disabled) return;
    setDuzenlenenNotId(not.id);
    setDuzenlenenMetin(not.metin);
  };

  const notDuzenleKaydet = () => {
    if (!duzenlenenNotId) return;
    const metin = duzenlenenMetin.trim();
    if (!metin) {
      setDuzenlenenNotId(null);
      setDuzenlenenMetin('');
      return;
    }
    guncelle({
      notlar: deger.notlar.map((n) =>
        n.id === duzenlenenNotId ? { ...n, metin, tarih: new Date().toISOString() } : n
      ),
    });
    setDuzenlenenNotId(null);
    setDuzenlenenMetin('');
  };

  const notDuzenleIptal = () => {
    setDuzenlenenNotId(null);
    setDuzenlenenMetin('');
  };

  const notSil = (id: string) => {
    if (duzenlenenNotId === id) notDuzenleIptal();
    guncelle({ notlar: deger.notlar.filter((n) => n.id !== id) });
  };

  const dosyaSil = (id: string) => {
    guncelle({ dosyalar: deger.dosyalar.filter((d) => d.id !== id) });
    if (onizleme?.id === id) setOnizleme(null);
  };

  const silOnayla = () => {
    if (!silinecek) return;
    if (silinecek.tur === 'not') notSil(silinecek.id);
    else dosyaSil(silinecek.id);
    setSilinecek(null);
  };

  const beklemeyeAl = (liste: FileList | File[]) => {
    if (disabled) return;
    const dosyalar = Array.from(liste);
    if (dosyalar.length === 0) return;

    void (async () => {
      const gecerli: File[] = [];
      for (const dosya of dosyalar) {
        const hata = dosyaOkunabilirMi(dosya);
        if (hata) {
          onHata?.(hata);
          continue;
        }
        gecerli.push(dosya);
      }
      if (gecerli.length === 0) return;

      const pdfler = gecerli.filter(filePdfMi);
      const digerler = gecerli.filter((d) => !filePdfMi(d));
      const eklenecek: BekleyenDosya[] = [];

      // Aynı seçimde birden fazla PDF → hemen birleştir; modalda tek dosya görünsün
      if (pdfler.length >= 2) {
        try {
          const birlesik = await pdfDosyalariniBirlestir(pdfler);
          if (birlesik.size > MAKS_BOYUT) {
            onHata?.(
              `Birleştirilen PDF boyutu çok büyük (${boyutEtiketi(birlesik.size)}). Maks. 10MB.`
            );
          } else {
            eklenecek.push({
              yerelId: yeniKayitId('bd'),
              file: birlesik,
              ad: birlesik.name,
              notlar: [],
              onizlemeUrl: URL.createObjectURL(birlesik),
            });
          }
        } catch {
          onHata?.('PDF dosyaları birleştirilemedi');
        }
      } else if (pdfler.length === 1) {
        const tek = pdfler[0]!;
        eklenecek.push({
          yerelId: yeniKayitId('bd'),
          file: tek,
          ad: tek.name,
          notlar: [],
          onizlemeUrl: URL.createObjectURL(tek),
        });
      }

      for (const dosya of digerler) {
        eklenecek.push({
          yerelId: yeniKayitId('bd'),
          file: dosya,
          ad: dosya.name,
          notlar: [],
          onizlemeUrl: URL.createObjectURL(dosya),
        });
      }

      if (eklenecek.length > 0) {
        setBekleyenDosyalar((onceki) => [...onceki, ...eklenecek]);
      }
    })();
  };

  const bekleyenAdGuncelle = (yerelId: string, yeniKok: string) => {
    setBekleyenDosyalar((onceki) =>
      onceki.map((b) => {
        if (b.yerelId !== yerelId) return b;
        const { uzanti } = dosyaAdiAyir(b.ad || b.file.name);
        return { ...b, ad: dosyaAdiBirlestir(yeniKok, uzanti) };
      })
    );
  };

  const bekleyenNotEkle = (yerelId: string) => {
    setBekleyenDosyalar((onceki) =>
      onceki.map((b) => {
        if (b.yerelId !== yerelId) return b;
        if (b.notlar.length >= MAKS_DOSYA_NOT) return b;
        return { ...b, notlar: [...b.notlar, ''] };
      })
    );
  };

  const bekleyenNotGuncelle = (yerelId: string, indeks: number, metin: string) => {
    setBekleyenDosyalar((onceki) =>
      onceki.map((b) => {
        if (b.yerelId !== yerelId) return b;
        const notlar = [...b.notlar];
        notlar[indeks] = metin;
        return { ...b, notlar };
      })
    );
  };

  const bekleyenNotSil = (yerelId: string, indeks: number) => {
    setBekleyenDosyalar((onceki) =>
      onceki.map((b) => {
        if (b.yerelId !== yerelId) return b;
        return { ...b, notlar: b.notlar.filter((_, i) => i !== indeks) };
      })
    );
  };

  const bekleyenKaldir = (yerelId: string) => {
    setBekleyenDosyalar((onceki) => {
      const hedef = onceki.find((b) => b.yerelId === yerelId);
      if (hedef) URL.revokeObjectURL(hedef.onizlemeUrl);
      return onceki.filter((b) => b.yerelId !== yerelId);
    });
  };

  const bekleyenleriYukle = async () => {
    if (disabled || bekleyenDosyalar.length === 0 || yukleniyor) return;
    setYukleniyor(true);
    const eklenen: CariDosya[] = [];
    for (const bekleyen of bekleyenDosyalar) {
      try {
        const dataUrl = await dosyayiOku(bekleyen.file);
        eklenen.push({
          id: yeniKayitId('cd'),
          ad: bekleyen.ad || bekleyen.file.name,
          boyut: bekleyen.file.size,
          tip: dosyaTipiBelirle(bekleyen.file),
          dataUrl,
          tarih: new Date().toISOString(),
          dosyaNotlari: bekleyen.notlar.map((n) => n.trim()).filter(Boolean),
        });
      } catch {
        onHata?.(`${bekleyen.file.name} okunamadı`);
      }
    }
    if (eklenen.length > 0) {
      guncelle({ dosyalar: [...eklenen, ...deger.dosyalar] });
    }
    bekleyenTemizle(bekleyenDosyalar);
    setBekleyenDosyalar([]);
    setYukleniyor(false);
  };

  const dosyaNotlariGuncelle = (id: string, dosyaNotlari: string[]) => {
    guncelle({
      dosyalar: deger.dosyalar.map((d) => (d.id === id ? { ...d, dosyaNotlari } : d)),
    });
    setOnizleme((onceki) => (onceki?.id === id ? { ...onceki, dosyaNotlari } : onceki));
  };

  const dosyaNotEkle = (id: string) => {
    const hedef = deger.dosyalar.find((d) => d.id === id);
    if (!hedef) return;
    if ((hedef.dosyaNotlari ?? []).length >= MAKS_DOSYA_NOT) return;
    dosyaNotlariGuncelle(id, [...(hedef.dosyaNotlari ?? []), '']);
  };

  const dosyaNotGuncelle = (id: string, indeks: number, metin: string) => {
    const hedef = deger.dosyalar.find((d) => d.id === id);
    if (!hedef) return;
    const dosyaNotlari = [...(hedef.dosyaNotlari ?? [])];
    dosyaNotlari[indeks] = metin;
    dosyaNotlariGuncelle(id, dosyaNotlari);
  };

  const dosyaNotSil = (id: string, indeks: number) => {
    const hedef = deger.dosyalar.find((d) => d.id === id);
    if (!hedef) return;
    dosyaNotlariGuncelle(
      id,
      (hedef.dosyaNotlari ?? []).filter((_, i) => i !== indeks)
    );
  };

  const dosyaAc = (dosya: CariDosya) => {
    if (dosyaOnizlenebilirMi(dosya)) {
      setOnizleme(dosya);
      return;
    }
    window.open(dosya.dataUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (!yukleModalAcik && !onizleme) return;
    function tusHandler(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (yukleModalAcik && !yukleniyor) {
        bekleyenleriIptal();
        return;
      }
      if (onizleme) setOnizleme(null);
    }
    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [yukleModalAcik, onizleme, yukleniyor, bekleyenleriIptal]);

  return (
    <section className="cari-dokuman-bolumu">
      <div className="cari-iletisim-baslik-satir">
        <h3 className="cari-iletisim-baslik">Dosya ve Dökümanlar</h3>
        {!disabled && !panelAcik ? (
          <button
            type="button"
            className="cari-iletisim-ekle"
            onClick={() => setAcik(true)}
            title="Dosya ve döküman alanını aç"
            aria-label="Dosya ve doküman alanını aç"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {panelAcik ? (
        <div className="cari-dokuman-alanlar">
          {/* Notlar */}
          <div className="cari-dokuman-alan">
            <span className="cari-dokuman-alan-etiket">Notlar</span>

            {deger.notlar.length > 0 ? (
              <div className="cari-dokuman-not-liste">
                {deger.notlar.map((not) => {
                  const duzenleniyor = duzenlenenNotId === not.id;
                  return (
                    <article
                      key={not.id}
                      className={`cari-dokuman-not-kart${duzenleniyor ? ' cari-dokuman-not-kart--duzenleniyor' : ''}`}
                      onDoubleClick={() => {
                        if (!duzenleniyor) notDuzenleBaslat(not);
                      }}
                      title={!disabled && !duzenleniyor ? 'Düzenlemek için çift tıklayın' : undefined}
                    >
                      {!disabled ? (
                        <div className="cari-dokuman-not-aksiyonlar">
                          {!duzenleniyor ? (
                            <button
                              type="button"
                              className="cari-dokuman-kart-aksiyon"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => notDuzenleBaslat(not)}
                              title="Düzenle"
                              aria-label="Notu düzenle"
                            >
                              <DgIkon ad="duzenle" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="cari-dokuman-kart-aksiyon cari-dokuman-kart-aksiyon--sil"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() =>
                              setSilinecek({
                                tur: 'not',
                                id: not.id,
                                metin: not.metin.trim() || 'Adsız not',
                              })
                            }
                            title="Sil"
                            aria-label="Notu sil"
                          >
                            <DgIkon ad="sil" />
                          </button>
                        </div>
                      ) : null}

                      {duzenleniyor ? (
                        <input
                          type="text"
                          className="cari-dokuman-not-satir-input"
                          value={duzenlenenMetin}
                          autoFocus
                          onChange={(e) => setDuzenlenenMetin(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              e.stopPropagation();
                              notDuzenleKaydet();
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              e.stopPropagation();
                              notDuzenleIptal();
                            }
                          }}
                          onBlur={() => notDuzenleKaydet()}
                        />
                      ) : (
                        <p className="cari-dokuman-not-metin">{not.metin}</p>
                      )}

                      <div className="cari-dokuman-not-meta">
                        <span className="cari-dokuman-not-meta-oge">
                          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
                            <circle cx="8" cy="5.5" r="2.4" stroke="currentColor" strokeWidth="1.3" />
                            <path
                              d="M3.2 13c.7-2.2 2.4-3.3 4.8-3.3s4.1 1.1 4.8 3.3"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                            />
                          </svg>
                          {not.yazar}
                        </span>
                        <span className="cari-dokuman-not-meta-oge">
                          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
                            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                            <path
                              d="M8 5v3.2l2 1.3"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {notTarihEtiketi(not.tarih)}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}

            {!disabled ? (
              <div className="cari-dokuman-satir">
                <input
                  type="text"
                  className="cari-dokuman-girdi"
                  value={notMetin}
                  placeholder="Yeni not ekleyin..."
                  onChange={(e) => setNotMetin(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      notEkle();
                    }
                  }}
                />
                <button
                  type="button"
                  className="cari-dokuman-ekle-btn"
                  onClick={notEkle}
                  disabled={!notMetin.trim()}
                >
                  Ekle
                </button>
              </div>
            ) : null}
          </div>

          {/* Dosyalar */}
          <div className="cari-dokuman-alan">
            <span className="cari-dokuman-alan-etiket">Dosyalar</span>

            {!disabled ? (
              <div
                className={`cari-dokuman-dropzone${surukleUzerinde ? ' cari-dokuman-dropzone--aktif' : ''}`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setSurukleUzerinde(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setSurukleUzerinde(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setSurukleUzerinde(false);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setSurukleUzerinde(false);
                  beklemeyeAl(e.dataTransfer.files);
                }}
                onClick={() => dosyaInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dosyaInputRef.current?.click();
                  }
                }}
              >
                <svg
                  className="cari-dokuman-dropzone-ikon"
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 15V4M8.5 7.5 12 4l3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.5 14.5v3A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5v-3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="cari-dokuman-dropzone-yazi">
                  Dosya sürükleyip bırakın veya{' '}
                  <span className="cari-dokuman-dropzone-link">tıklayarak seçin</span>
                </p>
                <p className="cari-dokuman-dropzone-ipucu">
                  PDF, PNG, JPG, GIF, WEBP — maks. 10MB · aynı anda seçilen PDF’ler birleştirilir
                </p>
                <input
                  ref={dosyaInputRef}
                  id={dosyaInputId}
                  type="file"
                  className="cari-dokuman-dosya-input"
                  accept={KABUL_UZANTILAR}
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) beklemeyeAl(files);
                    e.target.value = '';
                  }}
                />
              </div>
            ) : deger.dosyalar.length === 0 ? (
              <p className="cari-dokuman-bos">Dosya yok</p>
            ) : null}

            {deger.dosyalar.length > 0 ? (
              <ul className="cari-dokuman-dosya-liste">
                {deger.dosyalar.map((dosya) => (
                  <li key={dosya.id} className="cari-dokuman-dosya-oge">
                    <div className="cari-dokuman-dosya-ust">
                      <button
                        type="button"
                        className="cari-dokuman-dosya-ad"
                        title={dosyaOnizlenebilirMi(dosya) ? 'Görüntüle' : 'Aç'}
                        onClick={() => dosyaAc(dosya)}
                      >
                        {dosya.ad}
                      </button>
                      <span className="cari-dokuman-dosya-boyut">{boyutEtiketi(dosya.boyut)}</span>
                      {!disabled ? (
                        <button
                          type="button"
                          className="cari-dokuman-ikon-btn cari-dokuman-ikon-btn--tehlike"
                          onClick={() =>
                            setSilinecek({ tur: 'dosya', id: dosya.id, metin: dosya.ad })
                          }
                          title="Sil"
                          aria-label={`${dosya.ad} dosyasını sil`}
                        >
                          <DgIkon ad="sil" />
                        </button>
                      ) : null}
                    </div>
                    {(dosya.dosyaNotlari ?? []).some((n) => n.trim()) ? (
                      <div className="cari-dokuman-dosya-not-ozetler">
                        {(dosya.dosyaNotlari ?? []).map((not, i) =>
                          not.trim() ? (
                            <p
                              key={`${dosya.id}-n-${i}`}
                              className="cari-dokuman-dosya-not-ozet"
                              title={not}
                            >
                              <span className="cari-dokuman-dosya-not-ozet-etiket">
                                Not {i + 1}:
                              </span>{' '}
                              {not}
                            </p>
                          ) : null
                        )}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      <SilmeOnayModal
        acik={!!silinecek}
        onKapat={() => setSilinecek(null)}
        onOnayla={silOnayla}
        baslik="Silmek istediğinize emin misiniz?"
        hedefMetin={
          silinecek
            ? silinecek.tur === 'not'
              ? silinecek.metin.length > 60
                ? `${silinecek.metin.slice(0, 60)}…`
                : silinecek.metin
              : silinecek.metin
            : ''
        }
        ariaLabel={silinecek?.tur === 'dosya' ? 'Dosya silme onayı' : 'Not silme onayı'}
      />

      {yukleModalAcik && portalKok
        ? createPortal(
            <div
              className="cari-dokuman-cift-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Dosya yükleme"
            >
              <button
                type="button"
                className="cari-dokuman-onizleme-arka"
                aria-label="Kapat"
                disabled={yukleniyor}
                onClick={() => {
                  if (!yukleniyor) bekleyenleriIptal();
                }}
              />
              <div className="cari-dokuman-cift-kabuk">
                <header className="cari-dokuman-cift-ust">
                  <div className="cari-dokuman-cift-baslik-grup">
                    <span className="cari-dokuman-cift-baslik">Dosya yükle</span>
                    <span className="cari-dokuman-cift-alt">
                      {bekleyenDosyalar.length} dosya · aynı anda seçilen PDF’ler otomatik birleştirildi
                    </span>
                  </div>
                  <button
                    type="button"
                    className="cari-dokuman-onizleme-kapat"
                    onClick={() => {
                      if (!yukleniyor) bekleyenleriIptal();
                    }}
                    disabled={yukleniyor}
                    aria-label="Kapat (Esc)"
                    title="Kapat (Esc)"
                  >
                    ×
                  </button>
                </header>

                <div className="cari-dokuman-cift-liste">
                  {bekleyenDosyalar.map((bekleyen, satirIndeks) => {
                    const resim = fileResimMi(bekleyen.file);
                    const pdf = filePdfMi(bekleyen.file);
                    const gosterilenAd = bekleyen.ad || bekleyen.file.name;
                    const { kok, uzanti } = dosyaAdiAyir(gosterilenAd);
                    return (
                      <CiftSatir
                        key={bekleyen.yerelId}
                        onizleme={
                          <>
                            <div className="cari-dokuman-cift-panel-ust">
                              <label className="cari-dokuman-cift-panel-ad-alan" title={gosterilenAd}>
                                <input
                                  type="text"
                                  className="cari-dokuman-cift-panel-ad"
                                  value={kok}
                                  disabled={yukleniyor}
                                  autoFocus={satirIndeks === 0}
                                  spellCheck={false}
                                  aria-label="Dosya adı"
                                  onFocus={(e) => e.currentTarget.select()}
                                  onChange={(e) =>
                                    bekleyenAdGuncelle(bekleyen.yerelId, e.target.value)
                                  }
                                />
                                {uzanti ? (
                                  <span className="cari-dokuman-cift-panel-uzanti">{uzanti}</span>
                                ) : null}
                              </label>
                              <span className="cari-dokuman-cift-panel-boyut">
                                {boyutEtiketi(bekleyen.file.size)}
                              </span>
                              <button
                                type="button"
                                className="cari-dokuman-ikon-btn cari-dokuman-ikon-btn--tehlike"
                                onClick={() => bekleyenKaldir(bekleyen.yerelId)}
                                title="Kaldır"
                                aria-label={`${gosterilenAd} kaldır`}
                                disabled={yukleniyor}
                              >
                                <DgIkon ad="sil" />
                              </button>
                            </div>
                            <div className="cari-dokuman-cift-onizleme-govde">
                              {resim ? (
                                <img
                                  src={bekleyen.onizlemeUrl}
                                  alt={gosterilenAd}
                                  className="cari-dokuman-cift-onizleme-resim"
                                />
                              ) : pdf ? (
                                <iframe
                                  src={bekleyen.onizlemeUrl}
                                  title={gosterilenAd}
                                  className="cari-dokuman-cift-onizleme-pdf"
                                />
                              ) : (
                                <span className="cari-dokuman-cift-onizleme-bos">
                                  Önizleme yok
                                </span>
                              )}
                            </div>
                          </>
                        }
                        notlar={
                          <>
                            {bekleyen.notlar.map((not, indeks) => (
                              <div key={`${bekleyen.yerelId}-n-${indeks}`} className="cari-dokuman-cift-not-oge">
                                <span className="cari-dokuman-cift-not-etiket">Not {indeks + 1}:</span>
                                <div className="cari-dokuman-cift-not-kutu">
                                  <DosyaNotTextarea
                                    value={not}
                                    disabled={yukleniyor}
                                    autoFocus={not === '' && indeks === bekleyen.notlar.length - 1}
                                    placeholder="Notunuzu yazın…"
                                    onChange={(metin) =>
                                      bekleyenNotGuncelle(bekleyen.yerelId, indeks, metin)
                                    }
                                  />
                                  <button
                                    type="button"
                                    className="cari-dokuman-cift-not-sil"
                                    onClick={() => bekleyenNotSil(bekleyen.yerelId, indeks)}
                                    title="Notu sil"
                                    aria-label={`Not ${indeks + 1} sil`}
                                    disabled={yukleniyor}
                                  >
                                    <DgIkon ad="sil" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </>
                        }
                        notSayisi={bekleyen.notlar.length}
                        onNotEkle={() => bekleyenNotEkle(bekleyen.yerelId)}
                        notEkleDisabled={yukleniyor}
                      />
                    );
                  })}
                </div>

                <footer className="cari-dokuman-cift-altbar">
                  <div className="cari-dokuman-cift-altbar-sol">
                    <button
                      type="button"
                      className="cari-dokuman-cift-btn cari-dokuman-cift-btn--ikincil"
                      onClick={() => dosyaInputRef.current?.click()}
                      disabled={yukleniyor}
                    >
                      Dosya ekle
                    </button>
                  </div>
                  <div className="cari-dokuman-cift-altbar-sag">
                    <button
                      type="button"
                      className="cari-dokuman-cift-btn cari-dokuman-cift-btn--ikincil"
                      onClick={bekleyenleriIptal}
                      disabled={yukleniyor}
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      className="cari-dokuman-cift-btn cari-dokuman-cift-btn--birincil"
                      onClick={() => void bekleyenleriYukle()}
                      disabled={yukleniyor || bekleyenDosyalar.length === 0}
                    >
                      {yukleniyor ? 'Yükleniyor…' : 'Yükle'}
                    </button>
                  </div>
                </footer>
              </div>
            </div>,
            portalKok
          )
        : null}

      {onizleme && portalKok && !yukleModalAcik
        ? createPortal(
            <div
              className="cari-dokuman-cift-modal"
              role="dialog"
              aria-modal="true"
              aria-label={dosyaPdfMi(onizleme) ? 'PDF önizleme' : 'Resim önizleme'}
            >
              <button
                type="button"
                className="cari-dokuman-onizleme-arka"
                aria-label="Kapat"
                onClick={() => setOnizleme(null)}
              />
              <div className="cari-dokuman-cift-kabuk cari-dokuman-cift-kabuk--tek">
                <header className="cari-dokuman-cift-ust">
                  <div className="cari-dokuman-cift-baslik-grup">
                    <span className="cari-dokuman-cift-baslik" title={onizleme.ad}>
                      {onizleme.ad}
                    </span>
                    <span className="cari-dokuman-cift-alt">
                      {boyutEtiketi(onizleme.boyut)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="cari-dokuman-onizleme-kapat"
                    onClick={() => setOnizleme(null)}
                    aria-label="Kapat (Esc)"
                    title="Kapat (Esc)"
                  >
                    ×
                  </button>
                </header>

                <div className="cari-dokuman-cift-liste">
                  <CiftSatir
                    onizleme={
                      <div className="cari-dokuman-cift-onizleme-govde">
                        {dosyaPdfMi(onizleme) ? (
                          <iframe
                            src={onizleme.dataUrl}
                            title={onizleme.ad}
                            className="cari-dokuman-cift-onizleme-pdf"
                          />
                        ) : (
                          <img
                            src={onizleme.dataUrl}
                            alt={onizleme.ad}
                            className="cari-dokuman-cift-onizleme-resim"
                          />
                        )}
                      </div>
                    }
                    notlar={
                      !disabled ? (
                        <>
                          {(onizleme.dosyaNotlari ?? []).map((not, indeks) => (
                            <div key={`${onizleme.id}-n-${indeks}`} className="cari-dokuman-cift-not-oge">
                              <span className="cari-dokuman-cift-not-etiket">Not {indeks + 1}:</span>
                              <div className="cari-dokuman-cift-not-kutu">
                                <DosyaNotTextarea
                                  value={not}
                                  autoFocus={not === '' && indeks === (onizleme.dosyaNotlari?.length ?? 0) - 1}
                                  placeholder="Notunuzu yazın…"
                                  onChange={(metin) =>
                                    dosyaNotGuncelle(onizleme.id, indeks, metin)
                                  }
                                />
                                <button
                                  type="button"
                                  className="cari-dokuman-cift-not-sil"
                                  onClick={() => dosyaNotSil(onizleme.id, indeks)}
                                  title="Notu sil"
                                  aria-label={`Not ${indeks + 1} sil`}
                                >
                                  <DgIkon ad="sil" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          {(onizleme.dosyaNotlari ?? []).map((not, i) =>
                            not.trim() ? (
                              <p key={`${onizleme.id}-r-${i}`} className="cari-dokuman-cift-not-metin">
                                <span className="cari-dokuman-cift-not-etiket">Not {i + 1}:</span> {not}
                              </p>
                            ) : null
                          )}
                        </>
                      )
                    }
                    notSayisi={(onizleme.dosyaNotlari ?? []).length}
                    onNotEkle={!disabled ? () => dosyaNotEkle(onizleme.id) : undefined}
                  />
                </div>

                {!disabled ? (
                  <footer className="cari-dokuman-cift-altbar">
                    <div className="cari-dokuman-cift-altbar-sol" />
                    <div className="cari-dokuman-cift-altbar-sag">
                      <button
                        type="button"
                        className="cari-dokuman-cift-btn cari-dokuman-cift-btn--birincil"
                        onClick={() => setOnizleme(null)}
                      >
                        Tamam
                      </button>
                    </div>
                  </footer>
                ) : null}
              </div>
            </div>,
            portalKok
          )
        : null}
    </section>
  );
}
