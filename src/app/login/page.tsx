import LoginForm from "./_components/LoginForm";
import BrandLogo from "@/components/ui/BrandLogo";
import { BRAND } from "@/lib/brand";

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-canvas flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center">
            <BrandLogo size={38} />
          </div>
          <h1
            className="text-[22px] font-bold text-ink leading-tight"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {BRAND.name}
          </h1>
          <p className="text-[13px] text-ink-soft">{BRAND.tagline}</p>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-[24px] p-6 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-line">
          <h2
            className="text-[18px] font-semibold text-ink mb-6"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Welcome back
          </h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
