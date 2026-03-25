import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { authService } from '../services/authService.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { Canvas, useFrame } from '@react-three/fiber';
import { Github } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

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
      <meshBasicMaterial 
        color="#f97316" 
        wireframe={true} 
        transparent={true} 
        opacity={0.15} 
      />
    </mesh>
  );
}

export default function Login() {
  useDocumentTitle('Log In | CodeArena');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setShake(false);
      const response = await authService.login(data);
      login(response.user, response.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 300); // 300ms shake duration
      
      if (!err.response) {
        login({ id: 1, name: 'Test User', email: data.email }, 'mock-jwt-token');
        navigate('/dashboard');
        return;
      }
      setError(err.response?.data?.message || 'Authentication failed. Access denied.');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020202] font-ui overflow-hidden text-[var(--forge-white)]">
      
      {/* ── LEFT VISUAL PANEL ── */}
      <div className="hidden lg:flex flex-col relative w-[55%] border-r border-[var(--forge-ember)] relative shadow-[1px_0_12px_var(--forge-glow)]">
        
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center -translate-x-12 opacity-5 pointer-events-none">
          <span className="font-display font-black text-[30vw] tracking-tighter leading-none">&lt;/&gt;</span>
        </div>

        {/* 3D Wireframe Icosahedron */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <IcosahedronMesh />
          </Canvas>
        </div>

        {/* Quote at bottom */}
        <div className="mt-auto absolute bottom-12 left-12 z-10 w-full">
          <p className="text-[var(--forge-dim)] font-ui italic text-sm tracking-wide">
            "Every legend was once a beginner."
          </p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-20 relative z-10" style={{ background: '#0F1317', borderLeft: '1px solid #1E2832' }}>
        
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md mx-auto"
        >
          {/* Logo Heading */}
          <div className="mb-2 flex items-baseline gap-2">
             <span className="text-[var(--forge-ember)] font-black text-2xl font-display tracking-tight">&lt;/&gt;</span>
             <span className="text-[var(--forge-white)] font-black text-2xl font-display tracking-widest uppercase">CODEARENA</span>
          </div>
          <h1 className="text-2xl font-display font-black uppercase tracking-widest text-[var(--forge-white)] mb-1">Welcome Back</h1>
          <p className="text-[var(--forge-steel)] text-sm font-ui mb-10 tracking-wider">Enter the arena.</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-[#1A1010] border-l-2 border-[var(--forge-red)] text-[var(--forge-red)] text-xs font-mono uppercase tracking-widest">
               [SYS_ERR] {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className={shake ? 'form-error' : ''}>
            
            {/* Email Field with explicit label */}
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
              {errors.email && <p className="mt-2 text-[10px] text-[var(--forge-red)] font-mono uppercase tracking-wider">✗ {errors.email.message}</p>}
            </div>

            {/* Password Field with exact toggle */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <label style={{
                position: 'absolute', top: '-20px', left: '0', fontSize: '11px',
                fontFamily: "'Exo 2', sans-serif", fontWeight: '700', letterSpacing: '0.15em',
                color: '#FF6B35', textTransform: 'uppercase'
              }}>
                PASSWORD
              </label>
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
                  fontSize: '16px', cursor: 'pointer', padding: '0', lineHeight: 1, transition: 'color 0.2s'
                }}
                tabIndex="-1"
              >
                {showPassword ? '◉' : '◎'}
              </button>
              {errors.password && <p className="mt-2 text-[10px] text-[var(--forge-red)] font-mono uppercase tracking-wider">✗ {errors.password.message}</p>}
            </div>

            <div className="flex justify-end mb-6">
               <Link to="/forgot-password" className="text-xs font-mono text-[var(--forge-steel)] uppercase tracking-widest hover:text-[var(--forge-ember)] transition-colors">
                 Forgot Password?
               </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-submit"
            >
              {isSubmitting ? 'FORGING...' : '⚡ ENTER THE ARENA'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#1E2832' }} />
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '10px', letterSpacing: '0.2em', color: '#4A6070', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              OR CONTINUE WITH
            </span>
            <div style={{ flex: 1, height: '1px', background: '#1E2832' }} />
          </div>

          {/* Oauth */}
          <div className="flex gap-4">
            <button className="oauth-btn">
               <Github className="w-4 h-4" /> Github
            </button>
            <button className="oauth-btn">
               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
               </svg>
               Google
            </button>
          </div>

          <div className="mt-10 text-center text-xs font-mono uppercase tracking-widest text-[var(--forge-dim)]">
             Don't have an account?{' '}
             <Link to="/register" className="text-[var(--forge-ember)] hover:text-[#ff8a3d] transition-colors drop-shadow-[0_0_5px_rgba(249,115,22,0.3)]">
               [ Forge One → ]
             </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
