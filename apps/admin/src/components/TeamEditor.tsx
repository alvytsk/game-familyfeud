import { useState } from 'react';
import type { TeamId } from '@familyfeud/shared';

interface Props {
  teamId: TeamId;
  currentName: string;
  onRename: (teamId: TeamId, name: string) => void;
}

export function TeamEditor({ teamId, currentName, onRename }: Props) {
  const [name, setName] = useState(currentName);

  return (
    <div className="flex gap-2 items-center">
      <input
        className="border rounded px-2 py-1 flex-1 bg-gray-800 text-white border-gray-600"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={30}
        placeholder="Название команды"
      />
      <button
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={() => onRename(teamId, name)}
        disabled={!name.trim() || name === currentName}
      >
        Сохранить
      </button>
    </div>
  );
}
