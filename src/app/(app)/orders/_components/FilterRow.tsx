'use client'

import { Suspense } from 'react'
import { Tag, Clock } from 'lucide-react'
import FilterSelect from '@/components/ui/FilterSelect'
import CustomerFilter from './CustomerFilter'

const STATUS_OPTIONS = [
  { value: 'Pending',   label: 'Pending'   },
  { value: 'Stitching', label: 'Stitching' },
  { value: 'Ready',     label: 'Ready'     },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
]

const PERIOD_OPTIONS = [
  { value: 'week',  label: 'Last Week'  },
  { value: 'month', label: 'Last Month' },
  { value: '3m',    label: 'Last 3 Months' },
  { value: '6m',    label: 'Last 6 Months' },
  { value: 'year',  label: 'Last Year'  },
]

interface CustomerOption {
  id:    string
  name:  string
  phone: string
}

interface Props {
  customers: CustomerOption[]
}

export default function FilterRow({ customers }: Props) {
  return (
    <Suspense>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <FilterSelect
          param="status"
          options={STATUS_OPTIONS}
          defaultLabel="Status"
          icon={<Tag size={12} strokeWidth={2.5} />}
        />
        <FilterSelect
          param="period"
          options={PERIOD_OPTIONS}
          defaultLabel="Period"
          icon={<Clock size={12} strokeWidth={2.5} />}
        />
        <CustomerFilter customers={customers} />
      </div>
    </Suspense>
  )
}
