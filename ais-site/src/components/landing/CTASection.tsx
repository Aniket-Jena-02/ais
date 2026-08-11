import { Link } from "@tanstack/react-router";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { RevealSection } from "./RevealSection";

export function CTASection() {
  return (
    <section className="relative z-10 py-32 md:py-44 px-4 md:px-8">
      <RevealSection>
        <div className="max-w-4xl mx-auto text-center relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-brand-accent/[0.04] rounded-full filter blur-[100px] scale-75" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-accent/[0.06] rounded-full filter blur-[80px] animate-blob" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight font-serif mb-6 leading-[0.95]">
              Ready to join the
              <br />
              <span className="text-gradient bg-linear-to-r from-brand-accent to-brand-accent-soft">
                conversation?
              </span>
            </h2>
            <p className="text-white/30 text-lg md:text-xl max-w-xl mx-auto mb-16 leading-relaxed font-medium">
              Create your account in seconds and start messaging your team
              instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <Link
                to="/register"
                className="cta-glow w-full sm:w-auto px-12 py-5 bg-brand-accent text-white font-black uppercase tracking-[0.12em] text-xs rounded-2xl shadow-2xl shadow-brand-accent/25 hover:shadow-brand-accent/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <UserPlus size={18} />
                Create Free Account
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-12 py-5 bg-white/[0.04] border border-white/[0.08] text-white/60 font-black uppercase tracking-[0.12em] text-xs rounded-2xl hover:bg-white/[0.08] hover:text-white hover:border-white/[0.12] transition-all duration-300 flex items-center justify-center gap-3"
              >
                <LogIn size={16} />
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </RevealSection>
    </section>
  );
}
