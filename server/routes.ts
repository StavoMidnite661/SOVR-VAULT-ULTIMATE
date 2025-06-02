import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertWalletSchema, insertTransactionSchema, insertMassPaymentSchema, insertInvoiceSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { generateQRCode, parseQRCode } from "../client/src/lib/qr-utils";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
  app.post('/api/wallets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const walletData = insertWalletSchema.parse({ ...req.body, userId });
      const wallet = await storage.createWallet(walletData);
      res.json(wallet);
    } catch (error) {
      console.error("Error creating wallet:", error);
      res.status(400).json({ message: "Failed to create wallet" });
    }
  });

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

  app.get('/api/wallets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const walletId = parseInt(req.params.id);
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      res.json(wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  // Transaction routes
  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionData = insertTransactionSchema.parse({ ...req.body, userId });
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.patch('/api/transactions/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const { status } = req.body;
      const transaction = await storage.updateTransactionStatus(transactionId, status);
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction status:", error);
      res.status(400).json({ message: "Failed to update transaction status" });
    }
  });

  // Mass payment routes
  app.post('/api/mass-payments', isAuthenticated, upload.single('csvFile'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "CSV file is required" });
      }

      // Parse CSV data
      const csvData = file.buffer.toString('utf-8');
      const lines = csvData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const recipients = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {} as any);
      });

      const totalAmount = recipients.reduce((sum, recipient) => {
        return sum + parseFloat(recipient.amount || 0);
      }, 0);

      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const massPaymentData = insertMassPaymentSchema.parse({
        userId,
        batchId,
        fileName: file.originalname,
        totalRecipients: recipients.length,
        totalAmount: totalAmount.toString(),
        status: 'pending',
        recipientsData: recipients,
      });

      const massPayment = await storage.createMassPayment(massPaymentData);
      res.json(massPayment);
    } catch (error) {
      console.error("Error creating mass payment:", error);
      res.status(400).json({ message: "Failed to process mass payment" });
    }
  });

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

  app.patch('/api/mass-payments/:id/execute', isAuthenticated, async (req: any, res) => {
    try {
      const massPaymentId = parseInt(req.params.id);
      // Update status to processing
      await storage.updateMassPaymentStatus(massPaymentId, 'processing');
      
      // Here you would integrate with CDP SDK for actual payments
      // For now, simulate processing
      setTimeout(async () => {
        await storage.updateMassPaymentStatus(massPaymentId, 'complete');
      }, 5000);

      res.json({ message: "Mass payment execution started" });
    } catch (error) {
      console.error("Error executing mass payment:", error);
      res.status(400).json({ message: "Failed to execute mass payment" });
    }
  });

  // Invoice routes
  app.post('/api/invoices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, asset, description } = req.body;
      
      const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate QR code for payment
      const paymentData = {
        type: 'payment_request',
        invoiceId,
        amount,
        asset,
        description
      };
      const qrCode = await generateQRCode(JSON.stringify(paymentData));

      const invoiceData = insertInvoiceSchema.parse({
        userId,
        invoiceId,
        amount: amount.toString(),
        asset,
        description,
        qrCode,
        status: 'pending',
      });

      const invoice = await storage.createInvoice(invoiceData);
      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: "Failed to create invoice" });
    }
  });

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

  app.get('/api/invoices/:invoiceId', async (req, res) => {
    try {
      const { invoiceId } = req.params;
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // QR Scanner routes
  app.post('/api/qr/scan', isAuthenticated, upload.single('qrImage'), async (req: any, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "QR image is required" });
      }

      // Parse QR code from image
      const qrData = await parseQRCode(file.buffer);
      
      if (!qrData) {
        return res.status(400).json({ message: "No QR code found in image" });
      }

      try {
        const paymentData = JSON.parse(qrData);
        res.json({ success: true, data: paymentData });
      } catch {
        // If not JSON, return raw data
        res.json({ success: true, data: qrData });
      }
    } catch (error) {
      console.error("Error scanning QR code:", error);
      res.status(400).json({ message: "Failed to scan QR code" });
    }
  });

  // AI Agent routes
  app.post('/api/ai-agent/actions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { actionType, parameters, agentWalletId } = req.body;

      const action = await storage.createAiAgentAction({
        userId,
        agentWalletId,
        actionType,
        parameters,
        status: 'pending',
      });

      // Simulate AI processing
      setTimeout(async () => {
        const result = { success: true, message: `${actionType} completed successfully` };
        await storage.updateAiAgentActionStatus(action.id, 'success', result);
      }, 3000);

      res.json(action);
    } catch (error) {
      console.error("Error creating AI agent action:", error);
      res.status(400).json({ message: "Failed to create AI agent action" });
    }
  });

  app.get('/api/ai-agent/actions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const actions = await storage.getUserAiAgentActions(userId);
      res.json(actions);
    } catch (error) {
      console.error("Error fetching AI agent actions:", error);
      res.status(500).json({ message: "Failed to fetch AI agent actions" });
    }
  });

  // Trust verification routes
  app.post('/api/trust/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { documentHash, verificationType, metadata } = req.body;

      // Generate QR code for trust verification
      const trustData = {
        type: 'trust_verification',
        documentHash,
        userId,
        timestamp: Date.now()
      };
      const qrCode = await generateQRCode(JSON.stringify(trustData));

      const verification = await storage.createTrustVerification({
        userId,
        documentHash,
        qrCode,
        verificationType,
        metadata,
      });

      res.json(verification);
    } catch (error) {
      console.error("Error creating trust verification:", error);
      res.status(400).json({ message: "Failed to create trust verification" });
    }
  });

  app.get('/api/trust/verifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const verifications = await storage.getUserTrustVerifications(userId);
      res.json(verifications);
    } catch (error) {
      console.error("Error fetching trust verifications:", error);
      res.status(500).json({ message: "Failed to fetch trust verifications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
