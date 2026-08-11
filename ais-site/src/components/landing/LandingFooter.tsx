import { Link } from "@tanstack/react-router";
import { Hash } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="relative z-10 bg-brand-surface/20 px-4 md:px-8">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-7xl mx-auto py-16 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-accent/20 flex items-center justify-center">
              <Hash size={16} className="text-brand-accent" />
            </div>
            <p className="font-black text-xl text-white font-serif tracking-tight">
              Ether Chat
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-white/20">
            <Link
              to="/about"
              className="hover:text-white/50 transition-colors duration-300"
            >
              About
            </Link>
            <Link
              to="/login"
              className="hover:text-white/50 transition-colors duration-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="hover:text-white/50 transition-colors duration-300"
            >
              Register
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/15">
            © {new Date().getFullYear()} Ether Chat
          </p>
        </div>
      </div>
    </footer>
  );
}
