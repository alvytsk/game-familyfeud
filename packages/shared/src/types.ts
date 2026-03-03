export type TeamId = 'team-a' | 'team-b';

export interface Team {
  id: TeamId;
  name: string;
  scoreTotal: number;
  strikes: number;
}

export interface AnswerSlot {
  rank: number;
  text: string;
  points: number;
  revealed: boolean;
}

export interface Round {
  questionIndex: number;
  question: string;
  answers: AnswerSlot[];
  roundPoints: number;
}

export interface TimerState {
  running: boolean;
  remaining: number;
  total: number;
}

export type GamePhase = 'lobby' | 'playing' | 'round-end' | 'game-over';

export interface GameState {
  phase: GamePhase;
  packId: string | null;
  teams: [Team, Team];
  activeTeamId: TeamId;
  round: Round | null;
  timer: TimerState;
  roundNumber: number;
  totalRounds: number;
}

export interface PackQuestion {
  question: string;
  answers: { text: string; points: number }[];
}

export interface QuestionPack {
  id: string;
  name: string;
  description?: string;
  questions: PackQuestion[];
}
