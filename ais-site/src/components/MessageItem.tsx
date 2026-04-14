import { MoreHorizontal, Reply, User, Crown, Pencil, Trash2, Check, X, SmilePlus } from "lucide-react"
import { format, isValid } from "date-fns"
import { memo, useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import clsx from "clsx"

export interface Reaction {
    emoji: string
    users: string[]
}

export interface ReplyTo {
    _id: string
    content: string
    author: {
        _id: string
        name: string
    }
}

export interface Message {
    _id: string
    content: string
    createdAt: string
    updatedAt?: string
    author: {
        _id: string
        name: string
    }
    reactions?: Reaction[]
    replyTo?: ReplyTo | null
}

interface MessageItemProps {
    message: Message
    consecutive?: boolean
    isCurrentUser?: boolean
    isAdmin?: boolean
    currentUserId?: string
    onEdit?: (messageId: string, newContent: string) => Promise<void>
    onDelete?: (messageId: string) => Promise<void>
    onReact?: (messageId: string, emoji: string) => void
    onReply?: (message: Message) => void
    onScrollToMessage?: (messageId: string) => void
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🔥", "👎", "❗"]

const MessageItem = ({
    message,
    consecutive = false,
    isCurrentUser = false,
    isAdmin = false,
    currentUserId,
    onEdit,
    onDelete,
    onReact,
    onReply,
    onScrollToMessage,
}: MessageItemProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(message.content)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
    const editInputRef = useRef<HTMLTextAreaElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const emojiRef = useRef<HTMLDivElement>(null)

    // Close menu on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false)
            }
            if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
                setIsEmojiPickerOpen(false)
            }
        }
        if (isMenuOpen || isEmojiPickerOpen) document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [isMenuOpen, isEmojiPickerOpen])

    // Focus edit input when entering edit mode
    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus()
            editInputRef.current.selectionStart = editInputRef.current.value.length
        }
    }, [isEditing])

    const handleEditSubmit = async () => {
        if (!onEdit || editContent.trim() === message.content || !editContent.trim()) {
            setIsEditing(false)
            setEditContent(message.content)
            return
        }
        setIsSaving(true)
        try {
            await onEdit(message._id, editContent.trim())
            setIsEditing(false)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteConfirm = async () => {
        if (!onDelete) return
        setIsDeleting(true)
        try {
            await onDelete(message._id)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleEditSubmit()
        }
        if (e.key === "Escape") {
            setIsEditing(false)
            setEditContent(message.content)
        }
    }

    // Generate a consistent color based on the user's name
    const colors = [
        "bg-red-500/10 text-red-400 ring-red-500/20",
        "bg-blue-500/10 text-blue-400 ring-blue-500/20",
        "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
        "bg-purple-500/10 text-purple-400 ring-purple-500/20",
        "bg-amber-500/10 text-amber-400 ring-amber-500/20",
        "bg-pink-500/10 text-pink-400 ring-pink-500/20",
        "bg-indigo-500/10 text-indigo-400 ring-indigo-500/20",
    ]
    const colorIndex = message.author?.name ? message.author.name.length % colors.length : 0
    const colorClass = colors[colorIndex]

    const EDIT_WINDOW_MS = 15 * 60 * 1000
    const isEdited = !!(message.updatedAt && new Date(message.updatedAt).getTime() - new Date(message.createdAt).getTime() > 1000)
    const isWithinEditWindow = Date.now() - new Date(message.createdAt).getTime() < EDIT_WINDOW_MS

    const canEdit = isCurrentUser && !!onEdit && isWithinEditWindow
    const canDelete = (isCurrentUser || isAdmin) && !!onDelete
    const showActions = canEdit || canDelete

    const hasReactions = message.reactions && message.reactions.length > 0

    return (
        <div
            className={clsx(
                "group relative flex gap-4 px-6 md:px-8 hover:bg-white/1.5 transition-colors animate-in slide-in-from-bottom-1 duration-300 fill-mode-both",
                consecutive ? "py-[3px] mt-0" : "pt-2 pb-[3px] mt-5"
            )}
        >
            {/* Left Gutter: Avatar */}
            <div className="shrink-0 w-10 flex flex-col items-center">
                {!consecutive && (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-black shadow-lg ring-1 ring-inset ${colorClass} transition-transform group-hover:scale-105 duration-300`}>
                        {message.author?.name ? message.author.name.charAt(0).toUpperCase() : <User size={18} />}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 flex flex-col justify-start relative">

                {/* ─── Reply Quote Block ─── */}
                {message.replyTo && (
                    <button
                        aria-label={`Scroll to replied message by ${message.replyTo.author?.name || "Unknown"}`}
                        onClick={() => message.replyTo && onScrollToMessage?.(message.replyTo._id)}
                        className="mb-2 pl-3 py-1.5 border-l-2 border-brand-accent/30 rounded-r-md bg-white/2 max-w-md text-left cursor-pointer hover:bg-white/4 transition-colors duration-150 block"
                        aria-label={`Scroll to reply from ${message.replyTo.author?.name || "Unknown"}`}
                    >
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Reply size={10} className="text-brand-accent/50 shrink-0" />
                            <span className="text-[11px] font-black tracking-tight text-brand-accent/60">{message.replyTo.author?.name || "Unknown"}</span>
                        </div>
                        <p className="text-[12px] text-white/30 leading-snug truncate font-medium">{message.replyTo.content}</p>
                    </button>
                )}

                {!consecutive && (
                    <div className="flex items-baseline gap-3 mb-1">
                        <span className="font-black text-[15px] text-white tracking-tight cursor-pointer flex items-baseline gap-1.5 min-w-0">
                            <span className="truncate hover:underline">{message.author?.name || "Unknown User"}</span>
                            {isAdmin && (
                                <span className="text-amber-400 bg-amber-500/10 p-0.5 rounded flex items-center justify-center -translate-y-px" title="Channel Admin">
                                    <Crown size={12} strokeWidth={2.5} />
                                </span>
                            )}
                            {isCurrentUser && <span className="text-[9px] text-brand-accent/80 font-black uppercase tracking-widest px-1 py-0.5 rounded bg-brand-accent/10 whitespace-nowrap">(you)</span>}
                        </span>
                        {isValid(new Date(message.createdAt)) && (
                            <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                                {format(new Date(message.createdAt), "h:mm a")}
                            </span>
                        )}
                    </div>
                )}

                {/* Edit mode */}
                {isEditing ? (
                    <div className="flex flex-col gap-2 mt-1">
                        <textarea
                            ref={editInputRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={Math.min(editContent.split("\n").length + 1, 6)}
                            className="w-full bg-brand-muted/60 border border-brand-accent/30 rounded-lg px-3 py-2 text-white/80 text-[15px] font-sans resize-none focus:outline-none focus:border-brand-accent/60 transition-colors"
                        />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleEditSubmit}
                                disabled={isSaving}
                                className="px-3 py-1 rounded-md bg-brand-accent text-white text-[11px] font-black uppercase tracking-wider hover:scale-[1.04] active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                            >
                                <Check size={12} />
                                Save
                            </button>
                            <button
                                onClick={() => { setIsEditing(false); setEditContent(message.content) }}
                                className="px-3 py-1 rounded-md text-white/40 hover:text-white/70 text-[11px] font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                            >
                                <X size={12} />
                                Cancel
                            </button>
                            <span className="text-[10px] text-white/20 ml-1">↵ save · esc cancel</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-white/70 text-[15px] leading-relaxed font-sans whitespace-pre-wrap">
                        {message.content}
                        {isEdited && (
                            <span className="ml-1.5 text-[10px] text-white/20 font-semibold italic tracking-wide align-baseline">(edited)</span>
                        )}
                    </div>
                )}

                {/* ─── Reactions Bar ─── */}
                {hasReactions && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-wrap items-center gap-1 mt-1.5"
                    >
                        {message.reactions!.map((reaction) => {
                            const hasReacted = currentUserId && reaction.users.includes(currentUserId)
                            return (
                                <motion.button
                                    key={reaction.emoji}
                                    aria-label={`React with ${reaction.emoji}`}
                                    aria-pressed={!!hasReacted}
                                    whileTap={{ scale: 0.88 }}
                                    onClick={() => onReact?.(message._id, reaction.emoji)}
                                    className={clsx(
                                        "inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[13px] border transition-all duration-200",
                                        hasReacted
                                            ? "bg-brand-accent/6 border-white/8 shadow-[0_0_6px_rgba(212,78,40,0.04)]"
                                            : "bg-white/3 border-white/4 hover:bg-white/6 hover:border-white/8"
                                    )}
                                    title={`${reaction.users.length} ${reaction.users.length === 1 ? 'reaction' : 'reactions'}`}
                                    aria-label={`Reaction ${reaction.emoji}, ${reaction.users.length} ${reaction.users.length === 1 ? 'person' : 'people'} reacted`}
                                    aria-pressed={!!hasReacted}
                                >
                                    <span className="leading-none">{reaction.emoji}</span>
                                    <span className={`text-[11px] font-black tabular-nums ${hasReacted ? 'text-brand-accent/60' : 'text-white/30'}`}>
                                        {reaction.users.length}
                                    </span>
                                </motion.button>
                            )
                        })}

                        {/* Inline add-reaction shortcut */}
                        <button
                            aria-label="Add reaction"
                            aria-haspopup="dialog"
                            aria-expanded={isEmojiPickerOpen}
                            onClick={() => setIsEmojiPickerOpen(true)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-dashed border-white/5 text-white/12 hover:text-white/30 hover:border-white/8 hover:bg-white/3 transition-all duration-200"
                            title="Add reaction"
                            aria-label="Add reaction"
                            aria-expanded={isEmojiPickerOpen}
                        >
                            <SmilePlus size={13} />
                        </button>
                    </motion.div>
                )}
            </div>

            {/* ─── Hover Toolbar ─── */}
            {!isEditing && (
                <div className="absolute -top-3 right-8 opacity-0 group-hover:opacity-100 transition-all duration-150 z-10 flex items-center gap-3 translate-y-1 group-hover:translate-y-0">
                    {consecutive && isValid(new Date(message.createdAt)) && (
                        <span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/10 select-none mr-1">
                            {format(new Date(message.createdAt), "h:mm a")}
                        </span>
                    )}
                    <div className="flex items-center gap-0.5 bg-brand-surface/95 backdrop-blur-md border border-white/6 shadow-2xl shadow-black/40 rounded-lg p-0.5">
                        {/* Emoji Reaction Trigger */}
                        <div className="relative" ref={emojiRef}>
                            <button
                                aria-label="Add reaction"
                                aria-haspopup="dialog"
                                aria-expanded={isEmojiPickerOpen}
                                onClick={() => setIsEmojiPickerOpen((v) => !v)}
                                className="p-1.5 rounded-md text-white/25 hover:text-brand-accent-soft hover:bg-brand-accent/8 transition-all duration-150"
                                title="Add reaction"
                                aria-label="Add reaction"
                                aria-expanded={isEmojiPickerOpen}
                            >
                                <SmilePlus size={15} />
                            </button>
                            <AnimatePresence>
                                {isEmojiPickerOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.92, y: 4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.92, y: 4 }}
                                        transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                                        className="absolute right-0 bottom-full mb-2 bg-brand-surface/95 backdrop-blur-xl border border-white/6 rounded-xl shadow-2xl shadow-black/50 p-1 flex gap-0.5 z-50"
                                    >
                                        {REACTION_EMOJIS.map((emoji) => (
                                            <motion.button
                                                key={emoji}
                                                aria-label={`React with ${emoji}`}
                                                whileHover={{ scale: 1.25 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => {
                                                    onReact?.(message._id, emoji)
                                                    setIsEmojiPickerOpen(false)
                                                }}
                                                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/6 transition-colors duration-100 text-[18px] cursor-pointer"
                                                aria-label={`React with ${emoji}`}
                                            >
                                                {emoji}
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Reply */}
                        <button
                            aria-label="Reply to message"
                            onClick={() => onReply?.(message)}
                            className="p-1.5 rounded-md text-white/25 hover:text-blue-400 hover:bg-blue-500/8 transition-all duration-150"
                            title="Reply"
                            aria-label="Reply to message"
                        >
                            <Reply size={15} />
                        </button>

                        {showActions && (
                            <>
                                <div className="w-px h-4 bg-white/5 mx-0.5" />
                                <div className="relative" ref={menuRef}>
                                    <button
                                        aria-label="More options"
                                        aria-haspopup="menu"
                                        aria-expanded={isMenuOpen}
                                        onClick={() => setIsMenuOpen((v) => !v)}
                                        className="p-1.5 rounded-md text-white/25 hover:text-white/60 hover:bg-white/5 transition-all duration-150"
                                        title="More options"
                                        aria-label="More options"
                                        aria-expanded={isMenuOpen}
                                    >
                                        <MoreHorizontal size={15} />
                                    </button>
                                    <AnimatePresence>
                                        {isMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                                transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                                                className="absolute right-0 bottom-full mb-2 bg-brand-surface/95 backdrop-blur-xl border border-white/6 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 min-w-[140px]"
                                            >
                                                {canEdit && (
                                                    <button
                                                        onClick={() => { setIsEditing(true); setIsMenuOpen(false) }}
                                                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[12px] font-bold text-white/50 hover:text-white hover:bg-white/4 transition-all duration-150"
                                                    >
                                                        <Pencil size={13} />
                                                        Edit Message
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => { handleDeleteConfirm(); setIsMenuOpen(false) }}
                                                        disabled={isDeleting}
                                                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[12px] font-bold text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-all duration-150 disabled:opacity-50"
                                                    >
                                                        <Trash2 size={13} />
                                                        {isDeleting ? "Deleting…" : "Delete"}
                                                    </button>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

MessageItem.displayName = "MessageItem"

export default memo(MessageItem)
