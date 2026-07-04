/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SITE_SLUG: string;
  readonly VITE_GIRIS_GORSEL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
