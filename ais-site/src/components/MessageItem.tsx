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
            className={`group relative flex gap-4 px-4 hover:bg-base-200/50 transition-colors animate-in slide-in-from-bottom-1 duration-300 fill-mode-both ${consecutive ? 'py-0 mt-0' : 'py-1 mt-4'}`}

        // style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
        >
            {/* Left Gutter: Avatar (empty on consecutive messages) */}
            <div className="shrink-0 w-10 flex flex-col items-center">
                {!consecutive && (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${colorClass}`}>
                        {message.author?.name ? message.author.name.charAt(0).toUpperCase() : <User size={20} />}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 flex flex-col justify-start relative">
                {!consecutive && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="font-semibold text-base-content hover:underline cursor-pointer">
                            {message.author?.name || "Unknown User"}
                        </span>
                        {isValid(new Date(message.createdAt)) && (
                          <span className="text-xs text-base-content/50 font-medium">
                              {format(new Date(message.createdAt), "h:mm a")}
                          </span>
                        )}
                    </div>
                )}

                <div className="text-base-content/90 text-[15px] leading-[1.3] wrap-break-word whitespace-pre-wrap">
                    {message.content}
                </div>
            </div>

            {/* Hover Actions & Timestamp */}
            <div className="absolute top-1 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-2">
                {consecutive && isValid(new Date(message.createdAt)) && (
                    <span className="text-[11px] whitespace-nowrap text-base-content/40 font-medium select-none mt-1">
                        {format(new Date(message.createdAt), "h:mm a")}
                    </span>
                )}
                <div className="flex items-center gap-0.5 bg-base-100 border border-base-200 shadow-sm rounded-md overflow-hidden">
                    <button className="btn btn-ghost btn-xs rounded-none h-8 px-2 text-base-content/60 hover:text-base-content hover:bg-base-200" title="Reply">
                        <Reply size={14} />
                    </button>
                    <div className="w-px h-4 bg-base-200" />
                    <button className="btn btn-ghost btn-xs rounded-none h-8 px-2 text-base-content/60 hover:text-base-content hover:bg-base-200" title="More options">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MessageItem
