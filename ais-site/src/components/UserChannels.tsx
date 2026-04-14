import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Hash, Loader2, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import UserProfileFooter from "./UserProfileFooter";
import CreateChannelModal from "./CreateChannelModal";
import { useLocalStorageState } from "ahooks";

interface CollapsedTooltipState {
  text: string;
  left: number;
  top: number;
}

interface UserChannel {
  _id: string;
  name: string;
  createdAt: string;
  unreadCount: number;
}

const UserChannels = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsedTooltip, setCollapsedTooltip] = useState<CollapsedTooltipState | null>(null);

  const [isCollapsed, setIsCollapsed] = useLocalStorageState("user-channels-collapsed", {
    defaultValue: false,
  });

  const tooltipAnchorRef = useRef<HTMLElement | null>(null);
  const {
    data: channels,
    isLoading,
    isError,
    refetch,
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

      return (await res.json()) as UserChannel[];
    },
  });

  const channelCount = channels?.length ?? 0;
  const sidebarWidthClass = isCollapsed ? "w-16" : "w-[280px]";
  const formatUnreadCount = (count: number) => count > 99 ? "99+" : count.toString();

  const hideCollapsedTooltip = useCallback(() => {
    tooltipAnchorRef.current = null;
    setCollapsedTooltip(null);
  }, []);

  const showCollapsedTooltip = useCallback((text: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    tooltipAnchorRef.current = element;
    setCollapsedTooltip({
      text,
      left: rect.right + 14,
      top: rect.top + rect.height / 2,
    });
  }, []);

  useEffect(() => {
    if (!isCollapsed) {
      hideCollapsedTooltip();
    }
  }, [hideCollapsedTooltip, isCollapsed]);

  useEffect(() => {
    if (!collapsedTooltip || !tooltipAnchorRef.current) return;

    const updatePosition = () => {
      const element = tooltipAnchorRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      setCollapsedTooltip((prev) =>
        prev
          ? {
            ...prev,
            left: rect.right + 14,
            top: rect.top + rect.height / 2,
          }
          : prev,
      );
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [collapsedTooltip]);

  // Loading State
  if (isLoading) {
    return (
      <div className={`${sidebarWidthClass} h-full shrink-0 bg-brand-surface/50 flex items-center justify-center border-r border-white/4`}>
        <Loader2 className="w-6 h-6 animate-spin text-brand-accent opacity-50" />
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className={`${sidebarWidthClass} h-full shrink-0 bg-brand-surface/50 border-r border-white/4 p-4 flex flex-col justify-center items-center text-center gap-4`}>
        <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
          <Hash size={24} />
        </div>
        <div>
          <h3 className="font-bold text-white/80 text-sm">Failed to load</h3>
          <p className="text-xs text-white/40 mt-1">Could not connect to server</p>
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-full border border-white/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45 transition-all duration-200 hover:border-white/12 hover:bg-white/5 hover:text-white/70"
        >
          Retry
        </button>
      </div>
    );
  }

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

      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`h-16 border-b border-white/4 shrink-0 bg-brand-surface/70 backdrop-blur-md sticky top-0 z-10 ${isCollapsed ? 'flex items-center justify-center px-5' : 'flex items-center justify-between px-5'}`}
      >
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-90"
            title="Expand Sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-90"
                title="Collapse Sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="min-w-0"
              >
                <h2 className="text-lg font-black text-white font-serif tracking-tight truncate">
                  Channels
                </h2>
              </motion.div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 hover:rotate-90 active:scale-90 shrink-0"
              title="Create channel"
              aria-label="Create channel"
            >
              <Plus size={18} />
            </button>
          </>
        )}
      </motion.div>

      {/* Channel List */}
      <div className={`flex-1 overflow-y-auto scrollbar-hide ${isCollapsed ? 'p-3' : 'px-3 pb-3 pt-3'}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-2"
        >
          {!isCollapsed && channelCount > 0 && (
            <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.22em] text-white/28 whitespace-nowrap">
              {channelCount} Joined Channels
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {channels?.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`py-8 text-center px-4 ${isCollapsed ? "px-0" : ""}`}
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Hash size={20} className="text-white/10" />
                </div>
                {!isCollapsed && (
                  <>
                    <p className="text-xs text-white/30 font-medium">No channels yet</p>
                    <p className="text-[10px] text-white/15 mt-1">Create one to get started</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 rounded-full border border-white/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45 transition-all duration-200 hover:border-white/12 hover:bg-white/5 hover:text-white/70"
                    >
                      New Channel
                    </button>
                  </>
                )}
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
                  {isCollapsed ? (
                    <Link
                      to="/channels/$channelId"
                      params={{ channelId: channel._id }}
                      aria-label={channel.name}
                      onMouseEnter={(event) => showCollapsedTooltip(channel.name, event.currentTarget)}
                      onFocus={(event) => showCollapsedTooltip(channel.name, event.currentTarget)}
                      onMouseLeave={hideCollapsedTooltip}
                      onBlur={hideCollapsedTooltip}
                      onClick={hideCollapsedTooltip}
                      className="group relative flex items-center justify-center px-3 py-2.5 rounded-xl text-[14px] font-medium tracking-tight transition-all duration-200"
                      activeProps={{
                        className: "bg-white/6 text-white shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
                      }}
                      inactiveProps={{
                        className: "text-white/40 hover:bg-white/3 hover:text-white/70"
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
                          <AnimatePresence>
                            {channel.unreadCount > 0 && (
                              <motion.div
                                initial={{ scale: 0.5, opacity: 0, y: 5 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.5, opacity: 0, y: -5 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute -right-1.5 -top-1.5 z-10"
                              >
                                <span className="inline-flex min-w-[16px] h-[16px] items-center justify-center rounded border-[1.5px] border-brand-surface bg-brand-accent px-1 text-[9px] font-black tracking-tighter text-white tabular-nums">
                                  {formatUnreadCount(channel.unreadCount)}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </Link>
                  ) : (
                    <Link
                      to="/channels/$channelId"
                      params={{ channelId: channel._id }}
                      className="group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium tracking-tight transition-all duration-200"
                      activeProps={{
                        className: "bg-white/6 text-white shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
                      }}
                      inactiveProps={{
                        className: "text-white/40 hover:bg-white/3 hover:text-white/70"
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
                          <AnimatePresence>
                            {channel.unreadCount > 0 && (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0, x: -5 }}
                                animate={{ scale: 1, opacity: 1, x: 0 }}
                                exit={{ scale: 0.8, opacity: 0, x: 5 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="ml-auto flex items-center shrink-0"
                              >
                                <span className="inline-flex min-w-[20px] items-center justify-center rounded bg-brand-accent px-1.5 py-[3px] text-[10px] font-black tracking-tighter text-white tabular-nums">
                                  {formatUnreadCount(channel.unreadCount)}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </Link>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer (User Profile) */}
      <UserProfileFooter isCollapsed={isCollapsed} />

      {/* Create Channel Modal */}
      <CreateChannelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {collapsedTooltip && typeof document !== "undefined" && createPortal(
        <div
          className="pointer-events-none fixed z-200 -translate-y-1/2 rounded-box border border-white/8 bg-brand-surface/95 px-3 py-2 text-[11px] font-bold tracking-[0.04em] text-white shadow-xl shadow-black/30"
          style={{
            left: collapsedTooltip.left,
            top: collapsedTooltip.top,
          }}
        >
          {collapsedTooltip.text}
        </div>,
        document.body,
      )}
    </motion.div>
  );
};

export default UserChannels;
