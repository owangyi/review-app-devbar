/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PIPELINE_ID: string
  readonly VITE_DEPLOY_TIME: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

