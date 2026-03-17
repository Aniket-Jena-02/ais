import MainLayout from "#/layouts/MainLayout";
import { createFileRoute } from "@tanstack/react-router";
import { Hash } from "lucide-react";

export const Route = createFileRoute("/channels/")({ component: Component });

function Component() {
  return (
    <MainLayout>
      <div className="h-full flex items-center justify-center p-8 bg-base-100 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--p),0.03),transparent_50%)] pointer-events-none" />

        <div className="text-center max-w-2xl relative z-10 animate-in fade-in zoom-in duration-700">
          <div className="flex justify-center mb-6">
            <div className="bg-base-200/50 p-6 rounded-full border border-base-content/5 shadow-inner">
              <Hash size={48} className="text-base-content/20" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 tracking-tight text-base-content/80">
            Welcome to Dashboard
          </h2>
          <p className="text-base-content/50 mb-8 font-medium">
            Select a channel from the sidebar to start chatting or create a new one.
          </p>

          <div className="bg-base-200/60 backdrop-blur-md rounded-2xl border border-base-content/5 shadow-xl p-8 text-left max-w-md mx-auto">
             <h3 className="font-bold text-lg mb-4 text-base-content/80">Getting Started</h3>
             <ul className="space-y-4">
               <li className="flex items-center gap-4 group">
                 <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-content transition-all">1</div>
                 <span className="text-sm font-medium text-base-content/70">Create or join a channel using the sidebar</span>
               </li>
               <li className="flex items-center gap-4 group">
                 <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-content transition-all">2</div>
                 <span className="text-sm font-medium text-base-content/70">Invite members to your channel</span>
               </li>
               <li className="flex items-center gap-4 group">
                 <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-content transition-all">3</div>
                 <span className="text-sm font-medium text-base-content/70">Start messaging seamlessly in real-time</span>
               </li>
             </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
