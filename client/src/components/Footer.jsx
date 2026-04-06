import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--forge-border)] py-12 bg-[var(--forge-bg)] text-[var(--forge-white)] w-full">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="md:col-span-1 flex flex-col gap-4 text-center md:text-left">
          <div className="flex justify-center md:justify-start items-center gap-2 font-display">
            <span className="font-black tracking-widest uppercase text-xl text-[var(--forge-white)]">
              <span className="text-[var(--forge-ember)]">&lt;/&gt;</span> CODEARENA
            </span>
          </div>
          <p className="text-[var(--forge-dim)] font-mono text-xs uppercase tracking-widest leading-relaxed">
            Forge your skills.<br/>
            Dominate the leaderboard.<br/>
            Compete in real-time.
          </p>
        </div>

        {/* Links Column 1 */}
        <div className="flex flex-col gap-3 text-center md:text-left">
          <h4 className="font-bold text-[var(--forge-steel)] uppercase tracking-wider mb-2">Platform</h4>
          <Link to="/problems" className="text-sm font-mono text-[var(--forge-dim)] hover:text-[var(--forge-ember)] transition-colors">Problems</Link>
          <Link to="/leaderboard" className="text-sm font-mono text-[var(--forge-dim)] hover:text-[var(--forge-ember)] transition-colors">Leaderboard</Link>
          <Link to="/duel" className="text-sm font-mono text-[var(--forge-dim)] hover:text-[var(--forge-ember)] transition-colors">Duel Arena</Link>
        </div>

        {/* Links Column 2 */}
        <div className="flex flex-col gap-3 text-center md:text-left">
          <h4 className="font-bold text-[var(--forge-steel)] uppercase tracking-wider mb-2">CodeArena</h4>
          <Link to="/about" className="text-sm font-mono text-[var(--forge-dim)] hover:text-[var(--forge-ember)] transition-colors">About Us</Link>
          <Link to="/creator" className="text-sm font-mono text-[var(--forge-dim)] hover:text-[var(--forge-ember)] transition-colors">Meet the Creator</Link>
          <Link to="/faq" className="text-sm font-mono text-[var(--forge-dim)] hover:text-[var(--forge-ember)] transition-colors">FAQ</Link>
          <Link to="/contact" className="text-sm font-mono text-[var(--forge-dim)] hover:text-[var(--forge-ember)] transition-colors">Contact</Link>
        </div>

        {/* Links Column 3 */}
        <div className="flex flex-col gap-3 text-center md:text-left">
          <h4 className="font-bold text-[var(--forge-steel)] uppercase tracking-wider mb-2">Legal</h4>
          <Link to="/terms" className="text-sm font-mono text-[var(--forge-dim)] hover:text-[var(--forge-ember)] transition-colors">Terms & Conditions</Link>
          <Link to="/privacy-policy" className="text-sm font-mono text-[var(--forge-dim)] hover:text-[var(--forge-ember)] transition-colors">Privacy Policy</Link>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-[var(--forge-border)] flex flex-col items-center gap-2">
        <p className="text-[var(--forge-dim)] font-mono text-xs uppercase tracking-widest text-center">
          © {new Date().getFullYear()} CODEARENA. ALL RIGHTS RESERVED.
        </p>
        <p className="text-[var(--forge-dim)] font-mono text-[10px] tracking-widest text-center mt-2">
          BUILT BY <Link to="/creator" className="text-[var(--forge-steel)] hover:text-[var(--forge-ember)] transition-colors font-bold">VIVEK KUMAR SULANIYA</Link>
        </p>
      </div>
    </footer>
  );
}
