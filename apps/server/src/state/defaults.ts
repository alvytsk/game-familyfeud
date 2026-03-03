import type { GameState } from '@familyfeud/shared';
import { DEFAULT_TIMER_SECONDS } from '@familyfeud/shared';

export function createDefaultState(): GameState {
  return {
    phase: 'lobby',
    packId: null,
    teams: [
      { id: 'team-a', name: 'Команда 1', scoreTotal: 0, strikes: 0 },
      { id: 'team-b', name: 'Команда 2', scoreTotal: 0, strikes: 0 },
    ],
    activeTeamId: 'team-a',
    round: null,
    timer: {
      running: false,
      remaining: DEFAULT_TIMER_SECONDS,
      total: DEFAULT_TIMER_SECONDS,
    },
    roundNumber: 0,
    totalRounds: 3,
    reverseRound: null,
    bigGame: null,
    winnerTeamId: null,
  };
}
