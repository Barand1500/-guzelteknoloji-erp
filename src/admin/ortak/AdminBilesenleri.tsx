import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { AdminSiteOnizleLink } from '@/admin/kabuk/AdminSiteOnizleLink';
import { adminIslemBildirimi } from '@/araclar/adminBildirimOlaylari';

interface AdminModulKabukProps {
  baslik?: ReactNode;
  aciklama?: string;
  children: ReactNode;
  onizleGoster?: boolean;
  ustAksiyon?: ReactNode;
}

export function AdminModulKabuk({
  baslik,
  aciklama,
  children,
  onizleGoster = false,
  ustAksiyon,
}: AdminModulKabukProps) {
  const baslikMetin = typeof baslik === 'string' ? baslik.trim() : baslik;
  const baslikVar = Boolean(baslikMetin || aciklama?.trim() || ustAksiyon || onizleGoster);
  return (
    <div className="ap-modul-kabuk w-full min-w-0" data-ap-kesif="modul-kabuk">
      {baslikVar ? (
        <div className="ap-modul-baslik">
          <div>
            {typeof baslik === 'string' || typeof baslik === 'number' ? (
              baslik.toString().trim() ? (
                <h1 className="ap-heading text-xl font-bold">{baslik}</h1>
              ) : null
            ) : (
              baslik
            )}
            {aciklama && <p className="ap-muted mt-1 text-sm">{aciklama}</p>}
          </div>
          <div className="flex items-center gap-2">
            {ustAksiyon}
            {onizleGoster && <AdminSiteOnizleLink />}
          </div>
        </div>
      ) : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function AdminPanelKarti({
  children,
  baslik,
  altBaslik,
  ustAksiyon,
}: {
  children: ReactNode;
  baslik?: string;
  altBaslik?: string;
  ustAksiyon?: ReactNode;
}) {
  return (
    <div className="ap-panel-kart">
      {(baslik || altBaslik || ustAksiyon) && (
        <div className="ap-panel-kart-baslik ap-panel-kart-baslik--aksiyonlu">
          <div className="min-w-0">
            {baslik && <h2 className="ap-heading text-sm font-semibold">{baslik}</h2>}
            {altBaslik && <p className="ap-muted text-xs">{altBaslik}</p>}
          </div>
          {ustAksiyon && <div className="ap-panel-kart-ust-aksiyon shrink-0">{ustAksiyon}</div>}
        </div>
      )}
      <div className="ap-panel-kart-icerik">{children}</div>
    </div>
  );
}

export function YukleniyorDurumu({ mesaj = 'Yükleniyor...' }: { mesaj?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20" data-ap-kesif="modul-yukleniyor">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--ap-accent)] border-t-transparent" />
      <span className="ap-muted text-sm">{mesaj}</span>
    </div>
  );
}

export function HataDurumu({ mesaj }: { mesaj: string }) {
  return (
    <div className="ap-bildirim ap-bildirim-hata rounded-xl p-4">{mesaj}</div>
  );
}

export function BildirimKutusu({
  mesaj,
  tur,
}: {
  mesaj: string;
  tur: 'hata' | 'bilgi' | 'basari';
}) {
  const sonMesajRef = useRef('');

  useEffect(() => {
    if (!mesaj || tur === 'bilgi') return;
    const anahtar = `${tur}:${mesaj}`;
    if (sonMesajRef.current === anahtar) return;
    sonMesajRef.current = anahtar;
    adminIslemBildirimi(mesaj, tur === 'hata' ? 'hata' : 'basari');
  }, [mesaj, tur]);

  return null;
}

export function ModulBaslik({
  baslik,
  aciklama,
  onizleGoster = false,
}: {
  baslik: string;
  aciklama: string;
  onizleGoster?: boolean;
}) {
  if (onizleGoster) {
    return (
      <div className="ap-modul-baslik" data-ap-kesif="modul-kabuk">
        <div>
          <h1 className="ap-heading text-xl font-bold">{baslik}</h1>
          <p className="ap-muted mt-1 text-sm">{aciklama}</p>
        </div>
        <AdminSiteOnizleLink />
      </div>
    );
  }

  return (
    <div data-ap-kesif="modul-kabuk">
      <h1 className="ap-heading text-xl font-bold">{baslik}</h1>
      <p className="ap-muted mt-1 text-sm">{aciklama}</p>
    </div>
  );
}
