import {
  users,
  wallets,
  transactions,
  massPayments,
  invoices,
  lendingPools,
  aiAgents,
  trustChecks,
  type User,
  type UpsertUser,
  type Wallet,
  type InsertWallet,
  type Transaction,
  type InsertTransaction,
  type MassPayment,
  type InsertMassPayment,
  type Invoice,
  type InsertInvoice,
  type LendingPool,
  type InsertLendingPool,
  type AiAgent,
  type InsertAiAgent,
  type TrustCheck,
  type InsertTrustCheck,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Wallet operations
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  getUserWallets(userId: string): Promise<Wallet[]>;
  getWallet(id: number): Promise<Wallet | undefined>;
  updateWalletBalance(id: number, balance: string): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  getWalletTransactions(walletId: number): Promise<Transaction[]>;
  
  // Mass payment operations
  createMassPayment(massPayment: InsertMassPayment): Promise<MassPayment>;
  getUserMassPayments(userId: string): Promise<MassPayment[]>;
  updateMassPaymentStatus(id: number, status: string, transactionHashes?: string[]): Promise<void>;
  
  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getUserInvoices(userId: string): Promise<Invoice[]>;
  getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  updateInvoiceStatus(id: number, status: string): Promise<void>;
  
  // Lending operations
  createLendingPool(pool: InsertLendingPool): Promise<LendingPool>;
  getUserLendingPools(userId: string): Promise<LendingPool[]>;
  updateLendingPoolStatus(id: number, status: string): Promise<void>;
  
  // AI Agent operations
  createAiAgent(agent: InsertAiAgent): Promise<AiAgent>;
  getUserAiAgents(userId: string): Promise<AiAgent[]>;
  updateAiAgentStats(id: number, operations: number, valueManaged: string): Promise<void>;
  
  // Trust operations
  createTrustCheck(check: InsertTrustCheck): Promise<TrustCheck>;
  getUserTrustChecks(userId: string): Promise<TrustCheck[]>;
  getTrustCheckById(checkId: string): Promise<TrustCheck | undefined>;
  updateTrustCheckStatus(id: number, status: string): Promise<void>;
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
      .where(and(eq(wallets.userId, userId), eq(wallets.isActive, true)))
      .orderBy(desc(wallets.createdAt));
  }

  async getWallet(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async updateWalletBalance(id: number, balance: string): Promise<void> {
    await db
      .update(wallets)
      .set({ balance, updatedAt: new Date() })
      .where(eq(wallets.id, id));
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
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

  async getWalletTransactions(walletId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.createdAt));
  }

  // Mass payment operations
  async createMassPayment(massPayment: InsertMassPayment): Promise<MassPayment> {
    const [newMassPayment] = await db.insert(massPayments).values(massPayment).returning();
    return newMassPayment;
  }

  async getUserMassPayments(userId: string): Promise<MassPayment[]> {
    return await db
      .select()
      .from(massPayments)
      .where(eq(massPayments.userId, userId))
      .orderBy(desc(massPayments.createdAt));
  }

  async updateMassPaymentStatus(id: number, status: string, transactionHashes?: string[]): Promise<void> {
    const updateData: any = { status };
    if (transactionHashes) {
      updateData.transactionHashes = transactionHashes;
    }
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    await db.update(massPayments).set(updateData).where(eq(massPayments.id, id));
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

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber));
    return invoice;
  }

  async updateInvoiceStatus(id: number, status: string): Promise<void> {
    const updateData: any = { status };
    if (status === 'paid') {
      updateData.paidAt = new Date();
    }
    
    await db.update(invoices).set(updateData).where(eq(invoices.id, id));
  }

  // Lending operations
  async createLendingPool(pool: InsertLendingPool): Promise<LendingPool> {
    const [newPool] = await db.insert(lendingPools).values(pool).returning();
    return newPool;
  }

  async getUserLendingPools(userId: string): Promise<LendingPool[]> {
    return await db
      .select()
      .from(lendingPools)
      .where(eq(lendingPools.userId, userId))
      .orderBy(desc(lendingPools.createdAt));
  }

  async updateLendingPoolStatus(id: number, status: string): Promise<void> {
    await db.update(lendingPools).set({ status }).where(eq(lendingPools.id, id));
  }

  // AI Agent operations
  async createAiAgent(agent: InsertAiAgent): Promise<AiAgent> {
    const [newAgent] = await db.insert(aiAgents).values(agent).returning();
    return newAgent;
  }

  async getUserAiAgents(userId: string): Promise<AiAgent[]> {
    return await db
      .select()
      .from(aiAgents)
      .where(eq(aiAgents.userId, userId))
      .orderBy(desc(aiAgents.createdAt));
  }

  async updateAiAgentStats(id: number, operations: number, valueManaged: string): Promise<void> {
    await db
      .update(aiAgents)
      .set({
        totalOperations: operations,
        totalValueManaged: valueManaged,
        lastActionAt: new Date(),
      })
      .where(eq(aiAgents.id, id));
  }

  // Trust operations
  async createTrustCheck(check: InsertTrustCheck): Promise<TrustCheck> {
    const [newCheck] = await db.insert(trustChecks).values(check).returning();
    return newCheck;
  }

  async getUserTrustChecks(userId: string): Promise<TrustCheck[]> {
    return await db
      .select()
      .from(trustChecks)
      .where(eq(trustChecks.userId, userId))
      .orderBy(desc(trustChecks.createdAt));
  }

  async getTrustCheckById(checkId: string): Promise<TrustCheck | undefined> {
    const [check] = await db.select().from(trustChecks).where(eq(trustChecks.checkId, checkId));
    return check;
  }

  async updateTrustCheckStatus(id: number, status: string): Promise<void> {
    const updateData: any = { status };
    if (status === 'verified') {
      updateData.verifiedAt = new Date();
    }
    
    await db.update(trustChecks).set(updateData).where(eq(trustChecks.id, id));
  }
}

export const storage = new DatabaseStorage();
