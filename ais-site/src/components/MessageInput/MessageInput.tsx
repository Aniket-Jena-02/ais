import { useState, useRef, useEffect, type ChangeEvent } from "react"
import {
  PlusCircle,
} from "lucide-react"
import type { Message } from "../MessageItem"
import clsx from "clsx"
import { useEditMode } from "#/stores/message.store"
import ActionBtnsRight from "./ActionBtnsRight";
import StatusHints from "./StatusHints";
import ReplyPreview from "./ReplyAndEditPreview";
import { useKeyPress } from "ahooks";
import { requestSignedUploadUrl, uploadFileToSignedUrl } from "#/utils/gcs-file-upload"
import { useS2TMode } from "#/stores/s2t.store.ts";

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface MessageInputProps {
  onSendMessage: (content: string, file?: FileAttachment) => void | Promise<void>;
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { editMode, content: editContent, disableEditMode } = useEditMode()

  // Auto-focus textarea when reply mode activates
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyingTo])

  // Keep the composer as the single edit surface and focus it when edit mode activates.
  useEffect(() => {
    if (editMode) {
      setInputValue(editContent)
      requestAnimationFrame(() => {
        const textarea = textareaRef.current
        if (!textarea) return
        textarea.focus()
        textarea.setSelectionRange(editContent.length, editContent.length)
      })
    } else {
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
    if (disabled || isUploading || isSubmitting) return

    let fileAttachment: FileAttachment | undefined

    if (file && channelId) {
      setIsUploading(true)
      try {
        const uploadMeta = await requestSignedUploadUrl(channelId, file)
        await uploadFileToSignedUrl(uploadMeta.uploadUrl, file, uploadMeta.requiredUploadHeaders)

        fileAttachment = {
          name: uploadMeta.fileName || file.name,
          type: uploadMeta.contentType || file.type || "application/octet-stream",
          size: uploadMeta.size || file.size,
          url: uploadMeta.fileUrl,
        }
      } catch (err) {
        console.error("File upload error:", err)
        alert(err instanceof Error ? err.message : "Failed to upload file")
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    }


    setIsSubmitting(true)
    try {
      await onSendMessage(inputValue.trim(), fileAttachment)
      setInputValue("")
      deselectFile()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const [file, setFile] = useState<File | null>(null)
  const [filePath, setFilePath] = useState("")

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

  useKeyPress("esc", () => {
    if (file) {
      deselectFile()
    } else if (replyingTo) {
      onCancelReply?.()
    } else if (editMode) {
      disableEditMode()
    }
  })

  const replyAuthorName = replyingTo?.author?.name?.trim() || "Unknown"
  const replyPreview = replyingTo?.content?.trim() || "Original message"
  const editPreview = editContent?.trim() || "Original message"

  const { S2TMode, transcriptContent } = useS2TMode()

  useEffect(() => {
    setInputValue(prev => transcriptContent.length > 0 ? prev + " " + transcriptContent : prev)
  }, [transcriptContent])

  return (
    <div className="bg-brand-dark p-4 md:px-8 md:pb-8">
      <div className="max-w-5xl mx-auto relative">
        <div className="relative group">

          {/* Previews Container */}
          <ReplyPreview
            file={file}
            filePath={filePath}
            getFileBadge={getFileBadge}
            formatFileSize={formatFileSize}
            replyingTo={replyingTo}
            editMode={editMode}
            deselectFile={deselectFile}
            onCancelReply={onCancelReply ?? (() => { })}
            disableEditMode={disableEditMode}
            replyAuthorName={replyAuthorName}
            replyPreview={replyPreview}
            editPreview={editPreview}
          />

          {/* Input Form */}

          <form
            onSubmit={(e) => handleSubmit(e)}
            className={clsx(
              "flex flex-col bg-brand-surface backdrop-blur-md border",
              S2TMode && "shadow-[0_0_10px_#6366f1] border-indigo-500 focus-within:shadow-[0_0_10px_#6366f1] focus-within:border-none",
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

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                disabled={S2TMode}
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
              {textareaRef && (
                <ActionBtnsRight
                  inputValue={inputValue}
                  textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
                  setInputValue={setInputValue}
                  file={file}
                  disabled={disabled ?? true}
                  isUploading={isUploading}
                  isSubmitting={isSubmitting}
                  isEditing={editMode}
                />)}
            </div>
          </form>

          {/* Status / Hints */}
          <StatusHints />
        </div>
      </div>
    </div>
  );
}

export default MessageInput
