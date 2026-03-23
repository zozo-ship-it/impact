ALTER TABLE `posts` ADD `hookStrength` varchar(32);--> statement-breakpoint
ALTER TABLE `posts` ADD `hookAnalysis` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `transcript` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `keyMessages` json;--> statement-breakpoint
ALTER TABLE `posts` ADD `targetAudience` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `emotionalTone` varchar(128);--> statement-breakpoint
ALTER TABLE `posts` ADD `hookScore` int;--> statement-breakpoint
ALTER TABLE `posts` ADD `structureScore` int;--> statement-breakpoint
ALTER TABLE `posts` ADD `ctaScore` int;--> statement-breakpoint
ALTER TABLE `posts` ADD `visualScore` int;--> statement-breakpoint
ALTER TABLE `posts` ADD `overallQualityScore` int;--> statement-breakpoint
ALTER TABLE `posts` ADD `ctaPresence` int;