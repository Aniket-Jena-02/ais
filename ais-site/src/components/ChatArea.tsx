import { useParams } from "@tanstack/react-router"
import { useEffect, useState, useRef, useMemo, Fragment } from "react"
import { io, Socket } from "socket.io-client"
import {
    Hash,
    UserPlus
} from "lucide-react"
import MessageInput from "./MessageInput"
import MessageItem, { type Message } from "./MessageItem"
import { useQuery } from "@tanstack/react-query"
import { format, isSameDay, isToday, isYesterday, isValid } from "date-fns"
import AddMemberModal from "./AddMemberModal"
import { useDebounceFn, useThrottleFn } from "ahooks"

const ChatArea = () => {
    const { channelId } = useParams({
        from: '/channels/$channelId',
    })

    const { data, isLoading } = useQuery({
        queryKey: ["channel messages", channelId],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_API}/channels/${channelId}`, {
                credentials: "include"
            })
            return await res.json() as { messages: Message[], channel: { _id: string, name: string, createdAt: string }, isAdmin: boolean }
        }
    })

    const [messages, setMessages] = useState<Message[]>([])
    const [isConnecting, setIsConnecting] = useState(true)
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
    const [typingUsers, setTypingUsers] = useState<Record<string, string>>({})

    // current user
    const { data: userData } = useQuery({
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_API}/auth/me`, {
                credentials: "include"
            })
            return await res.json() as { userName: string, userId: string, msg?: string }
        },
        queryKey: ["user"]
    })

    // Using useRef for persistent socket across re-renders
    const socketRef = useRef<Socket | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, data?.messages]) // Added data?.messages to ensure scrolling on load

    useEffect(() => {
        // Initialize socket connection
        const socket = io(`ws://localhost:3000`, {
            transports: ["websocket"],
        })
        socketRef.current = socket

        socket.on("connect", () => {
            console.log("Connected to server")
            setIsConnecting(false)

            // Join the specific channel
            socket.emit("join_channel", { channelId }, (res: any) => {
                console.log("Joined channel response:", res)
            })
        })

        socket.on("channel_message", (message: Message) => {
            setMessages((prev) => [...prev, message])
        })

        socket.on("typing", (data: { user: { id: string, name: string }, isTyping: boolean }) => {
            setTypingUsers((prev) => {
                const newObj = { ...prev }
                if (data.isTyping) {
                    newObj[data.user.id] = data.user.name
                } else {
                    delete newObj[data.user.id]
                }
                return newObj
            })
        })

        socket.on("disconnect", () => {
            console.log("Disconnected from server")
            setIsConnecting(true)
        })

        return () => {
            socket.disconnect()
            setMessages([])
            setTypingUsers({})
        }
    }, [channelId])

    const handleSendMessage = (content: string) => {
        if (!socketRef.current) return

        const newMessage = {
            content,
            channelId
        }

        // Emit message to server
        socketRef.current.emit("chat_message", newMessage, (res: { status: string, error?: string, messageId?: string }) => {
            if (res.status === "ERROR") {
                console.error("Message failed:", res.error)
            } else {
                setMessages((prev) => [...prev, { ...newMessage, _id: res.messageId!, author: { _id: userData?.userId || "", name: userData?.userName || "" }, createdAt: new Date().toISOString() }])
            }
        })
        
        // Stop typing indicator on send
        socketRef.current.emit("typing", { channelId, isTyping: false })
    }


    const emitStartTyping = () => {
        if (!socketRef.current) return
        socketRef.current.emit("typing", { channelId, isTyping: true })
    }

    const { run: runStartTyping } = useThrottleFn(emitStartTyping, {
        wait: 2000,
    })

    const emitStopTyping = () => {
        if (!socketRef.current) return
        socketRef.current.emit("typing", { channelId, isTyping: false })
    }

    const { run: runStopTyping } = useDebounceFn(emitStopTyping, {
        wait: 1000,
    })

    // Combine fetched messages with socket real-time messages
    // Realistically you'd want a more robust sync state, but this works for presentation
    const allMessages = useMemo(() => [...(data?.messages || []), ...messages], [data?.messages, messages])

    return (
        <div className="flex flex-col h-full bg-base-100 relative overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--p),0.03),transparent_50%)] pointer-events-none" />

            {/* Chat Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-base-200/50 bg-base-100/80 backdrop-blur-md sticky top-0 z-20 shrink-0 shadow-sm">
                <div className="flex items-center gap-2 max-w-full">
                    <Hash size={20} className="text-base-content/40 shrink-0" />
                    <h2 className="text-[15px] font-bold text-base-content tracking-tight truncate">
                        {isLoading ? (
                            <div className="h-5 w-32 bg-base-200 animate-pulse rounded" />
                        ) : (
                            data?.channel.name || channelId
                        )}
                    </h2>
                </div>

                {/* Admin Header Actions */}
                {data?.isAdmin && (
                    <button
                        onClick={() => setIsAddMemberOpen(true)}
                        className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors tooltip tooltip-left"
                        data-tip="Add Member"
                    >
                        <UserPlus size={18} />
                    </button>
                )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto px-1 py-4 md:px-4 scrollbar-hide mb-4">

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-base-content/20 animate-in fade-in zoom-in duration-1000">
                        <div className="bg-base-200/50 p-10 rounded-full mb-6 border border-base-content/5 shadow-inner">
                            <Hash size={64} className="opacity-20 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-base-content/40 uppercase">Loading...</h3>
                    </div>
                ) : allMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-base-content/20 animate-in fade-in zoom-in duration-1000">
                        <div className="bg-base-200/50 p-10 rounded-full mb-6 border border-base-content/5 shadow-inner">
                            <Hash size={64} className="opacity-20" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-base-content/40 uppercase">Channel Start</h3>
                        <p className="max-w-xs text-center mt-3 text-sm font-medium opacity-60 italic">
                            This is the very beginning of the #{channelId} history.
                        </p>
                    </div>
                ) : (
                    allMessages.map((msg, index) => {
                        const messageDate = new Date(msg.createdAt)
                        const prevMessageDate = index > 0 ? new Date(allMessages[index - 1].createdAt) : null

                        const showDateSeparator = !prevMessageDate || !isSameDay(messageDate, prevMessageDate)
                        const isConsecutive = !showDateSeparator && index > 0 && allMessages[index - 1].author?._id === msg.author?._id

                        let dateLabel = ""
                        if (showDateSeparator && isValid(messageDate)) {
                            if (isToday(messageDate)) {
                                dateLabel = "Today"
                            } else if (isYesterday(messageDate)) {
                                dateLabel = "Yesterday"
                            } else {
                                dateLabel = format(messageDate, "EEEE, MMMM d")
                            }
                        }

                        return (
                            <Fragment key={msg._id}>
                                {showDateSeparator && (
                                    <div className="flex items-center gap-4 my-8 pl-16 pr-4 opacity-60 pointer-events-none">
                                        <div className="h-px bg-base-content/20 flex-1"></div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/80">
                                            {dateLabel}
                                        </span>
                                        <div className="h-px bg-base-content/20 flex-1"></div>
                                    </div>
                                )}
                                <MessageItem
                                    message={msg}
                                    consecutive={isConsecutive}
                                />
                            </Fragment>
                        )
                    })
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-base-100/80 backdrop-blur-md border-t border-base-200/50 relative z-20 shrink-0">
                {/* Typing Indicator */}
                {Object.keys(typingUsers).length > 0 && (
                    <div className="absolute -top-6 left-6 flex items-center gap-2 text-[11px] font-medium text-base-content/60 animate-in fade-in duration-300">
                        <div className="flex items-center gap-0.5 opacity-70">
                            <span className="w-1 h-1 rounded-full bg-base-content animate-[bounce_1s_infinite_-0.3s]" />
                            <span className="w-1 h-1 rounded-full bg-base-content animate-[bounce_1s_infinite_-0.15s]" />
                            <span className="w-1 h-1 rounded-full bg-base-content animate-bounce" />
                        </div>
                        <span className="truncate max-w-[200px]">
                            <span className="font-semibold text-base-content/80">{Object.values(typingUsers).join(", ")}</span> {Object.keys(typingUsers).length === 1 ? "is typing..." : "are typing..."}
                        </span>
                    </div>
                )}
                <div className="max-w-4xl mx-auto drop-shadow-sm relative">
                    <MessageInput
                        onSendMessage={handleSendMessage}
                        placeholder={isConnecting ? "Connecting to server..." : `Message in #${data?.channel.name || 'channel'}`}
                        disabled={isConnecting}
                        onTyping={() => {
                            runStartTyping()
                            runStopTyping()
                        }}
                    />

                    {/* Connection Status Overlay */}
                    <div className="absolute top-0 left-8 select-none pointer-events-none -translate-y-1/2">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-base-100/80 backdrop-blur-sm rounded-full border border-base-content/5 shadow-sm">
                            <div className={`w-1.5 h-1.5 rounded-full ${isConnecting ? 'bg-warning animate-pulse' : 'bg-success'}`} />
                            <span className="text-[8px] font-black uppercase tracking-widest text-base-content/50">
                                {isConnecting ? 'Connecting' : 'Connected'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                channelId={channelId}
            />
        </div>
    )
}

export default ChatArea
