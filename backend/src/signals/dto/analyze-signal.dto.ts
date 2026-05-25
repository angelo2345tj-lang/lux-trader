export type SignalTimingModeDto = 'CONFIRMED' | 'INSTANT';

export class AnalyzeSignalDto {
  symbol!: string;
  timeframe!: string;
  balance!: number;
  riskPercent!: number;
  livePrice?: number;
  timingMode: SignalTimingModeDto = 'INSTANT';
}
