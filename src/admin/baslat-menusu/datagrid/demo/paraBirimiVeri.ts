/**
 * Sipariş / datagrid PB yardımcıları — Özel Tanımlar kaynağına delege eder.
 */
import { paraBirimiSecenekleri as merkezSecenekler } from '@/admin/baslat-menusu/ozel-tanimlar/veri/paraBirimleri';

export {
  gecerliParaBirimi,
  paraBirimiEtiketi,
  paraBirimiSembolu,
  paraBirimiSecenekleri,
} from '@/admin/baslat-menusu/ozel-tanimlar/veri/paraBirimleri';

export type ParaBirimiKodu = string;

/** Geriye dönük: sabit dizi bekleyen yerler için anlık snapshot */
export const PARA_BIRIMI_SECENEKLERI = merkezSecenekler();
