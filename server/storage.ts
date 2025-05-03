import {
  type User,
  type InsertUser,
  type StockCategory,
  type InsertStockCategory,
  type ReferenceImage,
  type InsertReferenceImage,
  type Thumbnail,
  type InsertThumbnail,
  type PointPackage,
  type InsertPointPackage,
  type PointTransaction,
  type InsertPointTransaction
} from "@shared/schema";
import sharp from "sharp";
import fs from "fs";
import path from "path";

// Initialize with mock data for stock categories and images
const initialStockCategories = [
  { id: 1, name: "Social Media Thumbnails", imageCount: 6 },
  { id: 2, name: "Content Creator Workspace", imageCount: 4 }
];

const initialReferenceImages = [
  { 
    id: 1, 
    url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7", 
    alt: "Social media marketing", 
    categoryId: 1, 
    userId: 1, 
    isStock: true 
  },
  { 
    id: 2, 
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3", 
    alt: "Content creation", 
    categoryId: 1, 
    userId: 1, 
    isStock: true 
  },
  { 
    id: 3, 
    url: "https://images.unsplash.com/photo-1611162616475-46b635cb6868", 
    alt: "Social media icons", 
    categoryId: 1, 
    userId: 1, 
    isStock: true 
  },
  { 
    id: 4, 
    url: "https://images.unsplash.com/photo-1547658719-da2b51169166", 
    alt: "Creator workspace", 
    categoryId: 2, 
    userId: 1, 
    isStock: true 
  },
  { 
    id: 5, 
    url: "https://images.unsplash.com/photo-1622978147823-33d5e241e976", 
    alt: "Tech setup", 
    categoryId: 2, 
    userId: 1, 
    isStock: true 
  },
  { 
    id: 6, 
    url: "https://images.unsplash.com/photo-1596638787647-904d822d751e", 
    alt: "Workspace", 
    categoryId: 2, 
    userId: 1, 
    isStock: true 
  }
];

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  updateUserPoints(id: number, pointChange: number): Promise<User | undefined>;
  
  // Stock category methods
  getStockCategories(): Promise<StockCategory[]>;
  getStockCategory(id: number): Promise<StockCategory | undefined>;
  
  // Reference image methods
  getReferenceImages(categoryId?: number): Promise<ReferenceImage[]>;
  getReferenceImage(id: number): Promise<ReferenceImage | undefined>;
  addReferenceImage(image: InsertReferenceImage): Promise<ReferenceImage>;
  
  // Thumbnail methods
  getThumbnail(id: number): Promise<Thumbnail | undefined>;
  getRecentThumbnails(): Promise<Thumbnail[]>;
  getUserThumbnails(userId: number): Promise<Thumbnail[]>;
  createThumbnail(thumbnail: InsertThumbnail): Promise<Thumbnail>;
  updateThumbnail(id: number, thumbnail: Partial<InsertThumbnail>): Promise<Thumbnail | undefined>;
  deleteThumbnail(id: number): Promise<boolean>;
  
  // Image processing
  exportThumbnail(imageUrl: string, elements: any[], filters: any): Promise<Buffer>;
  
  // Points system
  getPointPackages(): Promise<PointPackage[]>;
  getPointPackage(id: number): Promise<PointPackage | undefined>;
  createPointPackage(pkg: InsertPointPackage): Promise<PointPackage>;
  updatePointPackage(id: number, pkg: Partial<InsertPointPackage>): Promise<PointPackage | undefined>;
  
  // Transaction methods
  createPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction>;
  getUserTransactions(userId: number): Promise<PointTransaction[]>;
  getTransaction(id: number): Promise<PointTransaction | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stockCategories: Map<number, StockCategory>;
  private referenceImages: Map<number, ReferenceImage>;
  private thumbnails: Map<number, Thumbnail>;
  private pointPackages: Map<number, PointPackage>;
  private pointTransactions: Map<number, PointTransaction>;
  
  private userIdCounter: number;
  private referenceImageIdCounter: number;
  private thumbnailIdCounter: number;
  private pointPackageIdCounter: number;
  private pointTransactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.stockCategories = new Map();
    this.referenceImages = new Map();
    this.thumbnails = new Map();
    this.pointPackages = new Map();
    this.pointTransactions = new Map();
    
    this.userIdCounter = 1;
    this.referenceImageIdCounter = initialReferenceImages.length + 1;
    this.thumbnailIdCounter = 1;
    this.pointPackageIdCounter = 1;
    this.pointTransactionIdCounter = 1;
    
    // Initialize with default user
    this.users.set(1, {
      id: 1,
      username: "demo",
      email: "demo@example.com",
      password: "password",
      points: 3,
      createdAt: new Date().toISOString(),
      stripeCustomerId: null
    });
    
    // Initialize stock categories
    initialStockCategories.forEach(category => {
      this.stockCategories.set(category.id, category);
    });
    
    // Initialize reference images
    initialReferenceImages.forEach(image => {
      this.referenceImages.set(image.id, image);
    });
    
    // Initialize point packages with the specified tiers
    this.pointPackages.set(1, {
      id: 1,
      name: "Basic Pack",
      points: 5,
      price: 499, // $4.99
      active: true
    });
    
    this.pointPackages.set(2, {
      id: 2,
      name: "Standard Pack",
      points: 15,
      price: 999, // $9.99
      active: true
    });
    
    this.pointPackages.set(3, {
      id: 3,
      name: "Pro Pack",
      points: 50,
      price: 1999, // $19.99
      active: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      points: insertUser.points ?? 1, // Use provided points or default to 1
      createdAt: new Date().toISOString(),
      stripeCustomerId: null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserPoints(id: number, pointChange: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    // Prevent negative points
    const newPoints = Math.max(0, (user.points || 0) + pointChange);
    
    const updatedUser = { 
      ...user, 
      points: newPoints
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Stock category methods
  async getStockCategories(): Promise<StockCategory[]> {
    return Array.from(this.stockCategories.values());
  }
  
  async getStockCategory(id: number): Promise<StockCategory | undefined> {
    return this.stockCategories.get(id);
  }
  
  // Reference image methods
  async getReferenceImages(categoryId?: number): Promise<ReferenceImage[]> {
    const images = Array.from(this.referenceImages.values());
    
    if (categoryId !== undefined) {
      return images.filter(image => image.categoryId === categoryId);
    }
    
    return images;
  }
  
  async getReferenceImage(id: number): Promise<ReferenceImage | undefined> {
    return this.referenceImages.get(id);
  }
  
  async addReferenceImage(image: InsertReferenceImage): Promise<ReferenceImage> {
    const id = this.referenceImageIdCounter++;
    const newImage: ReferenceImage = { ...image, id };
    this.referenceImages.set(id, newImage);
    
    // Update category count if categoryId is provided
    if (image.categoryId) {
      const category = this.stockCategories.get(image.categoryId);
      if (category) {
        this.stockCategories.set(image.categoryId, {
          ...category,
          imageCount: category.imageCount + 1
        });
      }
    }
    
    return newImage;
  }
  
  // Thumbnail methods
  async getThumbnail(id: number): Promise<Thumbnail | undefined> {
    return this.thumbnails.get(id);
  }
  
  async getRecentThumbnails(): Promise<Thumbnail[]> {
    return Array.from(this.thumbnails.values())
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }
  
  async getUserThumbnails(userId: number): Promise<Thumbnail[]> {
    const thumbnails = Array.from(this.thumbnails.values())
      .filter(thumbnail => thumbnail.userId === userId)
      .sort((a, b) => b.id - a.id);
    console.log('Getting user thumbnails:', thumbnails.map(t => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    })));
    return thumbnails;
  }
  
  async createThumbnail(thumbnail: InsertThumbnail): Promise<Thumbnail> {
    const id = this.thumbnailIdCounter++;
    const now = new Date().toISOString();
    const newThumbnail: Thumbnail = { 
      ...thumbnail, 
      id,
      name: thumbnail.name || "Untitled Thumbnail",
      userId: thumbnail.userId || null,
      createdAt: thumbnail.createdAt || now,
      updatedAt: thumbnail.updatedAt || now,
      elements: thumbnail.elements || [],
      stickers: thumbnail.stickers || [],
      filters: thumbnail.filters || {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0,
        filterName: null,
      }
    };
    console.log('Creating thumbnail with dates:', {
      createdAt: newThumbnail.createdAt,
      updatedAt: newThumbnail.updatedAt
    });
    this.thumbnails.set(id, newThumbnail);
    return newThumbnail;
  }
  
  async updateThumbnail(id: number, thumbnail: Partial<InsertThumbnail>): Promise<Thumbnail | undefined> {
    const existing = this.thumbnails.get(id);
    
    if (!existing) {
      return undefined;
    }
    
    const now = new Date().toISOString();
    const updated: Thumbnail = { 
      ...existing, 
      ...thumbnail,
      updatedAt: now
    };
    console.log('Updating thumbnail with dates:', {
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    });
    this.thumbnails.set(id, updated);
    return updated;
  }
  
  async deleteThumbnail(id: number): Promise<boolean> {
    return this.thumbnails.delete(id);
  }
  
  // Image processing - simplified for the demo
  async exportThumbnail(imageUrl: string, elements: any[], filters: any): Promise<Buffer> {
    try {
      // For demo purposes, just return a processed version of the image
      // In a real app, would add text overlays and apply filters
      
      // Handle stock images with full URLs vs uploaded images
      let imagePath;
      if (imageUrl.startsWith('http')) {
        // For demo, just use a placeholder local image
        imagePath = path.join(process.cwd(), "uploads", "placeholder.png");
        
        // If the placeholder doesn't exist, create an empty image
        if (!fs.existsSync(imagePath)) {
          await sharp({
            create: {
              width: 1280,
              height: 720,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 1 }
            }
          })
          .png()
          .toFile(imagePath);
        }
      } else {
        // For uploaded images, use the actual path
        imagePath = path.join(process.cwd(), imageUrl);
      }
      
      // Process the image
      return await sharp(imagePath)
        .resize({ width: 1280, height: 720, fit: "cover" })
        .png()
        .toBuffer();
    } catch (error) {
      console.error("Error exporting thumbnail:", error);
      throw error;
    }
  }
  
  // Point package methods
  async getPointPackages(): Promise<PointPackage[]> {
    return Array.from(this.pointPackages.values())
      .filter(pkg => pkg.active)
      .sort((a, b) => a.price - b.price);
  }
  
  async getPointPackage(id: number): Promise<PointPackage | undefined> {
    return this.pointPackages.get(id);
  }
  
  async createPointPackage(pkg: InsertPointPackage): Promise<PointPackage> {
    const id = this.pointPackageIdCounter++;
    const newPackage: PointPackage = { ...pkg, id };
    this.pointPackages.set(id, newPackage);
    return newPackage;
  }
  
  async updatePointPackage(id: number, pkg: Partial<InsertPointPackage>): Promise<PointPackage | undefined> {
    const existing = this.pointPackages.get(id);
    if (!existing) return undefined;
    
    const updated: PointPackage = { ...existing, ...pkg };
    this.pointPackages.set(id, updated);
    return updated;
  }
  
  // Transaction methods
  async createPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction> {
    const id = this.pointTransactionIdCounter++;
    const newTransaction: PointTransaction = {
      id,
      points: transaction.points,
      userId: transaction.userId,
      description: transaction.description,
      packageId: transaction.packageId ?? null,
      stripePaymentIntentId: transaction.stripePaymentIntentId ?? null,
      createdAt: new Date().toISOString()
    };
    this.pointTransactions.set(id, newTransaction);
    return newTransaction;
  }
  
  async getUserTransactions(userId: number): Promise<PointTransaction[]> {
    return Array.from(this.pointTransactions.values())
      .filter(tx => tx.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getTransaction(id: number): Promise<PointTransaction | undefined> {
    return this.pointTransactions.get(id);
  }
}

export const storage = new MemStorage();
