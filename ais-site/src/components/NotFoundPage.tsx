import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Hash, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full filter blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-[28px] bg-brand-surface border border-white/5 flex items-center justify-center shadow-2xl rotate-6">
            <Hash size={36} className="text-brand-accent" />
          </div>
        </div>

        {/* Error code */}
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-accent mb-4">
          Error 404
        </p>

        {/* Heading */}
        <h1 className="text-5xl font-black text-white font-serif tracking-tight leading-none mb-4">
          Page Not Found
        </h1>

        {/* Subtext */}
        <p className="text-white/30 font-medium text-sm leading-relaxed mb-10">
          This page doesn't exist or was moved. Check the URL or head back to
          safety.
        </p>

        {/* CTA */}
        <Link
          to="/channels"
          className="inline-flex items-center gap-2.5 px-6 py-3 bg-brand-accent text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:scale-[1.04] active:scale-[0.97] transition-all duration-300"
        >
          <ArrowLeft size={16} />
          Back to Channels
        </Link>

        <div className="mt-6">
          <Link
            to="/"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors duration-200"
          >
            ← Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
