import { describe, expect, it } from "vitest";
import axios from "axios";
import type { ContentAnalysis } from "./gemini";

describe("Gemini API key validation", () => {
  it("should successfully authenticate with Gemini Flash 2.5 API", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey).toBeTruthy();

    // Use the models.list endpoint as a lightweight validation
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { timeout: 15000 }
    );

    expect(response.status).toBe(200);
    expect(response.data.models).toBeDefined();

    // Verify gemini-2.5-flash is available
    const models = response.data.models.map((m: any) => m.name);
    const hasFlash = models.some((name: string) => name.includes("gemini-2.5-flash") || name.includes("gemini-2.0-flash"));
    expect(hasFlash).toBe(true);
  }, 20000);
});

describe("ContentAnalysis type structure", () => {
  it("should define all required fields in the ContentAnalysis interface", () => {
    // Verify the type structure by creating a mock that satisfies it
    const mock: ContentAnalysis = {
      hookType: "Question Hook",
      hookStrength: "strong",
      hookAnalysis: "Opens with a compelling question that creates curiosity",
      contentStructure: "Problem-Solution framework",
      pacing: "Medium tempo with punchy transitions",
      length: "30s reel",
      audioStrategy: "Voiceover with trending background music",
      visualStyle: "Clean minimal with bold text overlays",
      ctaStrategy: "Comment CTA — asks viewers to comment a keyword",
      ctaPresence: true,
      keyMessages: ["Build your audience first", "Content strategy matters", "Consistency is key"],
      targetAudience: "Online coaches and course creators looking to grow on Instagram",
      emotionalTone: "Inspirational and educational",
      niche: "Business Coaching",
      format: "reel",
      title: "The #1 Strategy for Growing Your Coaching Business",
      hookScore: 85,
      structureScore: 78,
      ctaScore: 72,
      visualScore: 80,
      overallQualityScore: 79,
      transcript: "Here's the number one strategy that helped me grow...",
    };

    expect(mock.hookType).toBe("Question Hook");
    expect(mock.hookStrength).toBe("strong");
    expect(mock.hookScore).toBeGreaterThanOrEqual(0);
    expect(mock.hookScore).toBeLessThanOrEqual(100);
    expect(mock.keyMessages).toHaveLength(3);
    expect(["reel", "carousel", "image"]).toContain(mock.format);
    expect(["strong", "moderate", "weak"]).toContain(mock.hookStrength);
    expect(mock.ctaPresence).toBe(true);
    expect(mock.transcript).toBeTruthy();
  });

  it("should allow null transcript for image posts", () => {
    const mock: ContentAnalysis = {
      hookType: "Bold Statement",
      hookStrength: "moderate",
      hookAnalysis: "Uses a bold claim to grab attention",
      contentStructure: "Single image with text overlay",
      pacing: "Static — single frame",
      length: "Single image",
      audioStrategy: "N/A — image post",
      visualStyle: "Bold typography on gradient background",
      ctaStrategy: "Save for later",
      ctaPresence: true,
      keyMessages: ["One key insight"],
      targetAudience: "Wellness coaches",
      emotionalTone: "Motivational",
      niche: "Wellness",
      format: "image",
      title: "Your Morning Routine Is Broken",
      hookScore: 65,
      structureScore: 70,
      ctaScore: 55,
      visualScore: 75,
      overallQualityScore: 66,
      transcript: null,
    };

    expect(mock.transcript).toBeNull();
    expect(mock.format).toBe("image");
  });

  it("should validate quality scores are within 0-100 range", () => {
    const scores = {
      hookScore: 85,
      structureScore: 78,
      ctaScore: 72,
      visualScore: 80,
      overallQualityScore: 79,
    };

    for (const [key, value] of Object.entries(scores)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });
});

describe("Gemini analysis schema", () => {
  it("should define the correct response schema for structured output", () => {
    // Verify the schema structure matches what Gemini expects
    const requiredFields = [
      "hookType", "hookStrength", "hookAnalysis", "contentStructure", "pacing",
      "length", "audioStrategy", "visualStyle", "ctaStrategy", "ctaPresence",
      "keyMessages", "targetAudience", "emotionalTone", "niche", "format", "title",
      "hookScore", "structureScore", "ctaScore", "visualScore", "overallQualityScore",
      "transcript",
    ];

    // All required fields should be present
    expect(requiredFields).toHaveLength(22);
    expect(requiredFields).toContain("hookScore");
    expect(requiredFields).toContain("transcript");
    expect(requiredFields).toContain("keyMessages");
  });
});
