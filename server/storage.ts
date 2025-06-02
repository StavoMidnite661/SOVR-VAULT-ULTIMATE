import {
  users,
  wallets,
  transactions,
  massPayments,
  invoices,
  aiAgentActions,
  trustVerifications,
  type User,
  type UpsertUser,
  type InsertWallet,
  type Wallet,
  type InsertTransaction,
  type Transaction,
  type InsertMassPayment,
  type MassPayment,
  type InsertInvoice,
  type Invoice,
  type InsertAiAgentAction,
  type AiAgentAction,
  type InsertTrustVerification,
  type TrustVerification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Wallet operations
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  getUserWallets(userId: string): Promise<Wallet[]>;
  getWallet(id: number): Promise<Wallet | undefined>;
  updateWallet(id: number, updates: Partial<InsertWallet>): Promise<Wallet>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction>;
  
  // Mass payment operations
  createMassPayment(massPayment: InsertMassPayment): Promise<MassPayment>;
  getUserMassPayments(userId: string): Promise<MassPayment[]>;
  getMassPayment(id: number): Promise<MassPayment | undefined>;
  updateMassPaymentStatus(id: number, status: string): Promise<MassPayment>;
  
  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getUserInvoices(userId: string): Promise<Invoice[]>;
  getInvoice(invoiceId: string): Promise<Invoice | undefined>;
  updateInvoiceStatus(invoiceId: string, status: string): Promise<Invoice>;
  
  // AI Agent operations
  createAiAgentAction(action: InsertAiAgentAction): Promise<AiAgentAction>;
  getUserAiAgentActions(userId: string): Promise<AiAgentAction[]>;
  getAiAgentAction(id: number): Promise<AiAgentAction | undefined>;
  updateAiAgentActionStatus(id: number, status: string, result?: any): Promise<AiAgentAction>;
  
  // Trust verification operations
  createTrustVerification(verification: InsertTrustVerification): Promise<TrustVerification>;
  getUserTrustVerifications(userId: string): Promise<TrustVerification[]>;
  getTrustVerification(id: number): Promise<TrustVerification | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Wallet operations
  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [newWallet] = await db.insert(wallets).values(wallet).returning();
    return newWallet;
  }

  async getUserWallets(userId: string): Promise<Wallet[]> {
    return await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, userId), eq(wallets.isActive, true)));
  }

  async getWallet(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async updateWallet(id: number, updates: Partial<InsertWallet>): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set(updates)
      .where(eq(wallets.id, id))
      .returning();
    return wallet;
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  // Mass payment operations
  async createMassPayment(massPayment: InsertMassPayment): Promise<MassPayment> {
    const [newMassPayment] = await db
      .insert(massPayments)
      .values(massPayment)
      .returning();
    return newMassPayment;
  }

  async getUserMassPayments(userId: string): Promise<MassPayment[]> {
    return await db
      .select()
      .from(massPayments)
      .where(eq(massPayments.userId, userId))
      .orderBy(desc(massPayments.createdAt));
  }

  async getMassPayment(id: number): Promise<MassPayment | undefined> {
    const [massPayment] = await db
      .select()
      .from(massPayments)
      .where(eq(massPayments.id, id));
    return massPayment;
  }

  async updateMassPaymentStatus(id: number, status: string): Promise<MassPayment> {
    const [massPayment] = await db
      .update(massPayments)
      .set({ status })
      .where(eq(massPayments.id, id))
      .returning();
    return massPayment;
  }

  // Invoice operations
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async getUserInvoices(userId: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoice(invoiceId: string): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceId, invoiceId));
    return invoice;
  }

  async updateInvoiceStatus(invoiceId: string, status: string): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({ status, paidAt: status === "paid" ? new Date() : undefined })
      .where(eq(invoices.invoiceId, invoiceId))
      .returning();
    return invoice;
  }

  // AI Agent operations
  async createAiAgentAction(action: InsertAiAgentAction): Promise<AiAgentAction> {
    const [newAction] = await db
      .insert(aiAgentActions)
      .values(action)
      .returning();
    return newAction;
  }

  async getUserAiAgentActions(userId: string): Promise<AiAgentAction[]> {
    return await db
      .select()
      .from(aiAgentActions)
      .where(eq(aiAgentActions.userId, userId))
      .orderBy(desc(aiAgentActions.createdAt));
  }

  async getAiAgentAction(id: number): Promise<AiAgentAction | undefined> {
    const [action] = await db
      .select()
      .from(aiAgentActions)
      .where(eq(aiAgentActions.id, id));
    return action;
  }

  async updateAiAgentActionStatus(
    id: number,
    status: string,
    result?: any
  ): Promise<AiAgentAction> {
    const [action] = await db
      .update(aiAgentActions)
      .set({ status, result })
      .where(eq(aiAgentActions.id, id))
      .returning();
    return action;
  }

  // Trust verification operations
  async createTrustVerification(
    verification: InsertTrustVerification
  ): Promise<TrustVerification> {
    const [newVerification] = await db
      .insert(trustVerifications)
      .values(verification)
      .returning();
    return newVerification;
  }

  async getUserTrustVerifications(userId: string): Promise<TrustVerification[]> {
    return await db
      .select()
      .from(trustVerifications)
      .where(eq(trustVerifications.userId, userId))
      .orderBy(desc(trustVerifications.createdAt));
  }

  async getTrustVerification(id: number): Promise<TrustVerification | undefined> {
    const [verification] = await db
      .select()
      .from(trustVerifications)
      .where(eq(trustVerifications.id, id));
    return verification;
  }
}

export const storage = new DatabaseStorage();
