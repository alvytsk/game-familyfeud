import type { Team, TeamId } from '@familyfeud/shared';

interface Props {
  teams: [Team, Team];
  onAddStrike: (teamId: TeamId) => void;
}

export function StrikeControls({ teams, onAddStrike }: Props) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-gray-400 uppercase">Промахи</h3>
      <div className="flex gap-2">
        {teams.map((team) => (
          <button
            key={team.id}
            className="flex-1 bg-red-700 text-white px-3 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
            onClick={() => onAddStrike(team.id)}
            disabled={team.strikes >= 3}
          >
            {team.name}: {'✕'.repeat(team.strikes)}
            {team.strikes < 3 ? ' + ✕' : ' (макс.)'}
          </button>
        ))}
      </div>
    </div>
  );
}
