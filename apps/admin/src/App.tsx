import { useState, useCallback } from 'react';
import type { ServerToAdmin, AdminCommand } from '@familyfeud/shared';
import { useWebSocket } from './hooks/useWebSocket.js';
import { useGameStore } from './hooks/useGameState.js';
import { LobbyPage } from './pages/LobbyPage.js';
import { RoundPage } from './pages/RoundPage.js';
import { ReversePage } from './pages/ReversePage.js';
import { BigGamePage } from './pages/BigGamePage.js';
import { GameOverPage } from './pages/GameOverPage.js';
import { PackEditorPage } from './pages/PackEditorPage.js';

type Tab = 'game' | 'packs';

export default function App() {
  const store = useGameStore();
  const [pin, setPin] = useState('');
  const [tab, setTab] = useState<Tab>('game');

  const handleMessage = useCallback((msg: ServerToAdmin) => {
    switch (msg.type) {
      case 'auth-ok':
        useGameStore.getState().setAuthenticated(true);
        break;
      case 'auth-fail':
        useGameStore.getState().setAuthError(msg.reason);
        break;
      case 'state-snapshot':
        useGameStore.getState().setGameState(msg.state);
        break;
      case 'pack-list':
        useGameStore.getState().setPacks(msg.packs);
        break;
      case 'error':
        useGameStore.getState().setError(msg.message);
        setTimeout(() => useGameStore.getState().setError(null), 3000);
        break;
    }
  }, []);

  const { connected, send } = useWebSocket(handleMessage);

  // Not authenticated — show PIN form
  if (!store.authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg w-80 space-y-4">
          <h1 className="text-xl font-bold text-center">Вход в панель управления</h1>
          {!connected && (
            <div className="text-yellow-400 text-sm text-center animate-pulse">Подключение...</div>
          )}
          <input
            className="w-full border rounded px-3 py-2 bg-gray-700 text-white border-gray-600 text-center text-lg tracking-widest"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Введите PIN"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && pin) send({ type: 'auth', pin });
            }}
          />
          {store.authError && (
            <div className="text-red-400 text-sm text-center">{store.authError}</div>
          )}
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={() => send({ type: 'auth', pin })}
            disabled={!pin || !connected}
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  function renderGamePage() {
    if (!store.gameState) {
      return <div className="text-gray-400 text-center py-10">Загрузка состояния игры...</div>;
    }
    switch (store.gameState.phase) {
      case 'lobby':
        return <LobbyPage gameState={store.gameState} packs={store.packs} send={send} />;
      case 'round':
        return <RoundPage gameState={store.gameState} send={send} />;
      case 'reverse':
        return <ReversePage gameState={store.gameState} send={send} />;
      case 'big-game':
        return <BigGamePage gameState={store.gameState} send={send} />;
      case 'game-over':
        return <GameOverPage gameState={store.gameState} send={send} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Nav */}
      <nav className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-4">
        <span className="font-bold text-lg">100 к 1 — Управление</span>
        <button
          className={`px-3 py-1 rounded text-sm ${tab === 'game' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          onClick={() => setTab('game')}
        >
          Игра
        </button>
        <button
          className={`px-3 py-1 rounded text-sm ${tab === 'packs' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
          onClick={() => setTab('packs')}
        >
          Наборы вопросов
        </button>
        <div className="ml-auto flex items-center gap-2">
          {store.error && (
            <span className="text-red-400 text-sm">{store.error}</span>
          )}
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {tab === 'packs' ? <PackEditorPage /> : renderGamePage()}
      </div>
    </div>
  );
}
