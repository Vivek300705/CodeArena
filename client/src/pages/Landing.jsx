import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero3D from '../components/Hero3D.jsx';
import CountUp from '../components/ui/CountUp.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import {
  Code2, Trophy, Cpu, Target, Activity, Users, Swords, Zap,
  ArrowRight, CheckCircle, Terminal, GitBranch, Braces, Star,
  ChevronRight, Lock, Globe, Clock
} from 'lucide-react';

/* ── Animated word reveal ── */
function RevealText({ words, className }) {
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ── Live Terminal Ticker ── */
const termLines = [
  { text: '$ judge two-sum --lang=python', color: '#52525b' },
  { text: '✓ compiled in 42ms', color: '#00e5f7' },
  { text: '✓ all 8 tests passed', color: '#22c55e' },
  { text: '⬆ +18 rating · rank #3,041 → #3,029', color: '#a78bfa' },
];

function MiniTerminal() {
  return (
    <div className="rounded-xl overflow-hidden text-xs font-mono"
      style={{ background: 'rgba(2,3,12,0.92)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
      <div className="flex items-center gap-1.5 px-4 h-8 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        <span className="ml-3 text-zinc-600">judge@arena</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-zinc-700 text-[10px]">live</span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {termLines.map((l, i) => (
          <motion.p key={i}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.5, duration: 0.4 }}
            style={{ color: l.color }}
          >
            {l.text}
          </motion.p>
        ))}
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 3.2, repeat: Infinity, duration: 1 }}
          className="inline-block w-2 h-3.5 rounded-sm align-middle"
          style={{ background: '#00e5f7' }}
        />
      </div>
    </div>
  );
}

/* ── Bento feature cards ── */
const bentoItems = [
  {
    icon: <Cpu className="w-6 h-6" />,
    title: 'Sandboxed Execution',
    desc: 'Your code runs in isolated worker queues. Results in under 300ms.',
    col: 'md:col-span-2', row: '',
    accent: '#00e5f7',
    bg: 'radial-gradient(ellipse at 0% 0%, rgba(0,229,247,0.08), transparent 60%)',
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: 'Global Leaderboard',
    desc: 'Compete against 120K+ developers worldwide.',
    col: 'md:col-span-1', row: '',
    accent: '#eab308',
    bg: 'radial-gradient(ellipse at 100% 0%, rgba(234,179,8,0.08), transparent 60%)',
  },
  {
    icon: <Swords className="w-6 h-6" />,
    title: '1v1 Duel Mode',
    desc: 'Real-time head-to-head live coding battles. May the best algorithm win.',
    col: 'md:col-span-1', row: '',
    accent: '#f97316',
    bg: 'radial-gradient(ellipse at 0% 100%, rgba(249,115,22,0.09), transparent 60%)',
    badge: 'LIVE',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Multi-language',
    desc: 'Python · C++ · Java · Go · Rust · JavaScript — with strict memory limits.',
    col: 'md:col-span-2', row: '',
    accent: '#8b5cf6',
    bg: 'radial-gradient(ellipse at 100% 100%, rgba(139,92,246,0.08), transparent 60%)',
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: 'Deep Analytics',
    desc: 'Exact runtime latency, memory delta, and submission history.',
    col: 'md:col-span-1', row: '',
    accent: '#22c55e',
    bg: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.07), transparent 60%)',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Anti-cheat Engine',
    desc: 'Signature detection keeps rankings fair for every contestant.',
    col: 'md:col-span-1', row: '',
    accent: '#ec4899',
    bg: 'radial-gradient(ellipse at 50% 100%, rgba(236,72,153,0.07), transparent 60%)',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Contest Events',
    desc: 'Weekly timed contests with prize pools and achievement badges.',
    col: 'md:col-span-1', row: '',
    accent: '#38bdf8',
    bg: 'radial-gradient(ellipse at 0% 50%, rgba(56,189,248,0.07), transparent 60%)',
  },
];

const leaderboard = [
  { rank: 1, name: 'tourist_X', rating: 3845, delta: '+12', country: '🇷🇺' },
  { rank: 2, name: 'logic_bomb', rating: 3790, delta: '+8', country: '🇺🇸' },
  { rank: 3, name: 'null_ptr', rating: 3652, delta: '-2', country: '🇨🇳' },
  { rank: 4, name: 'algo_rythm', rating: 3511, delta: '+21', country: '🇮🇳' },
  { rank: 5, name: 'heapq_god', rating: 3487, delta: '+5', country: '🇰🇷' },
];

const rankStyle = ['text-yellow-400', 'text-zinc-300', 'text-orange-400', 'text-zinc-500', 'text-zinc-600'];

export default function Landing() {
  useDocumentTitle('Home');
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <div className="relative min-h-screen">
      <Hero3D />

      {/* ══════════════════════════════════════════
          1. HERO — asymmetric split
      ══════════════════════════════════════════ */}
      <section className="relative z-10 min-h-[100svh] flex items-center overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 text-xs font-bold tracking-widest uppercase"
                style={{ background: 'rgba(0,229,247,0.07)', border: '1px solid rgba(0,229,247,0.18)', color: '#00e5f7' }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inset-0 rounded-full bg-neon-cyan opacity-75" />
                  <span className="relative rounded-full h-1.5 w-1.5 bg-neon-cyan" />
                </span>
                120K active · System Online
              </motion.div>

              {/* Headline */}
              <h1 className="font-black font-display tracking-tighter leading-[1.0] mb-6"
                style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}>
                <RevealText
                  words={['Compete.', 'Code.', 'Conquer.']}
                  className="block text-white"
                />
                <motion.span
                  initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  className="block text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(100deg, #00f5ff 0%, #60a5fa 45%, #c084fc 80%)' }}
                >
                  Code Arena.
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.72, duration: 0.8 }}
                className="text-zinc-400 text-base md:text-lg leading-relaxed mb-8 max-w-lg"
              >
                A digital battlefield for algorithm masters. Solve 1,500+ challenges, battle rivals in live duels, and climb the global leaderboard.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.6 }}
                className="flex flex-wrap gap-3 mb-10"
              >
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(0,229,247,0.45)' }}
                    whileTap={{ scale: 0.96 }}
                    className="px-8 py-3.5 rounded-xl font-bold text-[#03030a] text-sm flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #00eeff, #60a5fa)', boxShadow: '0 0 25px rgba(0,229,247,0.25)' }}
                  >
                    <Code2 className="w-4 h-4" /> Start for Free
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link to="/problems">
                  <motion.button
                    whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3.5 rounded-xl font-bold text-zinc-400 text-sm border border-white/8 transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
                  >
                    Browse Problems
                  </motion.button>
                </Link>
              </motion.div>

              {/* Proof tags */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-wrap gap-5 text-xs text-zinc-600 font-medium"
              >
                {[
                  [<CheckCircle className="w-3.5 h-3.5 text-green-500" />, 'No credit card'],
                  [<GitBranch className="w-3.5 h-3.5 text-neon-cyan" />, '6 languages'],
                  [<Braces className="w-3.5 h-3.5 text-purple-400" />, '1,500+ problems'],
                ].map(([icon, label], i) => (
                  <div key={i} className="flex items-center gap-1.5">{icon}{label}</div>
                ))}
              </motion.div>
            </div>

            {/* Right: terminal + stats stack */}
            <div className="hidden lg:flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, x: 50, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <MiniTerminal />
              </motion.div>

              {/* 3-stat row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="grid grid-cols-3 gap-3"
              >
                {[
                  { v: 2400000, s: '+', l: 'Submissions', c: '#00e5f7' },
                  { v: 120000, s: '', l: 'Coders', c: '#a78bfa' },
                  { v: 1500, s: '+', l: 'Problems', c: '#60a5fa' },
                ].map(({ v, s, l, c }, i) => (
                  <div key={i} className="rounded-xl p-4 text-center border border-white/5"
                    style={{ background: 'rgba(5,5,20,0.85)', backdropFilter: 'blur(20px)' }}>
                    <div className="text-2xl font-black font-display" style={{ color: c }}>
                      <CountUp end={v} suffix={s} duration={1600} />
                    </div>
                    <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{l}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll nudge */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-700 flex flex-col items-center gap-2"
        >
          <div className="w-[1px] h-10 bg-gradient-to-b from-transparent to-neon-cyan/40 rounded-full" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          2. FEATURE BENTO GRID
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-28"
        style={{ background: 'linear-gradient(to bottom, rgba(2,3,12,0.97) 0%, rgba(4,4,18,0.99) 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-25"
          style={{ backgroundImage: 'radial-gradient(rgba(0,200,240,0.07) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="mb-16"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #00f5ff, #a78bfa)' }} />
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Platform</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white font-display tracking-tight">
              Everything you need
              <br />
              <span className="text-zinc-600">to level up.</span>
            </h2>
          </motion.div>

          {/* Bento grid */}
          <div className="grid md:grid-cols-3 gap-4 auto-rows-fr">
            {bentoItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`relative rounded-2xl p-6 border border-white/5 overflow-hidden cursor-default ${item.col}`}
                style={{ background: `rgba(5,5,18,0.88)`, backdropFilter: 'blur(16px)', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 40px ${item.accent}18, 0 20px 40px rgba(0,0,0,0.5)`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: item.bg }} />
                {/* Top accent line */}
                <div className="absolute top-0 left-6 right-6 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${item.accent}55, transparent)` }} />

                {item.badge && (
                  <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                    style={{ background: `${item.accent}18`, color: item.accent, border: `1px solid ${item.accent}30` }}>
                    {item.badge}
                  </div>
                )}

                <div className="relative z-10">
                  <div className="mb-4 p-3 rounded-xl inline-flex" style={{ background: `${item.accent}12`, color: item.accent }}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. LEADERBOARD + STATS SPLIT
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-24 border-t border-white/4"
        style={{ background: 'rgba(3,3,14,0.99)' }}>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">

          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #eab308, #f97316)' }} />
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Rankings</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white font-display mb-8">Top Challengers</h2>

            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(5,5,18,0.9)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
              <div className="h-[2px] bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
              {leaderboard.map((u, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 px-5 py-4 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors group"
                >
                  <span className={`w-7 font-black text-sm text-right ${rankStyle[i]}`}>{u.rank}</span>
                  <span className="text-base mr-1">{u.country}</span>
                  <span className="flex-1 font-mono font-semibold text-zinc-300 text-sm group-hover:text-white transition-colors">{u.name}</span>
                  <span className={`text-xs font-bold font-mono w-10 text-right ${u.delta.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{u.delta}</span>
                  <span className="text-neon-cyan font-bold font-mono text-sm w-14 text-right">{u.rating.toLocaleString()}</span>
                </motion.div>
              ))}
              <div className="px-5 py-3 border-t border-white/5 bg-white/2">
                <Link to="/register" className="text-xs text-zinc-600 hover:text-neon-cyan transition-colors font-semibold">
                  See full leaderboard →
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats + Duel CTA */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }} />
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">By the Numbers</span>
            </div>

            {[
              { v: 2400000, s: '+', l: 'Submissions processed', c: '#00e5f7', icon: <Activity className="w-5 h-5" /> },
              { v: 1500, s: '+', l: 'Algorithm challenges', c: '#a78bfa', icon: <Code2 className="w-5 h-5" /> },
              { v: 120000, s: '', l: 'Active developers', c: '#60a5fa', icon: <Users className="w-5 h-5" /> },
            ].map(({ v, s, l, c, icon }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-5 p-5 rounded-xl border border-white/5"
                style={{ background: 'rgba(5,5,18,0.85)', backdropFilter: 'blur(16px)' }}
              >
                <div className="p-3 rounded-xl flex-shrink-0" style={{ background: `${c}12`, color: c }}>{icon}</div>
                <div>
                  <div className="text-2xl font-black text-white font-display" style={{ color: c }}>
                    <CountUp end={v} suffix={s} duration={1800} />
                  </div>
                  <div className="text-xs text-zinc-600 font-bold uppercase tracking-widest">{l}</div>
                </div>
              </motion.div>
            ))}

            {/* Duel CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="relative mt-2 rounded-xl p-6 border border-ember/15 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.07), rgba(239,68,68,0.04), rgba(5,5,18,0.9))' }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-ember/50 to-transparent" />
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl flex-shrink-0 bg-ember/10 border border-ember/20">
                  <Swords className="w-5 h-5 text-ember" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white">1v1 Duel Mode</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-bold uppercase tracking-wider">Live</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4">Head-to-head competitive coding. Real-time result tracking.</p>
                  <Link to="/register">
                    <button className="text-xs font-bold text-ember hover:text-white transition-colors flex items-center gap-1">
                      Enter Duel Arena <ChevronRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-36 overflow-hidden border-t border-white/4"
        style={{ background: 'rgba(2,3,12,0.99)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 cyber-grid opacity-35" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] blur-[100px]"
            style={{ background: 'radial-gradient(ellipse, rgba(0,229,247,0.1) 0%, rgba(96,165,250,0.06) 50%, transparent)' }} />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-[0.3em] mb-6">Ready to battle?</p>
            <h2 className="font-black font-display tracking-tighter text-white mb-8"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 1.05 }}>
              Start writing code
              <br/>
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(100deg, #00f5ff, #60a5fa, #c084fc)' }}>
                that matters.
              </span>
            </h2>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.97 }}
                className="px-14 py-5 rounded-2xl font-black text-xl text-[#03030a] flex items-center gap-3 mx-auto"
                style={{ background: 'linear-gradient(135deg, #ffffff, #e0e7ff)', boxShadow: '0 0 30px rgba(255,255,255,0.1)' }}
              >
                Enter CodeArena <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
            <p className="text-zinc-700 text-xs mt-6">Free forever · No credit card · Join 120K+ devs</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center"
        style={{ background: 'rgba(2,3,12,0.99)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Target className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="font-black text-white text-xs font-display tracking-widest uppercase">CodeArena</span>
        </div>
        <p className="text-zinc-700 text-xs">© {new Date().getFullYear()} · All systems nominal.</p>
      </footer>
    </div>
  );
}
