'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, FileText, TrendingUp, Package, Store } from 'lucide-react'
import { FEATURES } from '@/lib/features'

const tabs = [
  { href: '/',           label: 'Home',      icon: Home,       show: true             },
  { href: '/customers',  label: 'Customers', icon: Users,      show: true             },
  { href: '/orders',     label: 'Orders',    icon: FileText,   show: true             },
  { href: '/revenue',    label: 'Revenue',   icon: TrendingUp, show: true             },
  { href: '/inventory',  label: 'Stock',     icon: Package,    show: FEATURES.stock   },
  { href: '/dealers',    label: 'Dealers',   icon: Store,      show: FEATURES.dealers },
].filter(tab => tab.show)

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-canvas/80 backdrop-blur-md border-t border-line" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center w-full px-1 h-[72px] max-w-7xl mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 py-2 transition-all active:scale-90"
            >
              <span
                className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors ${isActive ? 'bg-brand-tint' : 'bg-transparent'}`}
              >
                <Icon
                  size={20}
                  className={isActive ? 'text-brand' : 'text-ink-muted'}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />
              </span>
              <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold text-ink' : 'font-medium text-ink-soft'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
