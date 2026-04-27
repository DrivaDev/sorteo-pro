import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function ManualParticipants({ participants, onChange }) {
  const [input, setInput] = useState('');

  function parseAndAdd() {
    const lines = input.split(/[\n,;]+/).map(l => l.replace('@', '').trim()).filter(Boolean);
    if (!lines.length) return;
    const newOnes = lines.map(username => ({ username }));
    onChange(prev => {
      const existing = new Set(prev.map(p => p.username));
      return [...prev, ...newOnes.filter(p => !existing.has(p.username))];
    });
    setInput('');
  }

  function remove(username) {
    onChange(prev => prev.filter(p => p.username !== username));
  }

  function clear() {
    onChange([]);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Agregar participantes</label>
        <textarea
          className="input min-h-[100px] resize-y"
          placeholder="Ingresá usuarios separados por coma, punto y coma o línea nueva&#10;Ej: @juan, @maria, @pedro"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="button" onClick={parseAndAdd} className="btn btn-secondary mt-2">
          Agregar
        </button>
      </div>

      {participants.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-brand-dark">{participants.length} participante{participants.length !== 1 ? 's' : ''}</p>
            <button onClick={clear} className="text-xs text-red-400 hover:text-red-600">Limpiar todo</button>
          </div>
          <div className="max-h-48 overflow-y-auto border border-brand-accent rounded-lg divide-y divide-brand-accent/50">
            {participants.map((p, i) => (
              <div key={p.username} className="flex items-center justify-between px-3 py-1.5 text-sm">
                <span className="text-brand-text/70"><span className="text-brand-text/30 mr-2">{i + 1}</span>@{p.username}</span>
                <button onClick={() => remove(p.username)} className="text-red-300 hover:text-red-500">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
