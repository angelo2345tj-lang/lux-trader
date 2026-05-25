import React, { useMemo, useState } from 'react';
import { TradeHistoryItem } from '../types';
import {
  History,
  TrendingUp,
  TrendingDown,
  Filter,
  BarChart3
} from 'lucide-react';

interface HistoryPanelProps {
  history: TradeHistoryItem[];
  onDelete?: (id: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onDelete
}) => {

  const [filter, setFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'PENDING'>('ALL');

  const stats = useMemo(() => {

    const wins = history.filter(h => h.result === 'WIN');
    const losses = history.filter(h => h.result === 'LOSS');
    const pending = history.filter(h => h.result === 'PENDING');

    const totalProfit = history.reduce((a, h) => a + h.profit, 0);

    const totalInvested = history.reduce(
      (a, h) => a + (h.entryValue || 0),
      0
    );

    const winRate =
      history.length > 0
        ? (wins.length /
            history.filter(h => h.result !== 'PENDING').length) * 100 || 0
        : 0;

    const roi =
      totalInvested > 0
        ? (totalProfit / totalInvested) * 100
        : 0;

    return {
      wins: wins.length,
      losses: losses.length,
      pending: pending.length,
      totalProfit,
      winRate,
      roi
    };

  }, [history]);

  const filtered = useMemo(() => {

    if (filter === 'ALL') return history;

    return history.filter(h => h.result === filter);

  }, [history, filter]);

  return (
    <div className="p-4 md:p-10 space-y-6 max-w-4xl mx-auto animate-view-entry pb-40 overflow-x-hidden">

      {/* HEADER */}

      <div className="flex items-center gap-4 flex-wrap">
        <History className="w-7 h-7 text-blue-500 shrink-0" />

        <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight text-white break-words">
          Histórico Operacional
        </h2>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {[
          {
            label: 'WIN RATE',
            val: `${stats.winRate.toFixed(1)}%`,
            color: 'text-green-500'
          },
          {
            label: 'ROI',
            val: `${stats.roi.toFixed(1)}%`,
            color: stats.roi >= 0
              ? 'text-green-500'
              : 'text-red-500'
          },
          {
            label: 'LUCRO TOTAL',
            val: `$${stats.totalProfit.toFixed(2)}`,
            color: stats.totalProfit >= 0
              ? 'text-green-500'
              : 'text-red-500'
          },
          {
            label: 'OPERAÇÕES',
            val: String(history.length),
            color: 'text-blue-500'
          }
        ].map(s => (

          <div
            key={s.label}
            className="glass-morphism p-4 rounded-3xl border border-white/5 text-center overflow-hidden"
          >

            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest break-words">
              {s.label}
            </p>

            <p className={`text-xl md:text-2xl font-black italic mono mt-2 break-all ${s.color}`}>
              {s.val}
            </p>

          </div>

        ))}

      </div>

      {/* FILTROS */}

      <div className="grid grid-cols-3 gap-3">

        {[
          {
            id: 'WIN' as const,
            label: 'WINS',
            count: stats.wins,
            color: 'green'
          },
          {
            id: 'LOSS' as const,
            label: 'LOSSES',
            count: stats.losses,
            color: 'red'
          },
          {
            id: 'PENDING' as const,
            label: 'PENDENTES',
            count: stats.pending,
            color: 'zinc'
          }
        ].map(f => (

          <button
            key={f.id}
            onClick={() => setFilter(filter === f.id ? 'ALL' : f.id)}
            className={`
              glass-morphism
              p-3
              rounded-2xl
              border
              transition-all
              flex
              flex-col
              items-center
              justify-center
              gap-2
              min-h-[90px]
              overflow-hidden
              ${filter === f.id
                ? `border-${f.color}-500/50 bg-${f.color}-500/10`
                : 'border-white/5'}
            `}
          >

            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 text-center break-words">
              {f.label}
            </span>

            <span className="text-lg font-black mono text-white">
              {f.count}
            </span>

          </button>

        ))}

      </div>

      {/* GRÁFICO */}

      <div className="glass-morphism p-5 rounded-[2rem] border border-white/5 overflow-hidden">

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <BarChart3 className="w-5 h-5 text-blue-500" />

          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Gráfico Operacional
          </span>
        </div>

        <div className="flex items-end gap-1 h-24 overflow-hidden">

          {history.slice(0, 30).reverse().map((h) => (

            <div
              key={h.id}
              className={`
                flex-1
                rounded-t
                transition-all
                ${h.result === 'WIN'
                  ? 'bg-green-500/60'
                  : h.result === 'LOSS'
                  ? 'bg-red-500/60'
                  : 'bg-zinc-600/40'}
              `}
              style={{
                height: `${Math.max(
                  8,
                  Math.min(100, Math.abs(h.profit) / 10 + 10)
                )}%`
              }}
              title={`${h.asset}: $${h.profit}`}
            />

          ))}

          {history.length === 0 && (
            <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest w-full text-center py-8">
              Sem dados
            </p>
          )}

        </div>

      </div>

      {/* LISTA */}

      <div className="space-y-4">

        {filtered.length > 0 ? (

          filtered.map(item => (

            <div
              key={item.id}
              className="
                glass-morphism
                p-4 md:p-6
                rounded-[2rem]
                flex
                flex-col
                md:flex-row
                gap-5
                md:items-center
                md:justify-between
                border
                border-white/5
                hover:bg-white/5
                transition-all
                group
                overflow-hidden
              "
            >

              {/* LEFT */}

              <div className="flex items-start gap-4 min-w-0">

                <div
                  className={`
                    w-14
                    h-14
                    shrink-0
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    font-black
                    text-lg
                    border
                    ${item.result === 'WIN'
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : item.result === 'LOSS'
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : 'bg-zinc-800/50 text-zinc-500 border-white/5'}
                  `}
                >

                  {item.type === 'BUY'
                    ? <TrendingUp className="w-6 h-6" />
                    : <TrendingDown className="w-6 h-6" />
                  }

                </div>

                <div className="min-w-0">

                  <h4 className="font-black italic text-base md:text-lg text-white break-words">
                    {item.asset} — {item.type === 'BUY' ? 'COMPRA' : 'VENDA'}
                  </h4>

                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1 break-words">
                    {new Date(item.timestamp).toLocaleString()}
                    {' · '}
                    TF: {item.timeframe || '—'}
                    {item.timingMode && ` · ${item.timingMode}`}
                    {item.confidence != null && ` · ${item.confidence}%`}
                  </p>

                  {(item.entry != null || item.stop != null || item.take != null) && (
                    <p className="text-[9px] font-mono text-zinc-500 mt-1 break-all">
                      {item.entry != null && `E ${item.entry.toFixed(5)}`}
                      {item.stop != null && ` · SL ${item.stop.toFixed(5)}`}
                      {item.take != null && ` · TP ${item.take.toFixed(5)}`}
                      {item.invalidation != null && ` · Inv ${item.invalidation.toFixed(5)}`}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-[9px] text-zinc-500 mt-1 italic break-words">
                      {item.notes}
                    </p>
                  )}

                  {item.score != null && (
                    <p className="text-[9px] text-cyan-500/80 mt-1 font-bold">
                      Score {item.score}%
                    </p>
                  )}

                  {item.aiExplanation && (
                    <p className="text-[9px] text-zinc-500 mt-1 line-clamp-2 break-words">
                      {item.aiExplanation}
                    </p>
                  )}

                </div>

              </div>

              {/* RIGHT */}

              <div className="text-left md:text-right">

                <span
                  className={`
                    text-[10px]
                    font-black
                    uppercase
                    px-3
                    py-1
                    rounded-full
                    inline-block
                    ${item.result === 'WIN'
                      ? 'bg-green-500/10 text-green-500'
                      : item.result === 'LOSS'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-zinc-800 text-zinc-500'}
                  `}
                >
                  {item.result}
                </span>

                <p
                  className={`
                    text-xl
                    font-black
                    italic
                    mono
                    mt-2
                    break-all
                    ${item.profit >= 0
                      ? 'text-green-500'
                      : 'text-red-500'}
                  `}
                >
                  ${item.profit.toFixed(2)}
                </p>

                {onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="
                      text-[8px]
                      text-zinc-700
                      hover:text-red-500
                      mt-2
                      uppercase
                      tracking-widest
                      opacity-100
                      md:opacity-0
                      md:group-hover:opacity-100
                      transition-opacity
                    "
                  >
                    Remover
                  </button>
                )}

              </div>

            </div>

          ))

        ) : (

          <div className="py-24 text-center opacity-20 flex flex-col items-center gap-4">

            <Filter className="w-16 h-16" />

            <p className="text-[12px] font-black uppercase tracking-[0.5em]">
              Nenhuma Operação
            </p>

          </div>

        )}

      </div>

    </div>
  );
};

export default HistoryPanel;