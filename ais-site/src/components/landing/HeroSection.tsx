import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  LogIn,
  MessageSquare,
  Users,
  Lock,
  Globe,
  Sparkles,
  Zap,
} from "lucide-react";
import { useRef } from "react";

const capabilities = [
  { icon: MessageSquare, label: "Instant Messaging" },
  { icon: Users, label: "Team Channels" },
  { icon: Lock, label: "Encrypted Auth" },
  { icon: Globe, label: "Cross-Platform" },
  { icon: Sparkles, label: "Live Indicators" },
  { icon: Zap, label: "Zero Latency" },
];

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={heroRef}
      className="relative z-10 min-h-dvh flex items-center pt-36 pb-24 px-4 md:px-8"
    >
      <motion.div
        className="max-w-7xl mx-auto w-full flex flex-col items-center text-center"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.06] bg-white/[0.03] text-white/50 text-[11px] font-bold uppercase tracking-[0.2em] mb-14 backdrop-blur-sm ring-1 ring-white/[0.04]"
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
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white font-serif leading-[0.9] mb-8 max-w-5xl text-balance"
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
          className="text-lg md:text-xl text-white/30 font-medium max-w-2xl mb-16 leading-relaxed text-balance"
        >
          Lightning-fast communication meets intentional design.
          <br className="hidden md:block" />
          Built for teams who demand{" "}
          <span className="text-white/55 font-bold">performance</span> and{" "}
          <span className="text-white/55 font-bold">premium aesthetics</span>.
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
            className="cta-glow w-full sm:w-auto px-10 py-5 bg-brand-accent text-white font-black uppercase tracking-[0.12em] text-xs rounded-2xl shadow-2xl shadow-brand-accent/25 hover:shadow-brand-accent/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            Get Started Free
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-10 py-5 bg-white/[0.04] border border-white/[0.08] text-white/70 font-black uppercase tracking-[0.12em] text-xs rounded-2xl hover:bg-white/[0.08] hover:text-white hover:border-white/[0.12] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm"
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
          className="flex flex-wrap justify-center gap-3 mt-20 max-w-2xl"
        >
          {capabilities.map(({ icon: Icon, label }, i) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-white/30 text-xs font-semibold uppercase tracking-wider hover:bg-white/[0.06] hover:text-white/50 hover:border-white/[0.1] transition-all duration-300 cursor-default animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
              style={{
                animationDelay: `${800 + i * 100}ms`,
                animationDuration: "600ms",
              }}
            >
              <Icon size={13} />
              {label}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
