import type { GameState, AdminCommand } from '@familyfeud/shared';
import { SIMPLE_ROUND_COUNT } from '@familyfeud/shared';
import { AnswerList } from '../components/AnswerList.js';
import { StrikeControls } from '../components/StrikeControls.js';
import { ScoreAdjuster } from '../components/ScoreAdjuster.js';
import { TimerControls } from '../components/TimerControls.js';
import { UndoButton } from '../components/UndoButton.js';

const roundTypeNames: Record<string, string> = {
  single: 'Простая',
  double: 'Двойная',
  triple: 'Тройная',
};

interface Props {
  gameState: GameState;
  send: (cmd: AdminCommand) => void;
}

export function RoundPage({ gameState, send }: Props) {
  const round = gameState.round;
  if (!round) return null;

  const isLastSimpleRound = gameState.roundNumber >= SIMPLE_ROUND_COUNT;

  return (
    <div className="space-y-5">
      {/* Round info header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm text-gray-400 uppercase">
            Раунд {gameState.roundNumber} / {gameState.totalRounds}
          </h3>
          <span className="bg-blue-700 text-white px-2 py-0.5 rounded text-xs font-bold">
            {roundTypeNames[round.roundType] ?? round.roundType} x{round.multiplier}
          </span>
          <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs">
            {round.stage === 'faceoff' && 'Розыгрыш'}
            {round.stage === 'playing' && 'Игра'}
            {round.stage === 'steal' && 'ПЕРЕХВАТ'}
            {round.stage === 'resolved' && 'Завершён'}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-800 rounded-lg p-3">
        <div className="text-xs text-gray-400 mb-1">Вопрос</div>
        <div className="text-lg font-bold">{round.question}</div>
        <div className="text-sm text-yellow-400 mt-1">
          Очки раунда: {round.roundPoints} (x{round.multiplier} = {round.roundPoints * round.multiplier})
        </div>
      </div>

      {/* Faceoff: pick which team plays */}
      {round.stage === 'faceoff' && (
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 space-y-3">
          <div className="font-bold text-yellow-400 text-center">Розыгрыш — кто играет?</div>
          <div className="flex gap-3">
            {gameState.teams.map(team => (
              <button
                key={team.id}
                className="flex-1 bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-600 font-bold text-lg"
                onClick={() => send({ type: 'set-playing-team', teamId: team.id })}
              >
                {team.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Playing: show answers, strikes */}
      {round.stage === 'playing' && (
        <>
          {/* Active Team */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-400">Играет:</span>
            <span className="font-bold text-yellow-400">
              {gameState.teams.find(t => t.id === round.playingTeamId)?.name}
            </span>
          </div>

          {/* Answers */}
          <AnswerList
            answers={round.answers}
            onReveal={(rank) => send({ type: 'reveal-answer', rank })}
          />

          {/* Strikes */}
          <StrikeControls
            teams={gameState.teams}
            activeTeamId={gameState.activeTeamId}
            onAddStrike={(teamId) => send({ type: 'add-strike', teamId })}
          />
        </>
      )}

      {/* Steal stage */}
      {round.stage === 'steal' && (
        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 space-y-3">
          <div className="font-bold text-red-400 text-center text-xl">ПЕРЕХВАТ!</div>
          <div className="text-center text-gray-300 text-sm">
            Команда «{gameState.teams.find(t => t.id === gameState.activeTeamId)?.name}» перехватывает
          </div>

          {/* Still allow revealing answers during steal */}
          <AnswerList
            answers={round.answers}
            onReveal={(rank) => send({ type: 'reveal-answer', rank })}
          />

          <div className="flex gap-3">
            <button
              className="flex-1 bg-green-700 text-white py-3 rounded-lg hover:bg-green-600 font-bold"
              onClick={() => send({ type: 'steal-success' })}
            >
              Перехват удался
            </button>
            <button
              className="flex-1 bg-red-700 text-white py-3 rounded-lg hover:bg-red-600 font-bold"
              onClick={() => send({ type: 'steal-fail' })}
            >
              Перехват не удался
            </button>
          </div>
        </div>
      )}

      {/* Resolved: show result, advance */}
      {round.stage === 'resolved' && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 space-y-3">
          <div className="font-bold text-green-400 text-center">Раунд завершён</div>
          <div className="text-center text-gray-300">
            Очки: {round.roundPoints} x{round.multiplier} = {round.roundPoints * round.multiplier}
          </div>

          {/* Show all answers */}
          <AnswerList
            answers={round.answers}
            onReveal={(rank) => send({ type: 'reveal-answer', rank })}
          />

          {isLastSimpleRound ? (
            <button
              className="w-full bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-600 font-bold text-lg"
              onClick={() => send({ type: 'start-reverse' })}
            >
              Начать «Игру наоборот»
            </button>
          ) : (
            <button
              className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-600 font-bold text-lg"
              onClick={() => send({ type: 'next-round' })}
            >
              Следующий раунд
            </button>
          )}
        </div>
      )}

      {/* Scores */}
      <div className="flex gap-4">
        {gameState.teams.map((team) => (
          <div
            key={team.id}
            className={`flex-1 rounded-lg p-3 text-center ${
              team.id === gameState.activeTeamId ? 'bg-yellow-900/30 border border-yellow-600' : 'bg-gray-800'
            }`}
          >
            <div className="text-sm text-gray-400">{team.name}</div>
            <div className="text-3xl font-bold tabular-nums">{team.scoreTotal}</div>
          </div>
        ))}
      </div>

      {/* Manual score adjust */}
      <ScoreAdjuster
        teams={gameState.teams}
        onAdjust={(teamId, delta) => send({ type: 'adjust-score', teamId, delta })}
      />

      {/* Timer */}
      <TimerControls
        timer={gameState.timer}
        onStart={() => send({ type: 'timer-start' })}
        onPause={() => send({ type: 'timer-pause' })}
        onReset={(seconds) => send({ type: 'timer-reset', seconds })}
      />

      {/* Bottom controls */}
      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <UndoButton onUndo={() => send({ type: 'undo' })} />
        <button
          className="bg-red-700 text-white px-3 py-2 rounded hover:bg-red-600 text-sm ml-auto"
          onClick={() => send({ type: 'end-game' })}
        >
          Завершить игру
        </button>
        <button
          className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 text-sm"
          onClick={() => send({ type: 'reset-game' })}
        >
          Сбросить
        </button>
      </div>
    </div>
  );
}
