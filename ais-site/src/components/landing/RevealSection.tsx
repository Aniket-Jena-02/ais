import { useRef } from "react";
import { useInViewport } from "ahooks";

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Distance in pixels the element slides up from */
  distance?: number;
}

export function RevealSection({
  children,
  className = "",
  delay = 0,
  distance = 48,
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inViewport] = useInViewport(ref, { threshold: 0.12 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        inViewport
          ? "opacity-100 translate-y-0"
          : "opacity-0"
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transform: inViewport ? "translateY(0)" : `translateY(${distance}px)`,
      }}
    >
      {children}
    </div>
  );
}
