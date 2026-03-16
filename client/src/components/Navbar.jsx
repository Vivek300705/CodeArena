import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { Target, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  return (
    <header className="fixed top-0 w-full h-16 border-b border-white/5 bg-background/50 backdrop-blur-md z-50 flex items-center justify-between px-6">
      <Link to="/" className="flex items-center gap-2">
         <Target className="w-6 h-6 text-primary" />
         <span className="text-xl font-black tracking-tight text-white">Code<span className="text-primary">Arena</span></span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-8">
        <Link to="/problems" className={`text-sm tracking-wide font-semibold transition-colors ${location.pathname.includes('/problems') ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>Problems</Link>
        {isAuthenticated && (
          <Link to="/history" className={`text-sm tracking-wide font-semibold transition-colors ${location.pathname.includes('/history') ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>History</Link>
        )}
        {isAuthenticated && user?.role === 'admin' && (
          <Link to="/admin" className={`text-sm tracking-wide font-semibold transition-colors ${location.pathname.includes('/admin') ? 'text-cyan-400' : 'text-zinc-500 hover:text-cyan-400'}`}>Admin</Link>
        )}
      </nav>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="hidden sm:flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <User className="w-4 h-4" /> {user?.name || user?.username || 'Dashboard'}
            </Link>
            <button onClick={logout} className="text-zinc-500 hover:text-red-400 bg-white/5 hover:bg-red-400/10 p-2 rounded-full transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">Log in</Link>
            <Link to="/register" className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
