const TOOLTIP_LOCALE = 'tr';

/** UI ipuçları: her kelimenin ilk harfi büyük (ör. "Yatay çizgiler" → "Yatay Çizgiler"). */
export function tooltipMetni(metin: string): string {
  return metin.replace(/\S+/g, (kelime) => {
    if (!kelime) return kelime;
    const tamBuyuk = kelime.toLocaleUpperCase(TOOLTIP_LOCALE);
    if (kelime.length > 1 && kelime === tamBuyuk && /^[\p{L}\p{N}]+$/u.test(kelime)) {
      return tamBuyuk;
    }
    if (kelime.length === 1) return tamBuyuk;
    return kelime[0].toLocaleUpperCase(TOOLTIP_LOCALE) + kelime.slice(1).toLocaleLowerCase(TOOLTIP_LOCALE);
  });
}
