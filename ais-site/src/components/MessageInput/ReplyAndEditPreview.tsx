import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Message } from "../MessageItem";

interface ReplyAndEditPreviewProps {
  file?: File | null;
  filePath?: string | null;
  getFileBadge: (file: File) => string;
  formatFileSize: (size: number) => string;
  replyingTo?: Message | null;
  editMode?: boolean;
  deselectFile: () => void;
  onCancelReply: () => void;
  disableEditMode: () => void;
  replyAuthorName?: string;
  replyPreview?: string;
  editPreview?: string;
}

const ReplyPreview = ({ file, filePath, getFileBadge, formatFileSize, replyingTo, editMode, deselectFile, onCancelReply, disableEditMode, replyAuthorName, replyPreview, editPreview }: ReplyAndEditPreviewProps) => {
  const isImageFile = file?.type.startsWith("image/") ?? false

  return (
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
                    {isImageFile && filePath ? (
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
              <div className="absolute inset-0 border-b border-brand-muted pointer-events-none" />

              <div className="relative flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2 pl-2.5 py-1 border-l-2 border-brand-accent/30 bg-transparent rounded-r-md max-w-md text-left flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-black tracking-tight text-brand-accent/60">
                      {replyAuthorName}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/30 truncate font-medium pl-1">
                    {replyPreview}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onCancelReply}
                    className="inline-flex h-4 w-4 items-center justify-center transition-all duration-200 text-white/30 hover:text-white cursor-pointer"
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
              <div className="absolute inset-0 border-b border-brand-muted pointer-events-none" />
              <div className="relative flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2 pl-2.5 py-1 border-l-2 border-brand-accent/30 bg-transparent rounded-r-md max-w-md text-left flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-black tracking-tight text-brand-accent/60">
                      Editing
                    </span>
                  </div>
                  <span className="text-[11px] text-white/30 truncate font-medium pl-1">
                    {editPreview}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={disableEditMode}
                    title="Cancel edit"
                    className="inline-flex h-4 w-4 items-center justify-center transition-all duration-200 text-white/30 hover:text-white cursor-pointer"
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
  )
}

export default ReplyPreview