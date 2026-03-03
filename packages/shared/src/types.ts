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

export type RoundType = 'single' | 'double' | 'triple';
export type RoundStage = 'faceoff' | 'playing' | 'steal' | 'resolved';

export interface Round {
  questionIndex: number;
  question: string;
  answers: AnswerSlot[];
  roundPoints: number;
  roundType: RoundType;
  multiplier: number;
  stage: RoundStage;
  /** Team that won the faceoff and is playing this round (null during faceoff) */
  playingTeamId: TeamId | null;
}

export interface TimerState {
  running: boolean;
  remaining: number;
  total: number;
}

export type GamePhase = 'lobby' | 'round' | 'reverse' | 'big-game' | 'game-over';

export interface ReverseAnswerSlot {
  rank: number;
  text: string;
  points: number; // fixed points from REVERSE_ROUND_POINTS
  revealed: boolean;
}

export interface ReverseRound {
  question: string;
  answers: ReverseAnswerSlot[];
  teamAChoice: number | null; // rank chosen by team-a
  teamBChoice: number | null; // rank chosen by team-b
  revealed: boolean;
}

export type BigGamePhase = 'player1' | 'player2' | 'final';

export interface BigGameAnswer {
  playerAnswer: string; // what the player said (entered by admin)
  matchedRank: number | null; // rank of matched answer (0 = no match, null = not yet judged)
  points: number; // points awarded (0 if no match)
}

export interface BigGameQuestion {
  question: string;
  answers: { text: string; points: number }[];
  player1Answer: BigGameAnswer | null;
  player2Answer: BigGameAnswer | null;
}

export interface BigGameState {
  phase: BigGamePhase;
  questions: BigGameQuestion[];
  currentQuestionIndex: number;
  player1Total: number;
  player2Total: number;
}

export interface GameState {
  phase: GamePhase;
  packId: string | null;
  teams: [Team, Team];
  activeTeamId: TeamId;
  round: Round | null;
  timer: TimerState;
  roundNumber: number;
  totalRounds: number;
  reverseRound: ReverseRound | null;
  bigGame: BigGameState | null;
  winnerTeamId: TeamId | null;
}

export interface PackQuestion {
  question: string;
  answers: { text: string; points: number }[];
}

export interface QuestionPack {
  id: string;
  name: string;
  description?: string;
  /** Legacy flat format — kept for backward compat, normalized on load */
  questions?: PackQuestion[];
  /** Simple rounds (3 questions) */
  simpleRounds?: PackQuestion[];
  /** Reverse round (1 question) */
  reverseRound?: PackQuestion;
  /** Big Game questions (5 questions) */
  bigGame?: PackQuestion[];
}
