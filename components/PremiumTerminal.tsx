import React, { memo, useState, useMemo } from 'react';
import {
  Asset,
  TradeSignal,
  SignalTimingMode,
} from '../types';
import TradingViewWidget from './TradingViewWidget';
import SignalCard from './SignalCard';
import SignalPanelSkeleton from './SignalPanelSkeleton';
import {
  Loader2,
  Wifi,
  WifiOff,
  ChevronDown,
  Zap,
  Shield,
  Star,
  Globe,
} from 'lucide-react';
import { TIMEFRAMES, CHART_TIMEZONES } from '../constants';

interface Props {
  asset: Asset;
  timeframe: string;
  theme: 'dark' | 'light';
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  livePrice: number;
  wsStatus: string;
  dataProvider: string | null;
  userBanca: number;
  todayPnl: number;
  timingMode: SignalTimingMode;
  onTimingModeChange: (m: SignalTimingMode) => void;
  onAssetClick: () => void;
  onTimeframeClick: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  scanError: string | null;
  signal: TradeSignal | null;
  analyzeLabel: string;
  favoriteAssets: string[];
  favoriteTimeframes: string[];
  onToggleFavoriteAsset: (symbol: string) => void;
  onToggleFavoriteTimeframe: (tf: string) => void;
  onSelectFavoriteAsset?: (symbol: string) => void;
  onSelectFavoriteTimeframe?: (tf: string) => void;
  onSaveSignal?: () => void;
}

const PremiumTerminal: React.FC<Props> = memo(
  ({
    asset,
    timeframe,
    theme,
    timezone,
    onTimezoneChange,
    livePrice,
    wsStatus,
    dataProvider,
    userBanca,
    todayPnl,
    timingMode,
    onTimingModeChange,
    onAssetClick,
    onTimeframeClick,
    onAnalyze,
    isAnalyzing,
    scanError,
    signal,
    analyzeLabel,
    favoriteAssets,
    favoriteTimeframes,
    onToggleFavoriteAsset,
    onToggleFavoriteTimeframe,
    onSelectFavoriteAsset,
    onSelectFavoriteTimeframe,
    onSaveSignal,
  }) => {
    const [tzOpen, setTzOpen] = useState(false);
    const wsOk = wsStatus === 'connected' || wsStatus === 'fallback';
    const tzCurrent =
      CHART_TIMEZONES.find((z) => z.value === timezone) ?? CHART_TIMEZONES[0];

    const connectionLabel = useMemo(() => {
      const prov = dataProvider?.toLowerCase() ?? '';
      if (prov.includes('binance')) return 'Binance Live';
      if (wsOk) return `${dataProvider ?? 'Market'} Live`;
      return 'Offline';
    }, [dataProvider, wsOk]);

    return (
      <div className="flex flex-col gap-4 p-3 sm:p-5 w-full max-w-3xl mx-auto min-h-0 overflow-x-hidden pb-6">
        {/* Header mobile-first */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Saldo</p>
              <p className="text-xl font-black text-white tabular-nums">
                ${userBanca.toLocaleString()}
              </p>
              <p
                className={`text-[10px] font-bold mt-0.5 ${
                  todayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                Hoje {todayPnl >= 0 ? '+' : ''}
                {todayPnl.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                  wsOk
                    ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5'
                    : 'text-red-400 border-red-500/20 bg-red-500/5'
                }`}
              >
                {wsOk ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                {connectionLabel}
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTzOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-zinc-950 text-[10px] font-bold text-zinc-300"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {tzCurrent.utc}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {tzOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-zinc-950 shadow-xl py-1">
                    {CHART_TIMEZONES.map((z) => (
                      <button
                        key={z.value}
                        type="button"
                        onClick={() => {
                          onTimezoneChange(z.value);
                          setTzOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 ${
                          timezone === z.value ? 'text-cyan-400' : 'text-zinc-400'
                        }`}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ativo + TF */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onAssetClick}
              className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-sm font-bold text-white"
            >
              {asset.symbol}
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </button>
            <button
              type="button"
              onClick={() => onToggleFavoriteAsset(asset.symbol)}
              className={`p-3 rounded-xl border ${
                favoriteAssets.includes(asset.symbol)
                  ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                  : 'border-white/10 text-zinc-500'
              }`}
            >
              <Star
                className={`w-5 h-5 ${
                  favoriteAssets.includes(asset.symbol) ? 'fill-current' : ''
                }`}
              />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onTimeframeClick}
              className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-sm font-semibold text-zinc-200"
            >
              {TIMEFRAMES.find((t) => t.value === timeframe)?.label ?? timeframe}
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </button>
            <button
              type="button"
              onClick={() => onToggleFavoriteTimeframe(timeframe)}
              className={`p-3 rounded-xl border ${
                favoriteTimeframes.includes(timeframe)
                  ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                  : 'border-white/10 text-zinc-500'
              }`}
            >
              <Star
                className={`w-5 h-5 ${
                  favoriteTimeframes.includes(timeframe) ? 'fill-current' : ''
                }`}
              />
            </button>
          </div>
          <div className="flex rounded-xl border border-white/10 bg-zinc-900 p-0.5">
            <button
              type="button"
              onClick={() => onTimingModeChange('INSTANT')}
              className={`flex-1 py-2.5 text-[10px] font-bold uppercase rounded-lg ${
                timingMode === 'INSTANT' ? 'bg-blue-600 text-white' : 'text-zinc-500'
              }`}
            >
              <Zap className="w-3 h-3 inline mr-1" />
              Instantâneo
            </button>
            <button
              type="button"
              onClick={() => onTimingModeChange('CONFIRMED')}
              className={`flex-1 py-2.5 text-[10px] font-bold uppercase rounded-lg ${
                timingMode === 'CONFIRMED' ? 'bg-blue-600 text-white' : 'text-zinc-500'
              }`}
            >
              <Shield className="w-3 h-3 inline mr-1" />
              Confirmado
            </button>
          </div>
        </div>

        {(favoriteAssets.length > 0 || favoriteTimeframes.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {favoriteAssets.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => onSelectFavoriteAsset?.(sym)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                  sym === asset.symbol
                    ? 'border-amber-500/40 text-amber-300'
                    : 'border-white/10 text-zinc-500'
                }`}
              >
                ⭐ {sym}
              </button>
            ))}
            {favoriteTimeframes.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onSelectFavoriteTimeframe?.(tf)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                  tf === timeframe
                    ? 'border-blue-500/40 text-blue-300'
                    : 'border-white/10 text-zinc-500'
                }`}
              >
                ⭐ {TIMEFRAMES.find((t) => t.value === tf)?.label ?? tf}
              </button>
            ))}
          </div>
        )}

        {/* Gráfico full width */}
        <TradingViewWidget
          asset={asset}
          currentSignal={signal}
          timeframe={timeframe}
          timezone={timezone}
          theme={theme}
        />

        {livePrice > 0 && (
          <p className="text-center text-[10px] font-mono text-zinc-500 tabular-nums">
            {livePrice.toFixed(5)}
          </p>
        )}

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_32px_rgba(37,99,235,0.35)] active:scale-[0.99] transition-transform"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analisando…
            </>
          ) : (
            analyzeLabel
          )}
        </button>

        {scanError && !isAnalyzing && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-center">
            <p className="text-xs text-amber-300/90">{scanError}</p>
            <button
              type="button"
              onClick={onAnalyze}
              className="mt-2 text-[10px] font-bold uppercase text-amber-200"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {isAnalyzing && !signal && <SignalPanelSkeleton />}

        {signal && !isAnalyzing && (
          <SignalCard
            signal={signal}
            utcLabel={tzCurrent.utc}
            onSave={onSaveSignal}
          />
        )}
      </div>
    );
  }
);

PremiumTerminal.displayName = 'PremiumTerminal';
export default PremiumTerminal;
