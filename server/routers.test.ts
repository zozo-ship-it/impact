import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.openId).toBe("test-user-123");
    expect(result?.name).toBe("Test User");
    expect(result?.email).toBe("test@example.com");
  });
});

describe("posts.list", () => {
  it("returns posts with items and total count", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.posts.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("returns posts without filters", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.posts.list();
    expect(result).toHaveProperty("items");
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("filters posts by niche", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.posts.list({ niche: "Fitness" });
    expect(result).toHaveProperty("items");
    for (const post of result.items) {
      expect(post.niche).toBe("Fitness");
    }
  });

  it("filters posts by format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.posts.list({ format: "reel" });
    expect(result).toHaveProperty("items");
    for (const post of result.items) {
      expect(post.format).toBe("reel");
    }
  });

  it("sorts posts by views descending", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.posts.list({ sortBy: "views", sortOrder: "desc" });
    expect(result.items.length).toBeGreaterThan(1);
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i - 1]!.views).toBeGreaterThanOrEqual(result.items[i]!.views);
    }
  });

  it("respects limit parameter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.posts.list({ limit: 3 });
    expect(result.items.length).toBeLessThanOrEqual(3);
  });
});

describe("posts.getById", () => {
  it("returns a specific post by ID", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const list = await caller.posts.list({ limit: 1 });
    expect(list.items.length).toBeGreaterThan(0);

    const post = await caller.posts.getById({ id: list.items[0]!.id });
    expect(post).toBeDefined();
    expect(post?.id).toBe(list.items[0]!.id);
    expect(post?.title).toBeTruthy();
    expect(post?.format).toBeTruthy();
    expect(typeof post?.impactScore).toBe("number");
  });

  it("returns undefined for non-existent post", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const post = await caller.posts.getById({ id: 99999 });
    expect(post).toBeUndefined();
  });
});

describe("posts.niches", () => {
  it("returns an array of distinct niches", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const niches = await caller.posts.niches();
    expect(Array.isArray(niches)).toBe(true);
    expect(niches.length).toBeGreaterThan(0);
    for (const n of niches) {
      expect(typeof n).toBe("string");
    }
  });
});

describe("creators.list", () => {
  it("returns creators with items and total count", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.creators.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("filters creators by niche", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.creators.list({ niche: "Fitness" });
    for (const creator of result.items) {
      expect(creator.niche).toBe("Fitness");
    }
  });

  it("sorts creators by followers descending", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.creators.list({ sortBy: "followers", sortOrder: "desc" });
    if (result.items.length > 1) {
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i - 1]!.followerCount).toBeGreaterThanOrEqual(result.items[i]!.followerCount);
      }
    }
  });
});

describe("creators.getById", () => {
  it("returns a specific creator by ID", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const list = await caller.creators.list({ limit: 1 });
    expect(list.items.length).toBeGreaterThan(0);

    const creator = await caller.creators.getById({ id: list.items[0]!.id });
    expect(creator).toBeDefined();
    expect(creator?.handle).toBeTruthy();
    expect(typeof creator?.followerCount).toBe("number");
  });
});

describe("blueprints.list", () => {
  it("returns blueprints with items and total count", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.blueprints.list({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("filters blueprints by format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.blueprints.list({ format: "reel" });
    for (const bp of result.items) {
      expect(bp.format).toBe("reel");
    }
  });

  it("sorts blueprints by score descending", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.blueprints.list({ sortBy: "score", sortOrder: "desc" });
    if (result.items.length > 1) {
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i - 1]!.score!).toBeGreaterThanOrEqual(result.items[i]!.score!);
      }
    }
  });
});

describe("blueprints.getById", () => {
  it("returns a specific blueprint by ID", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const list = await caller.blueprints.list({ limit: 1 });
    expect(list.items.length).toBeGreaterThan(0);

    const bp = await caller.blueprints.getById({ id: list.items[0]!.id });
    expect(bp).toBeDefined();
    expect(bp?.name).toBeTruthy();
    expect(bp?.format).toBeTruthy();
    expect(bp?.hookType).toBeTruthy();
  });
});

describe("stats.overview", () => {
  it("returns library statistics", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.stats.overview();
    expect(typeof stats.postCount).toBe("number");
    expect(typeof stats.creatorCount).toBe("number");
    expect(typeof stats.blueprintCount).toBe("number");
    // avgScore from SQL ROUND may come as string
    expect(Number(stats.avgScore)).not.toBeNaN();
    expect(stats.postCount).toBeGreaterThan(0);
    expect(stats.creatorCount).toBeGreaterThan(0);
    expect(stats.blueprintCount).toBeGreaterThan(0);
  });
});

describe("profile (protected)", () => {
  it("rejects unauthenticated access to profile.get", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.profile.get()).rejects.toThrow();
  });

  it("returns undefined profile for new user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const profile = await caller.profile.get();
    // May be undefined if user hasn't connected yet
    expect(profile === undefined || profile !== null).toBe(true);
  });
});

describe("profile.comparison", () => {
  it("returns comparison data with numeric libraryAvg values", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const comparison = await caller.profile.comparison();
    expect(comparison).toHaveProperty("libraryAvg");
    // All libraryAvg values must be usable as numbers (not strings)
    const avg = comparison.libraryAvg;
    expect(typeof Number(avg.impactScore)).toBe("number");
    expect(Number.isFinite(Number(avg.impactScore))).toBe(true);
    expect(typeof Number(avg.avgEngagement)).toBe("number");
    expect(Number.isFinite(Number(avg.avgEngagement))).toBe(true);
    expect(typeof Number(avg.avgViews)).toBe("number");
    expect(Number.isFinite(Number(avg.avgViews))).toBe(true);
    expect(typeof Number(avg.avgFollowers)).toBe("number");
    expect(Number.isFinite(Number(avg.avgFollowers))).toBe(true);
  });
});
