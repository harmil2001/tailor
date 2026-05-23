export default function MarketingPage() {
  return (
    <main className="pt-[56px] pb-[72px] min-h-dvh flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className="material-symbols-outlined text-[48px] text-[#775a19]"
          style={{ fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 48' }}
        >
          campaign
        </span>
        <h1
          className="text-[22px] font-bold text-[#0b1c30]"
          style={{ fontFamily: 'var(--font-manrope)' }}
        >
          Coming Soon
        </h1>
        <p className="text-[14px] text-[#45464d]">
          Marketing tools are on their way.
        </p>
      </div>
    </main>
  )
}
