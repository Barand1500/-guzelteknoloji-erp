import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { SistemModal, SistemModalAksiyonlar } from '@/admin/ortak/SistemModal';
import {
  OtOutlinedAlan,
  OtOutlinedGirdi,
} from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtOutlined';
import { OtTarihAralikSecici } from '@/admin/baslat-menusu/ozel-tanimlar/ortak/OtTarihAralikSecici';
import '@/admin/baslat-menusu/ozel-tanimlar/ozel-tanimlar.css';
import type { GorevKayitGirdi, YapilacakGorev } from './yapilacaklarDepo';
import {
  gorevEtiketleriniGetir,
  gorevEtiketiKaydet,
} from './yapilacaklarDepo';
import {
  RESMI_TATILLER_GUNCELLENDI,
  resmiTatilEtiketi,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/resmiTatiller';

interface GorevModalProps {
  acik: boolean;
  baslik: string;
  gorev?: YapilacakGorev | null;
  onKaydet: (deger: GorevKayitGirdi) => void;
  onKapat: () => void;
}

export function GorevModal({ acik, baslik, gorev, onKaydet, onKapat }: GorevModalProps) {
  const [metin, setMetin] = useState('');
  const [baslangic, setBaslangic] = useState('');
  const [bitis, setBitis] = useState('');
  const [onemli, setOnemli] = useState(false);
  const [etiket, setEtiket] = useState('');
  const [yeniEtiket, setYeniEtiket] = useState('');
  const [kayitliEtiketler, setKayitliEtiketler] = useState<string[]>([]);
  const [hata, setHata] = useState('');
  const [tatilSurum, setTatilSurum] = useState(0);

  useEffect(() => {
    if (!acik) return;
    setMetin(gorev?.baslik ?? '');
    setBaslangic(gorev?.tarih ?? '');
    setBitis(gorev?.bitisTarih ?? gorev?.tarih ?? '');
    setOnemli(gorev?.onemli ?? false);
    setEtiket(gorev?.etiket ?? '');
    setYeniEtiket('');
    setKayitliEtiketler(gorevEtiketleriniGetir());
    setHata('');
  }, [acik, gorev]);

  useEffect(() => {
    const yenile = () => setTatilSurum((n) => n + 1);
    window.addEventListener(RESMI_TATILLER_GUNCELLENDI, yenile);
    return () => window.removeEventListener(RESMI_TATILLER_GUNCELLENDI, yenile);
  }, []);

  const tatilNotu = useMemo(() => {
    void tatilSurum;
    const notlar: string[] = [];
    if (baslangic) {
      const e = resmiTatilEtiketi(baslangic);
      if (e) notlar.push(`Başlangıç: ${e}`);
    }
    if (bitis && bitis !== baslangic) {
      const e = resmiTatilEtiketi(bitis);
      if (e) notlar.push(`Bitiş: ${e}`);
    }
    return notlar.join(' · ');
  }, [baslangic, bitis, tatilSurum]);

  const kaydet = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const temiz = metin.trim();
      if (!temiz) {
        setHata('Görev metni gerekli.');
        return;
      }
      if (baslangic && bitis && bitis < baslangic) {
        setHata('Bitiş tarihi başlangıçtan önce olamaz.');
        return;
      }
      if (!baslangic && bitis) {
        setHata('Bitiş için önce başlangıç tarihi seçin.');
        return;
      }
      const etiketTemiz = etiket.trim() || null;
      if (etiketTemiz) gorevEtiketiKaydet(etiketTemiz);
      onKaydet({
        baslik: temiz,
        tarih: baslangic.trim() || null,
        bitisTarih: bitis.trim() || baslangic.trim() || null,
        onemli,
        etiket: etiketTemiz,
      });
    },
    [metin, baslangic, bitis, onemli, etiket, onKaydet]
  );

  function etiketEkle() {
    const temiz = yeniEtiket.trim();
    if (!temiz) return;
    const liste = gorevEtiketiKaydet(temiz);
    setKayitliEtiketler(liste);
    setEtiket(temiz);
    setYeniEtiket('');
  }

  return (
    <SistemModal
      acik={acik}
      onKapat={onKapat}
      baslik={baslik}
      altBaslik="Tarih yoksa tarihsiz görevler arasında görünür."
      genislik="md"
      disariTiklaKapat={false}
      ustCizgi={false}
      footer={
        <SistemModalAksiyonlar>
          <div className="flex w-full items-center justify-end gap-2">
            <button type="button" className="ap-btn-ghost rounded-lg px-4 py-2 text-sm" onClick={onKapat}>
              Kapat
            </button>
            <button type="submit" form="yap-gorev-form" className="ot-btn-kaydet">
              Kaydet
            </button>
          </div>
        </SistemModalAksiyonlar>
      }
    >
      <form id="yap-gorev-form" className="ot-pb-form yap-gorev-form" onSubmit={kaydet}>
        {hata ? <p className="ot-form-hata">{hata}</p> : null}

        <OtOutlinedGirdi
          etiket="Görev"
          deger={metin}
          onChange={setMetin}
          odakPlaceholder="Ne yapılacak?"
          zorunlu
          maxLength={200}
        />

        <OtOutlinedAlan etiket="Tarih" className="ot-outlined-tarih-aralik">
          <OtTarihAralikSecici
            baslangic={baslangic}
            bitis={bitis}
            onChange={(bas, bit) => {
              setBaslangic(bas);
              setBitis(bit);
            }}
          />
          {(baslangic || bitis) && (
            <button
              type="button"
              className="yap-gorev-tarih-temizle"
              onClick={() => {
                setBaslangic('');
                setBitis('');
              }}
            >
              Tarihi temizle (tarihsiz)
            </button>
          )}
        </OtOutlinedAlan>

        {tatilNotu ? (
          <p className="yap-gorev-tatil-not" role="note">
            Resmi tatil — {tatilNotu}
          </p>
        ) : null}

        <OtOutlinedAlan etiket="Etiket" className="yap-gorev-etiket-alan">
          <div className="yap-gorev-etiket-liste" role="listbox" aria-label="Görev etiketleri">
            <button
              type="button"
              role="option"
              aria-selected={!etiket}
              className={`yap-gorev-etiket-chip${!etiket ? ' yap-gorev-etiket-chip--aktif' : ''}`}
              onClick={() => setEtiket('')}
            >
              Yok
            </button>
            {kayitliEtiketler.map((e) => {
              const secili = etiket === e;
              return (
                <button
                  key={e}
                  type="button"
                  role="option"
                  aria-selected={secili}
                  className={`yap-gorev-etiket-chip${secili ? ' yap-gorev-etiket-chip--aktif' : ''}`}
                  onClick={() => setEtiket(secili ? '' : e)}
                >
                  {e}
                </button>
              );
            })}
          </div>
          <div className="yap-gorev-etiket-yeni">
            <input
              type="text"
              className="cari-outlined-input"
              value={yeniEtiket}
              maxLength={32}
              placeholder="Yeni etiket yaz…"
              aria-label="Yeni etiket"
              onChange={(ev) => setYeniEtiket(ev.target.value)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter') {
                  ev.preventDefault();
                  etiketEkle();
                }
              }}
            />
            <button
              type="button"
              className="yap-gorev-etiket-ekle"
              disabled={!yeniEtiket.trim()}
              onClick={etiketEkle}
            >
              Ekle
            </button>
          </div>
        </OtOutlinedAlan>

        <OtOutlinedAlan etiket="Önemli">
          <label className={`yap-gorev-onemli${onemli ? ' yap-gorev-onemli--acik' : ''}`}>
            <input type="checkbox" checked={onemli} onChange={(e) => setOnemli(e.target.checked)} />
            <span className="yap-gorev-onemli-yildiz" aria-hidden>
              ★
            </span>
            <span>{onemli ? 'Önemli görev' : 'Önemli değil'}</span>
          </label>
        </OtOutlinedAlan>
      </form>
    </SistemModal>
  );
}
