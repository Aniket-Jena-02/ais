import UserChannels from "../components/UserChannels";
import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="relative flex h-dvh overflow-hidden bg-brand-dark selection:bg-brand-accent/30">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-white/3 to-transparent" />
        <div className="absolute -left-32 top-12 h-72 w-72 rounded-full bg-brand-accent/7 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-brand-accent-soft/6 blur-[140px]" />
      </div>

      <UserChannels />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-linear-to-b from-transparent via-white/10 to-transparent" />
        <main className="relative flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
