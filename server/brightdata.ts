import axios from "axios";
import { ENV } from "./_core/env";

const BRIGHTDATA_BASE = "https://api.brightdata.com";

// Dataset IDs for Instagram scrapers
const INSTAGRAM_POSTS_DATASET = "gd_lk5ns7kz21pck8jpis";
const INSTAGRAM_PROFILES_DATASET = "gd_l1vikfch901nx3by4";
const INSTAGRAM_REELS_DATASET = "gd_lyclm20il4r5helnj";

function getHeaders() {
  return {
    Authorization: `Bearer ${ENV.brightdataApiKey}`,
    "Content-Type": "application/json",
  };
}

// ─── Types ───────────────────────────────────────────────────

export interface BrightDataPost {
  post_id: string;
  url?: string;
  description: string | null;
  hashtags: string[] | null;
  date_posted: string | null;
  num_comments: number;
  likes: number;
  content_type: string;
  video_view_count: number | null;
  video_play_count: number | null;
  user_posted: string;
  followers: number;
  profile_url: string;
  profile_image_link: string | null;
  photos: string[] | null;
  videos: string[] | null;
  thumbnail: string | null;
  display_url: string | null;
  audio: string | null;
}

export interface BrightDataProfile {
  account: string;
  id: string;
  followers: number;
  posts_count: number;
  is_business_account: boolean;
  is_professional_account: boolean;
  is_verified: boolean;
  avg_engagement: number;
  profile_name: string;
  profile_url: string;
  profile_image_link: string | null;
  biography?: string | null;
}

// ─── API Calls (Scrapers API - /datasets/v3/scrape) ─────────

/**
 * Collect data from a single Instagram post by URL.
 * Uses the synchronous Scrapers API with the Instagram Posts dataset.
 */
export async function collectPost(postUrl: string): Promise<BrightDataPost> {
  const response = await axios.post(
    `${BRIGHTDATA_BASE}/datasets/v3/scrape?dataset_id=${INSTAGRAM_POSTS_DATASET}&include_errors=true&format=json`,
    [{ url: postUrl }],
    {
      headers: getHeaders(),
      timeout: 90000, // Sync API has 60s server timeout, give extra buffer
      validateStatus: (status) => status >= 200 && status < 300,
    }
  );

  // Response is an array, return the first item
  const data = response.data;
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || result.__error) {
    throw new Error(result?.__error?.message || "No data returned from Bright Data");
  }
  return result;
}

/**
 * Discover recent posts from a public Instagram profile.
 * Uses the synchronous Scrapers API with discover-by-url mode.
 */
export async function discoverProfilePosts(
  profileUrl: string,
  opts?: { numPosts?: number; postType?: string }
): Promise<BrightDataPost[]> {
  const input: Record<string, unknown> = { url: profileUrl };
  if (opts?.numPosts) input.num_of_posts = opts.numPosts;
  if (opts?.postType) input.post_type = opts.postType;

  const response = await axios.post(
    `${BRIGHTDATA_BASE}/datasets/v3/scrape?dataset_id=${INSTAGRAM_POSTS_DATASET}&include_errors=true&format=json`,
    [input],
    {
      headers: getHeaders(),
      timeout: 120000,
      validateStatus: (status) => status >= 200 && status < 300,
    }
  );

  const data = response.data;
  const results = Array.isArray(data) ? data : [data];
  return results.filter((r: any) => r && !r.__error);
}

/**
 * Collect profile data from an Instagram profile URL.
 * Uses the synchronous Scrapers API with the Instagram Profiles dataset.
 */
export async function collectProfile(profileUrl: string): Promise<BrightDataProfile> {
  const response = await axios.post(
    `${BRIGHTDATA_BASE}/datasets/v3/scrape?dataset_id=${INSTAGRAM_PROFILES_DATASET}&include_errors=true&format=json`,
    [{ url: profileUrl }],
    {
      headers: getHeaders(),
      timeout: 90000,
      validateStatus: (status) => status >= 200 && status < 300,
    }
  );

  const data = response.data;
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || result.__error) {
    throw new Error(result?.__error?.message || "No profile data returned from Bright Data");
  }
  return result;
}

/**
 * Validate the API key by listing available datasets.
 * Returns true if the key is valid, false otherwise.
 */
export async function validateApiKey(): Promise<boolean> {
  try {
    const response = await axios.get(
      `${BRIGHTDATA_BASE}/datasets/list`,
      { headers: getHeaders(), timeout: 15000 }
    );
    return response.status === 200 && Array.isArray(response.data);
  } catch (error: any) {
    if (error.response?.status === 401) return false;
    return false;
  }
}

// ─── Data Mapping Helpers ────────────────────────────────────

/**
 * Map a BrightData post response to our internal post format.
 */
export function mapBrightDataPostToInternal(bd: BrightDataPost, postUrl: string) {
  const views = bd.video_view_count || bd.video_play_count || bd.likes * 3; // estimate views for images
  const engagementRate = bd.followers > 0
    ? Number((((bd.likes + bd.num_comments) / bd.followers) * 100).toFixed(2))
    : 0;

  // Determine format
  let format: "reel" | "carousel" | "image" = "image";
  if (bd.content_type === "video" || bd.content_type === "reel" || (bd.videos && bd.videos.length > 0)) {
    format = "reel";
  } else if (bd.photos && bd.photos.length > 1) {
    format = "carousel";
  }

  // Extract title from description (first line or first 80 chars)
  const description = bd.description || "";
  const title = description.split("\n")[0]?.substring(0, 100) || `Post by @${bd.user_posted}`;

  // Extract hashtags
  const hashtags = bd.hashtags?.join(", ") || "";

  return {
    url: postUrl,
    creatorHandle: `@${bd.user_posted}`,
    title,
    format,
    niche: null as string | null, // Will be determined by LLM
    views,
    likes: bd.likes,
    comments: bd.num_comments,
    engagementRate,
    followerCountAtPosting: bd.followers,
    caption: description,
    hashtags,
    datePosted: bd.date_posted,
    thumbnail: bd.thumbnail || bd.photos?.[0] || null,
    profileImageLink: bd.profile_image_link,
    photos: bd.photos || null,
    videos: bd.videos || null,
    audio: bd.audio || null,
    contentType: bd.content_type || null,
  };
}

/**
 * Map a BrightData profile response to our internal creator format.
 */
export function mapBrightDataProfileToInternal(bd: BrightDataProfile) {
  return {
    handle: `@${bd.account}`,
    platform: "instagram" as const,
    niche: null as string | null, // Will be determined by LLM
    followerCount: bd.followers,
    postCount: bd.posts_count,
    engagementRate: bd.avg_engagement != null ? Number((bd.avg_engagement * 100).toFixed(2)) : 0,
    isVerified: bd.is_verified,
    isBusinessAccount: bd.is_business_account,
    profileName: bd.profile_name,
    profileUrl: bd.profile_url,
    profileImageLink: bd.profile_image_link,
    biography: bd.biography || null,
  };
}
