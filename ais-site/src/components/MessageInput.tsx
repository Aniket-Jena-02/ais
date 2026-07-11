import { useState, useRef, useEffect, type ChangeEvent } from "react"
import {
    Send,
    Smile,
    PlusCircle,
    Gift,
    X,
    Reply,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Message } from "./MessageItem"
import { useClickAway } from "ahooks"
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react"
import clsx from "clsx"
import { useEditMode } from "#/stores/message.store"

export interface FileAttachment {
    name: string;
    type: string;
    size: number;
    url: string;
}

interface MessageInputProps {
    onSendMessage: (content: string, file?: FileAttachment) => void;
    placeholder?: string;
    disabled?: boolean;
    onTyping: () => void;
    replyingTo?: Message | null;
    onCancelReply?: () => void;
    channelId?: string;
}

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

const getFileBadge = (file: File) => {
    if (file.type.startsWith("image/")) {
        return file.type.replace("image/", "").toUpperCase()
    }

    return file.name.split(".").pop()?.toUpperCase() || "FILE"
}

const MessageInput = ({ onSendMessage, placeholder, disabled, onTyping, replyingTo, onCancelReply, channelId }: MessageInputProps) => {
    const [isUploading, setIsUploading] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const emojiPickerRef = useRef<HTMLDivElement>(null)

    const { editMode, content: editContent, disableEditMode } = useEditMode()

    useClickAway(() => {
        setShowEmojiPicker(false)
    }, emojiPickerRef)

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setInputValue((prev) => prev + emojiData.emoji)
        textareaRef.current?.focus()
    }

    // Auto-focus textarea when reply mode activates
    useEffect(() => {
        if (replyingTo && textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [replyingTo])

    // Pre-fill and auto-focus textarea when edit mode activates
    useEffect(() => {
        if (editMode && textareaRef.current) {
            setInputValue(editContent)
            textareaRef.current.focus()
            // Move cursor to end
            setTimeout(() => {
                if (textareaRef.current) textareaRef.current.selectionStart = editContent.length
            }, 10)
        } else if (!editMode && !replyingTo) {
            setInputValue("")
        }
    }, [editMode, editContent])

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        textarea.style.height = "0px"
        textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`
    }, [inputValue])

    const handleSubmit = async (e?: React.SubmitEvent<HTMLFormElement>) => {
        e?.preventDefault()
        if (!inputValue.trim() && !file) return
        if (disabled || isUploading) return

        let fileAttachment: FileAttachment | undefined

        if (file && channelId) {
            setIsUploading(true)
            try {
                const formData = new FormData()
                formData.append("file", file)

                const res = await fetch(`${import.meta.env.VITE_API}/channels/${channelId}/upload`, {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                })

                if (!res.ok) {
                    const data = await res.json()
                    alert(data.msg || "Upload failed")
                    setIsUploading(false)
                    return
                }

                fileAttachment = await res.json()
            } catch (err) {
                console.error("File upload error:", err)
                alert("Failed to upload file")
                setIsUploading(false)
                return
            } finally {
                setIsUploading(false)
            }
        }

        const content = inputValue.trim() || (fileAttachment ? `📎 ${fileAttachment.name}` : "")
        if (!content) return

        onSendMessage(content, fileAttachment)
        setInputValue("")
        deselectFile()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const [file, setFile] = useState<File | null>(null)
    const [filePath, setFilePath] = useState("")
    const isImageFile = file?.type.startsWith("image/") ?? false

    const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        const file = e.currentTarget.files?.[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert("File size must be less than 10MB")
                e.currentTarget.value = ""
                return
            }
            setFile(file)
        }
    }

    const deselectFile = () => {
        setFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    useEffect(() => {
        if (!file) {
            setFilePath("")
            return
        }

        const previewUrl = URL.createObjectURL(file)
        setFilePath(previewUrl)

        return () => {
            URL.revokeObjectURL(previewUrl)
        }
    }, [file])

    const replyAuthorName = replyingTo?.author?.name?.trim() || "Unknown"
    const replyPreview = replyingTo?.content?.trim() || "Original message"
    const editPreview = editContent?.trim() || "Original message"

    return (
        <div className="bg-brand-dark p-4 md:px-8 md:pb-8">
            <div className="max-w-5xl mx-auto relative">
                <div className="relative group">

                    {/* Previews Container */}
                    <div className="flex flex-col">
                        <AnimatePresence initial={false}>
                            {file && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: 6, height: 0 }}
                                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className={clsx(
                                        "relative border border-white/5 border-b-0 bg-brand-surface overflow-hidden group-focus-within:border-brand-accent transition-colors duration-200",
                                        "rounded-t-xl"
                                    )}>
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_42%)] pointer-events-none" />

                                        <div className="relative flex items-center justify-between px-4 py-2.5">
                                            <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                                                <div className={clsx(
                                                    "shrink-0 overflow-hidden bg-black flex items-center justify-center border border-white/10 relative",
                                                    isImageFile ? "rounded-md max-w-32 max-h-32" : "w-8 h-8 rounded bg-brand-dark"
                                                )}>
                                                    {isImageFile ? (
                                                        <img src={filePath} alt={file.name} className="w-auto h-auto max-w-full max-h-32 object-contain" />
                                                    ) : (
                                                        <span className="text-[8px] font-black tracking-widest text-white/50">{getFileBadge(file)}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col justify-center min-w-0">
                                                    <span className="text-[13px] font-semibold text-white/90 truncate">{file.name}</span>
                                                    <span className="text-[11px] font-medium text-white/30 truncate mt-0.5">{formatFileSize(file.size)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={deselectFile}
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-500/70 transition-all duration-200 hover:border-red-500/60 hover:text-red-500 hover:bg-red-500/20"
                                                    title="Remove file"
                                                    aria-label="Remove file"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ─── Reply Context Bar ─── */}
                        <AnimatePresence>
                            {replyingTo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: 4, height: 0 }}
                                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className={clsx(
                                        "relative border border-white/5 border-b-0 bg-brand-surface overflow-hidden group-focus-within:border-brand-accent transition-colors duration-200",
                                        !file && "rounded-t-xl"
                                    )}>
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_42%)] pointer-events-none" />

                                        <div className="relative flex items-center justify-between px-4 py-2.5">
                                            <div className="flex items-center gap-2 pl-2.5 py-1 border-l-2 border-brand-accent/30 bg-transparent rounded-r-md max-w-md text-left flex-1 min-w-0 mr-4">
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <Reply size={10} className="text-brand-accent/50" />
                                                    <span className="text-[11px] font-black tracking-tight text-brand-accent/60">
                                                        {replyAuthorName}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-white/30 truncate font-medium border-l border-white/10 pl-2">
                                                    {replyPreview}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={onCancelReply}
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-500/70 transition-all duration-200 hover:border-red-500/60 hover:text-red-500 hover:bg-red-500/20"
                                                    title="Cancel reply"
                                                    aria-label="Cancel reply"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ─── Edit Context Bar ─── */}
                        <AnimatePresence>
                            {editMode && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: 4, height: 0 }}
                                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className={clsx(
                                        "relative border border-white/5 border-b-0 bg-brand-surface overflow-hidden group-focus-within:border-brand-accent transition-colors duration-200",
                                        !file && !replyingTo && "rounded-t-xl"
                                    )}>
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_42%)] pointer-events-none" />

                                        <div className="relative flex items-center justify-between px-4 py-2.5">
                                            <div className="flex items-center gap-2 pl-2.5 py-1 border-l-2 border-brand-accent/30 bg-transparent rounded-r-md max-w-md text-left flex-1 min-w-0 mr-4">
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[11px] font-black tracking-tight text-brand-accent/60">
                                                        EDITING
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-white/30 truncate font-medium border-l border-white/10 pl-2">
                                                    {editPreview}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={disableEditMode}
                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-500/70 transition-all duration-200 hover:border-red-500/60 hover:text-red-500 hover:bg-red-500/20"
                                                    title="Cancel edit"
                                                    aria-label="Cancel edit"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <form
                        onSubmit={(e) => handleSubmit(e)}
                        className={clsx(
                            "flex flex-col bg-brand-surface backdrop-blur-md border",
                            disabled && "opacity-50 pointer-events-none",
                            "focus-within:bg-brand-surface focus-within:border-brand-accent",
                            "border-white/5",
                            (replyingTo || file || editMode) ? "rounded-b-xl rounded-t-none border-t-0" : "rounded-xl"
                        )}
                    >
                        <div className="flex items-end pr-2 py-2 group ">
                            {/* Attach Button (hidden when editing) */}
                            <div className="pl-2 pb-1">
                                {!editMode && (
                                    <>
                                        <label htmlFor="file-upload">
                                            <div
                                                title="Attach a file (max 10MB)"
                                                aria-label="Attach a file (max 10MB)"
                                                className="p-2 rounded-full text-white/15 hover:text-white transition-all duration-200 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                <PlusCircle size={22} />
                                            </div>
                                        </label>
                                        <input type="file" name="file" hidden
                                            id="file-upload"
                                            ref={fileInputRef}
                                            onChange={selectFile}
                                        />
                                    </>
                                )}
                            </div>

                            {/* Textarea / Input */}
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value)
                                    onTyping()
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={replyingTo
                                    ? `Reply to ${replyingTo.author?.name || "message"}…`
                                    : placeholder || "Type a message..."}
                                className="w-full bg-transparent resize-none overflow-y-auto min-h-11 max-h-48 py-3 px-3 text-[15px] leading-relaxed text-white focus:outline-none placeholder:text-white/20 font-medium font-sans scrollbar-hide"
                            />

                            {/* Action Buttons Right */}
                            <div className="flex items-center gap-1 pb-1">
                                <button
                                    type="button"
                                    disabled
                                    title="Gifting coming soon"
                                    aria-label="Gifting coming soon"
                                    className="hidden sm:flex p-2 rounded-full text-white/15 transition-all disabled:cursor-not-allowed"
                                >
                                    <Gift size={20} />
                                </button>

                                <div className="relative flex items-center" ref={emojiPickerRef}>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                                        title="Add emoji"
                                        aria-label="Add emoji"
                                        className={clsx(
                                            "p-2 rounded-full transition-all duration-200",
                                            showEmojiPicker ? "text-brand-accent bg-brand-accent/10" : "text-white/15 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <Smile size={20} />
                                    </button>

                                    <AnimatePresence>
                                        {showEmojiPicker && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.15, ease: "easeOut" }}
                                                className="absolute bottom-[115%] right-0 mb-2 z-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] rounded-2xl overflow-hidden border border-white/5 bg-brand-surface/95 backdrop-blur-xl"
                                            >
                                                <EmojiPicker
                                                    theme={Theme.DARK}
                                                    onEmojiClick={onEmojiClick}
                                                    autoFocusSearch={false}
                                                    lazyLoadEmojis={true}
                                                    style={{
                                                        fontFamily: '"Manrope", sans-serif',
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        '--epr-bg-color': 'transparent',
                                                        '--epr-category-label-bg-color': 'transparent',
                                                        '--epr-picker-border-color': 'transparent',
                                                        '--epr-hover-bg-color': 'rgba(255,255,255,0.06)',
                                                        '--epr-focus-bg-color': 'rgba(255,255,255,0.06)',
                                                        '--epr-search-border-color': 'rgba(255,255,255,0.08)',
                                                        '--epr-search-input-bg-color': 'rgba(0,0,0,0.2)',
                                                        '--epr-search-input-text-color': 'rgba(255,255,255,0.9)',
                                                        '--epr-text-color': 'rgba(255,255,255,0.6)',
                                                        '--epr-category-icon-active-color': '#D44E28',
                                                        '--epr-category-icon-hover-color': '#F26A45',
                                                    } as any}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="w-px h-6 bg-white/5 mx-1 hidden sm:block" />

                                <button
                                    type="submit"
                                    disabled={(!inputValue.trim() && !file) || disabled || isUploading}
                                    aria-label={isUploading ? "Uploading file..." : "Send message"}
                                    className={clsx(
                                        "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                                        isUploading
                                            ? "bg-brand-accent/50 text-white animate-pulse"
                                            : (inputValue.trim() || file)
                                                ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20 opacity-100"
                                                : "bg-white/5 text-white/20 opacity-40"
                                    )}
                                >
                                    {isUploading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Status / Hints */}
                    <div className="absolute -bottom-6 left-4 flex gap-6 select-none pointer-events-none">
                        <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/20">
                                <span className="text-brand-accent/60">Shift + Enter</span> for new line
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessageInput
