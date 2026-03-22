import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { Target, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPassword() {
  useDocumentTitle('Forgot Password');
  const [status, setStatus] = useState({ type: '', message: '' });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    try {
      setStatus({ type: '', message: '' });
      await authService.forgotPassword(data.email);
      setStatus({ type: 'success', message: 'If an account exists, a reset link has been sent.' });
    } catch (err) {
      // In a real app we might not want to reveal if an email exists
      // but for UX showing an error is fine.
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to send reset email.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(2,3,12,0.95), rgba(2,3,12,1))' }}>
      {/* Ambient glowing */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-2xl border border-white/5"
        style={{ background: 'rgba(5,5,15,0.95)', backdropFilter: 'blur(30px)', boxShadow: '0 20px 80px rgba(0,0,0,0.8)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <Target className="w-8 h-8 text-neon-cyan" style={{ filter: 'drop-shadow(0 0 10px rgba(0,245,255,0.5))' }} />
            <span className="text-2xl font-black font-display text-white">Code<span className="text-neon-cyan">Arena</span></span>
          </Link>
        </div>

        <h1 className="text-2xl font-black font-display text-white mb-2 text-center">Reset Password</h1>
        <p className="text-zinc-500 text-sm text-center mb-8">Enter your email and we will send you instructions to reset your password.</p>

        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
          >
            {status.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <span className="text-sm font-medium">{status.message}</span>
          </motion.div>
        )}

        {status.type !== 'success' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-neon-cyan transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className="input-glow w-full pl-10"
                  placeholder="hacker@matrix.com"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-shimmer w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-[#03030a] mt-2 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #00eeff, #60a5fa)', boxShadow: '0 0 20px rgba(0,245,255,0.2)' }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-[#03030a]/30 border-t-[#03030a] rounded-full animate-spin" />
              ) : (
                <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-sm text-zinc-500">
            Remember your password?{' '}
            <Link to="/login" className="text-white hover:text-neon-cyan transition-colors font-bold">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
