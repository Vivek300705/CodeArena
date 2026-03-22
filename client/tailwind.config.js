/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#03030a',
        foreground: '#fafafa',
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        surface: '#0d0d14',
        surfaceAlt: '#13131e',
        border: '#1e1e2e',
        // Neon palette
        neon: {
          cyan: '#00f5ff',
          blue: '#3b82f6',
          purple: '#a855f7',
          pink: '#ec4899',
          green: '#22c55e',
        },
        plasma: '#8b5cf6',
        ember: '#f97316',
        matrix: '#22c55e',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 245, 255, 0.35), 0 0 60px rgba(0, 245, 255, 0.1)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.1)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4), 0 0 60px rgba(168, 85, 247, 0.1)',
        'glow-ember': '0 0 20px rgba(249, 115, 22, 0.4), 0 0 60px rgba(249, 115, 22, 0.1)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4), 0 0 60px rgba(34, 197, 94, 0.1)',
        'glow-sm': '0 0 10px rgba(0, 245, 255, 0.2)',
        'inner-glow': 'inset 0 0 30px rgba(0, 245, 255, 0.05)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'border-spin': 'border-spin 3s linear infinite',
        'count-up': 'count-up 1s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 245, 255, 0.2), 0 0 20px rgba(0, 245, 255, 0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.6), 0 0 60px rgba(0, 245, 255, 0.2)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'border-spin': {
          '0%': { '--border-angle': '0deg' },
          '100%': { '--border-angle': '360deg' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-grid': 'linear-gradient(rgba(0,245,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.05) 1px, transparent 1px)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        'cyber-gradient': 'linear-gradient(135deg, #03030a 0%, #0d0d18 50%, #03030a 100%)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
