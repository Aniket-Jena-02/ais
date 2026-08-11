import { Zap, Hash, ShieldCheck } from "lucide-react";
import { RevealSection } from "./RevealSection";

const features = [
  {
    icon: Zap,
    title: "Real-time Messaging",
    description:
      "WebSocket-powered delivery with sub-100ms latency. Every keystroke, every message — instantly.",
    iconWrapClass: "bg-amber-400/10 border-amber-400/20",
    iconClass: "text-amber-400",
    hoverGlow: "from-amber-400/[0.06]",
  },
  {
    icon: Hash,
    title: "Organized Channels",
    description:
      "Structure conversations by topic, team, or project. Scale from 2 people to 200 seamlessly.",
    iconWrapClass: "bg-brand-accent/10 border-brand-accent/20",
    iconClass: "text-brand-accent",
    hoverGlow: "from-brand-accent/[0.06]",
  },
  {
    icon: ShieldCheck,
    title: "Robust Security",
    description:
      "HTTP-only cookies, bcrypt hashing, and channel-level ACL built right into the core.",
    iconWrapClass: "bg-emerald-500/10 border-emerald-500/20",
    iconClass: "text-emerald-500",
    hoverGlow: "from-emerald-500/[0.06]",
  },
];

export function FeaturesGrid() {
  return (
    <section className="relative z-10 py-32 md:py-44 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <RevealSection className="text-center mb-20 md:mb-24">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] mb-8">
            Features
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight font-serif mb-6">
            Engineered for{" "}
            <span className="text-gradient bg-linear-to-r from-brand-accent to-brand-accent-soft">
              Power
            </span>
          </h2>
          <p className="text-white/30 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Enterprise performance meets boutique design sensibility.
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <RevealSection key={feature.title} delay={index * 150}>
                <div className="group relative bg-brand-surface/40 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-10 md:p-12 shadow-xl hover:shadow-2xl hover:border-white/[0.1] hover:-translate-y-2 transition-all duration-500 overflow-hidden w-full min-h-70">
                  {/* Hover glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${feature.hoverGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  {/* Border gradient reveal on hover */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border-gradient-reveal" />

                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border group-hover:scale-110 transition-transform duration-500 ${feature.iconWrapClass}`}
                    >
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
  );
}
