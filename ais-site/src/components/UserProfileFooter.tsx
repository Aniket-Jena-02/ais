import { useQuery } from "@tanstack/react-query";
import { Settings } from "lucide-react";

const UserProfileFooter = () => {
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API}/auth/me`, {
        credentials: "include"
      })
      return await res.json() as { userName: string, userId: string, msg?: string }
    },
    queryKey: ["user"]
  })

  // Fallback while loading
  if (isLoading || !data?.userName) {
    return (
      <div className="p-3 border-t border-base-300 bg-base-200/50 shrink-0 mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 p-1.5 -ml-1.5 rounded-lg opacity-50">
          <div className="w-8 h-8 shrink-0 rounded-full bg-base-300 animate-pulse" />
          <div className="h-4 w-20 bg-base-300 animate-pulse rounded" />
        </div>
        <div className="w-8 h-8 rounded-md bg-base-300 animate-pulse shrink-0" />
      </div>
    );
  }

  const firstLetter = data.userName.charAt(0).toUpperCase();

  return (
    <div className="p-3 border-t border-base-300 bg-base-200/50 shrink-0 mt-auto flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5 min-w-0 flex-1 hover:bg-base-300/50 p-1.5 -ml-1.5 rounded-lg cursor-pointer transition-colors">
        <div className="w-8 h-8 shrink-0 rounded-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center shadow-sm text-primary-content font-bold text-sm">
          {firstLetter}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-bold truncate text-base-content leading-tight">{data.userName}</span>
        </div>
      </div>
      <button className="btn btn-ghost btn-sm btn-square text-base-content/50 hover:text-base-content transition-colors shrink-0 tooltip tooltip-top" data-tip="User Settings">
        <Settings size={18} />
      </button>
    </div>
  );
};

export default UserProfileFooter;
