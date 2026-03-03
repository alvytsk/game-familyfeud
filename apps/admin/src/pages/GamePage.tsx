import type { GameState, AdminCommand } from '@familyfeud/shared';
import { AnswerList } from '../components/AnswerList.js';
import { StrikeControls } from '../components/StrikeControls.js';
import { ScoreAdjuster } from '../components/ScoreAdjuster.js';
import { TimerControls } from '../components/TimerControls.js';
import { UndoButton } from '../components/UndoButton.js';
import { RoundNavigator } from '../components/RoundNavigator.js';

interface Props {
  gameState: GameState;
  send: (cmd: AdminCommand) => void;
}

export function GamePage({ gameState, send }: Props) {
  const round = gameState.round;

  return (
    <div className="space-y-5">
      {/* Round info */}
      <RoundNavigator
        roundNumber={gameState.roundNumber}
        totalRounds={gameState.totalRounds}
        phase={gameState.phase}
        onNextRound={() => send({ type: 'next-round' })}
        onEndGame={() => send({ type: 'end-game' })}
        onResetGame={() => send({ type: 'reset-game' })}
      />

      {/* Question */}
      {round && (
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Вопрос</div>
          <div className="text-lg font-bold">{round.question}</div>
          <div className="text-sm text-yellow-400 mt-1">Очки раунда: {round.roundPoints}</div>
        </div>
      )}

      {/* Active Team */}
      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-400">Играет:</span>
        <span className="font-bold text-yellow-400">
          {gameState.teams.find(t => t.id === gameState.activeTeamId)?.name}
        </span>
        <button
          className="bg-purple-700 text-white px-3 py-1 rounded hover:bg-purple-600 text-sm ml-auto"
          onClick={() => send({ type: 'switch-active-team' })}
        >
          Сменить команду
        </button>
      </div>

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

      {/* Answers */}
      {round && (
        <AnswerList
          answers={round.answers}
          onReveal={(rank) => send({ type: 'reveal-answer', rank })}
        />
      )}

      {/* Strikes */}
      <StrikeControls
        teams={gameState.teams}
        onAddStrike={(teamId) => send({ type: 'add-strike', teamId })}
      />

      {/* Manual score adjust — only for corrections */}
      {round && (
        <ScoreAdjuster
          teams={gameState.teams}
          onAdjust={(teamId, delta) => send({ type: 'adjust-score', teamId, delta })}
        />
      )}

      {/* Timer */}
      <TimerControls
        timer={gameState.timer}
        onStart={() => send({ type: 'timer-start' })}
        onPause={() => send({ type: 'timer-pause' })}
        onReset={(seconds) => send({ type: 'timer-reset', seconds })}
      />

      {/* Undo */}
      <div className="flex justify-end">
        <UndoButton onUndo={() => send({ type: 'undo' })} />
      </div>
    </div>
  );
}
