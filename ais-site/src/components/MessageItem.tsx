import { MoreHorizontal, Reply, User, Crown, Pencil, Trash2, SmilePlus, FileDown } from "lucide-react"
import { format, isValid } from "date-fns"
import { memo, useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import clsx from "clsx"
import { useEditMode } from "#/stores/message.store"

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB"]
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)} ${units[unitIndex]}`
}

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
  isEdited?: boolean
  author: {
    _id: string
    name: string
  }
  reactions?: Reaction[]
  replyTo?: ReplyTo | null
  file?: {
    name: string
    type: string
    size: number
    url: string
  }
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)

  const { enableEditMode, msgId, editMode } = useEditMode()

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

  // Explicit Boolean() coercion so this can never leak a non-boolean
  // (e.g. an empty array or 0) into the `{hasReactions && (...)}` check.
  const hasReactions = Boolean(message.reactions && message.reactions.length > 0)

  const handleDeleteConfirm = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(message._id)
    } finally {
      setIsDeleting(false)
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
  const isEdited = !!message.isEdited
  const isWithinEditWindow = Date.now() - new Date(message.createdAt).getTime() < EDIT_WINDOW_MS

  const canEdit = isCurrentUser && !!onEdit && isWithinEditWindow
  const canDelete = (isCurrentUser || isAdmin) && !!onDelete
  const showActions = canEdit || canDelete

  const contentNode = (
    <>
      {/* ─── Reply Quote Block ─── */}
      {message.replyTo && (
        <div className="pl-11">
          <button
            onClick={() => message.replyTo && onScrollToMessage?.(message.replyTo._id)}
            className="mb-1 flex items-center gap-1.5 pl-2 py-0.5 border-l-2 border-brand-accent/30 bg-transparent rounded-r-md max-w-md text-left cursor-pointer hover:bg-white/4 transition-colors duration-150"
            aria-label={`Scroll to reply from ${message.replyTo.author?.name || "Unknown"}`}
          >
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[11px] font-black tracking-tight text-brand-accent/60">{message.replyTo.author?.name || "Unknown"}</span>
            </div>
            <span className="text-[11px] text-white/30 truncate font-medium pl-1">
              {message.replyTo.content}</span>
          </button>
        </div>
      )}

      <div className="flex gap-3 relative">
        {/* Left Gutter: Avatar */}
        <div className="shrink-0 w-8 flex flex-col items-center">
          {!consecutive && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-black shadow-lg ring-1 ring-inset ${colorClass} duration-300`}>
              {message.author?.name ? message.author.name.charAt(0).toUpperCase() : <User size={14} />}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-start relative">
          {!consecutive && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="font-black text-[13px] text-white tracking-tight cursor-pointer flex items-baseline gap-1 min-w-0">
                <span className="truncate hover:underline">{message.author?.name || "Unknown User"}</span>
                {isAdmin && (
                  <span className="text-amber-400 bg-amber-500/10 p-0.5 rounded flex items-center justify-center -translate-y-px" title="Channel Admin">
                    <Crown size={10} strokeWidth={2.5} />
                  </span>
                )}
                {isCurrentUser && <span className="text-[8px] text-brand-accent/80 font-black uppercase tracking-widest px-1 py-0.5 rounded bg-brand-accent/10 whitespace-nowrap">(you)</span>}
              </span>
              {isValid(new Date(message.createdAt)) && (
                <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                  {format(new Date(message.createdAt), "h:mm a")}
                </span>
              )}
            </div>
          )}

          <div className="text-white/70 text-[13px] leading-relaxed font-sans whitespace-pre-wrap">
            {!message.file?.url && message.content}
            {isEdited && (
              <span className="ml-1 text-[9px] text-white/20 font-semibold italic tracking-wide align-baseline">(edited)</span>
            )}
          </div>

          {/* ─── File Attachment ─── */}
          {message.file?.url && (
            <div className="mt-1.5 w-fit">
              {message.file.type?.startsWith("image/") ? (
                <a
                  href={`${import.meta.env.VITE_API}${message.file.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block max-w-sm group/img w-fit"
                >
                  <div className="relative overflow-hidden rounded-lg border border-white/6 bg-white/2 transition-all duration-300">
                    <img
                      src={`${message.file.url}`}
                      alt={message.file.name}
                      loading="eager"
                      className="max-h-65 w-auto object-contain rounded-lg transition-transform duration-300"
                    />
                  </div>
                </a>
              ) : (
                <a
                  href={message.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={message.file.name}
                  className="inline-flex items-center gap-2.5 px-3 py-2 rounded-lg border border-white/6 bg-white/2 hover:bg-white/5 hover:border-white/10 transition-all duration-200 max-w-sm group/file"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-accent/10 text-brand-accent">
                    <FileDown size={15} />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-[12px] font-semibold text-white/70 truncate">
                      {message.file.name}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/20">
                      {formatFileSize(message.file.size)} · {message.file.type?.split("/").pop()?.toUpperCase() || "FILE"}
                    </span>
                  </div>
                </a>
              )}
            </div>
          )}

          {/* ─── Reactions Bar ─── */}
          {hasReactions && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap items-center gap-1 mt-1"
            >
              {message.reactions?.map((reaction) => {
                const hasReacted = Boolean(currentUserId && reaction.users.includes(currentUserId))
                return (
                  <motion.button
                    key={reaction.emoji}
                    aria-pressed={hasReacted}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => onReact?.(message._id, reaction.emoji)}
                    className={clsx(
                      "inline-flex items-center gap-1 h-6 px-1.5 rounded-md text-[12px] border transition-all duration-200",
                      hasReacted
                        ? "bg-brand-accent/6 border-white/8 shadow-[0_0_6px_rgba(212,78,40,0.04)]"
                        : "bg-white/3 border-white/4 hover:bg-white/6 hover:border-white/8"
                    )}
                    title={`${reaction.users.length} ${reaction.users.length === 1 ? 'reaction' : 'reactions'}`}
                    aria-label={`Reaction ${reaction.emoji}, ${reaction.users.length} ${reaction.users.length === 1 ? 'person' : 'people'} reacted`}
                  >
                    <span className="leading-none">{reaction.emoji}</span>
                    <span className={`text-[10px] font-black tabular-nums ${hasReacted ? 'text-brand-accent/60' : 'text-white/30'}`}>
                      {reaction.users.length}
                    </span>
                  </motion.button>
                )
              })}
              {/* Inline add-reaction shortcut */}
              <button
                aria-label="Add reaction"
                aria-expanded={isEmojiPickerOpen}
                onClick={() => setIsEmojiPickerOpen(true)}
                className="inline-flex items-center justify-center w-6 h-6 rounded-md border border-dashed border-white/5 text-white/12 hover:text-white/30 hover:border-white/8 hover:bg-white/3 transition-all duration-200"
                title="Add reaction"
                aria-haspopup="menu"
              >
                <SmilePlus size={12} />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ─── Hover Toolbar ─── */}
      {!(editMode && msgId === message._id) && <div className="absolute -top-2.5 right-6 opacity-0 group-hover:opacity-100 transition-all duration-150 z-10 flex items-center gap-2.5 translate-y-1 group-hover:translate-y-0">
        {consecutive && isValid(new Date(message.createdAt)) && (
          <span className="text-[8px] font-black uppercase tracking-[0.14em] text-white/10 select-none mr-1">
            {format(new Date(message.createdAt), "h:mm a")}
          </span>
        )}
        <div className="flex items-center gap-0.5 bg-brand-surface/95 backdrop-blur-md border border-white/6 shadow-2xl shadow-black/40 rounded-lg p-0.5">
          {/* Emoji Reaction Trigger */}
          <div className="relative" ref={emojiRef}>
            <button
              aria-label="Add reaction"
              onClick={() => setIsEmojiPickerOpen((v) => !v)}
              className="p-1.5 rounded-md text-white/25 hover:text-brand-accent-soft hover:bg-brand-accent/8 transition-all duration-150"
              title="Add reaction"
              aria-haspopup="menu"
              aria-expanded={isEmojiPickerOpen}
            >
              <SmilePlus size={13} />
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
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/6 transition-colors duration-100 text-[16px] cursor-pointer"
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
          >
            <Reply size={13} />
          </button>

          {showActions && (
            <>
              <div className="w-px h-3.5 bg-white/5 mx-0.5" />
              <div className="relative" ref={menuRef}>
                <button
                  aria-label="More options"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                  onClick={() => setIsMenuOpen((v) => !v)}
                  className="p-1.5 rounded-md text-white/25 hover:text-white/60 hover:bg-white/5 transition-all duration-150"
                  title="More options"
                >
                  <MoreHorizontal size={13} />
                </button>
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 bottom-full mb-2 bg-brand-surface/95 backdrop-blur-xl border border-white/6 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 min-w-32.5"
                    >
                      {canEdit && (
                        <button
                          onClick={() => { enableEditMode(message._id, message.content); setIsMenuOpen(false) }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-bold text-white/50 hover:text-white hover:bg-white/4 transition-all duration-150"
                        >
                          <Pencil size={12} />
                          Edit Message
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => { handleDeleteConfirm(); setIsMenuOpen(false) }}
                          disabled={isDeleting}
                          className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-bold text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-all duration-150 disabled:opacity-50"
                        >
                          <Trash2 size={12} />
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
      </div>}
    </>
  )

  return (
    <div
      className={clsx(
        "group relative flex flex-col px-4 md:px-6 hover:bg-white/1.5 transition-colors fill-mode-both animate-in slide-in-from-bottom-1 duration-300",
        consecutive ? "py-0.5 mt-0" : "pt-1.5 pb-0.5 mt-3.5"
      )}
    >
      {contentNode}
    </div>
  );

}

MessageItem.displayName = "MessageItem"

export default memo(MessageItem)
