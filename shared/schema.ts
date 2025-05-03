import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  points: integer("points").notNull().default(1), // Start with 1 free point
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  stripeCustomerId: text("stripe_customer_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  points: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Stock category schema
export const stockCategories = pgTable("stock_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageCount: integer("image_count").notNull().default(0),
});

export const insertStockCategorySchema = createInsertSchema(stockCategories).pick({
  name: true,
  imageCount: true,
});

export type InsertStockCategory = z.infer<typeof insertStockCategorySchema>;
export type StockCategory = typeof stockCategories.$inferSelect;

// Reference image schema
export const referenceImages = pgTable("reference_images", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  categoryId: integer("category_id").references(() => stockCategories.id),
  userId: integer("user_id").references(() => users.id),
  isStock: boolean("is_stock").notNull().default(false),
});

export const insertReferenceImageSchema = createInsertSchema(referenceImages).pick({
  url: true,
  alt: true,
  categoryId: true,
  userId: true,
  isStock: true,
});

export type InsertReferenceImage = z.infer<typeof insertReferenceImageSchema>;
export type ReferenceImage = typeof referenceImages.$inferSelect;

// Thumbnail schema
export const thumbnails = pgTable("thumbnails", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Untitled Thumbnail"),
  imageUrl: text("image_url").notNull(),
  elements: jsonb("elements").notNull().default([]),
  stickers: jsonb("stickers").notNull().default([]),
  filters: jsonb("filters").notNull().default({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    filterName: null,
  }),
  userId: integer("user_id").references(() => users.id),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertThumbnailSchema = createInsertSchema(thumbnails).pick({
  name: true,
  imageUrl: true,
  elements: true,
  stickers: true,
  filters: true,
  userId: true,
  createdAt: true,
  updatedAt: true
});

export type Thumbnail = {
  id: number;
  name: string;
  imageUrl: string;
  elements: any[];
  stickers: any[];
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    filterName: string | null;
  };
  userId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type InsertThumbnail = Omit<Thumbnail, "id">;

// Point packages
export const pointPackages = pgTable("point_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  points: integer("points").notNull(),
  price: integer("price").notNull(), // in cents
  active: boolean("active").notNull().default(true),
});

export const insertPointPackageSchema = createInsertSchema(pointPackages).pick({
  name: true,
  points: true,
  price: true,
  active: true,
});

export type InsertPointPackage = z.infer<typeof insertPointPackageSchema>;
export type PointPackage = typeof pointPackages.$inferSelect;

// Point transactions
export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  packageId: integer("package_id").references(() => pointPackages.id),
  points: integer("points").notNull(),
  description: text("description").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertPointTransactionSchema = createInsertSchema(pointTransactions).pick({
  userId: true,
  packageId: true,
  points: true,
  description: true,
  stripePaymentIntentId: true,
});

export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;
export type PointTransaction = typeof pointTransactions.$inferSelect;
