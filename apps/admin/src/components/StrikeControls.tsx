import type { Team, TeamId } from '@familyfeud/shared';

interface Props {
  teams: [Team, Team];
  activeTeamId: TeamId | null;
  onAddStrike: (teamId: TeamId) => void;
}

export function StrikeControls({ teams, activeTeamId, onAddStrike }: Props) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-gray-400 uppercase">Промахи</h3>
      <div className="flex gap-2">
        {teams.map((team) => {
          const isActive = team.id === activeTeamId;
          return (
            <button
              key={team.id}
              className={`flex-1 text-white px-3 py-2 rounded text-sm ${
                isActive ? 'bg-red-700 hover:bg-red-600' : 'bg-gray-700 cursor-not-allowed'
              } disabled:opacity-50`}
              onClick={() => onAddStrike(team.id)}
              disabled={!isActive || team.strikes >= 3}
            >
              {team.name}: {'✕'.repeat(team.strikes)}
              {!isActive ? '' : team.strikes < 3 ? ' + ✕' : ' (макс.)'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
