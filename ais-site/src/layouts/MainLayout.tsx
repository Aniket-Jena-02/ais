import { useState } from "react";
import UserChannels from "../components/UserChannels";
import { Hash } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar */}
      <div className="flex flex-col">
        {/* Channels Sidebar */}
        <UserChannels
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
