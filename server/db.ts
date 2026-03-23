import { eq, desc, asc, like, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "node:path";
import { InsertUser, users, creators, posts, blueprints, userProfiles } from "../drizzle/schema";
import type { Creator, Post, Blueprint, UserProfile } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    try {
      const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data.db');
      const sqlite = new Database(dbPath);
      sqlite.pragma('journal_mode = WAL');
      _db = drizzle(sqlite);
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
      values.lastSignedIn = new Date().toISOString();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date().toISOString();
    }
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
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
  const result = db.insert(posts).values(data).returning({ id: posts.id }).get();
  return result.id;
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
  const result = db.insert(creators).values(data).returning({ id: creators.id }).get();
  return result.id;
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
  const result = db.insert(blueprints).values(data).returning({ id: blueprints.id }).get();
  return result.id;
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
    const result = db.insert(userProfiles).values({ userId, instagramHandle: data.instagramHandle || '', ...data }).returning({ id: userProfiles.id }).get();
    return result.id;
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
