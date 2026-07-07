import { tokenAl } from '@/admin/ortak/api/authApi';
import { adminHeaders, adminJsonFetch } from '@/admin/ortak/api/adminFetch';
import type { YedeklemeFormati } from '@/types/yedekleme';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export interface AdminLogKayit {
  id: string;
  kullaniciId?: string | null;
  mesaj: string;
  ipAdresi?: string | null;
  kayitTarihi: string;
  kullaniciAd?: string | null;
  kullaniciEmail?: string | null;
}

export interface LogKaydetPayload {
  mesaj: string;
}

export interface YedekKaydi {
  id: string;
  kullaniciId: string | null;
  kullaniciAd: string;
  kullaniciEmail: string;
  dosyaAdi: string;
  tip: string;
  olusturma: string;
}

export const adminLogApi = {
  async listele(): Promise<AdminLogKayit[]> {
    const veri = await adminJsonFetch<{ loglar: AdminLogKayit[] }>('/loglar', {
      headers: adminHeaders(),
    });
    return veri.loglar;
  },

  async kaydet(payload: LogKaydetPayload): Promise<void> {
    await adminJsonFetch('/loglar', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(payload),
    });
  },

  async temizle(): Promise<void> {
    await adminJsonFetch('/loglar/temizle', {
      method: 'DELETE',
      headers: adminHeaders(),
    });
  },
};

export interface YedekIndirSecenekleri {
  dosyaAdi?: string;
  format?: YedeklemeFormati;
}

export const adminYedekApi = {
  varsayilanDosyaAdi: () =>
    adminJsonFetch<{ dosyaAdi: string }>('/yedek/varsayilan-dosya-adi', {
      headers: adminHeaders(),
    }),

  gecmis: () =>
    adminJsonFetch<{ kayitlar: YedekKaydi[]; sonKayit: YedekKaydi | null }>('/yedek/gecmis', {
      headers: adminHeaders(),
    }),

  async indir(secenekler?: YedekIndirSecenekleri): Promise<void> {
    const token = tokenAl();
    if (!token) throw new Error('Oturum bulunamadi');

    const format = secenekler?.format ?? 'json';
    const yanit = await fetch(`${API_URL}/admin/yedek/indir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(secenekler ? { ...secenekler, format } : { format }),
    });

    if (!yanit.ok) {
      const veri = await yanit.json().catch(() => ({}));
      throw new Error((veri as { mesaj?: string }).mesaj ?? 'Yedek indirilemedi');
    }

    const blob = await yanit.blob();
    const disposition = yanit.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="(.+)"/);
    const ad =
      match?.[1] ??
      secenekler?.dosyaAdi ??
      `yedek-admin-${new Date().toISOString().slice(0, 10)}.${format}`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ad;
    a.click();
    URL.revokeObjectURL(url);
  },

  async geriYukle(dosya: File, dosyaAdi?: string): Promise<void> {
    const token = tokenAl();
    if (!token) throw new Error('Oturum bulunamadi');

    const form = new FormData();
    form.append('dosya', dosya);
    if (dosyaAdi) form.append('dosyaAdi', dosyaAdi);

    const yanit = await fetch(`${API_URL}/admin/yedek/geri-yukle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!yanit.ok) {
      const veri = await yanit.json().catch(() => ({}));
      throw new Error((veri as { mesaj?: string }).mesaj ?? 'Geri yukleme basarisiz');
    }
  },
};
