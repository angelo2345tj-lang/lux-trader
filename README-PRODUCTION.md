# Lux Trader FX — Produção

## Desenvolvimento local

1. Copie `.env.example` para `.env` e preencha as chaves no **servidor** (`GEMINI_API_KEY`, `TWELVE_DATA_KEY`, etc.).

2. Instale dependências:

```bash
npm install
cd backend && npm install && cd ..
```

3. Suba frontend + API:

```bash
npm run dev:all
```

- UI: http://localhost:3000  
- API: http://localhost:3001  
- Health: http://localhost:3001/health  

## Fluxo

1. Login com token de acesso  
2. Escolha ativo e timeframe  
3. Toggle **Instantâneo** (intra-candle) ou **Confirmado** (candle fechado)  
4. Clique **ANALISAR MERCADO** — um sinal por clique (sem scanner automático)  

## Docker

```bash
docker compose up -d postgres redis
npm run dev:api
npm run dev
```

## Segurança

- Secrets apenas em `.env` do backend  
- `EXECUTION_ENABLED=false` por padrão  
- Frontend não assina ordens (HMAC no servidor quando execução for ativada)  
