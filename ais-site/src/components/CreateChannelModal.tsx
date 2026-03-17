import { useEffect } from "react";
import { Hash, Loader2 } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateChannelFormValues>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: { name: "" },
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
    mutationFn: async (data: CreateChannelFormValues) => {
      const formData = new FormData();
      formData.append("name", data.name.trim());

      const res = await fetch(`${import.meta.env.VITE_API}/channels/create-channel`, {
        method: "POST",
        body: formData,
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-channels"] });
      toast.success("Channel created successfully!");
      onClose();
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: CreateChannelFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-300/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md border border-base-content/10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-base-200">
             <h2 className="text-xl font-bold text-base-content tracking-tight">
               Create Channel
             </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6">
            <div className="space-y-2 w-full">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 ml-1">
                Channel Name
              </label>
              <label className={`input input-bordered flex items-center gap-2 bg-base-200/50 w-full focus-within:bg-base-100 transition-colors ${errors.name || mutation.isError ? 'input-error' : 'focus-within:border-primary'}`}>
                <Hash className="shrink-0 opacity-50" size={16} />
                <input
                  type="text"
                  className="grow font-medium w-full"
                  placeholder="e.g. new-project"
                  {...register("name")}
                  disabled={mutation.isPending}
                  autoFocus
                />
              </label>
              {errors.name && (
                <p className="text-xs text-error font-semibold mt-1 ml-1 animate-in slide-in-from-top-1">
                  {errors.name.message}
                </p>
              )}
              {mutation.isError && (
                <p className="text-xs text-error font-semibold mt-1 ml-1 animate-in slide-in-from-top-1">
                  {mutation.error.message}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-base-200/50 flex justify-end gap-3 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="btn btn-ghost btn-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn btn-primary btn-sm shadow-sm font-bold min-w-[100px]"
            >
              {mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;
