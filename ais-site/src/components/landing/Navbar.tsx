import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Hash, LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 0);
    };

    setIsAtTop(window.scrollY <= 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className="fixed w-full z-50 top-0 pt-4 md:pt-6 px-4 md:px-8">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`max-w-7xl mx-auto bg-brand-dark/60 backdrop-blur-2xl ring-1 ring-white/[0.04] rounded-2xl px-6 md:px-8 py-4 flex items-center justify-between shadow-2xl shadow-black/20 nav-border-anim ${!isAtTop ? "nav-border-play" : ""}`}
      >
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/25 rotate-3 group-hover:rotate-6 group-hover:scale-105 transition-all duration-500">
            <Hash size={22} className="text-white" />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-white font-serif">
            Ether Chat
          </span>
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <Link
            to="/about"
            className="hidden md:block text-xs font-semibold uppercase tracking-[0.12em] text-white/30 hover:text-white/70 transition-colors duration-300"
          >
            About
          </Link>
          <Link
            to="/login"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40 hover:text-white transition-colors duration-300 flex items-center gap-2"
          >
            <LogIn size={14} />
            <span className="hidden sm:inline">Login</span>
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-brand-accent text-white rounded-xl shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/35 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 font-bold text-xs uppercase tracking-[0.12em] flex items-center gap-2"
          >
            <UserPlus size={14} />
            <span className="hidden sm:inline">Register</span>
          </Link>
        </div>
      </motion.div>
    </nav>
  );
}
