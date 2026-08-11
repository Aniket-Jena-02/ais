import { AnimatePresence } from "framer-motion";
import EmojiPickerBtn from "./EmojiPickerBtn";
import GiftingBtn from "./GiftingBtn";
import MicrophoneBtn from "./MicrophoneBtn";
import CustomEmojiPicker from "./CustomEmojiPicker";
import SubmitBtn from "./SubmitBtn";
import { useRef, useState } from "react";
import { useClickAway } from "ahooks";
import type { EmojiClickData } from "emoji-picker-react";

interface ActionBtnsRightProps {
  inputValue: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  file: File | null;
  disabled: boolean;
  isUploading: boolean;
}

const ActionBtnsRight = ({ inputValue, textareaRef, setInputValue, file, disabled, isUploading }: ActionBtnsRightProps) => {
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useClickAway(() => {
    setShowEmojiPicker(false)
  }, emojiPickerRef)

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue((prev) => prev + emojiData.emoji)
    textareaRef.current?.focus()
  }


  return (
    <div className="flex items-center gap-1 pb-1">
      <MicrophoneBtn />
      <GiftingBtn />
      <div className="relative flex items-center" ref={emojiPickerRef}>
        <EmojiPickerBtn onclick={() => setShowEmojiPicker((prev) => !prev)} showEmojiPicker={showEmojiPicker} />
        <AnimatePresence>
          {showEmojiPicker && (
            <CustomEmojiPicker onEmojiClick={onEmojiClick} />
          )}
        </AnimatePresence>
      </div>

      <div className="w-px h-6 bg-white/5 mx-1 hidden sm:block" />

      <SubmitBtn
        inputValue={inputValue}
        file={file}
        disabled={disabled ?? true}
        isUploading={isUploading}
      />
    </div>
  )
}

export default ActionBtnsRight