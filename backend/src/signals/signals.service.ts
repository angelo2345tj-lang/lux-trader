import { Injectable, Logger } from '@nestjs/common';
import { RealSignalEngine } from '../../../services/strategy/RealSignalEngine';
import { MarketDataError } from '../../../services/marketData';
import type { SignalTimingMode } from '../../../types';
import { AnalyzeSignalDto } from './dto/analyze-signal.dto';

@Injectable()
export class SignalsService {
  private readonly log = new Logger(SignalsService.name);

  async analyze(dto: AnalyzeSignalDto) {
    const timingMode = (dto.timingMode || 'INSTANT') as SignalTimingMode;
    const symbol = dto.symbol;
    const started = Date.now();

    try {
      this.log.log(`analyze start symbol=${symbol} tf=${dto.timeframe} mode=${timingMode}`);

      const result = await RealSignalEngine.analyze(
        symbol,
        dto.balance,
        dto.riskPercent,
        dto.timeframe || '60',
        dto.livePrice,
        timingMode
      );

      this.log.log(
        `analyze done symbol=${symbol} signal=${result.signal ? 'yes' : 'no'} ms=${Date.now() - started}`
      );

      return {
        ...result,
        signal: result.signal
          ? {
              ...result.signal,
              timestamp:
                result.signal.timestamp instanceof Date
                  ? result.signal.timestamp.toISOString()
                  : result.signal.timestamp,
            }
          : null,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.log.error(`analyze failed symbol=${symbol} ms=${Date.now() - started}: ${msg}`, stack);

      if (err instanceof MarketDataError) {
        return {
          signal: null,
          blockReason: err.message,
          dataSource: 'market-error',
          timingMode,
        };
      }

      return {
        signal: null,
        blockReason:
          msg && msg.length < 200
            ? msg
            : 'Análise temporariamente indisponível — tente novamente em instantes',
        dataSource: 'error-recovery',
        timingMode,
      };
    }
  }
}
