import type { ReactNode } from 'react';
import type { AdminCari } from '@/admin/baslat-menusu/erp/cari/tipler';
import { cariTipiEtiketi } from '@/admin/baslat-menusu/erp/cari/tipler';
import { faturaTipiEtiketi } from '@/admin/baslat-menusu/erp/cari/cariYardimci';
import { stokCokluFiyatAdlariGetir } from '@/admin/baslat-menusu/erp/stoklar/stokCokluFiyatAdlari';
import { EARSIV_TESLIM_SEKILLERI } from '@/admin/baslat-menusu/erp/cari/tipler';
import type { BelgeCariAlanId } from './belgeCariAlanDuzeni';
import { BELGE_CARI_ALAN_ETIKET } from './belgeCariAlanDuzeni';

function kimlikSatiri(cari: AdminCari): { baslik: string; deger: string } {
  const vergiNo = (cari.vergiNo || '').trim();
  const vergiDairesi = (cari.vergiDairesi || '').trim();
  if (cari.isletmeTuru === 'TUZEL') {
    return {
      baslik: 'Vergi No / Daire',
      deger: [vergiNo, vergiDairesi].filter(Boolean).join(' · ') || '—',
    };
  }
  const yalnizRakam = vergiNo.replace(/\D/g, '');
  return {
    baslik: yalnizRakam.length === 11 ? 'TC Kimlik No' : 'Pasaport / Kimlik No',
    deger: vergiNo || '—',
  };
}

function fiyatOzet(
  tanim: string | null | undefined,
  secim: string | null | undefined,
  yon: 'alis' | 'satis'
): { sol: string; sag: string } {
  const tanimMetin = (tanim ?? '').trim();
  const secimMetin = (secim ?? '').trim();
  const secenekler = stokCokluFiyatAdlariGetir(tanimMetin, yon);
  const secimEtiket =
    secenekler.find((s) => s.value === secimMetin)?.label ??
    (secimMetin ? secimMetin : 'Ana Fiyat');
  return {
    sol: tanimMetin ? tanimMetin : 'FİYAT',
    sag: tanimMetin ? secimEtiket : 'Standart',
  };
}

function earsivTeslimEtiketi(kod: string): string {
  return EARSIV_TESLIM_SEKILLERI.find((t) => t.value === kod)?.label ?? 'Seçiniz…';
}

function MetaKalem({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <div className="cari-outlined-field fatura-ust-meta fatura-ust-meta--kalem">
      <div className="cari-outlined-etiket">
        <span className="cari-outlined-etiket-metin">{etiket}</span>
      </div>
      <div className="cari-outlined-cerceve">
        <div className="cari-outlined-icerik">
          <strong className="fatura-ust-meta-deger">{deger || '—'}</strong>
        </div>
      </div>
    </div>
  );
}

function MetaGrup({ etiket, sol, sag }: { etiket: string; sol: string; sag?: string }) {
  return (
    <div className="cari-outlined-field fatura-ust-meta fatura-ust-meta--grup">
      <div className="cari-outlined-etiket">
        <span className="cari-outlined-etiket-metin">{etiket}</span>
      </div>
      <div className="cari-outlined-cerceve">
        <div className="cari-outlined-icerik fatura-ust-meta-grup-icerik">
          <strong className="fatura-ust-meta-deger">{sol || '—'}</strong>
          {sag !== undefined ? (
            <>
              <i aria-hidden />
              <strong className="fatura-ust-meta-deger">{sag || '—'}</strong>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function OzetItem({ etiket, deger, genis }: { etiket: string; deger: string; genis?: boolean }) {
  return (
    <div className={`fatura-musteri-ozet-item${genis ? ' fatura-musteri-ozet-item--tabela' : ''}`}>
      <span>{etiket}</span>
      <strong>{deger || '—'}</strong>
    </div>
  );
}

export function belgeCariAlanIcerik(
  alanId: BelgeCariAlanId,
  cari: AdminCari,
  yer: 'ust' | 'alt'
): ReactNode {
  const kimlik = kimlikSatiri(cari);
  const efaturaSag = cari.efatura
    ? faturaTipiEtiketi(cari.efaturaTipi)
    : earsivTeslimEtiketi(cari.earsivTeslimSekli);
  const alis = fiyatOzet(cari.alisFiyatTanimi, cari.alisFiyatSecimi, 'alis');
  const satis = fiyatOzet(cari.satisFiyatTanimi, cari.satisFiyatSecimi, 'satis');

  if (yer === 'ust') {
    switch (alanId) {
      case 'cariTipi':
        return (
          <MetaKalem
            etiket={BELGE_CARI_ALAN_ETIKET.cariTipi}
            deger={`${cariTipiEtiketi(cari.cariTipi)} · ${cari.isletmeTuru === 'TUZEL' ? 'Tüzel' : 'Gerçek'}`}
          />
        );
      case 'kimlik':
        return <MetaKalem etiket={kimlik.baslik} deger={kimlik.deger} />;
      case 'efatura':
        return (
          <MetaGrup
            etiket={BELGE_CARI_ALAN_ETIKET.efatura}
            sol={cari.efatura ? 'Evet' : 'Hayır'}
            sag={efaturaSag}
          />
        );
      case 'eirsaliye':
        return (
          <MetaGrup etiket={BELGE_CARI_ALAN_ETIKET.eirsaliye} sol={cari.earsiv ? 'Evet' : 'Hayır'} />
        );
      case 'alisFiyat':
        return <MetaGrup etiket={BELGE_CARI_ALAN_ETIKET.alisFiyat} sol={alis.sol} sag={alis.sag} />;
      case 'satisFiyat':
        return <MetaGrup etiket={BELGE_CARI_ALAN_ETIKET.satisFiyat} sol={satis.sol} sag={satis.sag} />;
      case 'tabelaAdi':
        return <MetaKalem etiket={BELGE_CARI_ALAN_ETIKET.tabelaAdi} deger={cari.cariAdi} />;
      case 'unvan':
        return <MetaKalem etiket={BELGE_CARI_ALAN_ETIKET.unvan} deger={cari.unvan} />;
      case 'adres':
        return (
          <MetaKalem
            etiket={BELGE_CARI_ALAN_ETIKET.adres}
            deger={[cari.adres, cari.ilce, cari.il].filter(Boolean).join(', ')}
          />
        );
      case 'telefon':
        return <MetaKalem etiket={BELGE_CARI_ALAN_ETIKET.telefon} deger={cari.telefon} />;
      case 'gsm':
        return <MetaKalem etiket={BELGE_CARI_ALAN_ETIKET.gsm} deger={cari.gsm} />;
      case 'eposta':
        return <MetaKalem etiket={BELGE_CARI_ALAN_ETIKET.eposta} deger={cari.eposta} />;
      case 'web':
        return <MetaKalem etiket={BELGE_CARI_ALAN_ETIKET.web} deger={cari.web} />;
      default:
        return null;
    }
  }

  switch (alanId) {
    case 'cariTipi':
      return (
        <OzetItem
          etiket={BELGE_CARI_ALAN_ETIKET.cariTipi}
          deger={`${cariTipiEtiketi(cari.cariTipi)} · ${cari.isletmeTuru === 'TUZEL' ? 'Tüzel' : 'Gerçek'}`}
          genis
        />
      );
    case 'kimlik':
      return <OzetItem etiket={kimlik.baslik} deger={kimlik.deger} genis />;
    case 'efatura':
      return (
        <OzetItem
          etiket={BELGE_CARI_ALAN_ETIKET.efatura}
          deger={`${cari.efatura ? 'Evet' : 'Hayır'} · ${efaturaSag}`}
          genis
        />
      );
    case 'eirsaliye':
      return (
        <OzetItem
          etiket={BELGE_CARI_ALAN_ETIKET.eirsaliye}
          deger={cari.earsiv ? 'Evet' : 'Hayır'}
          genis
        />
      );
    case 'alisFiyat':
      return (
        <OzetItem
          etiket={BELGE_CARI_ALAN_ETIKET.alisFiyat}
          deger={`${alis.sol} · ${alis.sag}`}
          genis
        />
      );
    case 'satisFiyat':
      return (
        <OzetItem
          etiket={BELGE_CARI_ALAN_ETIKET.satisFiyat}
          deger={`${satis.sol} · ${satis.sag}`}
          genis
        />
      );
    case 'tabelaAdi':
      return <OzetItem etiket={BELGE_CARI_ALAN_ETIKET.tabelaAdi} deger={cari.cariAdi} genis />;
    case 'unvan':
      return <OzetItem etiket={BELGE_CARI_ALAN_ETIKET.unvan} deger={cari.unvan} genis />;
    case 'adres':
      return (
        <div className="fatura-musteri-ozet--tam">
          <span>{BELGE_CARI_ALAN_ETIKET.adres}</span>
          <strong>
            {[cari.adres, cari.ilce, cari.il].filter(Boolean).join(', ') || '—'}
          </strong>
        </div>
      );
    case 'telefon':
      return <OzetItem etiket={BELGE_CARI_ALAN_ETIKET.telefon} deger={cari.telefon} />;
    case 'gsm':
      return <OzetItem etiket={BELGE_CARI_ALAN_ETIKET.gsm} deger={cari.gsm} />;
    case 'eposta':
      return <OzetItem etiket={BELGE_CARI_ALAN_ETIKET.eposta} deger={cari.eposta} />;
    case 'web':
      return <OzetItem etiket={BELGE_CARI_ALAN_ETIKET.web} deger={cari.web} />;
    default:
      return null;
  }
}
