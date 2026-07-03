import { useCallback, useEffect, useMemo, useState } from 'react';
import { useModulAksiyonlari } from '@/kancalar/useModulAksiyonlari';
import { adminLogApi, type AdminLogKayit } from '@/admin/ortak/api/adminSistemApi';
import {
  logAramaEslesir,
  logGoreliZaman,
  logIslemEtiket,
  logIslemIkon,
  logIslemSinif,
  logIslemTuruBul,
  logKullaniciAdi,
  logKullaniciBasHarf,
  logMesajiAyikla,
  logSaatFormat,
  logTamTarihFormat,
  logOzetCumle,
  loglariGrupla,
  type LogIslemTuru,
} from './logYardimci';

const ISLEM_FILTRELERI: { id: LogIslemTuru | 'tumu'; ad: string }[] = [
  { id: 'tumu', ad: 'Tümü' },
  { id: 'kaydet', ad: 'Kaydet' },
  { id: 'ekle', ad: 'Yeni Ekle' },
  { id: 'sil', ad: 'Sil' },
  { id: 'guncelle', ad: 'Güncelle' },
  { id: 'diger', ad: 'Diğer' },
];

export function LoglarSayfasi() {
  const [loglar, setLoglar] = useState<AdminLogKayit[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [temizleniyor, setTemizleniyor] = useState(false);
  const [arama, setArama] = useState('');
  const [islemFiltre, setIslemFiltre] = useState<LogIslemTuru | 'tumu'>('tumu');
  const [kullaniciFiltre, setKullaniciFiltre] = useState('tumu');

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      setLoglar(await adminLogApi.listele());
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Loglar alınamadı');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const temizle = useCallback(async () => {
    if (!confirm('Saklama süresini aşan eski log kayıtları temizlenecek. Devam edilsin mi?')) return;
    setTemizleniyor(true);
    try {
      await adminLogApi.temizle();
      await yukle();
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Temizleme başarısız');
    } finally {
      setTemizleniyor(false);
    }
  }, [yukle]);

  useModulAksiyonlari({ sil: temizle }, { sil: loglar.length > 0 && !temizleniyor });

  const kullanicilar = useMemo(() => {
    const set = new Map<string, string>();
    for (const log of loglar) {
      const anahtar = log.kullaniciEmail ?? log.kullaniciId ?? 'bilinmeyen';
      set.set(anahtar, logKullaniciAdi(log));
    }
    return Array.from(set.entries()).sort((a, b) => a[1].localeCompare(b[1], 'tr'));
  }, [loglar]);

  const filtrelenmis = useMemo(() => {
    return loglar.filter((log) => {
      const ozet = logMesajiAyikla(log.mesaj);
      const tur = logIslemTuruBul(ozet);
      if (islemFiltre !== 'tumu' && tur !== islemFiltre) return false;
      if (kullaniciFiltre !== 'tumu') {
        const anahtar = log.kullaniciEmail ?? log.kullaniciId ?? 'bilinmeyen';
        if (anahtar !== kullaniciFiltre) return false;
      }
      return logAramaEslesir(log, arama, ozet);
    });
  }, [loglar, arama, islemFiltre, kullaniciFiltre]);

  const gruplar = useMemo(() => loglariGrupla(filtrelenmis), [filtrelenmis]);

  const istatistik = useMemo(() => {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    const bugunku = loglar.filter((l) => new Date(l.kayitTarihi) >= bugun).length;
    const kullaniciSet = new Set(
      loglar.map((l) => l.kullaniciEmail ?? l.kullaniciId).filter(Boolean)
    );
    return { toplam: loglar.length, bugunku, kullanici: kullaniciSet.size };
  }, [loglar]);

  return (
    <div className="ap-log-sayfa">
      <div className="ap-log-ust">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="ap-heading text-xl font-bold">Log Takibi</h1>
            <p className="ap-muted mt-1 text-sm">
              Kimin hangi modülde ne yaptığını buradan takip edin.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void yukle()}
            disabled={yukleniyor}
            className="ap-log-yenile-btn"
          >
            {yukleniyor ? 'Yenileniyor...' : 'Yenile'}
          </button>
        </div>

        <div className="ap-log-istatistik-grid">
        <div className="ap-log-istatistik-kart">
          <span className="ap-log-istatistik-etiket">Toplam kayıt</span>
          <strong className="ap-log-istatistik-deger">{istatistik.toplam}</strong>
        </div>
        <div className="ap-log-istatistik-kart ap-log-istatistik-kart-mavi">
          <span className="ap-log-istatistik-etiket">Bugün</span>
          <strong className="ap-log-istatistik-deger">{istatistik.bugunku}</strong>
        </div>
        <div className="ap-log-istatistik-kart ap-log-istatistik-kart-mor">
          <span className="ap-log-istatistik-etiket">Aktif kullanıcı</span>
          <strong className="ap-log-istatistik-deger">{istatistik.kullanici}</strong>
        </div>
        <div className="ap-log-istatistik-kart ap-log-istatistik-kart-yesil">
          <span className="ap-log-istatistik-etiket">Gösterilen</span>
          <strong className="ap-log-istatistik-deger">{filtrelenmis.length}</strong>
        </div>
      </div>

      <section className="ap-card ap-log-filtre-kart rounded-xl border p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="ap-log-arama-wrap">
            <span className="ap-log-arama-ikon" aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Kullanıcı, modül veya işlem ara..."
              className="ap-log-arama-input"
            />
          </div>
          <select
            className="ap-log-select"
            value={islemFiltre}
            onChange={(e) => setIslemFiltre(e.target.value as LogIslemTuru | 'tumu')}
          >
            {ISLEM_FILTRELERI.map((f) => (
              <option key={f.id} value={f.id}>
                İşlem: {f.ad}
              </option>
            ))}
          </select>
          <select
            className="ap-log-select"
            value={kullaniciFiltre}
            onChange={(e) => setKullaniciFiltre(e.target.value)}
          >
            <option value="tumu">Kullanıcı: Tümü</option>
            {kullanicilar.map(([id, ad]) => (
              <option key={id} value={id}>
                {ad}
              </option>
            ))}
          </select>
        </div>
      </section>
      </div>

      <div className="ap-log-icerik">
      {hata && (
        <div className="ap-bildirim ap-bildirim-hata rounded-xl px-4 py-3 text-sm">{hata}</div>
      )}

      {yukleniyor ? (
        <div className="ap-log-bos-durum ap-log-bos-durum-tam">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--ap-accent)] border-t-transparent" />
          <p className="ap-muted mt-3 text-sm">Loglar yükleniyor...</p>
        </div>
      ) : filtrelenmis.length === 0 ? (
        <div className="ap-log-bos-durum ap-log-bos-durum-tam ap-card rounded-xl border">
          <span className="text-4xl" aria-hidden>
            📜
          </span>
          <p className="ap-heading mt-3 font-medium">
            {loglar.length === 0 ? 'Henüz log kaydı yok' : 'Filtreye uygun kayıt bulunamadı'}
          </p>
          <p className="ap-muted mt-1 text-sm">
            Panelde kaydet, sil veya modül açma gibi işlemler otomatik buraya düşer.
          </p>
        </div>
      ) : (
        <div className="ap-log-zaman-cizgisi space-y-6">
          {gruplar.map(({ grup, kayitlar }) => (
            <section key={grup}>
              <h2 className="ap-log-grup-baslik">{grup}</h2>
              <div className="ap-log-kayit-liste">
                {kayitlar.map((log) => (
                  <LogKayitSatiri key={log.id} log={log} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {temizleniyor && (
        <p className="ap-muted text-center text-xs">Eski kayıtlar temizleniyor...</p>
      )}
      </div>
    </div>
  );
}

function LogKayitSatiri({ log }: { log: AdminLogKayit }) {
  const ozet = logMesajiAyikla(log.mesaj);
  const tur = logIslemTuruBul(ozet);
  const kullanici = logKullaniciAdi(log);

  return (
    <article className="ap-log-kayit">
      <div className={`ap-log-kayit-ikon ${logIslemSinif(tur)}`} aria-hidden>
        {logIslemIkon(tur)}
      </div>

      <div className="ap-log-kayit-govde">
        <div className="ap-log-kayit-ust">
          <div className="ap-log-kullanici">
            <span className="ap-log-avatar">{logKullaniciBasHarf(log)}</span>
            <div className="min-w-0">
              <p className="ap-log-kullanici-ad">{kullanici}</p>
              {log.kullaniciEmail && (
                <p className="ap-log-kullanici-email">{log.kullaniciEmail}</p>
              )}
            </div>
          </div>
          <div className="ap-log-zaman" title={logTamTarihFormat(log.kayitTarihi)}>
            <span className="ap-log-zaman-saat">{logSaatFormat(log.kayitTarihi)}</span>
            <span className="ap-log-zaman-goreli">{logGoreliZaman(log.kayitTarihi)}</span>
          </div>
        </div>

        <p className="ap-log-ozet-cumle">{logOzetCumle(ozet, tur)}</p>

        <div className="ap-log-meta">
          <span className={`ap-log-etiket ${logIslemSinif(tur)}`}>{logIslemEtiket(tur)}</span>
          {ozet.modulId && <span className="ap-log-etiket ap-log-etiket-notr">{ozet.modulId}</span>}
          {log.ipAdresi && <span className="ap-log-etiket ap-log-etiket-ip">IP: {log.ipAdresi}</span>}
        </div>
      </div>
    </article>
  );
}
