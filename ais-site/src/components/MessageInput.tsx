import { useState, useRef, useEffect, type SubmitEvent } from "react"
import {
    Send,
    Smile,
    PlusCircle,
    Gift,
    X,
    Reply
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Message } from "./MessageItem"
import { useKeyPress } from "ahooks";
import clsx from "clsx"

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    placeholder?: string;
    disabled?: boolean;
    onTyping: () => void;
    replyingTo?: Message | null;
    onCancelReply?: () => void;
}

const MessageInput = ({ onSendMessage, placeholder, disabled, onTyping, replyingTo, onCancelReply }: MessageInputProps) => {
    const [inputValue, setInputValue] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-focus textarea when reply mode activates
    useEffect(() => {
        if (replyingTo && textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [replyingTo])

    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        textarea.style.height = "0px"
        textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`
    }, [inputValue])

    // Escape key cancels reply
    useKeyPress("Esc", () => {
        if (replyingTo) {
            onCancelReply?.()
        }
    })

    const handleSubmit = (e?: SubmitEvent<HTMLFormElement>) => {
        e?.preventDefault()
        if (!inputValue.trim() || disabled) return

        onSendMessage(inputValue)
        setInputValue("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="bg-brand-dark p-4 md:px-8 md:pb-8">
            <div className="max-w-5xl mx-auto relative">
                <div className="relative group">

                    {/* ─── Reply Context Bar ─── */}
                    <AnimatePresence>
                        {replyingTo && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center gap-3 rounded-t-xl border border-white/5 border-b-0 group-focus-within:border-brand-accent bg-brand-surface px-4 py-2.5 backdrop-blur-sm">
                                    {/* Accent marker */}
                                    <div className="w-0.5 h-5 rounded-full bg-brand-accent shrink-0" />

                                    <Reply size={12} className="text-brand-accent shrink-0" />

                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="text-[11px] font-black tracking-tight text-brand-accent/60 shrink-0">
                                            {replyingTo.author?.name || "Unknown"}
                                        </span>
                                        <span className="text-[11px] text-white/20 truncate font-medium min-w-0">
                                            {replyingTo.content}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[9px] text-white/10 font-bold uppercase tracking-wider hidden sm:block">esc</span>
                                        <button
                                            onClick={onCancelReply}
                                            className="p-1 rounded-md text-white/20 hover:text-white hover:bg-white/4 transition-all duration-150"
                                            title="Cancel reply (Esc)"
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form
                        onSubmit={(e) => handleSubmit(e)}
                        className={clsx(
                            "flex flex-col bg-brand-surface backdrop-blur-md border",
                            disabled && "opacity-50 pointer-events-none",
                            "focus-within:bg-brand-surface focus-within:border-brand-accent",
                            "border-white/5",
                            replyingTo ? "rounded-b-xl rounded-t-none border-t-0" : "rounded-xl"
                        )}
                    >
                        <div className="flex items-end pr-2 py-2">
                            {/* Attach Button */}
                            <div className="pl-2 pb-2">
                                <button
                                    type="button"
                                    disabled
                                    title="Attachments coming soon"
                                    aria-label="Attachments coming soon"
                                    className="p-2 rounded-full text-white/15 transition-all duration-200 disabled:cursor-not-allowed"
                                >
                                    <PlusCircle size={22} />
                                </button>
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
                                className="w-full bg-transparent resize-none overflow-y-auto min-h-[44px] max-h-48 py-3 px-3 text-[15px] leading-relaxed text-white focus:outline-none placeholder:text-white/20 font-medium font-sans scrollbar-hide"
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
                                <button
                                    type="button"
                                    disabled
                                    title="Emoji picker coming soon"
                                    aria-label="Emoji picker coming soon"
                                    className="p-2 rounded-full text-white/15 transition-all disabled:cursor-not-allowed"
                                >
                                    <Smile size={20} />
                                </button>

                                <div className="w-px h-6 bg-white/5 mx-1 hidden sm:block" />

                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || disabled}
                                    aria-label="Send message"
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                                        ${inputValue.trim() ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20 translate-y-0 opacity-100' : 'bg-white/5 text-white/20 opacity-40 translate-y-0'}
                                    `}
                                >
                                    <Send size={18} />
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
