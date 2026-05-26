import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { users, customers, orders } from './schema'
import type { ClothProvidedBy } from './schema'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

function items(names: string[], cloth: ClothProvidedBy) {
  return names.map(name => ({ name, clothProvidedBy: cloth }))
}

async function seed() {
  // ── Admin user ──────────────────────────────────────────────────────────────
  console.log('Seeding admin user...')
  const passwordHash = await bcrypt.hash('changeme123', 12)
  await db.insert(users).values({
    name: 'Rushabh Dave',
    email: 'rushabh.dave.dev@gmail.com',
    passwordHash,
  }).onConflictDoNothing()
  console.log('✓ Rushabh Dave')

  // ── Clear existing customers + orders (orders cascade) ─────────────────────
  console.log('\nClearing existing customers and orders...')
  await db.delete(orders)
  await db.delete(customers)
  console.log('✓ Cleared')

  // ── Customers ───────────────────────────────────────────────────────────────
  console.log('\nSeeding customers...')
  const customerRows = await db.insert(customers).values([
    {
      name: 'Ramniwas Sharma',
      phone: '9414012345',
      measurements: { chest: '42', waist: '36', shoulder: '17', shirtLength: '30', trouser: '40', inseam: '30' },
    },
    {
      name: 'Govind Lal Soni',
      phone: '9829034567',
      measurements: { chest: '40', waist: '34', shoulder: '16.5', shirtLength: '29', trouser: '38', inseam: '29' },
    },
    {
      name: 'Hanuman Prasad Vyas',
      phone: '9928156789',
      measurements: { chest: '44', waist: '38', shoulder: '17.5', shirtLength: '31', trouser: '42', inseam: '31' },
    },
    {
      name: 'Surendra Singh Rathore',
      phone: '9001278901',
      measurements: { chest: '46', waist: '40', shoulder: '18', shirtLength: '32', trouser: '44', inseam: '32' },
    },
    {
      name: 'Deepak Kumawat',
      phone: '9772412345',
      measurements: { chest: '38', waist: '32', shoulder: '16', shirtLength: '28', trouser: '36', inseam: '28' },
    },
    {
      name: 'Madan Mohan Pareek',
      phone: '9461534567',
      measurements: { chest: '41', waist: '35', shoulder: '17', shirtLength: '30', trouser: '39', inseam: '29' },
    },
    {
      name: 'Vijay Shankar Bohra',
      phone: '9214778901',
      measurements: { chest: '43', waist: '37', shoulder: '17.5', shirtLength: '30', trouser: '41', inseam: '30' },
    },
    {
      name: 'Rajendra Prasad Gupta',
      phone: '9783890123',
      measurements: { chest: '45', waist: '39', shoulder: '18', shirtLength: '31', trouser: '43', inseam: '31' },
    },
  ]).returning({ id: customers.id, name: customers.name })

  console.log(`✓ ${customerRows.length} customers`)

  const byName = Object.fromEntries(customerRows.map(c => [c.name, c.id]))

  // ── Orders ──────────────────────────────────────────────────────────────────
  console.log('\nSeeding orders...')

  await db.insert(orders).values([
    // Ramniwas Sharma — 3 orders
    {
      customerId: byName['Ramniwas Sharma'],
      items: items(['Sherwani'], 'Customer'),
      orderDate: '2025-04-10',
      totalAmount: '4500.00',
      advancePaid: '2000.00',
      status: 'Delivered',
      notes: 'Wedding sherwani, ivory cream cloth, golden buttons',
    },
    {
      customerId: byName['Ramniwas Sharma'],
      items: items(['Kurta Pyjama'], 'Tailor'),
      orderDate: '2025-05-01',
      totalAmount: '1800.00',
      advancePaid: '900.00',
      status: 'Delivered',
    },
    {
      customerId: byName['Ramniwas Sharma'],
      items: items(['Bandhgala Suit'], 'Customer'),
      orderDate: '2025-05-20',
      totalAmount: '5200.00',
      advancePaid: '2500.00',
      status: 'Stitching',
      notes: 'Dark navy wool blend, function on 6th June',
    },

    // Govind Lal Soni — 2 orders
    {
      customerId: byName['Govind Lal Soni'],
      items: items(['Kurta Pyjama Set'], 'Tailor'),
      orderDate: '2025-04-15',
      totalAmount: '1600.00',
      advancePaid: '800.00',
      status: 'Delivered',
    },
    {
      customerId: byName['Govind Lal Soni'],
      items: items(['Waistcoat'], 'Customer'),
      orderDate: '2025-05-18',
      totalAmount: '1200.00',
      advancePaid: '600.00',
      status: 'Ready',
    },

    // Hanuman Prasad Vyas — 2 orders
    {
      customerId: byName['Hanuman Prasad Vyas'],
      items: items(['Achkan'], 'Customer'),
      orderDate: '2025-03-20',
      totalAmount: '3800.00',
      advancePaid: '2000.00',
      status: 'Delivered',
      notes: 'Off-white silk, embroidery on collar',
    },
    {
      customerId: byName['Hanuman Prasad Vyas'],
      items: items(['Formal Trousers (2 pairs)'], 'Customer'),
      orderDate: '2025-05-22',
      totalAmount: '1400.00',
      advancePaid: '700.00',
      status: 'Pending',
    },

    // Surendra Singh Rathore — 2 orders
    {
      customerId: byName['Surendra Singh Rathore'],
      items: items(['Jodhpuri Suit'], 'Customer'),
      orderDate: '2025-04-28',
      totalAmount: '6500.00',
      advancePaid: '3000.00',
      status: 'Ready',
      notes: 'Royal blue raw silk, brass buttons, matching dupatta',
    },
    {
      customerId: byName['Surendra Singh Rathore'],
      items: items(['Kurta'], 'Tailor'),
      orderDate: '2025-05-25',
      totalAmount: '900.00',
      advancePaid: '500.00',
      status: 'Stitching',
    },

    // Deepak Kumawat — 2 orders
    {
      customerId: byName['Deepak Kumawat'],
      items: items(['Shirt (3 pieces)'], 'Customer'),
      orderDate: '2025-05-10',
      totalAmount: '2100.00',
      advancePaid: '1000.00',
      status: 'Delivered',
    },
    {
      customerId: byName['Deepak Kumawat'],
      items: items(['Formal Trouser'], 'Customer'),
      orderDate: '2025-05-25',
      totalAmount: '700.00',
      advancePaid: '400.00',
      status: 'Stitching',
    },

    // Madan Mohan Pareek — 1 order
    {
      customerId: byName['Madan Mohan Pareek'],
      items: items(['Sherwani'], 'Customer'),
      orderDate: '2025-05-15',
      totalAmount: '5500.00',
      advancePaid: '2500.00',
      status: 'Stitching',
      notes: 'Son\'s wedding — maroon brocade, gold thread work',
    },

    // Vijay Shankar Bohra — 2 orders
    {
      customerId: byName['Vijay Shankar Bohra'],
      items: items(['Kurta Pyjama'], 'Tailor'),
      orderDate: '2025-05-08',
      totalAmount: '1700.00',
      advancePaid: '850.00',
      status: 'Delivered',
    },
    {
      customerId: byName['Vijay Shankar Bohra'],
      items: items(['Nehru Jacket'], 'Customer'),
      orderDate: '2025-05-26',
      totalAmount: '2800.00',
      advancePaid: '1500.00',
      status: 'Stitching',
      notes: 'Cream linen, hand embroidery on chest pocket',
    },

    // Rajendra Prasad Gupta — 2 orders
    {
      customerId: byName['Rajendra Prasad Gupta'],
      items: items(['Bandhgala + Trouser'], 'Customer'),
      orderDate: '2025-04-25',
      totalAmount: '4200.00',
      advancePaid: '2000.00',
      status: 'Delivered',
    },
    {
      customerId: byName['Rajendra Prasad Gupta'],
      items: items(['Kurta (2 pieces)'], 'Tailor'),
      orderDate: '2025-05-20',
      totalAmount: '2400.00',
      advancePaid: '1200.00',
      status: 'Pending',
    },
  ])

  console.log('✓ Orders seeded')
  console.log('\nDone! Default password: changeme123')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed', err)
  process.exit(1)
})
