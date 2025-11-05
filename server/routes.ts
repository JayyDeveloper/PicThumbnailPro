import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage as memStorage } from "./storage";
import { dbStorage } from "./dbStorage";
import { generateToken, verifyToken, hashPassword, verifyPassword } from "./auth";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import {
  insertThumbnailSchema,
  insertUserSchema,
  insertPointTransactionSchema,
  type InsertThumbnail
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import Stripe from "stripe";
import { generateImageFromPrompt } from "./imageGenerator";
import {
  analyzeImageForThumbnail,
  generateViralSuggestions,
  generateThumbnailText,
  isAIEnabled,
  getAIServiceStatus
} from "./aiService";

// Use database storage if available, otherwise fallback to memory storage
const storage = dbStorage.isConnected() ? dbStorage : memStorage;

if (dbStorage.isConnected()) {
  console.log('✅ Using database storage (PostgreSQL)');
  // Seed initial data on startup
  dbStorage.seedInitialData().catch(console.error);
} else {
  console.warn('⚠️  Database not connected. Using in-memory storage (data will be lost on restart)');
  console.warn('⚠️  Set DATABASE_URL environment variable to enable persistent storage');
}

// Middleware for JWT token-based authentication
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    points?: number; // Add points field to user object
  };
  file?: any; // For multer file uploads
}

// Create Stripe instance if secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" as any })
  : null;

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed."));
    }
  },
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Authentication middleware using JWT
function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  // Verify JWT token
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  console.log(`Authentication for user ID: ${payload.userId}`);

  // Fetch fresh user data from storage
  storage.getUser(payload.userId)
    .then(user => {
      if (!user) {
        console.log(`Authentication failed: User not found with ID ${payload.userId}`);
        return res.status(401).json({ error: 'User not found' });
      }

      // Set all user data including points
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        points: user.points ?? 1 // Default to 1 point for new users
      };

      console.log(`Authentication successful. User: ${user.username}`);
      next();
    })
    .catch(error => {
      console.error('Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ===== USER ROUTES =====
  
  // Register a new user
  app.post('/api/auth/register', async (req, res) => {
    try {
      // Validate request data
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already taken' });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user with 1 free point (default from schema)
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        username: user.username,
        email: user.email
      });

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      console.log(`✅ New user registered: ${user.username} (${user.email}) with ${user.points} free token`);

      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });
  
  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const validPassword = await verifyPassword(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        username: user.username,
        email: user.email
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      console.log(`✅ User logged in: ${user.username} (${user.points} tokens available)`);

      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });
  
  // Get current user
  app.get('/api/user', authenticate, async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get full user data from storage to ensure we have the correct points
    const fullUser = await storage.getUser(req.user.id);
    
    // Make sure points field is explicitly set to 1 for new users if it's undefined
    if (fullUser && (fullUser.points === undefined || fullUser.points === null)) {
      fullUser.points = 1; // Default for new users
      await storage.updateUser(fullUser.id, { points: 1 });
    }
    
    res.json(fullUser || req.user);
  });
  
  // ===== POINT SYSTEM ROUTES =====
  
  // Get available point packages
  app.get('/api/point-packages', async (req, res) => {
    try {
      const packages = await storage.getPointPackages();
      res.json(packages);
    } catch (error) {
      console.error('Error fetching point packages:', error);
      res.status(500).json({ error: 'Failed to fetch point packages' });
    }
  });
  
  // Get user transactions
  app.get('/api/transactions', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      
      const transactions = await storage.getUserTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });
  
  // Purchase points
  app.post('/api/purchase-points', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      
      const { packageId } = req.body;
      
      if (!packageId) {
        return res.status(400).json({ error: 'Package ID is required' });
      }
      
      // Get package
      const pointPackage = await storage.getPointPackage(parseInt(packageId));
      if (!pointPackage) {
        return res.status(404).json({ error: 'Point package not found' });
      }
      
      if (!pointPackage.active) {
        return res.status(400).json({ error: 'This package is no longer available' });
      }
      
      // Initialize Stripe payment (if stripe is available)
      let paymentIntentId = null;
      if (stripe) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: pointPackage.price,
          currency: 'usd',
          metadata: {
            userId: String(req.user.id),
            packageId: String(pointPackage.id)
          }
        });
        
        paymentIntentId = paymentIntent.id;
      } else {
        // If Stripe is not available, simulate a successful payment for demo
        console.log('Stripe not configured. Simulating payment for demo purposes.');
      }
      
      // Create transaction record
      const transaction = await storage.createPointTransaction({
        userId: req.user.id,
        packageId: pointPackage.id,
        points: pointPackage.points,
        description: `Purchase of ${pointPackage.name}`,
        stripePaymentIntentId: paymentIntentId
      });

      // ⚠️ SECURITY WARNING: Adding points immediately before payment confirmation
      // TODO: Refactor to only add points after Stripe webhook confirms payment
      // For now, adding points immediately for demo purposes
      const updatedUser = await storage.updateUserPoints(req.user.id, pointPackage.points);
      console.warn('⚠️  Points added before payment confirmation - INSECURE for production!');
      
      let clientSecret = null;
      if (stripe && paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId as string);
        clientSecret = paymentIntent.client_secret;
      }
      
      res.json({
        transaction,
        user: updatedUser,
        clientSecret
      });
    } catch (error) {
      console.error('Error purchasing points:', error);
      res.status(500).json({ error: 'Failed to purchase points' });
    }
  });

  // Stripe webhook handler for payment confirmation
  app.post('/api/stripe/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(400).json({ error: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    if (!sig) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { userId, packageId } = paymentIntent.metadata;

      console.log(`✅ Payment succeeded for user ${userId}, package ${packageId}`);

      // In a production app, you would:
      // 1. Verify the transaction hasn't been processed already
      // 2. Add the points to the user's account
      // 3. Update the transaction record

      // For now, just log the event since points are already added
      // (This needs to be refactored to only add points after webhook confirmation)
      console.log('Payment confirmed via webhook. Points should be added here, not in purchase endpoint.');
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { userId } = paymentIntent.metadata;

      console.error(`❌ Payment failed for user ${userId}`);

      // In production, you would handle failed payments here
      // (e.g., notify user, remove points if already added)
    }

    res.json({ received: true });
  });

  // Use points to create a thumbnail
  app.post('/api/use-points', authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      
      console.log(`Use-points request from user ID: ${req.user.id}`);
      
      // Get user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        console.log(`User not found with ID: ${req.user.id}`);
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log(`User points before check: ${JSON.stringify(user.points)}, type: ${typeof user.points}`);
      
      // Fix for missing points - ensure new users have 1 point
      if (user.points === undefined || user.points === null) {
        console.log(`Setting default 1 point for user: ${user.id}`);
        await storage.updateUser(user.id, { points: 1 });
        user.points = 1; // Update local variable
      }
      
      // Check if user has points
      if (user.points < 1) {
        console.log(`Insufficient points for user ${user.id}: ${user.points}`);
        return res.status(403).json({ 
          error: 'Insufficient points', 
          pointsRequired: 1,
          currentPoints: user.points
        });
      }
      
      // Deduct points
      const updatedUser = await storage.updateUserPoints(user.id, -1);
      
      // Create transaction record
      const transaction = await storage.createPointTransaction({
        userId: user.id,
        points: -1,
        description: 'Created thumbnail',
      });
      
      res.json({
        success: true,
        remainingPoints: updatedUser?.points || 0,
        transaction
      });
    } catch (error) {
      console.error('Error using points:', error);
      res.status(500).json({ error: 'Failed to use points' });
    }
  });
  
  // Get stock categories
  app.get("/api/stock-categories", async (req, res) => {
    try {
      const categories = await storage.getStockCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock categories" });
    }
  });

  // Get reference images (with optional category filter)
  app.get("/api/reference-images", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const images = await storage.getReferenceImages(categoryId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reference images" });
    }
  });

  // Generate image from prompt using Unsplash
  app.post("/api/generate-image", async (req: AuthRequest, res) => {
    try {      
      // Validate prompt
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return res.status(400).json({ error: "A valid text prompt is required" });
      }
      
      // For testing, use a default user ID
      const userId = req.user?.id || 1;
      
      // Generate image using Unsplash
      const imageUrl = await generateImageFromPrompt(prompt);
      
      // Save reference to the database
      const image = await storage.addReferenceImage({
        url: imageUrl,
        alt: `Generated from prompt: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
        userId: userId,
        isStock: false
      });
      
      res.json({
        url: imageUrl,
        id: image.id,
        alt: image.alt,
        success: true,
        message: "Image generated successfully from prompt"
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      res.status(500).json({
        error: "Failed to generate image",
        message: error?.message || "Unknown error"
      });
    }
  });

  // AI-Powered Thumbnail Generation with Viral Suggestions
  app.post("/api/ai-generate-thumbnail", authenticate, upload.single("file"), async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Check if AI is enabled
      if (!isAIEnabled()) {
        return res.status(503).json({
          error: "AI service not available",
          message: "OpenAI API key not configured. Set OPENAI_API_KEY in environment variables."
        });
      }

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      // Validate prompt
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return res.status(400).json({ error: "A description/prompt is required" });
      }

      console.log(`🎨 AI thumbnail generation request from user ${req.user.username}`);
      console.log(`📝 Prompt: ${prompt}`);

      // Check if user has enough points (AI generation costs 2 tokens)
      const AI_GENERATION_COST = 2;
      const user = await storage.getUser(req.user.id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.points < AI_GENERATION_COST) {
        return res.status(403).json({
          error: "Insufficient points",
          message: `AI thumbnail generation requires ${AI_GENERATION_COST} tokens. You have ${user.points} tokens.`,
          pointsRequired: AI_GENERATION_COST,
          currentPoints: user.points
        });
      }

      // Save uploaded image temporarily
      const timestamp = Date.now();
      const filename = `ai-upload-${timestamp}.jpg`;
      const filepath = path.join(uploadsDir, filename);

      await sharp(req.file.buffer)
        .resize({ width: 1280, height: 720, fit: "cover" })
        .jpeg({ quality: 90 })
        .toFile(filepath);

      console.log(`💾 Image saved: ${filename}`);

      // Step 1: Analyze image with AI
      console.log('🤖 Starting AI analysis...');
      const imageAnalysis = await analyzeImageForThumbnail(filepath, prompt);

      // Step 2: Generate viral suggestions
      const suggestions = await generateViralSuggestions(imageAnalysis, prompt);

      // Step 3: Generate thumbnail text overlays
      const textOverlays = await generateThumbnailText(imageAnalysis, prompt);

      // The enhanced image URL (for now, return the uploaded image)
      // In a future enhancement, we could apply AI-suggested modifications
      const enhancedImageUrl = `/uploads/${filename}`;

      // Save reference to the database
      const image = await storage.addReferenceImage({
        url: enhancedImageUrl,
        alt: `AI-generated thumbnail: ${prompt.substring(0, 50)}`,
        userId: req.user.id,
        isStock: false
      });

      // Deduct points and create transaction
      await storage.updateUserPoints(req.user.id, -AI_GENERATION_COST);
      await storage.createPointTransaction({
        userId: req.user.id,
        points: -AI_GENERATION_COST,
        description: `AI thumbnail generation: ${prompt.substring(0, 40)}...`
      });

      console.log(`✅ AI generation complete. ${AI_GENERATION_COST} tokens deducted.`);

      // Return comprehensive response
      res.json({
        success: true,
        enhancedImageUrl,
        imageId: image.id,
        analysis: imageAnalysis,
        suggestions,
        textOverlays,
        pointsUsed: AI_GENERATION_COST,
        remainingPoints: user.points - AI_GENERATION_COST,
        message: "AI thumbnail generated successfully with viral optimization"
      });
    } catch (error: any) {
      console.error("❌ Error in AI thumbnail generation:", error);

      res.status(500).json({
        error: "Failed to generate AI thumbnail",
        message: error?.message || "Unknown error"
      });
    }
  });

  // Get AI service status
  app.get("/api/ai-status", (req, res) => {
    res.json(getAIServiceStatus());
  });

  // Upload image (temporarily removed authentication for testing)
  app.post("/api/upload", upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      // For testing, use a default user ID
      const userId = req.user?.id || 1;

      // Process the image with sharp
      const timestamp = Date.now();
      const filename = `thumbnail-${timestamp}.webp`;
      const filepath = path.join(uploadsDir, filename);

      // Process and save the image
      await sharp(req.file.buffer)
        .resize({ width: 1280, height: 720, fit: "cover" })
        .webp({ quality: 90 })
        .toFile(filepath);

      // For demonstration, our URLs will be local
      const imageUrl = `/uploads/${filename}`;

      // Save reference to the database
      const image = await storage.addReferenceImage({
        url: imageUrl,
        alt: req.body.alt || "Uploaded image",
        categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined,
        userId: userId,
        isStock: false
      });

      res.json({
        url: imageUrl,
        id: image.id,
        alt: image.alt
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Get recent thumbnails
  app.get("/api/thumbnails/recent", async (req, res) => {
    try {
      const thumbnails = await storage.getRecentThumbnails();
      res.json(thumbnails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent thumbnails" });
    }
  });

  // Get thumbnail by ID
  app.get("/api/thumbnails/:id", async (req, res) => {
    try {
      const thumbnail = await storage.getThumbnail(parseInt(req.params.id));
      if (!thumbnail) {
        return res.status(404).json({ error: "Thumbnail not found" });
      }
      res.json(thumbnail);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch thumbnail" });
    }
  });

  // Save thumbnail
  app.post("/api/thumbnails", authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      console.log(`Save thumbnail request from user ID: ${req.user.id}`);
      console.log(`User data from request: ${JSON.stringify(req.user)}`);
      
      // Check if user has enough points to save a thumbnail
      const user = await storage.getUser(req.user.id);
      console.log(`User from storage: ${JSON.stringify(user)}`);
      
      if (!user) {
        console.log(`User ${req.user.id} not found in storage!`);
        return res.status(404).json({ error: "User not found" });
      }
      
      console.log(`User points before check: ${JSON.stringify(user.points)}, type: ${typeof user.points}`);
      
      // Fix for missing points - set to 1 for new users
      if (user.points === undefined || user.points === null) {
        console.log(`Setting default 1 point for user: ${user.id}`);
        await storage.updateUser(user.id, { points: 1 });
        user.points = 1; // Update local variable
        console.log(`Updated user points: ${user.points}`);
      }
      
      console.log(`Final user points: ${user.points}`);

      // First check if this is an update to an existing thumbnail
      const thumbnailId = req.body.id;
      if (thumbnailId) {
        const existingThumbnail = await storage.getThumbnail(thumbnailId);
        if (existingThumbnail) {
          // For updates, we want to preserve all fields that aren't explicitly provided
          const updateData = {
            ...existingThumbnail,
            ...req.body,
            userId: req.user.id,
            updatedAt: new Date().toISOString()
          };
          
          // Update existing thumbnail without deducting points
          const thumbnail = await storage.updateThumbnail(thumbnailId, updateData);
          res.status(200).json(thumbnail);
          return;
        }
      }
      
      // For new thumbnails, check points and deduct
      if (user.points < 1) {
        console.log(`Insufficient points for user ${req.user.id}: ${user.points}`);
        return res.status(403).json({ 
          error: "Insufficient points", 
          pointsRequired: 1,
          currentPoints: user.points || 0
        });
      }

      // Validate the request body for new thumbnails
      const now = new Date().toISOString();
      const thumbnailData = insertThumbnailSchema.parse({
        ...req.body,
        userId: req.user.id,
        createdAt: now,
        updatedAt: now
      });

      // Save new thumbnail to storage
      const thumbnail = await storage.createThumbnail(thumbnailData as InsertThumbnail);
      
      // Deduct a point and record the transaction only for new thumbnails
      await storage.updateUserPoints(req.user.id, -1);
      await storage.createPointTransaction({
        userId: req.user.id,
        points: -1,
        description: "Saved thumbnail: " + thumbnailData.name
      });
      
      res.status(201).json(thumbnail);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to save thumbnail" });
      }
    }
  });
  
  // Get user thumbnails
  app.get("/api/user/thumbnails", authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const thumbnails = await storage.getUserThumbnails(req.user.id);
      console.log('Sending thumbnails:', thumbnails.map(t => ({
        id: t.id,
        name: t.name,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      })));
      res.json(thumbnails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user thumbnails" });
    }
  });

  // Export thumbnail
  app.post("/api/thumbnails/export", authenticate, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      console.log(`Export thumbnail request from user ID: ${req.user.id}`);
      console.log(`User data from request: ${JSON.stringify(req.user)}`);
      
      const { imageUrl, elements, filters } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      // Check if user has enough points
      const user = await storage.getUser(req.user.id);
      console.log(`User from storage: ${JSON.stringify(user)}`);
      
      if (!user) {
        console.log(`User ${req.user.id} not found in storage!`);
        return res.status(404).json({ error: "User not found" });
      }
      
      console.log(`User points before check: ${JSON.stringify(user.points)}, type: ${typeof user.points}`);
      
      // Fix for missing points - set to 1 for new users
      if (user.points === undefined || user.points === null) {
        console.log(`Setting default 1 point for user: ${user.id}`);
        await storage.updateUser(user.id, { points: 1 });
        user.points = 1; // Update local variable
        console.log(`Updated user points: ${user.points}`);
      }
      
      console.log(`Final user points: ${user.points}`);
      
      if (!user || user.points < 1) {
        console.log(`Insufficient points for user ${user.id}: ${user.points}`);
        return res.status(403).json({ 
          error: "Insufficient points", 
          pointsRequired: 1,
          currentPoints: user?.points || 0
        });
      }

      // Process with Sharp
      // For demo purposes, we'll just return the image
      // In a real implementation, we would process the image with text overlays
      const imageBuffer = await storage.exportThumbnail(imageUrl, elements, filters);
      
      // Deduct a point and record the transaction
      await storage.updateUserPoints(req.user.id, -1);
      await storage.createPointTransaction({
        userId: req.user.id,
        points: -1,
        description: "Exported thumbnail"
      });
      
      // Set response headers
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", "attachment; filename=thumbnail.png");
      
      // Send the buffer
      res.send(imageBuffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to export thumbnail" });
    }
  });

  // Debug login endpoint for testing insufficient points (DEVELOPMENT ONLY)
  app.post("/api/debug/login-with-points", async (req, res) => {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Debug endpoints are disabled in production' });
    }

    try {
      const { username, points } = req.body;

      if (!username || points === undefined) {
        return res.status(400).json({ error: "Username and points are required" });
      }

      // Find or create user
      let user = await storage.getUserByUsername(username);

      if (!user) {
        // Create a test user if it doesn't exist
        user = await storage.createUser({
          username,
          email: `${username}@example.com`,
          password: await hashPassword("password123"),
          points: points
        });
        console.log(`Created test user ${username} with ${points} points`);
      } else {
        // Update existing user's points
        const updatedUser = await storage.updateUser(user.id, { points });
        if (updatedUser) {
          user = updatedUser;
        }
        console.log(`Updated test user ${username} to have ${points} points`);
      }

      if (!user) {
        return res.status(500).json({ error: 'Failed to create or update user' });
      }

      // Generate JWT token for debug session
      const token = generateToken({
        userId: user.id,
        username: user.username,
        email: user.email
      });

      // Create a new object without the password
      const userWithoutPassword = {
        id: user.id,
        username: user.username,
        email: user.email,
        points: points, // Use the points from the request
        createdAt: user.createdAt,
        stripeCustomerId: user.stripeCustomerId
      };

      res.json({
        user: userWithoutPassword,
        token,
        message: `Logged in with ${points} points (DEBUG MODE)`
      });
    } catch (error) {
      console.error('Debug login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Debug endpoint to check user points (DEVELOPMENT ONLY)
  app.get("/api/debug/points/:userId", async (req, res) => {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Debug endpoints are disabled in production' });
    }

    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        userId: user.id,
        username: user.username,
        points: user.points,
        pointsType: typeof user.points
      });
    } catch (error) {
      console.error('Error fetching debug points:', error);
      res.status(500).json({ error: 'Failed to fetch debug points' });
    }
  });
  
  // Endpoint to set points for debugging (DEVELOPMENT ONLY)
  app.post("/api/debug/set-points/:userId", async (req, res) => {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Debug endpoints are disabled in production' });
    }

    try {
      const userId = parseInt(req.params.userId);
      const { points } = req.body;

      if (isNaN(userId) || typeof points !== 'number') {
        return res.status(400).json({ error: "Invalid user ID or points value" });
      }

      const user = await storage.updateUser(userId, { points });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        userId: user.id,
        username: user.username,
        points: user.points
      });
    } catch (error) {
      console.error('Error setting debug points:', error);
      res.status(500).json({ error: 'Failed to set debug points' });
    }
  });
  
  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    // Check if the request is for a file in the uploads directory
    if (req.url) {
      const filePath = path.join(uploadsDir, path.basename(req.url));
      // Check if the file exists
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
