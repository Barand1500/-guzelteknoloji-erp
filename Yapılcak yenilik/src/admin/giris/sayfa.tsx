import { FormEvent, useState } from 'react';
import { useAuth } from '@/baglamlar/AuthContext';
import { UYGULAMA_ADI, UYGULAMA_KISA, BACKEND_YOK } from '@/yapilandirma/uygulama';
import { useAdminTema } from '@/baglamlar/AdminTemaContext';
import '@/stiller/adminTema.css';

export function GirisSayfasi() {
  const { girisYap } = useAuth();
  const { tema, temaDegistir, koyuMu } = useAdminTema();
  const [email, setEmail] = useState('admin@restorant.local');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function formGonder(e: FormEvent) {
    e.preventDefault();
    setHata('');
    setGonderiliyor(true);
    try {
      await girisYap(email, sifre);
    } catch (err) {
      setHata(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <div className="admin-panel relative flex min-h-screen items-center justify-center px-4" data-tema={tema}>
      <button
        type="button"
        onClick={temaDegistir}
        className="absolute right-4 top-4 rounded-lg border border-[var(--ap-border)] px-3 py-1.5 text-sm hover:bg-[var(--ap-hover)]"
        title={koyuMu ? 'Gündüz moduna geç' : 'Gece moduna geç'}
      >
        {koyuMu ? '☀️ Gündüz' : '🌙 Gece'}
      </button>

      <div className="ap-card w-full max-w-md rounded-xl border p-8 shadow-xl">
        <div className="mb-6 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
            {UYGULAMA_KISA}
          </span>
          <h1 className="ap-heading mt-4 text-xl font-bold">{UYGULAMA_ADI}</h1>
          <p className="ap-muted mt-1 text-sm">
            {BACKEND_YOK ? 'Gelistirme modu (offline)' : 'Yonetim paneline giris'}
          </p>
        </div>

        <form onSubmit={formGonder} className="space-y-4">
          <div>
            <label className="ap-muted mb-1 block text-sm">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="ap-input w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="ap-muted mb-1 block text-sm">Şifre</label>
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              required
              className="ap-input w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {hata && <p className="text-sm text-red-400">{hata}</p>}

          <button
            type="submit"
            disabled={gonderiliyor}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {gonderiliyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="ap-muted mt-6 text-center text-xs">
          {BACKEND_YOK
            ? 'Offline mod — herhangi bir sifre ile giris yapabilirsiniz.'
            : 'Varsayilan: admin@restorant.local / admin123'}
        </p>
      </div>
    </div>
  );
}
