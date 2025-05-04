import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table (keeping this from original schema)
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

// Documents table
export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull().default("pending"),
  progress: integer("progress").notNull().default(0),
  exportFormat: text("export_format").notNull().default("pdf"),
  outputPath: text("output_path"),
  settings: text("settings"), // JSON string of processing settings
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents);
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Files table
export const files = pgTable("files", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  originalName: text("original_name").notNull(),
  filename: text("filename").notNull(),
  mimetype: text("mimetype").notNull(),
  size: integer("size").notNull(),
  status: text("status").notNull().default("pending"),
  processedContent: text("processed_content"),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFileSchema = createInsertSchema(files);
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

// Define relations
export const documentsRelations = relations(documents, ({ many }) => ({
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  document: one(documents, {
    fields: [files.documentId],
    references: [documents.id],
  }),
}));
