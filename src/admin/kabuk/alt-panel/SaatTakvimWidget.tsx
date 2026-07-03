import { useEffect, useRef, useState } from 'react';

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

export function SaatTakvimWidget() {
  const [simdi, setSimdi] = useState(() => new Date());
  const [acik, setAcik] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setSimdi(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!acik) return;
    function disariTikla(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAcik(false);
    }
    document.addEventListener('mousedown', disariTikla);
    return () => document.removeEventListener('mousedown', disariTikla);
  }, [acik]);

  const saat = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(simdi);
  const tarih = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(simdi);
  const hucreler = takvimHucreleri(simdi.getFullYear(), simdi.getMonth());
  const bugun = simdi.getDate();

  return (
    <div ref={ref} className="ap-saat-wrap relative">
      <button type="button" onClick={() => setAcik((a) => !a)} className="ap-saat-btn" title="Tarih ve saat">
        <span className="ap-saat-saat">{saat}</span>
        <span className="ap-saat-tarih">{tarih}</span>
      </button>
      {acik && (
        <div className="ap-takvim-panel">
          <p className="ap-heading text-center text-sm font-semibold">
            {AYLAR[simdi.getMonth()]} {simdi.getFullYear()}
          </p>
          <div className="ap-takvim-grid mt-2">
            {GUNLER.map((g) => (
              <span key={g} className="ap-takvim-gun-baslik">{g}</span>
            ))}
            {hucreler.map((gun, i) => (
              <span
                key={i}
                className={`ap-takvim-gun ${gun === bugun ? 'ap-takvim-bugun' : ''} ${gun ? '' : 'ap-takvim-bos'}`}
              >
                {gun ?? ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
