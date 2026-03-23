import { eq, desc, asc, like, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, creators, posts, blueprints, userProfiles, emailCampaigns, emailTemplates } from "../drizzle/schema";
import type { Creator, Post, Blueprint, UserProfile, EmailCampaign, EmailTemplate } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Posts ────────────────────────────────────────────────────
export async function listPosts(opts: {
  niche?: string;
  format?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [];
  if (opts.niche) conditions.push(eq(posts.niche, opts.niche));
  if (opts.format) conditions.push(eq(posts.format, opts.format as any));
  if (opts.search) conditions.push(like(posts.title, `%${opts.search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const sortCol = opts.sortBy === 'views' ? posts.views
    : opts.sortBy === 'engagement' ? posts.engagementRate
    : opts.sortBy === 'recency' ? posts.createdAt
    : posts.impactScore;

  const order = opts.sortOrder === 'asc' ? asc(sortCol) : desc(sortCol);

  const [items, countResult] = await Promise.all([
    db.select().from(posts).where(where).orderBy(order).limit(opts.limit || 20).offset(opts.offset || 0),
    db.select({ count: sql<number>`count(*)` }).from(posts).where(where),
  ]);

  return { items, total: countResult[0]?.count || 0 };
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result[0];
}

export async function getPostsByCreatorId(creatorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(posts).where(eq(posts.creatorId, creatorId)).orderBy(desc(posts.impactScore));
}

export async function insertPost(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(posts).values(data);
  return result[0].insertId;
}

// ─── Creators ─────────────────────────────────────────────────
export async function listCreators(opts: {
  niche?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [];
  if (opts.niche) conditions.push(eq(creators.niche, opts.niche));
  if (opts.search) conditions.push(like(creators.handle, `%${opts.search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const sortCol = opts.sortBy === 'followers' ? creators.followerCount
    : opts.sortBy === 'engagement' ? creators.engagementRate
    : opts.sortBy === 'growth' ? creators.weeklyGrowthRate
    : creators.impactScore;

  const order = opts.sortOrder === 'asc' ? asc(sortCol) : desc(sortCol);

  const [items, countResult] = await Promise.all([
    db.select().from(creators).where(where).orderBy(order).limit(opts.limit || 20).offset(opts.offset || 0),
    db.select({ count: sql<number>`count(*)` }).from(creators).where(where),
  ]);

  return { items, total: countResult[0]?.count || 0 };
}

export async function getCreatorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(creators).where(eq(creators.id, id)).limit(1);
  return result[0];
}

export async function getCreatorByHandle(handle: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(creators).where(eq(creators.handle, handle)).limit(1);
  return result[0];
}

export async function insertCreator(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(creators).values(data);
  return result[0].insertId;
}

export async function updateCreator(id: number, data: Partial<Creator>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(creators).set(data).where(eq(creators.id, id));
}

// ─── Blueprints ───────────────────────────────────────────────
export async function listBlueprints(opts: {
  format?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [];
  if (opts.format) conditions.push(eq(blueprints.format, opts.format as any));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const sortCol = opts.sortBy === 'usage' ? blueprints.usageCount : blueprints.score;
  const order = opts.sortOrder === 'asc' ? asc(sortCol) : desc(sortCol);

  const [items, countResult] = await Promise.all([
    db.select().from(blueprints).where(where).orderBy(order).limit(opts.limit || 20).offset(opts.offset || 0),
    db.select({ count: sql<number>`count(*)` }).from(blueprints).where(where),
  ]);

  return { items, total: countResult[0]?.count || 0 };
}

export async function getBlueprintById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blueprints).where(eq(blueprints.id, id)).limit(1);
  return result[0];
}

export async function insertBlueprint(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(blueprints).values(data);
  return result[0].insertId;
}

export async function incrementBlueprintUsage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(blueprints).set({ usageCount: sql`${blueprints.usageCount} + 1` }).where(eq(blueprints.id, id));
}

// ─── User Profiles ────────────────────────────────────────────
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function upsertUserProfile(userId: number, data: Partial<UserProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserProfile(userId);
  if (existing) {
    await db.update(userProfiles).set(data).where(eq(userProfiles.userId, userId));
    return existing.id;
  } else {
    const result = await db.insert(userProfiles).values({ userId, instagramHandle: data.instagramHandle || '', ...data });
    return result[0].insertId;
  }
}

// ─── Stats / Aggregates ──────────────────────────────────────
export async function getDistinctNiches() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ niche: posts.niche }).from(posts).where(sql`${posts.niche} IS NOT NULL`);
  return result.map(r => r.niche).filter(Boolean) as string[];
}

export async function getCreatorNiches() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ niche: creators.niche }).from(creators).where(sql`${creators.niche} IS NOT NULL`);
  return result.map(r => r.niche).filter(Boolean) as string[];
}

export async function getLibraryStats() {
  const db = await getDb();
  if (!db) return { postCount: 0, creatorCount: 0, blueprintCount: 0, avgScore: 0 };
  const [pc, cc, bc, avg] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(posts),
    db.select({ count: sql<number>`count(*)` }).from(creators),
    db.select({ count: sql<number>`count(*)` }).from(blueprints),
    db.select({ avg: sql<number>`ROUND(AVG(impactScore))` }).from(posts),
  ]);
  return {
    postCount: pc[0]?.count || 0,
    creatorCount: cc[0]?.count || 0,
    blueprintCount: bc[0]?.count || 0,
    avgScore: avg[0]?.avg || 0,
  };
}

// ─── Email Campaigns ─────────────────────────────────────────

export async function listEmailCampaigns(userId: number, opts: {
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [eq(emailCampaigns.userId, userId)];
  if (opts.status) conditions.push(eq(emailCampaigns.status, opts.status as any));
  if (opts.search) conditions.push(like(emailCampaigns.name, `%${opts.search}%`));

  const where = and(...conditions);

  const sortCol = opts.sortBy === 'openRate' ? emailCampaigns.openRate
    : opts.sortBy === 'clickRate' ? emailCampaigns.clickRate
    : opts.sortBy === 'sent' ? emailCampaigns.sent
    : opts.sortBy === 'score' ? emailCampaigns.overallScore
    : emailCampaigns.createdAt;

  const order = opts.sortOrder === 'asc' ? asc(sortCol) : desc(sortCol);

  const [items, countResult] = await Promise.all([
    db.select().from(emailCampaigns).where(where).orderBy(order).limit(opts.limit || 20).offset(opts.offset || 0),
    db.select({ count: sql<number>`count(*)` }).from(emailCampaigns).where(where),
  ]);

  return { items, total: countResult[0]?.count || 0 };
}

export async function getEmailCampaignById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id)).limit(1);
  return result[0];
}

export async function getEmailCampaignByMailerliteId(mlId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(emailCampaigns).where(eq(emailCampaigns.mailerliteId, mlId)).limit(1);
  return result[0];
}

export async function upsertEmailCampaign(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getEmailCampaignByMailerliteId(data.mailerliteId);
  if (existing) {
    await db.update(emailCampaigns).set(data).where(eq(emailCampaigns.mailerliteId, data.mailerliteId));
    return existing.id;
  } else {
    const result = await db.insert(emailCampaigns).values(data);
    return result[0].insertId;
  }
}

export async function updateEmailCampaignAnalysis(id: number, analysis: Partial<EmailCampaign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(emailCampaigns).set(analysis).where(eq(emailCampaigns.id, id));
}

export async function getEmailCampaignStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalCampaigns: 0, totalSent: 0, avgOpenRate: 0, avgClickRate: 0, avgScore: 0 };

  const result = await db.select({
    totalCampaigns: sql<number>`count(*)`,
    totalSent: sql<number>`COALESCE(SUM(sent), 0)`,
    avgOpenRate: sql<number>`COALESCE(ROUND(AVG(openRate), 2), 0)`,
    avgClickRate: sql<number>`COALESCE(ROUND(AVG(clickRate), 2), 0)`,
    avgScore: sql<number>`COALESCE(ROUND(AVG(overallScore)), 0)`,
  }).from(emailCampaigns).where(
    and(eq(emailCampaigns.userId, userId), eq(emailCampaigns.status, "sent"))
  );

  return result[0] || { totalCampaigns: 0, totalSent: 0, avgOpenRate: 0, avgClickRate: 0, avgScore: 0 };
}

// ─── Email Templates ─────────────────────────────────────────

export async function listEmailTemplates(userId: number, opts?: { limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const [items, countResult] = await Promise.all([
    db.select().from(emailTemplates)
      .where(eq(emailTemplates.userId, userId))
      .orderBy(desc(emailTemplates.createdAt))
      .limit(opts?.limit || 20)
      .offset(opts?.offset || 0),
    db.select({ count: sql<number>`count(*)` }).from(emailTemplates).where(eq(emailTemplates.userId, userId)),
  ]);

  return { items, total: countResult[0]?.count || 0 };
}

export async function getEmailTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
  return result[0];
}

export async function insertEmailTemplate(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailTemplates).values(data);
  return result[0].insertId;
}

export async function deleteEmailTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
}
