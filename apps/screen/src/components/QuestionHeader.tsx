import type { RoundType, RoundStage } from '@familyfeud/shared';

const roundTypeNames: Record<RoundType, string> = {
  single: 'Простая',
  double: 'Двойная',
  triple: 'Тройная',
};

interface Props {
  question: string;
  roundNumber: number;
  totalRounds: number;
  timerRemaining: number | null;
  roundType?: RoundType;
  multiplier?: number;
  stage?: RoundStage;
}

export function QuestionHeader({ question, roundNumber, totalRounds, timerRemaining, roundType, multiplier, stage }: Props) {
  return (
    <div className="question-header text-white px-[clamp(16px,2vw,40px)] py-[clamp(12px,1.5vh,32px)] text-center col-span-3">
      <div className="flex justify-between items-center mb-2">
        <span className="font-display text-blue-300 text-[clamp(1.1rem,1.8vw,2rem)] font-semibold tracking-wider uppercase">
          Раунд {roundNumber} / {totalRounds}
          {roundType && (
            <span className="ml-3 text-yellow-400">
              {roundTypeNames[roundType]} x{multiplier}
            </span>
          )}
        </span>
        {timerRemaining !== null && (
          <span className={`led-timer ${timerRemaining <= 5 ? 'led-timer--danger' : ''}`}>
            {timerRemaining}
          </span>
        )}
      </div>
      <h1 className="font-display text-[clamp(1.5rem,4vw,3.5rem)] font-bold leading-tight">
        {stage === 'faceoff' ? '?' : question}
      </h1>
    </div>
  );
}
