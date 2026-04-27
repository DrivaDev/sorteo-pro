import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Landing      from './pages/Landing';
import Register     from './pages/Register';
import VerifyEmail  from './pages/VerifyEmail';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import NewRaffle    from './pages/NewRaffle';
import RaffleResult from './pages/RaffleResult';
import RaffleDetail from './pages/RaffleDetail';
import Settings     from './pages/Settings';

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center"><span className="text-brand-dark font-semibold">Cargando…</span></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function Guest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register"    element={<Guest><Register /></Guest>} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/login"       element={<Guest><Login /></Guest>} />
      <Route path="/dashboard"   element={<Private><Dashboard /></Private>} />
      <Route path="/raffle/new"  element={<Private><NewRaffle /></Private>} />
      <Route path="/raffle/:id/result" element={<Private><RaffleResult /></Private>} />
      <Route path="/raffle/:id"  element={<Private><RaffleDetail /></Private>} />
      <Route path="/settings"    element={<Private><Settings /></Private>} />
      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>
  );
}
