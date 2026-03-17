import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod/v4";
import { Hash, Key, LogIn, Mail } from "lucide-react";
import { useState } from "react";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const r = useRouter();

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    let resData: any
    try {
      const res = await fetch(`${import.meta.env.VITE_API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (res.ok) {
        console.log(await res.json());
        r.navigate({
          to: "/",
        });
        return
      }
      resData = await res.json()
      console.log(resData)
      setServerError(resData.msg || "Login failed");
    } catch (error) {
      console.error("Login failed:", error);
      setServerError("An unexpected error occurred during login.");
    }
  };

  return (
    <div className="min-h-screen bg-base-300 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Graphic Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-base-100/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-base-content/5 p-8 sm:p-10">

          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-primary to-secondary flex items-center justify-center shadow-lg mb-6 rotate-3 hover:rotate-6 transition-transform">
              <Hash size={32} className="text-primary-content" />
            </div>
            <h2 className="text-3xl font-black text-base-content tracking-tight">
              Welcome back
            </h2>
            <p className="text-base-content/50 mt-2 font-medium">
              Sign in to access your channels
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1 w-full">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 ml-1">
                Email
              </label>
              <label className={`input input-bordered flex items-center gap-2 bg-base-200/50 backdrop-blur-sm w-full focus-within:bg-base-100 transition-colors ${errors.email ? 'input-error' : 'focus-within:border-primary'}`}>
                <Mail className="shrink-0 opacity-50" size={18} />
                <input
                  type="email"
                  className="grow font-medium w-full"
                  placeholder="name@example.com"
                  {...register("email")}
                />
              </label>
              {errors.email && (
                <p className="text-xs text-error font-semibold mt-1.5 ml-1 animate-in slide-in-from-top-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1 w-full">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 ml-1">
                Password
              </label>
              <label className={`input input-bordered flex items-center gap-2 bg-base-200/50 backdrop-blur-sm w-full focus-within:bg-base-100 transition-colors ${errors.password ? 'input-error' : 'focus-within:border-primary'}`}>
                <Key className="shrink-0 opacity-50" size={18} />
                <input
                  type="password"
                  className="grow font-medium w-full"
                  placeholder="••••••••"
                  {...register("password")}
                />
              </label>
              {errors.password && (
                <p className="text-xs text-error font-semibold mt-1.5 ml-1 animate-in slide-in-from-top-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full mt-8 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all font-bold text-[15px] h-12 rounded-xl group"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <LogIn size={18} className="group-hover:-translate-x-1 transition-transform" />
                  Sign In
                </>
              )}
            </button>
            
            {serverError && (
              <div className="text-center mt-4 animate-in fade-in zoom-in duration-300">
                <p className="text-sm text-error font-bold bg-error/10 py-2 px-4 rounded-lg inline-block">
                  {serverError}
                </p>
              </div>
            )}
          </form>

        </div>

        {/* Helper Footer */}
        <p className="text-center text-sm text-base-content/40 mt-8 font-medium">
          Don't have an account?{" "}
          <button className="text-primary hover:text-primary-focus hover:underline font-bold transition-colors">
            Contact admin
          </button>
        </p>
      </div>
    </div>
  );
}
