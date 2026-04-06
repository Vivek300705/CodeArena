import React from 'react';
import { useSEO } from '../hooks/useSEO.js';
import { Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  useSEO({
    title: 'Privacy Policy',
    description: "Read CodeArena's Privacy Policy to understand how we collect, use, and protect your personal data.",
    exact: false
  });

  return (
    <div className="min-h-screen bg-[var(--forge-bg)] text-[var(--forge-white)] font-ui pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12 border-b border-[var(--forge-border)] pb-8">
          <h1 className="text-4xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-[var(--forge-white)] to-[var(--forge-steel)] mb-4">
            Privacy Policy
          </h1>
          <p className="text-[var(--forge-steel)] text-lg">Last updated: April 2026</p>
        </div>

        <div className="space-y-12 text-[var(--forge-steel)]">
          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">1. What Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Information:</strong> Name, email, username, encrypted password, and profile data.</li>
              <li><strong>Platform Usage:</strong> Code submissions, battle history, ELO ranking.</li>
              <li><strong>Technical Data:</strong> IP address, browser/device information, cookies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">2. How We Use Data</h2>
            <p className="mb-4">We use your data to provide, improve, and secure the CodeArena platform:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Matchmaking and ELO calculation for coding battles.</li>
              <li>Providing AI-powered feedback on your code submissions.</li>
              <li>Analytics and platform improvements.</li>
              <li>Enforcing fair play and anti-cheat policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">3. Cookie Policy</h2>
            <p className="mb-4">CodeArena uses cookies to enhance your experience:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for login and authentication.</li>
              <li><strong>Analytics Cookies:</strong> Google Analytics for understanding platform usage.</li>
              <li><strong>Preference Cookies:</strong> Saving your theme and editor settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">4. Data Sharing</h2>
            <p className="mb-4">
              <strong>We do NOT sell your data.</strong> We only share minimal data with service providers (e.g., hosting, analytics) 
              and legal authorities if required by law.
            </p>
            <p>
              Your public profile, username, rank, and statistics are visible to other users on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">5. User Rights</h2>
            <p className="mb-4">You have the right to access, correct, delete, or port your data. You may also opt-out of marketing communications.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">6. Data Retention</h2>
            <p className="mb-4">Personal data is securely deleted within 30 days of account deletion.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">7. Security</h2>
            <p className="mb-4">
              We protect your data using HTTPS encryption, regular security audits, and strict access controls. 
              Always use a strong, unique password for your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">8. Children's Privacy</h2>
            <p className="mb-4">CodeArena is not intended for or directed at users under the age of 13.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">9. Policy Changes</h2>
            <p className="mb-4">Users will be notified of significant changes via email or platform notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-display text-[var(--forge-white)] mb-4">10. Contact Us</h2>
            <p className="flex items-center gap-2">
              <Mail size={18} className="text-[var(--forge-ember)]" /> 
              For privacy-related inquiries, contact:{' '}
              <a href="mailto:privacy@codearena.sbs" className="text-[var(--forge-white)] hover:text-[var(--forge-ember)] transition-colors">
                privacy@codearena.sbs
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
