import { createConnection } from 'mysql2/promise';

const conn = await createConnection(process.env.DATABASE_URL);

const tables = [
  [`content_items`, `CREATE TABLE IF NOT EXISTS content_items (
    id int AUTO_INCREMENT NOT NULL,
    contentType ENUM('insight','report','podcast','event','case_study') NOT NULL,
    status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
    title varchar(320) NOT NULL,
    slug varchar(320) NOT NULL,
    excerpt text,
    body text,
    featuredImageUrl varchar(512),
    featuredImageKey varchar(512),
    authorId int,
    categoryId int,
    tags json DEFAULT ('[]'),
    seoTitle varchar(320),
    seoDescription text,
    ogImageUrl varchar(512),
    publishedAt timestamp NULL,
    createdAt timestamp NOT NULL DEFAULT (now()),
    updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY content_items_slug_unique (slug)
  )`],
  [`podcast_meta`, `CREATE TABLE IF NOT EXISTS podcast_meta (
    id int AUTO_INCREMENT NOT NULL,
    contentItemId int NOT NULL,
    episodeNumber int,
    durationSeconds int,
    audioUrl varchar(512),
    audioKey varchar(512),
    guestName varchar(200),
    guestTitle varchar(200),
    guestCompany varchar(200),
    transcriptUrl varchar(512),
    spotifyUrl varchar(512),
    appleUrl varchar(512),
    youtubeUrl varchar(512),
    createdAt timestamp NOT NULL DEFAULT (now()),
    updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY podcast_meta_contentItemId_unique (contentItemId)
  )`],
  [`event_meta`, `CREATE TABLE IF NOT EXISTS event_meta (
    id int AUTO_INCREMENT NOT NULL,
    contentItemId int NOT NULL,
    eventType ENUM('summit','workshop','webinar','networking','conference','other') DEFAULT 'other',
    startsAt timestamp NULL,
    endsAt timestamp NULL,
    timezone varchar(64),
    locationName varchar(320),
    locationAddress text,
    isVirtual boolean DEFAULT false,
    virtualUrl varchar(512),
    registrationUrl varchar(512),
    capacity int,
    createdAt timestamp NOT NULL DEFAULT (now()),
    updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY event_meta_contentItemId_unique (contentItemId)
  )`],
  [`magazine_issues`, `CREATE TABLE IF NOT EXISTS magazine_issues (
    id int AUTO_INCREMENT NOT NULL,
    issueNumber int NOT NULL,
    title varchar(320) NOT NULL,
    slug varchar(320) NOT NULL,
    coverImageUrl varchar(512),
    coverImageKey varchar(512),
    description text,
    pdfUrl varchar(512),
    pdfKey varchar(512),
    status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
    publishedAt timestamp NULL,
    createdAt timestamp NOT NULL DEFAULT (now()),
    updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY magazine_issues_slug_unique (slug)
  )`],
  [`newsletter_leads`, `CREATE TABLE IF NOT EXISTS newsletter_leads (
    id int AUTO_INCREMENT NOT NULL,
    email varchar(320) NOT NULL,
    firstName varchar(120),
    lastName varchar(120),
    source varchar(120) DEFAULT 'website',
    hubspotContactId varchar(64),
    syncStatus ENUM('pending','synced','failed','skipped') DEFAULT 'pending',
    lastSyncAttemptAt timestamp NULL,
    syncError text,
    isActive boolean NOT NULL DEFAULT true,
    unsubscribedAt timestamp NULL,
    createdAt timestamp NOT NULL DEFAULT (now()),
    updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY newsletter_leads_email_unique (email)
  )`],
  [`impact100_editions`, `CREATE TABLE IF NOT EXISTS impact100_editions (
    id int AUTO_INCREMENT NOT NULL,
    slug varchar(64) NOT NULL,
    label varchar(120) NOT NULL,
    status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
    publishedAt timestamp NULL,
    createdAt timestamp NOT NULL DEFAULT (now()),
    updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY impact100_editions_slug_unique (slug)
  )`],
  [`impact100_leaders`, `CREATE TABLE IF NOT EXISTS impact100_leaders (
    id int AUTO_INCREMENT NOT NULL,
    slug varchar(200) NOT NULL,
    fullName varchar(200) NOT NULL,
    title varchar(320),
    company varchar(320),
    bio text,
    profileImageUrl varchar(512),
    profileImageKey varchar(512),
    category varchar(120),
    instagramHandle varchar(120),
    tiktokHandle varchar(120),
    youtubeHandle varchar(120),
    linkedinUrl varchar(512),
    websiteUrl varchar(512),
    isHallOfFame boolean DEFAULT false,
    hallOfFameYear int,
    createdAt timestamp NOT NULL DEFAULT (now()),
    updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY impact100_leaders_slug_unique (slug)
  )`],
  [`impact100_rankings`, `CREATE TABLE IF NOT EXISTS impact100_rankings (
    id int AUTO_INCREMENT NOT NULL,
    editionId int NOT NULL,
    leaderId int NOT NULL,
    rank int NOT NULL,
    previousRank int,
    score int,
    instagramFollowers int,
    instagramEngagementRate int,
    tiktokFollowers int,
    tiktokEngagementRate int,
    youtubeSubscribers int,
    totalReach int,
    notes text,
    createdAt timestamp NOT NULL DEFAULT (now()),
    updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  )`],
  [`impact100_source_records`, `CREATE TABLE IF NOT EXISTS impact100_source_records (
    id int AUTO_INCREMENT NOT NULL,
    leaderId int NOT NULL,
    platform ENUM('instagram','tiktok','youtube','linkedin','other') NOT NULL,
    brightDataJobId varchar(128),
    brightDataDatasetId varchar(128),
    scrapedAt timestamp NULL,
    followers int,
    following int,
    posts int,
    avgLikes int,
    avgComments int,
    engagementRate int,
    rawData json,
    createdAt timestamp NOT NULL DEFAULT (now()),
    PRIMARY KEY (id)
  )`],
  [`site_settings`, `CREATE TABLE IF NOT EXISTS site_settings (
    id int AUTO_INCREMENT NOT NULL,
    \`key\` varchar(120) NOT NULL,
    value text,
    description text,
    updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY site_settings_key_unique (\`key\`)
  )`],
];

for (const [name, sql] of tables) {
  try {
    await conn.query(sql);
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
  }
}

await conn.end();
console.log('Migration complete.');
