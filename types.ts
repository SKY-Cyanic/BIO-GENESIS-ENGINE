export type Language = 'en' | 'ko';

export interface Trait {
  name: string;
  effect: string;
  biological_basis: string;
}

export interface Taxonomy {
  class: string;
  diet: string;
}

export interface Stats {
  hp: number;
  speed: number;
  intelligence: number;
  stealth: number;
}

export interface BehaviorTree {
  idle: string;
  combat: string;
  mating: string;
}

export interface EngineData {
  entity_id: string;
  taxonomy: Taxonomy;
  stats: Stats;
  traits: Trait[];
  weaknesses: string[];
  visual_generation_prompt: string;
  behavior_tree: BehaviorTree;
}

export interface Codex {
  scientific_name: string;
  common_name: string;
  biological_description: string;
  ecological_role: string;
}

export interface CreatureResponse {
  codex: Codex;
  engine_data: EngineData;
}

export interface GenerationState {
  status: 'idle' | 'generating_data' | 'generating_image' | 'complete' | 'error';
  data: CreatureResponse | null;
  imageUrl: string | null;
  error?: string;
}