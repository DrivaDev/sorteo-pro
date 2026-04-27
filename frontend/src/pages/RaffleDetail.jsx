import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Trophy, Download, ArrowLeft, Users } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { api, getCertificateUrl } from '../services/api';

function formatDate(d) {
  return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function RaffleDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [raffle, setRaffle]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/raffles/${id}`).then(setRaffle).catch(() => navigate('/dashboard')).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <PageLayout><div className="text-center py-20 text-brand-text/40">Cargando…</div></PageLayout>;
  if (!raffle)  return null;

  return (
    <PageLayout className="max-w-3xl mx-auto px-4 py-8 w-full">
      <Link to="/dashboard" className="btn btn-ghost text-sm gap-1.5 mb-6 inline-flex">
        <ArrowLeft size={14} /> Volver
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <span className={`badge ${raffle.type === 'instagram' ? 'badge-orange' : 'badge-dark'} mb-2`}>
            {raffle.type === 'instagram' ? 'Instagram' : 'Manual'}
          </span>
          <h1 className="text-2xl font-bold text-brand-dark">{raffle.title}</h1>
          <p className="text-sm text-brand-text/50 mt-1">{formatDate(raffle.executedAt)}</p>
        </div>
        <a href={getCertificateUrl(id)} target="_blank" rel="noreferrer" className="btn btn-primary gap-2 shrink-0">
          <Download size={14} /> Acta PDF
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Participantes', value: raffle.participantCount, icon: Users },
          { label: 'Ganadores',     value: raffle.winnersCount,     icon: Trophy },
          { label: 'Suplentes',     value: raffle.alternatesCount,  icon: Trophy },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl font-bold text-brand-dark">{value}</p>
            <p className="text-xs text-brand-text/50 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Winners */}
      <div className="card p-6 mb-4">
        <h2 className="font-bold text-brand-dark mb-4 flex items-center gap-2">
          <Trophy size={16} className="text-brand-orange" /> Ganadores
        </h2>
        <div className="space-y-2">
          {raffle.winners.map(w => (
            <div key={w.position} className="flex items-center gap-3 py-2 border-b border-brand-accent/30 last:border-0">
              <span className="w-7 h-7 rounded-full bg-brand-orange text-white text-sm font-bold flex items-center justify-center">{w.position}</span>
              <span className="font-semibold text-brand-dark">@{w.username}</span>
            </div>
          ))}
        </div>
      </div>

      {raffle.alternates?.length > 0 && (
        <div className="card p-6 mb-4">
          <h2 className="font-bold text-brand-dark mb-4 text-sm">Suplentes</h2>
          <div className="space-y-2">
            {raffle.alternates.map(a => (
              <div key={a.position} className="flex items-center gap-3 py-2 border-b border-brand-accent/30 last:border-0">
                <span className="w-7 h-7 rounded-full bg-brand-accent text-brand-dark text-sm font-bold flex items-center justify-center">{a.position}</span>
                <span className="text-brand-text">@{a.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {raffle.instagramPostUrl && (
        <p className="text-sm text-brand-text/50">
          Publicación: <a href={raffle.instagramPostUrl} target="_blank" rel="noreferrer" className="text-brand-orange hover:underline truncate">{raffle.instagramPostUrl}</a>
        </p>
      )}
    </PageLayout>
  );
}
