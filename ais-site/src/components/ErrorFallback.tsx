import { useRouter } from '@tanstack/react-router';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export function ErrorFallback({ error }: { error: Error }) {
  const router = useRouter();

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-brand-dark p-4 font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/6 blur-[140px]" />
      </div>

      <div className="bg-brand-muted/40 backdrop-blur-3xl border border-white/5 ring-1 ring-white/4 p-10 sm:p-14 rounded-[40px] max-w-md w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden z-10">
        
        {/* Subtle top light effect */}
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-red-500/5">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-3 font-serif text-balance">Something went wrong</h1>
        <p className="text-sm font-medium text-white/30 mb-8 leading-relaxed">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>
        
        <div className="w-full bg-brand-muted/40 rounded-xl p-4 text-left overflow-x-auto mb-8 border border-white/5">
          <code className="text-xs text-red-400/80 font-mono whitespace-pre-wrap break-all">
            {error.message}
          </code>
        </div>

        <button
          onClick={() => {
            router.invalidate();
            window.location.reload();
          }}
          className="w-full p-4 bg-brand-accent text-white rounded-2xl shadow-xl shadow-brand-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
        >
          <RefreshCcw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
}
