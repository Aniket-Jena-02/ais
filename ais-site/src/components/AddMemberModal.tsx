import { useEffect } from "react";
import { UserPlus, Loader2, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

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
      const formData = new FormData();
      formData.append("email", data.email.trim());

      const res = await fetch(`${import.meta.env.VITE_API}/channels/${channelId}/add-member`, {
        method: "POST",
        body: formData,
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

  if (!isOpen) return null;

  const onSubmit = (data: AddMemberFormValues) => {
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
             <h2 className="text-xl font-bold text-base-content tracking-tight flex items-center gap-2">
               <UserPlus size={20} className="text-primary" />
               Add Member
             </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6">
            <div className="space-y-2 w-full">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 ml-1">
                User Email
              </label>
              <label className={`input input-bordered flex items-center gap-2 bg-base-200/50 w-full focus-within:bg-base-100 transition-colors ${errors.email || mutation.isError ? 'input-error' : mutation.isSuccess ? 'input-success' : 'focus-within:border-primary'}`}>
                <Mail className="shrink-0 opacity-50" size={16} />
                <input
                  type="email"
                  className="grow font-medium w-full"
                  placeholder="name@example.com"
                  {...register("email")}
                  disabled={mutation.isPending || mutation.isSuccess}
                  autoFocus
                />
              </label>
              {errors.email && (
                <p className="text-xs text-error font-semibold mt-1 ml-1 animate-in slide-in-from-top-1">
                  {errors.email.message}
                </p>
              )}
              {mutation.isError && (
                <p className="text-xs text-error font-semibold mt-1 ml-1 animate-in slide-in-from-top-1">
                  {mutation.error.message}
                </p>
              )}
              {mutation.isSuccess && (
                <p className="text-xs text-success font-semibold mt-1 ml-1 animate-in slide-in-from-top-1">
                  User added successfully!
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
              disabled={mutation.isPending || mutation.isSuccess}
              className="btn btn-primary btn-sm shadow-sm font-bold min-w-[100px]"
            >
              {mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
