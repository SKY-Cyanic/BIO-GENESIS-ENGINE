import React, { useEffect, useState } from 'react';
import { getCodexArchives, StoredCreature } from '../services/storageService';
import { Language } from '../types';
import { Database, Clock, ArrowRight, Trash2 } from 'lucide-react';

interface GlobalCodexProps {
  onLoadCreature: (creature: StoredCreature) => void;
  language: Language;
}

const GlobalCodex: React.FC<GlobalCodexProps> = ({ onLoadCreature, language }) => {
  const [archives, setArchives] = useState<StoredCreature[]>([]);

  useEffect(() => {
    const data = getCodexArchives();
    setArchives(data);
  }, []);

  const labels = {
    title: language === 'ko' ? '생명체 보관소' : 'Creature Archives',
    empty: language === 'ko' ? '저장된 생명체 데이터가 없습니다.' : 'No creature data found in archives.',
    load: language === 'ko' ? '데이터 로드' : 'LOAD DATA',
    date: language === 'ko' ? '발견일' : 'Date Discovered',
    clear: language === 'ko' ? '초기화' : 'Clear All'
  };

  if (archives.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-600 border border-slate-800 rounded-lg bg-slate-900/50">
        <Database size={48} className="mb-4 opacity-50" />
        <p className="font-mono text-sm">{labels.empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-bio-accent tracking-tight flex items-center gap-3">
          <Database /> {labels.title} <span className="text-sm font-mono text-slate-500">({archives.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archives.map((entry) => (
          <div 
            key={entry.id}
            onClick={() => onLoadCreature(entry)}
            className="group relative bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-bio-accent transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            {/* Image Preview */}
            <div className="h-40 w-full bg-black relative overflow-hidden">
              <img 
                src={entry.imageUrl} 
                alt={entry.data.codex.common_name} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                <span className="text-[10px] font-mono text-bio-secondary bg-bio-secondary/10 px-2 py-0.5 rounded border border-bio-secondary/20">
                  {entry.data.engine_data.taxonomy.class}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-lg text-slate-200 group-hover:text-bio-accent truncate">
                {entry.data.codex.common_name}
              </h3>
              <p className="text-xs text-slate-500 font-mono italic truncate">
                {entry.data.codex.scientific_name}
              </p>
              
              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                 <span className="text-[10px] text-slate-600 flex items-center gap-1">
                   <Clock size={10} /> {new Date(entry.timestamp).toLocaleDateString()}
                 </span>
                 <button className="text-[10px] font-bold text-bio-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   {labels.load} <ArrowRight size={10} />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalCodex;