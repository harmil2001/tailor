import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  pgEnum,
  jsonb,
  date,
  boolean,
  index,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

// ---------- Enums ----------

export const orderStatusEnum = pgEnum('order_status', [
  'Pending',
  'Stitching',
  'Ready',
  'Delivered',
  'Cancelled',
])

export const fabricPatternEnum = pgEnum('fabric_pattern', [
  'Plain',
  'Printed',
  'Chequered',
  'Striped',
  'Dotted',
  'Embroidered',
  'Jacquard',
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
  // The customer agreed to receive WhatsApp updates. WhatsApp requires opt-in, so no message
  // is sent while this is false.
  whatsappOptIn: boolean('whatsapp_opt_in').notNull().default(false),
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
  items: jsonb('items').$type<{ name: string; clothProvidedBy: 'Customer' | 'Tailor'; fabric?: OrderItemFabric }[]>().notNull().default([]),
  orderDate: date('order_date').notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  advancePaid: numeric('advance_paid', { precision: 10, scale: 2 }).notNull().default('0'),
  status: orderStatusEnum('status').notNull().default('Pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ---------- Fabrics (Inventory) ----------

export const fabrics = pgTable('fabrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').unique().notNull().default(sql`upper(substr(md5(gen_random_uuid()::text), 1, 6))`),
  brand: text('brand').notNull(),
  dealerName: text('dealer_name').notNull(),
  color: text('color').notNull(),
  pattern: fabricPatternEnum('pattern').notNull(),
  purchasePricePerMeter: numeric('purchase_price_per_meter', { precision: 10, scale: 2 }).notNull(),
  sellingPriceFactor: numeric('selling_price_factor', { precision: 10, scale: 2 }).notNull().default('1'),
  totalMeters: numeric('total_meters', { precision: 10, scale: 3 }).notNull(),
  availableMeters: numeric('available_meters', { precision: 10, scale: 3 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
})

// ---------- Low Stock Alerts ----------

export const lowStockAlerts = pgTable('low_stock_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  fabricId: uuid('fabric_id')
    .notNull()
    .references(() => fabrics.id, { onDelete: 'cascade' }),
  // snapshot of meters at the moment the alert was triggered
  availableMeters: numeric('available_meters', { precision: 10, scale: 3 }).notNull(),
  totalMeters: numeric('total_meters', { precision: 10, scale: 3 }).notNull(),
  // null = active/unacknowledged
  acknowledgedAt: timestamp('acknowledged_at'),
  acknowledgedBy: uuid('acknowledged_by')
    .references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ---------- Dealers ----------

export const dealers = pgTable('dealers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ---------- Dealer Ledger Entries ----------

export const dealerLedgerEntries = pgTable('dealer_ledger_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealerId: uuid('dealer_id')
    .notNull()
    .references(() => dealers.id, { onDelete: 'cascade' }),
  billDate: date('bill_date').notNull(),
  particulars: text('particulars').notNull(),
  voucherType: text('voucher_type').notNull(),
  voucherNo: text('voucher_no').notNull(),
  creditAmount: numeric('credit_amount', { precision: 12, scale: 2 }),
  debitAmount: numeric('debit_amount', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ---------- WhatsApp message log ----------
// One row per message attempt. `status` is one of:
//   queued | sent | failed | skipped | dry_run
export const whatsappMessages = pgTable('whatsapp_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  // order_placed | status_update | payment_received
  event: text('event').notNull(),
  // The new status, or the amount received, that caused the message
  detail: text('detail'),
  template: text('template').notNull(),
  toPhone: text('to_phone'),
  status: text('status').notNull(),
  providerMessageId: text('provider_message_id'),
  error: text('error'),
  // Set only where a message must never be sent twice (for example order_placed)
  dedupeKey: text('dedupe_key').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [
  index('whatsapp_messages_order_idx').on(t.orderId),
  index('whatsapp_messages_provider_idx').on(t.providerMessageId),
])

// ---------- Relations ----------

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  acknowledgedAlerts: many(lowStockAlerts),
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

export const fabricsRelations = relations(fabrics, ({ many }) => ({
  lowStockAlerts: many(lowStockAlerts),
}))

export const dealersRelations = relations(dealers, ({ many }) => ({
  ledgerEntries: many(dealerLedgerEntries),
}))

export const dealerLedgerEntriesRelations = relations(dealerLedgerEntries, ({ one }) => ({
  dealer: one(dealers, {
    fields: [dealerLedgerEntries.dealerId],
    references: [dealers.id],
  }),
}))

export const lowStockAlertsRelations = relations(lowStockAlerts, ({ one }) => ({
  fabric: one(fabrics, {
    fields: [lowStockAlerts.fabricId],
    references: [fabrics.id],
  }),
  acknowledgedByUser: one(users, {
    fields: [lowStockAlerts.acknowledgedBy],
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

export type OrderItemFabric = {
  fabricId: string
  brand: string
  color: string
  metersUsed: number
  pricePerMeter: number
  fabricTotal: number
}

export type Fabric = typeof fabrics.$inferSelect
export type NewFabric = typeof fabrics.$inferInsert
export type FabricPattern = Fabric['pattern']

export type LowStockAlert = typeof lowStockAlerts.$inferSelect
export type NewLowStockAlert = typeof lowStockAlerts.$inferInsert

export type WhatsAppMessage = typeof whatsappMessages.$inferSelect
export type NewWhatsAppMessage = typeof whatsappMessages.$inferInsert
export type WhatsAppMessageStatus = 'queued' | 'sent' | 'failed' | 'skipped' | 'dry_run'
export type WhatsAppEvent = 'order_placed' | 'status_update' | 'payment_received'

export type Dealer = typeof dealers.$inferSelect
export type NewDealer = typeof dealers.$inferInsert

export type DealerLedgerEntry = typeof dealerLedgerEntries.$inferSelect
export type NewDealerLedgerEntry = typeof dealerLedgerEntries.$inferInsert
