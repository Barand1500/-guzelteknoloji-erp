const EPOSTA_DOMAINLERI = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'yandex.com',
  'icloud.com',
  'live.com',
  'msn.com',
  'windowslive.com',
  'proton.me',
] as const;

export function epostaOnerileriUret(deger: string, limit = 6): string[] {
  const ham = deger.trim();
  if (!ham || ham.includes(' ')) return [];

  const atIdx = ham.indexOf('@');
  if (atIdx < 0) {
    return EPOSTA_DOMAINLERI.slice(0, limit).map((d) => `${ham}@${d}`);
  }

  const yerel = ham.slice(0, atIdx);
  const domainParca = ham.slice(atIdx + 1).toLowerCase();
  if (!yerel) return [];

  return EPOSTA_DOMAINLERI.filter((d) => d.startsWith(domainParca))
    .slice(0, limit)
    .map((d) => `${yerel}@${d}`);
}
