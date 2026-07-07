import { useCallback, useEffect, useRef, useState } from 'react';
import { useAksiyonCubuguPanelSync } from '@/admin/kabuk/aksiyon-cubugu/AksiyonCubuguPanelContext';
import {
  tarihAnahtari,
  tarihEtiketi,
  takvimNotlariOku,
  takvimNotuKaydet,
  takvimNotuSil,
  zamanEtiketi,
  type TakvimNotu,
} from './takvimNotlari';

const GUNLER = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function takvimHucreleri(yil: number, ay: number) {
  const ilkGun = new Date(yil, ay, 1).getDay();
  const baslangic = ilkGun === 0 ? 6 : ilkGun - 1;
  const gunSayisi = new Date(yil, ay + 1, 0).getDate();
  const hucreler: (number | null)[] = [];
  for (let i = 0; i < baslangic; i++) hucreler.push(null);
  for (let g = 1; g <= gunSayisi; g++) hucreler.push(g);
  return hucreler;
}

type NotModu = { tur: 'oku'; anahtar: string } | { tur: 'duzenle'; anahtar: string; metin: string };

export function SaatTakvimWidget() {
  const [simdi, setSimdi] = useState(() => new Date());
  const [acik, setAcik] = useState(false);
  const [gorunenAy, setGorunenAy] = useState(() => {
    const d = new Date();
    return { yil: d.getFullYear(), ay: d.getMonth() };
  });
  const [notlar, setNotlar] = useState<Record<string, TakvimNotu>>(() => takvimNotlariOku());
  const [notModu, setNotModu] = useState<NotModu | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useAksiyonCubuguPanelSync(acik, panelRef);
  const tekTikTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setSimdi(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!acik) return;
    function disariTikla(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAcik(false);
        setNotModu(null);
      }
    }
    document.addEventListener('mousedown', disariTikla);
    return () => document.removeEventListener('mousedown', disariTikla);
  }, [acik]);

  const saat = new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(simdi);
  const tarih = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(simdi);

  const hucreler = takvimHucreleri(gorunenAy.yil, gorunenAy.ay);
  const bugunGun =
    gorunenAy.yil === simdi.getFullYear() && gorunenAy.ay === simdi.getMonth() ? simdi.getDate() : null;

  const ayDegistir = useCallback((delta: number) => {
    setGorunenAy((onceki) => {
      const d = new Date(onceki.yil, onceki.ay + delta, 1);
      return { yil: d.getFullYear(), ay: d.getMonth() };
    });
    setNotModu(null);
  }, []);

  const panelAcKapat = () => {
    setAcik((a) => {
      const yeni = !a;
      if (yeni) {
        const d = new Date();
        setGorunenAy({ yil: d.getFullYear(), ay: d.getMonth() });
        setNotlar(takvimNotlariOku());
        setNotModu(null);
      } else {
        setNotModu(null);
      }
      return yeni;
    });
  };

  const gunTikla = (gun: number) => {
    const anahtar = tarihAnahtari(gorunenAy.yil, gorunenAy.ay, gun);

    if (tekTikTimerRef.current) {
      clearTimeout(tekTikTimerRef.current);
      tekTikTimerRef.current = null;
      const mevcut = notlar[anahtar];
      setNotModu({ tur: 'duzenle', anahtar, metin: mevcut?.metin ?? '' });
      return;
    }

    tekTikTimerRef.current = setTimeout(() => {
      tekTikTimerRef.current = null;
      if (notlar[anahtar]) {
        setNotModu({ tur: 'oku', anahtar });
      } else {
        setNotModu(null);
      }
    }, 280);
  };

  const notKaydet = (anahtar: string, metin: string) => {
    if (!metin.trim()) {
      takvimNotuSil(anahtar);
      setNotlar(takvimNotlariOku());
      setNotModu(null);
      return;
    }
    takvimNotuKaydet(anahtar, metin);
    setNotlar(takvimNotlariOku());
    setNotModu({ tur: 'oku', anahtar });
  };

  const notSil = (anahtar: string) => {
    takvimNotuSil(anahtar);
    setNotlar(takvimNotlariOku());
    setNotModu(null);
  };

  return (
    <div ref={ref} className="ap-saat-wrap relative">
      <button
        type="button"
        onClick={panelAcKapat}
        className={`ap-saat-btn${acik ? ' ap-saat-btn--aktif' : ''}`}
        title="Tarih ve saat"
        aria-expanded={acik}
      >
        <span className="ap-saat-saat">{saat}</span>
        <span className="ap-saat-tarih">{tarih}</span>
      </button>

      {acik && (
        <div ref={panelRef} className="ap-takvim-panel ap-takvim-panel--kenarlik-anim">
          <div className="ap-takvim-ust">
            <button type="button" className="ap-takvim-nav" onClick={() => ayDegistir(-1)} aria-label="Önceki ay">
              ‹
            </button>
            <p className="ap-takvim-baslik">
              {AYLAR[gorunenAy.ay]} {gorunenAy.yil}
            </p>
            <button type="button" className="ap-takvim-nav" onClick={() => ayDegistir(1)} aria-label="Sonraki ay">
              ›
            </button>
          </div>

          <div className="ap-takvim-grid">
            {GUNLER.map((g) => (
              <span key={g} className="ap-takvim-gun-baslik">
                {g}
              </span>
            ))}
            {hucreler.map((gun, i) => {
              if (!gun) {
                return <span key={`b-${i}`} className="ap-takvim-gun ap-takvim-bos" aria-hidden />;
              }
              const anahtar = tarihAnahtari(gorunenAy.yil, gorunenAy.ay, gun);
              const notlu = Boolean(notlar[anahtar]);
              const bugun = gun === bugunGun;
              const secili = notModu?.anahtar === anahtar;

              return (
                <button
                  key={`g-${i}`}
                  type="button"
                  className={[
                    'ap-takvim-gun',
                    bugun ? 'ap-takvim-bugun' : '',
                    notlu ? 'ap-takvim-notlu' : '',
                    secili ? 'ap-takvim-secili' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => gunTikla(gun)}
                  title={notlu ? 'Not var — okumak için tıkla, düzenlemek için çift tıkla' : 'Not eklemek için çift tıkla'}
                >
                  {gun}
                </button>
              );
            })}
          </div>

          <p className="ap-takvim-ipucu">Çift tıkla: not ekle · Tek tıkla: notu oku</p>

          {notModu?.tur === 'oku' && notlar[notModu.anahtar] && (
            <div className="ap-takvim-not-kart">
              <div className="ap-takvim-not-baslik">
                <p className="ap-heading text-xs font-semibold">{tarihEtiketi(notModu.anahtar)}</p>
                <p className="ap-muted text-[10px]">
                  {notlar[notModu.anahtar].olusturma !== notlar[notModu.anahtar].guncelleme
                    ? `Güncellendi: ${zamanEtiketi(notlar[notModu.anahtar].guncelleme)}`
                    : `Eklendi: ${zamanEtiketi(notlar[notModu.anahtar].olusturma)}`}
                </p>
              </div>
              <p className="ap-takvim-not-metin">{notlar[notModu.anahtar].metin}</p>
              <div className="ap-takvim-not-aksiyonlar">
                <button
                  type="button"
                  className="ap-takvim-not-tus"
                  onClick={() =>
                    setNotModu({
                      tur: 'duzenle',
                      anahtar: notModu.anahtar,
                      metin: notlar[notModu.anahtar].metin,
                    })
                  }
                >
                  Düzenle
                </button>
                <button type="button" className="ap-takvim-not-tus ap-takvim-not-tus--sil" onClick={() => notSil(notModu.anahtar)}>
                  Sil
                </button>
              </div>
            </div>
          )}

          {notModu?.tur === 'duzenle' && (
            <NotDuzenleyici
              anahtar={notModu.anahtar}
              baslangicMetin={notModu.metin}
              onKaydet={notKaydet}
              onIptal={() => setNotModu(notlar[notModu.anahtar] ? { tur: 'oku', anahtar: notModu.anahtar } : null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function NotDuzenleyici({
  anahtar,
  baslangicMetin,
  onKaydet,
  onIptal,
}: {
  anahtar: string;
  baslangicMetin: string;
  onKaydet: (anahtar: string, metin: string) => void;
  onIptal: () => void;
}) {
  const [metin, setMetin] = useState(baslangicMetin);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="ap-takvim-not-kart ap-takvim-not-kart--duzenle">
      <p className="ap-heading mb-1 text-xs font-semibold">{tarihEtiketi(anahtar)} — Not</p>
      <textarea
        ref={textareaRef}
        value={metin}
        onChange={(e) => setMetin(e.target.value)}
        rows={3}
        placeholder="Bu gün için not yazın..."
        className="ap-takvim-not-textarea"
      />
      <div className="ap-takvim-not-aksiyonlar">
        <button type="button" className="ap-takvim-not-tus ap-takvim-not-tus--birincil" onClick={() => onKaydet(anahtar, metin)}>
          Kaydet
        </button>
        <button type="button" className="ap-takvim-not-tus" onClick={onIptal}>
          İptal
        </button>
      </div>
    </div>
  );
}
