import type { GameState, AdminCommand } from '@familyfeud/shared';
import { BIG_GAME_WIN_THRESHOLD } from '@familyfeud/shared';
import { TimerControls } from '../components/TimerControls.js';
import { UndoButton } from '../components/UndoButton.js';

interface Props {
  gameState: GameState;
  send: (cmd: AdminCommand) => void;
}

export function BigGamePage({ gameState, send }: Props) {
  const bg = gameState.bigGame;
  if (!bg) return null;

  const currentQ = bg.questions[bg.currentQuestionIndex];
  const isPlayer1 = bg.phase === 'player1';
  const isPlayer2 = bg.phase === 'player2';
  const isFinal = bg.phase === 'final';
  const combinedTotal = bg.player1Total + bg.player2Total;
  const currentAnswer = isPlayer1 ? currentQ?.player1Answer : currentQ?.player2Answer;
  const hasAnswered = currentAnswer?.matchedRank !== undefined && currentAnswer?.matchedRank !== null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold text-sm text-gray-400 uppercase">Большая игра</h3>
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
          isFinal ? 'bg-yellow-600 text-white' : 'bg-purple-700 text-white'
        }`}>
          {isPlayer1 && 'Игрок 1'}
          {isPlayer2 && 'Игрок 2'}
          {isFinal && 'Финал'}
        </span>
      </div>

      {/* Player 1 / Player 2 phase */}
      {(isPlayer1 || isPlayer2) && currentQ && (
        <>
          {/* Question */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">
              Вопрос {bg.currentQuestionIndex + 1} / {bg.questions.length}
            </div>
            <div className="text-lg font-bold">{currentQ.question}</div>
          </div>

          {/* Player 1 answer reference (for player 2) */}
          {isPlayer2 && currentQ.player1Answer && (
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-2 text-sm">
              <span className="text-blue-400">Ответ игрока 1: </span>
              {currentQ.player1Answer.matchedRank && currentQ.player1Answer.matchedRank > 0
                ? `#${currentQ.player1Answer.matchedRank} (${currentQ.player1Answer.points} очк.)`
                : 'Нет совпадения'
              }
            </div>
          )}

          {/* Answer grid — admin clicks matched answer */}
          <div className="space-y-1">
            <div className="text-xs text-gray-400 mb-2">Нажмите на совпавший ответ:</div>
            {currentQ.answers.map((a, i) => {
              const rank = i + 1;
              const isMatched = currentAnswer?.matchedRank === rank;
              // For player 2, mark if player 1 already picked this
              const p1Picked = isPlayer2 && currentQ.player1Answer?.matchedRank === rank;

              return (
                <button
                  key={rank}
                  className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
                    isMatched
                      ? 'bg-green-700 text-white'
                      : p1Picked
                        ? 'bg-gray-600 text-gray-400'
                        : hasAnswered
                          ? 'bg-gray-700 text-gray-500 cursor-default'
                          : 'bg-gray-700 text-white hover:bg-yellow-600 hover:text-black'
                  }`}
                  onClick={() => !hasAnswered && send({ type: 'big-game-select-match', questionIndex: bg.currentQuestionIndex, rank })}
                  disabled={hasAnswered}
                >
                  <span className="font-bold mr-2">#{rank}</span>
                  {a.text}
                </button>
              );
            })}
            <button
              className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
                currentAnswer?.matchedRank === 0
                  ? 'bg-red-700 text-white'
                  : hasAnswered
                    ? 'bg-gray-700 text-gray-500 cursor-default'
                    : 'bg-gray-700 text-gray-300 hover:bg-red-700 hover:text-white'
              }`}
              onClick={() => !hasAnswered && send({ type: 'big-game-select-match', questionIndex: bg.currentQuestionIndex, rank: 0 })}
              disabled={hasAnswered}
            >
              Нет совпадения (0 очков)
            </button>
          </div>

          {/* Next button */}
          <button
            className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-600 font-bold disabled:opacity-50"
            onClick={() => send({ type: 'big-game-next' })}
            disabled={!hasAnswered}
          >
            {bg.currentQuestionIndex < bg.questions.length - 1
              ? 'Следующий вопрос'
              : isPlayer1
                ? 'Перейти к игроку 2'
                : 'Показать результаты'
            }
          </button>

          {/* Running totals */}
          <div className="flex gap-4">
            <div className="flex-1 bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400">Игрок 1</div>
              <div className="text-2xl font-bold tabular-nums">{bg.player1Total}</div>
            </div>
            <div className="flex-1 bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400">Игрок 2</div>
              <div className="text-2xl font-bold tabular-nums">{bg.player2Total}</div>
            </div>
          </div>

          {/* Timer */}
          <TimerControls
            timer={gameState.timer}
            onStart={() => send({ type: 'timer-start' })}
            onPause={() => send({ type: 'timer-pause' })}
            onReset={(seconds) => send({ type: 'timer-reset', seconds })}
          />
        </>
      )}

      {/* Final phase */}
      {isFinal && (
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-6 space-y-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">Результаты Большой игры</div>

          <div className="flex gap-4 justify-center">
            <div className="bg-gray-800 rounded-lg p-4 text-center min-w-[120px]">
              <div className="text-sm text-gray-400">Игрок 1</div>
              <div className="text-3xl font-bold tabular-nums">{bg.player1Total}</div>
            </div>
            <div className="text-4xl font-bold text-gray-500 self-center">+</div>
            <div className="bg-gray-800 rounded-lg p-4 text-center min-w-[120px]">
              <div className="text-sm text-gray-400">Игрок 2</div>
              <div className="text-3xl font-bold tabular-nums">{bg.player2Total}</div>
            </div>
            <div className="text-4xl font-bold text-gray-500 self-center">=</div>
            <div className={`rounded-lg p-4 text-center min-w-[120px] ${
              combinedTotal >= BIG_GAME_WIN_THRESHOLD ? 'bg-green-800' : 'bg-red-800'
            }`}>
              <div className="text-sm text-gray-300">Итого</div>
              <div className="text-3xl font-bold tabular-nums">{combinedTotal}</div>
            </div>
          </div>

          <div className={`text-xl font-bold ${
            combinedTotal >= BIG_GAME_WIN_THRESHOLD ? 'text-green-400' : 'text-red-400'
          }`}>
            {combinedTotal >= BIG_GAME_WIN_THRESHOLD ? 'ПОБЕДА!' : `Не хватило ${BIG_GAME_WIN_THRESHOLD - combinedTotal} очков`}
          </div>

          {/* Question-by-question breakdown */}
          <div className="space-y-1 text-sm text-left">
            {bg.questions.map((q, i) => (
              <div key={i} className="flex justify-between bg-gray-800 px-3 py-1.5 rounded">
                <span className="text-gray-400 truncate flex-1">В{i + 1}: {q.question}</span>
                <span className="text-gray-300 ml-2 tabular-nums">
                  {q.player1Answer?.points ?? '-'} + {q.player2Answer?.points ?? '-'}
                </span>
              </div>
            ))}
          </div>

          <button
            className="w-full bg-red-700 text-white py-3 rounded-lg hover:bg-red-600 font-bold text-lg"
            onClick={() => send({ type: 'end-big-game' })}
          >
            Завершить игру
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <UndoButton onUndo={() => send({ type: 'undo' })} />
        <button
          className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 text-sm ml-auto"
          onClick={() => send({ type: 'reset-game' })}
        >
          Сбросить
        </button>
      </div>
    </div>
  );
}
