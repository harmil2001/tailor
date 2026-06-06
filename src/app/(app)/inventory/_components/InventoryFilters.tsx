'use client'

import { Suspense } from 'react'
import { Layers, Store, Tag, Calendar, AlertTriangle } from 'lucide-react'
import FilterSelect from '@/components/ui/FilterSelect'
import type { FabricPattern } from '@/db/schema'

const PATTERN_OPTIONS: { value: FabricPattern; label: string }[] = [
  { value: 'Plain',       label: 'Plain'       },
  { value: 'Printed',     label: 'Printed'     },
  { value: 'Chequered',   label: 'Chequered'   },
  { value: 'Striped',     label: 'Striped'     },
  { value: 'Dotted',      label: 'Dotted'      },
  { value: 'Embroidered', label: 'Embroidered' },
  { value: 'Jacquard',    label: 'Jacquard'    },
]

const ADDED_OPTIONS = [
  { value: 'current', label: 'This Month'    },
  { value: 'month',   label: 'Last Month'    },
  { value: '3m',      label: 'Last 3 Months' },
  { value: '6m',      label: 'Last 6 Months' },
  { value: 'year',    label: 'Last Year'     },
]

const STOCK_OPTIONS = [
  { value: 'low', label: 'Low Stock' },
]

export default function InventoryFilters({
  dealers,
  brands,
}: {
  dealers: string[]
  brands:  string[]
}) {
  const dealerOptions = dealers.map(d => ({ value: d, label: d }))
  const brandOptions  = brands.map(b => ({ value: b, label: b }))

  return (
    <Suspense>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <FilterSelect
          param="pattern"
          options={PATTERN_OPTIONS}
          defaultLabel="Pattern"
          icon={<Layers size={12} strokeWidth={2.5} />}
        />
        {brandOptions.length > 0 && (
          <FilterSelect
            param="brand"
            options={brandOptions}
            defaultLabel="Brand"
            icon={<Tag size={12} strokeWidth={2.5} />}
          />
        )}
        {dealerOptions.length > 0 && (
          <FilterSelect
            param="dealer"
            options={dealerOptions}
            defaultLabel="Dealer"
            icon={<Store size={12} strokeWidth={2.5} />}
          />
        )}
        <FilterSelect
          param="added"
          options={ADDED_OPTIONS}
          defaultLabel="Added"
          icon={<Calendar size={12} strokeWidth={2.5} />}
        />
        <FilterSelect
          param="filter"
          options={STOCK_OPTIONS}
          defaultLabel="Stock"
          icon={<AlertTriangle size={12} strokeWidth={2.5} />}
          activeColor="gold"
        />
      </div>
    </Suspense>
  )
}
