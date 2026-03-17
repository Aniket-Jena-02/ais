import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
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
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-base-300 relative overflow-x-hidden selection:bg-primary/30">
      {/* Background Graphic Effects (Matching Login Page) */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/20 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 pt-4 px-6 md:px-12">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-7xl mx-auto bg-base-100/60 backdrop-blur-xl border border-base-content/10 rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-primary to-secondary flex items-center justify-center shadow-lg rotate-3">
              <Hash size={22} className="text-primary-content" />
            </div>
            <span className="text-xl font-black tracking-tighter text-base-content">
              Nexus
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="text-sm font-bold text-base-content/70 hover:text-base-content transition-colors flex items-center gap-2"
            >
              <LogIn size={16} />
              Login
            </Link>
            <Link 
              to="/channels"
              className="btn btn-primary btn-sm rounded-xl px-5 shadow-lg shadow-primary/20 font-bold hidden sm:flex"
            >
              Open Web App
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-48 pb-32 px-6">
        <motion.div 
          className="max-w-7xl mx-auto flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-bold tracking-wide mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            v2.0 Beta is Live
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black tracking-tighter text-base-content leading-tight mb-6 max-w-5xl"
          >
            Connect Beyond
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent">
              Boundaries.
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-base-content/60 font-medium max-w-2xl mb-12 leading-relaxed"
          >
            Experience lightning-fast communication with stunning glassmorphism design. Built for modern teams who demand ultimate performance and premium aesthetics.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link 
              to="/channels" 
              className="btn btn-primary btn-lg rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-all duration-300 min-w-[200px]"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link 
              to="/login"
              className="btn btn-ghost border border-base-content/10 bg-base-200/50 backdrop-blur-md btn-lg rounded-2xl hover:bg-base-200 hover:scale-105 transition-all duration-300 min-w-[200px]"
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
          className="max-w-5xl mx-auto mt-24 relative"
        >
           <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
           <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />
           
           <div className="aspect-[16/10] sm:aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-base-content/10 bg-base-100 flex ring-1 ring-white/5">
             
             {/* Mock Sidebar */}
             <div className="w-1/4 bg-base-200/50 border-r border-base-300 hidden md:flex flex-col p-4 gap-2">
                <div className="h-4 w-1/2 bg-base-content/10 rounded mb-4" />
                {[1,2,3,4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-base-300/30">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                      <Hash size={12} className="text-primary" />
                    </div>
                    <div className="h-3 w-2/3 bg-base-content/20 rounded" />
                  </div>
                ))}
             </div>

             {/* Mock Main Area */}
             <div className="flex-1 bg-base-100 flex flex-col p-6">
                <div className="h-10 w-full border-b border-base-200 flex items-center mb-6 pb-4">
                   <div className="h-5 w-40 bg-base-content/20 rounded" />
                </div>
                
                <div className="flex-1 flex flex-col gap-6">
                  {/* Mock Message 1 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/20" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                         <div className="h-3 w-24 bg-base-content/30 rounded" />
                         <div className="h-2 w-12 bg-base-content/10 rounded" />
                      </div>
                      <div className="h-4 w-3/4 bg-base-content/20 rounded" />
                      <div className="h-4 w-1/2 bg-base-content/20 rounded" />
                    </div>
                  </div>
                  
                  {/* Mock Message 2 (Self) */}
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-primary/40 shadow-[0_0_15px_rgba(var(--p),0.5)]" />
                    <div className="space-y-2 flex-1 flex flex-col items-end">
                      <div className="flex items-center gap-2 flex-row-reverse">
                         <div className="h-3 w-16 bg-primary/60 rounded" />
                         <div className="h-2 w-12 bg-base-content/10 rounded" />
                      </div>
                      <div className="h-4 w-2/3 bg-base-content/40 rounded" />
                    </div>
                  </div>
                </div>

                {/* Mock Input */}
                <div className="h-12 w-full bg-base-200/50 border border-base-300 rounded-xl mt-6 px-4 flex items-center">
                   <div className="h-2 w-1/3 bg-base-content/10 rounded" />
                </div>
             </div>
           </div>
           
           {/* Floating elements to give 3D depth */}
           <motion.div 
             animate={{ y: [0, -15, 0] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -right-8 top-1/4 w-48 h-24 bg-base-100/80 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-xl p-4 hidden lg:flex flex-col justify-center gap-2"
           >
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                 <span className="text-xs font-bold font-mono">System Online</span>
              </div>
              <div className="h-2 w-full bg-base-content/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-success rounded-full" />
              </div>
           </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-32 bg-base-100/30 border-t border-base-100 backdrop-blur-3xl px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-base-content tracking-tight mb-4">
              Engineered for Power
            </h2>
            <p className="text-base-content/60 font-medium text-lg max-w-2xl mx-auto">
              We took the best concepts from Discord and Telegram to build an enterprise-level platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-base-100/50 backdrop-blur-xl border border-base-content/5 rounded-3xl p-8 shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 shadow-[inset_0_0_20px_rgba(var(--p),0.2)]">
                <Zap size={26} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-base-content mb-3">Real-time Messaging</h3>
              <p className="text-base-content/60 font-medium leading-relaxed">
                Instant socket connections deliver your messages instantly with ultra-low latency typing indicators.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-base-100/50 backdrop-blur-xl border border-base-content/5 rounded-3xl p-8 shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20 shadow-[inset_0_0_20px_rgba(var(--s),0.2)]">
                <Hash size={26} className="text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-base-content mb-3">Organized Channels</h3>
              <p className="text-base-content/60 font-medium leading-relaxed">
                Keep your community exactly how you like it. Create dynamic rooms and securely invite members.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-base-100/50 backdrop-blur-xl border border-base-content/5 rounded-3xl p-8 shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20 shadow-[inset_0_0_20px_rgba(var(--a),0.2)]">
                <ShieldCheck size={26} className="text-accent" />
              </div>
              <h3 className="text-xl font-bold text-base-content mb-3">Robust Security</h3>
              <p className="text-base-content/60 font-medium leading-relaxed">
                Your data is locked down behind HTTP-only cookies and protected routes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-300 text-base-content/50 border-t border-base-200 font-medium">
        <aside>
          <div className="flex items-center gap-2 mb-2">
            <Hash size={20} className="text-primary opacity-50" />
            <p className="font-bold text-lg text-base-content/70">Nexus</p>
          </div>
          <p>Copyright © 2026 - All right reserved by Nexus Industries Ltd</p>
        </aside>
      </footer>
    </div>
  );
}
