import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { TradeSignal } from '../types';
import { RealSignalEngine, SignalResult } from '../services/strategy/RealSignalEngine';
import { useMarket } from './MarketContext';
import { logger } from '../services/logger';
import { LogEntry, logger as logService } from '../services/logger';

interface SignalContextValue {
  signal: TradeSignal | null;
  isAnalyzing: boolean;
  scanError: string | null;
  lastResult: SignalResult | null;
  isAIActive: boolean;
  logs: LogEntry[];
  analyze: (banca: number, riskPercent: number) => Promise<SignalResult>;
  startAutoScan: (banca: number, riskPercent: number, intervalMs?: number) => void;
  stopAutoScan: () => void;
  clearSignal: () => void;
}

const SignalContext = createContext<SignalContextValue | null>(null);

export function SignalProvider({ children }: { children: React.ReactNode }) {
  const { symbol, timeframe, price } = useMarket();
  const [signal, setSignal] = useState<TradeSignal | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SignalResult | null>(null);
  const [isAIActive, setIsAIActive] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBarRef = useRef<number>(0);

  React.useEffect(() => {
    return logService.subscribe(setLogs);
  }, []);

  const analyze = useCallback(
    async (banca: number, riskPercent: number) => {
      if (isAnalyzing) return lastResult ?? { signal: null };
      setIsAnalyzing(true);
      setScanError(null);
      try {
        const result = await RealSignalEngine.analyze(symbol, banca, riskPercent, timeframe, price);
        setLastResult(result);
        if (result.signal) {
          setSignal(result.signal);
          logger.info(`Sinal: ${result.signal.type} ${result.score}%`, 'scanner');
        } else {
          setSignal(null);
          setScanError(result.blockReason ?? 'Sem setup válido nos dados reais');
        }
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro na análise';
        setScanError(msg);
        setSignal(null);
        logger.error(msg, 'scanner', e);
        return { signal: null, blockReason: msg };
      } finally {
        setIsAnalyzing(false);
      }
    },
    [isAnalyzing, symbol, timeframe, price, lastResult]
  );

  const startAutoScan = useCallback(
    (banca: number, riskPercent: number, intervalMs = 15000) => {
      if (isAIActive) return;
      setIsAIActive(true);
      analyze(banca, riskPercent);
      intervalRef.current = setInterval(() => analyze(banca, riskPercent), intervalMs);
      logger.info('Scanner automático ativado', 'scanner');
    },
    [isAIActive, analyze]
  );

  const stopAutoScan = useCallback(() => {
    setIsAIActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    logger.info('Scanner automático desativado', 'scanner');
  }, []);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Re-analyze on new closed bar (price update heuristic)
  React.useEffect(() => {
    if (!isAIActive || price <= 0) return;
    const now = Date.now();
    if (now - lastBarRef.current > 8000) {
      lastBarRef.current = now;
    }
  }, [price, isAIActive]);

  const clearSignal = useCallback(() => setSignal(null), []);

  return (
    <SignalContext.Provider
      value={{
        signal,
        isAnalyzing,
        scanError,
        lastResult,
        isAIActive,
        logs,
        analyze,
        startAutoScan,
        stopAutoScan,
        clearSignal,
      }}
    >
      {children}
    </SignalContext.Provider>
  );
}

export function useSignals() {
  const ctx = useContext(SignalContext);
  if (!ctx) throw new Error('useSignals must be used within SignalProvider');
  return ctx;
}
