import { useState, useEffect } from "react";
import { UserPlus, Loader2, Mail } from "lucide-react";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
}

const AddMemberModal = ({ isOpen, onClose, channelId }: AddMemberModalProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      setEmail("");
      setError("");
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim() || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", email.trim());

      const res = await fetch(`${import.meta.env.VITE_API}/channels/${channelId}/add-member`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Failed to add member");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
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
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6">
            <div className="space-y-2 w-full">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 ml-1">
                User Email
              </label>
              <label className={`input input-bordered flex items-center gap-2 bg-base-200/50 w-full focus-within:bg-base-100 transition-colors ${error ? 'input-error' : success ? 'input-success' : 'focus-within:border-primary'}`}>
                <Mail className="shrink-0 opacity-50" size={16} />
                <input
                  type="email"
                  className="grow font-medium w-full"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting || success}
                  autoFocus
                />
              </label>
              {error && (
                <p className="text-xs text-error font-semibold mt-1 ml-1 animate-in slide-in-from-top-1">
                  {error}
                </p>
              )}
              {success && (
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
              disabled={isSubmitting}
              className="btn btn-ghost btn-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="btn btn-primary btn-sm shadow-sm font-bold min-w-[100px]"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
