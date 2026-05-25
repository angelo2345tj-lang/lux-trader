import {
  TradeSignal,
  SignalType,
  SignalStrength,
  SignalTimingMode,
  MTFStatus,
} from '../../types';
import { Candle } from '../indicators';
import { ConfluenceResult } from '../confluenceEngine';
import { StructureAnalysis } from '../../engines/MarketStructureEngine';
import { CandleAnalysis } from '../../engines/CandleAnalyzer';
import { getRSIValue } from '../indicators';

function calcATR(candles: Candle[], period = 14): number {
  if (candles.length < period + 1) return 0;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    const prev = candles[i - 1];
    trs.push(Math.max(c.high - c.low, Math.abs(c.high - prev.close), Math.abs(c.low - prev.close)));
  }
  return trs.slice(-period).reduce((a, b) => a + b, 0) / period;
}

function buildLevels(entry: number, direction: 'BUY' | 'SELL', symbol: string, atr: number) {
  const isForex = symbol.length === 6 && !symbol.includes('BTC');
  const multiplier =
    atr > 0 ? atr : isForex ? entry * 0.0012 : symbol.includes('BTC') ? entry * 0.0025 : entry * 0.004;
  const isBullish = direction === 'BUY';
  return {
    tp1: isBullish ? entry + multiplier : entry - multiplier,
    tp2: isBullish ? entry + multiplier * 2.1 : entry - multiplier * 2.1,
    tp3: isBullish ? entry + multiplier * 3.8 : entry - multiplier * 3.8,
    sl: isBullish ? entry - multiplier * 0.9 : entry + multiplier * 0.9,
    slPips: parseFloat((multiplier * (isForex ? 10000 : 100)).toFixed(1)),
  };
}

function momentumDirection(candles: Candle[]): 'BUY' | 'SELL' | 'NEUTRAL' {
  if (candles.length < 5) return 'NEUTRAL';
  const last5 = candles.slice(-5);
  let up = 0;
  for (const c of last5) {
    if (c.close > c.open) up++;
  }
  if (up >= 4) return 'BUY';
  if (up <= 1) return 'SELL';
  const rsi = getRSIValue(candles);
  if (rsi > 52) return 'BUY';
  if (rsi < 48) return 'SELL';
  return 'NEUTRAL';
}

export interface FallbackContext {
  assetSymbol: string;
  timeframe: string;
  banca: number;
  riskPercent: number;
  entry: number;
  candles: Candle[];
  confluence: ConfluenceResult;
  structure: StructureAnalysis;
  candleAnalysis: CandleAnalysis;
  blendedScore: number;
  timingMode: SignalTimingMode;
  blockNote?: string;
  winProbability?: number;
}

/** Garante BUY/SELL/NEUTRAL — nunca retorna null ao usuário. */
export function buildGuaranteedSignal(ctx: FallbackContext): TradeSignal {
  const {
    assetSymbol,
    timeframe,
    banca,
    riskPercent,
    entry,
    candles,
    confluence,
    structure,
    candleAnalysis,
    blendedScore,
    timingMode,
    blockNote,
    winProbability = 55,
  } = ctx;

  let direction: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
  if (confluence.signal === SignalType.BUY) direction = 'BUY';
  else if (confluence.signal === SignalType.SELL) direction = 'SELL';
  else direction = momentumDirection(candles);

  const score = Math.max(48, Math.min(88, blendedScore || confluence.score || 52));
  const atr = calcATR(candles);

  if (direction === 'NEUTRAL') {
    const levels = buildLevels(entry, 'BUY', assetSymbol, atr);
    return {
      id: `SIG-N-${Date.now().toString(36).toUpperCase()}`,
      asset: assetSymbol,
      type: SignalType.NEUTRAL,
      strength: SignalStrength.NORMAL,
      score,
      entry,
      tp1: levels.tp1,
      tp2: levels.tp2,
      tp3: levels.tp3,
      sl: levels.sl,
      slPips: levels.slPips,
      expectedProfit: 0,
      timestamp: new Date(),
      trend: 'LATERAL',
      riskReward: '—',
      recommendedLot: 0.01,
      recommendedLeverage: '1:100',
      realRisk: banca * (riskPercent / 100),
      mainReason: `NEUTRO · aguardar direção · ${timingMode}`,
      confluences: ['Momentum equilibrado', ...(confluence.confluences ?? [])],
      risks: [
        blockNote ?? 'Mercado sem viés forte — operar com tamanho reduzido',
        'Preferir confirmação adicional',
      ],
      verdict: `NEUTRO ${score}%`,
      fullRationale:
        blockNote ??
        'Setup neutro: sem bloqueio, aguardando viés institucional claro.',
      invalidation: entry,
      estimatedMinutes: 30,
      timingMode,
      liquidity: 50,
      volatility: candleAnalysis.volatility,
      sentiment: 50,
      smcStatus: structure.trend,
      mtf: { m5: 'Neutral', m15: 'Neutral', h1: 'Neutral', h4: 'Neutral' } as MTFStatus,
      marketCondition: 'Neutro / range operável',
      confidenceLabel: score >= 75 ? 'MODERADA' : 'FRACA',
      aiExplanation: `Modo ${timingMode}. ${blockNote ?? 'Análise neutra por equilíbrio de fluxo.'} RSI ${getRSIValue(candles).toFixed(1)}.`,
      winProbability,
    };
  }

  const levels = buildLevels(entry, direction, assetSymbol, atr);
  const riskAmount = banca * (riskPercent / 100);
  const strengthLabel =
    score >= 92 ? 'ELITE' : score >= 85 ? 'FORTE' : score >= 75 ? 'MODERADA' : 'FRACA';

  return {
    id: `SIG-${Date.now().toString(36).toUpperCase()}`,
    asset: assetSymbol,
    type: direction === 'BUY' ? SignalType.BUY : SignalType.SELL,
    strength: score >= 85 ? SignalStrength.GOLDEN : SignalStrength.NORMAL,
    score,
    entry,
    tp1: levels.tp1,
    tp2: levels.tp2,
    tp3: levels.tp3,
    sl: levels.sl,
    slPips: levels.slPips,
    expectedProfit: riskAmount * 1.8,
    timestamp: new Date(),
    trend: direction === 'BUY' ? 'ALTA' : 'BAIXA',
    riskReward: '1:2',
    recommendedLot: Math.max(0.01, parseFloat((riskAmount / (levels.slPips * 10 || 1)).toFixed(2))),
    recommendedLeverage: '1:100',
    realRisk: riskAmount,
    mainReason: `${strengthLabel} · INSTANT momentum · ${score}%`,
    confluences: [
      'Modo instantâneo',
      structure.bos ? 'BOS' : 'Micro momentum',
      ...(confluence.confluences ?? []),
    ],
    risks: blockNote
      ? [blockNote, 'Gestão de risco recomendada']
      : ['Volatilidade pode expandir rapidamente'],
    verdict: `${strengthLabel} ${score}%`,
    fullRationale:
      blockNote ??
      `Sinal ${direction} gerado por momentum, fluxo e indicadores sem bloqueio de consolidação.`,
    invalidation: direction === 'BUY' ? levels.sl : levels.sl,
    estimatedMinutes: 20,
    timingMode,
    liquidity: 55,
    volatility: candleAnalysis.volatility,
    sentiment: winProbability,
    smcStatus: structure.trend,
    mtf: { m5: 'Neutral', m15: 'Neutral', h1: 'Neutral', h4: 'Neutral' },
    marketCondition: structure.trend === 'RANGE' ? 'Range operável' : structure.trend,
    confidenceLabel:
      score >= 92 ? 'ELITE' : score >= 85 ? 'FORTE' : score >= 75 ? 'MODERADA' : 'FRACA',
    aiExplanation: `INSTANT: ${direction} score ${score}%. ${blockNote ?? 'Sem bloqueio de consolidação.'}`,
    winProbability,
    livePrice: entry,
  };
}
