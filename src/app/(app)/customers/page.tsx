import { asc, ilike, or } from 'drizzle-orm'
import { Users } from 'lucide-react'
import { Suspense } from 'react'
import { db } from '@/db'
import { customers } from '@/db/schema'
import CustomerList from './_components/CustomerList'
import CustomerSearchBar from './_components/CustomerSearchBar'
import CreateCustomerSheet from '@/components/customers/CreateCustomerSheet'
import { CUSTOMERS_PAGE_SIZE } from './constants'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function CustomersPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const where = query
    ? or(
        ilike(customers.name,  `%${query}%`),
        ilike(customers.phone, `%${query}%`),
      )
    : undefined

  const [initialCustomers, total] = await Promise.all([
    db.select().from(customers).where(where).orderBy(asc(customers.name)).limit(CUSTOMERS_PAGE_SIZE),
    db.$count(customers, where),
  ])

  return (
    <div className="py-6 flex flex-col gap-4 max-w-lg mx-auto">

      <div className="flex justify-between items-center">
        <h1 className="text-[22px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
          Customers
        </h1>
        <span className="text-[12px] font-semibold text-[#45464d]">
          {total} {query ? 'found' : 'total'}
        </span>
      </div>

      <Suspense>
        <CustomerSearchBar defaultValue={query} />
      </Suspense>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-16 h-16 rounded-full bg-[#e5eeff] flex items-center justify-center">
            <Users size={28} className="text-[#45464d]" />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-semibold text-[#0b1c30]" style={{ fontFamily: 'var(--font-manrope)' }}>
              {query ? 'No customers found' : 'No customers yet'}
            </p>
            <p className="text-[13px] text-[#45464d] mt-1">
              {query ? 'Try a different name or phone number.' : 'Add your first customer to get started.'}
            </p>
          </div>
          {!query && <CreateCustomerSheet variant="inline" />}
        </div>
      ) : (
        <CustomerList
          key={query}
          initialCustomers={initialCustomers}
          total={total}
          query={query}
        />
      )}

      <CreateCustomerSheet variant="fab" />

    </div>
  )
}
