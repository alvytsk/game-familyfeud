import type { BigGameState } from '@familyfeud/shared';
import { BIG_GAME_WIN_THRESHOLD } from '@familyfeud/shared';

interface Props {
  bigGame: BigGameState;
  timerRemaining: number | null;
}

export function BigGameBoard({ bigGame, timerRemaining }: Props) {
  const { phase, questions, currentQuestionIndex, player1Total, player2Total } = bigGame;
  const combinedTotal = player1Total + player2Total;
  const isFinal = phase === 'final';
  const isPlayer1 = phase === 'player1';

  if (isFinal) {
    const won = combinedTotal >= BIG_GAME_WIN_THRESHOLD;

    return (
      <div className="flex flex-col items-center justify-center h-full text-white font-body">
        <div className="font-display text-[clamp(2rem,4vw,4rem)] font-bold text-yellow-400 title-glow mb-[clamp(16px,3vh,48px)]">
          Большая игра
        </div>

        {/* Question results grid */}
        <div className="w-full max-w-[clamp(500px,50vw,900px)] mb-[clamp(16px,3vh,32px)]">
          {questions.map((q, i) => (
            <div key={i} className="flex items-center gap-2 mb-1">
              <span className="font-display text-[clamp(0.7rem,1vw,1rem)] text-gray-400 w-[clamp(20px,2vw,30px)] text-right">{i + 1}</span>
              <div className="flex-1 bg-gray-800/80 rounded px-3 py-1 flex justify-between items-center">
                <span className="text-[clamp(0.8rem,1.2vw,1.2rem)] truncate flex-1">{q.question}</span>
                <span className="text-yellow-400 font-bold tabular-nums text-[clamp(0.9rem,1.5vw,1.5rem)] ml-2">
                  {(q.player1Answer?.points ?? 0) + (q.player2Answer?.points ?? 0)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex gap-[clamp(16px,3vw,48px)] items-center mb-[clamp(16px,3vh,32px)]">
          <div className="text-center">
            <div className="text-blue-300 text-[clamp(0.8rem,1vw,1.2rem)]">Игрок 1</div>
            <div className="font-display text-[clamp(2rem,4vw,4rem)] font-bold tabular-nums">{player1Total}</div>
          </div>
          <div className="text-[clamp(2rem,3vw,3.5rem)] text-gray-500 font-bold">+</div>
          <div className="text-center">
            <div className="text-blue-300 text-[clamp(0.8rem,1vw,1.2rem)]">Игрок 2</div>
            <div className="font-display text-[clamp(2rem,4vw,4rem)] font-bold tabular-nums">{player2Total}</div>
          </div>
          <div className="text-[clamp(2rem,3vw,3.5rem)] text-gray-500 font-bold">=</div>
          <div className="text-center">
            <div className={`text-[clamp(0.8rem,1vw,1.2rem)] ${won ? 'text-green-400' : 'text-red-400'}`}>Итого</div>
            <div className={`font-display text-[clamp(3rem,5vw,5rem)] font-bold tabular-nums ${won ? 'text-green-400' : 'text-red-400'}`}>
              {combinedTotal}
            </div>
          </div>
        </div>

        <div className={`font-display text-[clamp(2rem,4vw,4rem)] font-bold ${won ? 'text-green-400 title-glow' : 'text-red-400'}`}>
          {won ? 'ПОБЕДА!' : 'Не хватило...'}
        </div>
      </div>
    );
  }

  // Player 1 or Player 2 phase
  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center h-full text-white font-body px-[clamp(16px,3vw,48px)]">
      {/* Header */}
      <div className="text-center mb-[clamp(8px,2vh,24px)]">
        <div className="font-display text-blue-300 text-[clamp(1rem,1.5vw,1.8rem)] font-semibold tracking-wider uppercase">
          Большая игра — {isPlayer1 ? 'Игрок 1' : 'Игрок 2'}
        </div>
        {timerRemaining !== null && (
          <span className={`led-timer ${timerRemaining <= 5 ? 'led-timer--danger' : ''}`}>
            {timerRemaining}
          </span>
        )}
      </div>

      {/* Question list sidebar */}
      <div className="w-full max-w-[clamp(600px,60vw,1000px)] flex gap-[clamp(8px,1.5vw,24px)]">
        {/* Question indicators */}
        <div className="flex flex-col gap-1 w-[clamp(32px,3vw,48px)]">
          {questions.map((q, i) => {
            const answer = isPlayer1 ? q.player1Answer : q.player2Answer;
            const isCurrent = i === currentQuestionIndex;
            const isDone = answer?.matchedRank !== undefined && answer?.matchedRank !== null;

            return (
              <div
                key={i}
                className={`w-full aspect-square rounded flex items-center justify-center font-bold text-[clamp(0.8rem,1.2vw,1.4rem)] ${
                  isCurrent
                    ? 'bg-yellow-600 text-white'
                    : isDone
                      ? answer.points > 0
                        ? 'bg-green-700 text-white'
                        : 'bg-red-800 text-white'
                      : 'bg-gray-700 text-gray-400'
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* Current question */}
        <div className="flex-1">
          <div className="board-frame w-full">
            <div className="p-[clamp(12px,2vw,32px)]">
              <div className="font-display text-[clamp(1.2rem,2.5vw,2.5rem)] font-bold text-white mb-[clamp(8px,2vh,24px)]">
                {currentQ?.question}
              </div>

              {/* Show matched answer if any */}
              {currentQ && (() => {
                const answer = isPlayer1 ? currentQ.player1Answer : currentQ.player2Answer;
                if (!answer || answer.matchedRank === null || answer.matchedRank === undefined) return null;

                if (answer.matchedRank === 0) {
                  return (
                    <div className="text-red-400 font-display text-[clamp(1.5rem,3vw,3rem)] font-bold text-center animate-pulse">
                      Нет совпадения
                    </div>
                  );
                }

                const matchedA = currentQ.answers[answer.matchedRank - 1];
                return (
                  <div className="bg-green-800/50 rounded-lg p-[clamp(8px,1.5vw,20px)] text-center">
                    <div className="font-body text-[clamp(1rem,2vw,2rem)] font-bold text-white">{matchedA?.text}</div>
                    <div className="font-display text-[clamp(1.5rem,3vw,3rem)] font-bold text-yellow-400">{answer.points}</div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Running total */}
      <div className="mt-[clamp(8px,2vh,24px)] flex gap-[clamp(16px,3vw,48px)]">
        <div className={`text-center ${isPlayer1 ? 'opacity-100' : 'opacity-60'}`}>
          <div className="text-blue-300 text-[clamp(0.7rem,0.9vw,1rem)]">Игрок 1</div>
          <div className="font-display text-[clamp(1.5rem,3vw,3rem)] font-bold tabular-nums">{player1Total}</div>
        </div>
        <div className={`text-center ${!isPlayer1 ? 'opacity-100' : 'opacity-60'}`}>
          <div className="text-blue-300 text-[clamp(0.7rem,0.9vw,1rem)]">Игрок 2</div>
          <div className="font-display text-[clamp(1.5rem,3vw,3rem)] font-bold tabular-nums">{player2Total}</div>
        </div>
      </div>
    </div>
  );
}
