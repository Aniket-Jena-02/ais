import MainLayout from "#/layouts/MainLayout";
import { createFileRoute } from "@tanstack/react-router";
import { Hash } from "lucide-react";

export const Route = createFileRoute("/channels/")({ component: Component });

function Component() {
  return (
    <MainLayout>
      <div className="h-full flex items-center justify-center p-8 bg-brand-dark relative overflow-hidden">
        <div className="text-center max-w-2xl relative z-10 animate-in fade-in zoom-in duration-700">
          <div className="flex justify-center mb-10">
            <div className="bg-white/5 p-8 rounded-full border border-white/5 shadow-inner">
              <Hash size={64} className="text-white/10" />
            </div>
          </div>
          
          <h2 className="text-4xl font-black mb-4 tracking-tight text-white font-serif">
            Welcome to Dashboard
          </h2>
          <p className="text-white/30 mb-12 font-medium max-w-md mx-auto leading-relaxed">
            Select a channel from the sidebar to start chatting or create a new one to begin your journey.
          </p>

          <div className="bg-brand-muted/20 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl p-10 text-left max-w-md mx-auto">
             <h3 className="font-black text-[12px] uppercase tracking-[0.2em] mb-6 text-white/40">Getting Started</h3>
             <ul className="space-y-6">
               <li className="flex items-center gap-5 group">
                 <div className="w-9 h-9 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-brand-accent/5 group-hover:scale-110 group-hover:bg-brand-accent group-hover:text-white transition-all duration-300">1</div>
                 <span className="text-[14px] font-medium text-white/60 leading-tight">Create or join a channel using the sidebar</span>
               </li>
               <li className="flex items-center gap-5 group">
                 <div className="w-9 h-9 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-brand-accent/5 group-hover:scale-110 group-hover:bg-brand-accent group-hover:text-white transition-all duration-300">2</div>
                 <span className="text-[14px] font-medium text-white/60 leading-tight">Invite members to your channel and build your community</span>
               </li>
               <li className="flex items-center gap-5 group">
                 <div className="w-9 h-9 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-brand-accent/5 group-hover:scale-110 group-hover:bg-brand-accent group-hover:text-white transition-all duration-300">3</div>
                 <span className="text-[14px] font-medium text-white/60 leading-tight">Start messaging seamlessly with ultra-low latency</span>
               </li>
             </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
