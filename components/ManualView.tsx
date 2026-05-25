import React, { useState } from 'react';
import { 
  BookOpen, Download, ShieldCheck, Zap, Target, 
  Info, Lock, Activity, BarChart2, ShieldAlert,
  ChevronDown, Trophy, Cpu, Microscope, Search, 
  Layers, Waves, TrendingUp, Gauge, ArrowRightLeft,
  CircleDot, LayoutGrid, FileText
} from 'lucide-react';

const ManualView: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('indicators');

  const indicators = [
    { name: 'RSI (Força Relativa)', desc: 'Detecta exaustão de compradores/vendedores e possíveis zonas de reversão.', icon: TrendingUp },
    { name: 'MACD (Convergência)', desc: 'Filtra o momentum e confirma a direção da tendência macro.', icon: Waves },
    { name: 'VWAP (Preço Médio)', desc: 'Identifica o preço justo institucional, servindo como ímã para o mercado.', icon: Target },
    { name: 'HFT Volume (Algoritmos)', desc: 'Capta entradas massivas de robôs de alta frequência e agressão institucional.', icon: Activity },
    { name: 'Order Blocks (SMC)', desc: 'Mapeia zonas de oferta e demanda onde os grandes bancos deixaram ordens pendentes.', icon: Lock },
    { name: 'Fair Value Gap (FVG)', desc: 'Identifica vácuos de liquidez (desequilíbrios) que o mercado tende a preencher.', icon: Layers },
    { name: 'EMA Cross (20/50/200)', desc: 'Cruza médias exponenciais para validar o início de novas micro-tendências.', icon: ArrowRightLeft },
    { name: 'Bollinger Bands', desc: 'Mede a compressão e expansão da volatilidade para prever explosões de preço.', icon: Search },
    { name: 'ATR (Volatilidade)', desc: 'Ajusta automaticamente a distância do Stop Loss com base no ruído do mercado.', icon: Gauge },
    { name: 'ADX (Força da Tendência)', desc: 'Garante que o sinal só seja disparado em mercados com tendência definida.', icon: TrendingUp },
    { name: 'BOS / CHOCH (Estrutura)', desc: 'Valida a quebra de estrutura ou mudança de caráter do mercado (Trend Change).', icon: LayoutGrid },
    { name: 'Ichimoku Cloud', desc: 'Filtra a nuvem de suporte/resistência dinâmica para evitar falsos rompimentos.', icon: Search },
  ];

  const sections = [
    {
      id: 'indicators',
      icon: Microscope,
      title: 'Os 12 Pilares Quantitativos',
      subtitle: 'A ciência por trás da nossa precisão institucional',
      content: (
        <div className="space-y-8">
          <p className="text-[10px] text-zinc-400 leading-relaxed italic">
            O algoritmo <strong>Lux Trader FX</strong> não opera baseado em um único fator. Ele exige a convergência de no mínimo 8 dos 12 indicadores abaixo para validar um sinal.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {indicators.map((ind, idx) => (
              <div key={idx} className="bg-black/40 p-5 rounded-2xl border border-white/5 space-y-3 group hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <ind.icon className="w-4 h-4" />
                  </div>
                  <h6 className="text-[10px] font-black text-white uppercase italic tracking-tighter">{ind.name}</h6>
                </div>
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider leading-relaxed">
                  {ind.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="p-5 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-center">
            <p className="text-[9px] font-black text-blue-400 uppercase italic">Confluência LUX: A matemática vencendo a intuição.</p>
          </div>
        </div>
      )
    },
    {
      id: 'onboarding',
      icon: Download,
      title: 'Instalação & Acesso Seguro',
      subtitle: 'Como preparar seu terminal para alta performance',
      content: (
        <div className="space-y-4">
          <p className="text-[10px] text-zinc-400">Para garantir a menor latência e estabilidade, o <strong>Lux Trader FX</strong> deve ser utilizado como um <strong>PWA (Progressive Web App)</strong>.</p>
          <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 space-y-2">
            <h5 className="text-[10px] font-black text-blue-400 uppercase">Passo a Passo:</h5>
            <ol className="text-[9px] space-y-2 list-decimal ml-4 text-zinc-400">
              <li>No navegador (Chrome/Safari), clique no ícone de compartilhamento ou menu.</li>
              <li>Selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
              <li>Abra o app diretamente pelo ícone na sua home screen.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'hud',
      icon: Activity,
      title: 'Interpretando a Telemetria',
      subtitle: 'Entenda os dados do seu Painel HUD',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-[7px] font-black text-zinc-600 uppercase block mb-1">LATENCY (MS)</span>
              <p className="text-[10px] text-blue-400 font-bold">Tempo de resposta entre o terminal e os nós da Lux Cloud.</p>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-[7px] font-black text-zinc-600 uppercase block mb-1">SCORE LUX (%)</span>
              <p className="text-[10px] text-zinc-400 font-bold">Probabilidade estatística baseada em confluências históricas.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'safelift',
      icon: ShieldCheck,
      title: 'Safe Lift: Trava de Segurança',
      subtitle: 'A inteligência que protege seu capital',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
               <Trophy className="w-6 h-6 text-green-500" />
               <div className="flex-1">
                  <h6 className="text-[10px] font-black text-green-500 uppercase">Meta Diária (Target)</h6>
                  <p className="text-[8px] text-zinc-500 uppercase font-bold">Protege você da ganância.</p>
               </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
               <ShieldAlert className="w-6 h-6 text-red-500" />
               <div className="flex-1">
                  <h6 className="text-[10px] font-black text-red-500 uppercase">Stop Diário (Protection)</h6>
                  <p className="text-[8px] text-zinc-500 uppercase font-bold">Impede que um dia ruim destrua sua conta.</p>
               </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-3xl mx-auto pb-48 animate-in fade-in duration-700">
      <div className="flex flex-col items-center text-center space-y-5">
        <div className="p-5 bg-blue-600/10 rounded-full border border-blue-500/20">
          <BookOpen className="w-10 h-10 text-blue-500" />
        </div>
        <div>
          <h2 className="text-4xl font-black uppercase italic text-white tracking-tighter">Manual do Operador</h2>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Protocolos de Elite Lux Trader FX</p>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="glass-morphism rounded-[2.5rem] overflow-hidden border border-white/5 transition-all hover:border-blue-500/20 shadow-xl">
            <button 
              onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              className="w-full p-8 flex items-center justify-between text-left transition-all"
            >
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl border transition-all ${openSection === section.id ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-black/40 border-white/10 text-zinc-600'}`}>
                   <section.icon className="w-6 h-6" />
                </div>
                <div>
                   <span className={`text-[12px] font-black uppercase tracking-widest block italic leading-none ${openSection === section.id ? 'text-white' : 'text-zinc-400'}`}>
                     {section.title}
                   </span>
                   <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1.5 block leading-none">
                     {section.subtitle}
                   </span>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-zinc-700 transition-transform duration-500 ${openSection === section.id ? 'rotate-180 text-blue-500' : ''}`} />
            </button>
            
            {openSection === section.id && (
              <div className="px-10 pb-10">
                <div className="h-px w-full bg-white/5 mb-8"></div>
                <div className="bg-black/30 p-8 rounded-[2rem] border border-white/5">
                   {section.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-600/5 border border-blue-500/10 p-10 rounded-[4rem] flex gap-6">
        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shrink-0">
           <Info className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h5 className="text-[12px] font-black text-white uppercase italic tracking-widest">Suporte ao Operador</h5>
          <p className="text-[10px] font-medium text-zinc-400 leading-relaxed italic">
            Consulte o <strong>Administrador</strong> através da aba de notificações para suporte técnico em tempo real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualView;