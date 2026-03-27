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
        <div className="p-4 md:px-8 md:pb-8 bg-brand-dark">
            <div className="max-w-5xl mx-auto relative">
                <div className="relative group">
                    <form
                        onSubmit={(e) => handleSubmit(e)}
                        className={`flex flex-col bg-brand-surface/60 backdrop-blur-md rounded-xl border transition-all duration-300
                            ${disabled ? 'opacity-50 pointer-events-none' : ''}
                            focus-within:bg-brand-surface/90 focus-within:border-brand-accent/40 focus-within:shadow-[0_0_20px_rgba(110,64,242,0.05)]
                            border-white/5
                        `}
                    >
                        <div className="flex items-end pr-2 py-2">
                            {/* Attach Button */}
                            <div className="pl-2 pb-2">
                                <button
                                    type="button"
                                    className="p-2 rounded-full text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
                                >
                                    <PlusCircle size={22} />
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
                                className="w-full bg-transparent resize-none min-h-[44px] max-h-48 py-3 px-3 text-[15px] leading-relaxed text-white focus:outline-none placeholder:text-white/20 font-medium font-sans"
                            />

                            {/* Action Buttons Right */}
                            <div className="flex items-center gap-1 pb-1">
                                <button
                                    type="button"
                                    className="hidden sm:flex p-2 rounded-full text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                                >
                                    <Gift size={20} />
                                </button>
                                <button
                                    type="button"
                                    className="p-2 rounded-full text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                                >
                                    <Smile size={20} />
                                </button>

                                <div className="w-px h-6 bg-white/5 mx-1 hidden sm:block" />

                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || disabled}
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
