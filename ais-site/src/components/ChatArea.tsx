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
import { useDebounceFn } from "ahooks"

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
        cancelStopTyping()
        if (isTypingRef.current) {
            isTypingRef.current = false
            socketRef.current.emit("typing", { channelId, isTyping: false })
        }
    }


    const isTypingRef = useRef(false)

    const { run: runStopTyping, cancel: cancelStopTyping } = useDebounceFn(() => {
        if (!socketRef.current || !isTypingRef.current) return
        isTypingRef.current = false
        socketRef.current.emit("typing", { channelId, isTyping: false })
    }, {
        wait: 2000,
    })

    const handleTyping = () => {
        if (!socketRef.current) return
        if (!isTypingRef.current) {
            isTypingRef.current = true
            socketRef.current.emit("typing", { channelId, isTyping: true })
        }
        runStopTyping()
    }
    // Combine fetched messages with socket real-time messages
    // Realistically you'd want a more robust sync state, but this works for presentation
    const allMessages = useMemo(() => [...(data?.messages || []), ...messages], [data?.messages, messages])

    return (
        <div className="flex flex-col h-full bg-brand-dark relative overflow-hidden">
            {/* Chat Header */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-brand-dark/80 backdrop-blur-md sticky top-0 z-20 shrink-0 shadow-sm">
                <div className="flex items-center gap-3 max-w-full">
                    <Hash size={20} className="text-white/20 shrink-0" />
                    <h2 className="text-lg font-black text-white font-serif tracking-tight truncate">
                        {isLoading ? (
                            <div className="h-6 w-32 bg-white/5 animate-pulse rounded" />
                        ) : (
                            data?.channel.name || channelId
                        )}
                    </h2>
                </div>

                {/* Admin Header Actions */}
                {data?.isAdmin && (
                    <button
                        onClick={() => setIsAddMemberOpen(true)}
                        className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
                    >
                        <UserPlus size={18} />
                    </button>
                )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto px-1 py-6 md:px-8 scrollbar-hide">

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/10 animate-in fade-in zoom-in duration-1000">
                        <div className="bg-white/5 p-12 rounded-full mb-8 border border-white/5 shadow-inner">
                            <Hash size={64} className="opacity-10 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-white/30 uppercase font-serif">Loading Messages</h3>
                    </div>
                ) : allMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/10 animate-in fade-in zoom-in duration-1000">
                        <div className="bg-white/5 p-12 rounded-full mb-8 border border-white/5 shadow-inner">
                            <Hash size={64} className="opacity-10" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-white/30 uppercase font-serif">Channel History Starts Here</h3>
                        <p className="max-w-xs text-center mt-4 text-sm font-medium opacity-40 italic font-sans leading-relaxed">
                            This is the very beginning of the <strong className="text-white/60">#{data?.channel.name}</strong> history. Make it count.
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
                                    <div className="flex items-center gap-6 my-10 px-4 opacity-40 pointer-events-none select-none">
                                        <div className="h-px bg-white/5 flex-1"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                            {dateLabel}
                                        </span>
                                        <div className="h-px bg-white/5 flex-1"></div>
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
                <div ref={messagesEndRef} className="h-8" />
            </div>

            {/* Input Area */}
            <div className="relative z-20 shrink-0">
                {/* Typing Indicator */}
                {Object.keys(typingUsers).length > 0 && (
                    <div className="px-8 pb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-1 opacity-50">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                        </div>
                        <span className="truncate max-w-[200px]">
                            <span className="text-white/60">{Object.values(typingUsers).join(", ")}</span> {Object.keys(typingUsers).length === 1 ? "is typing..." : "are typing..."}
                        </span>
                    </div>
                )}
                
                <MessageInput
                    onSendMessage={handleSendMessage}
                    placeholder={isConnecting ? "Connecting to server..." : `Message in #${data?.channel.name || 'channel'}`}
                    disabled={isConnecting}
                    onTyping={handleTyping}
                />

                {/* Connection Status Overlay */}
                <div className="absolute top-0 right-12 select-none pointer-events-none -translate-y-1/2 z-30">
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-dark rounded-full border border-white/5 shadow-xl">
                        <div className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                            {isConnecting ? 'Connecting' : 'Operational'}
                        </span>
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
    );
}

export default ChatArea
