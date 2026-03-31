import { useEffect } from "react";
import { Hash, Loader2 } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";

import { createPortal } from "react-dom";
import { useKeyPress } from "ahooks";

const createChannelSchema = z.object({
  name: z.string()
    .min(3, "Channel name must be at least 3 characters")
    .max(20, "Channel name cannot exceed 20 characters"),
});

type CreateChannelFormValues = z.infer<typeof createChannelSchema>;

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateChannelModal = ({ isOpen, onClose }: CreateChannelModalProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateChannelFormValues>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: { name: "" },
  });

  // Escape key listener
  useKeyPress("esc", () => {
    if (isOpen) {
      onClose();
    }
  })

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      reset();
      mutation.reset();
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (data: CreateChannelFormValues) => {
      const res = await fetch(`${import.meta.env.VITE_API}/channels/create-channel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name.trim() }),
        credentials: "include",
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.msg || "Failed to create channel");
      }
      return resData;
    },
    // Optimistic Update
    onMutate: async (newChannel) => {
      await queryClient.cancelQueries({ queryKey: ["user-channels"] });
      const previousChannels = queryClient.getQueryData(["user-channels"]);

      queryClient.setQueryData(["user-channels"], (old: any) => [
        ...(old || []),
        { _id: `temp-${Date.now()}`, name: newChannel.name, createdAt: new Date().toISOString() },
      ]);

      return { previousChannels };
    },
    onError: (err, _newChannel, context) => {
      toast.error(err.message || "Failed to create channel");
      if (context?.previousChannels) {
        queryClient.setQueryData(["user-channels"], context.previousChannels);
      }
    },
    onSuccess: (data) => {
      toast.success("Channel created successfully!");
      onClose();
      if (data?.channelId) {
        navigate({ to: '/channels/$channelId', params: { channelId: data.channelId } });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-channels"] });
    },
  });

  const onSubmit = (data: CreateChannelFormValues) => {
    mutation.mutate(data);
  };

  const channelNamePreview = watch("name").trim().replace(/\s+/g, "-").toLowerCase();

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="bg-brand-surface rounded-2xl shadow-2xl w-full max-w-md max-h-[calc(100dvh-2rem)] border border-white/5 ring-1 ring-white/4 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/4 bg-brand-surface/80">
              <h2 className="text-2xl font-black text-white font-serif tracking-tight flex items-center gap-3">
                <Hash size={24} className="text-brand-accent/60" />
                Create Channel
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/30">
                Start a fresh room for a project, team, or quick conversation.
              </p>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
              <div className="p-8">
                <div className="space-y-3 w-full">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                    Channel Name
                  </label>
                  <div className={`flex items-center gap-3 bg-brand-dark/50 rounded-lg p-3 border transition-all duration-300 ${errors.name || mutation.isError ? 'border-red-500/50' : 'border-white/6 focus-within:border-brand-accent/40 focus-within:bg-brand-dark/70'}`}>
                    <Hash className="shrink-0 text-white/20" size={18} />
                    <input
                      type="text"
                      className="bg-transparent text-white font-medium w-full focus:outline-none placeholder:text-white/10 text-[15px]"
                      placeholder="e.g. new-project"
                      {...register("name")}
                      disabled={mutation.isPending}
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] font-medium text-white/18 ml-1">
                    Keep it short and easy to scan in the sidebar.
                  </p>
                  {channelNamePreview && !errors.name && (
                    <div className="ml-1 inline-flex items-center gap-2 rounded-full border border-white/6 bg-white/3 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                      <Hash size={12} className="text-brand-accent/70" />
                      {channelNamePreview}
                    </div>
                  )}
                  {errors.name && (
                    <p className="text-[11px] text-red-500 font-bold mt-1 ml-1" aria-live="polite">
                      {errors.name.message}
                    </p>
                  )}
                  {mutation.isError && (
                    <p className="text-[11px] text-red-500 font-bold mt-1 ml-1" aria-live="polite">
                      {mutation.error.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-8 py-6 bg-brand-dark/30 flex justify-end gap-3 border-t border-white/4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={mutation.isPending}
                  className="px-5 py-2 rounded-lg text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-6 py-2 rounded-lg text-sm font-black bg-brand-accent text-white shadow-lg shadow-brand-accent/20 hover:scale-[1.02] active:scale-95 transition-all min-w-[100px] flex items-center justify-center gap-2"
                >
                  {mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CreateChannelModal;
