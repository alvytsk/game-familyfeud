import { useReducer, useEffect, useRef, useCallback } from 'react';
import type { GameState, ServerToScreen, TeamId, RoundStage } from '@familyfeud/shared';

interface ScreenState {
  connected: boolean;
  gameState: GameState | null;
  /** Animation triggers — consumed once by components */
  lastReveal: { rank: number; text: string; points: number } | null;
  lastStrike: { teamId: TeamId; totalStrikes: number } | null;
  timerRemaining: number | null;
  /** New animation triggers */
  lastStageChange: { stage: RoundStage; teamId: TeamId | null } | null;
  lastStealResult: { success: boolean; teamId: TeamId } | null;
  lastReverseRevealed: boolean;
  lastBigGameReveal: { questionIndex: number; playerNum: 1 | 2; points: number } | null;
  lastBigGamePhase: string | null;
}

type Action =
  | { type: 'connected' }
  | { type: 'disconnected' }
  | { type: 'state-snapshot'; state: GameState }
  | { type: 'answer-revealed'; rank: number; text: string; points: number }
  | { type: 'strike-added'; teamId: TeamId; totalStrikes: number }
  | { type: 'timer-tick'; remaining: number }
  | { type: 'clear-reveal' }
  | { type: 'clear-strike' }
  | { type: 'stage-changed'; stage: RoundStage; teamId: TeamId | null }
  | { type: 'steal-result'; success: boolean; teamId: TeamId }
  | { type: 'reverse-revealed' }
  | { type: 'big-game-answer-revealed'; questionIndex: number; playerNum: 1 | 2; points: number }
  | { type: 'big-game-phase-changed'; phase: string }
  | { type: 'clear-steal' }
  | { type: 'clear-big-game-reveal' };

function reducer(state: ScreenState, action: Action): ScreenState {
  switch (action.type) {
    case 'connected':
      return { ...state, connected: true };
    case 'disconnected':
      return { ...state, connected: false };
    case 'state-snapshot': {
      const roundChanged = state.gameState?.round?.questionIndex !== action.state.round?.questionIndex;
      const phaseChanged = state.gameState?.phase !== action.state.phase;
      return {
        ...state,
        gameState: action.state,
        timerRemaining: action.state.timer.remaining,
        lastReveal: roundChanged ? null : state.lastReveal,
        lastStrike: roundChanged ? null : state.lastStrike,
        lastStageChange: phaseChanged ? null : state.lastStageChange,
        lastStealResult: phaseChanged ? null : state.lastStealResult,
        lastReverseRevealed: phaseChanged ? false : state.lastReverseRevealed,
      };
    }
    case 'answer-revealed':
      return {
        ...state,
        lastReveal: { rank: action.rank, text: action.text, points: action.points },
      };
    case 'strike-added':
      return {
        ...state,
        lastStrike: { teamId: action.teamId, totalStrikes: action.totalStrikes },
      };
    case 'timer-tick':
      return { ...state, timerRemaining: action.remaining };
    case 'clear-reveal':
      return { ...state, lastReveal: null };
    case 'clear-strike':
      return { ...state, lastStrike: null };
    case 'stage-changed':
      return { ...state, lastStageChange: { stage: action.stage, teamId: action.teamId } };
    case 'steal-result':
      return { ...state, lastStealResult: { success: action.success, teamId: action.teamId } };
    case 'reverse-revealed':
      return { ...state, lastReverseRevealed: true };
    case 'big-game-answer-revealed':
      return {
        ...state,
        lastBigGameReveal: { questionIndex: action.questionIndex, playerNum: action.playerNum, points: action.points },
      };
    case 'big-game-phase-changed':
      return { ...state, lastBigGamePhase: action.phase };
    case 'clear-steal':
      return { ...state, lastStealResult: null };
    case 'clear-big-game-reveal':
      return { ...state, lastBigGameReveal: null };
    default:
      return state;
  }
}

const initialState: ScreenState = {
  connected: false,
  gameState: null,
  lastReveal: null,
  lastStrike: null,
  timerRemaining: null,
  lastStageChange: null,
  lastStealResult: null,
  lastReverseRevealed: false,
  lastBigGameReveal: null,
  lastBigGamePhase: null,
};

export function useScreenState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      dispatch({ type: 'connected' });
      ws.send(JSON.stringify({ type: 'subscribe' }));
    };

    ws.onmessage = (e) => {
      let msg: ServerToScreen;
      try {
        msg = JSON.parse(e.data) as ServerToScreen;
      } catch {
        console.error('Failed to parse WS message');
        return;
      }
      switch (msg.type) {
        case 'state-snapshot':
          dispatch({ type: 'state-snapshot', state: msg.state });
          break;
        case 'answer-revealed':
          dispatch({ type: 'answer-revealed', rank: msg.rank, text: msg.text, points: msg.points });
          break;
        case 'strike-added':
          dispatch({ type: 'strike-added', teamId: msg.teamId, totalStrikes: msg.totalStrikes });
          break;
        case 'timer-tick':
          dispatch({ type: 'timer-tick', remaining: msg.remaining });
          break;
        case 'stage-changed':
          dispatch({ type: 'stage-changed', stage: msg.stage, teamId: msg.teamId });
          break;
        case 'steal-result':
          dispatch({ type: 'steal-result', success: msg.success, teamId: msg.teamId });
          break;
        case 'reverse-revealed':
          dispatch({ type: 'reverse-revealed' });
          break;
        case 'big-game-answer-revealed':
          dispatch({ type: 'big-game-answer-revealed', questionIndex: msg.questionIndex, playerNum: msg.playerNum, points: msg.points });
          break;
        case 'big-game-phase-changed':
          dispatch({ type: 'big-game-phase-changed', phase: msg.phase });
          break;
      }
    };

    ws.onerror = () => {
      console.error('WebSocket error');
    };

    ws.onclose = () => {
      dispatch({ type: 'disconnected' });
      reconnectTimer.current = setTimeout(connect, 2000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const clearReveal = useCallback(() => dispatch({ type: 'clear-reveal' }), []);
  const clearStrike = useCallback(() => dispatch({ type: 'clear-strike' }), []);
  const clearSteal = useCallback(() => dispatch({ type: 'clear-steal' }), []);
  const clearBigGameReveal = useCallback(() => dispatch({ type: 'clear-big-game-reveal' }), []);

  return { ...state, clearReveal, clearStrike, clearSteal, clearBigGameReveal };
}
