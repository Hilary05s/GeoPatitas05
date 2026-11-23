/// <reference types="vite/client" />

// Variables de entorno disponibles en el frontend (deben empezar con VITE_).
interface ImportMetaEnv {
  /** URL base de la API. En local: "/api" (pasa por el proxy de Vite). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
