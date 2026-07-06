/** Restorant projesi: yalnızca admin panel */
export const UYGULAMA_ADI = 'Restorant Admin';
export const UYGULAMA_KISA = 'RA';

/**
 * Offline mock API. Uretim build'de varsayilan false (gercek backend).
 * Lokal gelistirmede varsayilan true. .env ile ezilebilir:
 * VITE_BACKEND_YOK=true | false
 */
export const BACKEND_YOK = import.meta.env.PROD
  ? import.meta.env.VITE_BACKEND_YOK === 'true'
  : import.meta.env.VITE_BACKEND_YOK !== 'false';
