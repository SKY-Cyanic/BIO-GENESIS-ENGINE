import { CreatureResponse } from '../types';

export interface StoredCreature {
  id: string;
  timestamp: number;
  data: CreatureResponse;
  imageUrl: string;
}

const STORAGE_KEY = 'bio-genesis-archives';

export const saveCreatureToCodex = (data: CreatureResponse, imageUrl: string) => {
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    const archives: StoredCreature[] = existingData ? JSON.parse(existingData) : [];
    
    const newEntry: StoredCreature = {
      id: data.engine_data.entity_id || Date.now().toString(),
      timestamp: Date.now(),
      data,
      imageUrl
    };

    // Prevent duplicates based on ID
    const isDuplicate = archives.some(entry => entry.id === newEntry.id);
    if (!isDuplicate) {
      // Add to beginning
      const updatedArchives = [newEntry, ...archives];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedArchives));
    }
  } catch (error) {
    console.error("Failed to save to archives:", error);
  }
};

export const getCodexArchives = (): StoredCreature[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load archives:", error);
    return [];
  }
};

export const clearArchives = () => {
  localStorage.removeItem(STORAGE_KEY);
};