import { useReducer, useEffect, useRef, useCallback } from 'react';
import type { GameState, ServerToScreen, TeamId } from '@familyfeud/shared';

interface ScreenState {
  connected: boolean;
  gameState: GameState | null;
  /** Animation triggers — consumed once by components */
  lastReveal: { rank: number; text: string; points: number } | null;
  lastStrike: { teamId: TeamId; totalStrikes: number } | null;
  timerRemaining: number | null;
}

type Action =
  | { type: 'connected' }
  | { type: 'disconnected' }
  | { type: 'state-snapshot'; state: GameState }
  | { type: 'answer-revealed'; rank: number; text: string; points: number }
  | { type: 'strike-added'; teamId: TeamId; totalStrikes: number }
  | { type: 'timer-tick'; remaining: number }
  | { type: 'clear-reveal' }
  | { type: 'clear-strike' };

function reducer(state: ScreenState, action: Action): ScreenState {
  switch (action.type) {
    case 'connected':
      return { ...state, connected: true };
    case 'disconnected':
      return { ...state, connected: false };
    case 'state-snapshot': {
      const roundChanged = state.gameState?.round?.questionIndex !== action.state.round?.questionIndex;
      console.log('[SCREEN] state-snapshot received', {
        roundChanged,
        oldQuestionIndex: state.gameState?.round?.questionIndex,
        newQuestionIndex: action.state.round?.questionIndex,
        answers: action.state.round?.answers.map(a => ({ rank: a.rank, revealed: a.revealed })),
      });
      return {
        ...state,
        gameState: action.state,
        timerRemaining: action.state.timer.remaining,
        lastReveal: roundChanged ? null : state.lastReveal,
        lastStrike: roundChanged ? null : state.lastStrike,
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

  return { ...state, clearReveal, clearStrike };
}
