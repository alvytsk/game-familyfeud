import { useEffect, useRef } from 'react';
import type { GameState } from '@familyfeud/shared';
import {
  playDing,
  playBuzzer,
  playTick,
  playWarningTick,
  playGameStart,
  playGameOver,
} from './soundEngine.js';

interface SoundEffectsInput {
  gameState: GameState | null;
  lastReveal: { rank: number; text: string; points: number } | null;
  lastStrike: { teamId: string; totalStrikes: number } | null;
  timerRemaining: number | null;
}

export function useSoundEffects({
  gameState,
  lastReveal,
  lastStrike,
  timerRemaining,
}: SoundEffectsInput): void {
  const prevRevealRef = useRef(lastReveal);
  const prevStrikeRef = useRef(lastStrike);
  const prevTimerRef = useRef(timerRemaining);
  const prevPhaseRef = useRef(gameState?.phase ?? null);
  const prevRoundRef = useRef(gameState?.roundNumber ?? null);

  // Answer revealed → ding
  useEffect(() => {
    if (lastReveal && lastReveal !== prevRevealRef.current) {
      playDing();
    }
    prevRevealRef.current = lastReveal;
  }, [lastReveal]);

  // Strike added → buzzer
  useEffect(() => {
    if (lastStrike && lastStrike !== prevStrikeRef.current) {
      playBuzzer();
    }
    prevStrikeRef.current = lastStrike;
  }, [lastStrike]);

  // Timer tick → tick / warning tick
  useEffect(() => {
    if (
      timerRemaining !== null &&
      prevTimerRef.current !== null &&
      timerRemaining < prevTimerRef.current
    ) {
      if (timerRemaining <= 5) {
        playWarningTick();
      } else {
        playTick();
      }
    }
    prevTimerRef.current = timerRemaining;
  }, [timerRemaining]);

  // Phase/round transitions
  useEffect(() => {
    const phase = gameState?.phase ?? null;
    const round = gameState?.roundNumber ?? null;
    const prevPhase = prevPhaseRef.current;
    const prevRound = prevRoundRef.current;

    // Game start: lobby→round, or round change while in round phase
    if (phase === 'round') {
      if (prevPhase === 'lobby' || (prevPhase === 'round' && prevRound !== null && round !== prevRound)) {
        playGameStart();
      }
    }

    // Reverse or big game start
    if (phase === 'reverse' && prevPhase === 'round') {
      playGameStart();
    }
    if (phase === 'big-game' && prevPhase === 'reverse') {
      playGameStart();
    }

    // Game over
    if (phase === 'game-over' && prevPhase !== null && prevPhase !== 'game-over') {
      playGameOver();
    }

    prevPhaseRef.current = phase;
    prevRoundRef.current = round;
  }, [gameState?.phase, gameState?.roundNumber]);
}
