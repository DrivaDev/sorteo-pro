import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, List, ChevronRight, AlertTriangle } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FilterPanel from '../components/raffle/FilterPanel';
import ManualParticipants from '../components/raffle/ManualParticipants';

export default function NewRaffle() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [type, setType]         = useState(''); // 'instagram' | 'manual'
  const [title, setTitle]       = useState('');
  const [postUrl, setPostUrl]   = useState('');
  const [filters, setFilters]   = useState({
    commenters: true, likers: false, commentersAndLikers: false,
    minMentions: 0, requiredKeyword: '', noDuplicates: true, excludeAccounts: [],
  });
  const [manualList, setManualList] = useState([]);
  const [winnersCount, setWinnersCount]     = useState(1);
  const [alternatesCount, setAlternatesCount] = useState(0);

  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participants, setParticipants]               = useState(null);
  const [participantsWarning, setParticipantsWarning] = useState('');
  const [mediaInfo, setMediaInfo]                     = useState(null);
  const [running, setRunning]     = useState(false);
  const [error, setError]         = useState('');

  async function fetchParticipants() {
    if (!postUrl.trim()) return;
    setError('');
    setLoadingParticipants(true);
    setParticipants(null);
    setParticipantsWarning('');
    try {
      const data = await api.post('/instagram/participants', { postUrl: postUrl.trim(), filters });
      setParticipants(data.participants);
      setMediaInfo(data.mediaInfo);
      if (data.warning) setParticipantsWarning(data.warning);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingParticipants(false);
    }
  }

  async function handleRun() {
    setError('');
    const finalParticipants = type === 'instagram' ? participants : manualList;
    if (!finalParticipants?.length) { setError('No hay participantes'); return; }
    if (!title.trim()) { setError('El título es requerido'); return; }

    setRunning(true);
    try {
      const body = {
        title: title.trim(),
        type,
        participants: finalParticipants,
        winnersCount,
        alternatesCount,
        ...(type === 'instagram' && { instagramPostUrl: postUrl, filters }),
      };
      const data = await api.post('/raffles', body);
      updateUser({ rafflesThisMonth: (user?.rafflesThisMonth || 0) + 1 });
      navigate(`/raffle/${data.raffle.id}/result`, { state: { raffle: data.raffle } });
    } catch (err) {
      if (err.data?.limitReached) {
        setError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setRunning(false);
    }
  }

  const finalParticipants = type === 'instagram' ? participants : manualList;
  const canRun = title.trim() && finalParticipants?.length > 0 && !running;

  return (
    <PageLayout className="max-w-3xl mx-auto px-4 py-8 w-full">
      <h1 className="page-title mb-2">Nuevo sorteo</h1>
      <p className="page-subtitle mb-8">Configurá tu sorteo y ejecutalo en segundos</p>

      {/* Tipo */}
      {!type && (
        <div className="grid sm:grid-cols-2 gap-4">
          <button onClick={() => setType('instagram')} className="card card-hover p-6 text-left">
            <div className="w-10 h-10 rounded-lg ig-gradient flex items-center justify-center mb-4">
              <Instagram size={20} className="text-white" />
            </div>
            <h2 className="font-bold text-brand-dark mb-1">Sorteo de Instagram</h2>
            <p className="text-sm text-brand-text/60">Seleccioná ganadores de los comentarios de una publicación</p>
            <ChevronRight size={16} className="text-brand-orange mt-3" />
          </button>
          <button onClick={() => setType('manual')} className="card card-hover p-6 text-left">
            <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center mb-4">
              <List size={20} className="text-white" />
            </div>
            <h2 className="font-bold text-brand-dark mb-1">Sorteo manual</h2>
            <p className="text-sm text-brand-text/60">Cargá tu propia lista de participantes</p>
            <ChevronRight size={16} className="text-brand-orange mt-3" />
          </button>
        </div>
      )}

      {type && (
        <div className="space-y-6">
          {/* Título */}
          <div className="card p-6">
            <label className="label">Título del sorteo</label>
            <input
              className="input"
              placeholder="Ej: Sorteo iPhone 15 — Mayo 2025"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Instagram config */}
          {type === 'instagram' && (
            <>
              {!user?.instagramConnected ? (
                <div className="card p-6 text-center">
                  <Instagram size={32} className="ig-gradient-text mx-auto mb-3" />
                  <p className="font-semibold text-brand-dark mb-1">Conectá tu cuenta de Instagram</p>
                  <p className="text-sm text-brand-text/60 mb-4">Necesitás conectar Instagram para acceder a los comentarios de tus publicaciones.</p>
                  <a href={`/api/instagram/connect?token=${localStorage.getItem('token')}`} className="btn btn-primary gap-2">
                    <Instagram size={15} /> Conectar Instagram
                  </a>
                </div>
              ) : (
                <>
                  <div className="card p-6 space-y-4">
                    <div>
                      <label className="label">URL de la publicación</label>
                      <div className="flex gap-2">
                        <input
                          className="input flex-1"
                          placeholder="https://www.instagram.com/p/..."
                          value={postUrl}
                          onChange={e => { setPostUrl(e.target.value); setParticipants(null); }}
                        />
                        <button
                          className="btn btn-secondary shrink-0"
                          onClick={fetchParticipants}
                          disabled={loadingParticipants || !postUrl.trim()}
                        >
                          {loadingParticipants ? 'Cargando…' : 'Cargar'}
                        </button>
                      </div>
                    </div>
                    <FilterPanel filters={filters} onChange={setFilters} />
                    {participantsWarning && (
                      <div className="flex items-start gap-2 bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-lg">
                        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                        {participantsWarning}
                      </div>
                    )}
                    {participants !== null && (
                      <p className="text-sm text-brand-text/60">
                        <strong className="text-brand-dark">{participants.length}</strong> participantes encontrados
                        {mediaInfo?.commentsCount ? ` · ${mediaInfo.commentsCount} comentarios totales` : ''}
                      </p>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Manual */}
          {type === 'manual' && (
            <div className="card p-6">
              <ManualParticipants participants={manualList} onChange={setManualList} />
            </div>
          )}

          {/* Ganadores / suplentes */}
          {finalParticipants !== null && (
            <div className="card p-6">
              <h2 className="font-semibold text-brand-dark mb-4">Configuración del sorteo</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Cantidad de ganadores</label>
                  <input
                    className="input"
                    type="number" min={1}
                    max={finalParticipants?.length || 1}
                    value={winnersCount}
                    onChange={e => setWinnersCount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">Suplentes (opcional)</label>
                  <input
                    className="input"
                    type="number" min={0}
                    max={(finalParticipants?.length || 0) - winnersCount}
                    value={alternatesCount}
                    onChange={e => setAlternatesCount(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {error && <p className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => { setType(''); setParticipants(null); }} className="btn btn-ghost">
              ← Cambiar tipo
            </button>
            <button onClick={handleRun} disabled={!canRun} className="btn btn-primary flex-1">
              {running ? '¡Sorteando…!' : '🎉 Realizar sorteo'}
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
