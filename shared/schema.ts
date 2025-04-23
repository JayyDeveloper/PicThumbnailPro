import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
  filters: jsonb("filters").notNull().default({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    filterName: null,
  }),
  userId: integer("user_id").references(() => users.id),
});

export const insertThumbnailSchema = createInsertSchema(thumbnails).pick({
  name: true,
  imageUrl: true,
  elements: true,
  filters: true,
  userId: true,
});

export type InsertThumbnail = z.infer<typeof insertThumbnailSchema>;
export type Thumbnail = typeof thumbnails.$inferSelect;
