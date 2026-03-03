import type { GameState, TeamId, QuestionPack } from './types.js';

// Admin → Server
export type AdminCommand =
  | { type: 'auth'; pin: string }
  | { type: 'set-team-name'; teamId: TeamId; name: string }
  | { type: 'load-pack'; packId: string }
  | { type: 'start-game' }
  | { type: 'next-round' }
  | { type: 'reveal-answer'; rank: number }
  | { type: 'add-strike'; teamId: TeamId }
  | { type: 'award-points'; teamId: TeamId; points: number }
  | { type: 'adjust-score'; teamId: TeamId; delta: number }
  | { type: 'switch-active-team' }
  | { type: 'timer-start' }
  | { type: 'timer-pause' }
  | { type: 'timer-reset'; seconds?: number }
  | { type: 'undo' }
  | { type: 'end-game' }
  | { type: 'reset-game' };

// Server → Admin
export type ServerToAdmin =
  | { type: 'auth-ok' }
  | { type: 'auth-fail'; reason: string }
  | { type: 'state-snapshot'; state: GameState }
  | { type: 'error'; message: string }
  | { type: 'pack-list'; packs: Pick<QuestionPack, 'id' | 'name' | 'description'>[] };

// Server → Screen
export type ServerToScreen =
  | { type: 'state-snapshot'; state: GameState }
  | { type: 'answer-revealed'; rank: number; text: string; points: number }
  | { type: 'strike-added'; teamId: TeamId; totalStrikes: number }
  | { type: 'timer-tick'; remaining: number };

// Screen → Server
export type ScreenCommand = { type: 'subscribe' };

// Union of all client → server messages
export type ClientMessage = AdminCommand | ScreenCommand;
