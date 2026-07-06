import { useEffect } from 'react';
import { sistemAyarlariCoz, type SiteAyarlariOzet } from '@/admin/baslat-menusu/sistem/ayarlar/yardimci-sistem';

export function BakimEkrani({
  siteAdi,
  ayarlar,
  onizleme = false,
}: {
  siteAdi: string;
  ayarlar: SiteAyarlariOzet | null;
  onizleme?: boolean;
}) {
  const sistem = sistemAyarlariCoz(ayarlar);
  const anaRenk = ayarlar?.anaRenk ?? '#7c3aed';
  const ikincilRenk = ayarlar?.ikincilRenk ?? '#a78bfa';
  const logoUrl = ayarlar?.logoUrl;
  const slogan = ayarlar?.slogan;
  const email = ayarlar?.email;
  const telefon = ayarlar?.telefon;

  useEffect(() => {
    if (onizleme) return;
    const onceki = document.title;
    document.title = `${sistem.bakimBaslik ?? 'Bakım'} — ${siteAdi}`;
    return () => {
      document.title = onceki;
    };
  }, [onizleme, siteAdi, sistem.bakimBaslik]);

  return (
    <div
      className={`bakim-ekrani relative flex items-center justify-center overflow-hidden bg-slate-950 ${
        onizleme ? 'min-h-[420px] rounded-xl' : 'min-h-screen px-4 py-10'
      }`}
      style={{
        backgroundImage: `radial-gradient(circle at 20% 20%, ${anaRenk}33, transparent 45%), radial-gradient(circle at 80% 0%, ${ikincilRenk}44, transparent 40%), linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="bakim-ekrani-grid absolute inset-0" />
      </div>

      <div
        className={`relative z-10 w-full text-center ${
          onizleme ? 'max-w-sm px-4 py-6' : 'max-w-lg rounded-3xl border border-white/10 bg-white/5 px-8 py-10 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto mb-5 flex items-center justify-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={siteAdi} className="h-12 w-auto object-contain" />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${anaRenk}, ${ikincilRenk})` }}
            >
              🔧
            </div>
          )}
        </div>

        <div
          className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90"
          style={{ background: `${anaRenk}55`, border: `1px solid ${anaRenk}88` }}
        >
          <span className="bakim-ekrani-nabiz inline-block h-2 w-2 rounded-full bg-orange-400" />
          Bakım Modu Aktif
        </div>

        {sistem.bakimGorselUrl ? (
          <img
            src={sistem.bakimGorselUrl}
            alt=""
            className="mx-auto mb-5 h-28 max-w-full rounded-xl object-contain"
          />
        ) : null}

        <h1 className={`font-bold text-white ${onizleme ? 'text-lg' : 'text-2xl sm:text-3xl'}`}>
          {sistem.bakimBaslik ?? 'Bakım Çalışması'}
        </h1>

        <p className={`mt-3 leading-relaxed text-slate-300 ${onizleme ? 'text-xs' : 'text-sm sm:text-base'}`}>
          {sistem.bakimMesaji ?? 'Site geçici olarak bakımda. Lütfen daha sonra tekrar deneyin.'}
        </p>

        {sistem.bakimTahminiSure && (
          <p
            className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-orange-100"
            style={{ background: 'rgba(249, 115, 22, 0.18)', border: '1px solid rgba(249, 115, 22, 0.35)' }}
          >
            <span aria-hidden>⏱</span>
            Tahmini süre: {sistem.bakimTahminiSure}
          </p>
        )}

        {(email || telefon) && !onizleme && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-slate-300">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Acil iletişim</p>
            {telefon && <p>📞 {telefon}</p>}
            {email && <p className={telefon ? 'mt-1' : ''}>✉️ {email}</p>}
          </div>
        )}

        {slogan && (
          <p className={`text-slate-500 ${onizleme ? 'mt-4 text-[10px]' : 'mt-6 text-xs'}`}>{slogan}</p>
        )}

        <p className={`text-slate-500 ${onizleme ? 'mt-3 text-[10px]' : 'mt-4 text-[11px]'}`}>{siteAdi}</p>
      </div>
    </div>
  );
}
