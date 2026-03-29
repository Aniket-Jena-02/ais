import { MoreHorizontal, Reply, User, Crown, Pencil, Trash2, Check, X } from "lucide-react"
import { format, isValid } from "date-fns"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface Message {
    _id: string
    content: string
    createdAt: string
    updatedAt?: string
    author: {
        _id: string
        name: string
    }
}

interface MessageItemProps {
    message: Message
    consecutive?: boolean
    isCurrentUser?: boolean
    isAdmin?: boolean
    onEdit?: (messageId: string, newContent: string) => Promise<void>
    onDelete?: (messageId: string) => Promise<void>
}

const MessageItem = ({
    message,
    consecutive = false,
    isCurrentUser = false,
    isAdmin = false,
    onEdit,
    onDelete,
}: MessageItemProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(message.content)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const editInputRef = useRef<HTMLTextAreaElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        if (isMenuOpen) document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [isMenuOpen])

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

    return (
        <div
            className={`group relative flex gap-4 px-6 md:px-8 hover:bg-white/2 transition-colors animate-in slide-in-from-bottom-1 duration-300 fill-mode-both ${consecutive ? 'py-0 mt-0' : 'py-1 mt-6'}`}
        >
            {/* Left Gutter: Avatar (empty on consecutive messages) */}
            <div className="shrink-0 w-10 flex flex-col items-center">
                {!consecutive && (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-black shadow-lg ring-1 ring-inset ${colorClass} transition-transform group-hover:scale-105 duration-300`}>
                        {message.author?.name ? message.author.name.charAt(0).toUpperCase() : <User size={18} />}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 flex flex-col justify-start relative">
                {!consecutive && (
                    <div className="flex items-baseline gap-3 mb-1">
                        <span className="font-black text-[15px] text-white tracking-tight hover:underline cursor-pointer flex items-baseline gap-1.5 min-w-0">
                            <span className="truncate">{message.author?.name || "Unknown User"}</span>
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
            </div>

            {/* Hover Actions & Timestamp */}
            {!isEditing && (
                <div className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-3">
                    {consecutive && isValid(new Date(message.createdAt)) && (
                        <span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/10 select-none">
                            {format(new Date(message.createdAt), "h:mm a")}
                        </span>
                    )}
                    <div className="flex items-center gap-0.5 bg-brand-surface border border-white/4 shadow-2xl rounded-lg p-0.5">
                        <button className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/5 transition-all" title="Reply">
                            <Reply size={14} />
                        </button>
                        {showActions && (
                            <>
                                <div className="w-px h-3 bg-white/5 mx-0.5" />
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setIsMenuOpen((v) => !v)}
                                        className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/5 transition-all"
                                        title="More options"
                                    >
                                        <MoreHorizontal size={14} />
                                    </button>
                                    <AnimatePresence>
                                        {isMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 top-full mt-1 bg-brand-surface border border-white/6 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[130px]"
                                            >
                                                {canEdit && (
                                                    <button
                                                        onClick={() => { setIsEditing(true); setIsMenuOpen(false) }}
                                                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[12px] font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                                                    >
                                                        <Pencil size={13} />
                                                        Edit Message
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => { handleDeleteConfirm(); setIsMenuOpen(false) }}
                                                        disabled={isDeleting}
                                                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[12px] font-bold text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
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

export default MessageItem
