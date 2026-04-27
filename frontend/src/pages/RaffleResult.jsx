import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Trophy, Download, RotateCcw, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import PageLayout from '../components/layout/PageLayout';
import { getCertificateUrl, api } from '../services/api';

function WinnerCard({ winner, isAlternate }) {
  return (
    <div className={`card p-5 flex items-center gap-4 ${isAlternate ? '' : 'border-brand-orange/30 bg-orange-50/50'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${isAlternate ? 'bg-brand-accent/40 text-brand-dark' : 'bg-brand-orange text-white'}`}>
        {winner.position}
      </div>
      <div>
        <p className={`font-bold ${isAlternate ? 'text-brand-text' : 'text-brand-dark'} text-lg`}>@{winner.username}</p>
        {isAlternate && <p className="text-xs text-brand-text/50">Suplente</p>}
      </div>
      {!isAlternate && <Trophy size={20} className="text-brand-orange ml-auto" />}
    </div>
  );
}

export default function RaffleResult() {
  const { state } = useLocation();
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [raffle, setRaffle] = useState(state?.raffle || null);
  const [loading, setLoading] = useState(!state?.raffle);

  useEffect(() => {
    if (!raffle && id) {
      api.get(`/raffles/${id}`).then(setRaffle).catch(() => navigate('/dashboard')).finally(() => setLoading(false));
    }
  }, [id, raffle, navigate]);

  useEffect(() => {
    if (raffle) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    }
  }, [raffle]);

  if (loading) return <PageLayout><div className="text-center py-20">Cargando…</div></PageLayout>;
  if (!raffle) return null;

  return (
    <PageLayout className="max-w-2xl mx-auto px-4 py-8 w-full">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-brand-dark">¡Sorteo completado!</h1>
        <p className="text-brand-text/60 mt-2">{raffle.title}</p>
        <p className="text-sm text-brand-text/40 mt-1">{raffle.participantCount} participantes</p>
      </div>

      <div className="space-y-3 mb-6">
        <h2 className="font-bold text-brand-dark flex items-center gap-2"><Trophy size={16} className="text-brand-orange" /> Ganadores</h2>
        {raffle.winners.map(w => <WinnerCard key={w.position} winner={w} isAlternate={false} />)}
      </div>

      {raffle.alternates?.length > 0 && (
        <div className="space-y-3 mb-8">
          <h2 className="font-bold text-brand-dark text-sm text-brand-text/60">Suplentes</h2>
          {raffle.alternates.map(a => <WinnerCard key={a.position} winner={a} isAlternate={true} />)}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={getCertificateUrl(raffle.id || raffle._id)}
          target="_blank" rel="noreferrer"
          className="btn btn-primary flex-1 gap-2 justify-center"
        >
          <Download size={16} /> Descargar acta PDF
        </a>
        <Link to="/raffle/new" className="btn btn-secondary flex-1 gap-2 justify-center">
          <RotateCcw size={16} /> Nuevo sorteo
        </Link>
        <Link to="/dashboard" className="btn btn-ghost flex-1 gap-2 justify-center">
          <FileText size={16} /> Ver historial
        </Link>
      </div>
    </PageLayout>
  );
}
