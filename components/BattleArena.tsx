import React, { useState, useEffect } from 'react';
import { getCodexArchives, StoredCreature } from '../services/storageService';
import { simulateBattle } from '../services/geminiService';
import { Language } from '../types';
import { Swords, Shield, Zap, Loader2, Trophy, Image as ImageIcon, ChevronDown, ChevronUp, ScrollText } from 'lucide-react';
import StatsRadar from './StatsRadar';

interface BattleArenaProps {
  language: Language;
}

// Simple Markdown Renderer Component
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-4 text-slate-300">
      {paragraphs.map((para, i) => {
        // Simple bold parsing (**text**)
        const parts = para.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className="leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-bio-accent font-bold">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

const BattleArena: React.FC<BattleArenaProps> = ({ language }) => {
  const [creatures, setCreatures] = useState<StoredCreature[]>([]);
  const [selected1, setSelected1] = useState<StoredCreature | null>(null);
  const [selected2, setSelected2] = useState<StoredCreature | null>(null);
  
  const [battleResult, setBattleResult] = useState<{
    summary: string;
    log: string;
    winner: string;
    imageUrl: string | null;
  } | null>(null);

  const [isFighting, setIsFighting] = useState(false);
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);

  useEffect(() => {
    getCodexArchives().then(setCreatures);
  }, []);

  const handleFight = async () => {
    if (!selected1 || !selected2) return;
    setIsFighting(true);
    setBattleResult(null);
    setShowDeepAnalysis(false);
    
    const result = await simulateBattle(selected1.data, selected2.data, language);
    
    setBattleResult(result);
    setIsFighting(false);
  };

  const labels = {
    select1: language === 'ko' ? '도전자 1 선택' : 'Select Challenger 1',
    select2: language === 'ko' ? '도전자 2 선택' : 'Select Challenger 2',
    fight: language === 'ko' ? '시뮬레이션 시작' : 'INITIATE SIMULATION',
    vs: 'VS',
    analyzing: language === 'ko' ? '전투 데이터 분석 및 장면 생성 중...' : 'ANALYZING COMBAT & RENDERING SCENE...',
    empty: language === 'ko' ? '전투 가능한 생명체가 부족합니다 (최소 2마리 저장 필요).' : 'Insufficient biomass. Archive at least 2 creatures to enable simulation.',
    winner: language === 'ko' ? '승자' : 'WINNER',
    deepAnalysis: language === 'ko' ? '심층 전투 분석' : 'DEEP COMBAT ANALYSIS',
    show: language === 'ko' ? '보기' : 'SHOW',
    hide: language === 'ko' ? '숨기기' : 'HIDE'
  };

  if (creatures.length < 2) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-slate-800 bg-slate-900/50 rounded-lg p-8">
        <Swords size={48} className="mb-4 opacity-50" />
        <p className="font-mono text-center">{labels.empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Selection Area */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
        
        {/* Fighter 1 */}
        <div className={`col-span-3 border p-4 rounded-lg transition-all ${selected1 ? 'bg-blue-950/30 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-900 border-slate-700'}`}>
           <h3 className="text-blue-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
             <Shield size={14} /> Challenger A
           </h3>
           <select 
             className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded p-2 focus:border-blue-500 outline-none"
             onChange={(e) => setSelected1(creatures.find(c => c.id === e.target.value) || null)}
             value={selected1?.id || ''}
           >
             <option value="">{labels.select1}</option>
             {creatures.map(c => (
               <option key={c.id} value={c.id} disabled={c.id === selected2?.id}>
                 {c.data.codex.common_name}
               </option>
             ))}
           </select>
           
           {selected1 && (
             <div className="mt-4 space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-blue-500/30">
                  <img src={selected1.imageUrl} className="w-full h-full object-cover" />
                </div>
                <div className="h-40">
                  <StatsRadar stats={selected1.data.engine_data.stats} language={language} />
                </div>
                <div className="text-[10px] text-blue-300 font-mono text-center">
                   {selected1.data.engine_data.taxonomy.class} / {selected1.data.engine_data.taxonomy.diet}
                </div>
             </div>
           )}
        </div>

        {/* VS Badge */}
        <div className="col-span-1 flex justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center font-black italic text-slate-400">
            VS
          </div>
        </div>

        {/* Fighter 2 */}
        <div className={`col-span-3 border p-4 rounded-lg transition-all ${selected2 ? 'bg-red-950/30 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-slate-900 border-slate-700'}`}>
           <h3 className="text-red-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
             <Swords size={14} /> Challenger B
           </h3>
           <select 
             className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-sm rounded p-2 focus:border-red-500 outline-none"
             onChange={(e) => setSelected2(creatures.find(c => c.id === e.target.value) || null)}
             value={selected2?.id || ''}
           >
             <option value="">{labels.select2}</option>
             {creatures.map(c => (
               <option key={c.id} value={c.id} disabled={c.id === selected1?.id}>
                 {c.data.codex.common_name}
               </option>
             ))}
           </select>

           {selected2 && (
             <div className="mt-4 space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-red-500/30">
                  <img src={selected2.imageUrl} className="w-full h-full object-cover" />
                </div>
                <div className="h-40">
                  <StatsRadar stats={selected2.data.engine_data.stats} language={language} />
                </div>
                <div className="text-[10px] text-red-300 font-mono text-center">
                   {selected2.data.engine_data.taxonomy.class} / {selected2.data.engine_data.taxonomy.diet}
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleFight}
          disabled={!selected1 || !selected2 || isFighting}
          className="bg-slate-100 hover:bg-white text-slate-900 font-black py-3 px-8 rounded shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest flex items-center gap-2"
        >
          {isFighting ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
          {isFighting ? labels.analyzing : labels.fight}
        </button>
      </div>

      {/* Battle Results */}
      {battleResult && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* Main Result Card */}
          <div className="bg-slate-900/80 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
            
            {/* Visual Header */}
            <div className="relative h-64 md:h-80 bg-black w-full overflow-hidden group">
               {battleResult.imageUrl ? (
                 <>
                   <img src={battleResult.imageUrl} alt="Battle Scene" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                 </>
               ) : (
                 <div className="flex items-center justify-center h-full text-slate-700">
                    <ImageIcon size={48} />
                 </div>
               )}
               
               {/* Winner Badge Over Image */}
               <div className="absolute bottom-6 left-6 right-6 text-center">
                  <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-1 rounded-full border border-yellow-500/50 mb-2 backdrop-blur-sm">
                    <Trophy size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">{labels.winner}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] tracking-tight">
                    {battleResult.winner}
                  </h2>
               </div>
            </div>

            {/* Summary Section */}
            <div className="p-8 text-center bg-gradient-to-b from-slate-900 to-slate-950">
               <p className="text-lg md:text-xl text-bio-accent font-medium leading-relaxed italic">
                 "{battleResult.summary}"
               </p>
            </div>

            {/* Deep Analysis Toggle */}
            <div className="border-t border-slate-800 bg-slate-950 p-2 flex justify-center">
              <button 
                onClick={() => setShowDeepAnalysis(!showDeepAnalysis)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors py-2 px-4 uppercase tracking-widest"
              >
                <ScrollText size={14} />
                {labels.deepAnalysis} 
                {showDeepAnalysis ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Deep Log Section */}
            {showDeepAnalysis && (
              <div className="p-8 border-t border-slate-800 bg-black/40 animate-in fade-in slide-in-from-top-2">
                 <SimpleMarkdown text={battleResult.log} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleArena;