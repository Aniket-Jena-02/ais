import { Hash } from "lucide-react";
import { RevealSection } from "./RevealSection";

const typingDotDelays = [0, 150, 300];

export function AppPreview() {
  return (
    <section className="relative z-10 -mt-10 px-4 md:px-8 pb-36">
      <RevealSection>
        <div className="max-w-6xl mx-auto relative">
          {/* Glow effect behind mockup */}
          <div className="absolute inset-0 bg-brand-accent/[0.04] rounded-[2rem] filter blur-[60px] scale-95" />

          <div className="relative aspect-16/10 sm:aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/[0.06] bg-brand-dark flex ring-1 ring-white/[0.03]">
            {/* Mock Sidebar */}
            <div className="w-1/4 bg-brand-surface/80 border-r border-white/[0.04] hidden md:flex flex-col">
              {/* Sidebar header */}
              <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <div className="h-4 w-20 bg-white/10 rounded-full" />
                <div className="w-5 h-5 rounded bg-white/[0.04]" />
              </div>
              {/* Channel list */}
              <div className="p-3 space-y-1 flex-1">
                {["general", "design", "engineering", "random"].map(
                  (name, i) => (
                    <div
                      key={name}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${
                        i === 0
                          ? "bg-white/[0.06] text-white/60"
                          : "text-white/20"
                      }`}
                    >
                      <Hash
                        size={13}
                        className={
                          i === 0 ? "text-brand-accent" : "text-white/15"
                        }
                      />
                      <div
                        className="h-2.5 rounded-full bg-current"
                        style={{
                          width: `${name.length * 8}px`,
                          opacity: 0.6,
                        }}
                      />
                    </div>
                  ),
                )}
              </div>
              {/* User at bottom */}
              <div className="px-4 py-3 border-t border-white/[0.04] flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-accent/30" />
                <div className="h-2.5 w-16 bg-white/10 rounded-full" />
              </div>
            </div>

            {/* Mock Main Area */}
            <div className="flex-1 bg-brand-dark flex flex-col">
              {/* Channel header */}
              <div className="h-14 border-b border-white/[0.04] flex items-center px-6">
                <Hash size={16} className="text-white/15 mr-2" />
                <div className="h-4 w-24 bg-white/10 rounded-full" />
              </div>

              {/* Messages */}
              <div className="flex-1 px-6 py-6 space-y-6">
                {/* Message 1 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-28 bg-white/20 rounded-full" />
                      <div className="h-2 w-12 bg-white/[0.06] rounded-full" />
                    </div>
                    <div className="h-3.5 w-3/4 bg-white/10 rounded-full" />
                    <div className="h-3.5 w-1/2 bg-white/[0.06] rounded-full" />
                  </div>
                </div>

                {/* Message 2 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-accent/30 shrink-0 shadow-lg shadow-brand-accent/10" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-20 bg-brand-accent/40 rounded-full" />
                      <div className="h-2 w-12 bg-white/[0.06] rounded-full" />
                    </div>
                    <div className="h-3.5 w-2/3 bg-white/15 rounded-full" />
                  </div>
                </div>

                {/* Message 3 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-32 bg-white/15 rounded-full" />
                      <div className="h-2 w-12 bg-white/[0.06] rounded-full" />
                    </div>
                    <div className="h-3.5 w-4/5 bg-white/[0.08] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Typing indicator */}
              <div className="px-6 pb-2">
                <div className="flex items-center gap-2 text-white/15">
                  <div className="flex gap-1">
                    {typingDotDelays.map((delayMs) => (
                      <div
                        key={delayMs}
                        className="w-1 h-1 rounded-full bg-current animate-pulse"
                        style={{ animationDelay: `${delayMs}ms` }}
                      />
                    ))}
                  </div>
                  <div className="h-2 w-24 bg-white/[0.04] rounded-full" />
                </div>
              </div>

              {/* Input */}
              <div className="px-4 pb-4">
                <div className="h-12 w-full bg-brand-surface/60 border border-white/[0.04] rounded-xl flex items-center px-4">
                  <div className="h-2.5 w-1/3 bg-white/[0.06] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
    </section>
  );
}
