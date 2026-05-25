import React, { useState, useEffect } from 'react';
import { SignalType, TradeHistoryItem, SignalTimingMode } from '../types';
import { X, Save, DollarSign } from 'lucide-react';

interface SaveOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: TradeHistoryItem) => void;
  defaultAsset?: string;
  defaultType?: SignalType;
  defaultTimeframe?: string;
  defaultConfidence?: number;
  defaultEntry?: number;
  defaultStop?: number;
  defaultTake?: number;
  defaultInvalidation?: number;
  defaultTimingMode?: SignalTimingMode;
  userId?: string;
  userName?: string;
}

const SaveOperationModal: React.FC<SaveOperationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultAsset = '',
  defaultType = SignalType.BUY,
  defaultTimeframe = '60',
  defaultConfidence,
  defaultEntry,
  defaultStop,
  defaultTake,
  defaultInvalidation,
  defaultTimingMode,
  userId = 'local',
  userName = 'Operador',
}) => {
  const [asset, setAsset] = useState(defaultAsset);
  const [type, setType] = useState<SignalType>(defaultType);
  const [entryValue, setEntryValue] = useState(defaultEntry ?? 100);
  const [result, setResult] = useState<'WIN' | 'LOSS' | 'PENDING'>('PENDING');
  const [profit, setProfit] = useState(0);
  const [notes, setNotes] = useState('');
  const [timeframe, setTimeframe] = useState(defaultTimeframe);

  useEffect(() => {
    if (!isOpen) return;
    setAsset(defaultAsset);
    setType(defaultType);
    setTimeframe(defaultTimeframe);
    setEntryValue(defaultEntry ?? 100);
    setResult('PENDING');
    setProfit(0);
    setNotes('');
  }, [
    isOpen,
    defaultAsset,
    defaultType,
    defaultTimeframe,
    defaultEntry,
  ]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      id: `OP-${Date.now()}`,
      userId,
      userName,
      asset,
      type,
      result,
      profit,
      entryValue,
      timeframe,
      timestamp: new Date(),
      notes: notes || undefined,
      confidence: defaultConfidence,
      entry: defaultEntry ?? entryValue,
      stop: defaultStop,
      take: defaultTake,
      invalidation: defaultInvalidation,
      timingMode: defaultTimingMode,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <div className="w-full max-w-md bg-[#081018] border border-blue-500/20 rounded-[2rem] p-5 md:p-8 shadow-[0_0_50px_rgba(59,130,246,0.2)] space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Save className="w-5 h-5" />
            </div>

            <h3 className="text-lg md:text-xl font-black uppercase italic text-white">
              Salvar Operação
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-5">

          {/* PAR */}
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Ativo
            </label>

            <input
              value={asset}
              onChange={e => setAsset(e.target.value.toUpperCase())}
              placeholder="BTCUSD"
              className="w-full mt-2 bg-black/40 border border-white/10 p-4 rounded-2xl text-white font-black uppercase outline-none focus:border-blue-500"
            />
          </div>

          {/* DIREÇÃO */}
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Direção
            </label>

            <div className="grid grid-cols-2 gap-3 mt-2">

              <button
                onClick={() => setType(SignalType.BUY)}
                className={`py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                  type === SignalType.BUY
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-black/40 border border-white/10 text-zinc-500'
                }`}
              >
                COMPRA
              </button>

              <button
                onClick={() => setType(SignalType.SELL)}
                className={`py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                  type === SignalType.SELL
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-black/40 border border-white/10 text-zinc-500'
                }`}
              >
                VENDA
              </button>

            </div>
          </div>

          {/* ENTRADA */}
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Valor Entrada
            </label>

            <div className="relative mt-2">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />

              <input
                type="number"
                value={entryValue}
                onChange={e => setEntryValue(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 p-4 pl-12 rounded-2xl text-blue-400 font-black outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* RESULTADO */}
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Resultado
            </label>

            <div className="grid grid-cols-3 gap-2 mt-2">

              {(['WIN', 'LOSS', 'PENDING'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setResult(r);

                    if (r === 'WIN') {
                      setProfit(entryValue * 0.85);
                    } else if (r === 'LOSS') {
                      setProfit(-entryValue);
                    } else {
                      setProfit(0);
                    }
                  }}
                  className={`py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                    result === r
                      ? r === 'WIN'
                        ? 'bg-green-600 text-white'
                        : r === 'LOSS'
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-700 text-white'
                      : 'bg-black/40 border border-white/10 text-zinc-500'
                  }`}
                >
                  {r}
                </button>
              ))}

            </div>
          </div>

          {/* LUCRO */}
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Lucro
            </label>

            <input
              type="number"
              value={profit}
              onChange={e => setProfit(Number(e.target.value))}
              className="w-full mt-2 bg-black/40 border border-white/10 p-4 rounded-2xl text-white font-black outline-none focus:border-blue-500"
            />
          </div>

          {/* TIMEFRAME */}
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Timeframe
            </label>

            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
              className="w-full mt-2 bg-black/40 border border-white/10 p-4 rounded-2xl text-white font-black outline-none focus:border-blue-500"
            >
              <option value="1">M1</option>
              <option value="5">M5</option>
              <option value="15">M15</option>
              <option value="60">H1</option>
              <option value="240">H4</option>
              <option value="D">D1</option>
            </select>
          </div>

          {/* OBS */}
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Observações
            </label>

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Notas operacionais..."
              className="w-full mt-2 bg-black/40 border border-white/10 p-4 rounded-2xl text-zinc-300 outline-none focus:border-blue-500 resize-none"
            />
          </div>

        </div>

        {/* BOTÃO */}
        <button
          onClick={handleSave}
          className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-[0.3em] text-white transition-all active:scale-95"
        >
          SALVAR OPERAÇÃO
        </button>

      </div>
    </div>
  );
};

export default SaveOperationModal;