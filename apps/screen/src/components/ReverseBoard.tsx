import type { ReverseRound, TeamId } from '@familyfeud/shared';

interface Props {
  reverseRound: ReverseRound;
  teams: [{ id: TeamId; name: string }, { id: TeamId; name: string }];
}

export function ReverseBoard({ reverseRound, teams }: Props) {
  const { question, answers, teamAChoice, teamBChoice, revealed } = reverseRound;

  return (
    <div className="flex flex-col items-center justify-center h-full px-[clamp(16px,3vw,48px)] py-[clamp(16px,3vh,48px)]">
      {/* Question */}
      <div className="text-center mb-[clamp(16px,3vh,40px)]">
        <div className="font-display text-blue-300 text-[clamp(1rem,1.5vw,1.8rem)] font-semibold tracking-wider uppercase mb-2">
          Игра наоборот
        </div>
        <h1 className="font-display text-[clamp(1.5rem,3.5vw,3rem)] font-bold text-white leading-tight">
          {question}
        </h1>
      </div>

      {/* Answer board */}
      <div className="board-frame w-full max-w-[clamp(600px,60vw,1000px)]">
        <div className="board-inner">
          {answers.map((answer) => {
            const isTeamAPick = teamAChoice === answer.rank;
            const isTeamBPick = teamBChoice === answer.rank;

            return (
              <div key={answer.rank} className="card-container" style={{ minHeight: 'clamp(48px, 8vh, 80px)' }}>
                <div className={`card ${revealed ? 'card--flipped' : ''}`}>
                  {/* Back face */}
                  <div className="card-face card-back answer-back flex items-center px-[clamp(8px,1vw,20px)]">
                    <div className="rank-circle">{answer.rank}</div>
                    {/* Show team indicators on unrevealed */}
                    <div className="flex gap-2 ml-auto">
                      {isTeamAPick && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-bold">
                          {teams[0].name}
                        </span>
                      )}
                      {isTeamBPick && (
                        <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">
                          {teams[1].name}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Front face */}
                  <div className="card-face card-front answer-front flex items-center px-[clamp(8px,1vw,20px)] gap-[clamp(8px,1vw,16px)]">
                    <div className="rank-circle">{answer.rank}</div>
                    <span className="font-body text-[clamp(1rem,2vh,1.8rem)] font-bold text-white truncate flex-1">
                      {answer.text}
                    </span>
                    <span className="font-display text-[clamp(1.1rem,2.5vh,2.2rem)] font-bold text-yellow-400 tabular-nums ml-2">
                      {answer.points}
                    </span>
                    <div className="flex gap-1 ml-2">
                      {isTeamAPick && <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">A</span>}
                      {isTeamBPick && <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">B</span>}
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
