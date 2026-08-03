import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AdminCari } from '@/admin/baslat-menusu/erp/cari/tipler';
import { cariTipiEtiketi, isletmeTuruEtiketi } from '@/admin/baslat-menusu/erp/cari/tipler';
import { cariBakiyeAl, cariHareketleriGetir } from '@/admin/baslat-menusu/erp/belgeler/api';
import {
  belgeTurEtiketi,
  type BelgeKayit,
  type CariHareketKayit,
} from '@/admin/baslat-menusu/erp/belgeler/tipler';
import { belgelerGetirMock } from '@/admin/baslat-menusu/erp/belgeler/mockBelgeDepo';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { belgeBaslatYaz } from '@/admin/baslat-menusu/erp/belgeler/belgeBaslat';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import {
  belgeNeviEtiketi,
  yonIcinVarsayilanBelgeNevi,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/belgeNevileri';
import {
  gorunenOzetKartlar,
  ozetGorunumOku,
  ozetGorunumYaz,
  ozetKartEtiketi,
  varsayilanOzetGorunum,
  type CariOzetGorunum,
  type CariOzetKartId,
} from '@/admin/baslat-menusu/erp/cari/cariHareketOzetKartlari';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';
import './cariHareket.css';

interface CariHareketSayfasiProps {
  cari: AdminCari;
  onGeri: () => void;
  onModulAc?: (modulId: string) => void;
  belgelerEklemeyiVar?: boolean;
  /** Cari listesini yeniden yükler (Yenile) */
  onYenile?: () => void | Promise<void>;
}

interface HareketSatir {
  id: string;
  tarih: string;
  izahat: string;
  evrakNo: string;
  borc: number;
  alacak: number;
  bakiye: number;
  belgeId: string | null;
  paraBirimi: string;
}

function tarihGoster(iso: string) {
  if (!iso) return '—';
  const gun = iso.slice(0, 10);
  const [y, m, g] = gun.split('-');
  if (!y || !m || !g) return iso;
  return `${g}.${m}.${y}`;
}

function saatGoster(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function hareketIzahat(h: CariHareketKayit, belge?: BelgeKayit | null) {
  if (belge) {
    const neviId = (belge as BelgeKayit & { belgeNeviId?: string }).belgeNeviId;
    const nevi = neviId
      ? belgeNeviEtiketi(neviId)
      : belge.yon === 'ALIS'
        ? 'Alış'
        : 'Satış';
    return `${nevi} · ${belgeTurEtiketi(belge.tur)}`;
  }
  return h.aciklama || 'Hareket';
}

/** Cari hareketleriyle tutarlı olsun diye yalnızca onaylı belgeler */
function cariBelgeleriAl(cari: AdminCari): BelgeKayit[] {
  return [...belgelerGetirMock('ALIS'), ...belgelerGetirMock('SATIS')]
    .filter((b) => b.durum === 'ONAYLI')
    .filter((b) => b.cariId === cari.id || b.cariKodu === cari.cariKodu)
    .sort((a, b) => b.tarih.localeCompare(a.tarih));
}

export function CariHareketSayfasi({
  cari,
  onGeri,
  onModulAc,
  belgelerEklemeyiVar = true,
  onYenile,
}: CariHareketSayfasiProps) {
  const { basariBildir } = useAdminSayfaBildirimi();
  const [yenileAnahtar, setYenileAnahtar] = useState(0);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [sonYenileme, setSonYenileme] = useState<Date | null>(null);
  const [gorunumAcik, setGorunumAcik] = useState(false);
  const [ozetGorunum, setOzetGorunum] = useState<CariOzetGorunum>(() => ozetGorunumOku());
  const gorunumPanelRef = useRef<HTMLDivElement | null>(null);
  const gorunumBtnRef = useRef<HTMLButtonElement | null>(null);

  const gorunenKartlar = useMemo(() => gorunenOzetKartlar(ozetGorunum), [ozetGorunum]);

  const gorunumGuncelle = useCallback((sonraki: CariOzetGorunum) => {
    const gizli =
      sonraki.gizli.length >= sonraki.sira.length
        ? sonraki.sira.slice(1)
        : sonraki.gizli;
    const temiz = { sira: sonraki.sira, gizli };
    setOzetGorunum(temiz);
    ozetGorunumYaz(temiz);
  }, []);

  const kartGizle = useCallback(
    (id: CariOzetKartId, gizle: boolean) => {
      const gizliSet = new Set(ozetGorunum.gizli);
      if (gizle) {
        const gorunenSayisi = ozetGorunum.sira.filter((x) => !gizliSet.has(x)).length;
        if (gorunenSayisi <= 1) return;
        gizliSet.add(id);
      } else {
        gizliSet.delete(id);
      }
      gorunumGuncelle({ ...ozetGorunum, gizli: [...gizliSet] });
    },
    [ozetGorunum, gorunumGuncelle]
  );

  const kartTasi = useCallback(
    (id: CariOzetKartId, yon: 'yukari' | 'asagi') => {
      const sira = [...ozetGorunum.sira];
      const idx = sira.indexOf(id);
      if (idx < 0) return;
      const hedef = yon === 'yukari' ? idx - 1 : idx + 1;
      if (hedef < 0 || hedef >= sira.length) return;
      [sira[idx], sira[hedef]] = [sira[hedef]!, sira[idx]!];
      gorunumGuncelle({ ...ozetGorunum, sira });
    },
    [ozetGorunum, gorunumGuncelle]
  );

  const gorunumSifirla = useCallback(() => {
    gorunumGuncelle(varsayilanOzetGorunum());
  }, [gorunumGuncelle]);

  useEffect(() => {
    if (!gorunumAcik) return;
    function disariTikla(e: MouseEvent) {
      const t = e.target as Node;
      if (gorunumPanelRef.current?.contains(t)) return;
      if (gorunumBtnRef.current?.contains(t)) return;
      setGorunumAcik(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') setGorunumAcik(false);
    }
    document.addEventListener('mousedown', disariTikla);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', disariTikla);
      document.removeEventListener('keydown', esc);
    };
  }, [gorunumAcik]);

  const bakiye = useMemo(() => {
    void yenileAnahtar;
    return cariBakiyeAl(cari.cariKodu);
  }, [cari.cariKodu, yenileAnahtar]);

  const belgeler = useMemo(() => {
    void yenileAnahtar;
    return cariBelgeleriAl(cari);
  }, [cari, yenileAnahtar]);

  const hareketler = useMemo(() => {
    void yenileAnahtar;
    return cariHareketleriGetir(cari.cariKodu);
  }, [cari.cariKodu, yenileAnahtar]);

  const hareketSatirlari = useMemo((): HareketSatir[] => {
    const belgeMap = new Map(belgeler.map((b) => [b.id, b]));
    const sirali = [...hareketler].sort((a, b) => a.kayitTarihi.localeCompare(b.kayitTarihi));
    let running = 0;
    return sirali.map((h) => {
      running += h.borc - h.alacak;
      const belge = h.belgeId ? belgeMap.get(h.belgeId) ?? null : null;
      return {
        id: h.id,
        tarih: tarihGoster(h.kayitTarihi),
        izahat: hareketIzahat(h, belge),
        evrakNo: belge?.belgeNo ?? '—',
        borc: h.borc,
        alacak: h.alacak,
        bakiye: running,
        belgeId: h.belgeId,
        paraBirimi: 'TL',
      };
    });
  }, [hareketler, belgeler]);

  const toplamBorc = useMemo(
    () => hareketSatirlari.reduce((s, r) => s + r.borc, 0),
    [hareketSatirlari]
  );
  const toplamAlacak = useMemo(
    () => hareketSatirlari.reduce((s, r) => s + r.alacak, 0),
    [hareketSatirlari]
  );

  const yenile = useCallback(async () => {
    if (yenileniyor) return;
    setYenileniyor(true);
    try {
      // Göstergenin fark edilebilmesi için kısa bir bekleme
      await Promise.all([onYenile?.(), new Promise((r) => setTimeout(r, 350))]);
      setYenileAnahtar((n) => n + 1);
      setSonYenileme(new Date());
      basariBildir('Cari hareketleri yenilendi.', 'Yenilendi');
    } finally {
      setYenileniyor(false);
    }
  }, [yenileniyor, onYenile, basariBildir]);

  const belgeAc = (belgeId: string | null | undefined) => {
    if (!belgeId || !onModulAc) return;
    belgeBaslatYaz({ belgeId });
    onModulAc('belgeler');
  };

  const belgeEkle = () => {
    if (!onModulAc) return;
    const nevi = yonIcinVarsayilanBelgeNevi('SATIS');
    belgeBaslatYaz({ cariId: cari.id, yeni: true, belgeNeviId: nevi.id });
    onModulAc('belgeler');
  };

  return (
    <div className="cari-hareket-sayfa">
      <div className="cari-hareket-ust">
        <div className="cari-hareket-ust-sol">
          <button type="button" className="fatura-btn fatura-btn--ghost" onClick={onGeri}>
            ← Liste
          </button>
        </div>
        <div className="cari-hareket-ust-sag">
          {belgelerEklemeyiVar && onModulAc ? (
            <button type="button" className="fatura-btn fatura-btn--birincil" onClick={belgeEkle}>
              + Belge Ekle
            </button>
          ) : null}
          <button type="button" className="fatura-btn fatura-btn--ghost" onClick={() => window.print()}>
            Yazdır
          </button>
          <button
            type="button"
            className="fatura-btn fatura-btn--ghost"
            onClick={() => void yenile()}
            disabled={yenileniyor}
            title={
              sonYenileme
                ? `Son güncelleme ${saatGoster(sonYenileme)}`
                : 'Hareket, belge ve bakiyeleri yeniden oku'
            }
          >
            {yenileniyor ? 'Yenileniyor…' : 'Yenile'}
          </button>
        </div>
      </div>

      <section className="cari-hareket-ozet" aria-label="Cari özet">
        <div className="cari-hareket-ozet-ust">
          <p className="cari-hareket-ozet-baslik">Özet</p>
          <div className="cari-hareket-gorunum-kabuk">
            <button
              ref={gorunumBtnRef}
              type="button"
              className="fatura-btn fatura-btn--ghost cari-hareket-gorunum-btn"
              onClick={() => setGorunumAcik((a) => !a)}
              aria-expanded={gorunumAcik}
              aria-haspopup="dialog"
            >
              Görünümü Düzenle
            </button>
            {gorunumAcik ? (
              <div
                ref={gorunumPanelRef}
                className="cari-hareket-gorunum-panel"
                role="dialog"
                aria-label="Özet kartları"
              >
                <div className="cari-hareket-gorunum-panel-baslik">
                  <div>
                    <h3>Kartlar</h3>
                    <p>Görünür kartlar ve sırası</p>
                  </div>
                  <div className="cari-hareket-gorunum-panel-aksiyon">
                    <button
                      type="button"
                      className="cari-hareket-gorunum-sifirla"
                      onClick={gorunumSifirla}
                    >
                      Varsayılana Dön
                    </button>
                    <button
                      type="button"
                      className="cari-hareket-gorunum-kapat"
                      onClick={() => setGorunumAcik(false)}
                      aria-label="Kapat"
                      title="Kapat"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="cari-hareket-gorunum-panel-liste">
                  {ozetGorunum.sira.map((id, idx, arr) => {
                    const gizli = ozetGorunum.gizli.includes(id);
                    const gorunenSayisi = ozetGorunum.sira.length - ozetGorunum.gizli.length;
                    return (
                      <div key={id} className="cari-hareket-gorunum-satir">
                        <input
                          type="checkbox"
                          checked={!gizli}
                          disabled={!gizli && gorunenSayisi <= 1}
                          onChange={(e) => kartGizle(id, !e.target.checked)}
                          aria-label={`${ozetKartEtiketi(id)} göster`}
                        />
                        <label>{ozetKartEtiketi(id)}</label>
                        <div className="cari-hareket-gorunum-oklar">
                          <button
                            type="button"
                            className="cari-hareket-gorunum-ok"
                            disabled={idx === 0}
                            title="Yukarı taşı"
                            aria-label="Yukarı taşı"
                            onClick={() => kartTasi(id, 'yukari')}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="cari-hareket-gorunum-ok"
                            disabled={idx === arr.length - 1}
                            title="Aşağı taşı"
                            aria-label="Aşağı taşı"
                            onClick={() => kartTasi(id, 'asagi')}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="cari-hareket-ozet-grid">
          {gorunenKartlar.map((id) => {
            if (id === 'firma') {
              return (
                <div key={id} className="cari-hareket-ozet-kart">
                  <p className="cari-hareket-ozet-etiket">Firma</p>
                  <strong>{cari.cariAdi || cari.unvan || '—'}</strong>
                  <span className="cari-hareket-ozet-meta">{cari.yetkili || 'Yetkili yok'}</span>
                </div>
              );
            }
            if (id === 'vergi') {
              return (
                <div key={id} className="cari-hareket-ozet-kart">
                  <p className="cari-hareket-ozet-etiket">Vergi</p>
                  <strong>{cari.vergiNo || '—'}</strong>
                  <span className="cari-hareket-ozet-meta">{cari.vergiDairesi || '—'}</span>
                </div>
              );
            }
            if (id === 'adres') {
              return (
                <div key={id} className="cari-hareket-ozet-kart">
                  <p className="cari-hareket-ozet-etiket">Adres / İletişim</p>
                  <strong>{[cari.ilce, cari.il].filter(Boolean).join(' / ') || '—'}</strong>
                  <span className="cari-hareket-ozet-meta">
                    {cari.telefon || cari.gsm || cari.eposta || '—'}
                  </span>
                </div>
              );
            }
            if (id === 'bakiye') {
              return (
                <div key={id} className="cari-hareket-ozet-kart cari-hareket-ozet-kart--bakiye">
                  <p className="cari-hareket-ozet-etiket">Bakiye</p>
                  <strong className={bakiye.bakiye >= 0 ? 'cari-hareket-borc' : 'cari-hareket-alacak'}>
                    {sayiFormatla(Math.abs(bakiye.bakiye))}
                    <span className="cari-hareket-ba">{bakiye.bakiye >= 0 ? 'B' : 'A'}</span>
                  </strong>
                  <span className="cari-hareket-ozet-meta">
                    Borç {sayiFormatla(bakiye.borc)} · Alacak {sayiFormatla(bakiye.alacak)}
                  </span>
                </div>
              );
            }
            if (id === 'kod') {
              return (
                <div key={id} className="cari-hareket-ozet-kart">
                  <p className="cari-hareket-ozet-etiket">Cari Kodu</p>
                  <strong>{cari.cariKodu || '—'}</strong>
                  <span className="cari-hareket-ozet-meta">{cari.unvan || cari.cariAdi || '—'}</span>
                </div>
              );
            }
            if (id === 'tip') {
              return (
                <div key={id} className="cari-hareket-ozet-kart">
                  <p className="cari-hareket-ozet-etiket">Cari Tipi</p>
                  <strong>{cariTipiEtiketi(cari.cariTipi)}</strong>
                  <span className="cari-hareket-ozet-meta">
                    {isletmeTuruEtiketi(cari.isletmeTuru)}
                  </span>
                </div>
              );
            }
            if (id === 'eposta') {
              return (
                <div key={id} className="cari-hareket-ozet-kart">
                  <p className="cari-hareket-ozet-etiket">E-posta</p>
                  <strong>{cari.eposta || '—'}</strong>
                  <span className="cari-hareket-ozet-meta">{cari.gsm || cari.telefon || '—'}</span>
                </div>
              );
            }
            if (id === 'web') {
              return (
                <div key={id} className="cari-hareket-ozet-kart">
                  <p className="cari-hareket-ozet-etiket">Web</p>
                  <strong>{cari.web || '—'}</strong>
                  <span className="cari-hareket-ozet-meta">İnternet sitesi</span>
                </div>
              );
            }
            if (id === 'efatura') {
              return (
                <div key={id} className="cari-hareket-ozet-kart">
                  <p className="cari-hareket-ozet-etiket">e-Fatura</p>
                  <strong>{cari.efatura ? 'Evet' : 'Hayır'}</strong>
                  <span className="cari-hareket-ozet-meta">
                    e-Arşiv: {cari.earsiv ? 'Evet' : 'Hayır'}
                  </span>
                </div>
              );
            }
            return null;
          })}
        </div>
      </section>

      <div
        className={`cari-hareket-govde${yenileniyor ? ' cari-hareket-govde--yenileniyor' : ''}`}
        aria-busy={yenileniyor}
      >
        {yenileniyor ? (
          <div className="cari-hareket-yenileme-band" role="status">
            <span className="cari-hareket-yenileme-spin" aria-hidden />
            Yenileniyor…
          </div>
        ) : null}
        <div className="cari-hareket-tablo-wrap">
          {hareketSatirlari.length === 0 ? (
            <div className="fatura-ekstre-bos">
              <p className="fatura-ekstre-bos-baslik">Henüz hareket yok</p>
              <p className="fatura-ekstre-bos-metin">
                Belge onaylandığında hareketler burada listelenir.
              </p>
            </div>
          ) : (
            <table className="cari-hareket-tablo">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>İzahat</th>
                  <th>Evrak No</th>
                  <th className="cari-hareket-sayi">Borç</th>
                  <th className="cari-hareket-sayi">Alacak</th>
                  <th className="cari-hareket-sayi">Bakiye</th>
                  <th>PB</th>
                </tr>
              </thead>
              <tbody>
                {hareketSatirlari.map((r) => (
                  <tr
                    key={r.id}
                    className={r.belgeId ? 'cari-hareket-satir--tiklanabilir' : undefined}
                    onDoubleClick={() => belgeAc(r.belgeId)}
                  >
                    <td>{r.tarih}</td>
                    <td>{r.izahat}</td>
                    <td>
                      {r.belgeId ? (
                        <button type="button" className="fatura-link" onClick={() => belgeAc(r.belgeId)}>
                          {r.evrakNo}
                        </button>
                      ) : (
                        r.evrakNo
                      )}
                    </td>
                    <td className="cari-hareket-sayi">{r.borc ? sayiFormatla(r.borc) : ''}</td>
                    <td className="cari-hareket-sayi">{r.alacak ? sayiFormatla(r.alacak) : ''}</td>
                    <td className="cari-hareket-sayi">
                      {sayiFormatla(Math.abs(r.bakiye))}
                      <span className="cari-hareket-ba">{r.bakiye >= 0 ? 'B' : 'A'}</span>
                    </td>
                    <td>{r.paraBirimi}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Toplam</td>
                  <td className="cari-hareket-sayi">{sayiFormatla(toplamBorc)}</td>
                  <td className="cari-hareket-sayi">{sayiFormatla(toplamAlacak)}</td>
                  <td className="cari-hareket-sayi">
                    {sayiFormatla(Math.abs(bakiye.bakiye))}
                    <span className="cari-hareket-ba">{bakiye.bakiye >= 0 ? 'B' : 'A'}</span>
                  </td>
                  <td>TL</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
