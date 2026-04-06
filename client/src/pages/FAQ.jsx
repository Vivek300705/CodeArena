import React, { useState } from 'react';
import { useSEO } from '../hooks/useSEO.js';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "What is CodeArena?",
    a: "A platform for real-time 1v1 coding battles where two developers race to solve the same problem. First correct solution wins."
  },
  {
    q: "How does matchmaking work?",
    a: "We use an ELO-based system to match you with opponents of similar skill level. You can also create private rooms to battle specific friends."
  },
  {
    q: "What programming languages are supported?",
    a: "Python, JavaScript, TypeScript, Java, C++, C, Go, Rust, and more. You can switch languages freely during practice or battles."
  },
  {
    q: "How is ELO calculated?",
    a: "Your ELO goes up when you beat higher-ranked opponents and drops less when you lose to stronger ones. It accurately reflects your true coding ability over time."
  },
  {
    q: "Is there a practice mode?",
    a: "Yes. You can solve problems solo without any time pressure to sharpen your skills before entering battles."
  },
  {
    q: "How does the anti-cheat system work?",
    a: "Our system monitors tab switching and copy-paste behavior during battles. Suspicious activity is flagged and reviewed. Repeated violations result in bans."
  },
  {
    q: "Can I battle my friends?",
    a: "Yes! Create a custom private room, share the link with your friend, choose a topic, and start battling."
  },
  {
    q: "Is CodeArena free to use?",
    a: "Yes, CodeArena is free to use. Sign up and start battling immediately."
  },
  {
    q: "How do I report a bug or cheater?",
    a: "Email us at support@codearena.sbs with details and we will investigate within 24 hours."
  },
  {
    q: "Can I delete my account?",
    a: "Yes. Go to your profile settings and select \"Delete Account\". Your data will be permanently removed within 30 days."
  },
  {
    q: "What happens if my internet disconnects during a battle?",
    a: "If you disconnect, the battle is paused briefly. If you cannot reconnect within the time limit, the battle may be forfeited."
  },
  {
    q: "How do I climb the leaderboard?",
    a: "Win battles consistently, especially against higher-ranked opponents. The leaderboard resets monthly so everyone has a fresh chance."
  }
];

function FAQAccordion({ item, isOpen, onClick }) {
  return (
    <div className="border border-[var(--forge-border)] rounded-lg overflow-hidden mb-4 bg-[var(--forge-surface)]">
      <button 
        className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-lg text-[var(--forge-white)] hover:bg-[var(--forge-panel)] transition-colors"
        onClick={onClick}
      >
        <span>{item.q}</span>
        <ChevronDown 
          className={`text-[var(--forge-ember)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </button>
      <div 
        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-[var(--forge-steel)]">{item.a}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  useSEO({
    title: 'FAQ | CodeArena',
    description: "Got questions about CodeArena? Find answers about matchmaking, ELO ranking, supported languages, anti-cheat, and more.",
    exact: true
  });

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-[var(--forge-bg)] text-[var(--forge-white)] font-ui pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-[var(--forge-white)] to-[var(--forge-steel)] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-[var(--forge-steel)] text-xl">Everything you need to know about the Arena.</p>
        </div>

        <div>
          {faqs.map((faq, idx) => (
            <FAQAccordion 
              key={idx} 
              item={faq} 
              isOpen={openIndex === idx} 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)} 
            />
          ))}
        </div>

      </div>
    </div>
  );
}
