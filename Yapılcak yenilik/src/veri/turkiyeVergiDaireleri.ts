import { YEDEK_ILLER } from '@/veri/turkiyeIlIlce';

function metinEslestir(metin: string, arama: string) {
  const q = arama.trim().toLocaleLowerCase('tr');
  if (!q) return true;
  return metin.toLocaleLowerCase('tr').includes(q);
}

/** Yaygın vergi dairesi adları — liste aramada öneri olarak kullanılır */
const EK_VERGI_DAIRELERI = [
  'Kadıköy',
  'Beşiktaş',
  'Şişli',
  'Üsküdar',
  'Bakırköy',
  'Maltepe',
  'Pendik',
  'Kartal',
  'Ataşehir',
  'Sarıyer',
  'Beyoğlu',
  'Fatih',
  'Zeytinburnu',
  'Bağcılar',
  'Esenyurt',
  'Büyük Mükellefler',
  'Çankaya',
  'Keçiören',
  'Yenimahalle',
  'Mamak',
  'Sincan',
  'Etimesgut',
  'Konak',
  'Bornova',
  'Karşıyaka',
  'Buca',
  'Nilüfer',
  'Osmangazi',
  'Yıldırım',
  'Muratpaşa',
  'Kepez',
  'Konyaaltı',
  'Seyhan',
  'Çukurova',
  'Yüreğir',
  'Şahinbey',
  'Şehitkamil',
  'Oğuzeli',
  'Merkez',
  'Kocasinan',
  'Melikgazi',
  'Talas',
  'İlkadım',
  'Atakum',
  'Canik',
  'Tekkeköy',
  'Yakutiye',
  'Palandöken',
  'Aziziye',
  'Meram',
  'Selçuklu',
  'Karatay',
  'Battalgazi',
  'Yeşilyurt',
  'Şehzadeler',
  'Yunusemre',
  'Odunpazarı',
  'Tepebaşı',
  'Efeler',
  'Nazilli',
  'Pamukkale',
  'Merkezefendi',
  'Çorlu',
  'Süleymanpaşa',
  'Kapaklı',
  'Gebze',
  'İzmit',
  'Darıca',
  'Körfez',
  'Başiskele',
  'Çayırova',
  'Dilovası',
  'Gölcük',
  'Kartepe',
  'Derince',
];

const IL_BAZLI = YEDEK_ILLER.flatMap((il) => [
  `${il} Defterdarlığı`,
  `${il} Vergi Dairesi Başkanlığı`,
]);

export const VERGI_DAIRELERI: string[] = [...new Set([...EK_VERGI_DAIRELERI, ...IL_BAZLI])].sort((a, b) =>
  a.localeCompare(b, 'tr')
);

export function vergiDaireleriniFiltrele(arama: string, limit = 12): string[] {
  return VERGI_DAIRELERI.filter((ad) => metinEslestir(ad, arama)).slice(0, limit);
}
