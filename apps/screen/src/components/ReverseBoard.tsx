import type { ReverseRound, TeamId } from '@familyfeud/shared';

interface Props {
  reverseRound: ReverseRound;
  teams: [{ id: TeamId; name: string }, { id: TeamId; name: string }];
}

export function ReverseBoard({ reverseRound, teams }: Props) {
  const { question, answers, teamAChoice, teamBChoice } = reverseRound;

  return (
    <div className="flex flex-col items-center justify-center h-full px-[clamp(16px,3vw,48px)] py-[clamp(16px,3vh,48px)]">
      {/* Question */}
      <div className="text-center mb-[clamp(16px,3vh,40px)]">
        <div className="font-display text-blue-300 text-[clamp(1.2rem,2vw,2rem)] font-semibold tracking-wider uppercase mb-2">
          Игра наоборот
        </div>
        <h1 className="font-display text-[clamp(1.8rem,4vw,3.5rem)] font-bold text-white leading-tight">
          {question}
        </h1>
      </div>

      {/* Answer board */}
      <div className="board-frame w-full max-w-[clamp(600px,60vw,1200px)] flex-1 min-h-0 flex flex-col">
        <div className="board-inner flex-1 min-h-0">
          {answers.map((answer) => {
            const isTeamAPick = teamAChoice === answer.rank;
            const isTeamBPick = teamBChoice === answer.rank;

            return (
              <div key={answer.rank} className="card-container flex-1 min-h-0">
                <div className={`card ${answer.revealed ? 'card--flipped' : ''}`}>
                  {/* Back face */}
                  <div className="card-face card-back answer-back flex items-center px-[clamp(8px,1.5vw,24px)]">
                    <div className="rank-circle">{answer.rank}</div>
                  </div>
                  {/* Front face */}
                  <div className="card-face card-front answer-front flex items-center px-[clamp(8px,1.5vw,24px)] gap-[clamp(8px,1.5vw,20px)]">
                    <div className="rank-circle">{answer.rank}</div>
                    <span className="font-body text-[clamp(1.2rem,2.5vh,2.2rem)] font-bold text-white truncate flex-1">
                      {answer.text}
                    </span>
                    <span className="font-display text-[clamp(1.4rem,3vh,2.8rem)] font-bold text-yellow-400 tabular-nums ml-2">
                      {answer.points}
                    </span>
                    <div className="flex gap-1 ml-2">
                      {isTeamAPick && <span className="bg-blue-600 text-white text-[clamp(0.7rem,1.2vw,1rem)] px-2 py-0.5 rounded font-bold">A</span>}
                      {isTeamBPick && <span className="bg-red-600 text-white text-[clamp(0.7rem,1.2vw,1rem)] px-2 py-0.5 rounded font-bold">B</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
