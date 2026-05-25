/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_TWELVE_DATA_KEY: string;
  readonly VITE_FINNHUB_KEY: string;
  readonly VITE_EXECUTION_ENABLED: string;
  readonly VITE_BINANCE_API_KEY: string;
  readonly VITE_BINANCE_API_SECRET: string;
  readonly VITE_BYBIT_API_KEY: string;
  readonly VITE_BYBIT_API_SECRET: string;
  readonly VITE_MT5_BRIDGE_URL: string;
  readonly VITE_POCKET_BRIDGE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_API_PROXY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
