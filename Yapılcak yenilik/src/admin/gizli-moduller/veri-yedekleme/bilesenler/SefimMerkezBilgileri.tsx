import { useCallback, useMemo, useState } from 'react';
import { formInputSinifi } from '@/formlar/FormAlani';
import type { SefimMerkezKayit } from '@/admin/gizli-moduller/veri-yedekleme/merkezBilgileri/tipler';
import {
  sefimMerkezBaglantiGecerli,
  sefimMerkezKaydiKaydet,
  sefimMerkezKaydiOku,
  sefimMerkezKayitEsit,
} from '@/admin/gizli-moduller/veri-yedekleme/merkezBilgileri/yardimci';
import { useAdminSayfaBildirimi } from '@/kancalar/useAdminSayfaBildirimi';
import { useSekmeKirli } from '@/kancalar/useSekmeKirli';

function kayitKopyala(k: SefimMerkezKayit): SefimMerkezKayit {
  return { ...k };
}

export function SefimMerkezBilgileri() {
  const { basariBildir, hataBildir } = useAdminSayfaBildirimi();
  const [kayit, setKayit] = useState<SefimMerkezKayit>(() => sefimMerkezKaydiOku());
  const [taslak, setTaslak] = useState<SefimMerkezKayit>(() => kayitKopyala(sefimMerkezKaydiOku()));
  const [sinaniyor, setSinaniyor] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const kirli = useMemo(() => !sefimMerkezKayitEsit(kayit, taslak), [kayit, taslak]);
  useSekmeKirli(kirli);

  const kaydet = useCallback(() => {
    if (!sefimMerkezBaglantiGecerli(taslak)) {
      hataBildir('Sunucu IP, kullanıcı adı ve veritabanı adı zorunludur.');
      return;
    }
    if (!kirli) {
      basariBildir('Kaydedilecek değişiklik yok.', 'Bilgi');
      return;
    }

    setKaydediliyor(true);
    window.setTimeout(() => {
      sefimMerkezKaydiKaydet(taslak);
      setKayit(kayitKopyala(taslak));
      setKaydediliyor(false);
      basariBildir('Şefim merkez bilgileri kaydedildi.');
    }, 220);
  }, [taslak, kirli, basariBildir, hataBildir]);

  const sina = useCallback(() => {
    if (!sefimMerkezBaglantiGecerli(taslak)) {
      hataBildir('Bağlantıyı sınamak için sunucu IP, kullanıcı adı ve veritabanı girin.');
      return;
    }

    setSinaniyor(true);
    window.setTimeout(() => {
      setSinaniyor(false);
      basariBildir(
        `${taslak.sunucuIp} / ${taslak.veritabaniAdi} merkez bağlantısı başarılı.`,
        'Bağlantı sınandı'
      );
    }, 750);
  }, [taslak, basariBildir, hataBildir]);

  const alan = (key: keyof SefimMerkezKayit, etiket: string, tip: 'text' | 'password' = 'text') => (
    <label className="ap-sefim-merkez-alan">
      <span className="ap-sefim-merkez-etiket">{etiket}</span>
      <input
        type={tip}
        className={formInputSinifi}
        value={String(taslak[key])}
        onChange={(e) => setTaslak({ ...taslak, [key]: e.target.value })}
        autoComplete={tip === 'password' ? 'off' : 'on'}
      />
    </label>
  );

  return (
    <section className="ap-card ap-sefim-merkez-kart space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="ap-heading text-lg font-semibold">Şefim Merkez Bilgileri</h2>
        <p className="ap-muted mt-1 text-sm">
          Merkez veritabanı bağlantı ayarları ve tam veri aktarım tercihi
        </p>
      </div>

      <div className="ap-sefim-merkez-alanlar">
        <div className="ap-sefim-merkez-satir">
          {alan('sunucuIp', 'Sunucu IP')}
          {alan('kullaniciAdi', 'Kullanıcı Adı')}
        </div>
        <div className="ap-sefim-merkez-satir">
          {alan('kullaniciParola', 'Kullanıcı Parola', 'password')}
          {alan('veritabaniAdi', 'Veritabanı Adı')}
        </div>
      </div>

      <label className="ap-sefim-merkez-secenek">
        <input
          type="checkbox"
          className="ap-tartilacak-checkbox"
          checked={taslak.tamVeriAktarimi}
          onChange={(e) => setTaslak({ ...taslak, tamVeriAktarimi: e.target.checked })}
        />
        <span>Tam Veri Aktarımı Yapılsın</span>
      </label>

      <footer className="ap-sefim-merkez-alt">
        <button
          type="button"
          className="ap-eklenti-islem-btn ap-eklenti-islem-btn-ikincil"
          onClick={sina}
          disabled={sinaniyor || kaydediliyor}
        >
          {sinaniyor ? 'Sınanıyor…' : 'Sına'}
        </button>
        <button
          type="button"
          className="ap-eklenti-islem-btn ap-eklenti-islem-btn-birincil"
          onClick={kaydet}
          disabled={kaydediliyor || sinaniyor}
        >
          {kaydediliyor ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </footer>
    </section>
  );
}
