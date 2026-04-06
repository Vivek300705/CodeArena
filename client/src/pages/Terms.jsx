import React from 'react';
import { useSEO } from '../hooks/useSEO.js';
import { Mail } from 'lucide-react';

export default function Terms() {
  useSEO({
    title: 'Terms & Conditions',
    description: "Review the Terms & Conditions for using CodeArena — the real-time competitive coding platform.",
    exact: false
  });

  return (
    <div className="min-h-screen bg-[var(--forge-bg)] text-[var(--forge-white)] font-ui pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12 border-b border-[var(--forge-border)] pb-8">
          <h1 className="text-4xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-[var(--forge-white)] to-[var(--forge-steel)] mb-4">
            Terms & Conditions
          </h1>
          <p className="text-[var(--forge-steel)] text-lg">Last updated: April 2026</p>
        </div>

        <div className="space-y-12 text-[var(--forge-steel)]">
          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using CodeArena, you agree to be bound by these Terms & Conditions and our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">2. Eligibility</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be at least 13 years old to use the platform.</li>
              <li>You may only maintain one account per person.</li>
              <li>You agree to provide accurate and complete registration information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">3. Fair Play and Anti-Cheat</h2>
            <p className="mb-4">CodeArena maintains a strict zero-tolerance policy for cheating:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>No tab switching during active, ranked battles.</li>
              <li>No copy-pasting of pre-written code during battles.</li>
              <li>No bots, AI companions, or automated tools.</li>
              <li>No exploiting bugs or system vulnerabilities.</li>
            </ul>
            <p className="mt-4 text-[var(--forge-red)] font-bold">
              Violations may result in warnings, ELO penalties, or permanent account bans.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">4. User Conduct</h2>
            <p>
              Users must maintain a respectful environment. Harassment, hate speech, abusive language, 
              or threatening behavior toward other users will result in immediate suspension.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">5. Intellectual Property</h2>
            <p className="mb-2">Users retain ownership of the code they write on the platform.</p>
            <p>
              CodeArena retains all rights, ownership, and intellectual property concerning the platform, branding, design, problem statements, and backend systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">6. ELO and Ranking</h2>
            <p>
              Rankings are calculated based on battle outcomes and the relative skill levels of opponents. CodeArena reserves the right to adjust, reset, or recalculate ELO records in cases of discovered cheating or system errors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">7. Account Suspension</h2>
            <p>
              CodeArena reserves the right to suspend or permanently terminate accounts that violate these terms, at our sole discretion, without warning or refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">8. Disclaimer of Warranties</h2>
            <p>
              The platform is provided on an "as is" and "as available" basis. We do not guarantee continuous, 
              uninterrupted, or error-free operation of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, CodeArena shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages resulting from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">10. Changes to Terms</h2>
            <p>
              We may update these terms occasionally. Users will be notified of major changes. Continued use of 
              the platform constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">11. Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of India.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">12. Contact</h2>
            <p className="flex items-center gap-2">
              <Mail size={18} className="text-[var(--forge-ember)]" /> 
              For legal inquiries, contact:{' '}
              <a href="mailto:legal@codearena.sbs" className="text-[var(--forge-white)] hover:text-[var(--forge-ember)] transition-colors">
                legal@codearena.sbs
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
