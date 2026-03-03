import { useState } from 'react';
import type { Team, TeamId } from '@familyfeud/shared';

interface Props {
  teams: [Team, Team];
  onAdjust: (teamId: TeamId, delta: number) => void;
}

export function ScoreAdjuster({ teams, onAdjust }: Props) {
  const [delta, setDelta] = useState(0);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-gray-400 uppercase">Корректировка очков</h3>

      <div className="flex gap-2 items-center">
        <input
          type="number"
          className="w-24 border rounded px-2 py-1 bg-gray-800 text-white border-gray-600"
          value={delta}
          onChange={(e) => setDelta(parseInt(e.target.value) || 0)}
          placeholder="+/- очк."
        />
        {teams.map((team) => (
          <button
            key={team.id}
            className="flex-1 bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 text-xs"
            onClick={() => { onAdjust(team.id, delta); setDelta(0); }}
            disabled={delta === 0}
          >
            Изменить — {team.name}
          </button>
        ))}
      </div>
    </div>
  );
}
