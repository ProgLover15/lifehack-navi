/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PAYMENT_LINK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
