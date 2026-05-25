import { useEffect, useState, useCallback } from 'react';
import { candleStreamService } from '../services/websocket/candleStreamService';

export function useWebSocket(symbol: string, timeframe = '60') {
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'fallback' | 'reconnecting'>('disconnected');

  useEffect(() => {
    if (!symbol) return;
    const unsubPrice = candleStreamService.onPrice((p) => setPrice(p));
    const unsubStatus = candleStreamService.onStatus(setStatus);
    candleStreamService.connect(symbol, timeframe);
    return () => {
      unsubPrice();
      unsubStatus();
      candleStreamService.disconnect();
    };
  }, [symbol, timeframe]);

  const reconnect = useCallback(() => candleStreamService.connect(symbol, timeframe), [symbol, timeframe]);

  return { price, status, reconnect };
}
