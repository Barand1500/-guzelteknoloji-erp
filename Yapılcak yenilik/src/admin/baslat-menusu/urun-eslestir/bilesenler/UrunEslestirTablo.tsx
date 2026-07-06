import type { PlatformEslestirme, UrunEslestirKayit, UrunEslestirOge } from '@/admin/baslat-menusu/urun-eslestir/tipler';
import { eslestirmeDolu } from '@/admin/baslat-menusu/urun-eslestir/tipler';
import { platformEslestirmeAl } from '@/admin/baslat-menusu/urun-eslestir/yardimci';

interface UrunEslestirTabloProps {
  urunler: UrunEslestirOge[];
  kayit: UrunEslestirKayit;
  platform: string;
  seciliId: string | null;
  onSec: (id: string) => void;
}

function eslestirmeOzeti(es: PlatformEslestirme | undefined) {
  if (!eslestirmeDolu(es)) return { s1: '—', s2: '—', durum: 'eslesmemis' as const };
  return {
    s1: es!.secenek1.trim() || es!.esDegerUrun.trim() || '—',
    s2: es!.secenek2.trim() || '—',
    durum: 'eslesmis' as const,
  };
}

export function UrunEslestirTablo({
  urunler,
  kayit,
  platform,
  seciliId,
  onSec,
}: UrunEslestirTabloProps) {
  const aktifPlatform = platform === 'Tümü' ? 'Getir' : platform;

  return (
    <div className="ap-master-excel-wrap ap-urun-eslestir-tablo">
      <div className="ap-master-excel-scroll">
        <table className="ap-master-excel-tablo">
          <thead>
            <tr>
              <th className="ap-urun-eslestir-th-id">ID</th>
              <th>Stok Adı</th>
              <th>Grup</th>
              <th>Seçenek 1</th>
              <th>Seçenek 2</th>
              <th className="ap-urun-eslestir-th-durum">Durum</th>
            </tr>
          </thead>
          <tbody>
            {urunler.map((u) => {
              const es = platformEslestirmeAl(kayit, u.id, aktifPlatform);
              const ozet = eslestirmeOzeti(es);
              return (
                <tr
                  key={u.id}
                  className={seciliId === u.id ? 'ap-master-excel-satir-secili' : ''}
                  onClick={() => onSec(u.id)}
                >
                  <td className="ap-master-excel-hucre ap-muted">{u.stokKodu || '—'}</td>
                  <td className="ap-master-excel-hucre">{u.ad}</td>
                  <td className="ap-master-excel-hucre">{u.urunGrubu}</td>
                  <td className="ap-master-excel-hucre ap-muted">{ozet.s1}</td>
                  <td className="ap-master-excel-hucre ap-muted">{ozet.s2}</td>
                  <td className="ap-master-excel-hucre">
                    <span
                      className={`ap-urun-eslestir-durum ap-urun-eslestir-durum-${ozet.durum}`}
                    >
                      {ozet.durum === 'eslesmis' ? 'Eşleşmiş' : 'Eşleşmemiş'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {urunler.length === 0 && (
        <p className="ap-muted py-8 text-center text-sm">Filtreye uygun ürün bulunamadı.</p>
      )}
    </div>
  );
}
