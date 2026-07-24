/** Sekme açık kaldığı sürece bellek; sekme kapanınca unmount → yeniden sorulur */
let bellekAcik = false;

export function ozelTanimlarOturumAcikMi(): boolean {
  return bellekAcik;
}

export function ozelTanimlarOturumAc(): void {
  bellekAcik = true;
}

export function ozelTanimlarOturumKapat(): void {
  bellekAcik = false;
}
