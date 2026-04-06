import React, { useState } from 'react';
import { useSEO } from '../hooks/useSEO.js';
import ForgeButton from '../components/ForgeButton.jsx';
import ForgeCard from '../components/ForgeCard.jsx';
import { Mail, MessageSquare, Shield, Scale, Twitter, Linkedin, Github, MessageCircle } from 'lucide-react';

export default function Contact() {
  useSEO({
    title: 'Contact Us | CodeArena',
    description: "Get in touch with the CodeArena team for support, bug reports, partnership inquiries, or general questions.",
    exact: true
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[var(--forge-bg)] text-[var(--forge-white)] font-ui pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-[var(--forge-white)] to-[var(--forge-steel)] mb-4">
            Get in Touch
          </h1>
          <p className="text-[var(--forge-steel)] text-xl max-w-2xl mx-auto">
            Have a question, bug report, or partnership idea? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Form */}
          <ForgeCard className="p-8">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-[rgba(0,217,126,0.1)] rounded-full flex items-center justify-center mb-6">
                  <span className="text-[var(--forge-green)] text-3xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold font-display text-[var(--forge-green)] mb-2">Message Sent!</h3>
                <p className="text-[var(--forge-steel)]">We'll get back to you within 24 hours.</p>
                <ForgeButton 
                  variant="secondary" 
                  className="mt-8"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </ForgeButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[var(--forge-steel)] text-sm font-bold mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[var(--forge-panel)] border border-[var(--forge-border)] rounded-md px-4 py-3 text-[var(--forge-white)] focus:outline-none focus:border-[var(--forge-ember)] transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-[var(--forge-steel)] text-sm font-bold mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[var(--forge-panel)] border border-[var(--forge-border)] rounded-md px-4 py-3 text-[var(--forge-white)] focus:outline-none focus:border-[var(--forge-ember)] transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-[var(--forge-steel)] text-sm font-bold mb-2">Subject</label>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-[var(--forge-panel)] border border-[var(--forge-border)] rounded-md px-4 py-3 text-[var(--forge-white)] focus:outline-none focus:border-[var(--forge-ember)] transition-colors appearance-none"
                  >
                    <option>General Inquiry</option>
                    <option>Bug Report</option>
                    <option>Account Issue</option>
                    <option>Partnership</option>
                    <option>Feature Request</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--forge-steel)] text-sm font-bold mb-2">Message</label>
                  <textarea 
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full bg-[var(--forge-panel)] border border-[var(--forge-border)] rounded-md px-4 py-3 text-[var(--forge-white)] focus:outline-none focus:border-[var(--forge-ember)] transition-colors resize-none"
                    placeholder="How can we help?"
                  ></textarea>
                </div>

                <ForgeButton variant="primary" type="submit" className="w-full py-4 text-lg">
                  Send Message
                </ForgeButton>
              </form>
            )}
          </ForgeCard>

          {/* Contact Info */}
          <div className="space-y-6">
            <ForgeCard className="p-6 flex items-center gap-4 hover:border-[var(--forge-ember)] transition-colors">
              <div className="p-3 bg-[rgba(255,107,53,0.1)] rounded-lg text-[var(--forge-ember)]">
                <MessageSquare size={24} />
              </div>
              <div>
                <h4 className="text-[var(--forge-steel)] text-sm font-bold uppercase tracking-wider mb-1">General</h4>
                <a href="mailto:hello@codearena.sbs" className="text-lg font-bold text-[var(--forge-white)] hover:text-[var(--forge-ember)] transition-colors">hello@codearena.sbs</a>
              </div>
            </ForgeCard>

            <ForgeCard className="p-6 flex items-center gap-4 hover:border-[var(--forge-gold)] transition-colors">
              <div className="p-3 bg-[rgba(255,184,0,0.1)] rounded-lg text-[var(--forge-gold)]">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="text-[var(--forge-steel)] text-sm font-bold uppercase tracking-wider mb-1">Support</h4>
                <a href="mailto:support@codearena.sbs" className="text-lg font-bold text-[var(--forge-white)] hover:text-[var(--forge-gold)] transition-colors">support@codearena.sbs</a>
              </div>
            </ForgeCard>

            <ForgeCard className="p-6 flex items-center gap-4 hover:border-[var(--forge-green)] transition-colors">
              <div className="p-3 bg-[rgba(0,217,126,0.1)] rounded-lg text-[var(--forge-green)]">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="text-[var(--forge-steel)] text-sm font-bold uppercase tracking-wider mb-1">Privacy</h4>
                <a href="mailto:privacy@codearena.sbs" className="text-lg font-bold text-[var(--forge-white)] hover:text-[var(--forge-green)] transition-colors">privacy@codearena.sbs</a>
              </div>
            </ForgeCard>

            <ForgeCard className="p-6 flex items-center gap-4 hover:border-[var(--forge-steel)] transition-colors">
              <div className="p-3 bg-[rgba(143,170,191,0.1)] rounded-lg text-[var(--forge-steel)]">
                <Scale size={24} />
              </div>
              <div>
                <h4 className="text-[var(--forge-steel)] text-sm font-bold uppercase tracking-wider mb-1">Legal</h4>
                <a href="mailto:legal@codearena.sbs" className="text-lg font-bold text-[var(--forge-white)] hover:text-[var(--forge-steel)] transition-colors">legal@codearena.sbs</a>
              </div>
            </ForgeCard>

            {/* Social Links */}
            <div className="pt-8 flex items-center gap-4">
              <span className="text-[var(--forge-steel)] font-bold uppercase tracking-wider text-sm mr-2">Follow Us:</span>
              <a href="#" className="p-3 bg-[var(--forge-panel)] border border-[var(--forge-border)] rounded-full text-[var(--forge-white)] hover:text-[var(--forge-ember)] hover:border-[var(--forge-ember)] transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-3 bg-[var(--forge-panel)] border border-[var(--forge-border)] rounded-full text-[var(--forge-white)] hover:text-[var(--forge-ember)] hover:border-[var(--forge-ember)] transition-all">
                <Linkedin size={20} />
              </a>
              <a href="#" className="p-3 bg-[var(--forge-panel)] border border-[var(--forge-border)] rounded-full text-[var(--forge-white)] hover:text-[var(--forge-ember)] hover:border-[var(--forge-ember)] transition-all">
                <Github size={20} />
              </a>
              <a href="#" className="p-3 bg-[var(--forge-panel)] border border-[var(--forge-border)] rounded-full text-[var(--forge-white)] hover:text-[var(--forge-ember)] hover:border-[var(--forge-ember)] transition-all">
                <MessageCircle size={20} />
              </a>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
