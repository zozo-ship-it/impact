/**
 * MailerLite API client for fetching email marketing data.
 * Requires MAILERLITE_API_KEY environment variable.
 * API docs: https://developers.mailerlite.com/docs
 */

const BASE_URL = "https://connect.mailerlite.com/api";

function getApiKey(): string {
  const key = process.env.MAILERLITE_API_KEY;
  if (!key) throw new Error("MAILERLITE_API_KEY environment variable is not set");
  return key;
}

function headers() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${getApiKey()}`,
  };
}

// ─── Types ───────────────────────────────────────────────────

export interface MailerLiteCampaign {
  id: string;
  account_id: string;
  name: string;
  type: "regular" | "ab" | "resend" | "rss";
  status: "draft" | "ready" | "sent" | "sending";
  emails: MailerLiteEmail[];
  created_at: string;
  updated_at: string;
  scheduled_for: string | null;
  finished_at: string | null;
  stats?: MailerLiteCampaignStats;
}

export interface MailerLiteEmail {
  id: string;
  account_id: string;
  subject: string;
  from: string;
  from_name: string;
  preview_text: string;
  content: string;
  screenshot_url: string | null;
}

export interface MailerLiteCampaignStats {
  sent: number;
  opens_count: number;
  unique_opens_count: number;
  open_rate: { float: number; string: string };
  clicks_count: number;
  unique_clicks_count: number;
  click_rate: { float: number; string: string };
  unsubscribes_count: number;
  unsubscribe_rate: { float: number; string: string };
  spam_count: number;
  spam_rate: { float: number; string: string };
  hard_bounces_count: number;
  soft_bounces_count: number;
  forwards_count: number;
  click_to_open_rate: { float: number; string: string };
}

export interface MailerLiteSubscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed" | "unconfirmed" | "bounced" | "junk";
  source: string;
  sent: number;
  opens_count: number;
  clicks_count: number;
  open_rate: number;
  click_rate: number;
  subscribed_at: string;
  created_at: string;
  updated_at: string;
}

export interface MailerLiteGroup {
  id: string;
  name: string;
  active_count: number;
  sent_count: number;
  opens_count: number;
  open_rate: { float: number; string: string };
  clicks_count: number;
  click_rate: { float: number; string: string };
  unsubscribed_count: number;
  unsubscribe_rate: { float: number; string: string };
  bounced_count: number;
  junk_count: number;
  created_at: string;
}

// ─── API Methods ─────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers(), ...options?.headers },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`MailerLite API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

/** List campaigns with optional filters */
export async function listCampaigns(opts?: {
  status?: "draft" | "ready" | "sent" | "sending";
  limit?: number;
  page?: number;
}): Promise<{ data: MailerLiteCampaign[]; meta: any }> {
  const params = new URLSearchParams();
  if (opts?.status) params.set("filter[status]", opts.status);
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.page) params.set("page", String(opts.page));
  const qs = params.toString();
  return apiFetch(`/campaigns${qs ? `?${qs}` : ""}`);
}

/** Get a single campaign by ID */
export async function getCampaign(id: string): Promise<{ data: MailerLiteCampaign }> {
  return apiFetch(`/campaigns/${id}`);
}

/** Get subscriber stats overview */
export async function getSubscribers(opts?: {
  status?: string;
  limit?: number;
  page?: number;
}): Promise<{ data: MailerLiteSubscriber[]; meta: any }> {
  const params = new URLSearchParams();
  if (opts?.status) params.set("filter[status]", opts.status);
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.page) params.set("page", String(opts.page));
  const qs = params.toString();
  return apiFetch(`/subscribers${qs ? `?${qs}` : ""}`);
}

/** List subscriber groups */
export async function listGroups(opts?: {
  limit?: number;
  page?: number;
}): Promise<{ data: MailerLiteGroup[]; meta: any }> {
  const params = new URLSearchParams();
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.page) params.set("page", String(opts.page));
  const qs = params.toString();
  return apiFetch(`/groups${qs ? `?${qs}` : ""}`);
}

/** Get account-wide stats */
export async function getAccountStats(): Promise<{
  subscribersCount: number;
  campaignsSent: number;
  avgOpenRate: number;
  avgClickRate: number;
}> {
  // Fetch recent sent campaigns and compute averages
  const { data: campaigns } = await listCampaigns({ status: "sent", limit: 50 });

  let totalOpenRate = 0;
  let totalClickRate = 0;
  let counted = 0;

  for (const c of campaigns) {
    if (c.stats) {
      totalOpenRate += c.stats.open_rate.float;
      totalClickRate += c.stats.click_rate.float;
      counted++;
    }
  }

  const { data: subs, meta } = await getSubscribers({ status: "active", limit: 1 });

  return {
    subscribersCount: meta?.total ?? 0,
    campaignsSent: campaigns.length,
    avgOpenRate: counted > 0 ? totalOpenRate / counted : 0,
    avgClickRate: counted > 0 ? totalClickRate / counted : 0,
  };
}

/** Create a campaign draft in MailerLite */
export async function createCampaignDraft(opts: {
  name: string;
  subject: string;
  from: string;
  fromName: string;
  previewText?: string;
  content: string;
  groupIds?: string[];
}): Promise<{ data: MailerLiteCampaign }> {
  const body: any = {
    name: opts.name,
    type: "regular",
    emails: [
      {
        subject: opts.subject,
        from: opts.from,
        from_name: opts.fromName,
        preview_text: opts.previewText || "",
        content: opts.content,
      },
    ],
  };

  if (opts.groupIds?.length) {
    body.groups = opts.groupIds;
  }

  return apiFetch("/campaigns", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Check if MailerLite API key is configured */
export function isConfigured(): boolean {
  return !!process.env.MAILERLITE_API_KEY;
}
