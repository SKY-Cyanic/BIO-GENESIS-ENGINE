import React from 'react';
import { Codex, Taxonomy, Language } from '../types';
import { FileText, Activity, Dna } from 'lucide-react';

interface CodexEntryProps {
  codex: Codex;
  taxonomy: Taxonomy;
  language: Language;
}

const CodexEntry: React.FC<CodexEntryProps> = ({ codex, taxonomy, language }) => {
  const labels = {
    class: language === 'ko' ? '계급' : 'CLASS',
    diet: language === 'ko' ? '식성' : 'DIET',
    bioDesc: language === 'ko' ? '생물학적 설명' : 'Biological Description',
    ecoRole: language === 'ko' ? '생태적 역할' : 'Ecological Role',
  };

  return (
    <div className="space-y-6 p-6 bg-bio-panel/50 rounded-lg border border-slate-700 shadow-lg backdrop-blur-sm">
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-3xl font-bold text-bio-accent tracking-tighter">{codex.common_name}</h2>
        <p className="text-sm text-bio-secondary italic font-mono mt-1">{codex.scientific_name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-mono text-bio-muted">
        <div className="flex items-center gap-2">
          <Dna size={14} />
          <span>{labels.class}: <span className="text-bio-text">{taxonomy.class.toUpperCase()}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Activity size={14} />
          <span>{labels.diet}: <span className="text-bio-text">{taxonomy.diet.toUpperCase()}</span></span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold text-bio-muted uppercase tracking-widest mb-2 flex items-center gap-2">
            <FileText size={12} /> {labels.bioDesc}
          </h3>
          <p className="text-sm leading-relaxed text-slate-300 text-justify">
            {codex.biological_description}
          </p>
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-bio-muted uppercase tracking-widest mb-2 flex items-center gap-2">
            <Activity size={12} /> {labels.ecoRole}
          </h3>
          <p className="text-sm leading-relaxed text-slate-300 text-justify">
            {codex.ecological_role}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodexEntry;