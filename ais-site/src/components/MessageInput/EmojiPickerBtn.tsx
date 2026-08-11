import { clsx } from "clsx";
import { Smile } from "lucide-react";

interface EmojiPickerBtnProps {
    onclick: () => void;
    showEmojiPicker: boolean;
}

const EmojiPickerBtn = ({ onclick, showEmojiPicker }: EmojiPickerBtnProps) => {
    return (
        <button
            type="button"
            onClick={onclick}
            title="Add emoji"
            aria-label="Add emoji"
            className={clsx(
                "p-2 rounded-full transition-all duration-200",
                showEmojiPicker ? "text-brand-accent bg-brand-accent/10" : "text-white/15 hover:text-white hover:bg-white/5"
            )}
        >
            <Smile size={20} />
        </button>
    )
}

export default EmojiPickerBtn