import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module so tests don't need a real database
vi.mock("./db", () => ({
  createNewsletterLead: vi.fn().mockResolvedValue(undefined),
  getNewsletterLeads: vi.fn().mockResolvedValue([]),
  getNewsletterLeadCount: vi.fn().mockResolvedValue(0),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn().mockResolvedValue(null),
}));

function makeCtx(role: "user" | "admin" | null = null): TrpcContext {
  return {
    user: role
      ? {
          id: 1,
          openId: "test-user",
          email: "test@impact.me",
          name: "Test User",
          loginMethod: "manus",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("newsletter.subscribe", () => {
  it("accepts a valid email and returns success", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.newsletter.subscribe({ email: "leader@impact.me" });
    expect(result).toEqual({ success: true });
  });

  it("rejects an invalid email", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.newsletter.subscribe({ email: "not-an-email" })
    ).rejects.toThrow();
  });
});

describe("newsletter.list", () => {
  it("is accessible to admins", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.newsletter.list({ limit: 10, offset: 0 });
    expect(result).toHaveProperty("leads");
    expect(result).toHaveProperty("total");
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.newsletter.list({ limit: 10, offset: 0 })
    ).rejects.toThrow("FORBIDDEN");
  });
});

describe("admin.stats", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.admin.stats()).rejects.toThrow("FORBIDDEN");
  });
});
