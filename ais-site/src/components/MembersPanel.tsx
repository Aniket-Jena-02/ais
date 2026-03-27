import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { User, Crown, Hash } from "lucide-react";
import { useEffect } from "react";
import type { Socket } from "socket.io-client";

interface Member {
  _id: string;
  name: string;
  status: "online" | "offline";
  role: "admin" | "member";
}

interface MembersPanelProps {
  channelId: string;
  isOpen: boolean;
  socket: Socket | null;
}

export default function MembersPanel({ channelId, isOpen, socket }: MembersPanelProps) {
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", channelId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API}/channels/${channelId}/members`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch members");
      return await res.json() as Member[];
    },
    enabled: isOpen, // only fetch when panel is visible
  });

  // Listen for real-time presence updates from the socket
  useEffect(() => {
    if (!socket) return;

    const handlePresence = (data: { userId: string; status: "online" | "offline" }) => {
      queryClient.setQueryData<Member[]>(["members", channelId], (prev) => {
        if (!prev) return prev;
        const updated = prev.map((m) =>
          m._id === data.userId ? { ...m, status: data.status } : m
        );
        // Re-sort: online first, then alpha
        return [...updated].sort((a, b) => {
          if (a.status !== b.status) return a.status === "online" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      });
    };

    socket.on("user_presence", handlePresence);
    return () => { socket.off("user_presence", handlePresence); };
  }, [socket, channelId, queryClient]);

  const onlineMembers = members?.filter((m) => m.status === "online") ?? [];
  const offlineMembers = members?.filter((m) => m.status === "offline") ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-brand-surface/30 border-l border-white/4 flex flex-col relative z-20 shrink-0 overflow-hidden backdrop-blur-xl"
        >
          {/* Header */}
          <div className="h-14 flex items-center px-6 border-b border-white/4 shrink-0 top-0 sticky bg-brand-surface/40 backdrop-blur-md">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
              Members — {members?.length ?? 0}
            </h3>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide">
            {isLoading || !members ? (
              <div className="flex flex-col items-center justify-center h-40 opacity-30">
                <Hash size={32} className="animate-pulse text-white mt-10" />
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
                  hidden: {}
                }}
                className="space-y-10"
              >
                {/* Online Group */}
                {onlineMembers.length > 0 && (
                  <div>
                    <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 mb-4 px-2">
                      Online — {onlineMembers.length}
                    </h4>
                    <div className="space-y-0.5">
                      {onlineMembers.map((member) => (
                        <MemberItem key={member._id} member={member} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Offline Group */}
                {offlineMembers.length > 0 && (
                  <div>
                    <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 mb-4 px-2">
                      Offline — {offlineMembers.length}
                    </h4>
                    <div className="space-y-0.5">
                      {offlineMembers.map((member) => (
                        <MemberItem key={member._id} member={member} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MemberItem({ member }: { member: Member }) {
  const isOnline = member.status === "online";

  const colors = [
    "bg-red-500/10 text-red-500",
    "bg-blue-500/10 text-blue-500",
    "bg-emerald-500/10 text-emerald-500",
    "bg-purple-500/10 text-purple-500",
    "bg-amber-500/10 text-amber-500",
    "bg-pink-500/10 text-pink-500",
    "bg-indigo-500/10 text-indigo-500",
  ];
  const colorIndex = member.name ? member.name.length % colors.length : 0;
  const colorClass = colors[colorIndex];

  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, x: 12 },
        visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
      }}
      className={`group flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/4 transition-all duration-300 cursor-default ${!isOnline ? "opacity-40 hover:opacity-80" : ""}`}
    >
      <div className="relative shrink-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black group-hover:scale-[1.15] group-hover:-rotate-3 transition-transform duration-500 ring-1 ring-inset ring-white/10 ${colorClass}`}>
          {member.name ? member.name.charAt(0).toUpperCase() : <User size={14} />}
        </div>
        {/* Online pip */}
        <motion.div
          animate={{
            backgroundColor: isOnline ? "rgb(16,185,129)" : "transparent",
            borderColor: isOnline ? "transparent" : "rgba(255,255,255,0.2)",
            boxShadow: isOnline ? "0 0 8px rgba(16,185,129,0.5)" : "none",
          }}
          transition={{ duration: 0.4 }}
          className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-[2.5px] border-brand-dark"
        />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-black tracking-tight text-white/80 truncate">
            {member.name}
          </span>
          {member.role === "admin" && (
            <span className="text-amber-400 bg-amber-500/10 p-[3px] rounded shrink-0" title="Admin">
              <Crown size={10} strokeWidth={3} />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
