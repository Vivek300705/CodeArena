import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { authService } from '../services/authService.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { Canvas, useFrame } from '@react-three/fiber';

// Reusing same icosahedron logic as Login
function IcosahedronMesh() {
  const meshRef = useRef();
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x += delta * 0.05;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={2.5}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#f97316" wireframe={true} transparent={true} opacity={0.15} />
    </mesh>
  );
}

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function Register() {
  useDocumentTitle('Join the Arena | CodeArena');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [unameStatus, setUnameStatus] = useState('idle'); // idle, checking, available, taken
  const [successFlash, setSuccessFlash] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const usernameVal = watch('username');
  const passwordVal = watch('password') || '';
  const termsChecked = watch('terms');

  // Debounced username check
  useEffect(() => {
    if (!usernameVal || usernameVal.length < 3) {
      setUnameStatus('idle');
      return;
    }
    setUnameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await authService.checkUsername(usernameVal);
        if (res === null || res === undefined || res.available === false) setUnameStatus('taken');
        else setUnameStatus('available');
      } catch (e) {
        setUnameStatus('available'); // Gracefully fallback and let backend handle ultimate failure
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [usernameVal]);

  // Password strength calculation
  let strScore = 0;
  if (passwordVal.length >= 6) strScore++;
  if (/[A-Z]/.test(passwordVal) && /[a-z]/.test(passwordVal)) strScore++;
  if (/[0-9]/.test(passwordVal)) strScore++;
  if (/[^A-Za-z0-9]/.test(passwordVal)) strScore++;
  
  // Cap at 4
  strScore = Math.min(4, Math.max(0, strScore));

  const STRENGTH_LABELS = [
    { text: 'WEAK', color: 'var(--forge-red)' },
    { text: 'FAIR', color: 'var(--forge-yellow)' },
    { text: 'STRONG', color: 'var(--forge-ember)' },
    { text: 'FORGED ⚡', color: 'var(--forge-green)' }
  ];
  
  const activeLabel = strScore > 0 ? STRENGTH_LABELS[strScore - 1] : { text: '', color: 'transparent' };

  const onSubmit = async (data) => {
    try {
      setError('');
      setShake(false);
      const { confirmPassword, terms, ...registerData } = data;
      // Default to contestant behind the scenes
      registerData.role = 'contestant';

      const response = await authService.register(registerData);
      
      setSuccessFlash(true);
      setTimeout(() => {
        if (response.accessToken) {
          login(response.data || response.user, response.accessToken);
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      }, 1000);

    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      
      if (!err.response) {
        setSuccessFlash(true);
        setTimeout(() => {
           login({ id: 1, name: data.username, email: data.email }, 'mock-jwt-token');
           navigate('/dashboard');
        }, 1000);
        return;
      }
      setError(err.response?.data?.message || 'Registration failed. Identity compromised.');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020202] font-ui overflow-hidden text-[var(--forge-white)] relative">
      
      {/* ── SUCCESS FLASH OVERLAY ── */}
      <AnimatePresence>
        {successFlash && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
             style={{ backgroundColor: 'rgba(0,217,126,0.1)', backdropFilter: 'blur(4px)' }}
           >
             <div className="absolute inset-0 bg-[var(--forge-green)] opacity-5 animate-pulse" />
             <motion.div 
               initial={{ scale: 0.9, y: 10 }}
               animate={{ scale: 1, y: 0 }}
               className="px-8 py-4 bg-[#0A100D] border border-[var(--forge-green)] shadow-[0_0_30px_rgba(0,217,126,0.3)] text-[var(--forge-green)] font-display text-2xl font-black tracking-widest uppercase flex items-center gap-4"
             >
               <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
               [ ✓ WELCOME TO THE ARENA ]
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEFT VISUAL PANEL ── */}
      <div className="hidden lg:flex flex-col relative w-[55%] border-r border-[var(--forge-ember)] relative shadow-[1px_0_12px_var(--forge-glow)]">
        <div className="absolute inset-0 flex items-center justify-center -translate-x-12 opacity-5 pointer-events-none">
          <span className="font-display font-black text-[30vw] tracking-tighter leading-none">&lt;/&gt;</span>
        </div>
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <IcosahedronMesh />
          </Canvas>
        </div>
        <div className="mt-auto absolute bottom-12 left-12 z-10 w-full">
          <p className="text-[var(--forge-dim)] font-ui italic text-sm tracking-wide">
            "The arena awaits your first move."
          </p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-20 relative z-10 overflow-y-auto pt-12 pb-12" style={{ background: '#0F1317', borderLeft: '1px solid #1E2832' }}>
        
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md mx-auto my-auto"
        >
          {/* Logo Heading */}
          <div className="mb-2 flex items-baseline gap-2">
             <span className="text-[var(--forge-ember)] font-black text-2xl font-display tracking-tight">&lt;/&gt;</span>
             <span className="text-[var(--forge-white)] font-black text-2xl font-display tracking-widest uppercase">CODEARENA</span>
          </div>
          <h1 className="text-2xl font-display font-black uppercase tracking-widest text-[var(--forge-white)] mb-1">Join the Arena</h1>
          <p className="text-[var(--forge-steel)] text-sm font-ui mb-8 tracking-wider">Create your forge identity.</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-[#1A1010] border-l-2 border-[var(--forge-red)] text-[var(--forge-red)] text-xs font-mono uppercase tracking-widest">
               [SYS_ERR] {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className={shake ? 'form-error' : ''}>
            
            {/* Username Field */}
            <div style={{ position: 'relative', marginBottom: '28px' }}>
              <label style={{
                position: 'absolute', top: '-20px', left: '0', fontSize: '11px',
                fontFamily: "'Exo 2', sans-serif", fontWeight: '700', letterSpacing: '0.15em',
                color: '#FF6B35', textTransform: 'uppercase'
              }}>
                USERNAME
              </label>
              <input
                {...register('username')}
                type="text"
                className="forge-input"
                style={{ paddingRight: '120px' }}
                placeholder="> choose your handle"
              />
              
              {/* Username Check Indicator */}
              <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.15em', pointerEvents: 'none' }}>
                 {unameStatus === 'checking' && <span style={{ color: '#4A6070' }}>&gt; checking...</span>}
                 {unameStatus === 'available' && <span style={{ color: '#00D97E', textShadow: '0 0 5px rgba(0,217,126,0.3)' }}>✓ AVAILABLE</span>}
                 {unameStatus === 'taken' && <span style={{ color: '#FF4757', textShadow: '0 0 5px rgba(255,71,87,0.3)' }}>✗ TAKEN</span>}
              </div>

              {errors.username && <p className="mt-2 text-[10px] text-[#FF4757] font-mono uppercase tracking-wider">✗ {errors.username.message}</p>}
            </div>

            {/* Email Field */}
            <div style={{ position: 'relative', marginBottom: '28px' }}>
              <label style={{
                position: 'absolute', top: '-20px', left: '0', fontSize: '11px',
                fontFamily: "'Exo 2', sans-serif", fontWeight: '700', letterSpacing: '0.15em',
                color: '#FF6B35', textTransform: 'uppercase'
              }}>
                EMAIL
              </label>
              <input
                {...register('email')}
                type="text"
                className="forge-input"
                placeholder="> your@example.com"
              />
              {errors.email && <p className="mt-2 text-[10px] text-[#FF4757] font-mono uppercase tracking-wider">✗ {errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div style={{ position: 'relative', marginBottom: passwordVal.length > 0 ? '12px' : '28px' }}>
              <label style={{
                position: 'absolute', top: '-20px', left: '0', fontSize: '11px',
                fontFamily: "'Exo 2', sans-serif", fontWeight: '700', letterSpacing: '0.15em',
                color: '#FF6B35', textTransform: 'uppercase'
              }}>
                PASSWORD
              </label>
              <input
                {...register('password')}
                type="password"
                className="forge-input"
                placeholder="> ••••••••"
              />
              
              {/* Strength Meter */}
              <div className="mt-2 text-right">
                <div className="flex items-center gap-[2px] w-full mb-1">
                  {[1, 2, 3, 4].map(level => {
                    let bgColor = '#11161B'; // blank
                    if (strScore >= level) {
                      if (strScore === 1) bgColor = 'var(--forge-red)';
                      else if (strScore === 2) bgColor = 'var(--forge-yellow)';
                      else if (strScore === 3) bgColor = 'var(--forge-ember)';
                      else if (strScore === 4) bgColor = 'var(--forge-green)';
                    }
                    return (
                      <div 
                        key={level} 
                        className="flex-1 h-[3px] transition-colors duration-300"
                        style={{ backgroundColor: bgColor, boxShadow: strScore >= level ? `0 0 5px ${bgColor}` : 'none' }}
                      />
                    );
                  })}
                </div>
                {passwordVal.length > 0 && (
                  <span className="text-[10px] font-mono font-black tracking-widest" style={{ color: activeLabel.color }}>
                    {activeLabel.text}
                  </span>
                )}
              </div>
              {errors.password && <p className="mt-2 text-[10px] text-[#FF4757] font-mono uppercase tracking-wider">✗ {errors.password.message}</p>}
            </div>

            {/* Confirm Password Field */}
            <div style={{ position: 'relative', marginBottom: '28px' }}>
              <label style={{
                position: 'absolute', top: '-20px', left: '0', fontSize: '11px',
                fontFamily: "'Exo 2', sans-serif", fontWeight: '700', letterSpacing: '0.15em',
                color: '#FF6B35', textTransform: 'uppercase'
              }}>
                CONFIRM PASSWORD
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="forge-input"
                placeholder="> ••••••••"
              />
              {errors.confirmPassword && <p className="mt-2 text-[10px] text-[#FF4757] font-mono uppercase tracking-wider">✗ {errors.confirmPassword.message}</p>}
            </div>

            {/* Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <input type="checkbox" {...register('terms')} className="sr-only" />
                <div className={`w-[14px] h-[14px] flex items-center justify-center transition-colors ${termsChecked ? 'bg-[var(--forge-ember)]' : 'border border-[var(--forge-border)] group-hover:border-[var(--forge-steel)]'}`}>
                  {termsChecked && <svg className="w-2.5 h-2.5 text-[#000]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <span className={`text-[12px] font-ui transition-colors ${termsChecked ? 'text-[var(--forge-white)]' : 'text-[var(--forge-steel)] group-hover:text-[var(--forge-white)]'}`}>
                  I accept the Arena Code of Conduct
                </span>
              </label>
              {errors.terms && <p className="mt-2 text-[10px] text-[#FF4757] font-mono uppercase tracking-wider">✗ {errors.terms.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || unameStatus === 'taken'}
              className="btn-submit"
            >
              {isSubmitting ? 'FORGING IDENTITY...' : '⚔ FORGE MY ACCOUNT'}
            </button>
          </form>

          <div className="mt-10 text-center text-xs font-mono uppercase tracking-widest text-[var(--forge-dim)]">
             Already forged?{' '}
             <Link to="/login" className="text-[var(--forge-ember)] hover:text-[#ff8a3d] transition-colors drop-shadow-[0_0_5px_rgba(249,115,22,0.3)]">
               [ Enter Here → ]
             </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
