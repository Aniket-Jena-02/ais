import { createFileRoute, Link } from "@tanstack/react-router";
import { Hash, Shield, Zap, Users, ArrowLeft, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { useInViewport } from "ahooks";

export const Route = createFileRoute("/about")({
  component: About,
});

function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inViewport] = useInViewport(ref, { threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${inViewport ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function About() {
  return (
    <div className="min-h-screen bg-brand-dark relative overflow-x-hidden selection:bg-brand-accent/30 font-sans">
      {/* Background Graphic Effects */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-brand-accent/8 rounded-full filter blur-[120px] animate-blob pointer-events-none" />

      {/* Nav */}
      <nav className="fixed w-full z-50 top-0 pt-4 md:pt-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-brand-dark/60 backdrop-blur-2xl border border-white/6 rounded-2xl px-6 md:px-8 py-4 flex items-center justify-between shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-top-4 duration-700">
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
              to="/"
              className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 hover:text-white transition-colors duration-300 flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-brand-accent text-white rounded-xl shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 font-bold text-[11px] uppercase tracking-[0.15em] flex items-center gap-2"
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline">Register</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="relative z-10 pt-40 md:pt-48 pb-32 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <RevealSection>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/6 bg-white/2 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
              <span className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(110,64,242,0.5)]" />
              About Ether Chat
            </div>
          </RevealSection>

          <RevealSection delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-white font-serif leading-[0.95] mb-8">
              Communication,{" "}
              <span className="text-gradient bg-linear-to-r from-brand-accent to-brand-accent-soft">Redefined.</span>
            </h1>
          </RevealSection>

          <RevealSection delay={200}>
            <p className="text-lg md:text-xl text-white/25 font-medium max-w-2xl leading-relaxed mb-20">
              Ether Chat was born from the belief that team communication tools should be as
              elegant as the work they enable. We combine enterprise-grade reliability with
              boutique design sensibility.
            </p>
          </RevealSection>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
            {[
              {
                icon: Zap,
                title: "Performance First",
                description: "WebSocket-driven messaging with sub-100ms latency. Every interaction feels instant.",
                accent: "brand-accent",
              },
              {
                icon: Shield,
                title: "Built Secure",
                description: "HTTP-only cookie auth, hashed passwords, and channel-level access control by default.",
                accent: "brand-accent",
              },
              {
                icon: Users,
                title: "Team Centric",
                description: "Channels, members, and admin tools designed for teams of any size. Grow organically.",
                accent: "emerald-500",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <RevealSection key={item.title} delay={300 + index * 150}>
                  <div className="group bg-brand-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-10 hover:border-white/10 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden h-full">
                    <div className="absolute inset-0 bg-linear-to-b from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className={`w-14 h-14 rounded-2xl bg-${item.accent}/10 flex items-center justify-center mb-8 border border-${item.accent}/20`}>
                        <Icon size={24} className={`text-${item.accent}`} />
                      </div>
                      <h3 className="text-xl font-black text-white mb-3 tracking-tight font-serif">{item.title}</h3>
                      <p className="text-white/25 font-medium leading-relaxed text-sm">{item.description}</p>
                    </div>
                  </div>
                </RevealSection>
              );
            })}
          </div>

          {/* Tech Stack */}
          <RevealSection delay={600}>
            <div className="bg-brand-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-10 md:p-14">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-8">Built With</h3>
              <div className="flex flex-wrap gap-3">
                {["React", "TanStack Router", "Tailwind CSS", "daisyUI", "Framer Motion", "Socket.IO", "Hono", "MongoDB", "Bun"].map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 rounded-full border border-white/6 bg-white/2 text-white/40 text-xs font-bold uppercase tracking-wider hover:bg-white/6 hover:text-white/70 transition-all duration-300 cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </RevealSection>

          {/* CTA */}
          <RevealSection delay={700} className="mt-20 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white font-serif tracking-tight mb-6">
              Start using Ether Chat
            </h2>
            <p className="text-white/25 font-medium mb-10 max-w-md mx-auto">
              Join the community and experience messaging done right.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-10 py-4 bg-brand-accent text-white font-black uppercase tracking-[0.15em] text-xs rounded-2xl shadow-2xl shadow-brand-accent/25 hover:shadow-brand-accent/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center gap-3 group"
              >
                <UserPlus size={16} />
                Create Account
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-10 py-4 bg-white/4 border border-white/8 text-white/60 font-black uppercase tracking-[0.15em] text-xs rounded-2xl hover:bg-white/8 hover:text-white transition-all duration-300 flex items-center gap-3"
              >
                <LogIn size={16} />
                Sign In
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/4 bg-brand-surface/20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-accent/20 flex items-center justify-center">
                <Hash size={16} className="text-brand-accent" />
              </div>
              <p className="font-black text-xl text-white font-serif tracking-tight">Ether Chat</p>
            </div>
            <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              <Link to="/" className="hover:text-white/50 transition-colors duration-300">Home</Link>
              <Link to="/login" className="hover:text-white/50 transition-colors duration-300">Login</Link>
              <Link to="/register" className="hover:text-white/50 transition-colors duration-300">Register</Link>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/15">
              © 2026 Ether Chat Industries
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
