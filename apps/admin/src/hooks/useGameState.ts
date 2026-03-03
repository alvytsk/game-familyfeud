import { create } from 'zustand';
import type { GameState, QuestionPack } from '@familyfeud/shared';

type PackSummary = Pick<QuestionPack, 'id' | 'name' | 'description'>;

interface AdminStore {
  authenticated: boolean;
  authError: string | null;
  gameState: GameState | null;
  packs: PackSummary[];
  error: string | null;

  setAuthenticated: (v: boolean) => void;
  setAuthError: (err: string | null) => void;
  setGameState: (state: GameState) => void;
  setPacks: (packs: PackSummary[]) => void;
  setError: (err: string | null) => void;
}

export const useGameStore = create<AdminStore>((set) => ({
  authenticated: false,
  authError: null,
  gameState: null,
  packs: [],
  error: null,

  setAuthenticated: (v) => set({ authenticated: v, authError: null }),
  setAuthError: (err) => set({ authError: err }),
  setGameState: (state) => set({ gameState: state }),
  setPacks: (packs) => set({ packs }),
  setError: (err) => set({ error: err }),
}));
