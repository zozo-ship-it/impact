import { describe, expect, it } from "vitest";
import {
  validateApiKey,
  mapBrightDataPostToInternal,
  mapBrightDataProfileToInternal,
  type BrightDataPost,
  type BrightDataProfile,
} from "./brightdata";

// ─── API Key Validation ──────────────────────────────────────

describe("Bright Data API key validation", () => {
  it("should have a valid BRIGHTDATA_API_KEY configured", () => {
    const apiKey = process.env.BRIGHTDATA_API_KEY;
    expect(apiKey).toBeTruthy();
    expect(apiKey!.length).toBeGreaterThan(5);
  });

  it("should successfully authenticate with Bright Data API", async () => {
    const isValid = await validateApiKey();
    expect(isValid).toBe(true);
  }, 35000);
});

// ─── Post Mapping ────────────────────────────────────────────

describe("mapBrightDataPostToInternal", () => {
  const samplePost: BrightDataPost = {
    post_id: "abc123",
    description: "5 morning habits that changed my life\n\nHere's what I do every day...\n#morningroutine #habits",
    hashtags: ["morningroutine", "habits", "wellness"],
    date_posted: "2026-03-15",
    num_comments: 342,
    likes: 8500,
    content_type: "video",
    video_view_count: 125000,
    video_play_count: 130000,
    user_posted: "wellnesscoach",
    followers: 45000,
    profile_url: "https://www.instagram.com/wellnesscoach/",
    profile_image_link: "https://instagram.com/profile.jpg",
    photos: null,
    videos: ["https://instagram.com/video.mp4"],
    thumbnail: "https://instagram.com/thumb.jpg",
    display_url: null,
    audio: null,
  };

  it("maps basic fields correctly", () => {
    const result = mapBrightDataPostToInternal(samplePost, "https://www.instagram.com/p/abc123/");
    expect(result.url).toBe("https://www.instagram.com/p/abc123/");
    expect(result.creatorHandle).toBe("@wellnesscoach");
    expect(result.followerCountAtPosting).toBe(45000);
    expect(result.likes).toBe(8500);
    expect(result.comments).toBe(342);
  });

  it("extracts title from first line of description", () => {
    const result = mapBrightDataPostToInternal(samplePost, "https://www.instagram.com/p/abc123/");
    expect(result.title).toBe("5 morning habits that changed my life");
  });

  it("detects reel format from video content type", () => {
    const result = mapBrightDataPostToInternal(samplePost, "https://www.instagram.com/p/abc123/");
    expect(result.format).toBe("reel");
  });

  it("detects carousel format from multiple photos", () => {
    const carouselPost: BrightDataPost = {
      ...samplePost,
      content_type: "image",
      video_view_count: null,
      video_play_count: null,
      videos: null,
      photos: ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
    };
    const result = mapBrightDataPostToInternal(carouselPost, "https://www.instagram.com/p/xyz/");
    expect(result.format).toBe("carousel");
  });

  it("detects image format for single photo", () => {
    const imagePost: BrightDataPost = {
      ...samplePost,
      content_type: "image",
      video_view_count: null,
      video_play_count: null,
      videos: null,
      photos: ["photo1.jpg"],
    };
    const result = mapBrightDataPostToInternal(imagePost, "https://www.instagram.com/p/xyz/");
    expect(result.format).toBe("image");
  });

  it("uses video_view_count for views when available", () => {
    const result = mapBrightDataPostToInternal(samplePost, "https://www.instagram.com/p/abc123/");
    expect(result.views).toBe(125000);
  });

  it("falls back to likes * 3 for image posts without view counts", () => {
    const imagePost: BrightDataPost = {
      ...samplePost,
      content_type: "image",
      video_view_count: null,
      video_play_count: null,
      videos: null,
      photos: ["photo1.jpg"],
    };
    const result = mapBrightDataPostToInternal(imagePost, "https://www.instagram.com/p/xyz/");
    expect(result.views).toBe(8500 * 3);
  });

  it("calculates engagement rate correctly", () => {
    const result = mapBrightDataPostToInternal(samplePost, "https://www.instagram.com/p/abc123/");
    // (8500 + 342) / 45000 * 100 = 19.65
    expect(result.engagementRate).toBeCloseTo(19.65, 1);
  });

  it("handles zero followers gracefully", () => {
    const noFollowersPost: BrightDataPost = {
      ...samplePost,
      followers: 0,
    };
    const result = mapBrightDataPostToInternal(noFollowersPost, "https://www.instagram.com/p/abc123/");
    expect(result.engagementRate).toBe(0);
  });

  it("joins hashtags into comma-separated string", () => {
    const result = mapBrightDataPostToInternal(samplePost, "https://www.instagram.com/p/abc123/");
    expect(result.hashtags).toBe("morningroutine, habits, wellness");
  });

  it("handles null description gracefully", () => {
    const noDescPost: BrightDataPost = {
      ...samplePost,
      description: null,
    };
    const result = mapBrightDataPostToInternal(noDescPost, "https://www.instagram.com/p/abc123/");
    expect(result.title).toBe("Post by @wellnesscoach");
    expect(result.caption).toBe("");
  });

  it("preserves thumbnail and profile image", () => {
    const result = mapBrightDataPostToInternal(samplePost, "https://www.instagram.com/p/abc123/");
    expect(result.thumbnail).toBe("https://instagram.com/thumb.jpg");
    expect(result.profileImageLink).toBe("https://instagram.com/profile.jpg");
  });
});

// ─── Profile Mapping ─────────────────────────────────────────

describe("mapBrightDataProfileToInternal", () => {
  const sampleProfile: BrightDataProfile = {
    account: "fitnesscoach",
    id: "9876543210",
    followers: 82000,
    posts_count: 450,
    is_business_account: true,
    is_professional_account: true,
    is_verified: false,
    avg_engagement: 0.045,
    profile_name: "Sarah Fitness Coach",
    profile_url: "https://www.instagram.com/fitnesscoach/",
    profile_image_link: "https://instagram.com/avatar.jpg",
  };

  it("maps basic fields correctly", () => {
    const result = mapBrightDataProfileToInternal(sampleProfile);
    expect(result.handle).toBe("@fitnesscoach");
    expect(result.platform).toBe("instagram");
    expect(result.followerCount).toBe(82000);
    expect(result.postCount).toBe(450);
    expect(result.profileName).toBe("Sarah Fitness Coach");
    expect(result.profileUrl).toBe("https://www.instagram.com/fitnesscoach/");
  });

  it("converts avg_engagement decimal to percentage", () => {
    const result = mapBrightDataProfileToInternal(sampleProfile);
    // 0.045 * 100 = 4.5
    expect(result.engagementRate).toBeCloseTo(4.5, 1);
  });

  it("maps boolean flags correctly", () => {
    const result = mapBrightDataProfileToInternal(sampleProfile);
    expect(result.isVerified).toBe(false);
    expect(result.isBusinessAccount).toBe(true);
  });

  it("preserves profile image link", () => {
    const result = mapBrightDataProfileToInternal(sampleProfile);
    expect(result.profileImageLink).toBe("https://instagram.com/avatar.jpg");
  });

  it("handles null profile image", () => {
    const noImageProfile: BrightDataProfile = {
      ...sampleProfile,
      profile_image_link: null,
    };
    const result = mapBrightDataProfileToInternal(noImageProfile);
    expect(result.profileImageLink).toBeNull();
  });

  it("sets niche to null (to be determined by LLM)", () => {
    const result = mapBrightDataProfileToInternal(sampleProfile);
    expect(result.niche).toBeNull();
  });
});
