import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Trophy, Mail } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const { login } = useAuth();

  const email = params.get('email') || '';
  const [code, setCode]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent]   = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/verify-email', { email, code });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    try {
      await api.post('/auth/resend-code', { email });
      setResent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Trophy size={28} className="text-brand-orange" />
          <span className="text-2xl font-bold text-brand-dark">Sorteo Pro</span>
        </div>

        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-bg flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-brand-orange" />
          </div>
          <h1 className="text-xl font-bold text-brand-dark mb-1">Verificá tu email</h1>
          <p className="text-sm text-brand-text/60 mb-6">
            Te enviamos un código de 6 dígitos a <strong>{email}</strong>
          </p>

          {error  && <p className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</p>}
          {resent && <p className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">Código reenviado. Revisá tu email.</p>}

          <form onSubmit={handleVerify} className="space-y-4">
            <input
              className="input text-center text-2xl tracking-widest font-bold"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
            <button type="submit" className="btn btn-primary w-full" disabled={loading || code.length !== 6}>
              {loading ? 'Verificando…' : 'Verificar'}
            </button>
          </form>

          <button onClick={handleResend} className="text-sm text-brand-orange hover:underline mt-4">
            ¿No llegó? Reenviar código
          </button>
        </div>

        <p className="text-center text-sm text-brand-text/60 mt-6">
          <Link to="/register" className="text-brand-orange hover:underline">Volver al registro</Link>
        </p>
      </div>
    </div>
  );
}
