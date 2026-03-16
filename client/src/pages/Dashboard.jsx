import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore.js';
import { Code2, Target, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  const stats = [
    { label: "Problems Solved", value: "124", icon: <CheckCircle className="text-green-500 w-6 h-6" /> },
    { label: "Global Rank", value: "#4,231", icon: <Target className="text-primary w-6 h-6" /> },
    { label: "Recent Submissions", value: "12", icon: <Clock className="text-zinc-400 w-6 h-6" /> },
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold mb-2">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">{user?.name || user?.username || 'Challenger'}</span></h1>
        <p className="text-zinc-400 text-lg">Here's your progress overview.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-surface/50 border border-white/5 backdrop-blur-sm flex items-center gap-5 hover:border-white/10 transition-colors"
          >
            <div className="p-4 bg-background rounded-full shadow-inner border border-white/5">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-zinc-400 font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface/30 border border-white/5 rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Recent Submissions</h2>
            <Link to="/history" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">View all</Link>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-surfaceAlt/50 rounded-xl border border-transparent hover:border-white/5 transition-colors">
                <div>
                  <h4 className="font-semibold text-zinc-200">Two Sum</h4>
                  <p className="text-sm text-zinc-400 mt-1">Python3 • 2 hours ago</p>
                </div>
                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-semibold tracking-wide">
                  Accepted
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface/30 border border-white/5 rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-cyan-400" /> Recommended Problems</h2>
            <Link to="/problems" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">Explore</Link>
          </div>
          <div className="space-y-4">
            {['Merge Intervals', 'Word Break', 'LRU Cache'].map((title, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-surfaceAlt/50 rounded-xl hover:bg-surfaceAlt transition-colors cursor-pointer border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-lg border border-white/5">
                    <Code2 className="w-4 h-4 text-zinc-400" />
                  </div>
                  <h4 className="font-semibold text-zinc-200">{title}</h4>
                </div>
                <span className="text-xs text-yellow-500 font-bold bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full tracking-wide">Medium</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
