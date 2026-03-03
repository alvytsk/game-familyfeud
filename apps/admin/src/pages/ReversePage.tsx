import type { GameState, AdminCommand, TeamId } from '@familyfeud/shared';
import { REVERSE_ROUND_POINTS } from '@familyfeud/shared';
import { ScoreAdjuster } from '../components/ScoreAdjuster.js';
import { TimerControls } from '../components/TimerControls.js';
import { UndoButton } from '../components/UndoButton.js';

interface Props {
  gameState: GameState;
  send: (cmd: AdminCommand) => void;
}

export function ReversePage({ gameState, send }: Props) {
  const rev = gameState.reverseRound;
  if (!rev) return null;

  const ranks = rev.answers.map(a => a.rank);

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-sm text-gray-400 uppercase">Игра наоборот</h3>

      {/* Question */}
      <div className="bg-gray-800 rounded-lg p-3">
        <div className="text-xs text-gray-400 mb-1">Вопрос</div>
        <div className="text-lg font-bold">{rev.question}</div>
      </div>

      {/* Answers with reveal buttons */}
      <div className="bg-gray-800 rounded-lg p-3 space-y-1">
        <div className="text-xs text-gray-400 mb-2">Ответы (нажмите чтобы открыть)</div>
        {rev.answers.map(a => (
          <button
            key={a.rank}
            className={`flex justify-between items-center w-full px-3 py-2 rounded text-sm transition-colors ${
              a.revealed
                ? 'bg-green-800/50 cursor-default'
                : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
            }`}
            onClick={() => {
              if (!a.revealed) {
                send({ type: 'reveal-reverse-answer', rank: a.rank });
              }
            }}
            disabled={a.revealed}
          >
            <span className={a.revealed ? 'text-white' : 'text-gray-300'}>
              #{a.rank} {a.text}
            </span>
            <span className="text-yellow-400 font-bold">{a.points} очк.</span>
          </button>
        ))}
      </div>

      {/* Team choices */}
      {!rev.revealed && (
        <div className="space-y-4">
          {gameState.teams.map(team => {
            const teamId = team.id;
            const choice = teamId === 'team-a' ? rev.teamAChoice : rev.teamBChoice;

            return (
              <div key={teamId} className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="font-bold text-blue-300">{team.name}</div>
                <div className="flex flex-wrap gap-2">
                  {ranks.map(rank => (
                    <button
                      key={rank}
                      className={`w-10 h-10 rounded font-bold text-sm ${
                        choice === rank
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => send({ type: 'set-reverse-choice', teamId: teamId as TeamId, rank })}
                    >
                      {rank}
                    </button>
                  ))}
                  <button
                    className={`px-3 h-10 rounded font-bold text-sm ${
                      choice === 0
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => send({ type: 'set-reverse-choice', teamId: teamId as TeamId, rank: 0 })}
                  >
                    ✗
                  </button>
                </div>
                {choice !== null && (
                  <div className="text-sm text-gray-400">
                    {choice === 0
                      ? 'Нет в списке (0 очк.)'
                      : `Выбрано: #${choice} (${REVERSE_ROUND_POINTS[choice] ?? 0} очк.)`}
                  </div>
                )}
              </div>
            );
          })}

          <button
            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-600 font-bold text-lg disabled:opacity-50"
            onClick={() => send({ type: 'reveal-reverse' })}
            disabled={rev.teamAChoice === null || rev.teamBChoice === null}
          >
            Подвести итоги
          </button>
        </div>
      )}

      {/* After reveal */}
      {rev.revealed && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 space-y-3">
          <div className="font-bold text-green-400 text-center">Результаты «Игры наоборот»</div>
          {gameState.teams.map(team => {
            const choice = team.id === 'team-a' ? rev.teamAChoice : rev.teamBChoice;
            const points = choice !== null && choice > 0 ? (REVERSE_ROUND_POINTS[choice] ?? 0) : 0;
            return (
              <div key={team.id} className="flex justify-between">
                <span>{team.name}: {choice === 0 ? 'нет в списке' : `ответ #${choice}`}</span>
                <span className="text-yellow-400 font-bold">+{points} очк.</span>
              </div>
            );
          })}

          {gameState.winnerTeamId && (
            <div className="text-center text-xl font-bold text-yellow-400 mt-2">
              Лидер: {gameState.teams.find(t => t.id === gameState.winnerTeamId)?.name}
            </div>
          )}

          <button
            className="w-full bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-600 font-bold text-lg mt-4"
            onClick={() => send({ type: 'start-big-game' })}
          >
            Начать «Большую игру»
          </button>
        </div>
      )}

      {/* Scores */}
      <div className="flex gap-4">
        {gameState.teams.map((team) => (
          <div
            key={team.id}
            className={`flex-1 rounded-lg p-3 text-center ${
              team.id === gameState.winnerTeamId ? 'bg-yellow-900/30 border border-yellow-600' : 'bg-gray-800'
            }`}
          >
            <div className="text-sm text-gray-400">{team.name}</div>
            <div className="text-3xl font-bold tabular-nums">{team.scoreTotal}</div>
          </div>
        ))}
      </div>

      <ScoreAdjuster
        teams={gameState.teams}
        onAdjust={(teamId, delta) => send({ type: 'adjust-score', teamId, delta })}
      />

      <TimerControls
        timer={gameState.timer}
        onStart={() => send({ type: 'timer-start' })}
        onPause={() => send({ type: 'timer-pause' })}
        onReset={(seconds) => send({ type: 'timer-reset', seconds })}
      />

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
