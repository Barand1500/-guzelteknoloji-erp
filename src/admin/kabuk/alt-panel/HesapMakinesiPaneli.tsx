import { useCallback, useEffect, useRef, useState } from 'react';
import { useAksiyonCubuguPanelSync } from '@/admin/kabuk/aksiyon-cubugu/AksiyonCubuguPanelContext';
import {
  birimTutarHesapla,
  ifadeSonucu,
  iskontoUygula,
  karMarjiSatisFiyati,
  kdvDahildenHariç,
  kdvMatrahtanDahil,
  sayiCoz,
  sayiGoster,
} from './hesapMakinesiYardimci';
import { KlasikHesapMakinesi } from './KlasikHesapMakinesi';
import { tooltipMetni } from '@/araclar/tooltipMetni';

type HesapModu = 'hizli' | 'normal';

const HESAP_MODU_ANAHTAR = 'gt_hesap_modu';

function modOku(): HesapModu {
  try {
    const kayit = localStorage.getItem(HESAP_MODU_ANAHTAR);
    if (kayit === 'hizli') return 'hizli';
    if (kayit === 'normal') return 'normal';
    return 'normal';
  } catch {
    return 'normal';
  }
}

interface HesapMakinesiPaneliProps {
  acik: boolean;
  onKapat: () => void;
}

interface GecmisKayit {
  id: string;
  baslik: string;
  detay: string;
  kopya: string;
}

interface SonucGosterimi {
  etiket: string;
  deger: string;
  kopya: string;
}

function KopyalaBtn({ deger, etiket }: { deger: string; etiket: string }) {
  const [basarili, setBasarili] = useState(false);

  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(deger);
      setBasarili(true);
      setTimeout(() => setBasarili(false), 1400);
    } catch {
      /* pano reddedildi */
    }
  };

  return (
    <button
      type="button"
      className={`ap-hesap-kopyala${basarili ? ' ap-hesap-kopyala--ok' : ''}`}
      onClick={() => void kopyala()}
      title={tooltipMetni(`${etiket} kopyala`)}
      aria-label={`${etiket} kopyala`}
    >
      {basarili ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <rect x="9" y="9" width="11" height="11" rx="1.5" />
          <path strokeLinecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

function SonucSatiri({ etiket, deger, kopya }: SonucGosterimi) {
  return (
    <div className="ap-hesap-sonuc-satir">
      <span className="ap-hesap-sonuc-etiket">{etiket}</span>
      <span className="ap-hesap-sonuc-deger">{deger}</span>
      <KopyalaBtn deger={kopya} etiket={etiket} />
    </div>
  );
}

function SonucGrubu({ sonuclar }: { sonuclar: SonucGosterimi[] }) {
  if (!sonuclar.length) return null;
  return (
    <div className="ap-hesap-sonuc-grup">
      {sonuclar.map((s) => (
        <SonucSatiri key={s.etiket} {...s} />
      ))}
    </div>
  );
}

export function HesapMakinesiPaneli({ acik, onKapat }: HesapMakinesiPaneliProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useAksiyonCubuguPanelSync(acik, panelRef);

  const [mod, setMod] = useState<HesapModu>(modOku);
  const [hizliAramaAcik, setHizliAramaAcik] = useState(false);
  const [hizliArama, setHizliArama] = useState('');

  const modDegistir = (yeni: HesapModu) => {
    setMod(yeni);
    try {
      localStorage.setItem(HESAP_MODU_ANAHTAR, yeni);
    } catch {
      /* depolama kapalı */
    }
  };

  const [ifade, setIfade] = useState('');
  const [ifadeSonuc, setIfadeSonuc] = useState<SonucGosterimi[]>([]);

  const [kdvTutar, setKdvTutar] = useState('');
  const [kdvOran, setKdvOran] = useState('20');
  const [kdvSonuc, setKdvSonuc] = useState<SonucGosterimi[]>([]);

  const [iskontoTutar, setIskontoTutar] = useState('');
  const [iskontoOran, setIskontoOran] = useState('10');
  const [iskontoSonuc, setIskontoSonuc] = useState<SonucGosterimi[]>([]);

  const [maliyet, setMaliyet] = useState('');
  const [karYuzde, setKarYuzde] = useState('25');
  const [karSonuc, setKarSonuc] = useState<SonucGosterimi[]>([]);

  const [birimFiyat, setBirimFiyat] = useState('');
  const [miktar, setMiktar] = useState('1');
  const [satirIskonto, setSatirIskonto] = useState('');
  const [birimSonuc, setBirimSonuc] = useState<SonucGosterimi[]>([]);
  const [eskiDeger, setEskiDeger] = useState('');
  const [yeniDeger, setYeniDeger] = useState('');
  const [degisimSonuc, setDegisimSonuc] = useState<SonucGosterimi[]>([]);
  const [toplamTutar, setToplamTutar] = useState('');
  const [toplamAdet, setToplamAdet] = useState('');
  const [toplamdanBirimSonuc, setToplamdanBirimSonuc] = useState<SonucGosterimi[]>([]);

  const [gecmis, setGecmis] = useState<GecmisKayit[]>([]);

  const gecmiseEkle = useCallback((baslik: string, detay: string, kopya: string) => {
    setGecmis((onceki) => [{ id: `${Date.now()}-${Math.random()}`, baslik, detay, kopya }, ...onceki].slice(0, 20));
  }, []);

  useEffect(() => {
    if (!acik) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onKapat();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [acik, onKapat]);

  const ifadeHesapla = () => {
    const sonuc = ifadeSonucu(ifade);
    if (sonuc === null) return;
    const goster = sayiGoster(sonuc);
    const kopya = String(sonuc);
    setIfadeSonuc([{ etiket: 'Sonuç', deger: goster, kopya }]);
    gecmiseEkle('İfade', `${ifade} → ${sayiGoster(sonuc)}`, kopya);
  };

  const kdvDahilYap = () => {
    const tutar = sayiCoz(kdvTutar);
    const oran = sayiCoz(kdvOran, 20) ?? 20;
    if (tutar === null) return;
    const h = kdvMatrahtanDahil(tutar, oran);
    setKdvSonuc([
      { etiket: 'Matrah', deger: sayiGoster(h.matrah), kopya: String(h.matrah) },
      { etiket: 'KDV', deger: sayiGoster(h.kdv), kopya: String(h.kdv) },
      { etiket: 'Toplam', deger: sayiGoster(h.toplam), kopya: String(h.toplam) },
    ]);
    gecmiseEkle('KDV Ekle', `Matrah ${sayiGoster(h.matrah)} + %${oran}`, String(h.toplam));
  };

  const kdvHaricYap = () => {
    const tutar = sayiCoz(kdvTutar);
    const oran = sayiCoz(kdvOran, 20) ?? 20;
    if (tutar === null) return;
    const h = kdvDahildenHariç(tutar, oran);
    setKdvSonuc([
      { etiket: 'Matrah', deger: sayiGoster(h.matrah), kopya: String(h.matrah) },
      { etiket: 'KDV', deger: sayiGoster(h.kdv), kopya: String(h.kdv) },
      { etiket: 'Toplam', deger: sayiGoster(h.toplam), kopya: String(h.toplam) },
    ]);
    gecmiseEkle('KDV Çıkar', `Dahil ${sayiGoster(tutar)} → matrah`, String(h.matrah));
  };

  const iskontoHesapla = () => {
    const tutar = sayiCoz(iskontoTutar);
    if (tutar === null) return;
    const h = iskontoUygula(tutar, iskontoOran);
    setIskontoSonuc([
      { etiket: 'İskonto', deger: `%${sayiGoster(h.yuzde, 1)}`, kopya: String(h.yuzde) },
      { etiket: 'İndirim', deger: sayiGoster(h.indirim), kopya: String(h.indirim) },
      { etiket: 'Net', deger: sayiGoster(h.net), kopya: String(h.net) },
    ]);
    gecmiseEkle('İskonto', `%${sayiGoster(h.yuzde, 1)} → ${sayiGoster(h.net)}`, String(h.net));
  };

  const karHesapla = () => {
    const m = sayiCoz(maliyet);
    const k = sayiCoz(karYuzde, 0) ?? 0;
    if (m === null) return;
    const satis = karMarjiSatisFiyati(m, k);
    const kar = satis - m;
    setKarSonuc([
      { etiket: 'Kar', deger: sayiGoster(kar), kopya: String(kar) },
      { etiket: 'Satış', deger: sayiGoster(satis), kopya: String(satis) },
    ]);
    gecmiseEkle('Kar Marjı', `%${sayiGoster(k, 1)} → ${sayiGoster(satis)}`, String(satis));
  };

  const birimHesapla = () => {
    const fiyat = sayiCoz(birimFiyat);
    const adet = sayiCoz(miktar, 1) ?? 1;
    if (fiyat === null) return;
    const h = birimTutarHesapla(fiyat, adet, satirIskonto);
    const satirlar: SonucGosterimi[] = [
      { etiket: 'Brüt', deger: sayiGoster(h.brut), kopya: String(h.brut) },
    ];
    if (h.indirim > 0) {
      satirlar.push({ etiket: 'İndirim', deger: sayiGoster(h.indirim), kopya: String(h.indirim) });
    }
    satirlar.push({ etiket: 'Net', deger: sayiGoster(h.net), kopya: String(h.net) });
    setBirimSonuc(satirlar);
    gecmiseEkle('Birim × Miktar', `${sayiGoster(fiyat)} × ${sayiGoster(adet, 0)}`, String(h.net));
  };

  const degisimHesapla = () => {
    const eski = sayiCoz(eskiDeger);
    const yeni = sayiCoz(yeniDeger);
    if (eski === null || yeni === null || eski === 0) return;
    const fark = yeni - eski;
    const yuzde = (fark / eski) * 100;
    setDegisimSonuc([
      { etiket: 'Fark', deger: sayiGoster(fark), kopya: String(fark) },
      { etiket: 'Değişim', deger: `%${sayiGoster(yuzde, 2)}`, kopya: String(yuzde) },
      { etiket: 'Yeni Değer', deger: sayiGoster(yeni), kopya: String(yeni) },
    ]);
    gecmiseEkle('Yüzde Değişim', `${sayiGoster(eski)} → ${sayiGoster(yeni)}`, String(yuzde));
  };

  const toplamdanBirimHesapla = () => {
    const toplam = sayiCoz(toplamTutar);
    const adet = sayiCoz(toplamAdet);
    if (toplam === null || adet === null || adet === 0) return;
    const birim = toplam / adet;
    setToplamdanBirimSonuc([
      { etiket: 'Toplam', deger: sayiGoster(toplam), kopya: String(toplam) },
      { etiket: 'Adet', deger: sayiGoster(adet, 2), kopya: String(adet) },
      { etiket: 'Birim Fiyat', deger: sayiGoster(birim), kopya: String(birim) },
    ]);
    gecmiseEkle('Toplamdan Birim', `${sayiGoster(toplam)} / ${sayiGoster(adet, 2)}`, String(birim));
  };

  const gecmisiTemizle = () => {
    setGecmis([]);
    setIfadeSonuc([]);
    setKdvSonuc([]);
    setIskontoSonuc([]);
    setKarSonuc([]);
    setBirimSonuc([]);
    setDegisimSonuc([]);
    setToplamdanBirimSonuc([]);
  };

  const gecmisVar =
    gecmis.length > 0 ||
    ifadeSonuc.length > 0 ||
    kdvSonuc.length > 0 ||
    iskontoSonuc.length > 0 ||
    karSonuc.length > 0 ||
    birimSonuc.length > 0 ||
    degisimSonuc.length > 0 ||
    toplamdanBirimSonuc.length > 0;

  const arama = hizliArama.trim().toLocaleLowerCase('tr-TR');
  const bolumGoster = (...anahtarlar: string[]) =>
    !arama || anahtarlar.some((k) => k.toLocaleLowerCase('tr-TR').includes(arama));

  if (!acik) return null;

  return (
    <div
      ref={panelRef}
      className={`ap-hesap-makinesi-panel ap-hesap-makinesi-panel--kenarlik-anim${mod === 'normal' ? ' ap-hesap-makinesi-panel--normal' : ''}`}
      role="dialog"
      aria-label="Hesap Makinesi"
    >
      <header className="ap-hesap-makinesi-baslik">
        <h3>Hesap Makinesi</h3>
        <div className="ap-hesap-mod-sec" role="group" aria-label="Hesap Makinesi Modu">
          <button
            type="button"
            className={`ap-hesap-mod-sec-btn${mod === 'hizli' ? ' ap-hesap-mod-sec-btn--aktif' : ''}`}
            onClick={() => modDegistir('hizli')}
          >
            Hızlı İşlemler
          </button>
          <button
            type="button"
            className={`ap-hesap-mod-sec-btn${mod === 'normal' ? ' ap-hesap-mod-sec-btn--aktif' : ''}`}
            onClick={() => modDegistir('normal')}
          >
            Normal
          </button>
        </div>
        {mod === 'hizli' && (
          <button
            type="button"
            className={`ap-hesap-arama-btn${hizliAramaAcik ? ' ap-hesap-arama-btn--aktif' : ''}`}
            onClick={() => {
              setHizliAramaAcik((v) => !v);
              if (hizliAramaAcik) setHizliArama('');
            }}
            aria-label="Hızlı işlemlerde ara"
            title={tooltipMetni('Hızlı işlemlerde ara')}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
          </button>
        )}
        <button type="button" className="ap-hesap-makinesi-kapat" onClick={onKapat} aria-label="Kapat">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      {mod === 'normal' ? (
        <div className="ap-hesap-makinesi-icerik ap-hesap-makinesi-icerik--normal">
          <KlasikHesapMakinesi aktif={acik} />
        </div>
      ) : (
      <div className="ap-hesap-makinesi-icerik ap-scroll">
        {hizliAramaAcik && (
          <div className="ap-hesap-hizli-arama">
            <input
              type="search"
              className="ap-hesap-girdi"
              value={hizliArama}
              onChange={(e) => setHizliArama(e.target.value)}
              placeholder="Hızlı işlem ara (KDV, iskonto, birim...)"
            />
          </div>
        )}
        {!bolumGoster(
          'genel ifade',
          'kdv',
          'iskonto',
          'kar marjı',
          'birim miktar',
          'yüzde değişim',
          'toplamdan birim'
        ) && (
          <div className="ap-hesap-bolum">
            <p className="ap-hesap-bolum-ipucu">Aramaya uygun hızlı işlem bulunamadı.</p>
          </div>
        )}
        {bolumGoster('genel ifade', 'ifade', 'hesap') && (
        <section className="ap-hesap-bolum">
          <h4>Genel Ifade</h4>
          <p className="ap-hesap-bolum-ipucu">1000+%10, 500*2, (100+50)*2</p>
          <div className="ap-hesap-girdi-satir">
            <input
              type="text"
              className="ap-hesap-girdi"
              value={ifade}
              onChange={(e) => setIfade(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ifadeHesapla()}
              placeholder="Örn: 1000+%10"
            />
            <button type="button" className="ap-hesap-hesapla-btn" onClick={ifadeHesapla}>
              =
            </button>
          </div>
          <SonucGrubu sonuclar={ifadeSonuc} />
        </section>
        )}

        {bolumGoster('kdv', 'vergi', 'dahil', 'hariç') && (
        <section className="ap-hesap-bolum">
          <h4>KDV</h4>
          <div className="ap-hesap-cift">
            <label className="ap-hesap-alan">
              <span>Tutar</span>
              <input type="text" className="ap-hesap-girdi" value={kdvTutar} onChange={(e) => setKdvTutar(e.target.value)} placeholder="1.000" />
            </label>
            <label className="ap-hesap-alan ap-hesap-alan--dar">
              <span>KDV %</span>
              <input type="text" className="ap-hesap-girdi" value={kdvOran} onChange={(e) => setKdvOran(e.target.value)} placeholder="20" />
            </label>
          </div>
          <div className="ap-hesap-aksiyonlar">
            <button type="button" className="ap-hesap-ikincil-btn" onClick={kdvDahilYap}>
              KDV Ekle
            </button>
            <button type="button" className="ap-hesap-ikincil-btn" onClick={kdvHaricYap}>
              KDV Çıkar
            </button>
          </div>
          <SonucGrubu sonuclar={kdvSonuc} />
        </section>
        )}

        {bolumGoster('iskonto', 'indirim', 'net') && (
        <section className="ap-hesap-bolum">
          <h4>İskonto</h4>
          <div className="ap-hesap-cift">
            <label className="ap-hesap-alan">
              <span>Tutar</span>
              <input type="text" className="ap-hesap-girdi" value={iskontoTutar} onChange={(e) => setIskontoTutar(e.target.value)} placeholder="1.000" />
            </label>
            <label className="ap-hesap-alan">
              <span>İskonto</span>
              <input type="text" className="ap-hesap-girdi" value={iskontoOran} onChange={(e) => setIskontoOran(e.target.value)} placeholder="20+10" />
            </label>
          </div>
          <button type="button" className="ap-hesap-ikincil-btn ap-hesap-ikincil-btn--tam" onClick={iskontoHesapla}>
            İskonto Hesapla
          </button>
          <SonucGrubu sonuclar={iskontoSonuc} />
        </section>
        )}

        {bolumGoster('kar marjı', 'maliyet', 'satış') && (
        <section className="ap-hesap-bolum">
          <h4>Kar Marjı</h4>
          <div className="ap-hesap-cift">
            <label className="ap-hesap-alan">
              <span>Maliyet</span>
              <input type="text" className="ap-hesap-girdi" value={maliyet} onChange={(e) => setMaliyet(e.target.value)} placeholder="800" />
            </label>
            <label className="ap-hesap-alan ap-hesap-alan--dar">
              <span>Kar %</span>
              <input type="text" className="ap-hesap-girdi" value={karYuzde} onChange={(e) => setKarYuzde(e.target.value)} placeholder="25" />
            </label>
          </div>
          <button type="button" className="ap-hesap-ikincil-btn ap-hesap-ikincil-btn--tam" onClick={karHesapla}>
            Satış Fiyatı
          </button>
          <SonucGrubu sonuclar={karSonuc} />
        </section>
        )}

        {bolumGoster('birim', 'miktar', 'tutar') && (
        <section className="ap-hesap-bolum">
          <h4>Birim × Miktar</h4>
          <div className="ap-hesap-uc">
            <label className="ap-hesap-alan">
              <span>Fiyat</span>
              <input type="text" className="ap-hesap-girdi" value={birimFiyat} onChange={(e) => setBirimFiyat(e.target.value)} placeholder="250" />
            </label>
            <label className="ap-hesap-alan ap-hesap-alan--dar">
              <span>Adet</span>
              <input type="text" className="ap-hesap-girdi" value={miktar} onChange={(e) => setMiktar(e.target.value)} placeholder="1" />
            </label>
            <label className="ap-hesap-alan">
              <span>İsk.</span>
              <input type="text" className="ap-hesap-girdi" value={satirIskonto} onChange={(e) => setSatirIskonto(e.target.value)} placeholder="0" />
            </label>
          </div>
          <button type="button" className="ap-hesap-ikincil-btn ap-hesap-ikincil-btn--tam" onClick={birimHesapla}>
            Tutar Hesapla
          </button>
          <SonucGrubu sonuclar={birimSonuc} />
        </section>
        )}

        {bolumGoster('yüzde değişim', 'fark', 'artış', 'azalış') && (
          <section className="ap-hesap-bolum">
            <h4>Yüzde Değişim</h4>
            <div className="ap-hesap-cift">
              <label className="ap-hesap-alan">
                <span>Eski Değer</span>
                <input type="text" className="ap-hesap-girdi" value={eskiDeger} onChange={(e) => setEskiDeger(e.target.value)} placeholder="1000" />
              </label>
              <label className="ap-hesap-alan">
                <span>Yeni Değer</span>
                <input type="text" className="ap-hesap-girdi" value={yeniDeger} onChange={(e) => setYeniDeger(e.target.value)} placeholder="1250" />
              </label>
            </div>
            <button type="button" className="ap-hesap-ikincil-btn ap-hesap-ikincil-btn--tam" onClick={degisimHesapla}>
              Değişimi Hesapla
            </button>
            <SonucGrubu sonuclar={degisimSonuc} />
          </section>
        )}

        {bolumGoster('toplamdan birim', 'birim fiyat', 'toplam', 'adet') && (
          <section className="ap-hesap-bolum">
            <h4>Toplamdan Birim Fiyat</h4>
            <div className="ap-hesap-cift">
              <label className="ap-hesap-alan">
                <span>Toplam Tutar</span>
                <input type="text" className="ap-hesap-girdi" value={toplamTutar} onChange={(e) => setToplamTutar(e.target.value)} placeholder="5000" />
              </label>
              <label className="ap-hesap-alan ap-hesap-alan--dar">
                <span>Adet</span>
                <input type="text" className="ap-hesap-girdi" value={toplamAdet} onChange={(e) => setToplamAdet(e.target.value)} placeholder="12" />
              </label>
            </div>
            <button type="button" className="ap-hesap-ikincil-btn ap-hesap-ikincil-btn--tam" onClick={toplamdanBirimHesapla}>
              Birim Fiyatı Bul
            </button>
            <SonucGrubu sonuclar={toplamdanBirimSonuc} />
          </section>
        )}

        {gecmisVar && bolumGoster('geçmiş', 'history', 'sonuç') && (
          <section className="ap-hesap-bolum ap-hesap-bolum--gecmis">
            <div className="ap-hesap-gecmis-baslik-satir">
              <h4>Geçmiş</h4>
              <button type="button" className="ap-hesap-gecmis-temizle" onClick={gecmisiTemizle}>
                Geçmişi Temizle
              </button>
            </div>
            {gecmis.length > 0 && (
              <ul className="ap-hesap-gecmis-liste">
                {gecmis.map((k) => (
                  <li key={k.id} className="ap-hesap-gecmis-oge">
                    <div className="ap-hesap-gecmis-metin">
                      <span className="ap-hesap-gecmis-baslik">{k.baslik}</span>
                      <span className="ap-hesap-gecmis-detay">{k.detay}</span>
                    </div>
                    <KopyalaBtn deger={k.kopya} etiket={k.baslik} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
      )}
    </div>
  );
}
