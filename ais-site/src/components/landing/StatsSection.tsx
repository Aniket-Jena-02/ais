import { useEffect, useRef } from "react";
import { useInViewport, useCounter } from "ahooks";

function AnimatedStat({
  end,
  suffix = "",
  label,
}: {
  end: number;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inViewport] = useInViewport(ref);
  const [count, { set }] = useCounter(0, { min: 0, max: end });
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!inViewport || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const durationMs = 900;
    const startTime = performance.now();

    let frameId: number;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      set(Math.round(progress * end));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };
    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [end, inViewport, set]);

  return (
    <div ref={ref} className="text-center group">
      <div className="text-5xl md:text-6xl font-black font-serif tracking-tight text-white tabular-nums">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/25 mt-3">
        {label}
      </div>
      {/* Accent bar */}
      <div className="mx-auto mt-4 h-px w-8 bg-brand-accent/20 group-hover:w-12 group-hover:bg-brand-accent/40 transition-all duration-500" />
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="relative z-10 py-24 md:py-32 px-4 md:px-8">
      {/* Gradient divider lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
        <AnimatedStat end={99} suffix="%" label="Uptime" />
        <AnimatedStat end={50} suffix="ms" label="Avg Latency" />
        <AnimatedStat end={10000} suffix="+" label="Messages / Day" />
        <AnimatedStat end={256} suffix="-bit" label="Encryption" />
      </div>
    </section>
  );
}
