import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, LogOut, Settings, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="bg-white border-b border-brand-accent sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-brand-dark text-lg">
          <Trophy size={22} className="text-brand-orange" />
          Sorteo Pro
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost text-sm gap-1.5">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <Link to="/settings" className="btn btn-ghost text-sm gap-1.5">
                <Settings size={15} /> Configuración
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost text-sm gap-1.5 text-red-500 hover:text-red-600">
                <LogOut size={15} /> Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost text-sm">Ingresar</Link>
              <Link to="/register" className="btn btn-primary text-sm">Crear cuenta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
