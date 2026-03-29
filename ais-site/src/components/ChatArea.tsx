import { useParams, useNavigate } from "@tanstack/react-router"
import { useEffect, useState, useRef, useMemo, useCallback, Fragment } from "react"
import { io, Socket } from "socket.io-client"
import {
    Hash,
    UserPlus,
    ChevronUp,
    Loader2,
    Users,
    LogOut
} from "lucide-react"
import MessageInput from "./MessageInput"
import MessageItem, { type Message, type Reaction } from "./MessageItem"
import { useQuery } from "@tanstack/react-query"
import { format, isSameDay, isToday, isYesterday, isValid } from "date-fns"
import AddMemberModal from "./AddMemberModal"
import MembersPanel from "./MembersPanel"
import { useDebounceFn } from "ahooks"
import { toast } from "sonner"
import ConfirmDialog from "./ConfirmDialog"

interface ProcessedMessage extends Message {
    showDateSeparator: boolean
    dateLabel: string
    isConsecutive: boolean
}

const MESSAGES_PER_PAGE = 50
const TYPING_TIMEOUT_MS = 4000

const ChatArea = () => {
    const { channelId } = useParams({
        from: '/channels/$channelId',
    })
    const navigate = useNavigate()

    // Fetch channel metadata (no longer includes messages)
    const { data: channelData, isLoading: isChannelLoading } = useQuery({
        queryKey: ["channel", channelId],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_API}/channels/${channelId}`, {
                credentials: "include"
            })
            return await res.json() as { channel: { _id: string, name: string, createdAt: string, admin: string }, isAdmin: boolean }
        }
    })

    // Fetch messages separately with pagination
    const { data: messagesData, isLoading: isMessagesLoading } = useQuery({
        queryKey: ["channel messages", channelId],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_API}/channels/${channelId}/messages?limit=${MESSAGES_PER_PAGE}`, {
                credentials: "include"
            })
            return await res.json() as { messages: Message[], hasMore: boolean }
        },
        refetchOnWindowFocus: false,
    })

    const [messages, setMessages] = useState<Message[]>([])
    const [isConnecting, setIsConnecting] = useState(true)
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
    const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false)
    const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false)
    const [typingUsers, setTypingUsers] = useState<Record<string, string>>({})
    const [olderMessages, setOlderMessages] = useState<Message[]>([])
    const [hasMore, setHasMore] = useState(false)
    const [isLoadingOlder, setIsLoadingOlder] = useState(false)
    const [replyingTo, setReplyingTo] = useState<Message | null>(null)

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
    const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

    // Track hasMore from initial query
    useEffect(() => {
        if (messagesData) {
            setHasMore(messagesData.hasMore)
        }
    }, [messagesData])

    // Auto scroll to bottom
    const isInitialScrollRef = useRef(true)
    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior })
    }

    useEffect(() => {
        if (isInitialScrollRef.current) {
            // Instant jump on first load / channel switch
            scrollToBottom("instant")
            isInitialScrollRef.current = false
        } else {
            scrollToBottom("smooth")
        }
    }, [messages, messagesData?.messages])

    // Reset state when channel changes
    useEffect(() => {
        setOlderMessages([])
        setMessages([])
        setHasMore(false)
        setReplyingTo(null)
        isInitialScrollRef.current = true
    }, [channelId])

    // Effect 1: Create the socket once for the lifetime of the component.
    // This does NOT depend on channelId so switching channels never disconnects.
    useEffect(() => {
        const socket = io(import.meta.env.VITE_WS || `http://localhost:3000`, {
            transports: ["websocket"],
        })
        socketRef.current = socket

        socket.on("connect", () => {
            console.log("Connected to server")
            setIsConnecting(false)
        })

        socket.on("channel_message", (message: Message) => {
            setMessages((prev) => [...prev, message])
        })

        socket.on("message_edited", (data: { messageId: string; content: string; updatedAt: string }) => {
            const applyEdit = (msg: Message) =>
                msg._id === data.messageId ? { ...msg, content: data.content, updatedAt: data.updatedAt } : msg
            setMessages((prev) => prev.map(applyEdit))
            setOlderMessages((prev) => prev.map(applyEdit))
        })

        socket.on("message_deleted", (data: { messageId: string }) => {
            setMessages((prev) => prev.filter((m) => m._id !== data.messageId))
        })

        socket.on("message_reaction", (data: { messageId: string; reactions: Reaction[] }) => {
            const applyReaction = (msg: Message) =>
                msg._id === data.messageId ? { ...msg, reactions: data.reactions } : msg
            setMessages((prev) => prev.map(applyReaction))
            setOlderMessages((prev) => prev.map(applyReaction))
        })

        socket.on("typing", (data: { user: { id: string, name: string }, isTyping: boolean }) => {
            setTypingUsers((prev) => {
                const newObj = { ...prev }
                if (data.isTyping) {
                    newObj[data.user.id] = data.user.name

                    if (typingTimeoutsRef.current[data.user.id]) {
                        clearTimeout(typingTimeoutsRef.current[data.user.id])
                    }
                    typingTimeoutsRef.current[data.user.id] = setTimeout(() => {
                        setTypingUsers((prev) => {
                            const updated = { ...prev }
                            delete updated[data.user.id]
                            return updated
                        })
                        delete typingTimeoutsRef.current[data.user.id]
                    }, TYPING_TIMEOUT_MS)
                } else {
                    delete newObj[data.user.id]
                    if (typingTimeoutsRef.current[data.user.id]) {
                        clearTimeout(typingTimeoutsRef.current[data.user.id])
                        delete typingTimeoutsRef.current[data.user.id]
                    }
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
            Object.values(typingTimeoutsRef.current).forEach(clearTimeout)
            typingTimeoutsRef.current = {}
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Effect 2: Join the new channel room whenever channelId changes.
    // Leaves the previous room automatically (socket.io leaves on re-join).
    useEffect(() => {
        const socket = socketRef.current
        if (!socket) return

        setMessages([])
        setTypingUsers({})
        Object.values(typingTimeoutsRef.current).forEach(clearTimeout)
        typingTimeoutsRef.current = {}

        if (socket.connected) {
            socket.emit("join_channel", { channelId }, (res: any) => {
                console.log("Joined channel response:", res)
            })
        } else {
            // If the socket isn't connected yet, join once it is
            const onConnect = () => {
                socket.emit("join_channel", { channelId }, (res: any) => {
                    console.log("Joined channel response:", res)
                })
                socket.off("connect", onConnect)
            }
            socket.on("connect", onConnect)
            return () => { socket.off("connect", onConnect) }
        }
    }, [channelId])

    const handleEditMessage = async (messageId: string, newContent: string) => {
        const res = await fetch(`${import.meta.env.VITE_API}/channels/messages/${messageId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newContent }),
            credentials: "include",
        })
        if (!res.ok) {
            const data = await res.json()
            toast.error(data.msg || "Failed to edit message")
            throw new Error("Edit failed")
        }
        const data = await res.json()
        const updatedAt = data.updatedAt || new Date().toISOString()
        // Optimistic update for the sender (others get socket event)
        const applyEdit = (m: Message) =>
            m._id === messageId ? { ...m, content: newContent, updatedAt } : m
        setMessages((prev) => prev.map(applyEdit))
        setOlderMessages((prev) => prev.map(applyEdit))
    }

    const handleDeleteMessage = async (messageId: string) => {
        const res = await fetch(`${import.meta.env.VITE_API}/channels/messages/${messageId}`, {
            method: "DELETE",
            credentials: "include",
        })
        if (!res.ok) {
            toast.error("Failed to delete message")
            throw new Error("Delete failed")
        }
        setMessages((prev) => prev.filter((m) => m._id !== messageId))
    }

    const handleReaction = (messageId: string, emoji: string) => {
        if (!socketRef.current) return

        // Optimistic local update
        const applyOptimistic = (m: Message) => {
            if (m._id !== messageId) return m
            const reactions = [...(m.reactions || [])]
            const existing = reactions.find(r => r.emoji === emoji)
            const userId = userData?.userId || ""
            if (existing) {
                if (existing.users.includes(userId)) {
                    existing.users = existing.users.filter(u => u !== userId)
                    if (existing.users.length === 0) {
                        return { ...m, reactions: reactions.filter(r => r.emoji !== emoji) }
                    }
                } else {
                    existing.users = [...existing.users, userId]
                }
                return { ...m, reactions: [...reactions] }
            } else {
                return { ...m, reactions: [...reactions, { emoji, users: [userId] }] }
            }
        }
        setMessages(prev => prev.map(applyOptimistic))
        setOlderMessages(prev => prev.map(applyOptimistic))

        // Fire socket event
        socketRef.current.emit("react_message", { messageId, emoji, channelId })
    }

    const handleReply = (message: Message) => {
        setReplyingTo(message)
    }

    const scrollToMessage = (messageId: string) => {
        const el = document.querySelector(`[data-message-id="${messageId}"]`)
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" })
            el.classList.add("message-highlight")
            setTimeout(() => el.classList.remove("message-highlight"), 1500)
        }
    }

    const handleLeaveChannel = async () => {
        const res = await fetch(`${import.meta.env.VITE_API}/channels/${channelId}/leave`, {
            method: "POST",
            credentials: "include",
        })
        if (!res.ok) {
            const data = await res.json()
            toast.error(data.msg || "Failed to leave channel")
            return
        }
        toast.success("Left channel")
        navigate({ to: "/channels" })
    }


    const handleSendMessage = (content: string) => {
        if (!socketRef.current) return

        const newMessage: Record<string, any> = {
            content,
            channelId,
        }
        if (replyingTo) {
            newMessage.replyTo = replyingTo._id
        }

        const replyData = replyingTo ? {
            _id: replyingTo._id,
            content: replyingTo.content,
            author: replyingTo.author,
        } : null

        // Emit message to server
        socketRef.current.emit("chat_message", newMessage, (res: { status: string, error?: string, messageId?: string, replyTo?: any }) => {
            if (res.status === "ERROR") {
                console.error("Message failed:", res.error)
            } else {
                setMessages((prev) => [...prev, {
                    content,
                    _id: res.messageId!,
                    author: { _id: userData?.userId || "", name: userData?.userName || "" },
                    createdAt: new Date().toISOString(),
                    replyTo: res.replyTo || replyData,
                }])
            }
        })

        // Clear reply state
        setReplyingTo(null)

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

    // Load older messages (cursor-based pagination)
    const loadOlderMessages = useCallback(async () => {
        const allCurrent = [...olderMessages, ...(messagesData?.messages || []), ...messages]
        if (allCurrent.length === 0 || !hasMore) return

        setIsLoadingOlder(true)
        try {
            const oldestId = allCurrent[0]._id
            const res = await fetch(
                `${import.meta.env.VITE_API}/channels/${channelId}/messages?limit=${MESSAGES_PER_PAGE}&before=${oldestId}`,
                { credentials: "include" }
            )
            const data = await res.json() as { messages: Message[], hasMore: boolean }
            setOlderMessages((prev) => [...data.messages, ...prev])
            setHasMore(data.hasMore)
        } catch (err) {
            console.error("Failed to load older messages:", err)
        } finally {
            setIsLoadingOlder(false)
        }
    }, [channelId, olderMessages, messagesData?.messages, messages, hasMore])

    // Combine all messages and pre-process date separators / consecutive flags
    const processedMessages = useMemo(() => {
        const allMessages = [...olderMessages, ...(messagesData?.messages || []), ...messages]

        return allMessages.map((msg, index): ProcessedMessage => {
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

            return {
                ...msg,
                showDateSeparator,
                dateLabel,
                isConsecutive,
            }
        })
    }, [olderMessages, messagesData?.messages, messages])

    const isLoading = isChannelLoading || isMessagesLoading

    return (
        <div className="flex h-full w-full bg-brand-dark relative overflow-hidden">
            <div className="flex flex-col flex-1 h-full relative overflow-hidden">
                {/* Chat Header */}
                <div className="h-14 flex items-center justify-between px-6 border-b border-white/4 bg-brand-surface/50 backdrop-blur-md sticky top-0 z-20 shrink-0 shadow-sm">
                    <div className="flex items-center gap-3 max-w-full">
                        <Hash size={20} className="text-white/20 shrink-0" />
                        <h2 className="text-lg font-black text-white font-serif tracking-tight truncate">
                            {isLoading ? (
                                <div className="h-6 w-32 bg-white/5 animate-pulse rounded" />
                            ) : (
                                channelData?.channel.name || channelId
                            )}
                        </h2>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setIsMembersPanelOpen(!isMembersPanelOpen)}
                            className={`p-2 rounded-full transition-all duration-300 ${isMembersPanelOpen ? 'text-brand-accent bg-brand-accent/10 hover:bg-brand-accent/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            title="Toggle Member List"
                        >
                            <Users size={16} strokeWidth={2.5} />
                        </button>
                        {channelData?.isAdmin && (
                            <button
                                onClick={() => setIsAddMemberOpen(true)}
                                className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300"
                                title="Add Member"
                            >
                                <UserPlus size={16} strokeWidth={2.5} />
                            </button>
                        )}
                        {!channelData?.isAdmin && channelData && (
                            <button
                                onClick={() => setIsLeaveConfirmOpen(true)}
                                className="p-2 rounded-full text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                                title="Leave Channel"
                            >
                                <LogOut size={15} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto px-1 py-6 md:px-8 scrollbar-hide">

                    {/* Load Earlier Messages */}
                    {hasMore && !isLoading && (
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={loadOlderMessages}
                                disabled={isLoadingOlder}
                                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 hover:text-white/60 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all duration-200 disabled:opacity-50"
                            >
                                {isLoadingOlder ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <ChevronUp size={14} />
                                )}
                                {isLoadingOlder ? "Loading..." : "Load Earlier Messages"}
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-white/10 animate-in fade-in zoom-in duration-1000">
                            <div className="bg-white/2 p-5 rounded-full mb-8 border border-white/5 shadow-inner">
                                <Hash size={64} className="opacity-10 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight text-white/30 uppercase font-serif">Loading Messages</h3>
                        </div>
                    ) : processedMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-white/10 animate-in fade-in zoom-in duration-1000">
                            <div className="bg-white/2 p-5 rounded-full mb-8 border border-white/5 shadow-inner">
                                <Hash size={64} />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight text-white uppercase font-serif">Channel History Starts Here</h3>
                            <p className="max-w-xs text-center mt-4 text-sm font-medium text-white/40 italic font-sans leading-relaxed">
                                This is the very beginning of the <strong className="text-brand-accent-soft">#{channelData?.channel.name}</strong> history. Make it count.
                            </p>
                        </div>
                    ) : (
                        processedMessages.map((msg) => (
                            <Fragment key={msg._id}>
                                {msg.showDateSeparator && (
                                    <div className="flex items-center gap-6 my-10 px-4 opacity-40 pointer-events-none select-none">
                                        <div className="h-px bg-white/5 flex-1"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                            {msg.dateLabel}
                                        </span>
                                        <div className="h-px bg-white/5 flex-1"></div>
                                    </div>
                                )}
                                <div data-message-id={msg._id}>
                                    <MessageItem
                                        message={msg}
                                        consecutive={msg.isConsecutive}
                                        isCurrentUser={msg.author?._id === userData?.userId}
                                        isAdmin={msg.author?._id === channelData?.channel?.admin}
                                        currentUserId={userData?.userId}
                                        onEdit={handleEditMessage}
                                        onDelete={handleDeleteMessage}
                                        onReact={handleReaction}
                                        onReply={handleReply}
                                        onScrollToMessage={scrollToMessage}
                                    />
                                </div>
                            </Fragment>
                        ))
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
                        placeholder={isConnecting ? "Connecting to server..." : `Message in #${channelData?.channel.name || 'channel'}`}
                        disabled={isConnecting}
                        onTyping={handleTyping}
                        replyingTo={replyingTo}
                        onCancelReply={() => setReplyingTo(null)}
                    />

                    {/* Connection Status Overlay */}
                    <div className="absolute top-0 right-12 select-none pointer-events-none -translate-y-1/2 z-30">
                        <div className="flex items-center gap-2 px-3 py-1 bg-brand-surface rounded-full border border-white/4 shadow-xl">
                            <div className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                {isConnecting ? 'Connecting' : 'Operational'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Leave Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={isLeaveConfirmOpen}
                    title="Leave Channel"
                    description={`Are you sure you want to leave #${channelData?.channel.name || channelId}? You will need to be re-invited to join again.`}
                    confirmLabel="Leave Channel"
                    cancelLabel="Stay"
                    onConfirm={() => {
                        setIsLeaveConfirmOpen(false)
                        handleLeaveChannel()
                    }}
                    onCancel={() => setIsLeaveConfirmOpen(false)}
                />

                {/* Add Member Modal */}
                <AddMemberModal
                    isOpen={isAddMemberOpen}
                    onClose={() => setIsAddMemberOpen(false)}
                    channelId={channelId!} />
            </div>

            {/* Members Panel — sibling column, right side */}
            <MembersPanel
                channelId={channelId}
                isOpen={isMembersPanelOpen}
                socket={socketRef.current}
                isAdmin={channelData?.isAdmin}
                currentUserId={userData?.userId}
            />
        </div>
    );
}

export default ChatArea
