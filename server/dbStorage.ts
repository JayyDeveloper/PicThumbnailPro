import { eq, desc } from 'drizzle-orm';
import { createDbConnection, type Database } from './db';
import {
  users,
  type User,
  type InsertUser,
  stockCategories,
  type StockCategory,
  type InsertStockCategory,
  referenceImages,
  type ReferenceImage,
  type InsertReferenceImage,
  thumbnails,
  type Thumbnail,
  type InsertThumbnail,
  pointPackages,
  type PointPackage,
  type InsertPointPackage,
  pointTransactions,
  type PointTransaction,
  type InsertPointTransaction
} from '@shared/schema';

export class DbStorage {
  private db: ReturnType<typeof createDbConnection>;

  constructor() {
    this.db = createDbConnection();
  }

  isConnected(): boolean {
    return this.db !== null;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.db) throw new Error('Database not connected');
    const result = await this.db.insert(users).values({
      ...insertUser,
      points: insertUser.points ?? 1, // Default to 1 point
      createdAt: new Date().toISOString(),
      stripeCustomerId: null
    }).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateUserPoints(id: number, pointChange: number): Promise<User | undefined> {
    if (!this.db) return undefined;

    const user = await this.getUser(id);
    if (!user) return undefined;

    // Prevent negative points
    const newPoints = Math.max(0, (user.points || 0) + pointChange);

    const result = await this.db.update(users)
      .set({ points: newPoints })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Stock category methods
  async getStockCategories(): Promise<StockCategory[]> {
    if (!this.db) return [];
    return this.db.select().from(stockCategories);
  }

  async getStockCategory(id: number): Promise<StockCategory | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(stockCategories).where(eq(stockCategories.id, id));
    return result[0];
  }

  async addStockCategory(category: InsertStockCategory): Promise<StockCategory> {
    if (!this.db) throw new Error('Database not connected');
    const result = await this.db.insert(stockCategories).values(category).returning();
    return result[0];
  }

  // Reference image methods
  async getReferenceImages(categoryId?: number): Promise<ReferenceImage[]> {
    if (!this.db) return [];
    if (categoryId) {
      return this.db.select().from(referenceImages).where(eq(referenceImages.categoryId, categoryId));
    }
    return this.db.select().from(referenceImages);
  }

  async getReferenceImage(id: number): Promise<ReferenceImage | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(referenceImages).where(eq(referenceImages.id, id));
    return result[0];
  }

  async addReferenceImage(image: InsertReferenceImage): Promise<ReferenceImage> {
    if (!this.db) throw new Error('Database not connected');
    const result = await this.db.insert(referenceImages).values(image).returning();
    return result[0];
  }

  // Thumbnail methods
  async getThumbnail(id: number): Promise<Thumbnail | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(thumbnails).where(eq(thumbnails.id, id));
    return result[0] as Thumbnail;
  }

  async getUserThumbnails(userId: number): Promise<Thumbnail[]> {
    if (!this.db) return [];
    const results = await this.db.select().from(thumbnails)
      .where(eq(thumbnails.userId, userId))
      .orderBy(desc(thumbnails.createdAt));
    return results as Thumbnail[];
  }

  async getRecentThumbnails(limit: number = 5): Promise<Thumbnail[]> {
    if (!this.db) return [];
    const results = await this.db.select().from(thumbnails)
      .orderBy(desc(thumbnails.createdAt))
      .limit(limit);
    return results as Thumbnail[];
  }

  async createThumbnail(thumbnail: InsertThumbnail): Promise<Thumbnail> {
    if (!this.db) throw new Error('Database not connected');
    const now = new Date().toISOString();
    const result = await this.db.insert(thumbnails).values({
      ...thumbnail,
      createdAt: now,
      updatedAt: now
    }).returning();
    return result[0] as Thumbnail;
  }

  async updateThumbnail(id: number, thumbnail: Partial<Thumbnail>): Promise<Thumbnail | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.update(thumbnails)
      .set({
        ...thumbnail,
        updatedAt: new Date().toISOString()
      })
      .where(eq(thumbnails.id, id))
      .returning();
    return result[0] as Thumbnail;
  }

  async deleteThumbnail(id: number): Promise<boolean> {
    if (!this.db) return false;
    await this.db.delete(thumbnails).where(eq(thumbnails.id, id));
    return true;
  }

  // Export thumbnail (placeholder - actual image processing done elsewhere)
  async exportThumbnail(imageUrl: string, elements: any, filters: any): Promise<Buffer> {
    // This method is a placeholder to match the MemStorage interface
    // Actual image processing is done in routes.ts using Sharp
    throw new Error('exportThumbnail should be called through image processor, not storage');
  }

  // Point package methods
  async getPointPackages(): Promise<PointPackage[]> {
    if (!this.db) return [];
    return this.db.select().from(pointPackages)
      .where(eq(pointPackages.active, true))
      .orderBy(pointPackages.price);
  }

  async getPointPackage(id: number): Promise<PointPackage | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(pointPackages).where(eq(pointPackages.id, id));
    return result[0];
  }

  async createPointPackage(pkg: InsertPointPackage): Promise<PointPackage> {
    if (!this.db) throw new Error('Database not connected');
    const result = await this.db.insert(pointPackages).values(pkg).returning();
    return result[0];
  }

  // Point transaction methods
  async getUserTransactions(userId: number): Promise<PointTransaction[]> {
    if (!this.db) return [];
    return this.db.select().from(pointTransactions)
      .where(eq(pointTransactions.userId, userId))
      .orderBy(desc(pointTransactions.createdAt));
  }

  async createPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction> {
    if (!this.db) throw new Error('Database not connected');
    const result = await this.db.insert(pointTransactions).values({
      ...transaction,
      createdAt: new Date().toISOString()
    }).returning();
    return result[0];
  }

  // Seed initial data (for first-time setup)
  async seedInitialData(): Promise<void> {
    if (!this.db) {
      console.warn('Cannot seed data: Database not connected');
      return;
    }

    try {
      // Check if data already exists
      const existingPackages = await this.getPointPackages();
      if (existingPackages.length > 0) {
        console.log('Database already seeded, skipping...');
        return;
      }

      console.log('Seeding initial data...');

      // Seed point packages
      await this.createPointPackage({
        name: "Basic Pack",
        points: 5,
        price: 499, // $4.99
        active: true
      });

      await this.createPointPackage({
        name: "Standard Pack",
        points: 15,
        price: 999, // $9.99
        active: true
      });

      await this.createPointPackage({
        name: "Pro Pack",
        points: 50,
        price: 1999, // $19.99
        active: true
      });

      // Seed stock categories
      const socialMediaCategory = await this.addStockCategory({
        name: "Social Media Thumbnails",
        imageCount: 6
      });

      const workspaceCategory = await this.addStockCategory({
        name: "Content Creator Workspace",
        imageCount: 4
      });

      // Seed reference images
      const referenceImagesData = [
        {
          url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7",
          alt: "Social media marketing",
          categoryId: socialMediaCategory.id,
          userId: null,
          isStock: true
        },
        {
          url: "https://images.unsplash.com/photo-1563986768609-322da13575f3",
          alt: "Content creation",
          categoryId: socialMediaCategory.id,
          userId: null,
          isStock: true
        },
        {
          url: "https://images.unsplash.com/photo-1611162616475-46b635cb6868",
          alt: "Social media icons",
          categoryId: socialMediaCategory.id,
          userId: null,
          isStock: true
        },
        {
          url: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb",
          alt: "YouTube video thumbnail",
          categoryId: socialMediaCategory.id,
          userId: null,
          isStock: true
        },
        {
          url: "https://images.unsplash.com/photo-1611162618479-ee3d24aaef0b",
          alt: "Colorful thumbnail design",
          categoryId: socialMediaCategory.id,
          userId: null,
          isStock: true
        },
        {
          url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0",
          alt: "Creative thumbnail layout",
          categoryId: socialMediaCategory.id,
          userId: null,
          isStock: true
        },
        {
          url: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc",
          alt: "Modern workspace",
          categoryId: workspaceCategory.id,
          userId: null,
          isStock: true
        },
        {
          url: "https://images.unsplash.com/photo-1593062096033-9a26b09da705",
          alt: "Creator studio setup",
          categoryId: workspaceCategory.id,
          userId: null,
          isStock: true
        },
        {
          url: "https://images.unsplash.com/photo-1547394765-185e1e68f34e",
          alt: "Video recording setup",
          categoryId: workspaceCategory.id,
          userId: null,
          isStock: true
        },
        {
          url: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625",
          alt: "Professional streaming equipment",
          categoryId: workspaceCategory.id,
          userId: null,
          isStock: true
        }
      ];

      for (const imageData of referenceImagesData) {
        await this.addReferenceImage(imageData);
      }

      console.log('✅ Initial data seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding data:', error);
    }
  }
}

export const dbStorage = new DbStorage();
