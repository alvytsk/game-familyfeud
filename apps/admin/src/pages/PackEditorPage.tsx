import { useState, useEffect } from 'react';
import type { QuestionPack, PackQuestion } from '@familyfeud/shared';

export function PackEditorPage() {
  const [packs, setPacks] = useState<QuestionPack[]>([]);
  const [editing, setEditing] = useState<QuestionPack | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPacks = async () => {
    setLoading(true);
    const res = await fetch('/api/packs');
    const list = await res.json() as { id: string; name: string }[];
    const full: QuestionPack[] = [];
    for (const p of list) {
      const r = await fetch(`/api/packs/${p.id}`);
      full.push(await r.json() as QuestionPack);
    }
    setPacks(full);
    setLoading(false);
  };

  useEffect(() => { fetchPacks(); }, []);

  const savePack = async (pack: QuestionPack) => {
    const existing = packs.find(p => p.id === pack.id);
    const method = existing ? 'PUT' : 'POST';
    const url = existing ? `/api/packs/${pack.id}` : '/api/packs';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pack),
    });
    await fetchPacks();
    setEditing(null);
  };

  const deletePack = async (id: string) => {
    if (!confirm('Удалить этот набор?')) return;
    await fetch(`/api/packs/${id}`, { method: 'DELETE' });
    await fetchPacks();
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
        if (!pack.id || !pack.name || !pack.questions) {
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

  if (loading) return <div className="text-gray-400">Загрузка наборов...</div>;

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
            onClick={() => setEditing({ id: '', name: '', questions: [] })}
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
            <div className="text-sm text-gray-400">{pack.questions.length} вопросов</div>
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
  const [questions, setQuestions] = useState<PackQuestion[]>(pack.questions);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', answers: [{ text: '', points: 10 }] }]);
  };

  const updateQuestion = (idx: number, q: PackQuestion) => {
    const copy = [...questions];
    copy[idx] = q;
    setQuestions(copy);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const packId = id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    onSave({ id: packId, name, description: description || undefined, questions });
  };

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

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi} className="bg-gray-800 rounded-lg p-3 space-y-2">
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-2 py-1 bg-gray-700 text-white border-gray-600 text-sm"
                value={q.question}
                onChange={(e) => updateQuestion(qi, { ...q, question: e.target.value })}
                placeholder={`Вопрос ${qi + 1}`}
              />
              <button
                className="text-red-400 hover:text-red-300 text-sm"
                onClick={() => removeQuestion(qi)}
              >
                Удалить
              </button>
            </div>
            {q.answers.map((a, ai) => (
              <div key={ai} className="flex gap-2 ml-4">
                <input
                  className="flex-1 border rounded px-2 py-1 bg-gray-700 text-white border-gray-600 text-xs"
                  value={a.text}
                  onChange={(e) => {
                    const answers = [...q.answers];
                    answers[ai] = { ...a, text: e.target.value };
                    updateQuestion(qi, { ...q, answers });
                  }}
                  placeholder="Текст ответа"
                />
                <input
                  type="number"
                  className="w-16 border rounded px-2 py-1 bg-gray-700 text-white border-gray-600 text-xs"
                  value={a.points}
                  onChange={(e) => {
                    const answers = [...q.answers];
                    answers[ai] = { ...a, points: parseInt(e.target.value) || 0 };
                    updateQuestion(qi, { ...q, answers });
                  }}
                  placeholder="Очк."
                />
                <button
                  className="text-red-400 hover:text-red-300 text-xs"
                  onClick={() => {
                    const answers = q.answers.filter((_, i) => i !== ai);
                    updateQuestion(qi, { ...q, answers });
                  }}
                >
                  x
                </button>
              </div>
            ))}
            <button
              className="ml-4 text-blue-400 hover:text-blue-300 text-xs"
              onClick={() => {
                updateQuestion(qi, { ...q, answers: [...q.answers, { text: '', points: 10 }] });
              }}
            >
              + Добавить ответ
            </button>
          </div>
        ))}
      </div>

      <button
        className="text-blue-400 hover:text-blue-300 text-sm"
        onClick={addQuestion}
      >
        + Добавить вопрос
      </button>

      <button
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-500 disabled:opacity-50 font-bold"
        onClick={handleSave}
        disabled={!name.trim() || questions.length === 0}
      >
        Сохранить набор
      </button>
    </div>
  );
}
