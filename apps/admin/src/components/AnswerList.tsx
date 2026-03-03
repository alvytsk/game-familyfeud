import type { AnswerSlot } from '@familyfeud/shared';

interface Props {
  answers: AnswerSlot[];
  onReveal: (rank: number) => void;
}

export function AnswerList({ answers, onReveal }: Props) {
  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-sm text-gray-400 uppercase mb-2">Ответы</h3>
      {answers.map((a) => (
        <div key={a.rank} className="flex items-center gap-2">
          <button
            className={`flex-1 text-left px-3 py-2 rounded text-sm font-medium transition ${
              a.revealed
                ? 'bg-green-800 text-green-200 cursor-default'
                : 'bg-gray-700 text-white hover:bg-yellow-600 hover:text-black'
            }`}
            onClick={() => !a.revealed && onReveal(a.rank)}
            disabled={a.revealed}
          >
            <span className="font-bold mr-2">#{a.rank}</span>
            {a.text}
            <span className="float-right tabular-nums">{a.points} очк.</span>
          </button>
        </div>
      ))}
    </div>
  );
}
