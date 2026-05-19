# Impact Foundation v1 — TODO

## Design System
- [x] Apply Impact brand CSS custom properties (cream/ink/gold palette, spacing, radius, elevation) to index.css
- [x] Add Inter Tight, DM Sans, Playfair Display fonts via Google Fonts in client/index.html
- [x] Configure Tailwind to use Impact design tokens

## Navigation & Footer
- [x] Build persistent top navigation bar (wordmark, nav links, "Grow with Impact" CTA)
- [x] Build site-wide footer (branding, nav links, legal links, impact.me references)
- [x] Ensure no "NexusPlatform" references exist anywhere in the codebase

## Reusable UI Primitives
- [x] SectionHeader component (tag + two-column headline/description)
- [x] ContentCard component
- [x] StatCard component (light and dark variants)
- [x] Tag and SubTag components
- [x] NewsletterCapture form (DB-backed, HubSpot-ready schema, no live sync)
- [x] AdminLayout component (sidebar + protected route wrapper)

## Public Routes (placeholder pages with nav/footer/meta)
- [x] / (Homepage)
- [x] /insights (Insights index)
- [x] /insights/:slug (Insight detail)
- [x] /reports (Reports index)
- [x] /reports/:slug (Report detail)
- [x] /podcast (Podcast index)
- [x] /podcast/:slug (Podcast episode detail)
- [x] /events (Events index)
- [x] /events/:slug (Event detail)
- [x] /case-studies (Case Studies index)
- [x] /case-studies/:slug (Case Study detail)
- [x] /100 (Impact 100 current ranking)
- [x] /100/:segment (Impact 100 archive or leader profile)
- [x] /magazine (Magazine one-pager)
- [x] /programs (Programs one-pager)
- [x] /roadmap (Roadmap one-pager)
- [x] /about (About static page)
- [x] /contact (Contact static page)
- [x] /press (Press static page)
- [x] /privacy (Privacy static page)
- [x] /terms (Terms static page)
- [x] 404 catch-all page

## Admin Shell
- [x] /admin protected route (admin role only)
- [x] Admin sidebar navigation
- [x] Admin dashboard placeholder
- [x] Admin content management placeholder
- [x] Admin Impact 100 management placeholder
- [x] Admin users management placeholder
- [x] Admin settings placeholder

## Database Schema
- [x] contentItems table (Insights, Reports, Podcast, Events, Case Studies)
- [x] contentCategories table
- [x] podcastMeta table
- [x] eventMeta table
- [x] magazineIssues table
- [x] newsletterLeads table (HubSpot-ready: contactId, syncStatus, lastSyncAt, syncError)
- [x] impact100Editions table (monthly ranking editions)
- [x] impact100Leaders table (ranked leader profiles)
- [x] impact100Rankings table (ranking snapshots with Bright Data-ready fields)
- [x] impact100SourceRecords table (scraped platform metrics, Bright Data-ready)
- [x] siteSettings table
- [x] Run migrations (all 13 tables confirmed live)

## Backend API Foundations
- [x] Newsletter router (subscribe mutation, admin list)
- [x] Admin router (protected stats procedure)

## Testing & Repository
- [x] Write vitest tests for newsletter subscription (6 tests passing)
- [x] Write vitest tests for admin protection
- [ ] Create private GitHub repository
- [ ] Save Foundation v1 checkpoint
