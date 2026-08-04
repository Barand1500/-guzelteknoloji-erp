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
import { belgeNeviEtiketi } from '@/admin/baslat-menusu/ozel-tanimlar/veri/belgeNevileri';
import { AP_SEKME_DEGISTI } from '@/araclar/sekmePortal';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';
import './cariHareket.css';

const OTO_YENILE_MS = 10_000;

interface CariHareketSayfasiProps {
  cari: AdminCari;
  onGeri: () => void;
  onModulAc?: (modulId: string) => void;
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

function ozetAlanlari(cari: AdminCari): { etiket: string; deger: string }[] {
  const alanlar: { etiket: string; deger: string }[] = [];

  if (cari.cariTipi) {
    alanlar.push({ etiket: 'Cari Tipi', deger: cariTipiEtiketi(cari.cariTipi) });
  }
  if (cari.isletmeTuru) {
    alanlar.push({ etiket: 'İşletme Türü', deger: isletmeTuruEtiketi(cari.isletmeTuru) });
  }
  if (cari.unvan.trim()) {
    alanlar.push({ etiket: 'Ünvanı', deger: cari.unvan });
  }
  if (cari.vergiNo) {
    alanlar.push({
      etiket:
        cari.isletmeTuru === 'GERCEK'
          ? 'T.C. Kimlik No'
          : cari.isletmeTuru === 'YABANCI'
            ? 'Pasaport No'
            : 'Vergi No',
      deger: cari.vergiNo,
    });
  }
  if (cari.vergiDairesi) {
    alanlar.push({ etiket: 'Vergi Dairesi', deger: cari.vergiDairesi });
  }
  if (cari.adres) {
    alanlar.push({ etiket: 'Adres', deger: cari.adres });
  }
  if (cari.il) {
    alanlar.push({ etiket: 'İl', deger: cari.il });
  }
  if (cari.ilce) {
    alanlar.push({ etiket: 'İlçe', deger: cari.ilce });
  }
  if (cari.telefon) {
    const tel =
      cari.telefonDahili?.trim()
        ? `${cari.telefon} (Dahili ${cari.telefonDahili.trim()})`
        : cari.telefon;
    alanlar.push({ etiket: 'Telefon', deger: tel });
  }
  if (cari.gsm) {
    alanlar.push({ etiket: 'GSM', deger: cari.gsm });
  }
  if (cari.eposta) {
    alanlar.push({ etiket: 'E-posta', deger: cari.eposta });
  }
  if (cari.web) {
    alanlar.push({ etiket: 'Web', deger: cari.web });
  }
  alanlar.push({ etiket: 'E-Fatura', deger: cari.efatura ? 'Evet' : 'Hayır' });
  if (cari.efatura) {
    if (cari.efaturaTipi) {
      alanlar.push({ etiket: 'Fatura Tipi', deger: cari.efaturaTipi });
    }
    if (cari.alias) {
      alanlar.push({ etiket: 'E-Fatura Alias', deger: cari.alias });
    }
  } else if (cari.earsivTeslimSekli) {
    alanlar.push({
      etiket: 'E-Arşiv Teslim',
      deger: cari.earsivTeslimSekli === 'KAGIT' ? 'Kağıt' : 'Elektronik',
    });
  }
  alanlar.push({ etiket: 'E-İrsaliye', deger: cari.earsiv ? 'Evet' : 'Hayır' });
  if (cari.earsiv && cari.earsivAlias) {
    alanlar.push({ etiket: 'E-İrsaliye Alias', deger: cari.earsivAlias });
  }

  return alanlar;
}

export function CariHareketSayfasi({
  cari,
  onGeri,
  onModulAc,
  onYenile,
}: CariHareketSayfasiProps) {
  const { basariBildir } = useAdminSayfaBildirimi();
  const [yenileAnahtar, setYenileAnahtar] = useState(0);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [ozetAcik, setOzetAcik] = useState(false);
  const kokRef = useRef<HTMLDivElement | null>(null);
  const yenileniyorRef = useRef(false);
  const yenileRef = useRef<(secenek?: { sessiz?: boolean }) => Promise<void>>(async () => {});

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

  const alanlar = useMemo(() => ozetAlanlari(cari), [cari]);

  const yenile = useCallback(async (secenek?: { sessiz?: boolean }) => {
    if (yenileniyorRef.current) return;
    const sessiz = secenek?.sessiz === true;
    yenileniyorRef.current = true;
    if (!sessiz) setYenileniyor(true);
    try {
      await Promise.all([
        onYenile?.(),
        sessiz ? Promise.resolve() : new Promise((r) => setTimeout(r, 350)),
      ]);
      setYenileAnahtar((n) => n + 1);
      if (!sessiz) basariBildir('Cari hareketleri yenilendi.', 'Yenilendi');
    } finally {
      yenileniyorRef.current = false;
      if (!sessiz) setYenileniyor(false);
    }
  }, [onYenile, basariBildir]);

  yenileRef.current = yenile;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    let iptal = false;
    let oncekiGorunur = false;

    const sayfaGorunurMu = () => {
      if (document.visibilityState !== 'visible') return false;
      const el = kokRef.current;
      if (!el) return false;
      if (el.closest('.ap-sekme-canli-gizli, [aria-hidden="true"]')) return false;
      return el.getClientRects().length > 0;
    };

    const timerDurdur = () => {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const sessizYenile = () => {
      if (iptal || !sayfaGorunurMu()) return;
      void yenileRef.current({ sessiz: true });
    };

    const timerBaslat = () => {
      timerDurdur();
      if (!sayfaGorunurMu()) return;
      timer = setInterval(sessizYenile, OTO_YENILE_MS);
    };

    const gorunurlukAyarla = (gorunur: boolean) => {
      if (gorunur) {
        if (!oncekiGorunur) sessizYenile();
        timerBaslat();
      } else {
        timerDurdur();
      }
      oncekiGorunur = gorunur;
    };

    gorunurlukAyarla(sayfaGorunurMu());

    const onVisibility = () => gorunurlukAyarla(sayfaGorunurMu());
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener(AP_SEKME_DEGISTI, onVisibility);

    const io = new IntersectionObserver(
      (entries) => {
        const kesiliyor = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0);
        gorunurlukAyarla(kesiliyor && document.visibilityState === 'visible' && sayfaGorunurMu());
      },
      { threshold: 0.01 }
    );
    const el = kokRef.current;
    if (el) io.observe(el);

    return () => {
      iptal = true;
      timerDurdur();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener(AP_SEKME_DEGISTI, onVisibility);
      io.disconnect();
    };
  }, [cari.id]);

  const belgeAc = (belgeId: string | null | undefined) => {
    if (!belgeId || !onModulAc) return;
    belgeBaslatYaz({ belgeId });
    onModulAc('belgeler');
  };

  return (
    <div ref={kokRef} className="cari-hareket-sayfa">
      <div className="cari-hareket-ust">
        <div className="cari-hareket-ust-sol">
          <button type="button" className="fatura-btn fatura-btn--ghost" onClick={onGeri}>
            ← Liste
          </button>
        </div>
      </div>

      <section
        className={`cari-hareket-ozet${ozetAcik ? ' cari-hareket-ozet--acik' : ''}`}
        aria-label="Cari özet"
      >
        <button
          type="button"
          className="cari-hareket-ozet-tetik"
          onClick={() => setOzetAcik((a) => !a)}
          aria-expanded={ozetAcik}
          aria-controls="cari-hareket-ozet-govde"
        >
          <div className="cari-hareket-ozet-kimlik">
            {cari.cariKodu ? <span className="cari-hareket-kod">{cari.cariKodu}</span> : null}
            <span className="cari-hareket-ad">{cari.cariAdi || cari.unvan || '—'}</span>
          </div>
          <div className="cari-hareket-ozet-tetik-sag">
            <div className="cari-hareket-ozet-bakiye" title="Net bakiye">
              <span className="cari-hareket-ozet-bakiye-etiket">Bakiye</span>
              <strong className={bakiye.bakiye >= 0 ? 'cari-hareket-borc' : 'cari-hareket-alacak'}>
                {sayiFormatla(Math.abs(bakiye.bakiye))}
                <span className="cari-hareket-ba">{bakiye.bakiye >= 0 ? 'B' : 'A'}</span>
              </strong>
            </div>
            <span className="cari-hareket-ozet-ok" aria-hidden>
              {ozetAcik ? '▾' : '▸'}
            </span>
          </div>
        </button>
        <div
          id="cari-hareket-ozet-govde"
          className="cari-hareket-ozet-govde"
          hidden={!ozetAcik}
        >
          <dl className="cari-hareket-ozet-dl">
            {alanlar.map((a) => (
              <div key={a.etiket} className="cari-hareket-ozet-dl-oge">
                <dt>{a.etiket}</dt>
                <dd title={a.deger}>{a.deger}</dd>
              </div>
            ))}
          </dl>
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
