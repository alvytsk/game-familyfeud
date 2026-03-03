import type { GameState, TeamId, QuestionPack } from '@familyfeud/shared';
import { DEFAULT_TIMER_SECONDS, MAX_STRIKES } from '@familyfeud/shared';

function getTeam(draft: GameState, teamId: TeamId) {
  return draft.teams.find(t => t.id === teamId)!;
}

export function setTeamName(draft: GameState, teamId: TeamId, name: string): void {
  getTeam(draft, teamId).name = name;
}

export function loadPack(draft: GameState, pack: QuestionPack): void {
  draft.packId = pack.id;
  draft.totalRounds = pack.questions.length;
}

export function startGame(draft: GameState, pack: QuestionPack): void {
  if (!draft.packId) return;

  draft.phase = 'playing';
  draft.roundNumber = 1;

  const q = pack.questions[0];
  draft.round = {
    questionIndex: 0,
    question: q.question,
    answers: q.answers.map((a, i) => ({
      rank: i + 1,
      text: a.text,
      points: a.points,
      revealed: false,
    })),
    roundPoints: 0,
  };

  // Reset strikes
  draft.teams[0].strikes = 0;
  draft.teams[1].strikes = 0;

  // Reset timer
  draft.timer = {
    running: false,
    remaining: DEFAULT_TIMER_SECONDS,
    total: DEFAULT_TIMER_SECONDS,
  };
}

export function nextRound(draft: GameState, pack: QuestionPack): void {
  // Auto-award accumulated round points to the active team
  if (draft.round && draft.round.roundPoints > 0) {
    getTeam(draft, draft.activeTeamId).scoreTotal += draft.round.roundPoints;
  }

  const nextIndex = draft.roundNumber; // 0-based: roundNumber is already the next index
  if (nextIndex >= pack.questions.length) {
    draft.phase = 'game-over';
    draft.round = null;
    return;
  }

  const q = pack.questions[nextIndex];
  draft.roundNumber = nextIndex + 1;
  draft.phase = 'playing';
  draft.round = {
    questionIndex: nextIndex,
    question: q.question,
    answers: q.answers.map((a, i) => ({
      rank: i + 1,
      text: a.text,
      points: a.points,
      revealed: false,
    })),
    roundPoints: 0,
  };

  // Reset strikes
  draft.teams[0].strikes = 0;
  draft.teams[1].strikes = 0;

  // Reset timer
  draft.timer = {
    running: false,
    remaining: DEFAULT_TIMER_SECONDS,
    total: DEFAULT_TIMER_SECONDS,
  };
}

export interface RevealResult {
  rank: number;
  text: string;
  points: number;
}

export function revealAnswer(draft: GameState, rank: number): RevealResult | null {
  if (!draft.round) return null;

  const slot = draft.round.answers.find(a => a.rank === rank);
  if (!slot || slot.revealed) return null;

  slot.revealed = true;
  draft.round.roundPoints += slot.points;

  return { rank: slot.rank, text: slot.text, points: slot.points };
}

export function addStrike(draft: GameState, teamId: TeamId): number {
  const team = getTeam(draft, teamId);
  if (team.strikes < MAX_STRIKES) {
    team.strikes++;
  }
  return team.strikes;
}

export function awardPoints(draft: GameState, teamId: TeamId, points: number): void {
  getTeam(draft, teamId).scoreTotal += points;
}

export function adjustScore(draft: GameState, teamId: TeamId, delta: number): void {
  const team = getTeam(draft, teamId);
  team.scoreTotal = Math.max(0, team.scoreTotal + delta);
}

export function switchActiveTeam(draft: GameState): void {
  draft.activeTeamId = draft.activeTeamId === 'team-a' ? 'team-b' : 'team-a';
}

export function endGame(draft: GameState): void {
  // Auto-award accumulated round points to the active team
  if (draft.round && draft.round.roundPoints > 0) {
    getTeam(draft, draft.activeTeamId).scoreTotal += draft.round.roundPoints;
  }
  draft.phase = 'game-over';
  draft.timer.running = false;
}

export function timerStart(draft: GameState): void {
  if (draft.timer.remaining > 0) {
    draft.timer.running = true;
  }
}

export function timerPause(draft: GameState): void {
  draft.timer.running = false;
}

export function timerReset(draft: GameState, seconds?: number): void {
  const total = seconds ?? DEFAULT_TIMER_SECONDS;
  draft.timer = { running: false, remaining: total, total };
}

export function timerTick(draft: GameState): boolean {
  if (!draft.timer.running) return false;
  draft.timer.remaining = Math.max(0, draft.timer.remaining - 1);
  if (draft.timer.remaining === 0) {
    draft.timer.running = false;
  }
  return true;
}
