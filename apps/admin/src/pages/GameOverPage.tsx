import type { GameState, AdminCommand } from '@familyfeud/shared';

interface Props {
  gameState: GameState;
  send: (cmd: AdminCommand) => void;
}

export function GameOverPage({ gameState, send }: Props) {
  const teamA = gameState.teams[0];
  const teamB = gameState.teams[1];
  const isTie = teamA.scoreTotal === teamB.scoreTotal;
  const winner = teamA.scoreTotal >= teamB.scoreTotal ? teamA : teamB;

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-bold text-yellow-400">Игра окончена!</h2>

      {isTie ? (
        <div className="text-xl text-gray-300">Ничья! {teamA.scoreTotal} очков</div>
      ) : (
        <div className="text-xl text-green-400 font-bold">{winner.name} — Победа!</div>
      )}

      <div className="flex gap-4">
        {gameState.teams.map((team) => (
          <div
            key={team.id}
            className={`flex-1 rounded-lg p-4 text-center ${
              !isTie && team.id === winner.id ? 'bg-yellow-900/30 border border-yellow-600' : 'bg-gray-800'
            }`}
          >
            <div className="text-sm text-gray-400">{team.name}</div>
            <div className="text-4xl font-bold tabular-nums">{team.scoreTotal}</div>
          </div>
        ))}
      </div>

      <button
        className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 font-bold text-lg"
        onClick={() => send({ type: 'reset-game' })}
      >
        Новая игра
      </button>
    </div>
  );
}
