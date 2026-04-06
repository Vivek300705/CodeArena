import React from 'react';
import { useSEO } from '../hooks/useSEO.js';
import { Link } from 'react-router-dom';
import ForgeButton from '../components/ForgeButton.jsx';
import ForgeCard from '../components/ForgeCard.jsx';
import { BookOpen, Target, Users, Trophy } from 'lucide-react';

export default function AboutUs() {
  useSEO({
    title: 'About CodeArena | Our Mission & Story',
    description: "Learn about CodeArena — the competitive coding platform built for developers who want to battle, grow, and prove their skills in real time.",
    exact: true
  });

  return (
    <div className="min-h-screen bg-[var(--forge-bg)] text-[var(--forge-white)] font-ui pt-24 pb-20">
      
      {/* Hero Section */}
      <section className="text-center px-6 mb-24 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black font-display mb-6 tracking-tight drop-shadow-[0_0_15px_var(--forge-glow)]">
          We built the arena. <br />
          <span className="text-[var(--forge-ember)]">You prove your skills.</span>
        </h1>
        <p className="text-xl md:text-2xl text-[var(--forge-steel)] max-w-3xl mx-auto">
          CodeArena is where developers stop practicing alone and start competing for real.
        </p>
      </section>

      {/* Mission Section */}
      <section className="bg-[var(--forge-surface)] py-20 border-y border-[var(--forge-border)] mb-20 drop-shadow-xl">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-[var(--forge-white)] mb-6">Our Mission</h2>
          <p className="text-xl text-[var(--forge-steel)] leading-relaxed">
            "Our mission is to make competitive coding thrilling, fair, and accessible for every developer on the planet."
          </p>
        </div>
      </section>

      {/* What is CodeArena */}
      <section className="max-w-5xl mx-auto px-6 mb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-[var(--forge-white)] mb-6">What is CodeArena?</h2>
            <ul className="space-y-4 text-[var(--forge-steel)] text-lg">
              <li className="flex items-start gap-3">
                <span className="text-[var(--forge-ember)] mt-1">⚔️</span> 
                <span><strong>Real-time 1v1 coding battles</strong> with instant execution.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--forge-gold)] mt-1">🏆</span> 
                <span><strong>ELO-based skill matchmaking</strong> ensuring fair competition.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--forge-green)] mt-1">⚡</span> 
                <span>Support for <strong>9+ programming languages</strong> including JS, Py, Go, C++.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--forge-dim)] mt-1">🤖</span> 
                <span><strong>AI-powered coaching</strong> and rapid code feedback.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[var(--forge-red)] mt-1">🛡️</span> 
                <span>Robust <strong>anti-cheat system</strong> monitoring tab switches & pasting.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#9b59b6] mt-1">👥</span> 
                <span>Custom <strong>private rooms</strong> to battle your friends directly.</span>
              </li>
            </ul>
          </div>
          <div className="relative aspect-square md:aspect-auto h-full min-h-[300px] border border-[var(--forge-border)] rounded-xl overflow-hidden shadow-[0_0_40px_var(--forge-glow)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--forge-panel)_0%,_var(--forge-bg)_100%)] flex items-center justify-center">
              <div className="text-[var(--forge-white)] opacity-20 font-mono tracking-widest text-9xl">
                &lt;/&gt;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Cards */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-center text-[var(--forge-white)] mb-12">Who It's For</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ForgeCard className="p-6 border-t-2 border-t-[var(--forge-green)] hover:-translate-y-2 transition-transform">
            <BookOpen className="text-[var(--forge-green)] mb-4" size={32} />
            <h3 className="text-xl font-bold font-display text-[var(--forge-white)] mb-2">Students & Beginners</h3>
            <p className="text-[var(--forge-steel)] text-sm">Learn efficiently by competing. Fail fast, iterate, and grasp fundamental concepts under controlled pressure.</p>
          </ForgeCard>
          <ForgeCard className="p-6 border-t-2 border-t-[var(--forge-gold)] hover:-translate-y-2 transition-transform">
            <Target className="text-[var(--forge-gold)] mb-4" size={32} />
            <h3 className="text-xl font-bold font-display text-[var(--forge-white)] mb-2">Interview Preppers</h3>
            <p className="text-[var(--forge-steel)] text-sm">Simulate the pressure of real technical interviews. Think, type, and solve while the clock is ticking.</p>
          </ForgeCard>
          <ForgeCard className="p-6 border-t-2 border-t-[var(--forge-ember)] hover:-translate-y-2 transition-transform">
            <Trophy className="text-[var(--forge-ember)] mb-4" size={32} />
            <h3 className="text-xl font-bold font-display text-[var(--forge-white)] mb-2">Competitive Programmers</h3>
            <p className="text-[var(--forge-steel)] text-sm">Climb the global leaderboard. Assert dominance over algorithms and data structures.</p>
          </ForgeCard>
          <ForgeCard className="p-6 border-t-2 border-t-[var(--forge-steel)] hover:-translate-y-2 transition-transform">
            <Users className="text-[var(--forge-steel)] mb-4" size={32} />
            <h3 className="text-xl font-bold font-display text-[var(--forge-white)] mb-2">Dev Teams</h3>
            <p className="text-[var(--forge-steel)] text-sm">Build team coding culture. Run private custom tournaments to enhance camaraderie and skill.</p>
          </ForgeCard>
        </div>
      </section>

      {/* Vision Section */}
      <section className="text-center px-6 mb-24 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-[var(--forge-white)] mb-6">Our Vision</h2>
        <p className="text-xl text-[var(--forge-steel)] leading-relaxed italic border-l-4 border-l-[var(--forge-ember)] pl-6 py-2 text-left">
          "We believe coding is a sport. Our vision is to build the world's #1 eSport platform for developers — where skill is ranked, recognized, and rewarded."
        </p>
      </section>

      {/* CTA */}
      <section className="text-center px-6">
        <Link to="/register">
          <ForgeButton variant="primary" className="text-xl py-5 px-12 shadow-[0_0_30px_var(--forge-glow)]">
            [ ENTER THE ARENA ]
          </ForgeButton>
        </Link>
      </section>
    </div>
  );
}
