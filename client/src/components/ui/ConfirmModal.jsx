import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, danger = true }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-[#080B10]/80 backdrop-blur-sm"
           onClick={onCancel}
        />
        
        {/* Modal */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 10 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 10 }}
           className="relative w-full max-w-md bg-[var(--forge-surface)] border border-[var(--forge-border)] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Top accent line */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${danger ? 'bg-[var(--forge-red)] shadow-[0_0_10px_var(--forge-red)]' : 'bg-[var(--forge-ember)]'}`} />
          
          <div className="p-6 md:p-8">
            <div className="flex gap-4 items-start">
               <div className={`p-3 rounded-full shrink-0 ${danger ? 'bg-[var(--forge-red)]/10 text-[var(--forge-red)]' : 'bg-[var(--forge-ember)]/10 text-[var(--forge-ember)]'}`}>
                 <AlertCircle size={24} />
               </div>
               <div className="flex-1">
                 <h2 className="text-xl font-bold font-display text-white mb-2">{title}</h2>
                 <p className="text-[var(--forge-steel)] text-sm mb-8 leading-relaxed">
                   {message}
                 </p>
                 
                 <div className="flex justify-end gap-3 mt-auto">
                   <button 
                     onClick={onCancel}
                     className="px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold font-mono tracking-widest text-[#E8EFF5] bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all uppercase"
                   >
                     {cancelText}
                   </button>
                   <button 
                     onClick={onConfirm}
                     className={`px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold font-mono tracking-widest text-black transition-all uppercase flex items-center justify-center min-w-[100px] ${danger ? 'bg-[var(--forge-red)] hover:bg-[#ff5c6b] shadow-[0_0_15px_rgba(255,71,87,0.3)]' : 'bg-[var(--forge-ember)] hover:bg-[#ff7a4a] shadow-[0_0_15px_rgba(10,165,233,0.3)]'}`}
                   >
                     {confirmText}
                   </button>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
