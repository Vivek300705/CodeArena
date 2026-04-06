import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { useSEO } from '../hooks/useSEO.js';
import { Canvas, useFrame } from '@react-three/fiber';

// ── Forge Schemas ─────────────────────────────────────────────
const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
});

// ── 3D Wireframe ──────────────────────────────────────────────
function OctahedronMesh() {
  const meshRef = useRef();
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.z += delta * 0.04;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={2.6}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#FF6B35" wireframe transparent opacity={0.12} />
    </mesh>
  );
}

// ── Left Panel shared between both forms ──────────────────────
function LeftPanel({ subtitle }) {
  return (
    <div className="hidden lg:flex flex-col relative w-[55%] border-r border-[var(--forge-ember)] shadow-[1px_0_12px_var(--forge-glow)]">
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <span className="font-display font-black text-[30vw] tracking-tighter leading-none">&lt;/&gt;</span>
      </div>
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <OctahedronMesh />
        </Canvas>
      </div>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2, pointerEvents: 'none',
        textAlign: 'center', display: 'flex',
        flexDirection: 'column', alignItems: 'center', gap: '16px',
      }}>
        <div style={{
          fontFamily: "'Orbitron', monospace", fontWeight: '900',
          fontSize: 'clamp(48px, 7vw, 80px)', color: '#FF6B35', lineHeight: 1,
          textShadow: '0 0 20px rgba(255,107,53,0.8), 0 0 50px rgba(255,107,53,0.4)',
          animation: 'ember-pulse 2.5s ease-in-out infinite',
        }}>{'</>'}</div>
        <div style={{
          fontFamily: "'Orbitron', monospace", fontWeight: '900',
          fontSize: 'clamp(28px, 4vw, 52px)', color: '#E8EFF5',
          letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>CODEARENA</div>
        <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, transparent, #FF6B35, transparent)', borderRadius: '1px' }} />
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 'clamp(10px, 1.2vw, 13px)',
          color: '#4A6070', letterSpacing: '0.3em', textTransform: 'uppercase',
        }}>FORGE · COMPETE · CONQUER</div>
      </div>
      <div className="absolute bottom-12 left-12 z-10">
        <p className="text-[var(--forge-dim)] font-ui italic text-sm tracking-wide">{subtitle}</p>
      </div>
    </div>
  );
}

// ── FORGOT PASSWORD FORM ──────────────────────────────────────
function ForgotForm() {
  useSEO({ title: 'Forgot Password', description: 'Reset your CodeArena account password.' });
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [message, setMessage] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    try {
      setStatus(null);
      await authService.forgotPassword(data.email);
      setStatus('success');
      setMessage('If that email exists in our system, a reset link has been dispatched.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020202] font-ui overflow-hidden text-[var(--forge-white)]">
      <LeftPanel subtitle='"Every password can be reset. Every comeback is earned."' />

      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 relative z-10" style={{ background: '#0F1317', borderLeft: '1px solid #1E2832' }}>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-[var(--forge-ember)] font-black text-2xl font-display tracking-tight">&lt;/&gt;</span>
            <span className="text-[var(--forge-white)] font-black text-2xl font-display tracking-widest uppercase">CODEARENA</span>
          </div>
          <h1 className="forge-heading" data-text="RESET ACCESS">RESET ACCESS</h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '0.15em', color: '#4A6070', marginBottom: '32px', textTransform: 'uppercase' }}>
            Enter your email to receive a secure reset link.
          </p>

          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-[#0A1A12] border-l-2 border-[var(--forge-green)] text-[var(--forge-green)] text-xs font-mono uppercase tracking-widest"
              >
                [SIGNAL_SENT] {message}
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-3 bg-[#1A1010] border-l-2 border-[var(--forge-red)] text-[var(--forge-red)] text-xs font-mono uppercase tracking-widest"
              >
                [SYS_ERR] {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ position: 'relative', marginBottom: '28px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontFamily: "'Orbitron', monospace", fontSize: '10px',
                fontWeight: '700', letterSpacing: '0.25em', color: '#FF6B35',
                marginBottom: '8px', textShadow: '0 0 10px rgba(255,107,53,0.4)',
                position: 'absolute', top: '-24px', left: '0',
              }}>
                <span style={{ color: '#FF6B35', fontSize: '12px' }}>◈</span> EMAIL
              </label>
              <input
                {...register('email')}
                type="email"
                className="forge-input"
                placeholder="> your@example.com"
              />
              {errors.email && <p className="mt-2 text-[10px] text-[var(--forge-red)] font-mono uppercase tracking-wider">✗ {errors.email.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting || status === 'success'} className="btn-submit">
              {isSubmitting ? 'DISPATCHING...' : '⚡ SEND RESET LINK'}
            </button>
          </form>

          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '0.15em', color: '#4A6070', textAlign: 'center', marginTop: '24px' }}>
            REMEMBERED YOUR CREDENTIALS?{' '}
            <Link to="/login" style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: '700' }}>
              [ LOGIN → ]
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ── RESET PASSWORD FORM ───────────────────────────────────────
function ResetForm() {
  useSEO({ title: 'Set New Password', description: 'Create a new password for your CodeArena account.' });
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      await authService.resetPassword(token, data.password);
      navigate('/login', { state: { message: 'Password reset successful. Welcome back.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020202] font-ui overflow-hidden text-[var(--forge-white)]">
      <LeftPanel subtitle='"A new key. A new beginning."' />

      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 relative z-10" style={{ background: '#0F1317', borderLeft: '1px solid #1E2832' }}>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-[var(--forge-ember)] font-black text-2xl font-display tracking-tight">&lt;/&gt;</span>
            <span className="text-[var(--forge-white)] font-black text-2xl font-display tracking-widest uppercase">CODEARENA</span>
          </div>
          <h1 className="forge-heading" data-text="NEW PASSWORD">NEW PASSWORD</h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '0.15em', color: '#4A6070', marginBottom: '32px', textTransform: 'uppercase' }}>
            Choose a strong new password for your account.
          </p>

          {error && (
            <div className="mb-6 p-3 bg-[#1A1010] border-l-2 border-[var(--forge-red)] text-[var(--forge-red)] text-xs font-mono uppercase tracking-widest">
              [SYS_ERR] {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ position: 'relative', marginBottom: '28px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontFamily: "'Orbitron', monospace", fontSize: '10px',
                fontWeight: '700', letterSpacing: '0.25em', color: '#FF6B35',
                marginBottom: '8px', textShadow: '0 0 10px rgba(255,107,53,0.4)',
                position: 'absolute', top: '-24px', left: '0',
              }}>
                <span style={{ color: '#FF6B35', fontSize: '12px' }}>⬡</span> NEW PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="forge-input"
                  placeholder="> ••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: showPassword ? '#FF6B35' : '#4A6070',
                    fontSize: '16px', cursor: 'pointer', padding: '0', lineHeight: 1, transition: 'color 0.2s',
                  }}
                  tabIndex="-1"
                >
                  {showPassword ? '◉' : '◎'}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-[10px] text-[var(--forge-red)] font-mono uppercase tracking-wider">✗ {errors.password.message}</p>}
            </div>

            <div style={{ position: 'relative', marginBottom: '28px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontFamily: "'Orbitron', monospace", fontSize: '10px',
                fontWeight: '700', letterSpacing: '0.25em', color: '#FF6B35',
                marginBottom: '8px', textShadow: '0 0 10px rgba(255,107,53,0.4)',
                position: 'absolute', top: '-24px', left: '0',
              }}>
                <span style={{ color: '#FF6B35', fontSize: '12px' }}>◈</span> CONFIRM PASSWORD
              </label>
              <input
                {...register('confirm')}
                type={showPassword ? 'text' : 'password'}
                className="forge-input"
                placeholder="> ••••••••"
              />
              {errors.confirm && <p className="mt-2 text-[10px] text-[var(--forge-red)] font-mono uppercase tracking-wider">✗ {errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-submit">
              {isSubmitting ? 'FORGING NEW KEY...' : '⚡ SET NEW PASSWORD'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

// ── Default export — render based on whether token present ────
export default function ForgotPassword() {
  const { token } = useParams();
  return token ? <ResetForm /> : <ForgotForm />;
}
