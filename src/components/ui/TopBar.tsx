import { Suspense } from 'react'
import BrandLogo from './BrandLogo'
import ProfileSheet from './ProfileSheet'
import LowStockBell from './LowStockBell'
import { BRAND } from '@/lib/brand'
import { FEATURES } from '@/lib/features'

interface TopBarProps {
  name: string
  email: string
}

export default function TopBar({ name, email }: TopBarProps) {
  return (
    <header className="fixed top-0 w-full z-50 h-[56px] bg-canvas border-b border-line">
      <div className="flex items-center justify-between px-4 w-full max-w-7xl mx-auto h-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
            <BrandLogo size={26} />
          </div>
          <h1 className="text-[16px] font-bold text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
            {BRAND.name}
          </h1>
        </div>

        <div className="flex items-center gap-1">
          {FEATURES.stock && (
            <Suspense fallback={null}>
              <LowStockBell />
            </Suspense>
          )}
          <ProfileSheet name={name} email={email} />
        </div>
      </div>
    </header>
  )
}
