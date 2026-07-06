import { useCallback, useMemo, useState } from 'react';
import { AdminModulKabuk, AdminPanelKarti } from '@/admin/ortak/AdminBilesenleri';
import { EFaturaFirmaPanel } from '@/admin/baslat-menusu/e-fatura-ayarlari/bilesenler/EFaturaFirmaPanel';
import { EFaturaServisPanel } from '@/admin/baslat-menusu/e-fatura-ayarlari/bilesenler/EFaturaServisPanel';
import type { EFaturaKayit, EFaturaSekme } from '@/admin/baslat-menusu/e-fatura-ayarlari/tipler';
import {
  eFaturaDegisenBolumler,
  eFaturaKaydiKaydet,
  eFaturaKaydiOku,
  eFaturaKayitEsit,
} from '@/admin/baslat-menusu/e-fatura-ayarlari/yardimci';
import { TanimlarGeciciUyari } from '@/admin/baslat-menusu/tanimlar/bilesenler/genel/TanimlarGeciciUyari';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';

const SEKMELER: { id: EFaturaSekme; etiket: string }[] = [
  { id: 'firma', etiket: 'Firma Bilgileri' },
  { id: 'servis', etiket: 'E Fatura / E Adisyon Servis Ayarları' },
];

function kayitKopyala(k: EFaturaKayit): EFaturaKayit {
  return JSON.parse(JSON.stringify(k)) as EFaturaKayit;
}

export function EFaturaAyarlariSayfa() {
  const { basariBildir } = useAdminSayfaBildirimi();
  const [kayit, setKayit] = useState<EFaturaKayit>(() => eFaturaKaydiOku());
  const [taslak, setTaslak] = useState<EFaturaKayit>(() => kayitKopyala(eFaturaKaydiOku()));
  const [sekme, setSekme] = useState<EFaturaSekme>('firma');
  const [uyari, setUyari] = useState<string | null>(null);

  const kirli = useMemo(() => !eFaturaKayitEsit(kayit, taslak), [kayit, taslak]);

  const sekmeDegistir = useCallback(
    (yeni: EFaturaSekme) => {
      if (yeni === sekme) return;
      if (kirli) {
        setUyari('Değişiklik yapıldı, kaydedilmedi.');
        return;
      }
      setSekme(yeni);
    },
    [sekme, kirli]
  );

  const kaydet = useCallback(() => {
    const degisenler = eFaturaDegisenBolumler(kayit, taslak);
    if (degisenler.length === 0) {
      basariBildir('Kaydedilecek değişiklik yok.', 'Bilgi');
      return;
    }
    eFaturaKaydiKaydet(taslak);
    setKayit(kayitKopyala(taslak));
    basariBildir(`Güncellenen bölümler: ${degisenler.join(', ')}`, 'E Fatura kaydedildi');
  }, [kayit, taslak, basariBildir]);

  useModulAksiyonlari(
    { kaydet },
    {
      kaydet: kirli,
      ekle: false,
      guncelle: false,
      sil: false,
      yayinla: false,
      onizle: false,
    },
    kirli
  );

  return (
    <AdminModulKabuk baslik="E Fatura Ayarları" aciklama="E-fatura entegrasyon ve gönderim ayarları" onizleGoster={false}>
      <AdminPanelKarti>
        {uyari && <TanimlarGeciciUyari mesaj={uyari} onTemizle={() => setUyari(null)} />}

        <section className="ap-efatura-modul">
          <h2 className="ap-tanimlar-hesap-pusula-baslik">E Fatura Ayarları</h2>
          <div className="ap-tanimlar-pusula-butonlar-yatay" role="tablist">
            {SEKMELER.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={sekme === s.id}
                className={`ap-eklenti-islem-btn ap-tanimlar-pusula-sekme-btn${sekme === s.id ? ' ap-tanimlar-pusula-sekme-btn-aktif' : ''}`}
                onClick={() => sekmeDegistir(s.id)}
              >
                {s.etiket}
              </button>
            ))}
          </div>

          <div className="ap-efatura-sekme-icerik">
            {sekme === 'firma' && (
              <EFaturaFirmaPanel
                ust={taslak.ust}
                firma={taslak.firma}
                onUstDegistir={(ust) => setTaslak((o) => ({ ...o, ust }))}
                onFirmaDegistir={(firma) => setTaslak((o) => ({ ...o, firma }))}
                onMukellefGuncelle={() => basariBildir('Mükellef bilgileri güncellendi (önizleme).', 'E Fatura')}
              />
            )}
            {sekme === 'servis' && (
              <EFaturaServisPanel
                servis={taslak.servis}
                onServisDegistir={(servis) => setTaslak((o) => ({ ...o, servis }))}
                onVeritabaniKur={() => basariBildir('Veri tabanı kurulumu başlatıldı (önizleme).', 'E Fatura')}
              />
            )}
          </div>
        </section>
      </AdminPanelKarti>
    </AdminModulKabuk>
  );
}
