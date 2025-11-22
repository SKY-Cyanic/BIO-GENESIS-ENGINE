import React, { useState } from 'react';
import { EngineData, Trait, Language } from '../types';
import StatsRadar from './StatsRadar';
import { Brain, ShieldAlert, Swords, Heart, Code } from 'lucide-react';

interface EngineDataViewProps {
  data: EngineData;
  language: Language;
}

const EngineDataView: React.FC<EngineDataViewProps> = ({ data, language }) => {
  const [showJson, setShowJson] = useState(false);

  const labels = {
    radar: language === 'ko' ? '생체 능력치' : 'Biometrics Radar',
    trait: language === 'ko' ? '특성' : 'Trait',
    science: language === 'ko' ? '과학적 원리' : 'Science',
    weakness: language === 'ko' ? '치명적 약점' : 'Critical Weaknesses',
    behavior: language === 'ko' ? '행동 루프' : 'Behavior Loop',
    idle: language === 'ko' ? '대기' : 'IDLE',
    combat: language === 'ko' ? '전투' : 'COMBAT',
    mating: language === 'ko' ? '번식' : 'MATING',
    viewJson: language === 'ko' ? '엔진 데이터 보기 (JSON)' : 'View Engine Data (JSON)',
    hideJson: language === 'ko' ? '숨기기' : 'Hide Engine Data'
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="bg-bio-panel/50 p-4 rounded-lg border border-slate-700">
        <h3 className="text-xs font-bold text-bio-accent uppercase tracking-widest mb-4">{labels.radar}</h3>
        <StatsRadar stats={data.stats} language={language} />
      </div>

      {/* Traits Section */}
      <div className="grid gap-4">
        {data.traits.map((trait: Trait, index: number) => (
          <div key={index} className="bg-bio-panel/30 p-4 rounded border-l-2 border-bio-secondary hover:bg-bio-panel/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-bio-text text-sm">{trait.name}</h4>
              <span className="text-[10px] bg-bio-secondary/20 text-bio-secondary px-2 py-0.5 rounded uppercase">{labels.trait}</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">{trait.effect}</p>
            <p className="text-[10px] text-slate-500 font-mono bg-slate-900/50 p-2 rounded">
              {labels.science}: {trait.biological_basis}
            </p>
          </div>
        ))}
      </div>

      {/* Weaknesses */}
      <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg">
        <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <ShieldAlert size={14} /> {labels.weakness}
        </h3>
        <ul className="list-disc list-inside text-xs text-red-200/80 space-y-1">
          {data.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </div>

      {/* Behavior Tree */}
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <h3 className="text-xs font-bold text-bio-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <Brain size={14} /> {labels.behavior}
        </h3>
        <div className="space-y-3 text-xs font-mono">
          <div className="flex gap-3">
            <span className="text-bio-accent min-w-[60px]">{labels.idle}</span>
            <span className="text-slate-400">{data.behavior_tree.idle}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-red-400 min-w-[60px]">{labels.combat}</span>
            <span className="text-slate-400">{data.behavior_tree.combat}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-purple-400 min-w-[60px]">{labels.mating}</span>
            <span className="text-slate-400">{data.behavior_tree.mating}</span>
          </div>
        </div>
      </div>

      {/* JSON Export */}
      <div className="pt-4 border-t border-slate-800">
        <button 
          onClick={() => setShowJson(!showJson)}
          className="text-xs flex items-center gap-2 text-bio-muted hover:text-bio-accent transition-colors"
        >
          <Code size={14} />
          {showJson ? labels.hideJson : labels.viewJson}
        </button>
        
        {showJson && (
          <pre className="mt-4 p-4 bg-slate-950 rounded text-[10px] text-emerald-500 overflow-x-auto font-mono border border-slate-800">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default EngineDataView;