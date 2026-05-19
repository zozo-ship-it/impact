CREATE TABLE `content_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `content_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `content_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentType` enum('insight','report','podcast','event','case_study') NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`title` varchar(320) NOT NULL,
	`slug` varchar(320) NOT NULL,
	`excerpt` text,
	`body` text,
	`featuredImageUrl` varchar(512),
	`featuredImageKey` varchar(512),
	`authorId` int,
	`categoryId` int,
	`tags` json DEFAULT ('[]'),
	`seoTitle` varchar(320),
	`seoDescription` text,
	`ogImageUrl` varchar(512),
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `content_items_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `event_meta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentItemId` int NOT NULL,
	`eventType` enum('summit','workshop','webinar','networking','conference','other') DEFAULT 'other',
	`startsAt` timestamp,
	`endsAt` timestamp,
	`timezone` varchar(64),
	`locationName` varchar(320),
	`locationAddress` text,
	`isVirtual` boolean DEFAULT false,
	`virtualUrl` varchar(512),
	`registrationUrl` varchar(512),
	`capacity` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_meta_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_meta_contentItemId_unique` UNIQUE(`contentItemId`)
);
--> statement-breakpoint
CREATE TABLE `impact100_editions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`label` varchar(120) NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `impact100_editions_id` PRIMARY KEY(`id`),
	CONSTRAINT `impact100_editions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `impact100_leaders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(200) NOT NULL,
	`fullName` varchar(200) NOT NULL,
	`title` varchar(320),
	`company` varchar(320),
	`bio` text,
	`profileImageUrl` varchar(512),
	`profileImageKey` varchar(512),
	`category` varchar(120),
	`instagramHandle` varchar(120),
	`tiktokHandle` varchar(120),
	`youtubeHandle` varchar(120),
	`linkedinUrl` varchar(512),
	`websiteUrl` varchar(512),
	`isHallOfFame` boolean DEFAULT false,
	`hallOfFameYear` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `impact100_leaders_id` PRIMARY KEY(`id`),
	CONSTRAINT `impact100_leaders_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `impact100_rankings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`editionId` int NOT NULL,
	`leaderId` int NOT NULL,
	`rank` int NOT NULL,
	`previousRank` int,
	`score` int,
	`instagramFollowers` int,
	`instagramEngagementRate` int,
	`tiktokFollowers` int,
	`tiktokEngagementRate` int,
	`youtubeSubscribers` int,
	`totalReach` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `impact100_rankings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `impact100_source_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leaderId` int NOT NULL,
	`platform` enum('instagram','tiktok','youtube','linkedin','other') NOT NULL,
	`brightDataJobId` varchar(128),
	`brightDataDatasetId` varchar(128),
	`scrapedAt` timestamp,
	`followers` int,
	`following` int,
	`posts` int,
	`avgLikes` int,
	`avgComments` int,
	`engagementRate` int,
	`rawData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `impact100_source_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `magazine_issues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`issueNumber` int NOT NULL,
	`title` varchar(320) NOT NULL,
	`slug` varchar(320) NOT NULL,
	`coverImageUrl` varchar(512),
	`coverImageKey` varchar(512),
	`description` text,
	`pdfUrl` varchar(512),
	`pdfKey` varchar(512),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `magazine_issues_id` PRIMARY KEY(`id`),
	CONSTRAINT `magazine_issues_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`firstName` varchar(120),
	`lastName` varchar(120),
	`source` varchar(120) DEFAULT 'website',
	`hubspotContactId` varchar(64),
	`syncStatus` enum('pending','synced','failed','skipped') DEFAULT 'pending',
	`lastSyncAttemptAt` timestamp,
	`syncError` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`unsubscribedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletter_leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_leads_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `podcast_meta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentItemId` int NOT NULL,
	`episodeNumber` int,
	`durationSeconds` int,
	`audioUrl` varchar(512),
	`audioKey` varchar(512),
	`guestName` varchar(200),
	`guestTitle` varchar(200),
	`guestCompany` varchar(200),
	`transcriptUrl` varchar(512),
	`spotifyUrl` varchar(512),
	`appleUrl` varchar(512),
	`youtubeUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_meta_id` PRIMARY KEY(`id`),
	CONSTRAINT `podcast_meta_contentItemId_unique` UNIQUE(`contentItemId`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(120) NOT NULL,
	`value` text,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
