import EmojiPicker, { Theme } from "emoji-picker-react";
import { motion } from "framer-motion";

interface CustomEmojiPickerProps {
  onEmojiClick: (event: any, emojiObject: any) => void;
}

const CustomEmojiPicker = ({ onEmojiClick }: CustomEmojiPickerProps) => {
  return (
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
  )
}

export default CustomEmojiPicker