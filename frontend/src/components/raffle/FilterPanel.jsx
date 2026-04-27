import { useState } from 'react';

export default function FilterPanel({ filters, onChange }) {
  const [excludeInput, setExcludeInput] = useState('');

  function update(key, value) {
    onChange(prev => ({ ...prev, [key]: value }));
  }

  function addExclude() {
    const acc = excludeInput.replace('@', '').trim();
    if (!acc) return;
    onChange(prev => ({
      ...prev,
      excludeAccounts: [...new Set([...(prev.excludeAccounts || []), acc])],
    }));
    setExcludeInput('');
  }

  function removeExclude(acc) {
    onChange(prev => ({ ...prev, excludeAccounts: prev.excludeAccounts.filter(a => a !== acc) }));
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-brand-dark text-sm">Filtros</h3>

      {/* Tipo de participación */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" className="accent-brand-orange" checked={filters.commenters}
            onChange={e => { update('commenters', e.target.checked); if (e.target.checked) update('commentersAndLikers', false); }} />
          Solo comentaristas
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-text/50" title="No disponible por limitaciones de la API de Instagram">
          <input type="checkbox" className="accent-brand-orange" checked={filters.likers}
            onChange={e => { update('likers', e.target.checked); if (e.target.checked) { update('commenters', false); update('commentersAndLikers', false); } }} />
          Solo usuarios que dieron like
          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Limitado por Meta API</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-text/50" title="No disponible por limitaciones de la API de Instagram">
          <input type="checkbox" className="accent-brand-orange" checked={filters.commentersAndLikers}
            onChange={e => { update('commentersAndLikers', e.target.checked); if (e.target.checked) { update('commenters', false); update('likers', false); } }} />
          Comentaristas Y like
          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Limitado por Meta API</span>
        </label>
      </div>

      <div className="divider" />

      {/* Opciones extra */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Mínimo de menciones en el comentario</label>
          <input
            className="input"
            type="number" min={0} max={10}
            value={filters.minMentions}
            onChange={e => update('minMentions', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Keyword requerida (opcional)</label>
          <input
            className="input"
            placeholder="Ej: giveaway"
            value={filters.requiredKeyword}
            onChange={e => update('requiredKeyword', e.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-sm">
        <input type="checkbox" className="accent-brand-orange" checked={filters.noDuplicates}
          onChange={e => update('noDuplicates', e.target.checked)} />
        Eliminar duplicados (un usuario = un número)
      </label>

      {/* Exclusiones */}
      <div>
        <label className="label">Excluir cuentas</label>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="@usuario"
            value={excludeInput}
            onChange={e => setExcludeInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addExclude())}
          />
          <button type="button" onClick={addExclude} className="btn btn-ghost shrink-0">Agregar</button>
        </div>
        {filters.excludeAccounts?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {filters.excludeAccounts.map(acc => (
              <span key={acc} className="badge badge-dark flex items-center gap-1">
                @{acc}
                <button onClick={() => removeExclude(acc)} className="text-white/60 hover:text-white ml-0.5">×</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
