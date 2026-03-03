import { useState, useEffect } from 'react';
import type { QuestionPack, PackQuestion } from '@familyfeud/shared';
import { SIMPLE_ROUND_COUNT, BIG_GAME_QUESTIONS } from '@familyfeud/shared';

export function PackEditorPage() {
  const [packs, setPacks] = useState<QuestionPack[]>([]);
  const [editing, setEditing] = useState<QuestionPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/packs');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json() as { id: string; name: string }[];
      const full: QuestionPack[] = [];
      for (const p of list) {
        const r = await fetch(`/api/packs/${p.id}`);
        if (!r.ok) continue;
        full.push(await r.json() as QuestionPack);
      }
      setPacks(full);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPacks(); }, []);

  const savePack = async (pack: QuestionPack) => {
    const existing = packs.find(p => p.id === pack.id);
    const method = existing ? 'PUT' : 'POST';
    const url = existing ? `/api/packs/${pack.id}` : '/api/packs';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pack),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchPacks();
      setEditing(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
  };

  const deletePack = async (id: string) => {
    if (!confirm('Удалить этот набор?')) return;
    try {
      await fetch(`/api/packs/${id}`, { method: 'DELETE' });
      await fetchPacks();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  const exportPack = (pack: QuestionPack) => {
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importPack = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const pack = JSON.parse(text) as QuestionPack;
        if (!pack.id || !pack.name) {
          alert('Неверный формат набора');
          return;
        }
        await savePack(pack);
      } catch {
        alert('Неверный JSON файл');
      }
    };
    input.click();
  };

  const totalQuestions = (pack: QuestionPack) => {
    const simple = pack.simpleRounds?.length ?? 0;
    const reverse = pack.reverseRound ? 1 : 0;
    const big = pack.bigGame?.length ?? 0;
    const legacy = pack.questions?.length ?? 0;
    return simple + reverse + big || legacy;
  };

  if (loading) return <div className="text-gray-400">Загрузка наборов...</div>;

  if (error) return (
    <div className="space-y-2">
      <div className="text-red-400">Ошибка: {error}</div>
      <button className="text-blue-400 hover:text-blue-300 text-sm" onClick={fetchPacks}>Повторить</button>
    </div>
  );

  if (editing) {
    return <PackForm pack={editing} onSave={savePack} onCancel={() => setEditing(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Наборы вопросов</h2>
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
            onClick={() => setEditing({
              id: '',
              name: '',
              simpleRounds: Array.from({ length: SIMPLE_ROUND_COUNT }, () => ({ question: '', answers: [{ text: '', points: 10 }] })),
              reverseRound: { question: '', answers: [{ text: '', points: 10 }] },
              bigGame: Array.from({ length: BIG_GAME_QUESTIONS }, () => ({ question: '', answers: [{ text: '', points: 10 }] })),
            })}
          >
            Новый набор
          </button>
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
            onClick={importPack}
          >
            Импорт
          </button>
        </div>
      </div>

      {packs.map((pack) => (
        <div key={pack.id} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
          <div>
            <div className="font-semibold">{pack.name}</div>
            <div className="text-sm text-gray-400">{totalQuestions(pack)} вопросов</div>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
              onClick={() => setEditing({ ...pack })}
            >
              Редактировать
            </button>
            <button
              className="bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
              onClick={() => exportPack(pack)}
            >
              Экспорт
            </button>
            <button
              className="bg-red-800 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
              onClick={() => deletePack(pack.id)}
            >
              Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionEditor({
  question,
  index,
  label,
  onChange,
  onRemove,
}: {
  question: PackQuestion;
  index: number;
  label: string;
  onChange: (q: PackQuestion) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 space-y-2">
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 bg-gray-700 text-white border-gray-600 text-sm"
          value={question.question}
          onChange={(e) => onChange({ ...question, question: e.target.value })}
          placeholder={label}
        />
        {onRemove && (
          <button className="text-red-400 hover:text-red-300 text-sm" onClick={onRemove}>
            Удалить
          </button>
        )}
      </div>
      {question.answers.map((a, ai) => (
        <div key={ai} className="flex gap-2 ml-4">
          <input
            className="flex-1 border rounded px-2 py-1 bg-gray-700 text-white border-gray-600 text-xs"
            value={a.text}
            onChange={(e) => {
              const answers = [...question.answers];
              answers[ai] = { ...a, text: e.target.value };
              onChange({ ...question, answers });
            }}
            placeholder="Текст ответа"
          />
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 bg-gray-700 text-white border-gray-600 text-xs"
            value={a.points}
            onChange={(e) => {
              const answers = [...question.answers];
              answers[ai] = { ...a, points: parseInt(e.target.value) || 0 };
              onChange({ ...question, answers });
            }}
            placeholder="Очк."
          />
          <button
            className="text-red-400 hover:text-red-300 text-xs"
            onClick={() => {
              const answers = question.answers.filter((_, i) => i !== ai);
              onChange({ ...question, answers });
            }}
          >
            x
          </button>
        </div>
      ))}
      <button
        className="ml-4 text-blue-400 hover:text-blue-300 text-xs"
        onClick={() => {
          onChange({ ...question, answers: [...question.answers, { text: '', points: 10 }] });
        }}
      >
        + Добавить ответ
      </button>
    </div>
  );
}

function PackForm({
  pack,
  onSave,
  onCancel,
}: {
  pack: QuestionPack;
  onSave: (pack: QuestionPack) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(pack.name);
  const [description, setDescription] = useState(pack.description || '');
  const [id, setId] = useState(pack.id);

  // Initialize from either new format or legacy
  const [simpleRounds, setSimpleRounds] = useState<PackQuestion[]>(
    pack.simpleRounds ?? pack.questions?.slice(0, SIMPLE_ROUND_COUNT) ?? [],
  );
  const [reverseRound, setReverseRound] = useState<PackQuestion>(
    pack.reverseRound ?? pack.questions?.[SIMPLE_ROUND_COUNT] ?? { question: '', answers: [{ text: '', points: 10 }] },
  );
  const [bigGame, setBigGame] = useState<PackQuestion[]>(
    pack.bigGame ?? pack.questions?.slice(SIMPLE_ROUND_COUNT + 1, SIMPLE_ROUND_COUNT + 1 + BIG_GAME_QUESTIONS) ?? [],
  );

  const updateSimpleRound = (idx: number, q: PackQuestion) => {
    const copy = [...simpleRounds];
    copy[idx] = q;
    setSimpleRounds(copy);
  };

  const updateBigGameQ = (idx: number, q: PackQuestion) => {
    const copy = [...bigGame];
    copy[idx] = q;
    setBigGame(copy);
  };

  const handleSave = () => {
    const packId = id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    onSave({
      id: packId,
      name,
      description: description || undefined,
      simpleRounds,
      reverseRound,
      bigGame,
    });
  };

  const isValid = name.trim() && simpleRounds.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{pack.id ? 'Редактировать набор' : 'Новый набор'}</h2>
        <button className="text-gray-400 hover:text-white" onClick={onCancel}>Отмена</button>
      </div>

      <input
        className="w-full border rounded px-3 py-2 bg-gray-800 text-white border-gray-600"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название набора"
      />
      {!pack.id && (
        <input
          className="w-full border rounded px-3 py-2 bg-gray-800 text-white border-gray-600"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="ID набора (автоматически, если пусто)"
        />
      )}
      <input
        className="w-full border rounded px-3 py-2 bg-gray-800 text-white border-gray-600"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание (необязательно)"
      />

      {/* Simple Rounds */}
      <div className="space-y-2">
        <h3 className="font-semibold text-blue-400 text-sm uppercase">
          Простые раунды ({simpleRounds.length}/{SIMPLE_ROUND_COUNT})
        </h3>
        {simpleRounds.map((q, i) => (
          <QuestionEditor
            key={i}
            question={q}
            index={i}
            label={`Раунд ${i + 1} — ${['Простая', 'Двойная', 'Тройная'][i] ?? ''}`}
            onChange={(q) => updateSimpleRound(i, q)}
          />
        ))}
        {simpleRounds.length < SIMPLE_ROUND_COUNT && (
          <button
            className="text-blue-400 hover:text-blue-300 text-sm"
            onClick={() => setSimpleRounds([...simpleRounds, { question: '', answers: [{ text: '', points: 10 }] }])}
          >
            + Добавить раунд
          </button>
        )}
      </div>

      {/* Reverse Round */}
      <div className="space-y-2">
        <h3 className="font-semibold text-purple-400 text-sm uppercase">Игра наоборот (1 вопрос)</h3>
        <QuestionEditor
          question={reverseRound}
          index={0}
          label="Вопрос для игры наоборот"
          onChange={setReverseRound}
        />
      </div>

      {/* Big Game */}
      <div className="space-y-2">
        <h3 className="font-semibold text-yellow-400 text-sm uppercase">
          Большая игра ({bigGame.length}/{BIG_GAME_QUESTIONS})
        </h3>
        {bigGame.map((q, i) => (
          <QuestionEditor
            key={i}
            question={q}
            index={i}
            label={`Большая игра — вопрос ${i + 1}`}
            onChange={(q) => updateBigGameQ(i, q)}
          />
        ))}
        {bigGame.length < BIG_GAME_QUESTIONS && (
          <button
            className="text-yellow-400 hover:text-yellow-300 text-sm"
            onClick={() => setBigGame([...bigGame, { question: '', answers: [{ text: '', points: 10 }] }])}
          >
            + Добавить вопрос
          </button>
        )}
      </div>

      <button
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-500 disabled:opacity-50 font-bold"
        onClick={handleSave}
        disabled={!isValid}
      >
        Сохранить набор
      </button>
    </div>
  );
}
