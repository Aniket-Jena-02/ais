import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Hash, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  });

  // Loading State
  if (isLoading) {
    return (
      <div className="w-64 h-full bg-brand-dark flex items-center justify-center border-r border-white/5">
        <Loader2 className="w-6 h-6 animate-spin text-brand-accent opacity-50" />
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="w-64 h-full bg-brand-dark border-r border-white/5 p-4 flex flex-col justify-center items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
          <Hash size={24} />
        </div>
        <div>
          <h3 className="font-bold text-white/80 text-sm">Failed to load</h3>
          <p className="text-xs text-white/40 mt-1">Could not connect to server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-64 h-full bg-brand-dark border-r border-white/5 relative z-50">
      
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="h-14 flex items-center justify-between px-6 border-b border-white/5 shrink-0 bg-brand-dark backdrop-blur-md sticky top-0 z-10"
      >
        <h2 className="text-lg font-black text-white font-serif tracking-tight">
          Channels
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 hover:rotate-90 active:scale-90"
        >
          <Plus size={18} />
        </button>
      </motion.div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-0.5"
        >
          <AnimatePresence mode="popLayout">
            {channels?.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-8 text-center px-4"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Hash size={20} className="text-white/10" />
                </div>
                <p className="text-xs text-white/30 font-medium">No channels yet</p>
                <p className="text-[10px] text-white/15 mt-1">Create one to get started</p>
              </motion.div>
            ) : (
              channels?.map((channel, index) => (
                <motion.div
                  key={channel._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.04,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  layout
                >
                  <Link
                    to="/channels/$channelId"
                    params={{ channelId: channel._id }}
                    className="group relative flex items-center gap-2.5 px-3 py-2 rounded-md text-[14px] font-medium tracking-tight transition-all duration-200"
                    activeProps={{
                      className: "bg-white/5 text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                    }}
                    inactiveProps={{
                      className: "text-white/40 hover:bg-white/[0.02] hover:text-white/70"
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="channel-indicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-1/2 bg-brand-accent rounded-full"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        <Hash size={16} className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-brand-accent' : 'text-white/20 group-hover:text-white/40'}`} />
                        <span className="truncate">{channel.name}</span>
                      </>
                    )}
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer (User Profile) */}
      <UserProfileFooter />

      {/* Create Channel Modal */}
      <CreateChannelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default UserChannels;
