import type { Team } from '@familyfeud/shared';

interface Props {
  teamA: Team;
  teamB: Team;
}

export function StrikesFooter({ teamA, teamB }: Props) {
  return (
    <div className="bg-gray-900 text-white p-4 col-span-3 flex justify-center items-center gap-16">
      <StrikeDisplay name={teamA.name} strikes={teamA.strikes} />
      <StrikeDisplay name={teamB.name} strikes={teamB.strikes} />
    </div>
  );
}

function StrikeDisplay({ name, strikes }: { name: string; strikes: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-400 uppercase">{name}</span>
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`strike-x text-3xl font-bold ${
              i <= strikes ? 'strike-x--visible text-red-500' : 'text-gray-700'
            }`}
          >
            ✕
          </span>
        ))}
      </div>
    </div>
  );
}
