import { Candle } from '../indicators';
import { candleCache } from '../candleCache';
import { binanceKlineInterval, binanceStreamSymbol } from '../marketData/providers/binanceProvider';
import { fetchLastPrice } from '../marketData';
import { logger } from '../logger';

export type StreamStatus = 'connected' | 'disconnected' | 'fallback' | 'reconnecting';

type CandleCallback = (candle: Candle, symbol: string, closed: boolean) => void;
type PriceCallback = (price: number, symbol: string) => void;
type StatusCallback = (status: StreamStatus) => void;

class CandleStreamService {
  private ws: WebSocket | null = null;
  private symbol = '';
  private timeframe = '60';
  private reconnectAttempts = 0;
  private maxReconnect = 10;
  private fallbackTimer: ReturnType<typeof setInterval> | null = null;
  private candleCallbacks: CandleCallback[] = [];
  private priceCallbacks: PriceCallback[] = [];
  private statusCallbacks: StatusCallback[] = [];
  private lastPrice = 0;
  private useFallback = false;

  onCandle(cb: CandleCallback) {
    this.candleCallbacks.push(cb);
    return () => {
      this.candleCallbacks = this.candleCallbacks.filter((c) => c !== cb);
    };
  }

  onPrice(cb: PriceCallback) {
    this.priceCallbacks.push(cb);
    return () => {
      this.priceCallbacks = this.priceCallbacks.filter((c) => c !== cb);
    };
  }

  onStatus(cb: StatusCallback) {
    this.statusCallbacks.push(cb);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter((c) => c !== cb);
    };
  }

  private emitCandle(candle: Candle, closed: boolean) {
    candleCache.mergeLatest(this.symbol, this.timeframe, candle, 'binance-ws');
    this.candleCallbacks.forEach((cb) => cb(candle, this.symbol, closed));
  }

  private emitPrice(price: number) {
    this.lastPrice = price;
    this.priceCallbacks.forEach((cb) => cb(price, this.symbol));
  }

  private emitStatus(status: StreamStatus) {
    this.statusCallbacks.forEach((cb) => cb(status));
  }

  connect(symbol: string, timeframe: string) {
    this.disconnect();
    this.symbol = symbol;
    this.timeframe = timeframe;
    this.reconnectAttempts = 0;

    const stream = binanceStreamSymbol(symbol);
    if (stream) {
      this.connectBinanceKline(stream);
    } else {
      this.startRestFallback();
    }
  }

  private connectBinanceKline(stream: string) {
    const interval = binanceKlineInterval(this.timeframe);
    const url = `wss://stream.binance.com:9443/ws/${stream}@kline_${interval}`;

    try {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.useFallback = false;
        this.stopFallback();
        this.emitStatus('connected');
        logger.info(`WS kline conectado: ${this.symbol}@${interval}`, 'candleStream');
      };

      this.ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          const k = msg.k;
          if (!k) return;
          const candle: Candle = {
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
            volume: parseFloat(k.v),
            timestamp: k.t,
          };
          this.emitPrice(candle.close);
          this.emitCandle(candle, Boolean(k.x));
        } catch {
          /* ignore parse */
        }
      };

      this.ws.onclose = () => {
        this.emitStatus('reconnecting');
        this.scheduleReconnect(stream);
      };

      this.ws.onerror = () => this.ws?.close();
    } catch {
      this.startRestFallback();
    }
  }

  private scheduleReconnect(stream: string) {
    if (this.reconnectAttempts >= this.maxReconnect) {
      this.startRestFallback();
      return;
    }
    this.reconnectAttempts++;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    setTimeout(() => this.connectBinanceKline(stream), delay);
  }

  private startRestFallback() {
    if (this.useFallback) return;
    this.useFallback = true;
    this.emitStatus('fallback');
    this.stopFallback();
    logger.warn(`WS fallback REST para ${this.symbol}`, 'candleStream');

    this.fallbackTimer = setInterval(async () => {
      try {
        const price = await fetchLastPrice(this.symbol);
        if (price > 0) this.emitPrice(price);
      } catch (e) {
        logger.error('Fallback price failed', 'candleStream', e);
      }
    }, 2000);
  }

  private stopFallback() {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }

  disconnect() {
    this.stopFallback();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.useFallback = false;
    this.emitStatus('disconnected');
  }

  getLastPrice() {
    return this.lastPrice;
  }

  getStatus(): StreamStatus {
    if (this.useFallback) return 'fallback';
    if (this.ws?.readyState === WebSocket.OPEN) return 'connected';
    return 'disconnected';
  }
}

export const candleStreamService = new CandleStreamService();

// Backward-compatible price-only service
export const wsService = {
  onPrice: (cb: PriceCallback) => candleStreamService.onPrice(cb),
  onStatus: (cb: (s: 'connected' | 'disconnected' | 'fallback') => void) =>
    candleStreamService.onStatus((s) => cb(s === 'reconnecting' ? 'disconnected' : s)),
  connect: (symbol: string) => candleStreamService.connect(symbol, '60'),
  connectWithTimeframe: (symbol: string, tf: string) => candleStreamService.connect(symbol, tf),
  disconnect: () => candleStreamService.disconnect(),
  getLastPrice: () => candleStreamService.getLastPrice(),
  getStatus: () => {
    const s = candleStreamService.getStatus();
    return s === 'reconnecting' ? 'disconnected' : s;
  },
};
