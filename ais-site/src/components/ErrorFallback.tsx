import { useRouter } from '@tanstack/react-router';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export function ErrorFallback({ error }: { error: Error }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 p-4">
      <div className="bg-base-200 border border-base-300 p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-base-content mb-2">Something went wrong</h1>
        <p className="text-sm font-medium text-base-content/60 mb-6">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>
        
        <div className="w-full bg-base-300/50 rounded-xl p-4 text-left overflow-x-auto mb-6 border border-base-content/5">
          <code className="text-xs text-error font-mono whitespace-pre-wrap break-all">
            {error.message}
          </code>
        </div>

        <button
          onClick={() => {
            router.invalidate();
            window.location.reload();
          }}
          className="btn btn-primary w-full font-bold shadow-md"
        >
          <RefreshCcw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
}
