import { useCallback, useId, useRef, useState } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import { DgIkon } from '@/admin/ortak/datagrid/DgIkonlar';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { yeniKayitId } from '../cariDosyaDokumanDeposu';
import type { CariDosya, CariDosyaDokuman, CariNot } from '../tipler';

const KABUL_EDILEN_TIPLER = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const KABUL_UZANTILAR = '.pdf,.png,.jpg,.jpeg,.gif,.webp';
const MAKS_BOYUT = 10 * 1024 * 1024;

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

function dosyayiOku(dosya: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const okuyucu = new FileReader();
    okuyucu.onload = () => resolve(String(okuyucu.result ?? ''));
    okuyucu.onerror = () => reject(new Error('Dosya okunamadı'));
    okuyucu.readAsDataURL(dosya);
  });
}

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
  const dosyaInputId = useId();
  const dosyaInputRef = useRef<HTMLInputElement>(null);
  const [notMetin, setNotMetin] = useState('');
  const [duzenlenenNotId, setDuzenlenenNotId] = useState<string | null>(null);
  const [duzenlenenMetin, setDuzenlenenMetin] = useState('');
  const [etiketMetin, setEtiketMetin] = useState('');
  const [surukleUzerinde, setSurukleUzerinde] = useState(false);
  const [silinecek, setSilinecek] = useState<
    | { tur: 'not'; id: string; metin: string }
    | { tur: 'etiket'; metin: string }
    | null
  >(null);
  const veriVar =
    deger.notlar.length > 0 || deger.dosyalar.length > 0 || deger.etiketler.length > 0;
  const [acik, setAcik] = useState(veriVar);
  const panelAcik = acik || veriVar;

  const yazarAdi = kullanici?.ad?.trim() || 'Kullanıcı';

  const guncelle = useCallback(
    (parca: Partial<CariDosyaDokuman>) => {
      onChange({ ...deger, ...parca });
    },
    [deger, onChange]
  );

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

  const etiketEkle = () => {
    const etiket = etiketMetin.trim();
    if (!etiket || disabled) return;
    const varMi = deger.etiketler.some(
      (e) => e.toLocaleLowerCase('tr') === etiket.toLocaleLowerCase('tr')
    );
    if (varMi) {
      setEtiketMetin('');
      return;
    }
    guncelle({ etiketler: [...deger.etiketler, etiket] });
    setEtiketMetin('');
  };

  const etiketSil = (etiket: string) => {
    guncelle({ etiketler: deger.etiketler.filter((e) => e !== etiket) });
  };

  const silOnayla = () => {
    if (!silinecek) return;
    if (silinecek.tur === 'not') notSil(silinecek.id);
    else etiketSil(silinecek.metin);
    setSilinecek(null);
  };

  const dosyalariEkle = async (liste: FileList | File[]) => {
    if (disabled) return;
    const dosyalar = Array.from(liste);
    if (dosyalar.length === 0) return;

    const eklenen: CariDosya[] = [];
    for (const dosya of dosyalar) {
      const hata = dosyaOkunabilirMi(dosya);
      if (hata) {
        onHata?.(hata);
        continue;
      }
      try {
        const dataUrl = await dosyayiOku(dosya);
        eklenen.push({
          id: yeniKayitId('cd'),
          ad: dosya.name,
          boyut: dosya.size,
          tip: dosya.type || 'application/octet-stream',
          dataUrl,
          tarih: new Date().toISOString(),
        });
      } catch {
        onHata?.('Dosya okunamadı');
      }
    }
    if (eklenen.length > 0) {
      guncelle({ dosyalar: [...eklenen, ...deger.dosyalar] });
    }
  };

  const dosyaSil = (id: string) => {
    guncelle({ dosyalar: deger.dosyalar.filter((d) => d.id !== id) });
  };

  return (
    <section className="cari-dokuman-bolumu">
      <div className="cari-dokuman-baslik-satir">
        <h3 className="cari-dokuman-baslik">Dosya Ve Dökümanlar</h3>
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
                  void dosyalariEkle(e.dataTransfer.files);
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
                <p className="cari-dokuman-dropzone-ipucu">PDF, PNG, JPG, GIF, WEBP — maks. 10MB</p>
                <input
                  ref={dosyaInputRef}
                  id={dosyaInputId}
                  type="file"
                  className="cari-dokuman-dosya-input"
                  accept={KABUL_UZANTILAR}
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) void dosyalariEkle(files);
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
                    <a
                      href={dosya.dataUrl}
                      download={dosya.ad}
                      className="cari-dokuman-dosya-ad"
                      title={dosya.ad}
                    >
                      {dosya.ad}
                    </a>
                    <span className="cari-dokuman-dosya-boyut">{boyutEtiketi(dosya.boyut)}</span>
                    {!disabled ? (
                      <button
                        type="button"
                        className="cari-dokuman-ikon-btn cari-dokuman-ikon-btn--tehlike"
                        onClick={() => dosyaSil(dosya.id)}
                        title="Sil"
                        aria-label={`${dosya.ad} dosyasını sil`}
                      >
                        <DgIkon ad="sil" />
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Etiketler */}
          <div className="cari-dokuman-alan">
            <span className="cari-dokuman-alan-etiket">Etiketler</span>

            {deger.etiketler.length > 0 ? (
              <div className="cari-dokuman-etiket-liste">
                {deger.etiketler.map((etiket) => (
                  <span key={etiket} className="cari-dokuman-etiket-chip">
                    {etiket}
                    {!disabled ? (
                      <button
                        type="button"
                        className="cari-dokuman-etiket-sil"
                        onClick={() => setSilinecek({ tur: 'etiket', metin: etiket })}
                        aria-label={`${etiket} etiketini kaldır`}
                      >
                        ×
                      </button>
                    ) : null}
                  </span>
                ))}
              </div>
            ) : null}

            {!disabled ? (
              <div className="cari-dokuman-satir">
                <input
                  type="text"
                  className="cari-dokuman-girdi"
                  value={etiketMetin}
                  placeholder="Etiket yazın ve ekleyin"
                  maxLength={40}
                  onChange={(e) => setEtiketMetin(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      etiketEkle();
                    }
                  }}
                />
                <button
                  type="button"
                  className="cari-dokuman-ekle-btn cari-dokuman-ekle-btn--ikon"
                  onClick={etiketEkle}
                  disabled={!etiketMetin.trim()}
                  aria-label="Etiket ekle"
                  title="Etiket ekle"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
                    <path
                      d="M8 3v10M3 8h10"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            ) : deger.etiketler.length === 0 ? (
              <p className="cari-dokuman-bos">Etiket yok</p>
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
        ariaLabel={silinecek?.tur === 'etiket' ? 'Etiket silme onayı' : 'Not silme onayı'}
      />
    </section>
  );
}
