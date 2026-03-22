import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { Target, User, LogOut, Menu, X, Swords, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/problems', label: 'Problems', authRequired: false },
  { to: '/leaderboard', label: 'Leaderboard', authRequired: false },
  { to: '/history', label: 'History', authRequired: true },
];

export default function Navbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 w-full h-16 z-50 flex items-center justify-between px-6 transition-all duration-300 ${
          scrolled
            ? 'bg-[#03030a]/90 backdrop-blur-2xl border-b border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
            : 'bg-transparent'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Target className="w-6 h-6 text-neon-cyan transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
            <div className="absolute inset-0 bg-neon-cyan/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-xl font-black tracking-tight text-white font-display">
            Code<span className="text-neon-cyan drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]">Arena</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, authRequired }) => {
            if (authRequired && !isAuthenticated) return null;
            const active = isActive(to);
            return (
              <Link key={to} to={to} className="relative px-4 py-2 group">
                <span className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                  active ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'
                }`}>{label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-neon-cyan to-blue-400"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {!active && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                )}
              </Link>
            );
          })}

          {/* Duel link with pulse indicator */}
          {isAuthenticated && (
            <Link to="/duel" className="relative px-4 py-2 group">
              <span className={`text-sm font-semibold tracking-wide flex items-center gap-1.5 transition-colors duration-200 ${
                isActive('/duel') ? 'text-ember' : 'text-zinc-500 hover:text-ember'
              }`}>
                <Swords className="w-3.5 h-3.5" />
                Duel
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              </span>
              {isActive('/duel') && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-ember to-red-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className="relative px-4 py-2 group">
              <span className={`text-sm font-semibold tracking-wide transition-colors ${
                isActive('/admin') ? 'text-neon-cyan' : 'text-zinc-500 hover:text-neon-cyan'
              }`}>Admin</span>
            </Link>
          )}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white transition-all px-3 py-1.5 rounded-full border border-white/8 hover:border-neon-cyan/30 bg-white/4 hover:bg-neon-cyan/5 backdrop-blur-sm"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-cyan/40 to-blue-600/40 border border-neon-cyan/30 flex items-center justify-center text-xs font-bold text-neon-cyan">
                  {(user?.name || user?.username || 'U')[0].toUpperCase()}
                </div>
                <span>{user?.name || user?.username || 'Dashboard'}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-full border border-white/8 bg-white/4 text-zinc-500 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/8 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors px-3 py-1.5">
                Log in
              </Link>
              <Link
                to="/register"
                className="btn-shimmer px-5 py-2 rounded-lg text-sm font-bold text-white transition-all duration-300 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,200,232,0.9), rgba(59,130,246,0.9))',
                  boxShadow: '0 0 20px rgba(0,200,232,0.25)',
                }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-3">
          {isAuthenticated && (
            <Link to="/dashboard" className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan/30 to-blue-600/30 border border-neon-cyan/30 text-neon-cyan text-xs font-bold">
              {(user?.name || user?.username || 'U')[0].toUpperCase()}
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-72 z-50 md:hidden flex flex-col"
              style={{
                background: 'rgba(5, 5, 12, 0.97)',
                backdropFilter: 'blur(40px)',
                borderLeft: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-neon-cyan" />
                  <span className="font-black text-white font-display">Code<span className="text-neon-cyan">Arena</span></span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-500 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navLinks.map(({ to, label, authRequired }, i) => {
                  if (authRequired && !isAuthenticated) return null;
                  const active = isActive(to);
                  return (
                    <motion.div
                      key={to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        to={to}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                          active
                            ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {label}
                        {active && <ChevronRight className="w-4 h-4" />}
                      </Link>
                    </motion.div>
                  );
                })}

                {isAuthenticated && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}>
                    <Link
                      to="/duel"
                      className={`flex items-center gap-2 justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                        isActive('/duel')
                          ? 'bg-ember/10 text-ember border border-ember/20'
                          : 'text-zinc-400 hover:text-ember hover:bg-ember/5'
                      }`}
                    >
                      <span className="flex items-center gap-2"><Swords className="w-4 h-4" /> Duel Mode</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                    </Link>
                  </motion.div>
                )}

                {isAuthenticated && user?.role === 'admin' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.24 }}>
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-3 rounded-xl text-zinc-400 hover:text-neon-cyan hover:bg-neon-cyan/5 transition-all font-semibold text-sm">
                      Admin Panel
                    </Link>
                  </motion.div>
                )}
              </nav>

              {/* Drawer Footer Auth */}
              <div className="p-4 border-t border-white/5">
                {isAuthenticated ? (
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 font-bold text-sm transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/login" className="w-full text-center py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:text-white font-bold text-sm transition-all hover:bg-white/5">
                      Log in
                    </Link>
                    <Link to="/register" className="w-full text-center py-2.5 rounded-xl font-bold text-sm text-black transition-all"
                      style={{ background: 'linear-gradient(135deg, #00c8e8, #3b82f6)', boxShadow: '0 0 20px rgba(0,200,232,0.25)' }}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
