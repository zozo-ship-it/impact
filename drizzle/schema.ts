import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/* ═══════════════════════════════════════════════════════════
   USERS
   Core auth table. Extend with profile fields as needed.
═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   CONTENT CATEGORIES
   Taxonomy shared across all content types.
═══════════════════════════════════════════════════════════ */
export const contentCategories = mysqlTable("content_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentCategory = typeof contentCategories.$inferSelect;

/* ═══════════════════════════════════════════════════════════
   CONTENT ITEMS
   Unified table for Insights, Reports, Podcast, Events,
   Case Studies. Discriminated by `contentType`.
═══════════════════════════════════════════════════════════ */
export const contentItems = mysqlTable("content_items", {
  id: int("id").autoincrement().primaryKey(),
  contentType: mysqlEnum("contentType", [
    "insight",
    "report",
    "podcast",
    "event",
    "case_study",
  ]).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"])
    .default("draft")
    .notNull(),
  title: varchar("title", { length: 320 }).notNull(),
  slug: varchar("slug", { length: 320 }).notNull().unique(),
  excerpt: text("excerpt"),
  body: text("body"),
  featuredImageUrl: varchar("featuredImageUrl", { length: 512 }),
  featuredImageKey: varchar("featuredImageKey", { length: 512 }),
  authorId: int("authorId"),
  categoryId: int("categoryId"),
  tags: json("tags").$type<string[]>(),
  seoTitle: varchar("seoTitle", { length: 320 }),
  seoDescription: text("seoDescription"),
  ogImageUrl: varchar("ogImageUrl", { length: 512 }),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = typeof contentItems.$inferInsert;

/* ═══════════════════════════════════════════════════════════
   PODCAST META
   Episode-specific fields extending content_items.
═══════════════════════════════════════════════════════════ */
export const podcastMeta = mysqlTable("podcast_meta", {
  id: int("id").autoincrement().primaryKey(),
  contentItemId: int("contentItemId").notNull().unique(),
  episodeNumber: int("episodeNumber"),
  durationSeconds: int("durationSeconds"),
  audioUrl: varchar("audioUrl", { length: 512 }),
  audioKey: varchar("audioKey", { length: 512 }),
  guestName: varchar("guestName", { length: 200 }),
  guestTitle: varchar("guestTitle", { length: 200 }),
  guestCompany: varchar("guestCompany", { length: 200 }),
  transcriptUrl: varchar("transcriptUrl", { length: 512 }),
  spotifyUrl: varchar("spotifyUrl", { length: 512 }),
  appleUrl: varchar("appleUrl", { length: 512 }),
  youtubeUrl: varchar("youtubeUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PodcastMeta = typeof podcastMeta.$inferSelect;

/* ═══════════════════════════════════════════════════════════
   EVENT META
   Event-specific fields extending content_items.
═══════════════════════════════════════════════════════════ */
export const eventMeta = mysqlTable("event_meta", {
  id: int("id").autoincrement().primaryKey(),
  contentItemId: int("contentItemId").notNull().unique(),
  eventType: mysqlEnum("eventType", [
    "summit",
    "workshop",
    "webinar",
    "networking",
    "conference",
    "other",
  ]).default("other"),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  timezone: varchar("timezone", { length: 64 }),
  locationName: varchar("locationName", { length: 320 }),
  locationAddress: text("locationAddress"),
  isVirtual: boolean("isVirtual").default(false),
  virtualUrl: varchar("virtualUrl", { length: 512 }),
  registrationUrl: varchar("registrationUrl", { length: 512 }),
  capacity: int("capacity"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventMeta = typeof eventMeta.$inferSelect;

/* ═══════════════════════════════════════════════════════════
   MAGAZINE ISSUES
   Quarterly magazine editions.
═══════════════════════════════════════════════════════════ */
export const magazineIssues = mysqlTable("magazine_issues", {
  id: int("id").autoincrement().primaryKey(),
  issueNumber: int("issueNumber").notNull(),
  title: varchar("title", { length: 320 }).notNull(),
  slug: varchar("slug", { length: 320 }).notNull().unique(),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  coverImageKey: varchar("coverImageKey", { length: 512 }),
  description: text("description"),
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  pdfKey: varchar("pdfKey", { length: 512 }),
  status: mysqlEnum("status", ["draft", "published", "archived"])
    .default("draft")
    .notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MagazineIssue = typeof magazineIssues.$inferSelect;

/* ═══════════════════════════════════════════════════════════
   NEWSLETTER LEADS
   HubSpot-ready schema. No live sync wired at this stage.
   Fields: hubspotContactId, syncStatus, lastSyncAttemptAt, syncError
═══════════════════════════════════════════════════════════ */
export const newsletterLeads = mysqlTable("newsletter_leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  firstName: varchar("firstName", { length: 120 }),
  lastName: varchar("lastName", { length: 120 }),
  source: varchar("source", { length: 120 }).default("website"),
  // HubSpot-ready fields (no live sync wired)
  hubspotContactId: varchar("hubspotContactId", { length: 64 }),
  syncStatus: mysqlEnum("syncStatus", [
    "pending",
    "synced",
    "failed",
    "skipped",
  ]).default("pending"),
  lastSyncAttemptAt: timestamp("lastSyncAttemptAt"),
  syncError: text("syncError"),
  // Preferences
  isActive: boolean("isActive").default(true).notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterLead = typeof newsletterLeads.$inferSelect;
export type InsertNewsletterLead = typeof newsletterLeads.$inferInsert;

/* ═══════════════════════════════════════════════════════════
   IMPACT 100 — EDITIONS
   Monthly ranking editions. Each edition has one set of rankings.
═══════════════════════════════════════════════════════════ */
export const impact100Editions = mysqlTable("impact100_editions", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(), // e.g. "2025-01"
  label: varchar("label", { length: 120 }).notNull(),       // e.g. "January 2025"
  status: mysqlEnum("status", ["draft", "published", "archived"])
    .default("draft")
    .notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Impact100Edition = typeof impact100Editions.$inferSelect;

/* ═══════════════════════════════════════════════════════════
   IMPACT 100 — LEADERS
   Persistent leader profiles. Linked to rankings across editions.
═══════════════════════════════════════════════════════════ */
export const impact100Leaders = mysqlTable("impact100_leaders", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  fullName: varchar("fullName", { length: 200 }).notNull(),
  title: varchar("title", { length: 320 }),
  company: varchar("company", { length: 320 }),
  bio: text("bio"),
  profileImageUrl: varchar("profileImageUrl", { length: 512 }),
  profileImageKey: varchar("profileImageKey", { length: 512 }),
  category: varchar("category", { length: 120 }),
  // Social / platform handles
  instagramHandle: varchar("instagramHandle", { length: 120 }),
  tiktokHandle: varchar("tiktokHandle", { length: 120 }),
  youtubeHandle: varchar("youtubeHandle", { length: 120 }),
  linkedinUrl: varchar("linkedinUrl", { length: 512 }),
  websiteUrl: varchar("websiteUrl", { length: 512 }),
  // Hall of Fame
  isHallOfFame: boolean("isHallOfFame").default(false),
  hallOfFameYear: int("hallOfFameYear"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Impact100Leader = typeof impact100Leaders.$inferSelect;
export type InsertImpact100Leader = typeof impact100Leaders.$inferInsert;

/* ═══════════════════════════════════════════════════════════
   IMPACT 100 — RANKINGS
   Monthly ranking snapshot: edition × leader → rank + score.
═══════════════════════════════════════════════════════════ */
export const impact100Rankings = mysqlTable("impact100_rankings", {
  id: int("id").autoincrement().primaryKey(),
  editionId: int("editionId").notNull(),
  leaderId: int("leaderId").notNull(),
  rank: int("rank").notNull(), // stored as `rank` (quoted in SQL — reserved word)
  previousRank: int("previousRank"),
  score: int("score"),
  // Bright Data-ready metric fields (not wired yet)
  instagramFollowers: int("instagramFollowers"),
  instagramEngagementRate: int("instagramEngagementRate"), // stored as basis points (x100)
  tiktokFollowers: int("tiktokFollowers"),
  tiktokEngagementRate: int("tiktokEngagementRate"),
  youtubeSubscribers: int("youtubeSubscribers"),
  totalReach: int("totalReach"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Impact100Ranking = typeof impact100Rankings.$inferSelect;
export type InsertImpact100Ranking = typeof impact100Rankings.$inferInsert;

/* ═══════════════════════════════════════════════════════════
   IMPACT 100 — SOURCE RECORDS
   Raw scraped platform metrics per leader per scrape run.
   Bright Data integration fields present; integration not wired.
═══════════════════════════════════════════════════════════ */
export const impact100SourceRecords = mysqlTable("impact100_source_records", {
  id: int("id").autoincrement().primaryKey(),
  leaderId: int("leaderId").notNull(),
  platform: mysqlEnum("platform", [
    "instagram",
    "tiktok",
    "youtube",
    "linkedin",
    "other",
  ]).notNull(),
  // Bright Data-ready fields
  brightDataJobId: varchar("brightDataJobId", { length: 128 }),
  brightDataDatasetId: varchar("brightDataDatasetId", { length: 128 }),
  scrapedAt: timestamp("scrapedAt"),
  // Raw metric snapshot
  followers: int("followers"),
  following: int("following"),
  posts: int("posts"),
  avgLikes: int("avgLikes"),
  avgComments: int("avgComments"),
  engagementRate: int("engagementRate"), // basis points
  rawData: json("rawData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Impact100SourceRecord = typeof impact100SourceRecords.$inferSelect;

/* ═══════════════════════════════════════════════════════════
   SITE SETTINGS
   Key-value store for admin-configurable site settings.
═══════════════════════════════════════════════════════════ */
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
