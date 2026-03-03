import type { GameState, QuestionPack, AdminCommand, TeamId } from '@familyfeud/shared';
import { TeamEditor } from '../components/TeamEditor.js';

type PackSummary = Pick<QuestionPack, 'id' | 'name' | 'description'>;

interface Props {
  gameState: GameState;
  packs: PackSummary[];
  send: (cmd: AdminCommand) => void;
}

export function LobbyPage({ gameState, packs, send }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Лобби игры</h2>

      {/* Team Names */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-400 uppercase text-sm">Команды</h3>
        <div className="space-y-2">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Команда A</label>
            <TeamEditor
              teamId="team-a"
              currentName={gameState.teams[0].name}
              onRename={(teamId, name) => send({ type: 'set-team-name', teamId, name })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Команда B</label>
            <TeamEditor
              teamId="team-b"
              currentName={gameState.teams[1].name}
              onRename={(teamId, name) => send({ type: 'set-team-name', teamId, name })}
            />
          </div>
        </div>
      </div>

      {/* Pack Selection */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-400 uppercase text-sm">Набор вопросов</h3>
        {packs.length === 0 ? (
          <p className="text-gray-500">Наборы не найдены. Добавьте наборы в папку data/packs.</p>
        ) : (
          <div className="space-y-1">
            {packs.map((pack) => (
              <button
                key={pack.id}
                className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                  gameState.packId === pack.id
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
                onClick={() => send({ type: 'load-pack', packId: pack.id })}
              >
                <div className="font-semibold">{pack.name}</div>
                {pack.description && <div className="text-xs text-gray-400">{pack.description}</div>}
              </button>
            ))}
          </div>
        )}
        {gameState.packId && (
          <div className="text-sm text-green-400">
            Набор загружен: {gameState.packId} ({gameState.totalRounds} вопросов)
          </div>
        )}
      </div>

      {/* Start */}
      <button
        className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-green-600"
        onClick={() => send({ type: 'start-game' })}
        disabled={!gameState.packId}
      >
        Начать игру
      </button>
    </div>
  );
}
