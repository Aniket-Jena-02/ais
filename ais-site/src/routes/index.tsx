import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Hash,
  ArrowRight,
  LogIn,
  UserPlus,
  MessageSquare,
  Users,
  Globe,
  Lock,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useInViewport, useCounter } from "ahooks";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "Ether Chat | Home",
    meta: [
      { property: "og:title", content: "Ether Chat | Home" },
      { property: "og:description", content: "Ether Chat" },
      { property: "og:image", content: "/favicon.png" },
    ],
  }),
  component: LandingPage,
  beforeLoad: async () => {
    let isAuthenticated = false;
    try {
      const res = await fetch(`${import.meta.env.VITE_API}/auth/me`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.userName) {
          isAuthenticated = true;
        }
      }
    } catch (e) {
      // ignore fetch errors
    }

    if (isAuthenticated) {
      throw redirect({ to: "/channels" });
    }
  }
});

// Animated counter component using ahooks
function AnimatedStat({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inViewport] = useInViewport(ref);
  const [count, { set }] = useCounter(0, { min: 0, max: end });

  useEffect(() => {
    if (!inViewport || count >= end) return;

    const step = Math.max(1, Math.floor(end / 60));
    const timeout = window.setTimeout(() => {
      set((prev) => Math.min(prev + step, end));
    }, 16);

    return () => window.clearTimeout(timeout);
  }, [count, end, inViewport, set]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-6xl font-black font-serif tracking-tight text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25 mt-3">
        {label}
      </div>
    </div>
  );
}

// Scroll-triggered reveal for sections using ahooks
function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inViewport] = useInViewport(ref, { threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${inViewport
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-12"
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const features = [
    {
      icon: Zap,
      title: "Real-time Messaging",
      description: "WebSocket-powered delivery with sub-100ms latency. Every keystroke, every message — instantly.",
      iconWrapClass: "bg-brand-accent/10 border-brand-accent/20",
      iconClass: "text-brand-accent",
    },
    {
      icon: Hash,
      title: "Organized Channels",
      description: "Structure conversations by topic, team, or project. Scale from 2 people to 200 seamlessly.",
      iconWrapClass: "bg-brand-accent/10 border-brand-accent/20",
      iconClass: "text-brand-accent",
    },
    {
      icon: ShieldCheck,
      title: "Robust Security",
      description: "HTTP-only cookies, bcrypt hashing, and channel-level ACL built right into the core.",
      iconWrapClass: "bg-emerald-500/10 border-emerald-500/20",
      iconClass: "text-emerald-500",
    },
  ];

  const capabilities = [
    { icon: MessageSquare, label: "Instant Messaging" },
    { icon: Users, label: "Team Channels" },
    { icon: Lock, label: "Encrypted Auth" },
    { icon: Globe, label: "Cross-Platform" },
    { icon: Sparkles, label: "Live Indicators" },
    { icon: Zap, label: "Zero Latency" },
  ];

  return (
    <div className="min-h-dvh bg-brand-dark relative overflow-x-hidden selection:bg-brand-accent/30 font-sans">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-brand-accent/8 rounded-full filter blur-[120px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-accent-soft/5 rounded-full filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-emerald-500/3 rounded-full filter blur-[80px] animate-blob animation-delay-4000" />
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 pt-4 md:pt-6 px-4 md:px-8">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto bg-brand-dark/60 backdrop-blur-2xl border border-white/6 ring-1 ring-white/4 rounded-2xl px-6 md:px-8 py-4 flex items-center justify-between shadow-2xl shadow-black/20"
        >
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/25 rotate-3 group-hover:rotate-6 transition-transform duration-500">
              <Hash size={22} className="text-white" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-white font-serif">
              Ether Chat
            </span>
          </Link>

          <div className="flex items-center gap-3 md:gap-6">
            <Link
              to="/about"
              className="hidden md:block text-[11px] font-bold uppercase tracking-[0.15em] text-white/30 hover:text-white/70 transition-colors duration-300"
            >
              About
            </Link>
            <Link
              to="/login"
              className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors duration-300 flex items-center gap-2"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Login</span>
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-brand-accent text-white rounded-xl shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 font-bold text-[11px] uppercase tracking-[0.15em] flex items-center gap-2"
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline">Register</span>
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 min-h-dvh flex items-center pt-32 pb-20 px-4 md:px-8">
        <motion.div
          className="max-w-7xl mx-auto w-full flex flex-col items-center text-center"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/8 bg-white/3 text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-12 backdrop-blur-sm ring-1 ring-white/4"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-50" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-accent shadow-[0_0_10px_rgba(212,78,40,0.45)]" />
            </span>
            v2.0 Beta is Live
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tight text-white font-serif leading-[0.9] mb-8 max-w-5xl text-balance"
          >
            Connect Beyond
            <br />
            <span className="text-gradient bg-linear-to-r from-brand-accent via-brand-accent-soft to-brand-accent bg-size-[200%_auto] animate-gradient">
              Boundaries.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-lg md:text-xl text-white/25 font-medium max-w-2xl mb-14 leading-relaxed text-balance"
          >
            Lightning-fast communication meets intentional design.
            <br className="hidden md:block" />
            Built for teams who demand{" "}
            <span className="text-white/50 font-bold">performance</span> and{" "}
            <span className="text-white/50 font-bold">premium aesthetics</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full justify-center"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto px-10 py-5 bg-brand-accent text-white font-black uppercase tracking-[0.15em] text-xs rounded-2xl shadow-2xl shadow-brand-accent/25 hover:shadow-brand-accent/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              Get Started Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-10 py-5 bg-white/4 border border-white/8 text-white/70 font-black uppercase tracking-[0.15em] text-xs rounded-2xl hover:bg-white/8 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm"
            >
              <LogIn size={16} />
              Sign In to Account
            </Link>
          </motion.div>

          {/* Capability Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-wrap justify-center gap-3 mt-16 max-w-2xl"
          >
            {capabilities.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/6 bg-white/2 text-white/30 text-[10px] font-bold uppercase tracking-wider hover:bg-white/6 hover:text-white/50 transition-all duration-300 cursor-default animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                style={{ animationDelay: `${800 + i * 100}ms`, animationDuration: "600ms" }}
              >
                <Icon size={12} />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* App Preview Mockup */}
      <section className="relative z-10 -mt-10 px-4 md:px-8 pb-32">
        <RevealSection>
          <div className="max-w-6xl mx-auto relative">
            {/* Glow effect behind mockup */}
            <div className="absolute inset-0 bg-brand-accent/5 rounded-3xl filter blur-3xl scale-95" />

            <div className="relative aspect-16/10 sm:aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-white/6 bg-brand-dark flex ring-1 ring-white/3">

              {/* Mock Sidebar */}
              <div className="w-1/4 bg-brand-surface/80 border-r border-white/4 hidden md:flex flex-col">
                {/* Sidebar header */}
                <div className="px-5 py-4 border-b border-white/4 flex items-center justify-between">
                  <div className="h-4 w-20 bg-white/10 rounded-full" />
                  <div className="w-5 h-5 rounded bg-white/4" />
                </div>
                {/* Channel list */}
                <div className="p-3 space-y-1 flex-1">
                  {["general", "design", "engineering", "random"].map((name, i) => (
                    <div
                      key={name}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${i === 0
                        ? "bg-white/6 text-white/60"
                        : "text-white/20"
                        }`}
                    >
                      <Hash size={13} className={i === 0 ? "text-brand-accent" : "text-white/15"} />
                      <div className="h-2.5 rounded-full bg-current" style={{ width: `${name.length * 8}px`, opacity: 0.6 }} />
                    </div>
                  ))}
                </div>
                {/* User at bottom */}
                <div className="px-4 py-3 border-t border-white/4 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-accent/30" />
                  <div className="h-2.5 w-16 bg-white/10 rounded-full" />
                </div>
              </div>

              {/* Mock Main Area */}
              <div className="flex-1 bg-brand-dark flex flex-col">
                {/* Channel header */}
                <div className="h-14 border-b border-white/4 flex items-center px-6">
                  <Hash size={16} className="text-white/15 mr-2" />
                  <div className="h-4 w-24 bg-white/10 rounded-full" />
                </div>

                {/* Messages */}
                <div className="flex-1 px-6 py-6 space-y-6">
                  {/* Message 1 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-28 bg-white/20 rounded-full" />
                        <div className="h-2 w-12 bg-white/6 rounded-full" />
                      </div>
                      <div className="h-3.5 w-3/4 bg-white/10 rounded-full" />
                      <div className="h-3.5 w-1/2 bg-white/6 rounded-full" />
                    </div>
                  </div>

                  {/* Message 2 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-accent/30 shrink-0 shadow-lg shadow-brand-accent/10" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-20 bg-brand-accent/40 rounded-full" />
                        <div className="h-2 w-12 bg-white/6 rounded-full" />
                      </div>
                      <div className="h-3.5 w-2/3 bg-white/15 rounded-full" />
                    </div>
                  </div>

                  {/* Message 3 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-32 bg-white/15 rounded-full" />
                        <div className="h-2 w-12 bg-white/6 rounded-full" />
                      </div>
                      <div className="h-3.5 w-4/5 bg-white/8 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="px-6 pb-2">
                  <div className="flex items-center gap-2 text-white/15">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-current animate-pulse animation-delay-2000" />
                      <div className="w-1 h-1 rounded-full bg-current animate-pulse animation-delay-4000" />
                    </div>
                    <div className="h-2 w-24 bg-white/4 rounded-full" />
                  </div>
                </div>

                {/* Input */}
                <div className="px-4 pb-4">
                  <div className="h-12 w-full bg-brand-surface/60 border border-white/4 rounded-xl flex items-center px-4">
                    <div className="h-2.5 w-1/3 bg-white/6 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-24 border-y border-white/4 bg-brand-surface/30 backdrop-blur-sm px-4 md:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <AnimatedStat end={99} suffix="%" label="Uptime" />
          <AnimatedStat end={50} suffix="ms" label="Avg Latency" />
          <AnimatedStat end={10000} suffix="+" label="Messages / Day" />
          <AnimatedStat end={256} suffix="-bit" label="Encryption" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-32 md:py-48 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <RevealSection className="text-center mb-24 md:mb-32">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/6 bg-white/2 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              Features
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight font-serif mb-6">
              Engineered for{" "}
              <span className="text-gradient bg-linear-to-r from-brand-accent to-brand-accent-soft">Power</span>
            </h2>
            <p className="text-white/25 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Enterprise performance meets boutique design sensibility.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <RevealSection key={feature.title} delay={index * 150}>
                  <div className="group bg-brand-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-10 md:p-12 shadow-xl hover:shadow-2xl hover:border-white/10 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-linear-to-b from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border group-hover:scale-110 transition-transform duration-500 ${feature.iconWrapClass}`}>
                        <Icon size={28} className={feature.iconClass} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight font-serif">
                        {feature.title}
                      </h3>
                      <p className="text-white/30 font-medium leading-relaxed text-[15px]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 md:py-40 px-4 md:px-8">
        <RevealSection>
          <div className="max-w-4xl mx-auto text-center relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-brand-accent/5 rounded-full filter blur-[100px] scale-75" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight font-serif mb-6 leading-[0.95]">
                Ready to join the
                <br />
                <span className="text-gradient bg-linear-to-r from-brand-accent to-brand-accent-soft">conversation?</span>
              </h2>
              <p className="text-white/25 text-lg md:text-xl max-w-xl mx-auto mb-14 leading-relaxed font-medium">
                Create your account in seconds and start messaging your team instantly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-12 py-5 bg-brand-accent text-white font-black uppercase tracking-[0.15em] text-xs rounded-2xl shadow-2xl shadow-brand-accent/25 hover:shadow-brand-accent/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <UserPlus size={18} />
                  Create Free Account
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-12 py-5 bg-white/4 border border-white/8 text-white/60 font-black uppercase tracking-[0.15em] text-xs rounded-2xl hover:bg-white/8 hover:text-white transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/4 bg-brand-surface/20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-accent/20 flex items-center justify-center">
                <Hash size={16} className="text-brand-accent" />
              </div>
              <p className="font-black text-xl text-white font-serif tracking-tight">Ether Chat</p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              <Link to="/about" className="hover:text-white/50 transition-colors duration-300">About</Link>
              <Link to="/login" className="hover:text-white/50 transition-colors duration-300">Login</Link>
              <Link to="/register" className="hover:text-white/50 transition-colors duration-300">Register</Link>
            </div>

            {/* Copyright */}
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/15">
              © 2026 Ether Chat Industries
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
