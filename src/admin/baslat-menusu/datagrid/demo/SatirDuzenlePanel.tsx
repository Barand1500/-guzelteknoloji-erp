import { useCallback, useMemo, useRef, useState } from 'react';
import { ifadeHesapla } from '@/admin/ortak/datagrid/formulaYardimci';
import { paraFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { gecerliBirim, birimSecenekleri } from './birimVeri';
import { satirHesapla, type SiparisSatiri } from './demoVeri';

const KAPAT_ESIGI = 72;

interface SatirDuzenlePanelProps {
  satir: SiparisSatiri;
  kdvDahil?: boolean;
  onKaydet: (satir: SiparisSatiri) => void;
  onKapat: () => void;
}

type FormDegerleri = {
  miktar: string;
  birim: string;
  fiyat: string;
  satirIskonto: string;
  altIskonto: string;
  toplamKdv: string;
};

function formdanSatirOlustur(
  satir: SiparisSatiri,
  degerler: FormDegerleri,
  kdvDahil: boolean
): SiparisSatiri {
  const miktar = ifadeHesapla(degerler.miktar, 'sayi') ?? satir.miktar;
  const fiyat = ifadeHesapla(degerler.fiyat, 'sayi') ?? satir.fiyat;
  const satirIskontoYuzde = ifadeHesapla(degerler.satirIskonto, 'iskonto') ?? satir.satirIskontoYuzde;
  const altIskontoYuzde = ifadeHesapla(degerler.altIskonto, 'iskonto') ?? satir.altIskontoYuzde;
  const toplamKdvYuzde = ifadeHesapla(degerler.toplamKdv, 'sayi') ?? satir.toplamKdvYuzde;
  return satirHesapla(
    {
      ...satir,
      miktar,
      birim: gecerliBirim(degerler.birim, satir.birim),
      fiyat,
      satirIskontoYuzde,
      altIskontoYuzde,
      toplamKdvYuzde,
    },
    kdvDahil
  );
}

export function SatirDuzenlePanel({
  satir,
  kdvDahil = false,
  onKaydet,
  onKapat,
}: SatirDuzenlePanelProps) {
  const [degerler, setDegerler] = useState<FormDegerleri>({
    miktar: String(satir.miktar),
    birim: satir.birim,
    fiyat: String(satir.fiyat),
    satirIskonto: String(satir.satirIskontoYuzde),
    altIskonto: String(satir.altIskontoYuzde),
    toplamKdv: String(satir.toplamKdvYuzde),
  });

  const [surukleY, setSurukleY] = useState(0);
  const [surukleniyor, setSurukleniyor] = useState(false);
  const baslangicY = useRef(0);
  const tutamacRef = useRef<HTMLDivElement>(null);

  const hesap = useMemo(() => formdanSatirOlustur(satir, degerler, kdvDahil), [satir, degerler, kdvDahil]);

  const kaydet = useCallback(() => onKaydet(hesap), [hesap, onKaydet]);

  const tutamacBasla = (e: React.PointerEvent) => {
    baslangicY.current = e.clientY;
    setSurukleniyor(true);
    tutamacRef.current?.setPointerCapture(e.pointerId);
  };

  const tutamacSurukle = (e: React.PointerEvent) => {
    if (!surukleniyor) return;
    setSurukleY(Math.max(0, e.clientY - baslangicY.current));
  };

  const tutamacBitir = () => {
    if (surukleY >= KAPAT_ESIGI) {
      kaydet();
      return;
    }
    setSurukleY(0);
    setSurukleniyor(false);
  };

  return (
    <div
      className={`dg-duzenle${surukleniyor ? ' dg-duzenle--surukleniyor' : ''}`}
      style={{ transform: surukleY ? `translateY(${surukleY}px)` : undefined }}
    >
      <div
        ref={tutamacRef}
        className="dg-duzenle-tutamac-alan"
        onPointerDown={tutamacBasla}
        onPointerMove={tutamacSurukle}
        onPointerUp={tutamacBitir}
        onPointerCancel={tutamacBitir}
        role="button"
        tabIndex={0}
        aria-label="Aşağı kaydırarak kaydet ve kapat"
      >
        <div className="dg-duzenle-tutamac" />
        <span className="dg-duzenle-tutamac-metin">Aşağı çekerek kaydet</span>
      </div>

      <header className="dg-duzenle-baslik">
        <div>
          <p className="dg-duzenle-ust-etiket">Satır düzenle</p>
          <p className="dg-duzenle-urun-meta dg-duzenle-urun-meta--ust">
            <span className="dg-duzenle-sku">{satir.urun.sku}</span>
            {satir.urun.kur ? <span className="dg-duzenle-kur">{satir.urun.kur}</span> : null}
          </p>
          <h3 className="dg-duzenle-urun-ad">{satir.urun.ad}</h3>
        </div>
      </header>

      <div className="dg-duzenle-govde ap-scroll">
        <div className="dg-duzenle-alanlar">
          <DuzenleAlan
            etiket="Miktar"
            ipucu="2*5 veya 10+2"
            deger={degerler.miktar}
            onDegistir={(miktar) => setDegerler((d) => ({ ...d, miktar }))}
          />
          <DuzenleSecim
            etiket="Birim"
            deger={degerler.birim}
            secenekler={birimSecenekleri().map((b) => b.deger)}
            etiketler={Object.fromEntries(birimSecenekleri().map((b) => [b.deger, b.etiket]))}
            onDegistir={(birim) => setDegerler((d) => ({ ...d, birim }))}
          />
          <DuzenleAlan
            etiket="Birim fiyat"
            ipucu="1000+%10 → 1100"
            deger={degerler.fiyat}
            onDegistir={(fiyat) => setDegerler((d) => ({ ...d, fiyat }))}
          />
          <DuzenleAlan
            etiket="Satır iskontosu"
            ipucu="20+20 → %36"
            deger={degerler.satirIskonto}
            onDegistir={(satirIskonto) => setDegerler((d) => ({ ...d, satirIskonto }))}
          />
          <DuzenleAlan
            etiket="Alt iskonto"
            ipucu="Yüzde veya ifade"
            deger={degerler.altIskonto}
            onDegistir={(altIskonto) => setDegerler((d) => ({ ...d, altIskonto }))}
          />
          <DuzenleAlan
            etiket="KDV"
            ipucu="%20 veya 18+2"
            deger={degerler.toplamKdv}
            onDegistir={(toplamKdv) => setDegerler((d) => ({ ...d, toplamKdv }))}
          />
        </div>

        <div className="dg-duzenle-ozet">
          <OzetSatir etiket="Tutar" deger={paraFormatla(hesap.tutar)} />
          <OzetSatir etiket="Net" deger={paraFormatla(hesap.netTutar)} />
          <OzetSatir etiket="Gerçek" deger={paraFormatla(hesap.gercekToplam)} />
          <OzetSatir etiket="KDV tutarı" deger={paraFormatla(hesap.toplamKdvTutar)} />
          <OzetSatir etiket="Toplam" deger={paraFormatla(hesap.toplamTutar)} vurgu />
        </div>
      </div>

      <footer className="dg-duzenle-alt">
        <button type="button" className="dg-duzenle-btn dg-duzenle-btn--iptal" onClick={onKapat}>
          İptal
        </button>
        <button type="button" className="dg-duzenle-btn dg-duzenle-btn--kaydet" onClick={kaydet}>
          Kaydet
        </button>
      </footer>
    </div>
  );
}

function DuzenleAlan({
  etiket,
  ipucu,
  deger,
  onDegistir,
}: {
  etiket: string;
  ipucu: string;
  deger: string;
  onDegistir: (v: string) => void;
}) {
  return (
    <label className="dg-duzenle-alan">
      <span className="dg-duzenle-alan-baslik">
        <span>{etiket}</span>
        <span className="dg-duzenle-alan-ipucu">{ipucu}</span>
      </span>
      <input
        type="text"
        className="dg-duzenle-girdi"
        value={deger}
        onChange={(e) => onDegistir(e.target.value)}
      />
    </label>
  );
}

function DuzenleSecim({
  etiket,
  deger,
  secenekler,
  etiketler,
  onDegistir,
}: {
  etiket: string;
  deger: string;
  secenekler: string[];
  etiketler?: Record<string, string>;
  onDegistir: (v: string) => void;
}) {
  return (
    <label className="dg-duzenle-alan">
      <span className="dg-duzenle-alan-baslik">
        <span>{etiket}</span>
      </span>
      <select className="dg-duzenle-girdi dg-duzenle-secim" value={deger} onChange={(e) => onDegistir(e.target.value)}>
        {secenekler.map((s) => (
          <option key={s} value={s}>
            {etiketler?.[s] ?? s}
          </option>
        ))}
      </select>
    </label>
  );
}

function OzetSatir({ etiket, deger, vurgu }: { etiket: string; deger: string; vurgu?: boolean }) {
  return (
    <div className={`dg-duzenle-ozet-satir${vurgu ? ' dg-duzenle-ozet-satir--vurgu' : ''}`}>
      <span>{etiket}</span>
      <span>{deger}</span>
    </div>
  );
}
