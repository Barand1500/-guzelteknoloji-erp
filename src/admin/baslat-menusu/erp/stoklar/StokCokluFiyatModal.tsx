import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { DonenAccentCerceve } from '@/admin/ortak/DonenAccentCerceve';
import { ModalListeIkon, ModalSolBaslik } from '@/admin/ortak/ModalSolBaslik';
import { useAdminSekmeKabuk } from '@/baglamlar/AdminSekmeKabukContext';
import { sekmePortalHedefi, sekmePortaliGizliMi, useSekmeModalGovdeKilidi } from '@/araclar/sekmePortal';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import type { StokFiyatDuzenleSatir, StokFiyatPb } from './fiyatDuzenleTipler';
import { STOK_FIYAT_PB_SECENEKLERI, stokPbSembolu } from './fiyatDuzenleTipler';
import { sayiGosterFormatli, sayiOku } from './stokYeniBirimlerYardimci';
import {
  iskontoGecerliMi,
  iskontoGorunumMetin,
  iskontoNormalize,
  iskontoYuzdeHesapla,
  netHesapla,
} from './stokCokluFiyatHesap';import {
  STOK_COKLU_FIYAT_MAX_SIRA,
  stokCokluFiyatEkle,
  stokCokluFiyatEtiketi,
  stokCokluFiyatGuncelle,
  stokCokluFiyatListesi,
  stokCokluFiyatSil,
  type StokCokluFiyatTur,
} from './stokCokluFiyatYardimci';

interface StokCokluFiyatModalProps {
  acik: boolean;
  tur: StokCokluFiyatTur;
  satir: StokFiyatDuzenleSatir;
  onKaydet: (patch: Partial<StokFiyatDuzenleSatir>) => void;
  onKapat: () => void;
}

function fiyatHamFiltrele(ham: string): string {
  const temiz = ham.replace(/\./g, '');
  let sonuc = '';
  let virgulVar = false;
  for (const ch of temiz) {
    if (ch >= '0' && ch <= '9') sonuc += ch;
    else if (ch === ',' && !virgulVar) {
      virgulVar = true;
      sonuc += ',';
    }
  }
  return sonuc;
}

function fiyatYazarkenFormatla(ham: string): string {
  const filtre = fiyatHamFiltrele(ham);
  if (!filtre) return '';
  const [tam, ondalik] = filtre.split(',');
  const tamFormatli = tam.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return ondalik !== undefined ? `${tamFormatli},${ondalik}` : tamFormatli;
}

function iskontoFiltrele(ham: string): string {
  return ham.replace(/[^\d.,+\s]/g, '');
}

function pbNormalize(pb: string): StokFiyatPb {
  return pb === 'USD' || pb === 'EUR' ? pb : 'TL';
}

function formatliVeyaBos(deger: number | null): string {
  if (deger === null || !Number.isFinite(deger)) return '';
  return sayiGosterFormatli(deger);
}

const PB_SECENEKLERI = STOK_FIYAT_PB_SECENEKLERI.map((p) => ({
  value: p.deger,
  label: p.etiket,
}));

function StokCokluFiyatPbSecim({
  deger,
  onChange,
  ariaLabel,
}: {
  deger: StokFiyatPb;
  onChange: (pb: StokFiyatPb) => void;
  ariaLabel: string;
}) {
  return (
    <div className="stok-coklu-fiyat-pb">
      <FormAcilirSecim
        value={deger}
        onChange={(v) => onChange(pbNormalize(v))}
        secenekler={PB_SECENEKLERI}
        aria-label={ariaLabel}
        className="stok-coklu-fiyat-pb-secim"
        listeSinifi="stok-coklu-fiyat-pb-liste"
        listeMinGenislik={76}
        tusMetin={stokPbSembolu(deger)}
      />
    </div>
  );
}

type FiyatFormAlan = {
  aciklama: string;
  fiyat: string;
  iskonto: string;
  net: string;
  pb: StokFiyatPb;
};

const BOS_FORM: FiyatFormAlan = {
  aciklama: '',
  fiyat: '',
  iskonto: '',
  net: '',
  pb: 'TL',
};

export function StokCokluFiyatModal({ acik, tur, satir, onKaydet, onKapat }: StokCokluFiyatModalProps) {
  const sekme = useAdminSekmeKabuk();
  const portalKok = useMemo(
    () => (acik ? sekmePortalHedefi(null, sekme?.sekmeId) : null),
    [acik, sekme?.sekmeId]
  );
  const [yeni, setYeni] = useState<FiyatFormAlan>(BOS_FORM);
  const [hata, setHata] = useState('');
  const [satirDuzenle, setSatirDuzenle] = useState<number | null>(null);
  const [duzenle, setDuzenle] = useState<FiyatFormAlan>(BOS_FORM);
  const [iskontoOdak, setIskontoOdak] = useState(false);
  const aciklamaInputRef = useRef<HTMLInputElement>(null);
  const acilisAnahtarRef = useRef<string | null>(null);

  useSekmeModalGovdeKilidi(acik, portalKok);

  const baslik = tur === 'alis' ? 'Alış Fiyatları' : 'Satış Fiyatları';

  const liste = useMemo(
    () =>
      stokCokluFiyatListesi(satir, tur).map((oge) => ({
        sira: oge.sira,
        etiket: stokCokluFiyatEtiketi(tur, oge.sira),
        aciklama: oge.aciklama,
        deger: oge.deger,
        iskonto: oge.iskonto,
        netTutar: oge.netTutar,
        pb: oge.pb,
      })),
    [satir, tur]
  );

  useEffect(() => {
    if (!acik) {
      acilisAnahtarRef.current = null;
      return;
    }
    const anahtar = `${satir.id}-${tur}`;
    if (acilisAnahtarRef.current === anahtar) return;
    acilisAnahtarRef.current = anahtar;
    setYeni(BOS_FORM);
    setHata('');
    setSatirDuzenle(null);
    setDuzenle(BOS_FORM);
    setIskontoOdak(false);
    requestAnimationFrame(() => aciklamaInputRef.current?.focus());
  }, [acik, satir.id, tur]);

  const fiyatDegisti = useCallback((ham: string, onceki: FiyatFormAlan): FiyatFormAlan => {
    const fiyat = fiyatYazarkenFormatla(ham);
    const deger = sayiOku(fiyat);
    const iskonto = onceki.iskonto;
    if (deger === null || !iskontoGecerliMi(iskonto)) {
      return { ...onceki, fiyat, net: onceki.net && deger === null ? '' : onceki.net };
    }
    return { ...onceki, fiyat, net: formatliVeyaBos(netHesapla(deger, iskonto)) };
  }, []);

  const iskontoDegisti = useCallback((ham: string, onceki: FiyatFormAlan): FiyatFormAlan => {
    const iskonto = iskontoFiltrele(ham);
    const deger = sayiOku(onceki.fiyat);
    if (deger === null || !iskontoGecerliMi(iskonto)) {
      return { ...onceki, iskonto };
    }
    return { ...onceki, iskonto, net: formatliVeyaBos(netHesapla(deger, iskonto)) };
  }, []);

  const netDegisti = useCallback((ham: string, onceki: FiyatFormAlan): FiyatFormAlan => {
    const net = fiyatYazarkenFormatla(ham);
    const netDeger = sayiOku(net);
    const fiyatDeger = sayiOku(onceki.fiyat);
    if (netDeger === null || fiyatDeger === null || fiyatDeger <= 0) {
      return { ...onceki, net };
    }
    const iskonto = iskontoYuzdeHesapla(fiyatDeger, netDeger);
    return { ...onceki, net, iskonto };
  }, []);

  const formdanKayit = useCallback((form: FiyatFormAlan) => {
    const deger = sayiOku(form.fiyat.trim());
    if (deger === null) return null;
    const iskontoHam = form.iskonto.trim();
    if (!iskontoGecerliMi(iskontoHam)) return 'invalid-iskonto' as const;
    const iskonto = iskontoNormalize(iskontoHam);
    const netHam = form.net.trim();
    const netTutar =
      netHam && sayiOku(netHam) !== null
        ? (sayiOku(netHam) as number)
        : netHesapla(deger, iskonto);
    return {
      aciklama: form.aciklama.trim(),
      deger,
      iskonto,
      netTutar,
      pb: form.pb,
    };
  }, []);

  const ekle = useCallback(() => {
    if (liste.length >= STOK_COKLU_FIYAT_MAX_SIRA) {
      setHata(`En fazla ${STOK_COKLU_FIYAT_MAX_SIRA} fiyat eklenebilir.`);
      return;
    }
    if (!yeni.fiyat.trim()) {
      setHata('Fiyat girin.');
      return;
    }
    const kayit = formdanKayit(yeni);
    if (kayit === null) {
      setHata('Geçerli bir fiyat girin.');
      return;
    }
    if (kayit === 'invalid-iskonto') {
      setHata('İskonto geçersiz (örn. 20+20).');
      return;
    }
    onKaydet(stokCokluFiyatEkle(tur, kayit, satir));
    setYeni(BOS_FORM);
    setIskontoOdak(false);
    setHata('');
    requestAnimationFrame(() => aciklamaInputRef.current?.focus());
  }, [formdanKayit, liste.length, onKaydet, satir, tur, yeni]);

  const satirKaydet = useCallback(() => {
    if (satirDuzenle === null) return;
    if (!duzenle.fiyat.trim()) {
      onKaydet(stokCokluFiyatSil(tur, satirDuzenle, satir));
      setSatirDuzenle(null);
      setDuzenle(BOS_FORM);
      setHata('');
      return;
    }
    const kayit = formdanKayit(duzenle);
    if (kayit === null) {
      setHata('Geçerli bir fiyat girin.');
      return;
    }
    if (kayit === 'invalid-iskonto') {
      setHata('İskonto geçersiz (örn. 20+20).');
      return;
    }
    onKaydet(stokCokluFiyatGuncelle(tur, satirDuzenle, kayit, satir));
    setSatirDuzenle(null);
    setDuzenle(BOS_FORM);
    setIskontoOdak(false);
    setHata('');
  }, [duzenle, formdanKayit, onKaydet, satir, satirDuzenle, tur]);

  useEffect(() => {
    if (!acik || !portalKok) return;
    function tusHandler(e: KeyboardEvent) {
      if (sekmePortaliGizliMi(portalKok)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (satirDuzenle !== null) {
          setSatirDuzenle(null);
          setDuzenle(BOS_FORM);
          setIskontoOdak(false);
          setHata('');
          return;
        }
        onKapat();
      }
    }
    document.addEventListener('keydown', tusHandler);
    return () => document.removeEventListener('keydown', tusHandler);
  }, [acik, onKapat, portalKok, satirDuzenle]);

  if (!acik || !portalKok) return null;

  const formInputlar = (
    form: FiyatFormAlan,
    setForm: (fn: (onceki: FiyatFormAlan) => FiyatFormAlan) => void,
    opts: { autoFocus?: boolean; onEnter: () => void; onEscape?: () => void; siraGoster?: number }
  ) => {
    const tusHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        opts.onEnter();
      }
      if (e.key === 'Escape' && opts.onEscape) {
        e.preventDefault();
        e.stopPropagation();
        opts.onEscape();
      }
    };
    return (
      <div
        className="stok-coklu-fiyat-input-grup stok-coklu-fiyat-input-grup--ekle stok-coklu-fiyat-input-grup--genis"
        onBlur={
          opts.siraGoster !== undefined
            ? (e) => {
                const sonraki = e.relatedTarget as Node | null;
                if (!e.currentTarget.contains(sonraki)) opts.onEnter();
              }
            : undefined
        }
      >
        {opts.siraGoster !== undefined ? (
          <span className="stok-coklu-fiyat-no" aria-hidden="true">
            {opts.siraGoster}
          </span>
        ) : null}
        <input
          ref={opts.autoFocus && opts.siraGoster === undefined ? aciklamaInputRef : undefined}
          type="text"
          className="ap-input stok-coklu-fiyat-ekle-input stok-coklu-fiyat-aciklama-input"
          value={form.aciklama}
          autoFocus={opts.autoFocus && opts.siraGoster !== undefined}
          placeholder="Açıklama"
          aria-label="Açıklama"
          onChange={(e) => setForm((o) => ({ ...o, aciklama: e.target.value }))}
          onKeyDown={tusHandler}
        />
        <input
          type="text"
          className="ap-input stok-coklu-fiyat-ekle-input stok-coklu-fiyat-tutar-input"
          value={form.fiyat}
          placeholder="Fiyat"
          inputMode="decimal"
          aria-label="Fiyat"
          onChange={(e) => setForm((o) => fiyatDegisti(e.target.value, o))}
          onKeyDown={tusHandler}
        />
        <input
          type="text"
          className="ap-input stok-coklu-fiyat-ekle-input stok-coklu-fiyat-iskonto-input"
          value={
            iskontoOdak
              ? form.iskonto
              : iskontoGorunumMetin(form.iskonto) || form.iskonto
          }
          placeholder="İskonto"
          inputMode="decimal"
          aria-label="İskonto"
          title={form.iskonto.trim() || 'Örn. 20+20'}
          onFocus={() => setIskontoOdak(true)}
          onBlur={() => setIskontoOdak(false)}
          onChange={(e) => setForm((o) => iskontoDegisti(e.target.value, o))}
          onKeyDown={tusHandler}
        />
        <input
          type="text"
          className="ap-input stok-coklu-fiyat-ekle-input stok-coklu-fiyat-net-input"
          value={form.net}
          placeholder="Net"
          inputMode="decimal"
          aria-label="Net tutar"
          onChange={(e) => setForm((o) => netDegisti(e.target.value, o))}
          onKeyDown={tusHandler}
        />
        <StokCokluFiyatPbSecim
          deger={form.pb}
          onChange={(pb) => setForm((o) => ({ ...o, pb }))}
          ariaLabel="Para birimi"
        />
        {opts.siraGoster === undefined ? (
          <button type="button" className="stok-coklu-fiyat-ekle-btn" onClick={opts.onEnter}>
            Ekle
          </button>
        ) : null}
      </div>
    );
  };

  return createPortal(
    <div
      className="ap-sil-onay-modal cari-secenek-modal stok-coklu-fiyat-modal"
      role="dialog"
      aria-modal="true"
      aria-label={baslik}
    >
      <div className="ap-sil-onay-arka cari-secenek-arka" aria-hidden="true" />
      <DonenAccentCerceve className="ap-accent-donen-cerceve--sil ap-accent-donen-cerceve--cari-secenek">
        <div className="ap-sil-onay-kart cari-secenek-kart ap-sil-onay-kart--sol-baslik">
          <ModalSolBaslik baslik={baslik} ikon={<ModalListeIkon />} onKapat={onKapat} />

          <div className="cari-secenek-govde">
            <div className="cari-secenek-ekle stok-coklu-fiyat-ekle">
              {formInputlar(yeni, setYeni, { onEnter: ekle })}
            </div>
            {hata ? <p className="cari-secenek-hata">{hata}</p> : null}

            <div className="stok-coklu-fiyat-tablo-wrap">
              <table
                className={`stok-coklu-fiyat-tablo${satirDuzenle !== null ? ' stok-coklu-fiyat-tablo--duzenle' : ''}`.trim()}
              >
                <colgroup>
                  <col className="stok-coklu-fiyat-tablo-col-sira" />
                  <col className="stok-coklu-fiyat-tablo-col-aciklama" />
                  <col className="stok-coklu-fiyat-tablo-col-tutar" />
                  <col className="stok-coklu-fiyat-tablo-col-iskonto" />
                  <col className="stok-coklu-fiyat-tablo-col-net" />
                  <col className="stok-coklu-fiyat-tablo-col-pb" />
                  {satirDuzenle === null ? (
                    <col className="stok-coklu-fiyat-tablo-col-islem" />
                  ) : null}
                </colgroup>
                <thead>
                  <tr>
                    <th>Sırası</th>
                    <th>Açıklaması</th>
                    <th>Fiyatı</th>
                    <th>İskonto</th>
                    <th>Net Tutar</th>
                    <th>PB</th>
                    {satirDuzenle === null ? <th>#</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {liste.length === 0 ? (
                    <tr>
                      <td
                        colSpan={satirDuzenle === null ? 7 : 6}
                        className="stok-coklu-fiyat-tablo-bos"
                      >
                        Henüz ek fiyat yok.
                      </td>
                    </tr>
                  ) : (
                    liste.map((oge) => {
                      const duzenleniyor = satirDuzenle === oge.sira;
                      return (
                        <tr
                          key={`${satir.id}-${oge.sira}`}
                          className={duzenleniyor ? 'stok-coklu-fiyat-tablo-satir--duzenleniyor' : undefined}
                          onDoubleClick={() => {
                            if (duzenleniyor || satirDuzenle !== null) return;
                            setSatirDuzenle(oge.sira);
                            setDuzenle({
                              aciklama: oge.aciklama,
                              fiyat: formatliVeyaBos(oge.deger),
                              iskonto: oge.iskonto,
                              net: formatliVeyaBos(oge.netTutar),
                              pb: oge.pb,
                            });
                            setIskontoOdak(false);
                            setHata('');
                          }}
                          title="Düzenlemek için çift tıklayın"
                        >
                          {duzenleniyor ? (
                            <td colSpan={6} className="stok-coklu-fiyat-tablo-duzenle-hucre">
                              {formInputlar(duzenle, setDuzenle, {
                                autoFocus: true,
                                siraGoster: oge.sira,
                                onEnter: satirKaydet,
                                onEscape: () => {
                                  setSatirDuzenle(null);
                                  setDuzenle(BOS_FORM);
                                  setHata('');
                                },
                              })}
                            </td>
                          ) : (
                            <>
                              <td className="stok-coklu-fiyat-tablo-sira">{oge.sira}</td>
                              <td className="stok-coklu-fiyat-tablo-aciklama">
                                {oge.aciklama || '—'}
                              </td>
                              <td className="stok-coklu-fiyat-tablo-tutar">
                                {formatliVeyaBos(oge.deger) || '—'}
                              </td>
                              <td
                                className="stok-coklu-fiyat-tablo-iskonto"
                                title={oge.iskonto.trim() || undefined}
                              >
                                {iskontoGorunumMetin(oge.iskonto) || '—'}
                              </td>
                              <td className="stok-coklu-fiyat-tablo-net">
                                {formatliVeyaBos(oge.netTutar) || '—'}
                              </td>
                              <td className="stok-coklu-fiyat-tablo-pb">{stokPbSembolu(oge.pb)}</td>
                              {satirDuzenle === null ? (
                                <td className="stok-coklu-fiyat-tablo-islem">
                                  <button
                                    type="button"
                                    className="stok-coklu-fiyat-tablo-sil"
                                    onClick={() => onKaydet(stokCokluFiyatSil(tur, oge.sira, satir))}
                                    aria-label={`${oge.etiket} sil`}
                                  >
                                    Sil
                                  </button>
                                </td>
                              ) : null}
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="cari-secenek-alt">
            <p className="cari-secenek-ipucu">Düzenlemek için çift tıklayınız.</p>
          </div>
        </div>
      </DonenAccentCerceve>
    </div>,
    portalKok
  );
}
