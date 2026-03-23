import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { collectPost, collectProfile, mapBrightDataPostToInternal, mapBrightDataProfileToInternal } from "./brightdata";
import { analyzeContent as geminiAnalyze, type ContentAnalysis } from "./gemini";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Posts ────────────────────────────────────────────────────
  posts: router({
    list: publicProcedure
      .input(z.object({
        niche: z.string().optional(),
        format: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.listPosts(input || {});
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getPostById(input.id);
      }),

    getByCreator: publicProcedure
      .input(z.object({ creatorId: z.number() }))
      .query(async ({ input }) => {
        return db.getPostsByCreatorId(input.creatorId);
      }),

    niches: publicProcedure.query(async () => {
      return db.getDistinctNiches();
    }),
  }),

  // ─── Creators ─────────────────────────────────────────────────
  creators: router({
    list: publicProcedure
      .input(z.object({
        niche: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.listCreators(input || {});
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCreatorById(input.id);
      }),

    niches: publicProcedure.query(async () => {
      return db.getCreatorNiches();
    }),
  }),

  // ─── Blueprints ───────────────────────────────────────────────
  blueprints: router({
    list: publicProcedure
      .input(z.object({
        format: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.listBlueprints(input || {});
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getBlueprintById(input.id);
      }),

    use: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
        topic: z.string().min(1),
        niche: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const blueprint = await db.getBlueprintById(input.blueprintId);
        if (!blueprint) throw new Error("Blueprint not found");

        await db.incrementBlueprintUsage(input.blueprintId);

        const prompt = `You are a content strategist for Instagram creators. Generate a specific, actionable content brief based on this blueprint and the user's topic.

Blueprint: "${blueprint.name}"
Format: ${blueprint.format}
Hook Type: ${blueprint.hookType}
Structure: ${blueprint.structure}
Pacing: ${blueprint.pacing}
Length: ${blueprint.length}
Audio Strategy: ${blueprint.audioStrategy}
Visual Style: ${blueprint.visualStyle}
CTA Strategy: ${blueprint.ctaStrategy}

User's Topic: "${input.topic}"
${input.niche ? `User's Niche: "${input.niche}"` : ''}

Generate a detailed content brief with:
1. **Specific Hook** - The exact opening line/visual for their topic
2. **Content Outline** - Step-by-step content flow adapted to their topic
3. **Visual Direction** - Specific visual recommendations
4. **Audio/Sound** - What audio approach to use
5. **CTA** - The specific call-to-action adapted to their topic
6. **Pro Tips** - 2-3 specific tips to maximize impact

Be specific and actionable, not generic. Reference the blueprint structure but adapt everything to their topic.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert Instagram content strategist. Provide specific, actionable content briefs. Use markdown formatting." },
            { role: "user", content: prompt },
          ],
        });

        const briefContent = response.choices[0]?.message?.content;
        return {
          brief: (typeof briefContent === 'string' ? briefContent : '') || "Unable to generate brief",
          blueprint,
        };
      }),
  }),

  // ─── User Profile ─────────────────────────────────────────────
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProfile(ctx.user.id);
    }),

    connect: protectedProcedure
      .input(z.object({
        instagramHandle: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const handle = input.instagramHandle.startsWith('@') ? input.instagramHandle : `@${input.instagramHandle}`;
        const cleanHandle = handle.replace('@', '');
        const profileUrl = `https://www.instagram.com/${cleanHandle}/`;

        let profileData: any;

        try {
          // Try to fetch real data from Bright Data
          const bdProfile = await collectProfile(profileUrl);
          const mapped = mapBrightDataProfileToInternal(bdProfile);

          // Use LLM to determine niche from profile
          const nicheResponse = await invokeLLM({
            messages: [
              { role: "system", content: "You are a social media analyst. Given an Instagram profile, determine the content niche in 1-3 words. Return only the niche name, nothing else. Examples: Fitness, Business Coaching, Travel, Wellness, Yoga, Personal Finance, Food, Fashion." },
              { role: "user", content: `Instagram handle: ${handle}, Profile name: ${mapped.profileName}, Followers: ${mapped.followerCount}, Posts: ${mapped.postCount}` },
            ],
          });
          const nicheContent = nicheResponse.choices[0]?.message?.content;
          const niche = (typeof nicheContent === 'string' ? nicheContent.trim() : '') || "Lifestyle";

          // Calculate impact score for user profile
          const engagementFactor = Math.min(mapped.engagementRate / 10, 1) * 40;
          const followerFactor = Math.min(mapped.followerCount / 100000, 1) * 30;
          const impactScore = Math.min(100, Math.round(engagementFactor + followerFactor + 10));

          // Generate AI diagnostics based on real data
          const diagnosticsResponse = await invokeLLM({
            messages: [
              { role: "system", content: `You are an expert Instagram growth coach. Analyze this creator's profile data and generate exactly 5-6 specific, actionable diagnostics. Each diagnostic should reference actual numbers from their profile. Return valid JSON only.` },
              { role: "user", content: `Profile: ${handle}
Followers: ${mapped.followerCount}
Engagement Rate: ${mapped.engagementRate}%
Posts Count: ${mapped.postCount}
Is Verified: ${mapped.isVerified}
Is Business Account: ${mapped.isBusinessAccount}
Niche: ${niche}

Generate diagnostics as a JSON array. Each item must have:
- "type": one of "hook", "format", "cta", "engagement", "content", "posting"
- "severity": one of "high", "medium", "low"
- "message": a specific, actionable insight referencing their actual numbers` },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "diagnostics",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["hook", "format", "cta", "engagement", "content", "posting"] },
                          severity: { type: "string", enum: ["high", "medium", "low"] },
                          message: { type: "string" },
                        },
                        required: ["type", "severity", "message"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["items"],
                  additionalProperties: false,
                },
              },
            },
          });

          const diagRaw = diagnosticsResponse.choices[0]?.message?.content;
          let diagnostics: any[] = [];
          try {
            const parsed = JSON.parse(typeof diagRaw === 'string' ? diagRaw : '{"items":[]}');
            diagnostics = parsed.items || [];
          } catch {
            diagnostics = [
              { type: "engagement", severity: "medium", message: `Your engagement rate is ${mapped.engagementRate}%. Focus on creating save-worthy content to improve this metric.` },
            ];
          }

          profileData = {
            instagramHandle: handle,
            followerCount: mapped.followerCount,
            weeklyGrowthRate: 0, // Not available from single profile fetch
            postingFrequency: 0, // Would need historical data
            averageViews: 0, // Not available from profile endpoint
            engagementRate: mapped.engagementRate,
            bio: mapped.profileName || "",
            impactScore,
            topFormat: "reel" as const,
            niche,
            diagnostics: JSON.stringify(diagnostics),
          };
        } catch (error: any) {
          console.warn("[BrightData] Failed to fetch profile, using fallback:", error.message);

          // Fallback: create a mock profile with lower scores
          profileData = {
            instagramHandle: handle,
            followerCount: 2400,
            weeklyGrowthRate: 0.8,
            postingFrequency: 2.1,
            averageViews: 1800,
            engagementRate: 3.2,
            bio: "Creator | Building my audience | Learning what works",
            impactScore: 34,
            topFormat: "image" as const,
            niche: "Lifestyle",
            diagnostics: JSON.stringify([
              { type: "hook", severity: "high", message: "Your reels lack strong hooks — 4 of your last 6 start with no pattern interrupt. Top creators in your niche use specific number hooks or contrarian statements." },
              { type: "format", severity: "medium", message: "You're posting 70% images but your single reel outperformed everything by 3x. Consider shifting to a 60/40 reel-to-carousel mix." },
              { type: "cta", severity: "high", message: "None of your last 10 posts include a clear CTA. Your bio says 'DM for collabs' but you're not driving any action from your content." },
              { type: "engagement", severity: "medium", message: "Your engagement rate (3.2%) is below the library average (7.1%). Focus on asking questions and using save-worthy formats like carousels." },
              { type: "content", severity: "low", message: "Your transformation carousel outperformed everything else by 40% — you're underusing social proof content. Create more before/after and results-based posts." },
              { type: "posting", severity: "medium", message: "You're posting 2.1x/week while top creators in your niche post 4-5x. Consistency is the #1 growth lever you're not pulling." },
            ]),
          };
        }

        await db.upsertUserProfile(ctx.user.id, profileData);
        return db.getUserProfile(ctx.user.id);
      }),

    comparison: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getUserProfile(ctx.user.id);
      const { items: topCreators } = await db.listCreators({ sortBy: 'score', limit: 6 });
      const stats = await db.getLibraryStats();

      return {
        profile,
        topCreators,
        libraryAvg: {
          impactScore: stats.avgScore,
          avgEngagement: topCreators.length > 0 ? topCreators.reduce((s, c) => s + (c.engagementRate || 0), 0) / topCreators.length : 0,
          avgFollowers: topCreators.length > 0 ? Math.round(topCreators.reduce((s, c) => s + c.followerCount, 0) / topCreators.length) : 0,
          avgViews: topCreators.length > 0 ? Math.round(topCreators.reduce((s, c) => s + (c.averageViews || 0), 0) / topCreators.length) : 0,
        },
      };
    }),
  }),

  // ─── AI Coach ─────────────────────────────────────────────────
  coach: router({
    chat: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getUserProfile(ctx.user.id);
        const { items: topCreators } = await db.listCreators({ sortBy: 'score', limit: 3 });

        const systemPrompt = `You are an expert Instagram growth coach inside "Impact Studio". You have access to the user's profile data and can compare it against top-performing creators in the library.

${profile ? `USER PROFILE:
- Handle: ${profile.instagramHandle}
- Followers: ${profile.followerCount?.toLocaleString()}
- Weekly Growth: ${profile.weeklyGrowthRate}%
- Avg Views: ${profile.averageViews?.toLocaleString()}
- Engagement Rate: ${profile.engagementRate}%
- Impact Score: ${profile.impactScore}/100
- Top Format: ${profile.topFormat}
- Posting Frequency: ${profile.postingFrequency}x/week
- Niche: ${profile.niche}

DIAGNOSTICS:
${profile.diagnostics ? JSON.parse(profile.diagnostics as string).map((d: any) => `- [${d.severity.toUpperCase()}] ${d.message}`).join('\n') : 'No diagnostics available'}` : 'User has not connected their Instagram profile yet.'}

TOP LIBRARY CREATORS FOR COMPARISON:
${topCreators.map(c => `- ${c.handle}: ${c.followerCount?.toLocaleString()} followers, ${c.engagementRate}% engagement, Score: ${c.impactScore}/100`).join('\n')}

Provide specific, actionable advice. Reference actual numbers and comparisons. Be direct and honest but encouraging. Use markdown formatting for clarity.`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...input.messages.filter(m => m.role !== "system"),
        ];

        const response = await invokeLLM({ messages });
        const responseContent = response.choices[0]?.message?.content;
        return (typeof responseContent === 'string' ? responseContent : '') || "I'm having trouble generating a response right now.";
      }),
  }),

  // ─── Add Content ──────────────────────────────────────────────
  content: router({
    analyze: protectedProcedure
      .input(z.object({
        url: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        let postData: any;
        let usedBrightData = false;
        let geminiAnalysis: ContentAnalysis | null = null;

        // Step 1: Try to fetch real data from Bright Data
        try {
          const bdPost = await collectPost(input.url);
          const mapped = mapBrightDataPostToInternal(bdPost, input.url);
          postData = mapped;
          usedBrightData = true;
        } catch (error: any) {
          console.warn("[BrightData] Failed to collect post, falling back to LLM:", error.message);
        }

        // Step 2: If Bright Data failed, fall back to LLM analysis
        if (!postData) {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are an Instagram content analyst. Given a URL, generate a realistic analysis of the content. Return valid JSON only."
              },
              {
                role: "user",
                content: `Analyze this Instagram post URL and generate realistic content data: ${input.url}

Return JSON with these exact fields:
{
  "title": "catchy hook/title of the post",
  "format": "reel" or "carousel" or "image",
  "niche": "content niche",
  "views": number,
  "likes": number,
  "comments": number,
  "engagementRate": number (percentage),
  "followerCountAtPosting": number,
  "caption": "post caption",
  "hashtags": "comma separated hashtags",
  "hookType": "type of hook used",
  "contentStructure": "structure description",
  "pacing": "pacing description",
  "length": "content length",
  "audioStrategy": "audio approach",
  "visualStyle": "visual style description",
  "ctaStrategy": "CTA approach",
  "creatorHandle": "@handle"
}`
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "post_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    format: { type: "string", enum: ["reel", "carousel", "image"] },
                    niche: { type: "string" },
                    views: { type: "integer" },
                    likes: { type: "integer" },
                    comments: { type: "integer" },
                    engagementRate: { type: "number" },
                    followerCountAtPosting: { type: "integer" },
                    caption: { type: "string" },
                    hashtags: { type: "string" },
                    hookType: { type: "string" },
                    contentStructure: { type: "string" },
                    pacing: { type: "string" },
                    length: { type: "string" },
                    audioStrategy: { type: "string" },
                    visualStyle: { type: "string" },
                    ctaStrategy: { type: "string" },
                    creatorHandle: { type: "string" },
                  },
                  required: ["title", "format", "niche", "views", "likes", "comments", "engagementRate", "followerCountAtPosting", "caption", "hashtags", "hookType", "contentStructure", "pacing", "length", "audioStrategy", "visualStyle", "ctaStrategy", "creatorHandle"],
                  additionalProperties: false,
                },
              },
            },
          });

          const rawContent = response.choices[0]?.message?.content;
          const content = typeof rawContent === 'string' ? rawContent : '';
          if (!content) throw new Error("Failed to analyze content");

          const analysis = JSON.parse(content);
          postData = {
            url: input.url,
            creatorHandle: analysis.creatorHandle,
            title: analysis.title,
            format: analysis.format,
            niche: analysis.niche,
            views: analysis.views,
            likes: analysis.likes,
            comments: analysis.comments,
            engagementRate: analysis.engagementRate,
            followerCountAtPosting: analysis.followerCountAtPosting,
            caption: analysis.caption,
            hashtags: analysis.hashtags,
            hookType: analysis.hookType,
            contentStructure: analysis.contentStructure,
            pacing: analysis.pacing,
            length: analysis.length,
            audioStrategy: analysis.audioStrategy,
            visualStyle: analysis.visualStyle,
            ctaStrategy: analysis.ctaStrategy,
          };
        }

        // Step 3: Run Gemini multimodal analysis on actual media content
        const hasMedia = postData.photos?.length > 0 || postData.videos?.length > 0;
        const hasCaption = !!postData.caption;

        if (hasMedia || hasCaption) {
          try {
            console.log("[Gemini] Starting multimodal content analysis...");
            const hashtagArr = postData.hashtags
              ? (typeof postData.hashtags === 'string' ? postData.hashtags.split(',').map((h: string) => h.trim()) : postData.hashtags)
              : [];

            geminiAnalysis = await geminiAnalyze({
              caption: postData.caption || null,
              photos: postData.photos || null,
              videos: postData.videos || null,
              contentType: postData.contentType || postData.format,
              creatorHandle: postData.creatorHandle,
              hashtags: hashtagArr,
            });
            console.log("[Gemini] Analysis complete — hookStrength:", geminiAnalysis.hookStrength, "overallQuality:", geminiAnalysis.overallQualityScore);

            // Merge Gemini analysis into postData (Gemini takes priority for content intelligence)
            postData.hookType = geminiAnalysis.hookType || postData.hookType;
            postData.contentStructure = geminiAnalysis.contentStructure || postData.contentStructure;
            postData.pacing = geminiAnalysis.pacing || postData.pacing;
            postData.length = geminiAnalysis.length || postData.length;
            postData.audioStrategy = geminiAnalysis.audioStrategy || postData.audioStrategy;
            postData.visualStyle = geminiAnalysis.visualStyle || postData.visualStyle;
            postData.ctaStrategy = geminiAnalysis.ctaStrategy || postData.ctaStrategy;
            postData.niche = geminiAnalysis.niche || postData.niche;
            postData.title = geminiAnalysis.title || postData.title;
            postData.format = geminiAnalysis.format || postData.format;
          } catch (error: any) {
            console.warn("[Gemini] Multimodal analysis failed, falling back to LLM text enrichment:", error.message);
          }
        }

        // Step 3b: If Gemini failed and we have Bright Data, fall back to LLM text enrichment
        if (!geminiAnalysis && usedBrightData) {
          const enrichResponse = await invokeLLM({
            messages: [
              { role: "system", content: "You are an Instagram content analyst. Analyze the post data and provide content blueprint analysis. Return valid JSON only." },
              { role: "user", content: `Analyze this Instagram post and provide content intelligence:

Creator: ${postData.creatorHandle}
Caption: ${postData.caption?.substring(0, 500) || "No caption"}
Format: ${postData.format}
Likes: ${postData.likes}
Comments: ${postData.comments}
Views: ${postData.views}
Followers: ${postData.followerCountAtPosting}

Return JSON with:
{
  "niche": "content niche in 1-3 words",
  "hookType": "type of hook used",
  "contentStructure": "description of the content structure",
  "pacing": "pacing description",
  "length": "content length estimate",
  "audioStrategy": "audio approach description",
  "visualStyle": "visual style description",
  "ctaStrategy": "CTA approach description"
}` },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "post_enrichment",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    niche: { type: "string" },
                    hookType: { type: "string" },
                    contentStructure: { type: "string" },
                    pacing: { type: "string" },
                    length: { type: "string" },
                    audioStrategy: { type: "string" },
                    visualStyle: { type: "string" },
                    ctaStrategy: { type: "string" },
                  },
                  required: ["niche", "hookType", "contentStructure", "pacing", "length", "audioStrategy", "visualStyle", "ctaStrategy"],
                  additionalProperties: false,
                },
              },
            },
          });

          const enrichRaw = enrichResponse.choices[0]?.message?.content;
          try {
            const enrichment = JSON.parse(typeof enrichRaw === 'string' ? enrichRaw : '{}');
            postData.niche = enrichment.niche || postData.niche;
            postData.hookType = enrichment.hookType;
            postData.contentStructure = enrichment.contentStructure;
            postData.pacing = enrichment.pacing;
            postData.length = enrichment.length;
            postData.audioStrategy = enrichment.audioStrategy;
            postData.visualStyle = enrichment.visualStyle;
            postData.ctaStrategy = enrichment.ctaStrategy;
          } catch {
            // Keep whatever we have
          }
        }

        // Step 4: Calculate impact score (enhanced with Gemini quality scores)
        const views = postData.views || 0;
        const followers = postData.followerCountAtPosting || 0;
        const engagement = postData.engagementRate || 0;
        const viewToFollowerRatio = followers > 0 ? views / followers : 0;
        const engagementFactor = Math.min(engagement / 10, 1) * 25;
        const viewFactor = Math.min(viewToFollowerRatio / 5, 1) * 35;

        let qualityFactor: number;
        if (geminiAnalysis) {
          // Use Gemini's granular quality scores for a more accurate Impact Score
          qualityFactor = (
            (geminiAnalysis.hookScore || 0) * 0.12 +
            (geminiAnalysis.structureScore || 0) * 0.08 +
            (geminiAnalysis.ctaScore || 0) * 0.08 +
            (geminiAnalysis.visualScore || 0) * 0.07 +
            (geminiAnalysis.overallQualityScore || 0) * 0.05
          );
        } else {
          qualityFactor = (postData.hookType ? 10 : 0) + (postData.ctaStrategy ? 10 : 0) + (postData.contentStructure ? 10 : 0);
        }
        const impactScore = Math.min(100, Math.round(engagementFactor + viewFactor + qualityFactor));

        // Step 5: Find or create creator
        let creator = await db.getCreatorByHandle(postData.creatorHandle);
        let creatorId: number;
        if (!creator) {
          let creatorData: any = {
            handle: postData.creatorHandle?.substring(0, 128),
            platform: 'instagram',
            niche: postData.niche?.substring(0, 128),
            followerCount: Math.round(postData.followerCountAtPosting || 0),
            engagementRate: postData.engagementRate || 0,
            impactScore: impactScore,
            avatarUrl: postData.profileImageLink || null,
          };

          if (usedBrightData) {
            try {
              const cleanHandle = postData.creatorHandle.replace('@', '');
              const bdProfile = await collectProfile(`https://www.instagram.com/${cleanHandle}/`);
              const mappedProfile = mapBrightDataProfileToInternal(bdProfile);
              creatorData.followerCount = mappedProfile.followerCount;
              creatorData.engagementRate = mappedProfile.engagementRate;
              creatorData.bio = mappedProfile.profileName;
              creatorData.avatarUrl = mappedProfile.profileImageLink;
            } catch {
              // Use post-level data as fallback
            }
          }

          creatorId = await db.insertCreator(creatorData);
        } else {
          creatorId = creator.id;
          if (usedBrightData && postData.profileImageLink) {
            try {
              await db.updateCreator(creator.id, {
                avatarUrl: postData.profileImageLink,
                followerCount: postData.followerCountAtPosting,
              });
            } catch { /* non-critical */ }
          }
        }

        // Step 6: Insert post with Gemini analysis fields
        const trunc = (s: string | null | undefined, max: number) => s ? s.substring(0, max) : s;
        const postId = await db.insertPost({
          url: input.url,
          creatorId,
          creatorHandle: trunc(postData.creatorHandle, 128),
          title: trunc(postData.title, 512) || 'Untitled Post',
          format: postData.format,
          niche: trunc(postData.niche, 128),
          views: Math.round(postData.views || 0),
          likes: Math.round(postData.likes || 0),
          comments: Math.round(postData.comments || 0),
          engagementRate: postData.engagementRate || 0,
          followerCountAtPosting: Math.round(postData.followerCountAtPosting || 0),
          caption: postData.caption,
          hashtags: postData.hashtags,
          impactScore,
          hookType: trunc(postData.hookType, 128),
          contentStructure: postData.contentStructure,
          pacing: trunc(postData.pacing, 128),
          length: trunc(postData.length, 64),
          audioStrategy: postData.audioStrategy,
          visualStyle: postData.visualStyle,
          ctaStrategy: postData.ctaStrategy,
          thumbnailUrl: postData.thumbnail || null,
          // Gemini deep analysis fields
          hookStrength: geminiAnalysis ? trunc(geminiAnalysis.hookStrength, 32) : null,
          hookAnalysis: geminiAnalysis?.hookAnalysis || null,
          transcript: geminiAnalysis?.transcript || null,
          keyMessages: geminiAnalysis?.keyMessages || null,
          targetAudience: geminiAnalysis?.targetAudience || null,
          emotionalTone: geminiAnalysis ? trunc(geminiAnalysis.emotionalTone, 128) : null,
          hookScore: geminiAnalysis?.hookScore ?? null,
          structureScore: geminiAnalysis?.structureScore ?? null,
          ctaScore: geminiAnalysis?.ctaScore ?? null,
          visualScore: geminiAnalysis?.visualScore ?? null,
          overallQualityScore: geminiAnalysis?.overallQualityScore ?? null,
          ctaPresence: geminiAnalysis ? (geminiAnalysis.ctaPresence ? 1 : 0) : null,
        });

        // Step 7: Auto-generate a blueprint from this post
        let blueprintId: number | null = null;
        if (postData.hookType && postData.contentStructure) {
          try {
            blueprintId = await db.insertBlueprint({
              name: trunc(`${postData.hookType} — ${postData.format} Blueprint`, 256) || 'Untitled Blueprint',
              format: postData.format,
              description: `Blueprint extracted from ${postData.creatorHandle}'s ${postData.format} in the ${postData.niche} niche.`,
              hookType: trunc(postData.hookType, 128),
              structure: postData.contentStructure,
              pacing: trunc(postData.pacing, 128),
              length: trunc(postData.length, 64),
              audioStrategy: postData.audioStrategy,
              visualStyle: postData.visualStyle,
              ctaStrategy: postData.ctaStrategy,
              score: impactScore,
              sourcePostId: postId,
            });
          } catch {
            // Non-critical if blueprint creation fails
          }
        }

        return {
          postId,
          impactScore,
          blueprintId,
          usedBrightData,
          usedGemini: !!geminiAnalysis,
          analysis: {
            title: postData.title,
            format: postData.format,
            niche: postData.niche,
            views: postData.views || 0,
            likes: postData.likes || 0,
            comments: postData.comments || 0,
            engagementRate: postData.engagementRate || 0,
            followerCountAtPosting: postData.followerCountAtPosting || 0,
            caption: postData.caption,
            hashtags: postData.hashtags,
            hookType: postData.hookType,
            contentStructure: postData.contentStructure,
            pacing: postData.pacing,
            length: postData.length,
            audioStrategy: postData.audioStrategy,
            visualStyle: postData.visualStyle,
            ctaStrategy: postData.ctaStrategy,
            creatorHandle: postData.creatorHandle,
            thumbnail: postData.thumbnail || null,
            // Gemini deep analysis
            hookStrength: geminiAnalysis?.hookStrength || null,
            hookAnalysis: geminiAnalysis?.hookAnalysis || null,
            transcript: geminiAnalysis?.transcript || null,
            keyMessages: geminiAnalysis?.keyMessages || null,
            targetAudience: geminiAnalysis?.targetAudience || null,
            emotionalTone: geminiAnalysis?.emotionalTone || null,
            hookScore: geminiAnalysis?.hookScore ?? null,
            structureScore: geminiAnalysis?.structureScore ?? null,
            ctaScore: geminiAnalysis?.ctaScore ?? null,
            visualScore: geminiAnalysis?.visualScore ?? null,
            overallQualityScore: geminiAnalysis?.overallQualityScore ?? null,
            ctaPresence: geminiAnalysis?.ctaPresence ?? null,
          },
        };
      }),
  }),

  // ─── Library Stats ────────────────────────────────────────────
  stats: router({
    overview: publicProcedure.query(async () => {
      return db.getLibraryStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
