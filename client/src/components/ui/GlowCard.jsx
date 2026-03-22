import { useRef, useCallback } from 'react';
import { cn } from '../../utils/cn.js';

const variantConfig = {
  cyan: {
    bg: 'from-neon-cyan/5 to-transparent',
    border: 'border-neon-cyan/10 hover:border-neon-cyan/30',
    spotlight: 'rgba(0, 245, 255, 0.08)',
    glow: '0 0 35px rgba(0,245,255,0.08)',
    hoverGlow: '0 0 60px rgba(0,245,255,0.14)',
  },
  purple: {
    bg: 'from-plasma/5 to-transparent',
    border: 'border-plasma/10 hover:border-plasma/30',
    spotlight: 'rgba(168, 85, 247, 0.08)',
    glow: '0 0 35px rgba(168,85,247,0.08)',
    hoverGlow: '0 0 60px rgba(168,85,247,0.14)',
  },
  ember: {
    bg: 'from-ember/5 to-transparent',
    border: 'border-ember/10 hover:border-ember/30',
    spotlight: 'rgba(249, 115, 22, 0.08)',
    glow: '0 0 35px rgba(249,115,22,0.08)',
    hoverGlow: '0 0 60px rgba(249,115,22,0.14)',
  },
  green: {
    bg: 'from-neon-green/5 to-transparent',
    border: 'border-neon-green/10 hover:border-neon-green/30',
    spotlight: 'rgba(34, 197, 94, 0.08)',
    glow: '0 0 35px rgba(34,197,94,0.08)',
    hoverGlow: '0 0 60px rgba(34,197,94,0.14)',
  },
};

export default function GlowCard({ children, className = '', variant = 'cyan', style = {}, onClick }) {
  const cardRef = useRef(null);
  const cfg = variantConfig[variant] || variantConfig.cyan;

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.background = `radial-gradient(300px circle at ${x}px ${y}px, ${cfg.spotlight}, transparent 70%), var(--surface-glass)`;
  }, [cfg.spotlight]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.background = 'var(--surface-glass)';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn(
        'glass-card border transition-all duration-300 cursor-default',
        cfg.border,
        className
      )}
      style={{
        background: 'var(--surface-glass)',
        boxShadow: cfg.glow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
