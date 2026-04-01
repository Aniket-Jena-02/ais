import { useParams, useNavigate } from "@tanstack/react-router"
import { useEffect, useState, useRef, useMemo, useCallback, Fragment } from "react"
import { io, Socket } from "socket.io-client"
import {
    Hash,
    UserPlus,
    ChevronUp,
    ChevronDown,
    Loader2,
    Users,
    LogOut
} from "lucide-react"
import MessageInput from "./MessageInput"
import MessageItem, { type Message, type Reaction } from "./MessageItem"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { format, isSameDay, isToday, isYesterday, isValid } from "date-fns"
import AddMemberModal from "./AddMemberModal"
import MembersPanel from "./MembersPanel"
import { useDebounceFn } from "ahooks"
import { toast } from "sonner"
import ConfirmDialog from "./ConfirmDialog"
import clsx from "clsx"
import { AnimatePresence, motion } from "framer-motion"

interface ProcessedMessage {
    message: Message
    showDateSeparator: boolean
    dateLabel: string
    isConsecutive: boolean
}

interface UserChannelItem {
    _id: string
    name: string
    createdAt: string
    unreadCount: number
}

const MESSAGES_PER_PAGE = 50
const SCROLL_BOTTOM_THRESHOLD = 96

const ChatArea = () => {
    const { channelId } = useParams({
        from: '/channels/$channelId',
    })
    const navigate = useNavigate()
    const queryClient = useQueryClient()

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

    const [initialMessages, setInitialMessages] = useState<Message[]>([])
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

    const socketRef = useRef<Socket | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [showScrollToBottom, setShowScrollToBottom] = useState(false)

    const setChannelUnreadCount = useCallback((targetChannelId: string, unreadCount: number) => {
        queryClient.setQueryData<UserChannelItem[]>(["user-channels"], (previous) => {
            if (!previous) return previous

            return previous.map((channel) =>
                channel._id === targetChannelId
                    ? { ...channel, unreadCount }
                    : channel
            )
        })
    }, [queryClient])

    const updateMessageEverywhere = useCallback((updater: (message: Message) => Message) => {
        setOlderMessages((prev) => prev.map(updater))
        setInitialMessages((prev) => prev.map(updater))
        setMessages((prev) => prev.map(updater))
    }, [])

    const removeMessageEverywhere = useCallback((messageId: string) => {
        setOlderMessages((prev) => prev.filter((message) => message._id !== messageId))
        setInitialMessages((prev) => prev.filter((message) => message._id !== messageId))
        setMessages((prev) => prev.filter((message) => message._id !== messageId))
    }, [])

    // Track hasMore from initial query
    useEffect(() => {
        if (messagesData) {
            setHasMore(messagesData.hasMore)
            setInitialMessages(messagesData.messages)
        }
    }, [messagesData])

    const markChannelAsRead = useCallback(async (messageId?: string) => {
        if (!channelId) return

        try {
            const res = await fetch(`${import.meta.env.VITE_API}/channels/${channelId}/read`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(messageId ? { messageId } : {}),
                credentials: "include",
            })
            if (!res.ok) {
                throw new Error("Failed to mark channel as read")
            }
            setChannelUnreadCount(channelId, 0)
        } catch (error) {
            console.error("Failed to mark channel as read:", error)
        }
    }, [channelId, setChannelUnreadCount])

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ["user-channels"] })
    }, [channelId, queryClient])

    useEffect(() => {
        if (!messagesData) return

        const latestInitialMessage = messagesData.messages[messagesData.messages.length - 1]
        if (latestInitialMessage?._id) {
            markChannelAsRead(latestInitialMessage._id)
        } else if (channelId) {
            setChannelUnreadCount(channelId, 0)
        }
    }, [channelId, markChannelAsRead, messagesData, setChannelUnreadCount])

    // Auto scroll to bottom
    const isInitialScrollRef = useRef(true)
    const scrollToBottom = (behavior: ScrollBehavior) => {
        messagesEndRef.current?.scrollIntoView({ behavior })
    }

    const updateScrollToBottomVisibility = useCallback(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
        setShowScrollToBottom(distanceFromBottom > SCROLL_BOTTOM_THRESHOLD)
    }, [])

    const latestMessageId = useMemo(() => {
        const latestMessages = messages.length > 0 ? messages : initialMessages
        return latestMessages.length > 0 ? latestMessages[latestMessages.length - 1]._id : null
    }, [initialMessages, messages])

    useEffect(() => {
        const hasMessages = initialMessages.length + messages.length > 0
        if (isInitialScrollRef.current) {
            if (!hasMessages) return // wait until data actually arrives
            // Double-RAF ensures the browser has painted the messages before we scroll
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollToBottom("instant")
                    isInitialScrollRef.current = false
                })
            })
        } else {
            scrollToBottom("smooth")
        }
    }, [initialMessages.length, latestMessageId, messages.length])

    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const handleScroll = () => {
            updateScrollToBottomVisibility()
        }

        updateScrollToBottomVisibility()
        container.addEventListener("scroll", handleScroll, { passive: true })

        return () => {
            container.removeEventListener("scroll", handleScroll)
        }
    }, [updateScrollToBottomVisibility])

    // Reset state when channel changes
    useEffect(() => {
        const cachedMessagesData = queryClient.getQueryData<{ messages: Message[], hasMore: boolean }>(["channel messages", channelId])
        setOlderMessages([])
        setInitialMessages(cachedMessagesData?.messages ?? [])
        setMessages([])
        setHasMore(cachedMessagesData?.hasMore ?? false)
        setReplyingTo(null)
        isInitialScrollRef.current = true
    }, [channelId, queryClient])

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
            if (message._id) {
                markChannelAsRead(message._id)
            }
        })

        socket.on("message_edited", (data: { messageId: string; content: string; updatedAt: string }) => {
            const applyEdit = (msg: Message) =>
                msg._id === data.messageId ? { ...msg, content: data.content, updatedAt: data.updatedAt } : msg
            updateMessageEverywhere(applyEdit)
        })

        socket.on("message_deleted", (data: { messageId: string }) => {
            removeMessageEverywhere(data.messageId)
        })

        socket.on("message_reaction", (data: { messageId: string; reactions: Reaction[] }) => {
            const applyReaction = (msg: Message) =>
                msg._id === data.messageId ? { ...msg, reactions: data.reactions } : msg
            updateMessageEverywhere(applyReaction)
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

        socket.on("user_presence", (data: { userId: string, status: "online" | "offline" }) => {
            if (data.status === "offline") {
                setTypingUsers((prev) => {
                    const newObj = { ...prev }
                    delete newObj[data.userId]
                    return newObj
                })
            }
        })

        socket.on("disconnect", () => {
            console.log("Disconnected from server")
            setIsConnecting(true)
        })

        return () => {
            socket.disconnect()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markChannelAsRead, removeMessageEverywhere, updateMessageEverywhere])

    // Effect 2: Join the new channel room whenever channelId changes.
    // Leaves the previous room automatically (socket.io leaves on re-join).
    useEffect(() => {
        const socket = socketRef.current
        if (!socket) return

        setMessages([])
        setTypingUsers({})

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



    const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
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
        updateMessageEverywhere(applyEdit)
    }, [updateMessageEverywhere])

    const handleDeleteMessage = useCallback(async (messageId: string) => {
        const res = await fetch(`${import.meta.env.VITE_API}/channels/messages/${messageId}`, {
            method: "DELETE",
            credentials: "include",
        })
        if (!res.ok) {
            toast.error("Failed to delete message")
            throw new Error("Delete failed")
        }
        removeMessageEverywhere(messageId)
    }, [removeMessageEverywhere])

    const handleReaction = useCallback((messageId: string, emoji: string) => {
        if (!socketRef.current) return

        // Optimistic local update
        const applyOptimistic = (m: Message) => {
            if (m._id !== messageId) return m
            const reactions = (m.reactions || []).map((reaction) => ({
                ...reaction,
                users: [...reaction.users],
            }))
            const existingIndex = reactions.findIndex((reaction) => reaction.emoji === emoji)
            const userId = userData?.userId || ""
            if (existingIndex >= 0) {
                const existing = reactions[existingIndex]
                if (existing.users.includes(userId)) {
                    existing.users = existing.users.filter(u => u !== userId)
                    if (existing.users.length === 0) {
                        return { ...m, reactions: reactions.filter((_, index) => index !== existingIndex) }
                    }
                } else {
                    existing.users = [...existing.users, userId]
                }
                reactions[existingIndex] = existing
                return { ...m, reactions }
            } else {
                return { ...m, reactions: [...reactions, { emoji, users: [userId] }] }
            }
        }
        updateMessageEverywhere(applyOptimistic)

        // Fire socket event
        socketRef.current.emit("react_message", { messageId, emoji, channelId })
    }, [channelId, updateMessageEverywhere, userData?.userId])

    const handleReply = useCallback((message: Message) => {
        setReplyingTo(message)
    }, [])

    const scrollToMessage = useCallback((messageId: string) => {
        const el = document.querySelector(`[data-message-id="${messageId}"]`)
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" })
            el.classList.add("message-highlight")
            setTimeout(() => el.classList.remove("message-highlight"), 1500)
        }
    }, [])

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
                markChannelAsRead(res.messageId)
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
        const allCurrent = [...olderMessages, ...initialMessages, ...messages]
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
    }, [channelId, hasMore, initialMessages, messages, olderMessages])

    // Combine all messages and pre-process date separators / consecutive flags
    const processedMessages = useMemo(() => {
        const allMessages = [...olderMessages, ...initialMessages, ...messages]

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
                message: msg,
                showDateSeparator,
                dateLabel,
                isConsecutive,
            }
        })
    }, [initialMessages, messages, olderMessages])

    const isLoading = isChannelLoading || isMessagesLoading

    useEffect(() => {
        requestAnimationFrame(() => {
            updateScrollToBottomVisibility()
        })
    }, [isLoading, processedMessages.length, updateScrollToBottomVisibility])

    return (
        <div className="relative flex h-full w-full min-w-0 overflow-hidden bg-brand-dark">
            <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/4 bg-brand-surface/55 px-4 shadow-sm backdrop-blur-xl md:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/6 bg-white/4">
                            <Hash size={18} className="text-white/25" />
                        </div>
                        <div className="min-w-0 flex items-center gap-2">
                            <h2 className="truncate text-lg font-black tracking-tight text-white font-serif">
                                {isLoading ? (
                                    <div className="h-6 w-32 animate-pulse rounded bg-white/5" />
                                ) : (
                                    channelData?.channel.name || channelId
                                )}
                            </h2>
                            <div className="mt-0.5 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.16em] text-white/22">
                                <span
                                    className={clsx(
                                        "rounded-full px-2 py-0.5",
                                        isConnecting ? "bg-amber-500/10 text-amber-300/80" : "bg-emerald-500/10 text-emerald-300/80"
                                    )}
                                >
                                    {isConnecting ? 'Reconnecting' : 'Realtime Synced'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMembersPanelOpen(!isMembersPanelOpen)}
                            className={clsx(
                                "rounded-xl border p-2.5 transition-all duration-300",
                                isMembersPanelOpen ? "border-brand-accent/20 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/15" : "border-transparent text-white/40 hover:border-white/6 hover:bg-white/5 hover:text-white"
                            )}
                            title="Toggle Member List"
                            aria-label="Toggle member list"
                        >
                            <Users size={16} strokeWidth={2.5} />
                        </button>
                        {channelData?.isAdmin && (
                            <button
                                onClick={() => setIsAddMemberOpen(true)}
                                className="rounded-xl border border-transparent p-2.5 text-white/40 transition-all duration-300 hover:border-white/6 hover:bg-white/5 hover:text-white"
                                title="Add Member"
                                aria-label="Add member"
                            >
                                <UserPlus size={16} strokeWidth={2.5} />
                            </button>
                        )}
                        {!channelData?.isAdmin && channelData && (
                            <button
                                onClick={() => setIsLeaveConfirmOpen(true)}
                                className="rounded-xl border border-transparent p-2.5 text-white/30 transition-all duration-300 hover:border-red-500/12 hover:bg-red-500/10 hover:text-red-400"
                                title="Leave Channel"
                                aria-label="Leave channel"
                            >
                                <LogOut size={15} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages Scroll Area */}
                <div
                    ref={scrollContainerRef}
                    className="page-fade-mask flex-1 overflow-y-auto scrollbar-hide"
                >
                    <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-1 py-6 md:px-4">

                        {/* Load Earlier Messages */}
                        {hasMore && !isLoading && (
                            <div className="sticky top-4 z-10 mb-6 flex justify-center">
                                <button
                                    onClick={loadOlderMessages}
                                    disabled={isLoadingOlder}
                                    className="flex items-center gap-2 rounded-full border border-white/6 bg-brand-surface/85 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/30 shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-200 hover:border-white/10 hover:bg-brand-surface hover:text-white/60 disabled:opacity-50"
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
                            <div className="flex min-h-104 flex-1 flex-col items-center justify-center text-white/10 animate-in fade-in zoom-in duration-1000">
                                <div className="mb-8 rounded-full border border-white/5 bg-white/2 p-5 shadow-inner">
                                    <Hash size={64} className="opacity-10 animate-pulse" />
                                </div>
                                <h3 className="font-serif text-2xl font-black uppercase tracking-tight text-white/30">Loading Messages</h3>
                            </div>
                        ) : processedMessages.length === 0 ? (
                            <div className="flex min-h-112 flex-1 flex-col items-center justify-center text-white/10 animate-in fade-in zoom-in duration-1000">
                                <div className="mb-8 rounded-full border border-white/5 bg-white/2 p-5 shadow-inner">
                                    <Hash size={64} />
                                </div>
                                <h3 className="font-serif text-2xl font-black uppercase tracking-tight text-white">Channel History Starts Here</h3>
                                <p className="mt-4 max-w-xs text-center text-sm font-medium leading-relaxed text-white/40">
                                    This is the very beginning of the <strong className="text-brand-accent-soft">#{channelData?.channel.name}</strong> history. Make it count.
                                </p>
                                {channelData?.isAdmin && (
                                    <button
                                        onClick={() => setIsAddMemberOpen(true)}
                                        className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/55 transition-all duration-300 hover:border-white/12 hover:bg-white/8 hover:text-white"
                                    >
                                        <UserPlus size={14} />
                                        Invite Your First Member
                                    </button>
                                )}
                            </div>
                        ) : (
                            processedMessages.map((item) => (
                                <Fragment key={item.message._id}>
                                    {item.showDateSeparator && (
                                        <div className="pointer-events-none my-10 flex items-center gap-6 px-4 opacity-40 select-none">
                                            <div className="h-px flex-1 bg-white/5"></div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                                {item.dateLabel}
                                            </span>
                                            <div className="h-px flex-1 bg-white/5"></div>
                                        </div>
                                    )}
                                    <div data-message-id={item.message._id}>
                                        <MessageItem
                                            message={item.message}
                                            consecutive={item.isConsecutive}
                                            isCurrentUser={item.message.author?._id === userData?.userId}
                                            isAdmin={item.message.author?._id === channelData?.channel?.admin}
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
                        <div ref={messagesEndRef} className="h-12" />
                    </div>
                </div>

                <AnimatePresence>
                    {showScrollToBottom && (
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 450, damping: 25 }}
                            className="pointer-events-none absolute bottom-28 right-4 z-20 md:right-8"
                        >
                            <button
                                onClick={() => scrollToBottom("smooth")}
                                className="group pointer-events-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-white/50 shadow-[0_16px_32px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:bg-white/10 hover:text-white hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,1)] active:scale-90"
                                title="Scroll to bottom"
                                aria-label="Scroll to bottom"
                            >
                                <ChevronDown size={20} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-y-0.5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="relative z-20 shrink-0 bg-brand-dark pt-2">
                    {/* Typing Indicator */}
                    {Object.keys(typingUsers).length > 0 && (
                        <div className="mx-auto flex w-full max-w-5xl px-4 pb-2 pt-3 md:px-8">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/6 bg-brand-surface/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-1 opacity-50">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
                                </div>
                                <span className="truncate max-w-[220px]">
                                    <span className="text-white/60">{Object.values(typingUsers).join(", ")}</span> {Object.keys(typingUsers).length === 1 ? "is typing..." : "are typing..."}
                                </span>
                            </div>
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
                onClose={() => setIsMembersPanelOpen(false)}
            />
        </div>
    );
}

export default ChatArea
