import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Hash, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import UserProfileFooter from "./UserProfileFooter";
import CreateChannelModal from "./CreateChannelModal";

const UserChannels = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    data: channels,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-channels"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API}/channels/user`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch channels");
      }

      return (await res.json()) as {
        _id: string;
        name: string;
        createdAt: string;
      }[];
    },
  })

  // Loading State
  if (isLoading) {
    return (
      <div className="w-64 h-full bg-base-200 flex items-center justify-center border-r border-base-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
        <Loader2 className="w-6 h-6 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="w-64 h-full bg-base-200 border-r border-base-300 p-4 flex flex-col justify-center items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error">
          <Hash size={24} />
        </div>
        <div>
          <h3 className="font-bold text-base-content/80 text-sm">Failed to load</h3>
          <p className="text-xs text-base-content/50 mt-1">Could not connect to server</p>
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className="flex flex-col w-64 h-full bg-base-200 border-r border-base-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] relative z-20">
      
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-base-300 shadow-sm shrink-0 bg-base-200/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-sm font-black text-base-content uppercase tracking-widest flex items-center gap-2">
          Channels
        </h2>
        <button 
          aria-label="Create new channel"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-base-content hover:bg-base-300 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-thin scrollbar-thumb-base-content/10 scrollbar-track-transparent">
        
        {channels?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4 mt-10">
            <div className="w-12 h-12 rounded-2xl bg-base-300 flex items-center justify-center mb-3 shadow-inner">
              <Hash size={24} className="opacity-20" />
            </div>
            <div className="text-base-content/70 text-sm font-semibold">
              No channels yet
            </div>
            <div className="text-xs text-base-content/40 mt-1.5 leading-relaxed">
              Create your first channel to start chatting
            </div>
          </div>
        ) : (
          channels?.map((channel) => (
            <Link
              to={`/channels/$channelId`}
              params={{ channelId: channel._id }}
              key={channel._id}
              activeProps={{
                className: "bg-base-300/80 text-base-content font-semibold shadow-sm",
              }}
              inactiveProps={{
                className: "text-base-content/60 hover:bg-base-300/50 hover:text-base-content/90 font-medium"
              }}
              className="group flex flex-col justify-center px-3 py-2 rounded-lg transition-all duration-200 relative overflow-hidden"
            >
              {({ isActive }) => (
                <>
                  {/* Left accent bar when active */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full" />
                  )}
                  
                  <div className="flex items-center gap-2.5 relative z-10">
                    <Hash size={18} className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-base-content/30 group-hover:text-base-content/50'}`} />
                    <span className="truncate tracking-tight text-[15px]">{channel.name}</span>
                  </div>
                </>
              )}
            </Link>
          ))
        )}
      </div>

      {/* Footer (User Profile) */}
      <UserProfileFooter />

      {/* Create Channel Modal */}
      <CreateChannelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default UserChannels;
