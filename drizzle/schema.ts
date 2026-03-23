import { integer, real, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
  lastSignedIn: text("lastSignedIn").notNull().$defaultFn(() => new Date().toISOString()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Creators table
export const creators = sqliteTable("creators", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  handle: text("handle").notNull().unique(),
  platform: text("platform").notNull().default("instagram"),
  niche: text("niche"),
  followerCount: integer("followerCount").notNull().default(0),
  weeklyGrowthRate: real("weeklyGrowthRate").default(0),
  postingFrequency: real("postingFrequency").default(0),
  averageViews: integer("averageViews").default(0),
  engagementRate: real("engagementRate").default(0),
  bio: text("bio"),
  impactScore: integer("impactScore").default(0),
  topFormat: text("topFormat"),
  avatarUrl: text("avatarUrl"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Creator = typeof creators.$inferSelect;
export type InsertCreator = typeof creators.$inferInsert;

// Posts table
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url"),
  creatorId: integer("creatorId").notNull(),
  creatorHandle: text("creatorHandle").notNull(),
  title: text("title").notNull(),
  format: text("format", { enum: ["reel", "carousel", "image"] }).notNull(),
  niche: text("niche"),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  engagementRate: real("engagementRate").default(0),
  followerCountAtPosting: integer("followerCountAtPosting").default(0),
  caption: text("caption"),
  hashtags: text("hashtags"),
  impactScore: integer("impactScore").default(0),
  // Blueprint data
  hookType: text("hookType"),
  contentStructure: text("contentStructure"),
  pacing: text("pacing"),
  length: text("length"),
  audioStrategy: text("audioStrategy"),
  visualStyle: text("visualStyle"),
  ctaStrategy: text("ctaStrategy"),
  thumbnailUrl: text("thumbnailUrl"),
  // Gemini deep analysis fields
  hookStrength: text("hookStrength"),
  hookAnalysis: text("hookAnalysis"),
  transcript: text("transcript"),
  keyMessages: text("keyMessages"),
  targetAudience: text("targetAudience"),
  emotionalTone: text("emotionalTone"),
  hookScore: integer("hookScore"),
  structureScore: integer("structureScore"),
  ctaScore: integer("ctaScore"),
  visualScore: integer("visualScore"),
  overallQualityScore: integer("overallQualityScore"),
  ctaPresence: integer("ctaPresence"),
  postedAt: text("postedAt"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

// Blueprints table
export const blueprints = sqliteTable("blueprints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  format: text("format", { enum: ["reel", "carousel", "image"] }).notNull(),
  description: text("description"),
  hookType: text("hookType"),
  structure: text("structure"),
  pacing: text("pacing"),
  length: text("length"),
  audioStrategy: text("audioStrategy"),
  visualStyle: text("visualStyle"),
  ctaStrategy: text("ctaStrategy"),
  usageCount: integer("usageCount").default(0),
  score: integer("score").default(0),
  sourcePostId: integer("sourcePostId"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
});

export type Blueprint = typeof blueprints.$inferSelect;
export type InsertBlueprint = typeof blueprints.$inferInsert;

// User profiles (connected Instagram accounts)
export const userProfiles = sqliteTable("userProfiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  instagramHandle: text("instagramHandle").notNull(),
  followerCount: integer("followerCount").default(0),
  weeklyGrowthRate: real("weeklyGrowthRate").default(0),
  postingFrequency: real("postingFrequency").default(0),
  averageViews: integer("averageViews").default(0),
  engagementRate: real("engagementRate").default(0),
  bio: text("bio"),
  impactScore: integer("impactScore").default(0),
  topFormat: text("topFormat"),
  niche: text("niche"),
  diagnostics: text("diagnostics"),
  createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().$defaultFn(() => new Date().toISOString()),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
