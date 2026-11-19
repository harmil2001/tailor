"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/lib/toast";
import { loginAction } from "../actions";

export default function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Catch iOS Safari autofill which fires native "change" but not "input"
  useEffect(() => {
    const emailEl = emailRef.current;
    const passwordEl = passwordRef.current;

    const onEmailChange = () => setEmail(emailEl?.value ?? "");
    const onPasswordChange = () => setPassword(passwordEl?.value ?? "");

    emailEl?.addEventListener("change", onEmailChange);
    passwordEl?.addEventListener("change", onPasswordChange);

    return () => {
      emailEl?.removeEventListener("change", onEmailChange);
      passwordEl?.removeEventListener("change", onPasswordChange);
    };
  }, []);

  useEffect(() => {
    setFieldErrors(state?.fieldErrors ?? {});
    if (state?.error) toast.error(state.error);
    if (state?.success) {
      toast.success("Welcome back!");
      router.push("/");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold tracking-widest text-ink-soft uppercase">
          Email <span className="text-danger">*</span>
        </label>
        <input
          ref={emailRef}
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          autoComplete="email"
          placeholder="Enter your email"
          className={`h-12 px-4 rounded-xl border bg-white text-[14px] text-ink focus:outline-none transition-colors ${
            fieldErrors.email
              ? "border-danger"
              : "border-line focus:border-brand"
          }`}
        />
        {fieldErrors.email && (
          <p className="text-[12px] text-danger">{fieldErrors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold tracking-widest text-ink-soft uppercase">
          Password <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <input
            ref={passwordRef}
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={`h-12 w-full px-4 pr-12 rounded-xl border bg-white text-[14px] text-ink focus:outline-none transition-colors ${
              fieldErrors.password
                ? "border-danger"
                : "border-line focus:border-brand"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-[12px] text-danger">{fieldErrors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || !email.trim() || !password}
        className="h-12 w-full rounded-xl bg-brand text-white text-[14px] font-semibold tracking-wide transition-opacity disabled:opacity-50 active:scale-95"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
