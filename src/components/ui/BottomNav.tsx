'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, FileText, TrendingUp, Package, Store } from 'lucide-react'

const tabs = [
  { href: '/',           label: 'Home',      icon: Home       },
  { href: '/customers',  label: 'Customers', icon: Users      },
  { href: '/orders',     label: 'Orders',    icon: FileText   },
  { href: '/revenue',    label: 'Revenue',   icon: TrendingUp },
  { href: '/inventory',  label: 'Stock',     icon: Package    },
  { href: '/dealers',    label: 'Dealers',   icon: Store      },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-[#f8f9ff]/80 backdrop-blur-md border-t border-[#c6c6cd]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center w-full px-1 h-[72px] max-w-7xl mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-full transition-all active:scale-90"
            >
              <Icon
                size={20}
                className={isActive ? 'text-[#775a19]' : 'text-[#45464d]'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-[#775a19]' : 'text-[#45464d]'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
