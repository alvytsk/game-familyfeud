interface Props {
  onUndo: () => void;
}

export function UndoButton({ onUndo }: Props) {
  return (
    <button
      className="bg-orange-700 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm font-semibold"
      onClick={onUndo}
    >
      Отмена
    </button>
  );
}
