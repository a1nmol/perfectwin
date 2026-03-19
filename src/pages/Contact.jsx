import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Linkedin, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const Field = ({ name, label, type = 'text', multiline, placeholder }) => {
    const isFocused = focused === name;
    const hasValue = form[name]?.length > 0;
    const Comp = multiline ? 'textarea' : 'input';
    return (
      <div className="relative">
        <label className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
          isFocused || hasValue
            ? 'top-2 text-xs text-emerald-400 font-medium'
            : 'top-1/2 -translate-y-1/2 text-slate-400 text-sm'
        } ${multiline && !isFocused && !hasValue ? '!top-4 !-translate-y-0' : ''}`}>
          {label}
        </label>
        <Comp
          type={type}
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused('')}
          placeholder={isFocused ? placeholder : ''}
          rows={multiline ? 5 : undefined}
          className={`w-full bg-white/3 border rounded-xl px-4 pt-7 pb-3 text-white text-sm outline-none transition-all duration-200 resize-none placeholder:text-slate-600 ${
            isFocused
              ? 'border-emerald-500/60 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
              : 'border-white/10 hover:border-white/20'
          }`}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020b18] pt-24 pb-16">

      {/* Header */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#042a1a] to-[#020b18]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-sky-500/8 blur-[80px] rounded-full" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest block mb-3">Get in Touch</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5">
            We'd Love to <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">Hear From You</span>
          </h1>
          <p className="text-slate-400 text-lg">Reach out for research partnerships, data access, or any questions — Anmol will get back to you personally.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-8">Contact Information</h2>
            <div className="space-y-5 mb-10">
              {[
                { icon: MapPin, label: 'Address', value: 'University of Louisiana at Monroe\nMonroe, LA', color: 'text-emerald-400' },
                { icon: Phone, label: 'Phone', value: '(408) 373-3254', color: 'text-sky-400' },
                { icon: Mail, label: 'Email', value: 'whoisanmolsubediii@gmail.com', color: 'text-violet-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-start gap-4 p-5 rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 transition-all duration-300">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 ${color} flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-white text-sm whitespace-pre-line">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <p className="text-slate-400 text-sm mb-4">Follow our research</p>
              <div className="flex items-center gap-3">
                <a href="https://www.instagram.com/anmoleverywhere" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-pink-400 hover:border-pink-400/30 transition-all text-sm">
                  <Instagram className="w-4 h-4" /> @anmoleverywhere
                </a>
                <a href="https://www.linkedin.com/in/anmolsubedi/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-sky-400 hover:border-sky-400/30 transition-all text-sm">
                  <Linkedin className="w-4 h-4" /> Anmol Subedi
                </a>
              </div>
            </div>

            {/* Office hours */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/8 to-teal-500/5 border border-emerald-500/15">
              <h4 className="text-white font-semibold mb-3 text-sm">Response Times</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">General Inquiries</span>
                  <span className="text-emerald-400">Within 24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Research Partnerships</span>
                  <span className="text-emerald-400">2–3 business days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Technical Support</span>
                  <span className="text-sky-400">Same day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            {submitted ? (
              <div className="p-12 rounded-3xl bg-emerald-500/8 border border-emerald-500/20 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-white text-2xl font-bold mb-3">Message Sent!</h3>
                <p className="text-slate-400">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-sm transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-8">Send a Message</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field name="name" label="Your Name" placeholder="Dr. Jane Smith" />
                  <Field name="email" label="Email Address" type="email" placeholder="jane@university.edu" />
                </div>
                <Field name="subject" label="Subject" placeholder="Research partnership inquiry" />
                <Field name="message" label="Message" multiline placeholder="Tell us about your project, questions, or how we can collaborate..." />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
                <p className="text-slate-500 text-xs text-center">Your information is never shared with third parties.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
