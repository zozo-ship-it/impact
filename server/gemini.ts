import axios from "axios";
import { ENV } from "./_core/env";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "gemini-2.5-flash-preview-05-20";

// ─── Types ───────────────────────────────────────────────────

export interface ContentAnalysis {
  // Content quality signals
  hookType: string;
  hookStrength: "strong" | "moderate" | "weak";
  hookAnalysis: string;
  contentStructure: string;
  pacing: string;
  length: string;
  audioStrategy: string;
  visualStyle: string;
  ctaStrategy: string;
  ctaPresence: boolean;

  // Deep analysis
  keyMessages: string[];
  targetAudience: string;
  emotionalTone: string;
  niche: string;
  format: "reel" | "carousel" | "image";
  title: string;

  // Quality scores (0-100)
  hookScore: number;
  structureScore: number;
  ctaScore: number;
  visualScore: number;
  overallQualityScore: number;

  // Transcript (for video/reel content)
  transcript: string | null;
}

// ─── Gemini API Call ─────────────────────────────────────────

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

async function callGemini(parts: GeminiPart[], responseFormat?: object): Promise<string> {
  const url = `${GEMINI_BASE}/models/${MODEL}:generateContent?key=${ENV.geminiApiKey}`;

  const body: Record<string, unknown> = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
    },
  };

  if (responseFormat) {
    body.generationConfig = {
      ...(body.generationConfig as object),
      responseMimeType: "application/json",
      responseSchema: responseFormat,
    };
  }

  const response = await axios.post(url, body, {
    headers: { "Content-Type": "application/json" },
    timeout: 120000, // 2 min timeout for video analysis
  });

  const candidate = response.data?.candidates?.[0];
  if (!candidate?.content?.parts?.[0]?.text) {
    throw new Error("No content returned from Gemini");
  }
  return candidate.content.parts[0].text;
}

// ─── Image Download & Base64 ─────────────────────────────────

async function downloadAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000,
      maxContentLength: 95 * 1024 * 1024, // 95MB limit
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const contentType = response.headers["content-type"] || "image/jpeg";
    const base64 = Buffer.from(response.data).toString("base64");
    return { data: base64, mimeType: contentType };
  } catch (error) {
    console.warn(`[Gemini] Failed to download media from ${url}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

// ─── Analysis Schema ─────────────────────────────────────────

const ANALYSIS_SCHEMA = {
  type: "object" as const,
  properties: {
    hookType: { type: "string" as const, description: "Type of hook used (e.g., Question, Bold Statement, Statistic, Story, Curiosity Gap, Challenge)" },
    hookStrength: { type: "string" as const, enum: ["strong", "moderate", "weak"] },
    hookAnalysis: { type: "string" as const, description: "Detailed analysis of why the hook works or doesn't" },
    contentStructure: { type: "string" as const, description: "How the content is structured (e.g., Problem-Solution, Listicle, Story Arc, Tutorial)" },
    pacing: { type: "string" as const, description: "Pacing description (e.g., Fast cuts, Slow build, Punchy)" },
    length: { type: "string" as const, description: "Content length assessment (e.g., 30s reel, 5-slide carousel, single image)" },
    audioStrategy: { type: "string" as const, description: "Audio approach (e.g., Voiceover, Trending audio, Original sound, Text-only)" },
    visualStyle: { type: "string" as const, description: "Visual style description (e.g., Clean minimal, Bold text overlays, Raw/authentic, Cinematic)" },
    ctaStrategy: { type: "string" as const, description: "Call-to-action approach (e.g., Comment CTA, Link in bio, Save for later, DM me)" },
    ctaPresence: { type: "boolean" as const },
    keyMessages: { type: "array" as const, items: { type: "string" as const }, description: "Top 3-5 key messages or takeaways" },
    targetAudience: { type: "string" as const, description: "Who this content is targeting" },
    emotionalTone: { type: "string" as const, description: "Emotional tone (e.g., Inspirational, Educational, Entertaining, Urgent)" },
    niche: { type: "string" as const, description: "Content niche (e.g., Fitness Coaching, Business Strategy, Wellness, Personal Development)" },
    format: { type: "string" as const, enum: ["reel", "carousel", "image"] },
    title: { type: "string" as const, description: "A compelling title summarizing the content (max 80 chars)" },
    hookScore: { type: "number" as const, description: "Hook quality score 0-100" },
    structureScore: { type: "number" as const, description: "Content structure quality score 0-100" },
    ctaScore: { type: "number" as const, description: "CTA effectiveness score 0-100" },
    visualScore: { type: "number" as const, description: "Visual quality score 0-100" },
    overallQualityScore: { type: "number" as const, description: "Overall content quality score 0-100" },
    transcript: { type: "string" as const, description: "Transcript of spoken words in video/reel, or null for images" },
  },
  required: [
    "hookType", "hookStrength", "hookAnalysis", "contentStructure", "pacing",
    "length", "audioStrategy", "visualStyle", "ctaStrategy", "ctaPresence",
    "keyMessages", "targetAudience", "emotionalTone", "niche", "format", "title",
    "hookScore", "structureScore", "ctaScore", "visualScore", "overallQualityScore",
    "transcript",
  ],
};

// ─── Main Analysis Functions ─────────────────────────────────

const SYSTEM_PROMPT = `You are an expert Instagram content strategist and analyst for Impact Studio, a platform that helps coaches, experts, and online entrepreneurs build their personal brand on Instagram.

Analyze the provided Instagram content (images, video, and/or caption) and provide a detailed content blueprint. Focus on:

1. **Hook Analysis**: What type of hook is used? How strong is it? Why does it work (or not)?
2. **Content Structure**: How is the content organized? What framework does it follow?
3. **Visual Style**: What visual approach is used? Colors, typography, composition, editing style.
4. **Pacing**: How does the content flow? Fast cuts, slow build, punchy transitions?
5. **Audio Strategy**: Voiceover, trending audio, original sound, or text-only?
6. **CTA Strategy**: What call-to-action is used? How effective is it?
7. **Key Messages**: What are the main takeaways?
8. **Target Audience**: Who is this content designed for?
9. **Niche**: What content niche does this belong to?
10. **Quality Scores**: Rate each dimension 0-100 based on best practices for Instagram growth.

If this is a video/reel, also transcribe any spoken words.
Be specific and actionable in your analysis — this is for creators who want to learn what works.`;

/**
 * Analyze Instagram content using Gemini Flash 2.5.
 * Handles images, videos/reels, and carousels with caption text.
 */
export async function analyzeContent(opts: {
  caption: string | null;
  photos: string[] | null;
  videos: string[] | null;
  contentType?: string;
  creatorHandle?: string;
  hashtags?: string[];
}): Promise<ContentAnalysis> {
  const parts: GeminiPart[] = [];

  // System prompt
  parts.push({
    text: SYSTEM_PROMPT,
  });

  // Add media content
  let mediaAdded = false;

  // Try to add video first (for reels)
  if (opts.videos && opts.videos.length > 0) {
    for (const videoUrl of opts.videos.slice(0, 1)) { // Only first video
      const media = await downloadAsBase64(videoUrl);
      if (media) {
        parts.push({ inlineData: { mimeType: media.mimeType.startsWith("video/") ? media.mimeType : "video/mp4", data: media.data } });
        mediaAdded = true;
        break;
      }
    }
  }

  // Add images (for carousels or single images)
  if (opts.photos && opts.photos.length > 0) {
    // For carousels, analyze up to 5 images
    const maxImages = mediaAdded ? 2 : 5;
    for (const photoUrl of opts.photos.slice(0, maxImages)) {
      const media = await downloadAsBase64(photoUrl);
      if (media) {
        parts.push({ inlineData: { mimeType: media.mimeType.startsWith("image/") ? media.mimeType : "image/jpeg", data: media.data } });
        mediaAdded = true;
      }
    }
  }

  // Add caption and context as text
  const contextParts: string[] = [];
  if (opts.creatorHandle) contextParts.push(`Creator: ${opts.creatorHandle}`);
  if (opts.caption) contextParts.push(`Caption: ${opts.caption}`);
  if (opts.hashtags && opts.hashtags.length > 0) contextParts.push(`Hashtags: ${opts.hashtags.join(", ")}`);
  if (opts.contentType) contextParts.push(`Content type: ${opts.contentType}`);

  if (!mediaAdded && !opts.caption) {
    throw new Error("No media or caption provided for analysis");
  }

  parts.push({
    text: `\n\nAnalyze this Instagram post:\n${contextParts.join("\n")}\n\nProvide your detailed content analysis as structured JSON.`,
  });

  // Call Gemini with structured output
  const rawResponse = await callGemini(parts, ANALYSIS_SCHEMA);

  try {
    const analysis = JSON.parse(rawResponse) as ContentAnalysis;
    return analysis;
  } catch {
    // If JSON parsing fails, try to extract JSON from the response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ContentAnalysis;
    }
    throw new Error("Failed to parse Gemini analysis response");
  }
}

/**
 * Analyze only the caption text (fallback when media is unavailable).
 */
export async function analyzeCaptionOnly(opts: {
  caption: string;
  creatorHandle?: string;
  hashtags?: string[];
}): Promise<ContentAnalysis> {
  return analyzeContent({
    caption: opts.caption,
    photos: null,
    videos: null,
    creatorHandle: opts.creatorHandle,
    hashtags: opts.hashtags,
  });
}
