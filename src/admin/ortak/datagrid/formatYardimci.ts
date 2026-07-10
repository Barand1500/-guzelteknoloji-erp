import { tooltipMetni } from '@/araclar/tooltipMetni';

export { tooltipMetni as dgTooltipMetni };

export function bosGosterim(deger: unknown): string {
  if (deger === null || deger === undefined || deger === '') return '—';
  return String(deger);
}

export function tarihFormatla(deger: unknown): string {
  if (!deger) return '—';
  const d = deger instanceof Date ? deger : new Date(String(deger));
  if (Number.isNaN(d.getTime())) return '—';
  const gun = String(d.getDate()).padStart(2, '0');
  const ay = String(d.getMonth() + 1).padStart(2, '0');
  const yil = d.getFullYear();
  return `${gun}.${ay}.${yil}`;
}

export function tarihSaatFormatla(deger: unknown): string {
  if (!deger) return '—';
  const d = deger instanceof Date ? deger : new Date(String(deger));
  if (Number.isNaN(d.getTime())) return '—';
  const gun = String(d.getDate()).padStart(2, '0');
  const ay = String(d.getMonth() + 1).padStart(2, '0');
  const yil = d.getFullYear();
  const saat = String(d.getHours()).padStart(2, '0');
  const dakika = String(d.getMinutes()).padStart(2, '0');
  return `${gun}.${ay}.${yil} ${saat}:${dakika}`;
}

export function sayiFormatla(deger: number): string {
  if (!Number.isFinite(deger)) return '—';
  return deger.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function paraFormatla(deger: number, pb: string | null = '₺'): string {
  if (!Number.isFinite(deger)) return '—';
  const sayi = sayiFormatla(deger);
  if (!pb) return sayi;
  return pb === '₺' ? `${sayi} ₺` : `${sayi} ${pb}`;
}

export function yuzdeFormatla(deger: number): string {
  if (!Number.isFinite(deger)) return '—';
  return `%${deger.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function csvIndir(dosyaAdi: string, basliklar: string[], satirlar: string[][]) {
  const bom = '\uFEFF';
  const icerik =
    bom +
    [basliklar, ...satirlar]
      .map((satir) => satir.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
  const blob = new Blob([icerik], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dosyaAdi.endsWith('.csv') ? dosyaAdi : `${dosyaAdi}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
