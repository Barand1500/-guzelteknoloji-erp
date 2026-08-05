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
import {
  cariOzetAlanDuzeniCariKaydet,
  cariOzetAlanDuzeniCariSil,
  cariOzetAlanDuzeniGlobalKaydet,
  cariOzetAlanDuzeniOku,
  cariOzetAlanTanimBul,
  type CariOzetAlanDuzeni,
  type CariOzetAlanId,
} from './cariOzetAlanDuzeni';
import { CariOzetAlanYonetModal } from './CariOzetAlanYonetModal';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';
import './cariHareket.css';

const OTO_YENILE_MS = 10_000;

interface CariHareketSayfasiProps {
  cari: AdminCari;
  onGeri: () => void;
  onModulAc?: (modulId: string) => void;
  /** Cari listesini yeniden yükler (Yenile) */
  onYenile?: () => void | Promise<void>;
  bilgiYonetAcik?: boolean;
  onBilgiYonetAcikDegistir?: (acik: boolean) => void;
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

interface OzetKart {
  id: CariOzetAlanId;
  etiket: string;
  deger: string;
  mono?: boolean;
}

interface OzetSatir {
  kartlar: OzetKart[];
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

function ozetDegerHaritasi(cari: AdminCari): Partial<Record<CariOzetAlanId, string>> {
  const harita: Partial<Record<CariOzetAlanId, string>> = {};

  if (cari.cariTipi) harita.cariTipi = cariTipiEtiketi(cari.cariTipi);
  if (cari.isletmeTuru) harita.isletmeTuru = isletmeTuruEtiketi(cari.isletmeTuru);
  if (cari.unvan.trim()) harita.unvan = cari.unvan;
  if (cari.vergiNo) harita.vergiNo = cari.vergiNo;
  if (cari.vergiDairesi) harita.vergiDairesi = cari.vergiDairesi;
  if (cari.adres) harita.adres = cari.adres;
  if (cari.il) harita.il = cari.il;
  if (cari.ilce) harita.ilce = cari.ilce;
  if (cari.telefon) {
    harita.telefon = cari.telefonDahili?.trim()
      ? `${cari.telefon} (Dahili ${cari.telefonDahili.trim()})`
      : cari.telefon;
  }
  if (cari.gsm) harita.gsm = cari.gsm;
  if (cari.eposta) harita.eposta = cari.eposta;
  if (cari.web) harita.web = cari.web;

  harita.efatura = cari.efatura ? 'Evet' : 'Hayır';
  if (cari.efaturaTipi) harita.efaturaTipi = cari.efaturaTipi;
  if (cari.alias) harita.alias = cari.alias;
  if (cari.earsivTeslimSekli) {
    harita.earsivTeslim = cari.earsivTeslimSekli === 'KAGIT' ? 'Kağıt' : 'Elektronik';
  }
  harita.eirsaliye = cari.earsiv ? 'Evet' : 'Hayır';
  if (cari.earsivAlias) harita.earsivAlias = cari.earsivAlias;

  return harita;
}

function ozetSatirlariUret(cari: AdminCari, duzen: CariOzetAlanDuzeni): OzetSatir[] {
  const degerler = ozetDegerHaritasi(cari);
  const sonuc: OzetSatir[] = [];

  for (const satir of duzen.satirlar) {
    if (satir.length === 0) continue;
    const kartlar: OzetKart[] = [];
    for (const id of satir) {
      const tanim = cariOzetAlanTanimBul(id);
      let etiket = tanim.etiket;
      if (id === 'vergiNo') {
        etiket =
          cari.isletmeTuru === 'GERCEK'
            ? 'T.C. Kimlik No'
            : cari.isletmeTuru === 'YABANCI'
              ? 'Pasaport No'
              : 'Vergi No';
      }
      const ham = degerler[id];
      kartlar.push({
        id,
        etiket,
        deger: ham != null && ham !== '' ? ham : '—',
        mono: tanim.mono,
      });
    }
    sonuc.push({ kartlar });
  }

  return sonuc;
}

export function CariHareketSayfasi({
  cari,
  onGeri,
  onModulAc,
  onYenile,
  bilgiYonetAcik = false,
  onBilgiYonetAcikDegistir,
}: CariHareketSayfasiProps) {
  const { basariBildir } = useAdminSayfaBildirimi();
  const [yenileAnahtar, setYenileAnahtar] = useState(0);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [ozetAcik, setOzetAcik] = useState(true);
  const [ozetDuzeni, setOzetDuzeni] = useState<CariOzetAlanDuzeni>(() =>
    cariOzetAlanDuzeniOku(cari.id)
  );
  const kokRef = useRef<HTMLDivElement | null>(null);
  const yenileniyorRef = useRef(false);
  const yenileRef = useRef<(secenek?: { sessiz?: boolean }) => Promise<void>>(async () => {});

  useEffect(() => {
    setOzetDuzeni(cariOzetAlanDuzeniOku(cari.id));
  }, [cari.id]);

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

  const ozetSatirlari = useMemo(() => ozetSatirlariUret(cari, ozetDuzeni), [cari, ozetDuzeni]);

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

  const bilgiYonetKapat = () => onBilgiYonetAcikDegistir?.(false);

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
        className={`cari-hareket-ozet${ozetAcik ? ' cari-hareket-ozet--acik' : ''} cari-hareket-ozet--kutu-${ozetDuzeni.kutuBoyutu ?? 'normal'}`}
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
            <span
              className={`cari-hareket-ozet-ok${ozetAcik ? ' cari-hareket-ozet-ok--acik' : ''}`}
              aria-hidden
            >
              ▾
            </span>
          </div>
        </button>
        <div id="cari-hareket-ozet-govde" className="cari-hareket-ozet-govde" hidden={!ozetAcik}>
          {ozetSatirlari.length === 0 ? (
            <p className="cari-hareket-ozet-bos">
              Gösterilecek alan yok — aksiyon çubuğundan Bilgi Düzenle ile satır ekleyin.
            </p>
          ) : (
            <div className="cari-hareket-ozet-satirlar">
              {ozetSatirlari.map((satir, sira) => (
                <div
                  key={`ozet-satir-${sira}`}
                  className="cari-hareket-ozet-satir"
                  style={{
                    gridTemplateColumns: `repeat(${satir.kartlar.length}, minmax(0, 1fr))`,
                  }}
                >
                  {satir.kartlar.map((a) => (
                    <div
                      key={a.id}
                      className={[
                        'cari-hareket-ozet-kart',
                        a.mono ? 'cari-hareket-ozet-kart--mono' : '',
                        satir.kartlar.length === 1 ? 'cari-hareket-ozet-kart--tek' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className="cari-hareket-ozet-kart-etiket">{a.etiket}</span>
                      <strong className="cari-hareket-ozet-kart-deger" title={a.deger}>
                        {a.deger}
                      </strong>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
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
                        <button
                          type="button"
                          className="fatura-link"
                          onClick={() => belgeAc(r.belgeId)}
                        >
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

      <CariOzetAlanYonetModal
        acik={bilgiYonetAcik}
        cariId={cari.id}
        baslangic={ozetDuzeni}
        onKapat={bilgiYonetKapat}
        onKaydetCari={(duzen) => {
          const temiz = cariOzetAlanDuzeniCariKaydet(cari.id, duzen);
          setOzetDuzeni(temiz);
          basariBildir('Özet düzeni bu cari için kaydedildi.');
        }}
        onKaydetTumu={(duzen) => {
          cariOzetAlanDuzeniCariSil(cari.id);
          const temiz = cariOzetAlanDuzeniGlobalKaydet(duzen);
          setOzetDuzeni(temiz);
          basariBildir('Özet düzeni tüm cariler için kaydedildi.');
        }}
      />
    </div>
  );
}
