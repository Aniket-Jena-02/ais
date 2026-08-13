import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const UserProfileFooter = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API}/auth/me`, {
        credentials: "include"
      })
      return await res.json() as { userName: string, userId: string, msg?: string }
    },
    queryKey: ["user"]
  })
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch(`${import.meta.env.VITE_API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } finally {
      queryClient.clear()
      navigate({ to: "/login" })
    }
  }

  // Fallback while loading — avatar sized to match the loaded state (w-7 h-7)
  // so there's no layout jump the moment the query resolves.
  if (isLoading || !data?.userName) {
    return (
      <div className={`p-3 border-t border-white/4 bg-brand-dark shrink-0 mt-auto flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
        <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? '' : 'flex-1'} opacity-50`}>
          <div className="w-7 h-7 shrink-0 rounded-lg bg-white/5 animate-pulse" />
          {!isCollapsed && <div className="h-2.5 w-16 bg-white/5 animate-pulse rounded" />}
        </div>
        {!isCollapsed && <div className="w-7 h-7 rounded-lg bg-white/5 animate-pulse shrink-0" />}
      </div>
    );
  }

  const firstLetter = data.userName.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      className={`p-2.5 border-t border-white/4 bg-brand-surface/30 shrink-0 mt-auto flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-1.5`}
    >
      <div className={`group flex items-center gap-2 min-w-0 ${isCollapsed ? '' : 'flex-1'} hover:bg-white/5 p-1 ${isCollapsed ? '' : '-ml-1'} rounded-lg cursor-pointer transition-all duration-200`}>
        <div className="relative">
          <div className="w-7 h-7 shrink-0 rounded-lg bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/20 text-white font-black text-[11px] ring-1 ring-inset ring-white/20">
            {firstLetter}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-brand-surface bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]" />
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex flex-col min-w-0"
          >
            <span className="text-[12px] font-black tracking-tight truncate text-white leading-tight">{data.userName}</span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-white/20">Signed in</span>
          </motion.div>
        )}
      </div>
      {!isCollapsed && (
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Log out"
          aria-label="Log out"
          className="p-1 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 shrink-0 disabled:opacity-50"
        >
          <LogOut size={14} />
        </button>
      )}
    </motion.div>
  );
};

export default UserProfileFooter;
