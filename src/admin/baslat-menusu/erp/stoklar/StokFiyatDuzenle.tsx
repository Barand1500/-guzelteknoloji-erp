import { useCallback, useMemo, useRef, useState } from 'react';
import { TanimDuzenleEkrani } from '@/admin/baslat-menusu/tanimlar/bilesenler/TanimDuzenleEkrani';
import { DataGrid } from '@/admin/ortak/datagrid/DataGrid';
import { sayiFormatla } from '@/admin/ortak/datagrid/formatYardimci';
import type { KolonTanimi } from '@/admin/ortak/datagrid/types';
import { FormAcilirSecim } from '@/formlar/FormAcilirSecim';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useYetkiler } from '@/kancalar/useYetkiler';
import {
  digerFiyatlariHesapla,
  fiyatDuzenleCarpanYaz,
  fiyatDuzenleFiyatYaz,
  fiyatDuzenleKdvTipiYaz,
  fiyatDuzenleKdvYaz,
  fiyatDuzenlePbYaz,
  fiyatDuzenleSatirGuncelle,
  kdvTipiEtiketi,
} from './fiyatDuzenleYardimci';
import {
  ISARETLI_FIYAT_ALANLARI,
  STOK_FIYAT_KDV_TIPI_SECENEKLERI,
  STOK_FIYAT_PB_SECENEKLERI,
  type IsaretliFiyatAlani,
  type StokFiyatDuzenleSatir,
} from './fiyatDuzenleTipler';
import { stokFiyatBarkodUret, stokFiyatDuzenleOrnekVeri } from './fiyatDuzenleVeri';
import { StoklarSagTikMenu } from './StoklarSagTikMenu';
import type { AdminStok } from './tipler';

function fiyatPbKolon(
  fiyatAlan: IsaretliFiyatAlani,
  pbAlan: 'pb1' | 'pb2' | 'pb3' | 'pb4' | 'pb5',
  sira: number
): KolonTanimi<StokFiyatDuzenleSatir>[] {
  return [
    {
      id: fiyatAlan,
      baslik: `${sira}. Satış Fiyatı`,
      tip: 'para',
      genislik: 108,
      minGenislik: 92,
      paraSembolu: false,
      duzenlenebilir: true,
      formulaTip: 'sayi',
      siralama: true,
      degerAl: (s) => s[fiyatAlan],
      siralamaDegeri: (s) => s[fiyatAlan] ?? -1,
      degerYaz: (s, d) => fiyatDuzenleFiyatYaz(s, fiyatAlan, d),
      goster: (s) => (s[fiyatAlan] === null ? '' : sayiFormatla(s[fiyatAlan]!)),
    },
    {
      id: pbAlan,
      baslik: `PB${sira}`,
      tip: 'badge',
      genislik: 52,
      minGenislik: 48,
      duzenlenebilir: true,
      secenekler: STOK_FIYAT_PB_SECENEKLERI.map((x) => ({ deger: x.deger, etiket: x.etiket })),
      siralama: true,
      degerAl: (s) => s[pbAlan],
      siralamaDegeri: (s) => s[pbAlan],
      degerYaz: (s, d) => fiyatDuzenlePbYaz(s, pbAlan, d),
      goster: (s) => <span className="stok-fiyat-duzenle-pb">{s[pbAlan]}</span>,
    },
  ];
}

function fiyatDuzenleKolonlari(): KolonTanimi<StokFiyatDuzenleSatir>[] {
  return [
    {
      id: 'fiyatAdi',
      baslik: 'Fiyat Adı',
      tip: 'metin',
      genislik: 92,
      minGenislik: 80,
      zorunlu: true,
      duzenlenebilir: true,
      siralama: true,
      degerAl: (s) => s.fiyatAdi,
      degerYaz: (s, d) => fiyatDuzenleSatirGuncelle(s, { fiyatAdi: String(d).trim() || s.fiyatAdi }),
    },
    {
      id: 'birim',
      baslik: 'Birim',
      tip: 'metin',
      genislik: 72,
      duzenlenebilir: true,
      siralama: true,
      degerAl: (s) => s.birim,
      degerYaz: (s, d) => fiyatDuzenleSatirGuncelle(s, { birim: String(d).trim() || s.birim }),
    },
    {
      id: 'carpan',
      baslik: 'Çarpan',
      tip: 'metin',
      genislik: 64,
      duzenlenebilir: true,
      formulaTip: 'sayi',
      siralama: true,
      degerAl: (s) => s.carpan,
      siralamaDegeri: (s) => s.carpan,
      degerYaz: (s, d) => fiyatDuzenleCarpanYaz(s, d),
      goster: (s) => String(s.carpan),
    },
    {
      id: 'barkod',
      baslik: 'Barkod',
      tip: 'metin',
      genislik: 120,
      minGenislik: 96,
      duzenlenebilir: true,
      siralama: true,
      degerAl: (s) => s.barkod,
      degerYaz: (s, d) => fiyatDuzenleSatirGuncelle(s, { barkod: String(d).trim() }),
    },
    {
      id: 'kdv',
      baslik: 'Kdv',
      tip: 'metin',
      genislik: 56,
      duzenlenebilir: true,
      formulaTip: 'sayi',
      siralama: true,
      degerAl: (s) => s.kdv,
      siralamaDegeri: (s) => s.kdv,
      degerYaz: (s, d) => fiyatDuzenleKdvYaz(s, d),
      goster: (s) => String(s.kdv),
    },
    {
      id: 'kdvTipi',
      baslik: 'K.',
      baslikIpucu: 'KDV dahil / hariç',
      tip: 'badge',
      genislik: 52,
      minGenislik: 48,
      duzenlenebilir: true,
      secenekler: STOK_FIYAT_KDV_TIPI_SECENEKLERI.map((x) => ({ deger: x.deger, etiket: x.etiket })),
      siralama: true,
      degerAl: (s) => s.kdvTipi,
      siralamaDegeri: (s) => s.kdvTipi,
      degerYaz: (s, d) => fiyatDuzenleKdvTipiYaz(s, d),
      goster: (s) => (
        <span className="stok-fiyat-duzenle-kdv-tip">{kdvTipiEtiketi(s.kdvTipi)}</span>
      ),
    },
    ...fiyatPbKolon('satisFiyati1', 'pb1', 1),
    ...fiyatPbKolon('satisFiyati2', 'pb2', 2),
    ...fiyatPbKolon('satisFiyati3', 'pb3', 3),
    ...fiyatPbKolon('satisFiyati4', 'pb4', 4),
    ...fiyatPbKolon('satisFiyati5', 'pb5', 5),
  ];
}

export function StokFiyatDuzenle({
  stok,
  onGeri,
  onYeni,
  onDuzenle,
  onIncele,
  onGorunumDuzenle,
  onGorunumKaydet,
}: {
  stok: AdminStok;
  onGeri: () => void;
  onYeni: () => void;
  onDuzenle: () => void;
  onIncele: () => void;
  onGorunumDuzenle?: () => void;
  onGorunumKaydet?: () => void;
}) {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const { eklemeVar, duzenlemeVar } = useYetkiler('stoklar');
  const tabloRef = useRef<HTMLDivElement | null>(null);
  const [satirlar, setSatirlar] = useState(() => stokFiyatDuzenleOrnekVeri(stok));
  const [seciliIdler, setSeciliIdler] = useState<string[]>([]);
  const [isaretliAlan, setIsaretliAlan] = useState<IsaretliFiyatAlani>('satisFiyati1');
  const [otomatikBarkod, setOtomatikBarkod] = useState(false);

  const kolonlar = useMemo(() => fiyatDuzenleKolonlari(), []);

  const digerFiyatlariHesaplaTus = useCallback(() => {
    const hedefIdler = seciliIdler.length ? seciliIdler : undefined;
    const guncel = digerFiyatlariHesapla(satirlar, isaretliAlan, hedefIdler);
    const bazVar = guncel.some(
      (s) =>
        (!hedefIdler || hedefIdler.includes(s.id)) &&
        s[isaretliAlan] !== null &&
        Number.isFinite(s[isaretliAlan]!)
    );
    if (!bazVar) {
      hataBildir('Hesaplama için işaretli alanda fiyat girin.');
      return;
    }
    setSatirlar(guncel);
    basariBildir('Diğer satış fiyatları hesaplandı.', 'Stok Fiyat Düzenle');
  }, [basariBildir, hataBildir, isaretliAlan, satirlar, seciliIdler]);

  const barkodUret = useCallback(() => {
    const hedefIdler = seciliIdler.length ? seciliIdler : satirlar.map((s) => s.id);
    setSatirlar((mevcut) =>
      mevcut.map((satir, index) => {
        if (!hedefIdler.includes(satir.id)) return satir;
        return fiyatDuzenleSatirGuncelle(satir, {
          barkod: stokFiyatBarkodUret(stok, satir.carpan, index + 1),
        });
      })
    );
    basariBildir('Barkod üretildi.', 'Stok Fiyat Düzenle');
  }, [basariBildir, satirlar, seciliIdler, stok]);

  return (
    <div className="stok-karti-kabuk stok-fiyat-duzenle-sayfa">
      <TanimDuzenleEkrani
        ustEtiket="Stok Fiyat Düzenle"
        baslik={`${stok.urunKodu} — ${stok.urunAdi}`}
        altBaslik={`Aşağıda ${stok.urunKodu} stoğunun fiyatlarını girebilirsiniz. Herhangi bir fiyat üzerinde iken hesapla butonuna basarsanız ilgili fiyat baz alınarak diğer fiyatlar hesaplanacaktır.`}
        rozet="Fiyat"
        onGeri={onGeri}
      >
        <div className="stok-karti-icerik ap-scroll stok-fiyat-duzenle-sayfa-icerik">
          <div className="stok-fiyat-duzenle-icerik">
            <p className="stok-fiyat-duzenle-bolum-baslik">Fiyat Listesi</p>

            <div ref={tabloRef} className="stok-fiyat-duzenle-tablo stok-fiyat-duzenle-tablo--sayfa dg-demo-sag-tik-alan">
              <StoklarSagTikMenu
                konteynerRef={tabloRef}
                eklemeVar={eklemeVar}
                duzenlemeVar={duzenlemeVar}
                onYeni={onYeni}
                onDuzenle={() => onDuzenle()}
                onIncele={() => onIncele()}
                onSatirSec={(id) => setSeciliIdler([id])}
                onGorunumDuzenle={onGorunumDuzenle ?? (() => undefined)}
                onGorunumKaydet={onGorunumKaydet ?? (() => undefined)}
              />
              <DataGrid
                key={`stok_fiyat_duzenle_${stok.id}`}
                tabloBaslik="Fiyat Listesi"
                tabloAltBaslik="Stok birim fiyatları"
                kolonlar={kolonlar}
                satirlar={satirlar}
                depolamaAnahtari={`stok_fiyat_duzenle_${stok.id}`}
                bosMesaj="Bu stok için fiyat satırı bulunamadı."
                onSatirlarDegistir={setSatirlar}
                onSatirTikla={(s) => setSeciliIdler([s.id])}
                onSecimDegistir={setSeciliIdler}
                satirSinifAdi={(s) =>
                  seciliIdler.includes(s.id) ? 'dg-satir--secili-manuel' : undefined
                }
                formulMenuGoster={false}
              />
            </div>

            <div className="stok-fiyat-duzenle-alt stok-fiyat-duzenle-alt--sayfa">
              <div className="stok-fiyat-duzenle-alt-sol">
                <button type="button" className="stoklar-hizli-ara-tus" onClick={digerFiyatlariHesaplaTus}>
                  Diğer Fiyatları Hesapla
                </button>
                <button type="button" className="ap-tanimlar-duzenle-geri" onClick={barkodUret}>
                  Barkod Üret
                </button>
              </div>
              <div className="stok-fiyat-duzenle-alt-orta">
                <label className="stok-fiyat-duzenle-isaretli-alan">
                  <span>İşaretli Alan:</span>
                  <FormAcilirSecim
                    value={isaretliAlan}
                    onChange={(v) => setIsaretliAlan(v as IsaretliFiyatAlani)}
                    secenekler={ISARETLI_FIYAT_ALANLARI.map((x) => ({ ...x }))}
                    aria-label="İşaretli alan"
                  />
                </label>
                <label className="stok-fiyat-duzenle-otomatik-barkod">
                  <input
                    type="checkbox"
                    checked={otomatikBarkod}
                    onChange={(e) => setOtomatikBarkod(e.target.checked)}
                  />
                  <span>Yeni fiyatlara barkodu otomatik yaz</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </TanimDuzenleEkrani>
    </div>
  );
}
