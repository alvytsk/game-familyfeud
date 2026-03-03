import { useEffect } from 'react';
import type { AnswerSlot } from '@familyfeud/shared';

interface Props {
  answer: AnswerSlot;
  justRevealed: boolean;
  onRevealDone: () => void;
}

export function AnswerCard({ answer, justRevealed, onRevealDone }: Props) {
  // Clear the animation trigger after CSS transition completes
  useEffect(() => {
    if (justRevealed) {
      const t = setTimeout(() => onRevealDone(), 650);
      return () => clearTimeout(t);
    }
  }, [justRevealed, onRevealDone]);

  return (
    <div className="card-container h-14">
      <div className={`card ${answer.revealed ? 'card--flipped' : ''}`}>
        {/* Back face — gold stripes with red rank circle */}
        <div className="card-face card-back answer-back flex items-center px-3">
          <div className="rank-circle">{answer.rank}</div>
        </div>
        {/* Front face — dark navy with white text */}
        <div className="card-face card-front answer-front flex items-center px-3 gap-3">
          <div className="rank-circle">{answer.rank}</div>
          <span className="font-body text-lg font-bold text-white truncate flex-1">{answer.text}</span>
          <span className="font-display text-xl font-bold text-yellow-400 tabular-nums ml-2">{answer.points}</span>
        </div>
      </div>
    </div>
  );
}
