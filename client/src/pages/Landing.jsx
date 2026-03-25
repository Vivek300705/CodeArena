import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero3D from '../components/Hero3D.jsx';
import CountUp from '../components/CountUp.jsx';
import ForgeCard from '../components/ForgeCard.jsx';
import ForgeButton from '../components/ForgeButton.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

// Typewriter hook
function useTypewriter(words, typeSpeed = 80, deleteSpeed = 50, delay = 2000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;
    
    if (isDeleting) {
      if (text === '') {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
        timeout = setTimeout(() => {}, 500);
      } else {
        timeout = setTimeout(() => {
          setText(text.slice(0, -1));
        }, deleteSpeed);
      }
    } else {
      if (text === currentWord) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, delay);
      } else {
        timeout = setTimeout(() => {
          setText(currentWord.slice(0, text.length + 1));
        }, typeSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typeSpeed, deleteSpeed, delay]);

  return text;
}

const leaderboard = [
  { rank: 1, name: 'tourist_X', rating: 3845, badge: '👑' },
  { rank: 2, name: 'logic_bomb', rating: 3790, badge: '🥈' },
  { rank: 3, name: 'null_ptr', rating: 3652, badge: '🥉' },
  { rank: 4, name: 'algo_rythm', rating: 3511, badge: '' },
  { rank: 5, name: 'heapq_god', rating: 3487, badge: '' },
];

export default function Landing() {
  useDocumentTitle('Home | CodeArena');
  
  const typeText = useTypewriter([
    "FORGE YOUR SKILLS.",
    "DOMINATE THE LEADERBOARD.",
    "COMPETE. CONQUER. CODE."
  ]);

  // Use GSAP for scroll animations
  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      
      // Stagger stats
      window.gsap.fromTo('.stat-item', 
        { opacity: 0, scale: 0.97 }, 
        { 
          opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.stats-strip', start: 'top 90%' }
        }
      );

      // Stagger Feature Cards
      window.gsap.fromTo('.feature-card', 
        { opacity: 0, y: 30, scale: 0.97 }, 
        { 
          opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '.features-section', start: 'top 80%' }
        }
      );

      // Leaderboard rows
      window.gsap.fromTo('.lb-row', 
        { opacity: 0, x: -30 }, 
        { 
          opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.lb-section', start: 'top 75%' }
        }
      );
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--forge-bg)] text-[var(--forge-white)] font-ui overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        <Hero3D />
        
        {/* Subtle animated grid background handled primarily in Hero3D, but adding radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--forge-bg)_80%)] z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
          {/* Glitch Animated Hero Text */}
          <h1 className="text-[12vw] md:text-[8vw] font-black font-display tracking-tight leading-none mb-6 relative">
            <span className="text-transparent" style={{ WebkitTextStroke: '2px var(--forge-white)' }}>
              CODE
            </span>
            <span className="text-[var(--forge-ember)] relative drop-shadow-[0_0_20px_var(--forge-ember)] mix-blend-screen glitched-text line-glitch">
              ARENA
            </span>
          </h1>

          {/* Typewriter */}
          <div className="h-8 mb-12">
            <p className="font-mono text-[var(--forge-steel)] text-lg md:text-2xl tracking-widest uppercase">
              {typeText}<span className="animate-pulse">_</span>
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 mt-4 items-center">
            <Link to="/register">
              <ForgeButton variant="primary" className="text-lg py-4 px-10 shadow-[0_0_20px_var(--forge-glow)] scale-100 hover:scale-[1.02] transform">
                [ ENTER THE ARENA ]
              </ForgeButton>
            </Link>
            <Link to="/problems">
              <ForgeButton variant="secondary" className="text-lg py-4 px-10">
                [ VIEW PROBLEMS ]
              </ForgeButton>
            </Link>
          </div>
        </div>

        {/* CSS for Glitch */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes line-glitch {
            0% { clip-path: inset(0 0 0 0); }
            4% { clip-path: inset(20% 0 60% 0); transform: translateX(-4px); }
            8% { clip-path: inset(80% 0 10% 0); transform: translateX(4px); }
            12% { clip-path: inset(0 0 0 0); transform: translateX(0); }
            100% { clip-path: inset(0 0 0 0); transform: translateX(0); }
          }
          .line-glitch {
            animation: line-glitch 5s infinite linear alternate-reverse;
          }
        `}} />
      </section>

      {/* 2. STATS STRIP */}
      <div className="stats-strip w-full border-y border-[var(--forge-border)] bg-[var(--forge-surface)] py-4 overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-8 text-sm md:text-base tracking-widest font-mono text-[var(--forge-steel)] uppercase">
          <div className="stat-item flex items-center gap-2">
            <span className="text-[var(--forge-steel)]">⚔</span> <CountUp end={1247} suffix=" Problems" />
          </div>
          <div className="stat-item flex items-center gap-2">
            <span className="text-[var(--forge-gold)]">🏆</span> <CountUp end={340} suffix=" Active Contests" />
          </div>
          <div className="stat-item flex items-center gap-2">
            <span className="text-[var(--forge-steel)]">👥</span> <CountUp end={8500} suffix="+ Coders" />
          </div>
          <div className="stat-item flex items-center gap-2">
            <span className="text-[var(--forge-ember)] animate-pulse">🔥</span> <CountUp end={24391} suffix=" Submissions Today" />
          </div>
        </div>
      </div>

      {/* 3. FEATURE CARDS */}
      <section className="features-section py-32 px-6 relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Card 1: Taller */}
          <ForgeCard className="feature-card lg:col-span-6 lg:row-span-2 min-h-[460px] p-10 relative overflow-hidden flex flex-col justify-end border-t-2 border-t-[var(--forge-ember)] hover:bg-[linear-gradient(to_bottom,rgba(255,107,53,0.05),transparent)]">
            <div className="absolute -top-10 -right-4 font-display text-[20vw] lg:text-[15vw] leading-none text-[var(--forge-white)] opacity-[0.03] select-none pointer-events-none">
              01
            </div>
            <div className="relative z-10">
              <h3 className="font-display font-black text-3xl mb-4 text-[var(--forge-white)] tracking-wide">PRACTICE ARENA</h3>
              <p className="text-[var(--forge-steel)] text-lg max-w-sm mb-6">
                Solve 1,000+ problems. Filter by tag, difficulty, company. Master the algorithms that forge great engineers.
              </p>
              <Link to="/problems">
                <span className="text-[var(--forge-ember)] font-mono font-bold hover:underline">ACCESS ARCHIVES →</span>
              </Link>
            </div>
          </ForgeCard>

          {/* Card 2 */}
          <ForgeCard className="feature-card lg:col-span-6 min-h-[220px] p-8 relative overflow-hidden border-t-2 border-t-[var(--forge-gold)] hover:bg-[linear-gradient(to_bottom,rgba(255,184,0,0.05),transparent)]">
            <div className="absolute -top-12 -right-4 font-display text-[15vw] lg:text-[12vw] leading-none text-[var(--forge-white)] opacity-[0.03] select-none pointer-events-none">
              02
            </div>
            <div className="relative z-10">
              <h3 className="font-display font-black text-2xl mb-2 text-[var(--forge-white)] tracking-wide">LIVE CONTESTS</h3>
              <p className="text-[var(--forge-steel)] text-base mb-4">
                Real-time ranked competitions. Timer. Leaderboard. Glory.
              </p>
              <Link to="/contests">
                <span className="text-[var(--forge-gold)] font-mono font-bold hover:underline">VIEW SCHEDULE →</span>
              </Link>
            </div>
          </ForgeCard>

          {/* Card 3 */}
          <ForgeCard className="feature-card lg:col-span-6 min-h-[220px] p-8 relative overflow-hidden border-t-2 border-t-[var(--forge-steel)] hover:bg-[linear-gradient(to_bottom,rgba(143,170,191,0.05),transparent)]">
            <div className="absolute -top-12 -right-4 font-display text-[15vw] lg:text-[12vw] leading-none text-[var(--forge-white)] opacity-[0.03] select-none pointer-events-none">
              03
            </div>
            <div className="relative z-10">
              <h3 className="font-display font-black text-2xl mb-2 text-[var(--forge-white)] tracking-wide">CODE FORGE</h3>
              <p className="text-[var(--forge-steel)] text-base mb-4">
                Multi-language editor. C++, Python, Java. Fast execution.
              </p>
              <Link to="/problems/1">
                <span className="text-[var(--forge-steel)] font-mono font-bold hover:underline">TRY EDITOR →</span>
              </Link>
            </div>
          </ForgeCard>
        </div>
      </section>

      {/* 4. LEADERBOARD PREVIEW */}
      <section className="lb-section py-24 bg-[var(--forge-surface)] relative z-10 border-y border-[var(--forge-border)]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display font-black text-3xl text-[var(--forge-white)] tracking-wide">TOP COMBATANTS</h2>
            <Link to="/leaderboard" className="text-[var(--forge-ember)] font-mono text-sm hover:underline drop-shadow-[0_0_8px_var(--forge-glow)]">
              [ SEE FULL LEADERBOARD → ]
            </Link>
          </div>
          
          <div className="flex flex-col gap-3">
            {leaderboard.map((u, i) => (
              <ForgeCard key={i} className={`lb-row flex items-center px-6 py-4 ${i === 0 ? 'border-[var(--forge-gold)] bg-[linear-gradient(90deg,rgba(255,184,0,0.05),transparent)]' : ''}`}>
                <div className="w-12 text-[var(--forge-dim)] font-mono font-bold text-lg text-center">
                  #{u.rank}
                </div>
                <div className="w-10 text-xl text-center">
                  {u.badge}
                </div>
                <div className={`flex-1 font-bold tracking-widest ${i === 0 ? 'text-[var(--forge-gold)]' : 'text-[var(--forge-white)]'}`}>
                  {u.name}
                </div>
                <div className="font-mono text-[var(--forge-steel)] font-bold">
                  {u.rating.toLocaleString()} <span className="text-[var(--forge-dim)] text-xs">RTG</span>
                </div>
              </ForgeCard>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA BANNER */}
      <section className="relative z-10 w-full bg-[#11161B] border-t border-[var(--forge-border)] py-32 overflow-hidden">
        {/* Ember gradient bleed from corner */}
        <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(ellipse_at_bottom_right,var(--forge-glow),transparent_60%)] pointer-events-none mix-blend-screen" />
        
        <div className="max-w-5xl mx-auto px-6 text-center shadow-none relative z-10">
          <h2 className="font-display font-black text-4xl md:text-6xl text-[var(--forge-white)] tracking-tight mb-12 uppercase drop-shadow-[0_0_12px_rgba(255,107,53,0.3)]">
            Your next problem is waiting.
          </h2>
          <Link to="/problems">
            <ForgeButton variant="primary" className="text-xl py-5 px-12 shadow-[0_0_30px_var(--forge-glow)]">
              [ START NOW → ]
            </ForgeButton>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--forge-border)] py-8 text-center bg-[var(--forge-bg)]">
        <div className="flex items-center justify-center gap-2 mb-2 font-display">
          <span className="font-black text-[var(--forge-white)] tracking-widest uppercase">
            <span className="text-[var(--forge-ember)]">&lt;/&gt;</span> FORGE
          </span>
        </div>
        <p className="text-[var(--forge-dim)] font-mono text-xs uppercase tracking-widest">© {new Date().getFullYear()} CODEARENA</p>
      </footer>
    </div>
  );
}
