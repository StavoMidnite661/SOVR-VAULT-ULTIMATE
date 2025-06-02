import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  network: varchar("network").notNull(),
  type: varchar("type").notNull(), // 'created', 'imported', 'ai-agent'
  privateKey: text("private_key"), // encrypted
  mnemonic: text("mnemonic"), // encrypted
  balance: decimal("balance", { precision: 18, scale: 8 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  walletId: integer("wallet_id").references(() => wallets.id),
  hash: varchar("hash").notNull(),
  type: varchar("type").notNull(), // 'send', 'receive', 'mass_payment', 'invoice', 'ai_action'
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  token: varchar("token").notNull(),
  network: varchar("network").notNull(),
  fromAddress: varchar("from_address"),
  toAddress: varchar("to_address"),
  status: varchar("status").notNull(), // 'pending', 'confirmed', 'failed'
  metadata: jsonb("metadata"), // extra data like recipient count, invoice id, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const massPayments = pgTable("mass_payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  name: varchar("name").notNull(),
  totalAmount: decimal("total_amount", { precision: 18, scale: 8 }).notNull(),
  recipientCount: integer("recipient_count").notNull(),
  token: varchar("token").notNull(),
  network: varchar("network").notNull(),
  status: varchar("status").notNull(), // 'pending', 'processing', 'completed', 'failed'
  csvData: jsonb("csv_data"), // array of recipient objects
  transactionHashes: jsonb("transaction_hashes"), // array of tx hashes
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  token: varchar("token").notNull(),
  network: varchar("network").notNull(),
  description: text("description"),
  clientName: varchar("client_name"),
  clientEmail: varchar("client_email"),
  status: varchar("status").notNull(), // 'pending', 'paid', 'expired', 'cancelled'
  qrCode: text("qr_code"), // QR code data
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lendingPools = pgTable("lending_pools", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  poolName: varchar("pool_name").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  token: varchar("token").notNull(),
  network: varchar("network").notNull(),
  apy: decimal("apy", { precision: 5, scale: 2 }).notNull(),
  type: varchar("type").notNull(), // 'sovr-echo', 'defi', 'trust-backed'
  status: varchar("status").notNull(), // 'active', 'matured', 'withdrawn'
  nextPayoutDate: timestamp("next_payout_date"),
  maturityDate: timestamp("maturity_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiAgents = pgTable("ai_agents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'trading', 'payments', 'lending', 'trust'
  status: varchar("status").notNull(), // 'active', 'paused', 'stopped'
  configuration: jsonb("configuration"),
  totalOperations: integer("total_operations").default(0),
  totalValueManaged: decimal("total_value_managed", { precision: 18, scale: 8 }).default("0"),
  lastActionAt: timestamp("last_action_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trustChecks = pgTable("trust_checks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  checkId: varchar("check_id").notNull().unique(),
  type: varchar("type").notNull(), // 'pdf_hash', 'multisig', 'qr_verification'
  status: varchar("status").notNull(), // 'pending', 'verified', 'failed'
  documentHash: varchar("document_hash"),
  qrCode: text("qr_code"),
  metadata: jsonb("metadata"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertWallet = typeof wallets.$inferInsert;
export type Wallet = typeof wallets.$inferSelect;

export type InsertTransaction = typeof transactions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;

export type InsertMassPayment = typeof massPayments.$inferInsert;
export type MassPayment = typeof massPayments.$inferSelect;

export type InsertInvoice = typeof invoices.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;

export type InsertLendingPool = typeof lendingPools.$inferInsert;
export type LendingPool = typeof lendingPools.$inferSelect;

export type InsertAiAgent = typeof aiAgents.$inferInsert;
export type AiAgent = typeof aiAgents.$inferSelect;

export type InsertTrustCheck = typeof trustChecks.$inferInsert;
export type TrustCheck = typeof trustChecks.$inferSelect;

// Validation schemas
export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertMassPaymentSchema = createInsertSchema(massPayments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

export const insertLendingPoolSchema = createInsertSchema(lendingPools).omit({
  id: true,
  createdAt: true,
});

export const insertAiAgentSchema = createInsertSchema(aiAgents).omit({
  id: true,
  createdAt: true,
  lastActionAt: true,
});

export const insertTrustCheckSchema = createInsertSchema(trustChecks).omit({
  id: true,
  createdAt: true,
  verifiedAt: true,
});
