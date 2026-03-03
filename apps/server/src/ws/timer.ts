import { gameState } from '../state/gameState.js';
import { timerTick } from '../commands/handlers.js';
import { broadcastToScreens, broadcastStateToAll } from './broadcast.js';

let timerInterval: ReturnType<typeof setInterval> | null = null;

export function startTimerLoop(): void {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    const state = gameState.getState();
    if (!state.timer.running) return;

    const newState = gameState.updateSilent(draft => {
      timerTick(draft);
    });

    // Broadcast tick event to screens
    broadcastToScreens([
      { type: 'timer-tick', remaining: newState.timer.remaining },
    ]);

    // If timer just stopped (hit 0), broadcast full state
    if (!newState.timer.running) {
      broadcastStateToAll(newState);
    }
  }, 1000);
}

export function stopTimerLoop(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
