import type { GameState, TeamId, QuestionPack, RoundStage } from './types.js';

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
  | { type: 'reset-game' }
  // New: simple round commands
  | { type: 'set-playing-team'; teamId: TeamId }
  | { type: 'steal-success' }
  | { type: 'steal-fail' }
  // New: reverse round commands
  | { type: 'start-reverse' }
  | { type: 'set-reverse-choice'; teamId: TeamId; rank: number }
  | { type: 'reveal-reverse-answer'; rank: number }
  | { type: 'reveal-reverse' }
  // New: big game commands
  | { type: 'start-big-game' }
  | { type: 'big-game-select-match'; questionIndex: number; rank: number }
  | { type: 'big-game-next' }
  | { type: 'end-big-game' };

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
  | { type: 'timer-tick'; remaining: number }
  | { type: 'stage-changed'; stage: RoundStage; teamId: TeamId | null }
  | { type: 'steal-result'; success: boolean; teamId: TeamId }
  | { type: 'reverse-answer-revealed'; rank: number }
  | { type: 'reverse-revealed' }
  | { type: 'big-game-answer-revealed'; questionIndex: number; playerNum: 1 | 2; points: number }
  | { type: 'big-game-phase-changed'; phase: string };

// Screen → Server
export type ScreenCommand = { type: 'subscribe' };

// Union of all client → server messages
export type ClientMessage = AdminCommand | ScreenCommand;
