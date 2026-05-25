import { TradeSignal, SignalTimingMode } from '../types';
import { RealSignalEngine, SignalResult } from './strategy/RealSignalEngine';

export type { SignalResult };

/** Facade — delega para RealSignalEngine (dados reais, zero mock) */
export class LuxEngine {
  static async generateSignal(
    assetSymbol: string,
    currentPrice: number,
    banca: number,
    riskPercent: number,
    timeframe = '60'
  ): Promise<TradeSignal | null> {
    const result = await RealSignalEngine.analyze(
      assetSymbol,
      banca,
      riskPercent,
      timeframe,
      currentPrice
    );
    return result.signal;
  }

  static analyze(
    assetSymbol: string,
    banca: number,
    riskPercent: number,
    timeframe = '60',
    livePrice?: number,
    timingMode: SignalTimingMode = 'INSTANT'
  ): Promise<SignalResult> {
    return RealSignalEngine.analyze(
      assetSymbol,
      banca,
      riskPercent,
      timeframe,
      livePrice,
      timingMode
    );
  }
}
