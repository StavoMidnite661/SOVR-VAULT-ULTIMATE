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
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wallets table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  address: varchar("address").notNull(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // main, ai_agent, vault
  network: varchar("network").notNull(), // ethereum, base, etc.
  privateKey: text("private_key"), // encrypted
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  walletId: integer("wallet_id").references(() => wallets.id),
  txHash: varchar("tx_hash"),
  type: varchar("type").notNull(), // send, receive, mass_payment, ai_action
  asset: varchar("asset").notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  toAddress: varchar("to_address"),
  fromAddress: varchar("from_address"),
  status: varchar("status").notNull(), // pending, complete, failed
  gasUsed: decimal("gas_used", { precision: 20, scale: 8 }),
  metadata: jsonb("metadata"), // additional data like CSV upload info
  createdAt: timestamp("created_at").defaultNow(),
});

// Mass payments table
export const massPayments = pgTable("mass_payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  batchId: varchar("batch_id").notNull(),
  fileName: varchar("file_name"),
  totalRecipients: integer("total_recipients").notNull(),
  totalAmount: decimal("total_amount", { precision: 20, scale: 8 }).notNull(),
  status: varchar("status").notNull(), // pending, processing, complete, failed
  recipientsData: jsonb("recipients_data"), // parsed CSV data
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  invoiceId: varchar("invoice_id").unique().notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  asset: varchar("asset").notNull(),
  description: text("description"),
  qrCode: text("qr_code"), // QR code data
  status: varchar("status").notNull(), // pending, paid, expired
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Agent actions table
export const aiAgentActions = pgTable("ai_agent_actions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  agentWalletId: integer("agent_wallet_id").references(() => wallets.id),
  actionType: varchar("action_type").notNull(), // trade, lend, verify_trust
  parameters: jsonb("parameters"),
  result: jsonb("result"),
  status: varchar("status").notNull(), // pending, success, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// Trust verifications table
export const trustVerifications = pgTable("trust_verifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  documentHash: varchar("document_hash").notNull(),
  qrCode: text("qr_code"),
  verificationType: varchar("verification_type").notNull(), // pdf_sign, hash_verify, trust_qr
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  transactions: many(transactions),
  massPayments: many(massPayments),
  invoices: many(invoices),
  aiAgentActions: many(aiAgentActions),
  trustVerifications: many(trustVerifications),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  aiAgentActions: many(aiAgentActions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertMassPaymentSchema = createInsertSchema(massPayments).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertAiAgentActionSchema = createInsertSchema(aiAgentActions).omit({
  id: true,
  createdAt: true,
});

export const insertTrustVerificationSchema = createInsertSchema(trustVerifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertMassPayment = z.infer<typeof insertMassPaymentSchema>;
export type MassPayment = typeof massPayments.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertAiAgentAction = z.infer<typeof insertAiAgentActionSchema>;
export type AiAgentAction = typeof aiAgentActions.$inferSelect;
export type InsertTrustVerification = z.infer<typeof insertTrustVerificationSchema>;
export type TrustVerification = typeof trustVerifications.$inferSelect;
