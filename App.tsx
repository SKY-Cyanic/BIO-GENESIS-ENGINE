import React, { useState, useEffect } from 'react';
import { Dna, Sparkles, AlertTriangle, ChevronRight, Cpu, Globe, Box, LayoutGrid, Edit3, Check, Database, History } from 'lucide-react';
import { generateCreatureData, generateCreatureImage } from './services/geminiService';
import { saveCreatureToCodex, StoredCreature } from './services/storageService';
import { GenerationState, Language } from './types';
import CodexEntry from './components/CodexEntry';
import EngineDataView from './components/EngineDataView';
import World3D from './components/World3D';
import GlobalCodex from './components/GlobalCodex';

// --- Constants & Types for Guided Mode ---
type Category = 'habitat' | 'diet' | 'structure' | 'trait';

interface Option {
  id: string;
  labelEn: string;
  labelKo: string;
}

const GUIDED_OPTIONS: Record<Category, Option[]> = {
  habitat: [
    { id: 'Forest', labelEn: 'Jungle/Forest', labelKo: '밀림/숲' },
    { id: 'Ocean', labelEn: 'Deep Ocean', labelKo: '심해' },
    { id: 'Desert', labelEn: 'Desert', labelKo: '사막' },
    { id: 'Tundra', labelEn: 'Frozen Tundra', labelKo: '설원' },
    { id: 'Volcano', labelEn: 'Volcanic', labelKo: '화산 지대' },
    { id: 'Space', labelEn: 'Zero-G Space', labelKo: '무중력 우주' },
    { id: 'Urban', labelEn: 'Ruined City', labelKo: '폐허 도시' },
  ],
  diet: [
    { id: 'Carnivore', labelEn: 'Carnivore', labelKo: '육식' },
    { id: 'Herbivore', labelEn: 'Herbivore', labelKo: '초식' },
    { id: 'Omnivore', labelEn: 'Omnivore', labelKo: '잡식' },
    { id: 'Photosynthesis', labelEn: 'Photosynthesis', labelKo: '광합성' },
    { id: 'Energy', labelEn: 'Energy Feeder', labelKo: '에너지 섭취' },
    { id: 'Scavenger', labelEn: 'Scavenger', labelKo: '청소 동물' },
  ],
  structure: [
    { id: 'Mammalian', labelEn: 'Mammalian', labelKo: '포유류형' },
    { id: 'Reptilian', labelEn: 'Reptilian', labelKo: '파충류형' },
    { id: 'Insectoid', labelEn: 'Insectoid', labelKo: '곤충형' },
    { id: 'Avian', labelEn: 'Avian', labelKo: '조류형' },
    { id: 'Amorphous', labelEn: 'Amorphous', labelKo: '점액/무형' },
    { id: 'Silicon', labelEn: 'Crystalline', labelKo: '수정/광물형' },
    { id: 'Mechanical', labelEn: 'Bio-Mechanical', labelKo: '기계/생체공학' },
  ],
  trait: [
    { id: 'Bioluminescent', labelEn: 'Bioluminescence', labelKo: '생체 발광' },
    { id: 'Armored', labelEn: 'Heavy Armor', labelKo: '중장갑' },
    { id: 'Speed', labelEn: 'Supersonic', labelKo: '초고속' },
    { id: 'Stealth', labelEn: 'Camouflage', labelKo: '위장/은신' },
    { id: 'Toxic', labelEn: 'Venomous', labelKo: '맹독' },
    { id: 'Psionic', labelEn: 'Psionic', labelKo: '정신 감응' },
  ]
};

// Helper Component for Select Buttons
const SelectButton: React.FC<{ 
  selected: boolean; 
  onClick: () => void; 
  children: React.ReactNode 
}> = ({ selected, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded text-xs font-mono transition-all border flex items-center gap-2 ${
      selected 
        ? 'bg-bio-accent/20 border-bio-accent text-bio-accent shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
    }`}
  >
    {selected && <Check size={12} />}
    {children}
  </button>
);

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'generator' | 'archives'>('generator');
  const [viewMode, setViewMode] = useState<'dashboard' | 'simulation'>('dashboard');
  
  // New State for Guided Mode
  const [inputMode, setInputMode] = useState<'direct' | 'guided'>('direct');
  const [guidedSelections, setGuidedSelections] = useState<Record<Category, string>>({
    habitat: '',
    diet: '',
    structure: '',
    trait: ''
  });

  const [state, setState] = useState<GenerationState>({
    status: 'idle',
    data: null,
    imageUrl: null
  });

  const toggleSelection = (category: Category, id: string) => {
    setGuidedSelections(prev => ({
      ...prev,
      [category]: prev[category] === id ? '' : id
    }));
  };

  const handleGenerate = async () => {
    let finalPrompt = prompt;

    // Construct prompt if in Guided Mode
    if (inputMode === 'guided') {
      const { habitat, diet, structure, trait } = guidedSelections;
      const parts = [];
      if (habitat) parts.push(`Habitat: ${habitat}`);
      if (diet) parts.push(`Diet: ${diet}`);
      if (structure) parts.push(`Biological Structure: ${structure}`);
      if (trait) parts.push(`Key Trait: ${trait}`);
      
      if (parts.length === 0) {
         // Fallback if nothing selected
         finalPrompt = "A random, scientifically plausible alien creature.";
      } else {
         finalPrompt = `Design a scientifically plausible creature with these characteristics: ${parts.join(', ')}. Ensure it fits its environment perfectly.`;
      }
    }

    if (!finalPrompt.trim()) return;

    setState(prev => ({ ...prev, status: 'generating_data', error: undefined }));
    setViewMode('dashboard'); 

    try {
      // Step 1: Generate Data
      const data = await generateCreatureData(finalPrompt, language);
      setState(prev => ({ ...prev, status: 'generating_image', data }));

      // Step 2: Generate Image
      const imageUrl = await generateCreatureImage(data.engine_data.visual_generation_prompt);
      
      // Step 3: Save to Archives
      if (imageUrl && data) {
        saveCreatureToCodex(data, imageUrl);
      }

      setState(prev => ({ ...prev, status: 'complete', imageUrl }));

    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: err instanceof Error ? err.message : 'Unknown biological synthesis error'
      }));
    }
  };

  const handleLoadFromArchive = (archived: StoredCreature) => {
    setState({
      status: 'complete',
      data: archived.data,
      imageUrl: archived.imageUrl
    });
    setActiveTab('generator');
    setViewMode('dashboard');
  };

  const isGenerateDisabled = () => {
    if (state.status === 'generating_data' || state.status === 'generating_image') return true;
    if (inputMode === 'direct') return !prompt.trim();
    return false;
  };

  return (
    <div className="min-h-screen bg-bio-dark text-bio-text selection:bg-bio-accent selection:text-bio-dark font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="bg-bio-accent/10 p-2 rounded-full">
              <Dna className="text-bio-accent" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider text-white">BIO-GENESIS <span className="text-bio-accent">ENGINE</span></h1>
              <p className="text-[10px] text-bio-muted font-mono uppercase tracking-widest">v3.1.0 // ARCHIVES_ONLINE</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Main Navigation */}
            <nav className="flex bg-slate-900/80 rounded-lg p-1 border border-slate-700/50">
              <button 
                onClick={() => setActiveTab('generator')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'generator' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Sparkles size={14} />
                {language === 'ko' ? '생성' : 'GENERATE'}
              </button>
              <button 
                onClick={() => setActiveTab('archives')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'archives' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Database size={14} />
                {language === 'ko' ? '백과사전' : 'ARCHIVES'}
              </button>
            </nav>

            {/* Language Toggle */}
            <div className="hidden md:flex items-center bg-slate-900 rounded-full p-1 border border-slate-700">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${language === 'en' ? 'bg-bio-accent text-bio-dark' : 'text-slate-500 hover:text-slate-300'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('ko')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${language === 'ko' ? 'bg-bio-accent text-bio-dark' : 'text-slate-500 hover:text-slate-300'}`}
              >
                KR
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-grow w-full">
        {activeTab === 'archives' ? (
          <GlobalCodex onLoadCreature={handleLoadFromArchive} language={language} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Left Panel: Input & Codex */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Input Area */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <label className="block text-sm font-bold text-bio-muted uppercase tracking-wide">
                     {language === 'ko' ? '생물학적 파라미터 설정' : 'Biological Parameters Setup'}
                   </label>
                   
                   {/* Input Mode Toggle */}
                   <div className="flex bg-slate-900 rounded p-1 border border-slate-700">
                      <button
                        onClick={() => setInputMode('direct')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${inputMode === 'direct' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <Edit3 size={12} /> {language === 'ko' ? '직접 입력' : 'Direct Input'}
                      </button>
                      <button
                        onClick={() => setInputMode('guided')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${inputMode === 'guided' ? 'bg-bio-accent text-bio-dark' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <LayoutGrid size={12} /> {language === 'ko' ? '가이드 모드' : 'Guided Mode'}
                      </button>
                   </div>
                 </div>

                 <div className="relative bg-slate-900/80 border border-slate-700 rounded-lg p-4 min-h-[180px] flex flex-col shadow-lg">
                   
                   {inputMode === 'direct' ? (
                     <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={language === 'ko' ? "생물학적 컨셉을 입력하세요 (예: '전기를 먹는 실리콘 기반 생명체', '광합성 피부를 가진 날아다니는 고래')..." : "Enter biological concepts (e.g., 'silicon-based lifeform that eats electricity')..."}
                        className="w-full flex-1 bg-transparent border-none focus:outline-none text-sm font-mono text-slate-300 placeholder-slate-600 resize-none"
                        disabled={state.status === 'generating_data' || state.status === 'generating_image'}
                     />
                   ) : (
                     <div className="space-y-4 pb-12">
                        {(Object.keys(GUIDED_OPTIONS) as Category[]).map((category) => (
                          <div key={category} className="space-y-2">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1 mb-2">
                               {category}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {GUIDED_OPTIONS[category].map((opt) => (
                                <SelectButton
                                  key={opt.id}
                                  selected={guidedSelections[category] === opt.id}
                                  onClick={() => toggleSelection(category, opt.id)}
                                >
                                  {language === 'ko' ? opt.labelKo : opt.labelEn}
                                </SelectButton>
                              ))}
                            </div>
                          </div>
                        ))}
                     </div>
                   )}

                   <div className="absolute bottom-4 right-4">
                     <button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled()}
                        className="bg-bio-accent hover:bg-cyan-400 text-bio-dark font-bold py-2 px-6 rounded shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
                     >
                       {state.status === 'generating_data' ? (language === 'ko' ? 'DNA 합성 중...' : 'Synthesizing DNA...') : 
                        state.status === 'generating_image' ? (language === 'ko' ? '유기체 렌더링 중...' : 'Rendering Organism...') : 
                        <>{language === 'ko' ? '합성 실행' : 'Execute Synthesis'} <ChevronRight size={16} /></>}
                     </button>
                   </div>
                 </div>
              </div>

              {/* Error Display */}
              {state.status === 'error' && (
                <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-lg flex items-center gap-3 text-red-400">
                  <AlertTriangle size={20} />
                  <span className="text-sm font-mono">{state.error}</span>
                </div>
              )}

              {/* Codex Display */}
              {state.data && (
                 <CodexEntry codex={state.data.codex} taxonomy={state.data.engine_data.taxonomy} language={language} />
              )}
            </div>

            {/* Right Panel: Visuals & Engine Data */}
            <div className="lg:col-span-5 space-y-6">
               {state.data ? (
                  <>
                    {/* View Toggle Controls */}
                    <div className="flex space-x-2 mb-2">
                      <button
                        onClick={() => setViewMode('dashboard')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors ${viewMode === 'dashboard' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                      >
                        {language === 'ko' ? '데이터 뷰' : 'Data Dashboard'}
                      </button>
                      <button
                        onClick={() => setViewMode('simulation')}
                        disabled={!state.imageUrl}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 ${viewMode === 'simulation' ? 'bg-bio-secondary/20 text-bio-secondary border border-bio-secondary' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'} disabled:opacity-30`}
                      >
                         <Box size={14} />
                         {language === 'ko' ? '3D 시뮬레이션' : '3D Simulation'}
                      </button>
                    </div>

                    {viewMode === 'simulation' && state.imageUrl ? (
                       <World3D imageUrl={state.imageUrl} name={state.data.codex.common_name} />
                    ) : (
                      <div className="relative aspect-square bg-slate-900 rounded-lg border border-slate-700 overflow-hidden group shadow-2xl">
                        {state.imageUrl ? (
                          <>
                             <img 
                               src={state.imageUrl} 
                               alt="Synthesized Organism" 
                               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                             />
                             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bio-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] text-slate-400 font-mono truncate">{state.data.engine_data.visual_generation_prompt}</p>
                             </div>
                          </>
                        ) : state.status === 'generating_image' ? (
                           <div className="w-full h-full flex flex-col items-center justify-center text-bio-accent space-y-4 animate-pulse">
                              <Sparkles size={48} className="animate-spin-slow" />
                              <span className="text-xs font-mono uppercase tracking-widest">
                                {language === 'ko' ? '비주얼 모델 생성 중...' : 'Generating Visual Model...'}
                              </span>
                           </div>
                        ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-slate-700">
                              <AlertTriangle size={48} />
                              <span className="text-xs font-mono mt-2">Visual Synthesis Failed</span>
                           </div>
                        )}
                      </div>
                    )}

                    {/* Engine Stats */}
                    {viewMode === 'dashboard' && (
                      <EngineDataView data={state.data.engine_data} language={language} />
                    )}
                  </>
               ) : (
                  /* Empty State Right Panel */
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 border-2 border-dashed border-slate-800 rounded-lg min-h-[400px]">
                    <Cpu size={64} className="mb-4 opacity-20" />
                    <p className="text-sm font-mono uppercase tracking-widest">
                      {language === 'ko' ? '입력 데이터 대기 중' : 'Awaiting Input Data'}
                    </p>
                  </div>
               )}
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950 text-center">
        <p className="text-[10px] text-slate-600 font-mono">
          POWERED BY GEMINI 2.5 // BIO-GENESIS ENGINE PROTOTYPE // SECURE CONNECTION
        </p>
      </footer>
    </div>
  );
};

export default App;