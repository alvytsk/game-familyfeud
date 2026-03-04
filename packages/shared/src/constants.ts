export const MAX_STRIKES = 3;
export const DEFAULT_TIMER_SECONDS = 30;
export const MAX_UNDO_STACK = 20;
export const DEFAULT_ADMIN_PIN = '1234';
export const WS_PATH = '/ws';

export const SIMPLE_ROUND_COUNT = 3;
export const BIG_GAME_QUESTIONS = 5;
export const BIG_GAME_TIMER_PLAYER1 = 15;
export const BIG_GAME_TIMER_PLAYER2 = 20;
export const BIG_GAME_WIN_THRESHOLD = 200;
export const BIG_GAME_POINTS_PER_ANSWER = 100;

/** Fixed point values for the reverse round (rank 1-6) */
export const REVERSE_ROUND_POINTS: Record<number, number> = {
  1: 15,
  2: 30,
  3: 60,
  4: 120,
  5: 200,
  6: 240,
};

/** Multipliers for simple rounds 1/2/3 */
export const ROUND_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
};
