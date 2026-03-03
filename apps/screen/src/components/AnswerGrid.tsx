import type { AnswerSlot } from '@familyfeud/shared';
import { AnswerCard } from './AnswerCard.js';

interface Props {
  answers: AnswerSlot[];
  lastRevealRank: number | null;
  onRevealAnimDone: () => void;
}

export function AnswerGrid({ answers, lastRevealRank, onRevealAnimDone }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-[clamp(24px,5vh,80px)] px-[clamp(8px,1.5vh,24px)] h-full">
      <div className="board-frame w-full max-w-[clamp(600px,60vw,1200px)] flex-1 min-h-0 flex flex-col">
        <div className="board-inner flex-1 min-h-0">
          {answers.map((answer) => (
            <AnswerCard
              key={answer.rank}
              answer={answer}
              justRevealed={lastRevealRank === answer.rank}
              onRevealDone={onRevealAnimDone}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
