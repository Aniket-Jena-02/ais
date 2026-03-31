import MainLayout from "#/layouts/MainLayout";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Hash } from "lucide-react";

export const Route = createFileRoute("/channels/")({
  head: () => ({
    title: "Ether Chat | Channels",
    meta: [
      { property: "og:title", content: "Ether Chat | Channels" },
      { property: "og:description", content: "Ether Chat" },
      { property: "og:image", content: "/favicon.png" },
    ],
  }),
  component: Component,
  beforeLoad: async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API}/auth/me`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unauthorized");
    } catch {
      throw redirect({ to: "/login" });
    }
  },
});

function Component() {
  return (
    <MainLayout>
      <div className="relative flex h-full items-center justify-center overflow-hidden bg-brand-dark p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-12 h-64 w-64 rounded-full bg-brand-accent/8 blur-[120px]" />
          <div className="absolute bottom-0 right-8 h-80 w-80 rounded-full bg-brand-accent-soft/6 blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-2xl text-center animate-in fade-in zoom-in duration-700">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
            <span className="h-2 w-2 rounded-full bg-brand-accent shadow-[0_0_10px_rgba(212,78,40,0.45)]" />
            Workspace Ready
          </div>

          <div className="flex justify-center mb-10">
            <div className="flex flex-col items-center justify-center h-full text-white/10 animate-in fade-in zoom-in duration-1000">
              <div className="bg-white/2 p-5 rounded-full mb-8 border border-white/5 shadow-inner">
                <Hash size={64} />
              </div>

            </div>
          </div>

          <h2 className="text-4xl font-black mb-4 tracking-tight text-white font-serif text-balance">
            Welcome to Dashboard
          </h2>
          <p className="text-white/30 mb-12 font-medium max-w-md mx-auto leading-relaxed text-balance">
            Select a channel from the sidebar to start chatting, or use the plus button to create a new space for your team.
          </p>

          <div className="bg-brand-surface/40 backdrop-blur-md rounded-2xl border border-white/5 ring-1 ring-white/4 shadow-2xl p-10 text-left max-w-md mx-auto">
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
