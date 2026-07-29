import { useMemo, useState } from 'react';
import type { AdminCari } from '@/admin/baslat-menusu/erp/cari/tipler';
import { cariSatirEtiketi } from '@/admin/baslat-menusu/erp/cari/cariYardimci';
import { cariBakiyeAl, cariHareketleriGetir } from '@/admin/baslat-menusu/erp/belgeler/api';
import {
  belgeDurumEtiketi,
  belgeTurEtiketi,
  type BelgeKayit,
  type CariHareketKayit,
  type OdemeKayit,
} from '@/admin/baslat-menusu/erp/belgeler/tipler';
import {
  belgeOdemeleriGetir,
  belgelerGetirMock,
} from '@/admin/baslat-menusu/erp/belgeler/mockBelgeDepo';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import { belgeBaslatYaz } from '@/admin/baslat-menusu/erp/belgeler/belgeBaslat';
import { CariEkstreModal } from '@/admin/baslat-menusu/erp/belgeler/CariEkstreModal';
import {
  belgeNeviEtiketi,
  yonIcinVarsayilanBelgeNevi,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/belgeNevileri';
import '@/admin/baslat-menusu/erp/belgeler/fatura.css';
import './cariHareket.css';

type HareketSekme = 'hareketler' | 'belgeler' | 'odemeler';

interface CariHareketSayfasiProps {
  cari: AdminCari;
  onGeri: () => void;
  onModulAc?: (modulId: string) => void;
  belgelerEklemeyiVar?: boolean;
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

function cariBelgeleriAl(cari: AdminCari): BelgeKayit[] {
  return [...belgelerGetirMock('ALIS'), ...belgelerGetirMock('SATIS')]
    .filter((b) => b.cariId === cari.id || b.cariKodu === cari.cariKodu)
    .sort((a, b) => b.tarih.localeCompare(a.tarih));
}

export function CariHareketSayfasi({
  cari,
  onGeri,
  onModulAc,
  belgelerEklemeyiVar = true,
}: CariHareketSayfasiProps) {
  const [sekme, setSekme] = useState<HareketSekme>('hareketler');
  const [ekstreAcik, setEkstreAcik] = useState(false);
  const [yenileAnahtar, setYenileAnahtar] = useState(0);

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

  const odemeler = useMemo(() => {
    void yenileAnahtar;
    const liste: OdemeKayit[] = [];
    for (const b of belgeler) {
      for (const o of belgeOdemeleriGetir(b.id)) liste.push(o);
    }
    return liste
      .filter((o) => o.cariKodu === cari.cariKodu || (o.cariId && o.cariId === cari.id))
      .sort((a, b) => b.kayitTarihi.localeCompare(a.kayitTarihi));
  }, [belgeler, cari.cariKodu, cari.id, yenileAnahtar]);

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
  const belgeToplam = useMemo(
    () => belgeler.reduce((s, b) => s + b.genelToplam, 0),
    [belgeler]
  );

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
          <div>
            <h2 className="cari-hareket-baslik">{cariSatirEtiketi(cari)}</h2>
            <p className="cari-hareket-alt">
              Kod: <strong>{cari.cariKodu}</strong>
              {cari.unvan ? <> · {cari.unvan}</> : null}
            </p>
          </div>
        </div>
        <div className="cari-hareket-ust-sag">
          {belgelerEklemeyiVar && onModulAc ? (
            <button type="button" className="fatura-btn fatura-btn--birincil" onClick={belgeEkle}>
              + Belge Ekle
            </button>
          ) : null}
          <button
            type="button"
            className="fatura-btn fatura-btn--ghost"
            onClick={() => setEkstreAcik(true)}
          >
            Ekstre
          </button>
          <button type="button" className="fatura-btn fatura-btn--ghost" onClick={() => window.print()}>
            Yazdır
          </button>
          <button
            type="button"
            className="fatura-btn fatura-btn--ghost"
            onClick={() => setYenileAnahtar((n) => n + 1)}
            title="Yenile"
          >
            Yenile
          </button>
        </div>
      </div>

      <section className="cari-hareket-ozet" aria-label="Cari özet">
        <div className="cari-hareket-ozet-grid">
          <div className="cari-hareket-ozet-kart">
            <p className="cari-hareket-ozet-etiket">Firma</p>
            <strong>{cari.cariAdi || cari.unvan || '—'}</strong>
            <span className="cari-hareket-ozet-meta">{cari.yetkili || 'Yetkili yok'}</span>
          </div>
          <div className="cari-hareket-ozet-kart">
            <p className="cari-hareket-ozet-etiket">Vergi</p>
            <strong>{cari.vergiNo || '—'}</strong>
            <span className="cari-hareket-ozet-meta">{cari.vergiDairesi || '—'}</span>
          </div>
          <div className="cari-hareket-ozet-kart">
            <p className="cari-hareket-ozet-etiket">Adres / İletişim</p>
            <strong>{[cari.ilce, cari.il].filter(Boolean).join(' / ') || '—'}</strong>
            <span className="cari-hareket-ozet-meta">
              {cari.telefon || cari.gsm || cari.eposta || '—'}
            </span>
          </div>
          <div className="cari-hareket-ozet-kart cari-hareket-ozet-kart--bakiye">
            <p className="cari-hareket-ozet-etiket">Bakiye</p>
            <strong className={bakiye.bakiye >= 0 ? 'cari-hareket-borc' : 'cari-hareket-alacak'}>
              {sayiFormatla(Math.abs(bakiye.bakiye))}
              <span className="cari-hareket-ba">{bakiye.bakiye >= 0 ? 'B' : 'A'}</span>
            </strong>
            <span className="cari-hareket-ozet-meta">
              Borç {sayiFormatla(bakiye.borc)} · Alacak {sayiFormatla(bakiye.alacak)}
            </span>
          </div>
        </div>
      </section>

      <nav className="cari-hareket-sekmeler" aria-label="Cari detay sekmeleri">
        {(
          [
            { id: 'hareketler', label: 'Cari Hareketleri' },
            { id: 'belgeler', label: 'Belgeler' },
            { id: 'odemeler', label: 'Tahsilat / Ödeme' },
          ] as const
        ).map((s) => (
          <button
            key={s.id}
            type="button"
            className={`cari-hareket-sekme${sekme === s.id ? ' cari-hareket-sekme--aktif' : ''}`}
            onClick={() => setSekme(s.id)}
            aria-current={sekme === s.id ? 'page' : undefined}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="cari-hareket-govde">
        {sekme === 'hareketler' ? (
          <div className="cari-hareket-tablo-wrap">
            {hareketSatirlari.length === 0 ? (
              <div className="fatura-ekstre-bos">
                <p className="fatura-ekstre-bos-baslik">Henüz hareket yok</p>
                <p className="fatura-ekstre-bos-metin">
                  Belge onaylandığında veya ödeme kaydedildiğinde hareketler burada listelenir.
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
        ) : null}

        {sekme === 'belgeler' ? (
          <div className="cari-hareket-tablo-wrap">
            {belgeler.length === 0 ? (
              <p className="fatura-bos">Bu cariye ait belge yok.</p>
            ) : (
              <table className="cari-hareket-tablo">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Nevi / Tür</th>
                    <th>Belge No</th>
                    <th>Durum</th>
                    <th>Şube</th>
                    <th className="cari-hareket-sayi">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {belgeler.map((b) => {
                    const neviId = (b as BelgeKayit & { belgeNeviId?: string }).belgeNeviId;
                    const neviAd = neviId
                      ? belgeNeviEtiketi(neviId)
                      : b.yon === 'ALIS'
                        ? 'Alış'
                        : 'Satış';
                    return (
                      <tr
                        key={b.id}
                        className="cari-hareket-satir--tiklanabilir"
                        onDoubleClick={() => belgeAc(b.id)}
                      >
                        <td>{tarihGoster(b.tarih)}</td>
                        <td>
                          {neviAd} · {belgeTurEtiketi(b.tur)}
                        </td>
                        <td>
                          <button type="button" className="fatura-link" onClick={() => belgeAc(b.id)}>
                            {b.belgeNo}
                          </button>
                        </td>
                        <td>
                          <span className={`fatura-durum fatura-durum--${b.durum.toLowerCase()}`}>
                            {belgeDurumEtiketi(b.durum)}
                          </span>
                        </td>
                        <td>{b.subeAdi || b.subeKodu || '—'}</td>
                        <td className="cari-hareket-sayi">{sayiFormatla(b.genelToplam)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5}>Toplam</td>
                    <td className="cari-hareket-sayi">{sayiFormatla(belgeToplam)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        ) : null}

        {sekme === 'odemeler' ? (
          <div className="cari-hareket-tablo-wrap">
            {odemeler.length === 0 ? (
              <p className="fatura-bos">Tahsilat / ödeme kaydı yok.</p>
            ) : (
              <table className="cari-hareket-tablo">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Belge No</th>
                    <th>Kanal</th>
                    <th>Açıklama</th>
                    <th className="cari-hareket-sayi">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {odemeler.map((o) => (
                    <tr
                      key={o.id}
                      className="cari-hareket-satir--tiklanabilir"
                      onDoubleClick={() => belgeAc(o.belgeId)}
                    >
                      <td>{tarihGoster(o.kayitTarihi)}</td>
                      <td>
                        <button type="button" className="fatura-link" onClick={() => belgeAc(o.belgeId)}>
                          {o.belgeNo}
                        </button>
                      </td>
                      <td>
                        {o.kanal === 'KASA'
                          ? `Kasa ${o.kasaKodu || ''}`.trim()
                          : `Banka ${o.bankaKodu || ''}`.trim()}
                      </td>
                      <td>{o.aciklama || '—'}</td>
                      <td className="cari-hareket-sayi">{sayiFormatla(o.tutar)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}
      </div>

      <CariEkstreModal acik={ekstreAcik} cari={cari} onKapat={() => setEkstreAcik(false)} />
    </div>
  );
}
