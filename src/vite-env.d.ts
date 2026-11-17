// Variables de entorno de compilación (ver .env.example). Todas son opcionales.
interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_DONATE_URL?: string;
  readonly VITE_GTM_ID?: string;
  readonly VITE_TILE_STORE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
