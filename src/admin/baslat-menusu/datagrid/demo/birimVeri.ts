/**
 * Sipariş / datagrid birim yardımcıları — Özel Tanımlar kaynağına delege eder.
 */
import {
  gecerliOlcuBirim,
  olcuBirimEtiketi,
  olcuBirimSecenekleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/olcuBirimleri';

export type BirimKodu = string;

export function birimEtiketi(kod: string): string {
  return olcuBirimEtiketi(kod);
}

export function gecerliBirim(kod: string | undefined, varsayilan: BirimKodu = 'ADET'): BirimKodu {
  return gecerliOlcuBirim(kod, varsayilan);
}

export function birimSecenekleri() {
  return olcuBirimSecenekleri(true);
}

/** Geriye dönük: sabit dizi bekleyen yerler için anlık snapshot */
export const BIRIM_SECENEKLERI = olcuBirimSecenekleri(true);
