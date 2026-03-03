import type { AdminCommand, ServerToScreen } from '@familyfeud/shared';
import { gameState } from '../state/gameState.js';
import { getPack } from '../persistence/packs.js';
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

    case 'set-playing-team': {
      gameState.update(draft => handlers.setPlayingTeam(draft, cmd.teamId));
      const newState = gameState.getState();
      if (newState.round) {
        result.screenEvents = [
          { type: 'stage-changed', stage: newState.round.stage, teamId: cmd.teamId },
        ];
      }
      break;
    }

    case 'reveal-answer': {
      let outcome: handlers.RevealOutcome | null = null;
      gameState.update(draft => {
        outcome = handlers.revealAnswer(draft, cmd.rank);
      });
      if (outcome) {
        const o = outcome as handlers.RevealOutcome;
        result.screenEvents = [
          { type: 'answer-revealed', rank: o.reveal.rank, text: o.reveal.text, points: o.reveal.points },
        ];
      }
      break;
    }

    case 'add-strike': {
      let strikeResult: handlers.StrikeResult = { totalStrikes: 0, stageChanged: false };
      gameState.update(draft => {
        strikeResult = handlers.addStrike(draft, cmd.teamId);
      });
      result.screenEvents = [
        { type: 'strike-added', teamId: cmd.teamId, totalStrikes: strikeResult.totalStrikes },
      ];
      if (strikeResult.stageChanged) {
        const newState = gameState.getState();
        if (newState.round) {
          result.screenEvents.push({
            type: 'stage-changed',
            stage: newState.round.stage,
            teamId: newState.activeTeamId,
          });
        }
      }
      break;
    }

    case 'steal-success': {
      gameState.update(draft => handlers.stealSuccess(draft));
      const newState = gameState.getState();
      result.screenEvents = [
        { type: 'steal-result', success: true, teamId: newState.activeTeamId },
      ];
      break;
    }

    case 'steal-fail': {
      const preState = gameState.getState();
      const playingTeamId = preState.round?.playingTeamId ?? preState.activeTeamId;
      gameState.update(draft => handlers.stealFail(draft));
      result.screenEvents = [
        { type: 'steal-result', success: false, teamId: playingTeamId },
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

    // Reverse round commands
    case 'start-reverse': {
      const state = gameState.getState();
      if (!state.packId) throw new Error('No pack loaded');
      const pack = await getPack(state.packId);
      if (!pack) throw new Error('Pack not found');
      if (!pack.reverseRound) throw new Error('Pack has no reverse round');
      gameState.update(draft => handlers.startReverse(draft, pack));
      break;
    }

    case 'set-reverse-choice':
      gameState.update(draft => handlers.setReverseChoice(draft, cmd.teamId, cmd.rank));
      break;

    case 'reveal-reverse':
      gameState.update(draft => handlers.revealReverse(draft));
      result.screenEvents = [{ type: 'reverse-revealed' }];
      break;

    // Big game commands
    case 'start-big-game': {
      const state = gameState.getState();
      if (!state.packId) throw new Error('No pack loaded');
      const pack = await getPack(state.packId);
      if (!pack) throw new Error('Pack not found');
      if (!pack.bigGame || pack.bigGame.length === 0) throw new Error('Pack has no big game questions');
      gameState.update(draft => handlers.startBigGame(draft, pack));
      result.screenEvents = [{ type: 'big-game-phase-changed', phase: 'player1' }];
      break;
    }

    case 'big-game-select-match': {
      let points = 0;
      gameState.update(draft => {
        points = handlers.bigGameSelectMatch(draft, cmd.questionIndex, cmd.rank);
      });
      const bgState = gameState.getState().bigGame;
      const playerNum = bgState?.phase === 'player1' ? 1 : 2;
      result.screenEvents = [
        { type: 'big-game-answer-revealed', questionIndex: cmd.questionIndex, playerNum: playerNum as 1 | 2, points },
      ];
      break;
    }

    case 'big-game-next': {
      gameState.update(draft => handlers.bigGameNext(draft));
      const bgState = gameState.getState().bigGame;
      if (bgState) {
        result.screenEvents = [{ type: 'big-game-phase-changed', phase: bgState.phase }];
      }
      break;
    }

    case 'end-big-game':
      gameState.update(draft => handlers.endBigGame(draft));
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
