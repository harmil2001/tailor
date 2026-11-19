import BrandLogo from '@/components/ui/BrandLogo'
import BackButton from './_components/BackButton'

export default function OrderNotFound() {
  return (
    <div className="min-h-dvh bg-canvas flex flex-col items-center px-4">

      <div className="fixed top-0 left-0 right-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-line/40 px-4 h-14 flex items-center">
        <div className="w-full max-w-sm mx-auto">
          <BackButton />
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-6 pt-28 pb-8 text-center">

        <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center">
          <BrandLogo size={36} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[22px] font-bold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
            Order Not Found
          </p>
          <p className="text-[14px] text-ink-soft leading-relaxed">
            This order may have been deleted or the link is incorrect. Please contact the shop for assistance.
          </p>
        </div>

      </div>
    </div>
  )
}
