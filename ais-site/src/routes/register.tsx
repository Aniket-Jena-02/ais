import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod/v4";
import { Hash, Key, UserPlus, Mail, User } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Route = createFileRoute("/register")({
  component: RegisterComponent,
});

function RegisterComponent() {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const r = useRouter();

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (res.ok) {
        r.navigate({ to: "/channels" });
        return;
      }

      const resData = await res.json();
      setServerError(resData.msg || "Registration failed");
    } catch (error) {
      console.error("Registration failed:", error);
      setServerError("An unexpected error occurred during registration.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Graphic Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent/5 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none" />

      {/* Register Card */}
      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-brand-muted/40 backdrop-blur-3xl rounded-[40px] shadow-2xl border border-white/5 p-10 sm:p-14 overflow-hidden relative">
          
          {/* Subtle top light effect */}
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

          <motion.div variants={itemVariants} className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 rounded-[22px] bg-brand-accent flex items-center justify-center shadow-2xl shadow-brand-accent/20 mb-8 rotate-3 hover:rotate-6 transition-transform duration-500">
              <Hash size={32} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight font-serif">
              Create Account
            </h2>
            <p className="text-white/20 mt-3 font-medium text-sm tracking-wide uppercase">
              Join the conversation
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div variants={itemVariants} className="space-y-2 w-full">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                Display Name
              </label>
              <div className={`flex items-center gap-3 bg-brand-muted/40 rounded-2xl p-4 border transition-all duration-300 ${errors.name ? 'border-red-500/50' : 'border-white/5 focus-within:border-brand-accent/40 focus-within:bg-brand-muted/60'}`}>
                <User className="shrink-0 text-white/20" size={18} />
                <input
                  type="text"
                  className="bg-transparent text-white font-medium w-full focus:outline-none placeholder:text-white/10"
                  placeholder="Your name"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-red-500 font-bold mt-2 ml-1">
                  {errors.name.message}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2 w-full">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                Identity Profile
              </label>
              <div className={`flex items-center gap-3 bg-brand-muted/40 rounded-2xl p-4 border transition-all duration-300 ${errors.email ? 'border-red-500/50' : 'border-white/5 focus-within:border-brand-accent/40 focus-within:bg-brand-muted/60'}`}>
                <Mail className="shrink-0 text-white/20" size={18} />
                <input
                  type="email"
                  className="bg-transparent text-white font-medium w-full focus:outline-none placeholder:text-white/10"
                  placeholder="name@example.com"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-500 font-bold mt-2 ml-1">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2 w-full">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                Security Key
              </label>
              <div className={`flex items-center gap-3 bg-brand-muted/40 rounded-2xl p-4 border transition-all duration-300 ${errors.password ? 'border-red-500/50' : 'border-white/5 focus-within:border-brand-accent/40 focus-within:bg-brand-muted/60'}`}>
                <Key className="shrink-0 text-white/20" size={18} />
                <input
                  type="password"
                  className="bg-transparent text-white font-medium w-full focus:outline-none placeholder:text-white/10"
                  placeholder="••••••••"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 font-bold mt-2 ml-1">
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-8 p-4 bg-brand-accent text-white rounded-2xl shadow-xl shadow-brand-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Create Account
                  </>
                )}
              </button>
            </motion.div>
            
            {serverError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mt-6"
              >
                <p className="text-[11px] text-red-500 font-black uppercase tracking-wider bg-red-500/10 py-3 px-6 rounded-xl inline-block border border-red-500/20">
                  {serverError}
                </p>
              </motion.div>
            )}
          </form>
        </div>

        {/* Helper Footer */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 mt-12">
          <Link
            to="/login"
            className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-brand-accent transition-all duration-300"
          >
            Already have an account? Log in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
