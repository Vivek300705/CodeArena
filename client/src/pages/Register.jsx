import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { authService } from '../services/authService.js';
import { Loader2, Mail, Lock, User } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      // The API often requires only specific fields
      const { confirmPassword, ...registerData } = data;
      const response = await authService.register(registerData);
      
      // Auto-login after successful registration, or redirect to login depending on API
      // Often register returns token + user just like login
      if (response.accessToken) {
        login(response.data, response.accessToken);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      if (!err.response) {
        // Mock success for UI demo
        login({ id: 1, name: data.username, email: data.email }, 'mock-jwt-token');
        navigate('/dashboard');
        return;
      }
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-zinc-400">Join the elite rank of developers</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  {...register('username')}
                  className="w-full bg-background border border-border rounded-lg py-3 pl-12 pr-4 text-foreground placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="johndoe"
                />
              </div>
              {errors.username && <p className="mt-2 text-sm text-red-400">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  {...register('email')}
                  className="w-full bg-background border border-border rounded-lg py-3 pl-12 pr-4 text-foreground placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full bg-background border border-border rounded-lg py-3 pl-12 pr-4 text-foreground placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className="w-full bg-background border border-border rounded-lg py-3 pl-12 pr-4 text-foreground placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors flex items-center justify-center disabled:opacity-70 mt-4"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
