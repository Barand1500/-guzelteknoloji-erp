import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { AdminSekmeler } from '@/admin/ortak/AdminFormBilesenleri';
import { TanimlarGeciciUyari } from '@/admin/baslat-menusu/tanimlar/bilesenler/genel/TanimlarGeciciUyari';
import { UYARI_KAYDEDILMEDI } from '@/admin/baslat-menusu/tanimlar/genel/veri';
import { BasitYaziciTablosu } from '@/admin/baslat-menusu/yazici-tanimlari/bilesenler/BasitYaziciTablosu';
import { MutfakYaziciTablosu } from '@/admin/baslat-menusu/yazici-tanimlari/bilesenler/MutfakYaziciTablosu';
import {
  YAZICI_SEKMELER,
  yaziciKaydiKopyala,
  yaziciKayitlariEsit,
  type YaziciSekme,
  type YaziciTanimlariKayit,
} from '@/admin/baslat-menusu/yazici-tanimlari/tipler';
import { yaziciTanimlariKaydet, yaziciTanimlariOku } from '@/admin/baslat-menusu/yazici-tanimlari/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

function sekmeBul(id: YaziciSekme) {
  return YAZICI_SEKMELER.find((s) => s.id === id) ?? YAZICI_SEKMELER[0];
}

export function YaziciTanimlariSayfasi() {
  const { basariBildir } = useAdminSayfaBildirimi();
  const [kayit, setKayit] = useState<YaziciTanimlariKayit>(() => yaziciTanimlariOku());
  const [sonKayitli, setSonKayitli] = useState<YaziciTanimlariKayit>(() => yaziciTanimlariOku());
  const [sekme, setSekme] = useState<YaziciSekme>('mutfak');
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [uyari, setUyari] = useState<string | null>(null);

  const kirli = useMemo(() => !yaziciKayitlariEsit(kayit, sonKayitli), [kayit, sonKayitli]);
  const aktifSekme = sekmeBul(sekme);

  const sekmeDegistir = useCallback(
    (yeni: YaziciSekme) => {
      if (yeni === sekme) return;
      if (kirli) {
        setUyari(UYARI_KAYDEDILMEDI);
        return;
      }
      setSekme(yeni);
      setSeciliId(null);
      setUyari(null);
    },
    [sekme, kirli]
  );

  const kaydet = useCallback(() => {
    yaziciTanimlariKaydet(kayit);
    setSonKayitli(yaziciKaydiKopyala(kayit));
    setUyari(null);
    basariBildir('Yazıcı tanımları kaydedildi.');
  }, [kayit, basariBildir]);

  useModulAksiyonlari({ kaydet }, { kaydet: kirli }, kirli);

  return (
    <AdminModulKabuk
      baslik="Yazıcı Tanımları"
      aciklama="Mutfak, pusula ve resmi adisyon çıktılarını yazıcıya yönlendirin"
      onizleGoster={false}
    >
      <div className="ap-yazici-tanim">
        <TanimlarGeciciUyari mesaj={uyari} onTemizle={() => setUyari(null)} />

        <AdminPanelKarti baslik={aktifSekme.etiket} altBaslik="Kaynak eşleşmesine göre yazıcı yönlendirme">
          <div className="ap-yazici-sekme-ust">
            <AdminSekmeler
              sekmeler={YAZICI_SEKMELER.map((s) => ({ id: s.id, etiket: s.etiket, ikon: s.ikon }))}
              aktif={sekme}
              onDegistir={sekmeDegistir}
            />
          </div>

          {sekme === 'mutfak' && (
            <MutfakYaziciTablosu
              kurallar={kayit.mutfak}
              seciliId={seciliId}
              onSec={setSeciliId}
              onDegistir={(mutfak) => setKayit((k) => ({ ...k, mutfak }))}
            />
          )}

          {sekme === 'pusula' && (
            <BasitYaziciTablosu
              aciklama="Hangi bilgisayar ve garson için hangi pusula yazıcısı kullanılacak?"
              varsayilanYazici="PUSULA"
              kurallar={kayit.pusula}
              seciliId={seciliId}
              onSec={setSeciliId}
              onDegistir={(pusula) => setKayit((k) => ({ ...k, pusula }))}
            />
          )}

          {sekme === 'resmi-adisyon' && (
            <BasitYaziciTablosu
              aciklama="Resmi adisyon çıktısı için bilgisayar ve garson bazlı yazıcı eşleştirmesi"
              varsayilanYazici="ADISYON"
              kurallar={kayit.resmiAdisyon}
              seciliId={seciliId}
              onSec={setSeciliId}
              onDegistir={(resmiAdisyon) => setKayit((k) => ({ ...k, resmiAdisyon }))}
            />
          )}

          <p className="ap-yazici-not">
            <strong>Not:</strong> Garson veya ürün alanında <code>*</code> (Tümü) kullanıldığında tüm garsonlar
            veya tüm ürünler kastedilir. Kurallar yukarıdan aşağıya değerlendirilir; en üstteki eşleşme uygulanır.
          </p>
        </AdminPanelKarti>
      </div>
    </AdminModulKabuk>
  );
}
