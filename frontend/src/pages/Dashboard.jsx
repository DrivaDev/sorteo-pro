import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trophy, Trash2, FileText, Calendar, Users } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { api, getCertificateUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

function formatDate(d) {
  return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [raffles, setRaffles] = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get('/raffles?limit=20&page=1').then(data => {
      setRaffles(data.raffles);
      setTotal(data.total);
    }).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este sorteo? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    try {
      await api.delete(`/raffles/${id}`);
      setRaffles(r => r.filter(x => x._id !== id));
      setTotal(t => t - 1);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <PageLayout className="max-w-5xl mx-auto px-4 py-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Mis sorteos</h1>
          <p className="text-sm text-brand-text/60 mt-0.5">
            {user?.rafflesThisMonth ?? 0} sorteo{user?.rafflesThisMonth !== 1 ? 's' : ''} este mes
          </p>
        </div>
        <Link to="/raffle/new" className="btn btn-primary gap-2">
          <Plus size={16} /> Nuevo sorteo
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-brand-text/40">Cargando…</div>
      ) : raffles.length === 0 ? (
        <div className="card p-12 text-center">
          <Trophy size={40} className="text-brand-accent mx-auto mb-4" />
          <p className="font-semibold text-brand-dark mb-2">Todavía no realizaste ningún sorteo</p>
          <p className="text-sm text-brand-text/60 mb-6">Creá tu primer sorteo de Instagram o manual en segundos.</p>
          <Link to="/raffle/new" className="btn btn-primary gap-2 inline-flex">
            <Plus size={16} /> Nuevo sorteo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {raffles.map(r => (
            <div key={r._id} className="card p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${r.type === 'instagram' ? 'badge-orange' : 'badge-dark'}`}>
                    {r.type === 'instagram' ? 'Instagram' : 'Manual'}
                  </span>
                  <h2 className="font-semibold text-brand-dark truncate">{r.title}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-brand-text/50 mt-1">
                  <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(r.executedAt || r.createdAt)}</span>
                  <span className="flex items-center gap-1"><Users size={11} />{r.participantCount} participantes</span>
                  <span className="flex items-center gap-1"><Trophy size={11} />{r.winnersCount} ganador{r.winnersCount !== 1 ? 'es' : ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/raffle/${r._id}`} className="btn btn-ghost text-xs gap-1.5 text-brand-orange">
                  <Trophy size={13} /> Ver resultados
                </Link>
                <a href={getCertificateUrl(r._id)} target="_blank" rel="noreferrer" className="btn btn-ghost text-xs gap-1.5">
                  <FileText size={13} /> PDF
                </a>
                <button
                  onClick={() => handleDelete(r._id)}
                  disabled={deleting === r._id}
                  className="btn btn-ghost text-xs text-red-400 hover:text-red-600"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {total > raffles.length && (
            <p className="text-center text-sm text-brand-text/50 pt-2">Mostrando {raffles.length} de {total} sorteos</p>
          )}
        </div>
      )}
    </PageLayout>
  );
}
