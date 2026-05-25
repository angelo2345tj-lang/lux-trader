import { SignalTimingMode, TradeSignal } from '../../types';
import { SignalResult } from '../strategy/RealSignalEngine';
import { LuxEngine } from '../luxEngine';

const API_BASE =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_API_URL?.replace(/\/$/, '')) ||
  '/api/v1';

const API_TIMEOUT_MS = 1_800;
const LOCAL_TIMEOUT_MS = 2_000;

let inFlight: Promise<SignalResult> | null = null;
let inFlightKey = '';

export interface AnalyzePayload {
  symbol: string;
  timeframe: string;
  balance: number;
  riskPercent: number;
  livePrice?: number;
  timingMode: SignalTimingMode;
}

function analyzeKey(p: AnalyzePayload) {
  return `${p.symbol}:${p.timeframe}:${p.timingMode}:${p.livePrice ?? 0}`;
}

function reviveSignal(raw: TradeSignal | null): TradeSignal | null {
  if (!raw) return null;
  return {
    ...raw,
    timestamp: raw.timestamp
      ? new Date(raw.timestamp as unknown as string)
      : new Date(),
  };
}

async function parseError(res: Response): Promise<string> {
  const err = await res.json().catch(() => ({}));
  const body = err as { message?: string | string[] };
  if (Array.isArray(body.message)) return body.message.join(', ');
  if (body.message) return body.message;
  return `API ${res.status}`;
}

async function requestAnalyze(payload: AnalyzePayload): Promise<SignalResult> {
  const res = await fetch(`${API_BASE}/signals/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  const data = (await res.json()) as SignalResult;
  return {
    ...data,
    signal: reviveSignal(data.signal),
  };
}

async function runLocal(payload: AnalyzePayload): Promise<SignalResult> {
  const local = await Promise.race([
    LuxEngine.analyze(
      payload.symbol,
      payload.balance,
      payload.riskPercent,
      payload.timeframe,
      payload.livePrice,
      payload.timingMode
    ),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('local timeout')), LOCAL_TIMEOUT_MS)
    ),
  ]);
  return { ...local, dataSource: local.dataSource ?? 'local-fallback' };
}

export async function analyzeSignal(payload: AnalyzePayload): Promise<SignalResult> {
  const key = analyzeKey(payload);
  if (inFlight && inFlightKey === key) {
    return inFlight;
  }

  const run = async (): Promise<SignalResult> => {
    const localPromise = runLocal(payload).catch(() => null);

    if (payload.timingMode === 'INSTANT') {
      try {
        const api = await requestAnalyze(payload);
        if (api.signal) return api;
        const local = await localPromise;
        if (local?.signal) return local;
        return api;
      } catch {
        const local = await localPromise;
        if (local) return local;
      }
      return (await localPromise) ?? {
        signal: null,
        blockReason: 'Análise indisponível — verifique conexão',
        timingMode: payload.timingMode,
        dataSource: 'unavailable',
      };
    }

    try {
      const api = await requestAnalyze(payload);
      if (api.signal) return api;
      const local = await localPromise;
      return local?.signal ? local : api;
    } catch {
      const local = await localPromise;
      if (local) return local;
      return {
        signal: null,
        blockReason: 'Servidor offline — execute npm run dev',
        timingMode: payload.timingMode,
        dataSource: 'unavailable',
      };
    }
  };

  inFlightKey = key;
  inFlight = run().finally(() => {
    if (inFlightKey === key) {
      inFlight = null;
      inFlightKey = '';
    }
  });

  return inFlight;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch('/health', {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
