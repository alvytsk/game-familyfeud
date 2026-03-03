import type { GameState, TeamId, QuestionPack, RoundType } from '@familyfeud/shared';
import {
  DEFAULT_TIMER_SECONDS,
  MAX_STRIKES,
  REVERSE_ROUND_POINTS,
  ROUND_MULTIPLIERS,
  BIG_GAME_TIMER_PLAYER1,
  BIG_GAME_TIMER_PLAYER2,
} from '@familyfeud/shared';

function getTeam(draft: GameState, teamId: TeamId) {
  return draft.teams.find(t => t.id === teamId)!;
}

function otherTeam(teamId: TeamId): TeamId {
  return teamId === 'team-a' ? 'team-b' : 'team-a';
}

// ——————————————— Lobby / Setup ———————————————

export function setTeamName(draft: GameState, teamId: TeamId, name: string): void {
  getTeam(draft, teamId).name = name;
}

export function loadPack(draft: GameState, pack: QuestionPack): void {
  draft.packId = pack.id;
  draft.totalRounds = (pack.simpleRounds ?? []).length;
}

// ——————————————— Simple Rounds ———————————————

const ROUND_TYPES: RoundType[] = ['single', 'double', 'triple'];

export function startGame(draft: GameState, pack: QuestionPack): void {
  if (!draft.packId) return;

  const simpleRounds = pack.simpleRounds ?? [];
  if (simpleRounds.length === 0) return;

  draft.phase = 'round';
  draft.roundNumber = 1;
  draft.totalRounds = simpleRounds.length;

  const q = simpleRounds[0];
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
    roundType: ROUND_TYPES[0],
    multiplier: ROUND_MULTIPLIERS[1],
    stage: 'faceoff',
    playingTeamId: null,
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

  draft.reverseRound = null;
  draft.bigGame = null;
  draft.winnerTeamId = null;
}

export function nextRound(draft: GameState, pack: QuestionPack): void {
  const simpleRounds = pack.simpleRounds ?? [];
  const nextIndex = draft.roundNumber; // 0-based next index

  if (nextIndex >= simpleRounds.length) {
    // No more simple rounds — can't advance further this way
    return;
  }

  const q = simpleRounds[nextIndex];
  draft.roundNumber = nextIndex + 1;
  draft.phase = 'round';
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
    roundType: ROUND_TYPES[Math.min(nextIndex, ROUND_TYPES.length - 1)],
    multiplier: ROUND_MULTIPLIERS[nextIndex + 1] ?? nextIndex + 1,
    stage: 'faceoff',
    playingTeamId: null,
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

export function setPlayingTeam(draft: GameState, teamId: TeamId): void {
  if (!draft.round || draft.round.stage !== 'faceoff') return;
  draft.round.playingTeamId = teamId;
  draft.round.stage = 'playing';
  draft.activeTeamId = teamId;
}

export interface RevealResult {
  rank: number;
  text: string;
  points: number;
}

export interface RevealOutcome {
  reveal: RevealResult;
  allRevealed: boolean;
  awardedPoints: number;
  awardedTeamId: TeamId | null;
}

export function revealAnswer(draft: GameState, rank: number): RevealOutcome | null {
  if (!draft.round) return null;

  const slot = draft.round.answers.find(a => a.rank === rank);
  if (!slot || slot.revealed) return null;

  slot.revealed = true;
  draft.round.roundPoints += slot.points;

  const reveal = { rank: slot.rank, text: slot.text, points: slot.points };

  // Check if all answers revealed → auto-award and resolve
  const allRevealed = draft.round.answers.every(a => a.revealed);
  let awardedPoints = 0;
  let awardedTeamId: TeamId | null = null;

  if (allRevealed && draft.round.stage === 'playing' && draft.round.playingTeamId) {
    awardedPoints = draft.round.roundPoints * draft.round.multiplier;
    awardedTeamId = draft.round.playingTeamId;
    getTeam(draft, awardedTeamId).scoreTotal += awardedPoints;
    draft.round.stage = 'resolved';
  }

  return { reveal, allRevealed, awardedPoints, awardedTeamId };
}

export interface StrikeResult {
  totalStrikes: number;
  stageChanged: boolean;
}

export function addStrike(draft: GameState, teamId: TeamId): StrikeResult {
  const team = getTeam(draft, teamId);
  let stageChanged = false;

  if (team.strikes < MAX_STRIKES) {
    team.strikes++;
  }

  // When strikes reach 3 during 'playing' stage → transition to 'steal'
  if (
    draft.round &&
    draft.round.stage === 'playing' &&
    team.strikes >= MAX_STRIKES
  ) {
    draft.round.stage = 'steal';
    // Switch active team to the stealing team
    const stealTeamId = otherTeam(draft.round.playingTeamId ?? teamId);
    draft.activeTeamId = stealTeamId;
    stageChanged = true;
  }

  return { totalStrikes: team.strikes, stageChanged };
}

export function stealSuccess(draft: GameState): void {
  if (!draft.round || draft.round.stage !== 'steal') return;

  // Steal team (currently active) wins the round points
  const points = draft.round.roundPoints * draft.round.multiplier;
  getTeam(draft, draft.activeTeamId).scoreTotal += points;
  draft.round.stage = 'resolved';
}

export function stealFail(draft: GameState): void {
  if (!draft.round || draft.round.stage !== 'steal') return;

  // Original playing team gets the points
  const playingTeamId = draft.round.playingTeamId;
  if (playingTeamId) {
    const points = draft.round.roundPoints * draft.round.multiplier;
    getTeam(draft, playingTeamId).scoreTotal += points;
  }
  draft.round.stage = 'resolved';
}

// ——————————————— Reverse Round ———————————————

export function startReverse(draft: GameState, pack: QuestionPack): void {
  if (!pack.reverseRound) return;

  draft.phase = 'reverse';
  draft.round = null;

  const q = pack.reverseRound;
  draft.reverseRound = {
    question: q.question,
    answers: q.answers.map((a, i) => ({
      rank: i + 1,
      text: a.text,
      points: REVERSE_ROUND_POINTS[i + 1] ?? 0,
      revealed: false,
    })),
    teamAChoice: null,
    teamBChoice: null,
    revealed: false,
  };

  draft.timer = {
    running: false,
    remaining: DEFAULT_TIMER_SECONDS,
    total: DEFAULT_TIMER_SECONDS,
  };
}

export function setReverseChoice(draft: GameState, teamId: TeamId, rank: number): void {
  if (!draft.reverseRound || draft.reverseRound.revealed) return;

  if (teamId === 'team-a') {
    draft.reverseRound.teamAChoice = rank;
  } else {
    draft.reverseRound.teamBChoice = rank;
  }
}

export function revealReverseAnswer(draft: GameState, rank: number): boolean {
  if (!draft.reverseRound) return false;

  const slot = draft.reverseRound.answers.find(a => a.rank === rank);
  if (!slot || slot.revealed) return false;

  slot.revealed = true;
  return true;
}

export function revealReverse(draft: GameState): void {
  if (!draft.reverseRound) return;

  draft.reverseRound.revealed = true;
  draft.reverseRound.answers.forEach(a => { a.revealed = true; });

  // Award points based on choices
  const { teamAChoice, teamBChoice, answers } = draft.reverseRound;

  if (teamAChoice !== null) {
    const slot = answers.find(a => a.rank === teamAChoice);
    if (slot) {
      getTeam(draft, 'team-a').scoreTotal += slot.points;
    }
  }

  if (teamBChoice !== null) {
    const slot = answers.find(a => a.rank === teamBChoice);
    if (slot) {
      getTeam(draft, 'team-b').scoreTotal += slot.points;
    }
  }

  // Determine winner based on total scores
  const teamA = getTeam(draft, 'team-a');
  const teamB = getTeam(draft, 'team-b');
  if (teamA.scoreTotal > teamB.scoreTotal) {
    draft.winnerTeamId = 'team-a';
  } else if (teamB.scoreTotal > teamA.scoreTotal) {
    draft.winnerTeamId = 'team-b';
  } else {
    draft.winnerTeamId = null; // tie
  }
}

// ——————————————— Big Game ———————————————

export function startBigGame(draft: GameState, pack: QuestionPack): void {
  if (!pack.bigGame || pack.bigGame.length === 0) return;

  draft.phase = 'big-game';
  draft.round = null;
  draft.reverseRound = null;

  draft.bigGame = {
    phase: 'player1',
    questions: pack.bigGame.map(q => ({
      question: q.question,
      answers: q.answers,
      player1Answer: null,
      player2Answer: null,
    })),
    currentQuestionIndex: 0,
    player1Total: 0,
    player2Total: 0,
  };

  draft.timer = {
    running: false,
    remaining: BIG_GAME_TIMER_PLAYER1,
    total: BIG_GAME_TIMER_PLAYER1,
  };
}

export function bigGameSelectMatch(draft: GameState, questionIndex: number, rank: number): number {
  if (!draft.bigGame) return 0;

  const q = draft.bigGame.questions[questionIndex];
  if (!q) return 0;

  const isPlayer1 = draft.bigGame.phase === 'player1';
  const answer = isPlayer1 ? q.player1Answer : q.player2Answer;

  // Create answer entry if it doesn't exist yet
  let points = 0;
  if (rank > 0) {
    // rank is 1-based, answers are 0-based
    const matched = q.answers[rank - 1];
    if (matched) {
      points = matched.points;
    }
  }

  const entry = {
    playerAnswer: '',
    matchedRank: rank,
    points,
  };

  if (isPlayer1) {
    q.player1Answer = entry;
    draft.bigGame.player1Total += points;
  } else {
    // For player 2, if player 1 picked the same answer, award 0
    if (rank > 0 && q.player1Answer?.matchedRank === rank) {
      entry.points = 0;
      points = 0;
    }
    q.player2Answer = entry;
    draft.bigGame.player2Total += points;
  }

  return points;
}

export function bigGameNext(draft: GameState): void {
  if (!draft.bigGame) return;

  const nextIdx = draft.bigGame.currentQuestionIndex + 1;

  if (nextIdx < draft.bigGame.questions.length) {
    // Move to next question
    draft.bigGame.currentQuestionIndex = nextIdx;
  } else if (draft.bigGame.phase === 'player1') {
    // Switch to player 2
    draft.bigGame.phase = 'player2';
    draft.bigGame.currentQuestionIndex = 0;
    draft.timer = {
      running: false,
      remaining: BIG_GAME_TIMER_PLAYER2,
      total: BIG_GAME_TIMER_PLAYER2,
    };
  } else {
    // Player 2 done → final
    draft.bigGame.phase = 'final';
    draft.timer.running = false;
  }
}

export function endBigGame(draft: GameState): void {
  draft.phase = 'game-over';
  draft.timer.running = false;
}

// ——————————————— Common / Legacy ———————————————

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
  // Auto-award accumulated round points to the playing team
  if (draft.round && draft.round.roundPoints > 0 && draft.round.playingTeamId) {
    getTeam(draft, draft.round.playingTeamId).scoreTotal += draft.round.roundPoints * draft.round.multiplier;
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
