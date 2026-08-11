import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { User, Crown, Hash, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { toast } from "sonner";
import ConfirmDialog from "../forms-and-dialogs/ConfirmDialog";

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
  isAdmin?: boolean;
  currentUserId?: string;
  onClose?: () => void;
}

export default function MembersPanel({ channelId, isOpen, socket, isAdmin = false, currentUserId, onClose }: MembersPanelProps) {
  const queryClient = useQueryClient();
  const [pendingKick, setPendingKick] = useState<{ _id: string; name: string } | null>(null);

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
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-20 bg-black/35 backdrop-blur-sm lg:hidden"
            aria-label="Close member list"
          />

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-30 flex h-full w-72 max-w-[calc(100vw-1rem)] flex-col overflow-hidden border-l border-white/4 bg-brand-surface/35 backdrop-blur-xl lg:static lg:z-20 lg:max-w-none lg:shrink-0 lg:w-60"
          >
            {/* Header */}
            <div className="sticky top-0 flex h-12 shrink-0 items-center justify-between border-b border-white/4 bg-brand-surface/45 px-3 backdrop-blur-md">
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">
                  Members
                </h3>
                <p className="mt-0.5 text-[10px] font-medium text-white/25">
                  {members?.length ?? 0} total{onlineMembers.length > 0 ? ` • ${onlineMembers.length} online` : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg border border-transparent p-1.5 text-white/35 transition-all duration-200 hover:border-white/6 hover:bg-white/5 hover:text-white/70"
                aria-label="Close member list"
                title="Close member list"
              >
                <X size={13} />
              </button>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
              {isLoading || !members ? (
                <div className="flex h-32 flex-col items-center justify-center opacity-30">
                  <Hash size={26} className="mt-8 animate-pulse text-white" />
                </div>
              ) : members.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center px-5 text-center">
                  <div className="mb-3 rounded-full border border-white/6 bg-white/4 p-2.5">
                    <User size={17} className="text-white/30" />
                  </div>
                  <p className="text-[13px] font-semibold text-white/45">No members yet</p>
                  <p className="mt-1 text-[11px] text-white/22">Invite people to see presence and access here.</p>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
                    hidden: {}
                  }}
                  className="space-y-7"
                >
                  {/* Online Group */}
                  {onlineMembers.length > 0 && (
                    <div>
                      <h4 className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/20 mb-3 px-1.5">
                        Online — {onlineMembers.length}
                      </h4>
                      <div className="space-y-0.5">
                        {onlineMembers.map((member) => (
                          <MemberItem key={member._id + "-online"} member={member} isAdmin={isAdmin} currentUserId={currentUserId} onKick={() => setPendingKick(member)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Offline Group */}
                  {offlineMembers.length > 0 && (
                    <div>
                      <h4 className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/20 mb-3 px-1.5">
                        Offline — {offlineMembers.length}
                      </h4>
                      <div className="space-y-0.5">
                        {offlineMembers.map((member) => (
                          <MemberItem key={member._id + "-offline"} member={member} isAdmin={isAdmin} currentUserId={currentUserId} onKick={() => setPendingKick(member)} />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.aside>
        </>
      )}

      {/* Kick Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!pendingKick}
        title="Remove Member"
        description={`Are you sure you want to remove ${pendingKick?.name ?? "this member"} from the channel? They will need to be re-invited to rejoin.`}
        confirmLabel="Remove"
        cancelLabel="Keep"
        onConfirm={async () => {
          if (!pendingKick) return;
          try {
            const res = await fetch(`${import.meta.env.VITE_API}/channels/${channelId}/members/${pendingKick._id}`, {
              method: "DELETE",
              credentials: "include",
            });
            if (!res.ok) {
              const data = await res.json();
              toast.error(data.msg || "Failed to remove member");
            } else {
              queryClient.setQueryData<{ _id: string; name: string; status: string; role: string }[]>(
                ["members", channelId],
                (prev) => prev ? prev.filter((m) => m._id !== pendingKick._id) : prev
              );
              toast.success(`${pendingKick.name} removed from channel`);
            }
          } catch {
            toast.error("Failed to remove member");
          } finally {
            setPendingKick(null);
          }
        }}
        onCancel={() => setPendingKick(null)}
      />
    </AnimatePresence>
  );
}

function MemberItem({ member, isAdmin, currentUserId, onKick }: {
  member: Member;
  isAdmin: boolean;
  currentUserId?: string;
  onKick?: () => void;
}) {
  const isOnline = member.status === "online";
  const canKick = isAdmin && member.role !== "admin" && member._id !== currentUserId;

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
      className={`group flex items-center gap-2.5 px-1.5 py-1.5 rounded-lg hover:bg-white/4 transition-all duration-300 cursor-default ${!isOnline ? "opacity-40 hover:opacity-80" : ""}`}
    >
      <div className="relative shrink-0">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black group-hover:scale-[1.15] group-hover:-rotate-3 transition-transform duration-500 ring-1 ring-inset ring-white/10 ${colorClass}`}>
          {member.name ? member.name.charAt(0).toUpperCase() : <User size={12} />}
        </div>
        {/* Online pip */}
        <motion.div
          animate={{
            backgroundColor: isOnline ? "rgb(16,185,129)" : "transparent",
            borderColor: isOnline ? "transparent" : "rgba(255,255,255,0.2)",
            boxShadow: isOnline ? "0 0 8px rgba(16,185,129,0.5)" : "none",
          }}
          transition={{ duration: 0.4 }}
          className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full border-2 border-brand-dark"
        />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-black tracking-tight text-white/80 truncate">
            {member.name}
          </span>
          {member.role === "admin" && (
            <span className="text-amber-400 bg-amber-500/10 p-0.5 rounded shrink-0" title="Admin">
              <Crown size={9} strokeWidth={3} />
            </span>
          )}
        </div>
      </div>
      {canKick && (
        <button
          onClick={onKick}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
          title={`Remove ${member.name}`}
        >
          <X size={12} />
        </button>
      )}
    </motion.div>
  );
}
