import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Trophy, ExternalLink, Globe } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useSEO } from '../hooks/useSEO.js';
import ForgeCard from '../components/ForgeCard.jsx';
import ForgeButton from '../components/ForgeButton.jsx';
import TiltCard from '../components/ui/TiltCard.jsx';

function WireframeShape({ type }) {
  const meshRef = useRef(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      {type === 'cube' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
      {type === 'octahedron' && <octahedronGeometry args={[1.2]} />}
      {type === 'cone' && <coneGeometry args={[1, 1.5, 8]} />}
      {type === 'icosahedron' && <icosahedronGeometry args={[1.2]} />}
      {type === 'cylinder' && <cylinderGeometry args={[0.8, 0.8, 1.5, 12]} />}
      {type === 'torus' && <torusGeometry args={[0.8, 0.3, 16, 32]} />}
      <meshBasicMaterial color="#0ea5e9" wireframe={true} transparent opacity={0.8} />
    </mesh>
  );
}

export default function Creator() {
  useSEO({
    title: 'Vivek Kumar Sulaniya | Creator of CodeArena',
    description: 'Meet Vivek Kumar Sulaniya — the Full Stack Developer and competitive programmer who built CodeArena, the real-time 1v1 coding battles platform.',
    exact: true
  });

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[var(--forge-bg)] text-[var(--forge-white)] font-ui pt-24 pb-20 overflow-hidden">
      
      {/* SECTION 1 - Hero */}
      <motion.section 
        className="text-center px-6 mb-32 max-w-5xl mx-auto mt-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="flex justify-center mb-10">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border border-[var(--forge-border)] flex items-center justify-center bg-[var(--forge-surface)] shadow-[0_0_40px_var(--forge-glow)] group">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--forge-ember)] opacity-50 shadow-[0_0_20px_var(--forge-ember)] animate-[spin_10s_linear_infinite]" />
            <span className="text-4xl md:text-5xl font-black font-display text-[var(--forge-ember)] group-hover:scale-110 transition-transform duration-500">VK</span>
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-black font-display mb-6 tracking-tight drop-shadow-[0_0_15px_var(--forge-glow)]">
          Built by a Developer, <br />
          <span className="text-[var(--forge-ember)]">For Developers.</span>
        </h1>
        <p className="text-xl md:text-2xl text-[var(--forge-steel)] max-w-3xl mx-auto mb-8">
          CodeArena was designed, engineered, and shipped by one developer with a passion for competitive programming and real-time systems.
        </p>

        <div className="flex flex-col items-center gap-2 mb-10">
          <h2 className="text-2xl font-bold font-display text-[var(--forge-white)]">Vivek Kumar Sulaniya</h2>
          <p className="text-[var(--forge-steel)] font-mono text-sm uppercase tracking-widest">
            Full Stack Developer | Competitive Programmer | NIT Allahabad
          </p>
          <div className="h-[1px] w-24 bg-[var(--forge-border)] my-2"></div>
          <p className="text-[var(--forge-dim)] flex items-center gap-2">
            Kanpur, India | B.Tech in Chemical Engineering (2023–2027)
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          <a href="https://github.com/Vivek300705" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[var(--forge-steel)] hover:text-[var(--forge-white)] transition-colors group">
            <div className="p-3 border border-[var(--forge-border)] rounded-full group-hover:border-[var(--forge-white)] transition-colors"><Github size={20} /></div>
            <span className="font-mono text-sm uppercase">GitHub</span>
          </a>
          <a href="https://linkedin.com/in/vivek-kumar-sulaniya" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[var(--forge-steel)] hover:text-[#0a66c2] transition-colors group">
            <div className="p-3 border border-[var(--forge-border)] rounded-full group-hover:border-[#0a66c2] group-hover:shadow-[0_0_15px_rgba(10,102,194,0.5)] transition-all"><Linkedin size={20} /></div>
            <span className="font-mono text-sm uppercase">LinkedIn</span>
          </a>
          <a href="mailto:vivekkumarsulaniya@gmail.com" className="flex items-center gap-2 text-[var(--forge-steel)] hover:text-[var(--forge-ember)] transition-colors group">
            <div className="p-3 border border-[var(--forge-border)] rounded-full group-hover:border-[var(--forge-ember)] group-hover:shadow-[0_0_15px_var(--forge-glow)] transition-all"><Mail size={20} /></div>
            <span className="font-mono text-sm uppercase">Email</span>
          </a>
        </div>
      </motion.section>

      {/* SECTION 2 - The Story Behind CodeArena */}
      <motion.section 
        className="bg-[var(--forge-surface)] py-20 border-y border-[var(--forge-border)] mb-24 drop-shadow-xl relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-10 w-[1px] h-full bg-[var(--forge-border)] opacity-30"></div>
        <div className="absolute top-0 right-10 w-[1px] h-full bg-[var(--forge-border)] opacity-30"></div>
        
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-[var(--forge-white)] mb-8 text-center flex items-center justify-center gap-4">
            <span className="w-12 h-[2px] bg-[var(--forge-steel)]"></span>
            Why I Built CodeArena
            <span className="w-12 h-[2px] bg-[var(--forge-steel)]"></span>
          </h2>
          <p className="text-lg text-[var(--forge-steel)] leading-loose text-justify font-mono">
           "I was tired of practicing coding alone. LeetCode felt isolating — there was no thrill, no competition, no real pressure. I wanted to build something that made coding feel like a sport. So I did. CodeArena started as a personal project in February 2025 and grew into a production-grade platform serving real users, with 1,000+ problems, real-time 1v1 battles, ELO ranking, AI-generated problems, and a 3D interactive UI."
          </p>
        </div>
      </motion.section>

      {/* SECTION 3 - Engineered for Competition */}
      <motion.section 
        className="max-w-6xl mx-auto px-6 mb-24 relative z-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-2 tracking-tight" style={{ fontFamily: '"Space Grotesk", "Inter", sans-serif' }}>
          Engineered for Competition
        </h2>
        <p className="text-[#0ea5e9] text-center mb-16 text-xl tracking-widest font-mono uppercase">
          eSport Coding Arena Architecture
        </p>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {[
            { shape: 'cube', title: 'The Arena', desc: '1,000+ algorithm problems integrated directly into a real-time 1v1 duel system for head-to-head competition.' },
            { shape: 'octahedron', title: 'ELO System', desc: 'Competitive matchmaking with ELO rating, powerups, and a dynamic global leaderboard.' },
            { shape: 'cone', title: 'Isolated Judge', desc: 'Multi-language code judge for C++, Python, Java, Go, and Rust — executing securely inside isolated Docker sandboxes.' },
            { shape: 'icosahedron', title: 'Real-time Engine', desc: 'Battle event synchronization using Socket.io and high-throughput async submission handling via BullMQ.' },
            { shape: 'torus', title: 'Cinematic UI', desc: '3D interactive frontend crafted with Three.js particle fields, Framer Motion animations, and custom cursor elements.' },
            { shape: 'cylinder', title: 'DevOps & Scale', desc: 'Nginx reverse proxy with WebSocket support, scaled via PM2/Docker Compose. p95 latency under 500ms validated by k6.' }
          ].map((feature, i) => (
            <motion.div variants={itemVariants} key={i}>
              <TiltCard className="h-full" intensity={15} glare={true}>
                <div className="relative h-full p-8 rounded-2xl bg-[#080d1a]/80 backdrop-blur-xl border border-white/5 hover:border-[#0ea5e9]/50 transition-colors duration-300 overflow-hidden group shadow-lg hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] flex flex-col cursor-pointer">
                  {/* Faint radial cyan glow from top right */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0ea5e9] opacity-[0.15] group-hover:opacity-[0.3] transition-opacity duration-500 rounded-full blur-[40px] pointer-events-none"></div>
                  
                  {/* Wireframe display */}
                  <div className="w-[100px] h-[100px] mb-6 relative z-10 pointer-events-none">
                    <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
                      <ambientLight intensity={0.5} />
                      <WireframeShape type={feature.shape} />
                    </Canvas>
                  </div>

                  {/* Text Content */}
                  <div className="relative z-10 flex-grow pt-2 pointer-events-none">
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* SECTION 4 - Tech Stack */}
      <motion.section 
        className="max-w-4xl mx-auto px-6 mb-24 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-8 uppercase tracking-widest border-b border-[var(--forge-border)] pb-4 inline-block">Architecture & Stack</h2>
        
        <div className="flex flex-col gap-6 font-mono text-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 border border-[var(--forge-border)] rounded-lg bg-[var(--forge-surface)]">
            <span className="text-[var(--forge-ember)] font-bold min-w-[120px] text-right">FRONTEND</span>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">React.js</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">Tailwind CSS</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">Three.js</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">Framer Motion</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 border border-[var(--forge-border)] rounded-lg bg-[var(--forge-surface)]">
            <span className="text-[var(--forge-green)] font-bold min-w-[120px] text-right">BACKEND</span>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">Node.js</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">Express.js</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">Socket.io</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">BullMQ</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 border border-[var(--forge-border)] rounded-lg bg-[var(--forge-surface)]">
            <span className="text-[#3178c6] font-bold min-w-[120px] text-right">DATA / DEVOPS</span>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">MongoDB</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">Redis</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">Docker</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">Nginx</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">PM2</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">AWS</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 border border-[var(--forge-border)] rounded-lg bg-[var(--forge-surface)]">
            <span className="text-[#9b59b6] font-bold min-w-[120px] text-right">LANGUAGES</span>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">JavaScript</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">Python</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">Java</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">C++</span>
              <span className="px-3 py-1 bg-[var(--forge-panel)] rounded-md border border-[var(--forge-border)]">C</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 5 - Achievements & Profiles */}
      <motion.section 
        className="max-w-5xl mx-auto px-6 mb-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <div className="grid md:grid-cols-2 gap-12">
          
          {/* Achievements */}
          <div>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-6 flex items-center gap-3">
              <Trophy className="text-[var(--forge-gold)]" /> Track Record
            </h2>
            <div className="space-y-4">
              <div className="bg-[var(--forge-surface)] border border-[var(--forge-border)] p-4 rounded-lg flex items-start gap-4 border-l-4 border-l-[var(--forge-gold)]">
                <span className="text-2xl">🏆</span>
                <div>
                  <h4 className="font-bold text-[var(--forge-white)]">Global Rank 664</h4>
                  <p className="text-[var(--forge-steel)] text-sm">LeetCode Weekly Contest 452</p>
                </div>
              </div>
              <div className="bg-[var(--forge-surface)] border border-[var(--forge-border)] p-4 rounded-lg flex items-start gap-4 border-l-4 border-l-[var(--forge-gold)]">
                <span className="text-2xl">🏆</span>
                <div>
                  <h4 className="font-bold text-[var(--forge-white)]">Global Rank 776</h4>
                  <p className="text-[var(--forge-steel)] text-sm">LeetCode Biweekly Contest 154</p>
                </div>
              </div>
              <div className="bg-[var(--forge-surface)] border border-[var(--forge-border)] p-4 rounded-lg flex items-start gap-4 border-l-4 border-l-[var(--forge-ember)]">
                <span className="text-2xl">💻</span>
                <div>
                  <h4 className="font-bold text-[var(--forge-white)]">300+ DSA Problems Solved</h4>
                  <p className="text-[var(--forge-steel)] text-sm">Across LeetCode, Codeforces, GeeksforGeeks</p>
                </div>
              </div>
              <div className="bg-[var(--forge-surface)] border border-[var(--forge-border)] p-4 rounded-lg flex items-start gap-4 border-l-4 border-l-[var(--forge-green)]">
                <span className="text-2xl">🚀</span>
                <div>
                  <h4 className="font-bold text-[var(--forge-white)]">CodeArena Creator</h4>
                  <p className="text-[var(--forge-steel)] text-sm">Built & Deployed serving real users in production</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profiles */}
          <div>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-6 flex items-center gap-3">
              <Globe className="text-[var(--forge-steel)]" /> Coding Profiles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="https://leetcode.com/u/vivekkumarsulaniya/" target="_blank" rel="noopener noreferrer">
                <ForgeCard className="p-4 flex items-center gap-3 hover:border-[#ffa500] hover:shadow-[0_0_15px_rgba(255,165,0,0.3)] transition-all cursor-pointer h-full">
                  <div className="text-[#ffa500]">{"{ }"}</div>
                  <div>
                    <h4 className="font-bold font-display text-sm text-[var(--forge-white)]">LeetCode</h4>
                    <p className="text-xs font-mono text-[var(--forge-dim)] truncate">vivekkumarsulaniya</p>
                  </div>
                  <ExternalLink size={14} className="ml-auto text-[var(--forge-dim)]" />
                </ForgeCard>
              </a>
              <a href="https://codeforces.com/profile/vivekkumarsulaniya" target="_blank" rel="noopener noreferrer">
                <ForgeCard className="p-4 flex items-center gap-3 hover:border-[#318ce7] hover:shadow-[0_0_15px_rgba(49,140,231,0.3)] transition-all cursor-pointer h-full">
                  <div className="text-[#318ce7]">II</div>
                  <div>
                    <h4 className="font-bold font-display text-sm text-[var(--forge-white)]">Codeforces</h4>
                    <p className="text-xs font-mono text-[var(--forge-dim)] truncate">vivekkumarsulaniya</p>
                  </div>
                  <ExternalLink size={14} className="ml-auto text-[var(--forge-dim)]" />
                </ForgeCard>
              </a>
              <a href="https://www.geeksforgeeks.org/user/vivekkumarsulaniya/" target="_blank" rel="noopener noreferrer">
                <ForgeCard className="p-4 flex items-center gap-3 hover:border-[#2f8d46] hover:shadow-[0_0_15px_rgba(47,141,70,0.3)] transition-all cursor-pointer h-full">
                  <div className="font-bold text-[#2f8d46]">G</div>
                  <div>
                    <h4 className="font-bold font-display text-sm text-[var(--forge-white)]">GeeksforGeeks</h4>
                    <p className="text-xs font-mono text-[var(--forge-dim)] truncate">Vivek Kumar Sulaniya</p>
                  </div>
                  <ExternalLink size={14} className="ml-auto text-[var(--forge-dim)]" />
                </ForgeCard>
              </a>
              <a href="https://github.com/Vivek300705" target="_blank" rel="noopener noreferrer">
                <ForgeCard className="p-4 flex items-center gap-3 hover:border-[var(--forge-white)] hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all cursor-pointer h-full">
                  <Github className="text-[var(--forge-white)]" size={16} />
                  <div>
                    <h4 className="font-bold font-display text-sm text-[var(--forge-white)]">GitHub</h4>
                    <p className="text-xs font-mono text-[var(--forge-dim)] truncate">Vivek300705</p>
                  </div>
                  <ExternalLink size={14} className="ml-auto text-[var(--forge-dim)]" />
                </ForgeCard>
              </a>
            </div>
          </div>

        </div>
      </motion.section>

      {/* SECTION 7 - CTA */}
      <motion.section 
        className="text-center px-6 max-w-3xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <div className="p-10 border border-[var(--forge-border)] rounded-2xl bg-[radial-gradient(ellipse_at_top,var(--forge-surface)_0%,var(--forge-bg)_100%)] shadow-2xl relative overflow-hidden">
          {/* Subtle glowing orb in background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--forge-ember)] blur-[100px] opacity-20 rounded-full"></div>
          
          <h2 className="text-3xl font-bold font-display text-[var(--forge-white)] mb-4 relative z-10">Want to collaborate or hire me?</h2>
          <p className="text-lg text-[var(--forge-steel)] mb-8 relative z-10">
            I'm open to internships, freelance projects, and full-time opportunities. Let's build something epic together.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <a href="https://github.com/Vivek300705" target="_blank" rel="noopener noreferrer">
              <ForgeButton variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2">
                <Github size={18} /> View My GitHub
              </ForgeButton>
            </a>
            <a href="mailto:vivekkumarsulaniya@gmail.com">
              <ForgeButton variant="primary" className="w-full sm:w-auto flex items-center justify-center gap-2">
                <Mail size={18} /> Send Me an Email
              </ForgeButton>
            </a>
          </div>
        </div>
      </motion.section>

    </div>
  );
}
