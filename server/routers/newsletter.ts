import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { createNewsletterLead, getNewsletterLeads, getNewsletterLeadCount } from "../db";
import { TRPCError } from "@trpc/server";

export const newsletterRouter = router({
  /**
   * Public: subscribe to the newsletter.
   * Stores the lead in the DB with syncStatus=pending (HubSpot-ready).
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address"),
        firstName: z.string().max(120).optional(),
        lastName: z.string().max(120).optional(),
        source: z.string().max(120).optional().default("website"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await createNewsletterLead({
          email: input.email.toLowerCase().trim(),
          firstName: input.firstName ?? null,
          lastName: input.lastName ?? null,
          source: input.source ?? "website",
        });
        return { success: true };
      } catch (error) {
        console.error("[Newsletter] Subscribe error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to subscribe. Please try again.",
        });
      }
    }),

  /**
   * Admin: list newsletter leads with pagination.
   */
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50), offset: z.number().min(0).default(0) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const [leads, total] = await Promise.all([
        getNewsletterLeads(input.limit, input.offset),
        getNewsletterLeadCount(),
      ]);
      return { leads, total };
    }),
});
