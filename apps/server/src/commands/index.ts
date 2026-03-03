import type { AdminCommand, ServerToScreen } from '@familyfeud/shared';
import { MAX_STRIKES } from '@familyfeud/shared';
import { gameState } from '../state/gameState.js';
import { getPack, listPacks } from '../persistence/packs.js';
import * as handlers from './handlers.js';

export interface CommandResult {
  /** Granular events to send to screens alongside the state snapshot */
  screenEvents?: ServerToScreen[];
  /** If true, send updated pack list to admin */
  sendPackList?: boolean;
}

export async function handleCommand(cmd: AdminCommand): Promise<CommandResult> {
  const result: CommandResult = {};

  switch (cmd.type) {
    case 'auth':
      // Auth is handled at the gateway level
      break;

    case 'set-team-name':
      gameState.update(draft => handlers.setTeamName(draft, cmd.teamId, cmd.name));
      break;

    case 'load-pack': {
      const pack = await getPack(cmd.packId);
      if (!pack) throw new Error(`Pack "${cmd.packId}" not found`);
      gameState.update(draft => handlers.loadPack(draft, pack));
      break;
    }

    case 'start-game': {
      const state = gameState.getState();
      if (!state.packId) throw new Error('No pack loaded');
      const pack = await getPack(state.packId);
      if (!pack) throw new Error('Pack not found');
      gameState.update(draft => handlers.startGame(draft, pack));
      break;
    }

    case 'next-round': {
      const state = gameState.getState();
      if (!state.packId) throw new Error('No pack loaded');
      const pack = await getPack(state.packId);
      if (!pack) throw new Error('Pack not found');
      gameState.update(draft => handlers.nextRound(draft, pack));
      break;
    }

    case 'reveal-answer': {
      let revealed: handlers.RevealResult | null = null;
      gameState.update(draft => {
        revealed = handlers.revealAnswer(draft, cmd.rank);
      });
      if (revealed) {
        const r = revealed as handlers.RevealResult;
        result.screenEvents = [
          { type: 'answer-revealed', rank: r.rank, text: r.text, points: r.points },
        ];
      }
      break;
    }

    case 'add-strike': {
      let totalStrikes = 0;
      gameState.update(draft => {
        totalStrikes = handlers.addStrike(draft, cmd.teamId);
        if (totalStrikes >= MAX_STRIKES) {
          handlers.switchActiveTeam(draft);
          draft.teams[0].strikes = 0;
          draft.teams[1].strikes = 0;
        }
      });
      result.screenEvents = [
        { type: 'strike-added', teamId: cmd.teamId, totalStrikes },
      ];
      break;
    }

    case 'award-points':
      gameState.update(draft => handlers.awardPoints(draft, cmd.teamId, cmd.points));
      break;

    case 'adjust-score':
      gameState.update(draft => handlers.adjustScore(draft, cmd.teamId, cmd.delta));
      break;

    case 'switch-active-team':
      gameState.update(draft => handlers.switchActiveTeam(draft));
      break;

    case 'timer-start':
      gameState.update(draft => handlers.timerStart(draft));
      break;

    case 'timer-pause':
      gameState.update(draft => handlers.timerPause(draft));
      break;

    case 'timer-reset':
      gameState.update(draft => handlers.timerReset(draft, cmd.seconds));
      break;

    case 'undo': {
      const undone = gameState.undo();
      if (!undone) throw new Error('Nothing to undo');
      break;
    }

    case 'end-game':
      gameState.update(draft => handlers.endGame(draft));
      break;

    case 'reset-game':
      gameState.reset();
      result.sendPackList = true;
      break;
  }

  return result;
}
