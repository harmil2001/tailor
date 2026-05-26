import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  pgEnum,
  jsonb,
  date,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ---------- Enums ----------

export const orderStatusEnum = pgEnum('order_status', [
  'Pending',
  'Stitching',
  'Ready',
  'Delivered',
  'Cancelled',
])

// ---------- Users ----------
// Minimal table for 5 fixed admin accounts (credentials auth via Auth.js)

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ---------- Customers ----------

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  // Flexible JSONB — stores upper + lower body measurements
  // e.g. { chest: "42", waist: "34", inseam: "30", shirtLength: "28" }
  measurements: jsonb('measurements').$type<Record<string, string>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ---------- Orders ----------

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  items: jsonb('items').$type<{ name: string; clothProvidedBy: 'Customer' | 'Tailor' }[]>().notNull().default([]),
  orderDate: date('order_date').notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  advancePaid: numeric('advance_paid', { precision: 10, scale: 2 }).notNull().default('0'),
  status: orderStatusEnum('status').notNull().default('Pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ---------- Relations ----------

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}))

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}))

// ---------- Inferred Types ----------

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert

export type OrderStatus = Order['status']
export type ClothProvidedBy = 'Customer' | 'Tailor'
