import { MoreHorizontal, Reply, User } from "lucide-react"
import { format, isValid } from "date-fns"

export interface Message {
    _id: string
    content: string
    createdAt: string
    author: {
        _id: string
        name: string
    }
}

interface MessageItemProps {
    message: Message
    consecutive?: boolean
}

const MessageItem = ({ message, consecutive = false }: MessageItemProps) => {
    // Generate a consistent color based on the user's name
    const colors = [
        "bg-red-500/10 text-red-600",
        "bg-blue-500/10 text-blue-600",
        "bg-emerald-500/10 text-emerald-600",
        "bg-purple-500/10 text-purple-600",
        "bg-amber-500/10 text-amber-600",
        "bg-pink-500/10 text-pink-600",
        "bg-indigo-500/10 text-indigo-600",
    ]
    const colorIndex = message.author?.name ? message.author.name.length % colors.length : 0
    const colorClass = colors[colorIndex]

    return (
        <div
            className={`group relative flex gap-4 px-6 md:px-8 hover:bg-white/[0.02] transition-colors animate-in slide-in-from-bottom-1 duration-300 fill-mode-both ${consecutive ? 'py-0 mt-0' : 'py-1 mt-6'}`}
        >
            {/* Left Gutter: Avatar (empty on consecutive messages) */}
            <div className="shrink-0 w-10 flex flex-col items-center">
                {!consecutive && (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-black shadow-lg ${colorClass}`}>
                        {message.author?.name ? message.author.name.charAt(0).toUpperCase() : <User size={18} />}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 flex flex-col justify-start relative">
                {!consecutive && (
                    <div className="flex items-baseline gap-3 mb-1">
                        <span className="font-black text-[15px] text-white tracking-tight hover:underline cursor-pointer">
                            {message.author?.name || "Unknown User"}
                        </span>
                        {isValid(new Date(message.createdAt)) && (
                          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                              {format(new Date(message.createdAt), "h:mm a")}
                          </span>
                        )}
                    </div>
                )}

                <div className="text-white/70 text-[15px] leading-relaxed font-sans whitespace-pre-wrap">
                    {message.content}
                </div>
            </div>

            {/* Hover Actions & Timestamp */}
            <div className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-3">
                {consecutive && isValid(new Date(message.createdAt)) && (
                    <span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/10 select-none">
                        {format(new Date(message.createdAt), "h:mm a")}
                    </span>
                )}
                <div className="flex items-center gap-0.5 bg-brand-dark border border-white/5 shadow-2xl rounded-lg p-0.5">
                    <button className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/5 transition-all" title="Reply">
                        <Reply size={14} />
                    </button>
                    <div className="w-px h-3 bg-white/5 mx-0.5" />
                    <button className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/5 transition-all" title="More options">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MessageItem
