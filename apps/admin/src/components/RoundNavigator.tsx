const phaseNames: Record<string, string> = {
  lobby: 'Лобби',
  playing: 'Игра',
  'round-end': 'Конец раунда',
  'game-over': 'Игра окончена',
};

interface Props {
  roundNumber: number;
  totalRounds: number;
  phase: string;
  onNextRound: () => void;
  onEndGame: () => void;
  onResetGame: () => void;
}

export function RoundNavigator({ roundNumber, totalRounds, phase, onNextRound, onEndGame, onResetGame }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-gray-400 uppercase">
        Раунд {roundNumber} / {totalRounds} — Фаза: {phaseNames[phase] ?? phase}
      </h3>
      <button
        className="w-full bg-blue-700 text-white px-6 py-4 rounded-lg hover:bg-blue-600 text-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={onNextRound}
        disabled={phase === 'game-over' || phase === 'lobby'}
      >
        Следующий раунд →
      </button>
      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <button
          className="bg-red-700 text-white px-3 py-2 rounded hover:bg-red-600 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onEndGame}
          disabled={phase === 'game-over' || phase === 'lobby'}
        >
          Завершить игру
        </button>
        <button
          className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 text-sm"
          onClick={onResetGame}
        >
          Сбросить игру
        </button>
      </div>
    </div>
  );
}
