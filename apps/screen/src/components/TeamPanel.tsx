import type { Team } from '@familyfeud/shared';

interface Props {
  team: Team;
  isActive: boolean;
  side: 'left' | 'right';
}

export function TeamPanel({ team, isActive, side }: Props) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center p-4 m-2
        team-panel transition-all duration-500
        ${isActive ? 'team-active-glow' : 'team-panel--inactive'}
      `}
    >
      <div className="font-display text-lg font-semibold tracking-wider uppercase mb-2 truncate max-w-full text-blue-200">
        {team.name}
      </div>
      <div className="font-display text-5xl font-bold tabular-nums text-white">
        {team.scoreTotal}
      </div>
      {/* Strikes display */}
      <div className="flex flex-col gap-2 mt-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`strike-lamp ${
              i <= team.strikes ? 'strike-lamp--active' : ''
            }`}
          >
            {i <= team.strikes && <span className="strike-lamp__cross">✕</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
