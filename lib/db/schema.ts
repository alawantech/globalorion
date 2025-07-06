import { pgTable, serial, text, timestamp, integer, real } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  memberId: text("member_id").unique().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  sponsorId: integer("sponsor_id").references(() => users.id),
  uplineId: integer("upline_id").references(() => users.id),
  location: text("location"),
  status: text("status").notNull().default("pending"),
  role: text("role").notNull().default("user"),
  activationDate: timestamp("activation_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const activationPins = pgTable("activation_pins", {
  id: serial("id").primaryKey(),
  pinCode: text("pin_code").unique().notNull(),
  status: text("status").notNull().default("available"),
  createdBy: integer("created_by").references(() => users.id),
  usedBy: integer("used_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
})

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").unique().notNull(),
  settingValue: text("setting_value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentReference: text("payment_reference"),
  trackingNumber: text("tracking_number"),
  status: text("status").notNull().default("pending"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const matrixPositions = pgTable("matrix_positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  level: integer("level").notNull(),
  position: integer("position").notNull(),
  parentId: integer("parent_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
})

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  fromUserId: integer("from_user_id")
    .references(() => users.id)
    .notNull(),
  amount: real("amount").notNull(),
  level: integer("level").notNull(),
  commissionType: text("commission_type").notNull(),
  status: text("status").notNull().default("pending"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  amount: real("amount").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  status: text("status").notNull().default("pending"),
  processedBy: integer("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
})
