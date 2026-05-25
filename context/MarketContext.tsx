import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Asset } from '../types';
import { candleStreamService, StreamStatus } from '../services/websocket/candleStreamService';
import { Candle } from '../services/indicators';
import { fetchCandles, getProviderForSymbol, MarketDataError } from '../services/marketData';
import { logger } from '../services/logger';

interface MarketContextValue {
  symbol: string;
  timeframe: string;
  asset: Asset | null;
  price: number;
  status: StreamStatus;
  candles: Candle[];
  provider: string | null;
  dataError: string | null;
  setAsset: (asset: Asset) => void;
  setTimeframe: (tf: string) => void;
  refreshCandles: () => Promise<void>;
}

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({
  children,
  initialAsset,
  initialTimeframe = '60',
}: {
  children: React.ReactNode;
  initialAsset: Asset;
  initialTimeframe?: string;
}) {
  const [asset, setAssetState] = useState<Asset>(initialAsset);
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<StreamStatus>('disconnected');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  const provider = useMemo(() => getProviderForSymbol(asset.symbol), [asset.symbol]);

  const refreshCandles = useCallback(async () => {
    try {
      setDataError(null);
      const data = await fetchCandles(asset.symbol, timeframe, 120);
      setCandles(data);
      if (data.length) setPrice(data[data.length - 1].close);
    } catch (e) {
      const msg = e instanceof MarketDataError ? e.message : 'Erro ao carregar candles';
      setDataError(msg);
      logger.error(msg, 'MarketContext', e);
    }
  }, [asset.symbol, timeframe]);

  useEffect(() => {
    refreshCandles();
  }, [refreshCandles]);

  useEffect(() => {
    candleStreamService.connect(asset.symbol, timeframe);
    const unsubPrice = candleStreamService.onPrice((p) => setPrice(p));
    const unsubStatus = candleStreamService.onStatus(setStatus);
    const unsubCandle = candleStreamService.onCandle((candle, _sym, closed) => {
      setPrice(candle.close);
      setCandles((prev) => {
        if (prev.length === 0) return [candle];
        const last = prev[prev.length - 1];
        if (last.timestamp === candle.timestamp) {
          return [...prev.slice(0, -1), candle];
        }
        if (candle.timestamp > last.timestamp) {
          return [...prev.slice(-199), candle];
        }
        return prev;
      });
      if (closed) refreshCandles();
    });
    return () => {
      unsubPrice();
      unsubStatus();
      unsubCandle();
      candleStreamService.disconnect();
    };
  }, [asset.symbol, timeframe, refreshCandles]);

  const setAsset = useCallback((a: Asset) => {
    setAssetState(a);
    setDataError(null);
  }, []);

  const value = useMemo(
    () => ({
      symbol: asset.symbol,
      timeframe,
      asset,
      price,
      status,
      candles,
      provider,
      dataError,
      setAsset,
      setTimeframe,
      refreshCandles,
    }),
    [asset, timeframe, price, status, candles, provider, dataError, setAsset, refreshCandles]
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
}
