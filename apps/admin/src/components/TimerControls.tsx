import { useState } from 'react';
import type { TimerState } from '@familyfeud/shared';

interface Props {
  timer: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: (seconds?: number) => void;
}

export function TimerControls({ timer, onStart, onPause, onReset }: Props) {
  const [customSeconds, setCustomSeconds] = useState(30);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-gray-400 uppercase">
        Таймер: {timer.remaining}с / {timer.total}с
        {timer.running && <span className="text-green-400 ml-2">Идёт</span>}
      </h3>
      <div className="flex gap-2">
        <button
          className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
          onClick={onStart}
          disabled={timer.running || timer.remaining === 0}
        >
          Старт
        </button>
        <button
          className="bg-yellow-700 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
          onClick={onPause}
          disabled={!timer.running}
        >
          Пауза
        </button>
        <button
          className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
          onClick={() => onReset()}
        >
          Сброс
        </button>
        <input
          type="number"
          className="w-16 border rounded px-2 py-1 bg-gray-800 text-white border-gray-600 text-sm"
          value={customSeconds}
          onChange={(e) => setCustomSeconds(parseInt(e.target.value) || 30)}
          min={1}
        />
        <button
          className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 text-xs"
          onClick={() => onReset(customSeconds)}
        >
          Задать
        </button>
      </div>
    </div>
  );
}
