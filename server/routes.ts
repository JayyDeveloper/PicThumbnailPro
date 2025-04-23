import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import { insertThumbnailSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
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

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Upload image
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

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
        userId: 1, // Default user ID for demo
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
  app.post("/api/thumbnails", async (req, res) => {
    try {
      // Validate the request body
      const thumbnailData = insertThumbnailSchema.parse({
        ...req.body,
        userId: 1 // Default user for demo
      });

      // Save to storage
      const thumbnail = await storage.createThumbnail(thumbnailData);
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

  // Export thumbnail
  app.post("/api/thumbnails/export", async (req, res) => {
    try {
      const { imageUrl, elements, filters } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      // Process with Sharp
      // For demo purposes, we'll just return the image
      // In a real implementation, we would process the image with text overlays
      const imageBuffer = await storage.exportThumbnail(imageUrl, elements, filters);
      
      // Set response headers
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", "attachment; filename=thumbnail.png");
      
      // Send the buffer
      res.send(imageBuffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to export thumbnail" });
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
