import { Check, Send } from "lucide-react";
import clsx from "clsx";

interface SubmitBtnProps {
    inputValue: string;
    file: File | null;
    disabled: boolean;
    isUploading: boolean;
    isSubmitting: boolean;
    isEditing: boolean;
}

const SubmitBtn = ({ inputValue, file, disabled, isUploading, isSubmitting, isEditing }: SubmitBtnProps) => {
    return (
        <button
            type="submit"
            disabled={(!inputValue.trim() && !file) || disabled || isUploading || isSubmitting}
            aria-label={isUploading ? "Uploading file..." : isEditing ? "Save edit" : "Send message"}
            title={isEditing ? "Save edit" : "Send message"}
            className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                isUploading || isSubmitting
                    ? "bg-brand-accent/50 text-white animate-pulse"
                    : (inputValue.trim() || file)
                        ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20 opacity-100 rotate-45"
                        : "bg-white/5 text-white/20 opacity-40"
            )}
        >
            {isUploading || isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white transition-all rounded-full animate-spin" />
            ) : (
                isEditing ? <Check size={16} /> : <Send size={16} />
            )}
        </button>
    )
}

export default SubmitBtn
