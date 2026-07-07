function htmlMi(metin: string) {
  const bas = metin.trimStart().slice(0, 20).toLowerCase();
  return bas.startsWith('<!doctype') || bas.startsWith('<html');
}

export function apiYanitHataMesaji(status: number, metin: string): string {
  if (htmlMi(metin)) {
    return `API yaniti HTML dondu (${status}). Backend calismiyor olabilir veya /api nginx uzerinden Node'a yonlendirilmiyor.`;
  }
  const kisa = metin.trim().slice(0, 120).replace(/\s+/g, ' ');
  return kisa ? `Sunucu gecersiz yanit (${status}): ${kisa}` : `Sunucu hatasi (${status})`;
}

export async function jsonYanitOku<T>(yanit: Response): Promise<T> {
  const metin = await yanit.text();
  if (!metin.trim()) {
    if (!yanit.ok) throw new Error(`Sunucu hatasi (${yanit.status})`);
    return {} as T;
  }
  try {
    return JSON.parse(metin) as T;
  } catch {
    throw new Error(apiYanitHataMesaji(yanit.status, metin));
  }
}
