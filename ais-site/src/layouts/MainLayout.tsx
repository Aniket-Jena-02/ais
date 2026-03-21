import UserChannels from "../components/UserChannels";
import type { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-brand-dark selection:bg-brand-accent/30 overflow-hidden">
      {/* Sidebar - The UserChannels handles its own width/bg now */}
      <UserChannels />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-hidden relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
