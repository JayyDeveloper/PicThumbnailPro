import {
  type User,
  type InsertUser,
  type StockCategory,
  type InsertStockCategory,
  type ReferenceImage,
  type InsertReferenceImage,
  type Thumbnail,
  type InsertThumbnail
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
  createUser(user: InsertUser): Promise<User>;
  
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
  createThumbnail(thumbnail: InsertThumbnail): Promise<Thumbnail>;
  updateThumbnail(id: number, thumbnail: Partial<InsertThumbnail>): Promise<Thumbnail | undefined>;
  deleteThumbnail(id: number): Promise<boolean>;
  
  // Image processing
  exportThumbnail(imageUrl: string, elements: any[], filters: any): Promise<Buffer>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stockCategories: Map<number, StockCategory>;
  private referenceImages: Map<number, ReferenceImage>;
  private thumbnails: Map<number, Thumbnail>;
  
  private userIdCounter: number;
  private referenceImageIdCounter: number;
  private thumbnailIdCounter: number;

  constructor() {
    this.users = new Map();
    this.stockCategories = new Map();
    this.referenceImages = new Map();
    this.thumbnails = new Map();
    
    this.userIdCounter = 1;
    this.referenceImageIdCounter = initialReferenceImages.length + 1;
    this.thumbnailIdCounter = 1;
    
    // Initialize with default user
    this.users.set(1, {
      id: 1,
      username: "demo",
      password: "password"
    });
    
    // Initialize stock categories
    initialStockCategories.forEach(category => {
      this.stockCategories.set(category.id, category);
    });
    
    // Initialize reference images
    initialReferenceImages.forEach(image => {
      this.referenceImages.set(image.id, image);
    });
    
    // Initialize with some sample thumbnails
    this.thumbnails.set(1, {
      id: 1,
      name: "Gaming Channel",
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3",
      elements: [],
      filters: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0,
        filterName: null
      },
      userId: 1
    });
    
    this.thumbnails.set(2, {
      id: 2,
      name: "Social Media Guide",
      imageUrl: "https://images.unsplash.com/photo-1611162616475-46b635cb6868",
      elements: [],
      filters: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0,
        filterName: null
      },
      userId: 1
    });
    
    this.thumbnails.set(3, {
      id: 3,
      name: "My Workspace Tour",
      imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166",
      elements: [],
      filters: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0,
        filterName: null
      },
      userId: 1
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
  
  async createThumbnail(thumbnail: InsertThumbnail): Promise<Thumbnail> {
    const id = this.thumbnailIdCounter++;
    const newThumbnail: Thumbnail = { ...thumbnail, id };
    this.thumbnails.set(id, newThumbnail);
    return newThumbnail;
  }
  
  async updateThumbnail(id: number, thumbnail: Partial<InsertThumbnail>): Promise<Thumbnail | undefined> {
    const existing = this.thumbnails.get(id);
    
    if (!existing) {
      return undefined;
    }
    
    const updated: Thumbnail = { ...existing, ...thumbnail };
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
}

export const storage = new MemStorage();
