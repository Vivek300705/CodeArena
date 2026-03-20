import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero3D from '../components/Hero3D.jsx';
import { Code2, Trophy, Cpu, Zap, Target, Layers, ArrowRight, CheckCircle, Activity, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

// Animation variants for staggered list
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

export default function Landing() {
  useDocumentTitle('Home');
  const { scrollYProgress } = useScroll();
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacityHeroText = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const features = [
    { icon: <Cpu className="w-8 h-8 text-cyan-400" />, title: "Real-time Execution", desc: "Instantly run code in sandboxed environments powered by async worker queues." },
    { icon: <Trophy className="w-8 h-8 text-yellow-500" />, title: "Global Leaderboard", desc: "Climb the ranks and definitively prove your worth against the best algorithm masters." },
    { icon: <Layers className="w-8 h-8 text-purple-400" />, title: "Multi-language Support", desc: "Compile and run Node.js, Python, C++, and more with exact fidelity and memory limits." },
    { icon: <Activity className="w-8 h-8 text-green-400" />, title: "Performance Metrics", desc: "Detailed tracking of your solution's runtime latency and exact memory consumption footprint." },
  ];

  const steps = [
    { title: "Select a Challenge", desc: "Choose from our curated grid of algorithmic battlegrounds ranging from Easy to Extreme." },
    { title: "Forge Your Logic", desc: "Write your solution in our embedded high-performance Monaco Editor." },
    { title: "Deploy Output", desc: "Send your code to our asynchronous judging queue for instant verification." },
    { title: "Claim Position", desc: "Receive immediate feedback, earn points, and watch your global rank escalate." }
  ];

  return (
    <div className="relative min-h-screen selection:bg-cyan-500/30">
      <Hero3D />
      
      {/* 1. Hero Section */}
      <section className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center pt-20 pointer-events-none">
        <motion.div
          style={{ y: yHeroText, opacity: opacityHeroText }}
          className="container mx-auto px-6 text-center max-w-5xl pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="animate-pulse w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-cyan-400 text-sm font-bold tracking-widest uppercase">System Online</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl md:text-[6rem] font-black mb-8 tracking-tighter leading-[1.1]">
              Enter the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 filter drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                Code Arena
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              A digital battlefield for programmers. Solve competitive algorithms, test your limits in sandbox environments, and dominate the cyber leaderboard.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-lg transition-all flex items-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                  <Code2 className="w-5 h-5 relative z-10" /> 
                  <span className="relative z-10">Start Solving</span>
                </motion.button>
              </Link>
              <Link to="/problems">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-surface/30 backdrop-blur-lg border border-white/10 text-white rounded-xl font-bold text-lg hover:border-white/30 transition-all flex items-center gap-3"
                >
                   Explore Problems
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60"
        >
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">Initialize</span>
          <div className="w-0.5 h-12 bg-gradient-to-b from-cyan-400 to-transparent rounded-full" />
        </motion.div>
      </section>

      {/* 2. Features Section */}
      <section className="relative z-10 py-32 bg-background/60 backdrop-blur-xl border-t border-white/5">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">System Architecture</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full mb-6" />
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Engineered to handle high-concurrency code evaluation natively in a secure cloud sanctuary.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={itemVariants} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full bg-[#111116]/80 backdrop-blur-md p-8 rounded-2xl border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                  <div className="mb-6 p-4 rounded-xl bg-background shadow-inner inline-flex">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed disabled">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="relative z-10 py-32 bg-[#09090b]/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
               <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">Execution Protocol</h2>
               <p className="text-zinc-400 text-lg mb-10">Follow the standard sequence. Defeat algorithms. Claim your victory on the global rank list.</p>
               
               <div className="space-y-8">
                 {steps.map((step, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: -30 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.2 }}
                     className="flex gap-6 items-start"
                   >
                     <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                       {i + 1}
                     </div>
                     <div>
                       <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                       <p className="text-zinc-400">{step.desc}</p>
                     </div>
                   </motion.div>
                 ))}
               </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2 w-full relative"
            >
               {/* Decorative digital display representation */}
               <div className="aspect-square w-full max-w-md mx-auto relative rounded-3xl border border-white/10 bg-[#050508]/80 p-8 shadow-2xl overflow-hidden shadow-cyan-900/20 backdrop-blur-xl">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                 
                 {/* Mock UI window */}
                 <div className="w-full h-full border border-white/5 rounded-xl bg-background/50 flex flex-col overflow-hidden">
                    <div className="h-8 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
                       <span className="w-3 h-3 rounded-full bg-red-500/50" />
                       <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
                       <span className="w-3 h-3 rounded-full bg-green-500/50" />
                       <span className="ml-4 text-xs font-mono text-zinc-500">terminal@codearena:~</span>
                    </div>
                    <div className="p-4 font-mono text-sm space-y-3 relative">
                       <p className="text-zinc-400">$ node execute.js --target=solution</p>
                       <motion.p 
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         transition={{ delay: 0.5 }}
                         className="text-cyan-400"
                       >
                         &gt; Compiling routine...
                       </motion.p>
                       <motion.p 
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         transition={{ delay: 1 }}
                         className="text-cyan-400"
                       >
                         &gt; Running test cases [3/3]...
                       </motion.p>
                       <motion.div 
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         transition={{ delay: 1.5 }}
                         className="mt-4 p-3 border border-green-500/30 bg-green-500/10 rounded text-green-400 flex items-center gap-2"
                       >
                         <CheckCircle className="w-4 h-4" /> STATUS: ACCEPTED [43ms]
                       </motion.div>
                    </div>
                 </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Platform Stats & 5. Leaderboard Preview */}
      <section className="relative z-10 py-32 border-t border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 max-w-7xl">
           
           {/* Stats */}
           <div className="grid md:grid-cols-3 gap-8 mb-32">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="text-center p-8 rounded-2xl bg-surface/50 border border-white/5 shadow-[rgba(6,182,212,0.05)_0px_0px_30px_0px]">
                 <Activity className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                 <h4 className="text-5xl font-black text-white tracking-tighter mb-2">2.4M+</h4>
                 <p className="text-zinc-400 font-medium tracking-wide uppercase text-sm">Submissions Processed</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-center p-8 rounded-2xl bg-surface/50 border border-white/5 shadow-[rgba(139,92,246,0.05)_0px_0px_30px_0px]">
                 <Code2 className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                 <h4 className="text-5xl font-black text-white tracking-tighter mb-2">1,500+</h4>
                 <p className="text-zinc-400 font-medium tracking-wide uppercase text-sm">Algorithms Deployed</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-center p-8 rounded-2xl bg-surface/50 border border-white/5 shadow-[rgba(59,130,246,0.05)_0px_0px_30px_0px]">
                 <Users className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                 <h4 className="text-5xl font-black text-white tracking-tighter mb-2">120K</h4>
                 <p className="text-zinc-400 font-medium tracking-wide uppercase text-sm">Active Combatants</p>
              </motion.div>
           </div>

           {/* Leaderboard Preview */}
           <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">Global Ranking</h2>
              <p className="text-zinc-400 text-lg">Who currently rules the arena.</p>
           </div>
           
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="max-w-4xl mx-auto bg-[#0a0a0f]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/10"
           >
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-sm font-bold text-zinc-500 uppercase tracking-widest bg-white/5">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-6">Developer</div>
                <div className="col-span-4 text-right">Rating</div>
              </div>
              <div className="divide-y divide-white/5">
                 {[
                   { rank: 1, name: "tourist_X", rating: 3845, trend: "up" },
                   { rank: 2, name: "logic_bomb", rating: 3790, trend: "up" },
                   { rank: 3, name: "null_pointer", rating: 3652, trend: "down" },
                   { rank: 4, name: "algo_rythm", rating: 3511, trend: "up" },
                 ].map((user, i) => (
                   <div key={i} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="col-span-2 flex justify-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-500/20 text-yellow-500 ring-1 ring-yellow-500/50' : i === 1 ? 'bg-zinc-300/20 text-zinc-300 ring-1 ring-zinc-300/50' : i === 2 ? 'bg-orange-800/30 text-orange-400 ring-1 ring-orange-800/50' : 'text-zinc-500'}`}>
                           {user.rank}
                        </span>
                      </div>
                      <div className="col-span-6 font-mono font-medium text-white group-hover:text-cyan-400 transition-colors">
                        {user.name}
                      </div>
                      <div className="col-span-4 text-right font-bold text-cyan-400 font-mono">
                        {user.rating}
                      </div>
                   </div>
                 ))}
              </div>
              <div className="p-4 bg-white/5 text-center">
                 <Link to="/register" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Sign up to view full leaderboard &rarr;</Link>
              </div>
           </motion.div>
        </div>
      </section>

      {/* 6. Call To Action Array */}
      <section className="relative z-10 py-40 overflow-hidden bg-background">
         <div className="absolute inset-0">
           {/* Abstract glowing shapes behind CTA */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/20 rounded-[100%] blur-[120px] pointer-events-none" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-purple-500/20 rounded-[100%] blur-[80px] pointer-events-none" />
         </div>
         
         <div className="container mx-auto px-6 relative text-center">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-white">
              Ready to compile <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">your legacy?</span>
            </h2>
            <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
              Join thousands of developers worldwide battling in the most advanced coding arena ever built.
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-white text-black rounded-xl font-bold text-xl shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all flex items-center gap-3 mx-auto"
              >
                Enter CodeArena <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
         </div>
      </section>
      
      {/* Footer minimal */}
      <footer className="relative z-10 border-t border-white/10 bg-background/90 backdrop-blur-md py-12 text-center text-zinc-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Target className="w-5 h-5 text-zinc-400" />
          <span className="font-black text-white tracking-widest uppercase">CodeArena</span>
        </div>
        <p>&copy; {new Date().getFullYear()} CodeArena Protocol. All systems nominal.</p>
      </footer>
    </div>
  );
}
