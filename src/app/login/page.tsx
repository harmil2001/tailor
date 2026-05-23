import LoginForm from "./_components/LoginForm";
import TieLogo from "@/components/ui/TieLogo";

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-[#f8f9ff] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
            <TieLogo size={38} />
          </div>
          <h1
            className="text-[22px] font-bold text-[#0b1c30] leading-tight"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            My Brothers
          </h1>
          <p className="text-[13px] text-[#45464d]">Clothing & Tailoring</p>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-[24px] p-6 shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-[#c6c6cd]">
          <h2
            className="text-[18px] font-semibold text-[#0b1c30] mb-6"
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
