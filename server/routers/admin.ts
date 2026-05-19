import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { newsletterLeads, users, contentItems, impact100Leaders } from "../../drizzle/schema";

export const adminRouter = router({
  /**
   * Dashboard stats: counts of key entities.
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [leadsResult, usersResult, contentResult, leadersResult] = await Promise.all([
      db.select().from(newsletterLeads),
      db.select().from(users),
      db.select().from(contentItems),
      db.select().from(impact100Leaders),
    ]);

    return {
      newsletterLeads: leadsResult.length,
      registeredUsers: usersResult.length,
      contentItems: contentResult.length,
      impact100Leaders: leadersResult.length,
    };
  }),
});
