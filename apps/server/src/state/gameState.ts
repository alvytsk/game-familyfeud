import { produce } from 'immer';
import type { GameState } from '@familyfeud/shared';
import { MAX_UNDO_STACK } from '@familyfeud/shared';
import { createDefaultState } from './defaults.js';

export type StateListener = (state: GameState) => void;

class GameStateManager {
  private state: GameState;
  private undoStack: GameState[] = [];
  private listeners: Set<StateListener> = new Set();

  constructor() {
    this.state = createDefaultState();
  }

  getState(): GameState {
    return this.state;
  }

  /** Apply a mutation (Immer recipe). Pushes current state to undo stack. */
  update(recipe: (draft: GameState) => void): GameState {
    this.undoStack.push(this.state);
    if (this.undoStack.length > MAX_UNDO_STACK) {
      this.undoStack.shift();
    }
    this.state = produce(this.state, recipe);
    this.notify();
    return this.state;
  }

  /** Apply a mutation without pushing to undo stack (for timer ticks, etc.) */
  updateSilent(recipe: (draft: GameState) => void): GameState {
    this.state = produce(this.state, recipe);
    return this.state;
  }

  undo(): GameState | null {
    const prev = this.undoStack.pop();
    if (!prev) return null;
    this.state = prev;
    this.notify();
    return this.state;
  }

  reset(): void {
    this.undoStack = [];
    this.state = createDefaultState();
    this.notify();
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const gameState = new GameStateManager();
