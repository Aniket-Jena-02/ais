import { useState, type SubmitEvent } from "react"
import {
    Send,
    Smile,
    PlusCircle,
    Gift
} from "lucide-react"

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    placeholder?: string;
    disabled?: boolean;
    onTyping: () => void;
}

const MessageInput = ({ onSendMessage, placeholder, disabled, onTyping }: MessageInputProps) => {
    const [inputValue, setInputValue] = useState("")

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
        <div className="p-4 md:p-6 bg-linear-to-t from-base-100 via-base-100 to-transparent">
            <div className="max-w-6xl mx-auto relative">
                <div className="relative group">
                    <form
                        onSubmit={(e) => handleSubmit(e)}
                        className={`flex flex-col bg-base-200/40 backdrop-blur-md rounded-2xl border transition-all duration-300 shadow-sm
                            ${disabled ? 'opacity-50 pointer-events-none' : ''}
                            focus-within:bg-base-200/80 focus-within:border-primary/40 focus-within:shadow-2xl focus-within:shadow-primary/5
                            border-base-content/5
                        `}
                    >
                        <div className="flex items-end pr-2 py-2">
                            {/* Attach Button */}
                            <div className="pl-2 pb-2">
                                <button type="button" className="btn btn-ghost btn-circle btn-sm hover:rotate-90 transition-transform">
                                    <PlusCircle size={22} className="text-base-content/50" />
                                </button>
                            </div>

                            {/* Textarea / Input */}
                            <textarea
                                rows={1}
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value)
                                    onTyping()
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder || "Type a message..."}
                                className="textarea textarea-ghost focus:bg-transparent w-full resize-none min-h-[44px] max-h-48 py-3 px-3 text-base leading-snug focus:outline-none placeholder:text-base-content/30 font-medium"
                            />

                            {/* Action Buttons Right */}
                            <div className="flex items-center gap-1 pb-1">
                                <button type="button" className="hidden sm:flex btn btn-ghost btn-circle btn-sm">
                                    <Gift size={20} className="text-base-content/40" />
                                </button>
                                <button type="button" className="btn btn-ghost btn-circle btn-sm">
                                    <Smile size={20} className="text-base-content/40" />
                                </button>

                                <div className="w-px h-6 bg-base-content/10 mx-1 hidden sm:block" />

                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || disabled}
                                    className={`btn btn-circle btn-sm transition-all duration-300
                                        ${inputValue.trim() ? 'btn-primary shadow-lg shadow-primary/30 scale-100 rotate-0' : 'btn-ghost opacity-40 scale-90 -rotate-12'}
                                    `}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Status / Hints */}
                    <div className="absolute -bottom-6 left-4 flex gap-6 select-none pointer-events-none">
                        <div className="hidden sm:flex items-center gap-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-base-content/30 group-focus-within:opacity-100 opacity-0 transition-opacity duration-500">
                                <span className="text-primary/60">Shift + Enter</span> for new line
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MessageInput
