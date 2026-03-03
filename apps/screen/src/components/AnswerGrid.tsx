import type { AnswerSlot } from '@familyfeud/shared';
import { AnswerCard } from './AnswerCard.js';

interface Props {
  answers: AnswerSlot[];
  lastRevealRank: number | null;
  onRevealAnimDone: () => void;
}

export function AnswerGrid({ answers, lastRevealRank, onRevealAnimDone }: Props) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="board-frame w-full max-w-2xl">
        <div className="board-inner">
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
