import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertWalletSchema,
  insertTransactionSchema,
  insertMassPaymentSchema,
  insertInvoiceSchema,
  insertLendingPoolSchema,
  insertAiAgentSchema,
  insertTrustCheckSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Wallet routes
  app.get('/api/wallets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallets = await storage.getUserWallets(userId);
      res.json(wallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  app.post('/api/wallets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const walletData = insertWalletSchema.parse({ ...req.body, userId });
      const wallet = await storage.createWallet(walletData);
      res.json(wallet);
    } catch (error) {
      console.error("Error creating wallet:", error);
      res.status(500).json({ message: "Failed to create wallet" });
    }
  });

  app.patch('/api/wallets/:id/balance', isAuthenticated, async (req: any, res) => {
    try {
      const walletId = parseInt(req.params.id);
      const { balance } = req.body;
      await storage.updateWalletBalance(walletId, balance);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating wallet balance:", error);
      res.status(500).json({ message: "Failed to update wallet balance" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionData = insertTransactionSchema.parse({ ...req.body, userId });
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Mass payment routes
  app.get('/api/mass-payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const massPayments = await storage.getUserMassPayments(userId);
      res.json(massPayments);
    } catch (error) {
      console.error("Error fetching mass payments:", error);
      res.status(500).json({ message: "Failed to fetch mass payments" });
    }
  });

  app.post('/api/mass-payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const massPaymentData = insertMassPaymentSchema.parse({ ...req.body, userId });
      const massPayment = await storage.createMassPayment(massPaymentData);
      res.json(massPayment);
    } catch (error) {
      console.error("Error creating mass payment:", error);
      res.status(500).json({ message: "Failed to create mass payment" });
    }
  });

  app.patch('/api/mass-payments/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const massPaymentId = parseInt(req.params.id);
      const { status, transactionHashes } = req.body;
      await storage.updateMassPaymentStatus(massPaymentId, status, transactionHashes);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating mass payment status:", error);
      res.status(500).json({ message: "Failed to update mass payment status" });
    }
  });

  // Invoice routes
  app.get('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const invoices = await storage.getUserInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const invoiceData = insertInvoiceSchema.parse({ ...req.body, userId });
      const invoice = await storage.createInvoice(invoiceData);
      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.get('/api/invoices/:number', async (req: any, res) => {
    try {
      const invoiceNumber = req.params.number;
      const invoice = await storage.getInvoiceByNumber(invoiceNumber);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.patch('/api/invoices/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateInvoiceStatus(invoiceId, status);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating invoice status:", error);
      res.status(500).json({ message: "Failed to update invoice status" });
    }
  });

  // Lending routes
  app.get('/api/lending-pools', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pools = await storage.getUserLendingPools(userId);
      res.json(pools);
    } catch (error) {
      console.error("Error fetching lending pools:", error);
      res.status(500).json({ message: "Failed to fetch lending pools" });
    }
  });

  app.post('/api/lending-pools', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const poolData = insertLendingPoolSchema.parse({ ...req.body, userId });
      const pool = await storage.createLendingPool(poolData);
      res.json(pool);
    } catch (error) {
      console.error("Error creating lending pool:", error);
      res.status(500).json({ message: "Failed to create lending pool" });
    }
  });

  // AI Agent routes
  app.get('/api/ai-agents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agents = await storage.getUserAiAgents(userId);
      res.json(agents);
    } catch (error) {
      console.error("Error fetching AI agents:", error);
      res.status(500).json({ message: "Failed to fetch AI agents" });
    }
  });

  app.post('/api/ai-agents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agentData = insertAiAgentSchema.parse({ ...req.body, userId });
      const agent = await storage.createAiAgent(agentData);
      res.json(agent);
    } catch (error) {
      console.error("Error creating AI agent:", error);
      res.status(500).json({ message: "Failed to create AI agent" });
    }
  });

  app.patch('/api/ai-agents/:id/stats', isAuthenticated, async (req: any, res) => {
    try {
      const agentId = parseInt(req.params.id);
      const { operations, valueManaged } = req.body;
      await storage.updateAiAgentStats(agentId, operations, valueManaged);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating AI agent stats:", error);
      res.status(500).json({ message: "Failed to update AI agent stats" });
    }
  });

  // Trust verification routes
  app.get('/api/trust-checks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const checks = await storage.getUserTrustChecks(userId);
      res.json(checks);
    } catch (error) {
      console.error("Error fetching trust checks:", error);
      res.status(500).json({ message: "Failed to fetch trust checks" });
    }
  });

  app.post('/api/trust-checks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const checkData = insertTrustCheckSchema.parse({ ...req.body, userId });
      const check = await storage.createTrustCheck(checkData);
      res.json(check);
    } catch (error) {
      console.error("Error creating trust check:", error);
      res.status(500).json({ message: "Failed to create trust check" });
    }
  });

  app.get('/api/trust-checks/:checkId', async (req: any, res) => {
    try {
      const checkId = req.params.checkId;
      const check = await storage.getTrustCheckById(checkId);
      if (!check) {
        return res.status(404).json({ message: "Trust check not found" });
      }
      res.json(check);
    } catch (error) {
      console.error("Error fetching trust check:", error);
      res.status(500).json({ message: "Failed to fetch trust check" });
    }
  });

  // QR Code processing endpoint
  app.post('/api/qr/process', isAuthenticated, async (req: any, res) => {
    try {
      const { qrData } = req.body;
      
      // Parse QR code data - could be payment request, invoice, or wallet address
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        // If not JSON, treat as simple address
        parsedData = { address: qrData };
      }

      res.json({
        type: parsedData.type || 'address',
        address: parsedData.address,
        amount: parsedData.amount,
        token: parsedData.token || 'ETH',
        network: parsedData.network || 'ethereum',
        message: parsedData.message,
      });
    } catch (error) {
      console.error("Error processing QR code:", error);
      res.status(500).json({ message: "Failed to process QR code" });
    }
  });

  // Dashboard stats endpoint
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const [wallets, transactions, aiAgents, lendingPools] = await Promise.all([
        storage.getUserWallets(userId),
        storage.getUserTransactions(userId, 10),
        storage.getUserAiAgents(userId),
        storage.getUserLendingPools(userId),
      ]);

      const totalBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance || '0'), 0);
      const activeAiAgents = aiAgents.filter(agent => agent.status === 'active').length;
      const totalLent = lendingPools.reduce((sum, pool) => sum + parseFloat(pool.amount), 0);

      res.json({
        totalBalance: totalBalance.toString(),
        activeWallets: wallets.length,
        recentTransactions: transactions,
        activeAiAgents,
        totalLent: totalLent.toString(),
        wallets: wallets.slice(0, 3), // Top 3 wallets for display
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
