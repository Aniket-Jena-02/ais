import { useEffect, useMemo, useState } from "react";

interface TypingIndicatorProps {
  typingUsers: [string, string][];
  maxNamesShown?: number;
  className?: string;
  exitDurationMs?: number;
  align?: "start" | "end";
}

function getTypingLabelParts(users: [string, string][], maxNamesShown: number) {
  const names = users.map((u) => u[1]);
  const shown = names.slice(0, maxNamesShown);
  const remaining = names.length - shown.length;
  const verb = users.length === 1 ? "is typing" : "are typing";

  return {
    namesText: shown.join(", "),
    suffixText:
      remaining > 0
        ? `and ${remaining} other${remaining === 1 ? "" : "s"} ${verb}`
        : verb,
  };
}

export function TypingIndicator({
  typingUsers,
  maxNamesShown = 2,
  className = "",
  exitDurationMs = 150,
  align = "start",
}: TypingIndicatorProps) {
  const isTyping = typingUsers.length > 0;

  const [shouldRender, setShouldRender] = useState(isTyping);

  useEffect(() => {
    if (isTyping) {
      setShouldRender(true);
      return;
    }
    const timeout = setTimeout(() => setShouldRender(false), exitDurationMs);
    return () => clearTimeout(timeout);
  }, [isTyping, exitDurationMs]);

  const { namesText, suffixText } = useMemo(
    () => getTypingLabelParts(typingUsers, maxNamesShown),
    [typingUsers, maxNamesShown]
  );

  if (!shouldRender) return null;

  return (
    <div
      className={`pointer-events-none z-10 flex px-3 pb-1 md:px-6 bg-transparent ${
        align === "end" ? "justify-end" : "justify-start"
        } ${className}`}
    >
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-state={isTyping ? "enter" : "exit"}
        className="pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-full border-2 border-brand-accent/20 bg-black/20 backdrop-blur-sm px-3 py-1.5 text-[11px] text-white/40 transition-all duration-150 ease-out data-[state=enter]:opacity-100 data-[state=enter]:translate-y-0 data-[state=exit]:opacity-0 data-[state=exit]:translate-y-1"
      >
        <span className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-brand-accent"
              style={{
                animation: "typing-wave 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </span>

        <span className="truncate">
          <span className="font-semibold text-white/70">{namesText}</span>{" "}
          {suffixText}
        </span>
      </div>
    </div>
  );
}
