import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Creators table
export const creators = mysqlTable("creators", {
  id: int("id").autoincrement().primaryKey(),
  handle: varchar("handle", { length: 128 }).notNull().unique(),
  platform: varchar("platform", { length: 32 }).notNull().default("instagram"),
  niche: varchar("niche", { length: 128 }),
  followerCount: int("followerCount").notNull().default(0),
  weeklyGrowthRate: float("weeklyGrowthRate").default(0),
  postingFrequency: float("postingFrequency").default(0),
  averageViews: int("averageViews").default(0),
  engagementRate: float("engagementRate").default(0),
  bio: text("bio"),
  impactScore: int("impactScore").default(0),
  topFormat: varchar("topFormat", { length: 32 }),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Creator = typeof creators.$inferSelect;
export type InsertCreator = typeof creators.$inferInsert;

// Posts table
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  url: text("url"),
  creatorId: int("creatorId").notNull(),
  creatorHandle: varchar("creatorHandle", { length: 128 }).notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  format: mysqlEnum("format", ["reel", "carousel", "image"]).notNull(),
  niche: varchar("niche", { length: 128 }),
  views: int("views").notNull().default(0),
  likes: int("likes").notNull().default(0),
  comments: int("comments").notNull().default(0),
  engagementRate: float("engagementRate").default(0),
  followerCountAtPosting: int("followerCountAtPosting").default(0),
  caption: text("caption"),
  hashtags: text("hashtags"),
  impactScore: int("impactScore").default(0),
  // Blueprint data stored as JSON
  hookType: varchar("hookType", { length: 128 }),
  contentStructure: text("contentStructure"),
  pacing: varchar("pacing", { length: 128 }),
  length: varchar("length", { length: 64 }),
  audioStrategy: text("audioStrategy"),
  visualStyle: text("visualStyle"),
  ctaStrategy: text("ctaStrategy"),
  thumbnailUrl: text("thumbnailUrl"),
  // Gemini deep analysis fields
  hookStrength: varchar("hookStrength", { length: 32 }),
  hookAnalysis: text("hookAnalysis"),
  transcript: text("transcript"),
  keyMessages: json("keyMessages"),
  targetAudience: text("targetAudience"),
  emotionalTone: varchar("emotionalTone", { length: 128 }),
  hookScore: int("hookScore"),
  structureScore: int("structureScore"),
  ctaScore: int("ctaScore"),
  visualScore: int("visualScore"),
  overallQualityScore: int("overallQualityScore"),
  ctaPresence: int("ctaPresence"),
  postedAt: timestamp("postedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

// Blueprints table
export const blueprints = mysqlTable("blueprints", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  format: mysqlEnum("format", ["reel", "carousel", "image"]).notNull(),
  description: text("description"),
  hookType: varchar("hookType", { length: 128 }),
  structure: text("structure"),
  pacing: varchar("pacing", { length: 128 }),
  length: varchar("length", { length: 64 }),
  audioStrategy: text("audioStrategy"),
  visualStyle: text("visualStyle"),
  ctaStrategy: text("ctaStrategy"),
  usageCount: int("usageCount").default(0),
  score: int("score").default(0),
  sourcePostId: int("sourcePostId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Blueprint = typeof blueprints.$inferSelect;
export type InsertBlueprint = typeof blueprints.$inferInsert;

// User profiles (connected Instagram accounts)
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  instagramHandle: varchar("instagramHandle", { length: 128 }).notNull(),
  followerCount: int("followerCount").default(0),
  weeklyGrowthRate: float("weeklyGrowthRate").default(0),
  postingFrequency: float("postingFrequency").default(0),
  averageViews: int("averageViews").default(0),
  engagementRate: float("engagementRate").default(0),
  bio: text("bio"),
  impactScore: int("impactScore").default(0),
  topFormat: varchar("topFormat", { length: 32 }),
  niche: varchar("niche", { length: 128 }),
  diagnostics: json("diagnostics"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
