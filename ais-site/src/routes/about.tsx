import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Hash, Shield, Zap, Users, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  return (
    <div className="min-h-screen bg-brand-dark relative overflow-x-hidden selection:bg-brand-accent/30 font-sans">
      {/* Background Graphic Effects */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-brand-accent/10 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob pointer-events-none" />

      {/* Nav */}
      <nav className="fixed w-full z-50 top-0 pt-6 px-8 md:px-12">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-7xl mx-auto bg-brand-dark/40 backdrop-blur-2xl border border-white/5 rounded-2xl px-8 py-5 flex items-center justify-between shadow-2xl"
        >
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center shadow-lg rotate-3 group overflow-hidden">
              <Hash size={22} className="text-white group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white font-serif">
              Ether Chat
            </span>
          </Link>

          <Link
            to="/"
            className="text-sm font-black uppercase tracking-widest text-white/40 hover:text-white transition-all duration-300 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </motion.div>
      </nav>

      {/* Content */}
      <section className="relative z-10 pt-48 pb-32 px-8">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
            <span className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(75,43,238,0.5)]" />
            About Ether Chat
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-black tracking-tight text-white font-serif leading-[0.95] mb-8"
          >
            Communication,{" "}
            <span className="text-brand-accent">Redefined.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-white/30 font-medium max-w-2xl leading-relaxed mb-20"
          >
            Ether Chat was born from the belief that team communication tools should be as
            elegant as the work they enable. We combine enterprise-grade reliability with
            boutique design sensibility.
          </motion.p>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <motion.div
              variants={itemVariants}
              className="bg-brand-muted/20 backdrop-blur-2xl border border-white/5 rounded-3xl p-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-8 border border-brand-accent/20">
                <Zap size={24} className="text-brand-accent" />
              </div>
              <h3 className="text-xl font-black text-white mb-3 tracking-tight font-serif">Performance First</h3>
              <p className="text-white/30 font-medium leading-relaxed text-sm">
                WebSocket-driven messaging with sub-100ms latency. Every interaction feels instant.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-brand-muted/20 backdrop-blur-2xl border border-white/5 rounded-3xl p-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-8 border border-brand-accent/20">
                <Shield size={24} className="text-brand-accent" />
              </div>
              <h3 className="text-xl font-black text-white mb-3 tracking-tight font-serif">Built Secure</h3>
              <p className="text-white/30 font-medium leading-relaxed text-sm">
                HTTP-only cookie auth, hashed passwords, and channel-level access control by default.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-brand-muted/20 backdrop-blur-2xl border border-white/5 rounded-3xl p-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
                <Users size={24} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-3 tracking-tight font-serif">Team Centric</h3>
              <p className="text-white/30 font-medium leading-relaxed text-sm">
                Channels, members, and admin tools designed for teams of any size. Grow organically.
              </p>
            </motion.div>
          </div>

          {/* Tech Stack */}
          <motion.div
            variants={itemVariants}
            className="bg-brand-muted/20 backdrop-blur-2xl border border-white/5 rounded-3xl p-10 md:p-14"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-8">Built With</h3>
            <div className="flex flex-wrap gap-3">
              {["React", "TanStack Router", "Tailwind CSS", "Framer Motion", "Socket.IO", "Hono", "MongoDB", "Bun"].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-white/50 text-xs font-black uppercase tracking-wider hover:bg-white/5 hover:text-white/80 transition-all duration-200 cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-brand-dark text-white/20 border-t border-white/5 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Hash size={24} className="text-brand-accent/40" />
            <p className="font-black text-2xl text-white font-serif tracking-tight">Ether Chat</p>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em]">© 2026 Ether Chat Industries Ltd — All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
