import { useEffect } from "react";
import { UserPlus, Loader2, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

import { createPortal } from "react-dom";

const addMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
}

const AddMemberModal = ({ isOpen, onClose, channelId }: AddMemberModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { email: "" },
  });

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      reset();
      mutation.reset();
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: async (data: AddMemberFormValues) => {
      const res = await fetch(`${import.meta.env.VITE_API}/channels/${channelId}/add-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.trim() }),
        credentials: "include",
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.msg || "Failed to add member");
      }
      return resData;
    },
    onSuccess: () => {
      toast.success("User added successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add user");
    }
  });

  const onSubmit = (data: AddMemberFormValues) => {
    mutation.mutate(data);
  };

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
            className="bg-brand-surface rounded-2xl shadow-2xl w-full max-w-md border border-white/5 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/4 bg-brand-surface/80">
              <h2 className="text-2xl font-black text-white font-serif tracking-tight flex items-center gap-3">
                <UserPlus size={24} className="text-brand-accent/60" />
                Add Member
              </h2>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
              <div className="p-8">
                <div className="space-y-3 w-full">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                    User Email
                  </label>
                  <div className={`flex items-center gap-3 bg-brand-dark/50 rounded-lg p-3 border transition-all duration-300 ${errors.email || mutation.isError ? 'border-red-500/50' : mutation.isSuccess ? 'border-emerald-500/50' : 'border-white/6 focus-within:border-brand-accent/40 focus-within:bg-brand-dark/70'}`}>
                    <Mail className="shrink-0 text-white/20" size={18} />
                    <input
                      type="email"
                      className="bg-transparent text-white font-medium w-full focus:outline-none placeholder:text-white/10 text-[15px]"
                      placeholder="name@example.com"
                      {...register("email")}
                      disabled={mutation.isPending || mutation.isSuccess}
                      autoFocus
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-red-500 font-bold mt-1 ml-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                  {mutation.isError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-red-500 font-bold mt-1 ml-1"
                    >
                      {mutation.error?.message || "Failed to add member"}
                    </motion.p>
                  )}
                  {mutation.isSuccess && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-emerald-500 font-bold mt-1 ml-1"
                    >
                      User added successfully!
                    </motion.p>
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
                  disabled={mutation.isPending || mutation.isSuccess}
                  className="px-6 py-2 rounded-lg text-sm font-black bg-brand-accent text-white shadow-lg shadow-brand-accent/20 hover:scale-[1.02] active:scale-95 transition-all min-w-[100px] flex items-center justify-center gap-2"
                >
                  {mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Add"}
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

export default AddMemberModal;
