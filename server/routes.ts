import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import { 
  insertThumbnailSchema, 
  insertUserSchema, 
  insertPointTransactionSchema 
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import crypto from "crypto";
import Stripe from "stripe";
import { generateImageFromPrompt } from "./imageGenerator";

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

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate random salt
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Hash password with salt
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') + '.' + salt);
    });
  });
}

// Helper function to verify passwords
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [hash, salt] = hashedPassword.split('.');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(hash === derivedKey.toString('hex'));
    });
  });
}

// Authentication middleware
function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    // In a real app, you would verify and decode a JWT token
    // For this demo, we'll use a simplified approach
    const userId = parseInt(token);
    
    if (isNaN(userId)) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.log(`Authentication for user ID: ${userId}`);
    
    storage.getUser(userId)
      .then(user => {
        if (!user) {
          console.log(`Authentication failed: User not found with ID ${userId}`);
          return res.status(401).json({ error: 'User not found' });
        }
        
        // Set all user data including points
        req.user = {
          id: user.id,  // Make sure ID is set correctly
          username: user.username,
          email: user.email,
          points: user.points ?? 1 // Default to 1 point for new users
        };
        
        // Log user info for debugging
        console.log(`Authentication successful. User data: ${JSON.stringify(req.user)}`);
        
        next();
      })
      .catch(error => {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
      });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
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
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        token: String(user.id) // In a real app, this would be a JWT token
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
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token: String(user.id) // In a real app, this would be a JWT token
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
      
      // Add points to user (in a real app, this would happen after payment confirmation)
      const updatedUser = await storage.updateUserPoints(req.user.id, pointPackage.points);
      
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
      
      if (user.points < 1) {
        console.log(`Insufficient points for user ${user.id}: ${user.points}`);
        return res.status(403).json({ 
          error: "Insufficient points", 
          pointsRequired: 1,
          currentPoints: user.points || 0
        });
      }

      // Validate the request body
      const thumbnailData = insertThumbnailSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Save to storage
      const thumbnail = await storage.createThumbnail(thumbnailData);
      
      // Deduct a point and record the transaction
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

  // Debug endpoint to check user points (DEVELOPMENT ONLY)
  app.get("/api/debug/points/:userId", async (req, res) => {
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
