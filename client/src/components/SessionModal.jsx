import React from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import ForgeButton from './ForgeButton.jsx';
import { ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SessionModal() {
  const { isSessionExpired, setSessionExpired } = useAuthStore();

  if (!isSessionExpired) return null;

  const handleClose = () => {
    setSessionExpired(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[var(--forge-surface)] border border-[var(--forge-border)] rounded-xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,71,87,0.15)] flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
            <ShieldAlert size={32} className="text-[#FF4757]" />
          </div>
          
          <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-3 tracking-wide">
            Session Expired
          </h2>
          
          <p className="text-[var(--forge-steel)] mb-8 font-mono text-sm leading-relaxed">
            Your secure session has timed out due to inactivity or invalid credentials. Please authenticate again to re-enter the arena.
          </p>
          
          <ForgeButton variant="primary" onClick={handleClose} className="w-full py-3">
            [ LOG IN AGAIN ]
          </ForgeButton>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
