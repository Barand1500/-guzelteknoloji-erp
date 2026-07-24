import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminAramaKutusu, AdminDurumEtiketi } from '@/admin/ortak/AdminFormBilesenleri';
import { SilmeOnayModal } from '@/admin/ortak/SilmeOnayModal';
import { csvIndir } from '@/admin/ortak/datagrid/formatYardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { ParaBirimiModal } from './ParaBirimiModal';
import {
  PARA_BIRIMLERI_GUNCELLENDI,
  kurTipiEtiketi,
  paraBirimiEkle,
  paraBirimiGuncelle,
  paraBirimiSil,
  paraBirimleriGetir,
  type ParaBirimi,
  type ParaBirimiGirdi,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/paraBirimleri';

const SAYFA_SECENEKLERI = [10, 25, 50] as const;

const DISA_AKTAR_OGELER = [
  { id: 'yazdir', etiket: 'Yazdır', ikon: '🖨' },
  { id: 'csv', etiket: 'Csv', ikon: '📄' },
  { id: 'excel', etiket: 'Excel', ikon: '📊' },
  { id: 'pdf', etiket: 'Pdf', ikon: '📕' },
  { id: 'kopyala', etiket: 'Kopyala', ikon: '📋' },
] as const;

type DisaAktarId = (typeof DISA_AKTAR_OGELER)[number]['id'];

const TABLO_BASLIKLAR = ['Adı', 'Kısa Adı', 'Sembol', 'Kur Tipi', 'Kur', 'Oto Güncelleme', 'Api Url'];

function tabloSatirlari(liste: ParaBirimi[]): string[][] {
  return liste.map((p) => [
    p.adi,
    p.kisaAdi,
    p.sembol,
    kurTipiEtiketi(p.kurTipi),
    String(p.kur),
    p.otoGuncelleme ? 'Açık' : 'Kapalı',
    p.apiUrl,
  ]);
}

function csvMetin(basliklar: string[], satirlar: string[][]): string {
  return (
    '\uFEFF' +
    [basliklar, ...satirlar]
      .map((satir) => satir.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(';'))
      .join('\n')
  );
}

function dosyaIndir(dosyaAdi: string, icerik: string, tip: string) {
  const blob = new Blob([icerik], { type: tip });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dosyaAdi;
  a.click();
  URL.revokeObjectURL(url);
}

function yazdirPenceresi(liste: ParaBirimi[], baslik: string) {
  const satirlar = tabloSatirlari(liste);
  const thead = TABLO_BASLIKLAR.map((h) => `<th>${h}</th>`).join('');
  const tbody = satirlar
    .map((s) => `<tr>${s.map((h) => `<td>${String(h).replace(/</g, '&lt;')}</td>`).join('')}</tr>`)
    .join('');
  const html = `<!doctype html><html><head><title>${baslik}</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:24px;color:#111}
      h1{font-size:18px;margin:0 0 16px}
      table{border-collapse:collapse;width:100%;font-size:12px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}
      th{background:#f5f5f5}
    </style></head><body>
    <h1>${baslik}</h1>
    <table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>
    </body></html>`;
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

export function ParaBirimleriSayfasi() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [liste, setListe] = useState<ParaBirimi[]>(() => paraBirimleriGetir());
  const [arama, setArama] = useState('');
  const [sayfaBoyutu, setSayfaBoyutu] = useState<number>(10);
  const [sayfa, setSayfa] = useState(1);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<ParaBirimi | null>(null);
  const [silinecek, setSilinecek] = useState<ParaBirimi | null>(null);
  const [disaAcik, setDisaAcik] = useState(false);
  const disaRef = useRef<HTMLDivElement>(null);

  const yenile = useCallback(() => {
    setListe(paraBirimleriGetir());
  }, []);

  useEffect(() => {
    const handler = () => yenile();
    window.addEventListener(PARA_BIRIMLERI_GUNCELLENDI, handler);
    return () => window.removeEventListener(PARA_BIRIMLERI_GUNCELLENDI, handler);
  }, [yenile]);

  useEffect(() => {
    if (!disaAcik) return;
    function disari(e: MouseEvent) {
      if (!disaRef.current?.contains(e.target as Node)) setDisaAcik(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') setDisaAcik(false);
    }
    window.addEventListener('mousedown', disari);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('mousedown', disari);
      window.removeEventListener('keydown', esc);
    };
  }, [disaAcik]);

  const filtrelenen = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    if (!q) return liste;
    return liste.filter(
      (p) =>
        p.adi.toLocaleLowerCase('tr').includes(q) ||
        p.kisaAdi.toLocaleLowerCase('tr').includes(q) ||
        p.sembol.toLocaleLowerCase('tr').includes(q) ||
        kurTipiEtiketi(p.kurTipi).toLocaleLowerCase('tr').includes(q)
    );
  }, [liste, arama]);

  const toplamSayfa = Math.max(1, Math.ceil(filtrelenen.length / sayfaBoyutu));
  const guvenliSayfa = Math.min(sayfa, toplamSayfa);
  const baslangic = (guvenliSayfa - 1) * sayfaBoyutu;
  const sayfaKayitlari = filtrelenen.slice(baslangic, baslangic + sayfaBoyutu);
  const bitis = Math.min(baslangic + sayfaKayitlari.length, filtrelenen.length);

  useEffect(() => {
    setSayfa(1);
  }, [arama, sayfaBoyutu]);

  function ekleAc() {
    setDuzenlenen(null);
    setModalAcik(true);
  }

  function duzenleAc(kayit: ParaBirimi) {
    setDuzenlenen(kayit);
    setModalAcik(true);
  }

  function kaydet(girdi: ParaBirimiGirdi): string | null {
    if (duzenlenen) {
      if (!paraBirimiGuncelle(duzenlenen.id, girdi)) {
        return 'Kayıt güncellenemedi. Kısa ad benzersiz olmalı.';
      }
    } else if (!paraBirimiEkle(girdi)) {
      return 'Kayıt eklenemedi. Kısa ad benzersiz olmalı.';
    }
    yenile();
    return null;
  }

  async function disaAktarSec(id: DisaAktarId) {
    setDisaAcik(false);
    const kaynak = filtrelenen.length > 0 ? filtrelenen : liste;
    const satirlar = tabloSatirlari(kaynak);
    const tarih = new Date().toISOString().slice(0, 10);

    if (id === 'yazdir') {
      yazdirPenceresi(kaynak, 'Para Birimleri');
      return;
    }
    if (id === 'pdf') {
      yazdirPenceresi(kaynak, 'Para Birimleri — PDF');
      return;
    }
    if (id === 'csv') {
      csvIndir(`para-birimleri-${tarih}`, TABLO_BASLIKLAR, satirlar);
      return;
    }
    if (id === 'excel') {
      dosyaIndir(
        `para-birimleri-${tarih}.xls`,
        csvMetin(TABLO_BASLIKLAR, satirlar),
        'application/vnd.ms-excel;charset=utf-8;'
      );
      return;
    }
    if (id === 'kopyala') {
      const metin = [TABLO_BASLIKLAR, ...satirlar].map((s) => s.join('\t')).join('\n');
      try {
        await navigator.clipboard.writeText(metin);
        basariBildir(
          `Copied ${kaynak.length} rows to clipboard`,
          'Copy to clipboard'
        );
      } catch {
        hataBildir('Panoya kopyalanamadı');
      }
    }
  }

  return (
    <div className="ot-pb-sayfa">
      <div className="ot-pb-kontroller">
        <label className="ot-pb-sayfa-boyutu">
          <select
            value={sayfaBoyutu}
            onChange={(e) => setSayfaBoyutu(Number(e.target.value))}
            className="ap-input"
          >
            {SAYFA_SECENEKLERI.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="ap-muted text-sm">veri göster</span>
        </label>
        <div className="ot-pb-kontroller-sag">
          <div className="ot-pb-arama">
            <AdminAramaKutusu deger={arama} onChange={setArama} placeholder="Ara" />
          </div>
          <div className="ot-disa" ref={disaRef}>
            <button
              type="button"
              className={`ot-btn-disa${disaAcik ? ' ot-btn-disa-acik' : ''}`}
              aria-expanded={disaAcik}
              aria-haspopup="menu"
              onClick={() => setDisaAcik((v) => !v)}
            >
              <span className="ot-btn-disa-ikon" aria-hidden>
                📑
              </span>
              Dışa Aktar
              <span className="ot-btn-disa-ok" aria-hidden>
                ▾
              </span>
            </button>
            {disaAcik ? (
              <div className="ot-disa-menu" role="menu">
                {DISA_AKTAR_OGELER.map((oge) => (
                  <button
                    key={oge.id}
                    type="button"
                    role="menuitem"
                    className="ot-disa-oge"
                    onClick={() => void disaAktarSec(oge.id)}
                  >
                    <span aria-hidden>{oge.ikon}</span>
                    {oge.etiket}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button type="button" className="ot-btn-ekle" onClick={ekleAc}>
            + Ekle
          </button>
        </div>
      </div>

      <div className="ot-pb-tablo-sarici">
        <table className="ot-pb-tablo">
          <thead>
            <tr>
              <th>Adı</th>
              <th>Kısa Adı</th>
              <th>Sembol</th>
              <th>Kur Tipi</th>
              <th>Kur</th>
              <th>Oto Güncelleme</th>
              <th className="ot-pb-islem-th">#</th>
            </tr>
          </thead>
          <tbody>
            {sayfaKayitlari.length === 0 ? (
              <tr>
                <td colSpan={7} className="ot-pb-bos">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              sayfaKayitlari.map((p) => (
                <tr key={p.id}>
                  <td>{p.adi}</td>
                  <td>{p.kisaAdi}</td>
                  <td>{p.sembol}</td>
                  <td>{kurTipiEtiketi(p.kurTipi)}</td>
                  <td>
                    <span className={`ot-pb-kur-hucre${p.apiUrl.trim() ? ' ot-pb-kur-hucre-pasif' : ''}`}>
                      {p.kur}
                      {p.apiUrl.trim() ? (
                        <span className="ot-pb-kur-goz" title="API ile güncellenir" aria-hidden>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75">
                            <path d="M3 3l18 18" strokeLinecap="round" />
                            <path
                              d="M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 9.8 7-.3.9-1.1 2.2-2.4 3.5M6.1 6.1C4.3 7.5 3.2 9.2 2.2 12c.8 2.5 4.8 7 9.8 7 1.4 0 2.7-.3 3.9-.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td>
                    <span className="ot-pb-oto">
                      <AdminDurumEtiketi tur={p.otoGuncelleme ? 'aktif' : 'pasif'}>
                        {p.otoGuncelleme ? 'Açık' : 'Kapalı'}
                      </AdminDurumEtiketi>
                    </span>
                  </td>
                  <td className="ot-pb-islem">
                    <div className="ot-pb-islem-grup">
                      <button
                        type="button"
                        className="ot-pb-islem-btn"
                        title="Düzenle"
                        aria-label="Düzenle"
                        onClick={() => duzenleAc(p)}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                          <path d="M12 20h9" strokeLinecap="round" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="ot-pb-islem-btn ot-pb-islem-btn-sil"
                        title="Sil"
                        aria-label="Sil"
                        onClick={() => setSilinecek(p)}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                          <path d="M3 6h18" strokeLinecap="round" />
                          <path d="M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinejoin="round" />
                          <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="ot-pb-alt">
        <p className="ap-muted text-sm">
          {filtrelenen.length === 0
            ? 'Kayıt yok.'
            : `${baslangic + 1} ile ${bitis} arasında veri gösteriliyor. Toplam: ${filtrelenen.length}`}
        </p>
        <div className="ot-pb-sayfalama">
          <button
            type="button"
            className="ot-pb-sayfa-tus"
            disabled={guvenliSayfa <= 1}
            onClick={() => setSayfa((s) => Math.max(1, s - 1))}
          >
            Geri
          </button>
          {Array.from({ length: toplamSayfa }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={`ot-pb-sayfa-tus${n === guvenliSayfa ? ' ot-pb-sayfa-aktif' : ''}`}
              onClick={() => setSayfa(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="ot-pb-sayfa-tus"
            disabled={guvenliSayfa >= toplamSayfa}
            onClick={() => setSayfa((s) => Math.min(toplamSayfa, s + 1))}
          >
            İleri
          </button>
        </div>
      </div>

      <ParaBirimiModal
        acik={modalAcik}
        kayit={duzenlenen}
        onKapat={() => setModalAcik(false)}
        onKaydet={kaydet}
      />

      <SilmeOnayModal
        acik={Boolean(silinecek)}
        onKapat={() => setSilinecek(null)}
        onOnayla={() => {
          if (silinecek) {
            paraBirimiSil(silinecek.id);
            yenile();
          }
          setSilinecek(null);
        }}
        hedefMetin={silinecek ? `${silinecek.adi} (${silinecek.kisaAdi})` : ''}
      />
    </div>
  );
}
