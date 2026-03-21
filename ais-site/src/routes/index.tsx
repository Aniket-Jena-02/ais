import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Zap, 
  Hash, 
  ArrowRight,
  LogIn
} from "lucide-react";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark relative overflow-x-hidden selection:bg-brand-accent/30 font-sans">
      {/* Background Graphic Effects */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-accent/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-accent/5 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 pt-6 px-8 md:px-12">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-7xl mx-auto bg-brand-dark/40 backdrop-blur-2xl border border-white/5 rounded-2xl px-8 py-5 flex items-center justify-between shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center shadow-lg rotate-3 group overflow-hidden">
              <Hash size={22} className="text-white group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white font-serif">
              Ether Chat
            </span>
          </div>

          <div className="flex items-center gap-8">
            <Link 
              to="/login"
              className="text-sm font-black uppercase tracking-widest text-white/40 hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              <LogIn size={16} />
              Login
            </Link>
            <Link 
              to="/channels"
              className="px-6 py-2.5 bg-white text-brand-dark rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-black text-xs uppercase tracking-widest hidden sm:flex"
            >
              Open App
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-56 pb-40 px-8">
        <motion.div 
          className="max-w-7xl mx-auto flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-12">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse shadow-[0_0_8px_rgba(75,43,238,0.5)]" />
            v2.0 Beta is Live
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-7xl md:text-[120px] font-black tracking-tight text-white font-serif leading-[0.9] mb-10 max-w-6xl"
          >
            Connect Beyond<br />
            <span className="text-brand-accent">Boundaries.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-white/30 font-medium max-w-2xl mb-16 leading-relaxed"
          >
            Lightning-fast communication meets intentional design. Built for teams who demand performance and premium aesthetics.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center">
            <Link 
              to="/channels" 
              className="px-10 py-5 bg-brand-accent text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl shadow-brand-accent/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3"
            >
              Get Started <ArrowRight size={18} />
            </Link>
            <Link 
              to="/login"
              className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Log in to Account
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Image Mockup Component */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl mx-auto mt-32 relative"
        >
           <div className="absolute inset-x-0 -top-px h-px bg-white/10" />
           <div className="absolute inset-x-0 -bottom-px h-px bg-white/5" />
           
           <div className="aspect-[16/10] sm:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-brand-dark flex ring-1 ring-white/5">
             
             {/* Mock Sidebar */}
             <div className="w-1/4 bg-brand-muted/20 border-r border-white/5 hidden md:flex flex-col p-6 gap-3">
                <div className="h-4 w-1/2 bg-white/5 rounded-full mb-6" />
                {[1,2,3,4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
                    <div className="w-6 h-6 rounded-lg bg-brand-accent/20 flex items-center justify-center">
                      <Hash size={12} className="text-brand-accent" />
                    </div>
                    <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                  </div>
                ))}
             </div>

             {/* Mock Main Area */}
             <div className="flex-1 bg-brand-dark flex flex-col p-8">
                <div className="h-12 w-full border-b border-white/5 flex items-center mb-10 pb-6">
                   <div className="h-5 w-48 bg-white/10 rounded-full" />
                </div>
                
                <div className="flex-1 flex flex-col gap-8">
                  {/* Mock Message 1 */}
                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-full bg-brand-accent/20" />
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                         <div className="h-3 w-32 bg-white/20 rounded-full" />
                         <div className="h-2 w-16 bg-white/5 rounded-full" />
                      </div>
                      <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                      <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Mock Message 2 (Self) */}
                  <div className="flex gap-5 flex-row-reverse">
                    <div className="w-12 h-12 rounded-full bg-brand-accent shadow-lg shadow-brand-accent/20" />
                    <div className="space-y-3 flex-1 flex flex-col items-end">
                      <div className="flex items-center gap-3 flex-row-reverse">
                         <div className="h-3 w-24 bg-brand-accent/40 rounded-full" />
                         <div className="h-2 w-16 bg-white/5 rounded-full" />
                      </div>
                      <div className="h-4 w-2/3 bg-white/20 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Mock Input */}
                <div className="h-14 w-full bg-brand-muted/40 border border-white/5 rounded-2xl mt-8 px-6 flex items-center">
                   <div className="h-2 w-1/3 bg-white/5 rounded-full" />
                </div>
             </div>
           </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-48 bg-brand-dark/50 border-t border-white/5 backdrop-blur-3xl px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight font-serif mb-6">
              Engineered for Power
            </h2>
            <p className="text-white/30 font-medium text-xl max-w-2xl mx-auto leading-relaxed">
              We combined enterprise performance with the soul of a boutique design agency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-brand-muted/20 backdrop-blur-2xl border border-white/5 rounded-[40px] p-12 shadow-2xl"
            >
              <div className="w-20 h-20 rounded-3xl bg-brand-accent/10 flex items-center justify-center mb-10 border border-brand-accent/20">
                <Zap size={32} className="text-brand-accent" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight font-serif">Real-time Messaging</h3>
              <p className="text-white/30 font-medium leading-relaxed">
                Instant socket connections deliver your messages with zero friction and ultra-low latency.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-brand-muted/20 backdrop-blur-2xl border border-white/5 rounded-[40px] p-12 shadow-2xl"
            >
              <div className="w-20 h-20 rounded-3xl bg-brand-accent/10 flex items-center justify-center mb-10 border border-brand-accent/20">
                <Hash size={32} className="text-brand-accent" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight font-serif">Organized Channels</h3>
              <p className="text-white/30 font-medium leading-relaxed">
                Keep your community structured. Create dynamic environments that scale with your needs.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-brand-muted/20 backdrop-blur-2xl border border-white/5 rounded-[40px] p-12 shadow-2xl"
            >
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-10 border border-emerald-500/20">
                <ShieldCheck size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight font-serif">Robust Security</h3>
              <p className="text-white/30 font-medium leading-relaxed">
                Your data is protected by industry-standard encryption and secure cookie protocols.
              </p>
            </motion.div>
          </div>
        </div>
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
