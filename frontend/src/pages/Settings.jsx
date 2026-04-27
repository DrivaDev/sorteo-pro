import { useState } from 'react';
import { Instagram, User, CheckCircle, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateUser, reloadUser } = useAuth();
  const [params]   = useSearchParams();
  const igError    = params.get('ig_error');
  const igConnected = params.get('ig_connected');

  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError]   = useState(igError || '');
  const [success, setSuccess] = useState(igConnected ? `Instagram conectado como @${params.get('ig_username')}` : '');

  async function handleDisconnect() {
    if (!confirm('¿Desconectar tu cuenta de Instagram?')) return;
    setDisconnecting(true);
    try {
      await api.delete('/instagram/disconnect');
      updateUser({ instagramConnected: false, instagramUsername: null });
      setSuccess('Cuenta de Instagram desconectada');
    } catch (err) {
      setError(err.message);
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <PageLayout className="max-w-2xl mx-auto px-4 py-8 w-full">
      <h1 className="page-title mb-8">Configuración</h1>

      {error   && <p className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</p>}
      {success && <p className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">{success}</p>}

      {/* Cuenta */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-brand-dark mb-4 flex items-center gap-2">
          <User size={16} /> Mi cuenta
        </h2>
        <p className="text-sm text-brand-text/70">Email: <strong>{user?.email}</strong></p>
        <p className="text-sm text-brand-text/70 mt-1">Plan: <strong className="capitalize">{user?.plan || 'Gratis'}</strong></p>
        <p className="text-sm text-brand-text/70 mt-1">Sorteos este mes: <strong>{user?.rafflesThisMonth || 0}</strong></p>
      </div>

      {/* Instagram */}
      <div className="card p-6">
        <h2 className="font-semibold text-brand-dark mb-4 flex items-center gap-2">
          <Instagram size={16} /> Instagram
        </h2>

        {user?.instagramConnected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              <span className="text-sm font-medium text-brand-dark">@{user.instagramUsername}</span>
              <span className="badge badge-green">Conectado</span>
            </div>
            <button onClick={handleDisconnect} disabled={disconnecting} className="btn btn-ghost text-sm text-red-500 hover:text-red-600">
              {disconnecting ? 'Desconectando…' : 'Desconectar'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle size={18} className="text-brand-text/30" />
              <span className="text-sm text-brand-text/60">No conectado</span>
            </div>
            <a href="/api/instagram/connect" className="btn btn-primary text-sm gap-2">
              <Instagram size={14} /> Conectar
            </a>
          </div>
        )}

        <p className="text-xs text-brand-text/40 mt-4">
          Al conectar Instagram permitís que Sorteo Pro acceda a los comentarios de tus publicaciones para realizar sorteos.
          Tu token se almacena de forma segura y se renueva automáticamente.
        </p>
      </div>
    </PageLayout>
  );
}
