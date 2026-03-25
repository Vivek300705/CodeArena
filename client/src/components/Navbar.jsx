import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { LogOut, Menu, X, Swords, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForgeButton from './ForgeButton.jsx';

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <header
        className={`fixed top-0 w-full h-16 z-50 flex items-center justify-between px-6 transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--forge-panel)]/80 backdrop-blur-md border-b border-[var(--forge-border)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-tight font-display text-[var(--forge-white)]">
            <span className="text-[var(--forge-ember)] drop-shadow-[0_0_8px_var(--forge-glow)]">&lt;/&gt;</span> CODEARENA
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, authRequired }) => {
            if (authRequired && !isAuthenticated) return null;
            const active = isActive(to);
            return (
              <Link key={to} to={to} className="relative px-4 py-2 group">
                <span className={`text-sm font-bold tracking-widest uppercase transition-colors duration-200 ${
                  active ? 'text-[var(--forge-white)]' : 'text-[var(--forge-dim)] hover:text-[var(--forge-white)]'
                }`}>{label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--forge-ember)] drop-shadow-[0_0_6px_var(--forge-ember)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {!active && (
                  <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--forge-dim)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                )}
              </Link>
            );
          })}

          {/* Duel link */}
          {isAuthenticated && (
            <Link to="/duel" className="relative px-4 py-2 group flex items-center gap-2">
              <span className={`text-sm font-bold tracking-widest uppercase transition-colors duration-200 ${
                isActive('/duel') ? 'text-[var(--forge-lava)] drop-shadow-[0_0_4px_var(--forge-lava)]' : 'text-[var(--forge-dim)] hover:text-[var(--forge-lava)]'
              }`}>
                <Swords className="w-4 h-4 inline-block mr-1" />
                Duel
              </span>
              {isActive('/duel') && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--forge-lava)] drop-shadow-[0_0_6px_var(--forge-lava)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className={`text-sm font-bold tracking-widest uppercase px-4 py-2 transition-colors ${
              isActive('/admin') ? 'text-[var(--forge-steel)]' : 'text-[var(--forge-dim)] hover:text-[var(--forge-steel)]'
            }`}>
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-sm font-bold text-[var(--forge-white)] hover:text-[var(--forge-ember)] transition-all px-3 py-1 border border-[var(--forge-border)] rounded-sm hover:border-[var(--forge-ember)] bg-[var(--forge-bg)] shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              >
                <div className="w-6 h-6 rounded-full border border-[var(--forge-ember)] flex items-center justify-center text-xs font-bold text-[var(--forge-ember)] drop-shadow-[0_0_4px_var(--forge-ember)]" style={{ background: 'var(--forge-panel)' }}>
                  {(user?.name || user?.username || 'U')[0].toUpperCase()}
                </div>
                <span>{user?.name || user?.username || 'PROFILE'}</span>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 text-[var(--forge-dim)] hover:text-[var(--forge-red)] transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-[var(--forge-dim)] hover:text-[var(--forge-white)] transition-colors uppercase tracking-widest">
                Log in
              </Link>
              <Link to="/register">
                <ForgeButton variant="primary" className="py-2 px-5 text-sm">Sign up</ForgeButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-3">
          {isAuthenticated && (
            <Link to="/dashboard" className="flex items-center justify-center w-8 h-8 rounded-sm bg-[var(--forge-panel)] border border-[var(--forge-ember)] text-[var(--forge-ember)] text-xs font-bold drop-shadow-[0_0_4px_var(--forge-ember)]">
              {(user?.name || user?.username || 'U')[0].toUpperCase()}
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[var(--forge-dim)] hover:text-[var(--forge-white)] transition-colors"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

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
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-72 z-50 md:hidden flex flex-col bg-[var(--forge-bg)] border-l border-[var(--forge-border)]"
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--forge-border)]">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[var(--forge-white)] font-display">
                    <span className="text-[var(--forge-ember)]">&lt;/&gt;</span> CODEARENA
                  </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-[var(--forge-dim)] hover:text-white p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navLinks.map(({ to, label, authRequired }, i) => {
                  if (authRequired && !isAuthenticated) return null;
                  const active = isActive(to);
                  return (
                    <motion.div key={to} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                      <Link
                        to={to}
                        className={`flex items-center justify-between px-4 py-3 transition-all font-bold text-sm tracking-widest uppercase ${
                          active
                            ? 'text-[var(--forge-ember)] border-l-2 border-[var(--forge-ember)] bg-[var(--forge-panel)]'
                            : 'text-[var(--forge-dim)] hover:text-white hover:bg-[var(--forge-panel)]'
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
                      className={`flex items-center gap-2 justify-between px-4 py-3 transition-all font-bold text-sm tracking-widest uppercase ${
                        isActive('/duel')
                          ? 'text-[var(--forge-lava)] border-l-2 border-[var(--forge-lava)] bg-[var(--forge-panel)]'
                          : 'text-[var(--forge-dim)] hover:text-[var(--forge-lava)] hover:bg-[var(--forge-panel)]'
                      }`}
                    >
                      <span className="flex items-center gap-2"><Swords className="w-4 h-4" /> Duel</span>
                    </Link>
                  </motion.div>
                )}
              </nav>

              <div className="p-4 border-t border-[var(--forge-border)]">
                {isAuthenticated ? (
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[var(--forge-red)] border border-[var(--forge-red)] hover:bg-[var(--forge-red)] hover:text-white font-bold text-sm transition-all uppercase tracking-widest"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" className="w-full text-center py-2.5 border border-[var(--forge-border)] text-[var(--forge-white)] font-bold text-sm transition-all hover:border-[var(--forge-steel)] uppercase tracking-widest">
                      Log in
                    </Link>
                    <Link to="/register" className="w-full">
                      <ForgeButton className="w-full py-2.5">Sign up</ForgeButton>
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
