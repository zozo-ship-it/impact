import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openId TEXT NOT NULL UNIQUE,
    name TEXT,
    email TEXT,
    loginMethod TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    lastSignedIn TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS creators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    handle TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL DEFAULT 'instagram',
    niche TEXT,
    followerCount INTEGER NOT NULL DEFAULT 0,
    weeklyGrowthRate REAL DEFAULT 0,
    postingFrequency REAL DEFAULT 0,
    averageViews INTEGER DEFAULT 0,
    engagementRate REAL DEFAULT 0,
    bio TEXT,
    impactScore INTEGER DEFAULT 0,
    topFormat TEXT,
    avatarUrl TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    creatorId INTEGER NOT NULL,
    creatorHandle TEXT NOT NULL,
    title TEXT NOT NULL,
    format TEXT NOT NULL,
    niche TEXT,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    comments INTEGER NOT NULL DEFAULT 0,
    engagementRate REAL DEFAULT 0,
    followerCountAtPosting INTEGER DEFAULT 0,
    caption TEXT,
    hashtags TEXT,
    impactScore INTEGER DEFAULT 0,
    hookType TEXT,
    contentStructure TEXT,
    pacing TEXT,
    length TEXT,
    audioStrategy TEXT,
    visualStyle TEXT,
    ctaStrategy TEXT,
    thumbnailUrl TEXT,
    hookStrength TEXT,
    hookAnalysis TEXT,
    transcript TEXT,
    keyMessages TEXT,
    targetAudience TEXT,
    emotionalTone TEXT,
    hookScore INTEGER,
    structureScore INTEGER,
    ctaScore INTEGER,
    visualScore INTEGER,
    overallQualityScore INTEGER,
    ctaPresence INTEGER,
    postedAt TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS blueprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    format TEXT NOT NULL,
    description TEXT,
    hookType TEXT,
    structure TEXT,
    pacing TEXT,
    length TEXT,
    audioStrategy TEXT,
    visualStyle TEXT,
    ctaStrategy TEXT,
    usageCount INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    sourcePostId INTEGER,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS userProfiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    instagramHandle TEXT NOT NULL,
    followerCount INTEGER DEFAULT 0,
    weeklyGrowthRate REAL DEFAULT 0,
    postingFrequency REAL DEFAULT 0,
    averageViews INTEGER DEFAULT 0,
    engagementRate REAL DEFAULT 0,
    bio TEXT,
    impactScore INTEGER DEFAULT 0,
    topFormat TEXT,
    niche TEXT,
    diagnostics TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Clear existing data
db.exec('DELETE FROM posts');
db.exec('DELETE FROM creators');
db.exec('DELETE FROM blueprints');
db.exec('DELETE FROM userProfiles');

// Seed Creators
const insertCreator = db.prepare(
  'INSERT INTO creators (handle, platform, niche, followerCount, weeklyGrowthRate, postingFrequency, averageViews, engagementRate, bio, impactScore, topFormat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

const creatorsData = [
  ['@alexfitlife', 'instagram', 'Fitness', 285000, 2.8, 5.2, 142000, 6.4, 'Certified PT | Helping you build muscle & confidence | DM for coaching', 87, 'reel'],
  ['@sarahcooks', 'instagram', 'Food & Cooking', 520000, 1.9, 6.8, 310000, 5.1, 'Recipe developer & food photographer | NYT featured | New cookbook out now', 91, 'carousel'],
  ['@nomadnikki', 'instagram', 'Travel', 178000, 3.5, 4.1, 95000, 7.2, 'Full-time traveler | 67 countries | Budget travel tips that actually work', 82, 'reel'],
  ['@techwithtom', 'instagram', 'Tech & Productivity', 410000, 2.1, 7.0, 225000, 4.8, 'Making tech simple | App reviews & productivity hacks | Former Google engineer', 89, 'reel'],
  ['@mindfulmaya', 'instagram', 'Wellness & Mindset', 145000, 4.2, 3.5, 78000, 8.1, 'Therapist turned creator | Evidence-based mental health tips | Free anxiety guide in bio', 84, 'carousel'],
  ['@designbyjake', 'instagram', 'Design & Branding', 92000, 5.1, 4.8, 67000, 9.3, 'Brand designer | Turning startups into iconic brands | Portfolio in link', 93, 'image'],
  ['@moneywithlisa', 'instagram', 'Finance', 340000, 1.7, 5.5, 180000, 5.6, 'CFA | Personal finance made simple | Helped 10K+ people invest smarter', 86, 'carousel'],
  ['@coachdaniel', 'instagram', 'Business & Coaching', 215000, 2.4, 4.0, 120000, 6.0, 'Business coach | $2M+ generated for clients | Free strategy call in bio', 80, 'reel'],
];

for (const c of creatorsData) {
  insertCreator.run(...c);
}

// Get creator IDs
const creatorMap = {};
const rows = db.prepare('SELECT id, handle FROM creators').all();
for (const r of rows) { creatorMap[r.handle] = r.id; }

// Seed Posts
const insertPost = db.prepare(
  'INSERT INTO posts (url, creatorId, creatorHandle, title, format, niche, views, likes, comments, engagementRate, followerCountAtPosting, caption, hashtags, impactScore, hookType, contentStructure, pacing, length, audioStrategy, visualStyle, ctaStrategy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

const postsData = [
  { url: 'https://instagram.com/p/mock1', creatorHandle: '@alexfitlife', title: "I gained 15lbs of muscle in 6 months — here's the exact split", format: 'reel', niche: 'Fitness', views: 890000, likes: 72000, comments: 3400, engagementRate: 8.5, followerCountAtPosting: 270000, caption: 'The push/pull/legs split that changed everything for me...', hashtags: '#fitness #muscle #gym #transformation', impactScore: 92, hookType: 'Transformation Reveal', contentStructure: 'Before/After > Method Breakdown > Results Timeline > CTA', pacing: 'Fast-cut with text overlays', length: '45 seconds', audioStrategy: 'Trending audio with voiceover', visualStyle: 'High-contrast gym footage with bold text overlays', ctaStrategy: 'Save for later + follow for part 2' },
  { url: 'https://instagram.com/p/mock2', creatorHandle: '@sarahcooks', title: '5 meals I meal prep every Sunday (under $30)', format: 'carousel', niche: 'Food & Cooking', views: 1200000, likes: 95000, comments: 4100, engagementRate: 8.3, followerCountAtPosting: 500000, caption: "Budget meal prep doesn't have to be boring...", hashtags: '#mealprep #budgetmeals #cooking #foodie', impactScore: 88, hookType: 'Listicle with Constraint', contentStructure: '5-slide carousel: Cover > Meal 1-4 > Shopping List', pacing: 'One meal per slide, consistent layout', length: '6 slides', audioStrategy: 'N/A (carousel)', visualStyle: 'Bright, overhead food photography with clean typography', ctaStrategy: 'Save this for Sunday + link in bio for full recipes' },
  { url: 'https://instagram.com/p/mock3', creatorHandle: '@nomadnikki', title: 'I spent $47/day in Japan for 3 weeks — full breakdown', format: 'reel', niche: 'Travel', views: 650000, likes: 48000, comments: 2800, engagementRate: 7.8, followerCountAtPosting: 165000, caption: 'Japan on a budget is absolutely possible...', hashtags: '#japan #budgettravel #traveltips #backpacking', impactScore: 94, hookType: 'Specific Number Hook', contentStructure: 'Hook > Daily Budget Breakdown > Tips > Surprise Savings > CTA', pacing: 'Medium pace with b-roll transitions', length: '58 seconds', audioStrategy: 'Lo-fi background + clear voiceover', visualStyle: 'Cinematic travel footage with animated number overlays', ctaStrategy: 'Comment "JAPAN" for my full budget spreadsheet' },
  { url: 'https://instagram.com/p/mock4', creatorHandle: '@techwithtom', title: 'Delete these 5 apps right now (your phone is spying on you)', format: 'reel', niche: 'Tech & Productivity', views: 2100000, likes: 180000, comments: 8900, engagementRate: 9.0, followerCountAtPosting: 395000, caption: 'These apps are collecting way more data than you think...', hashtags: '#privacy #tech #apps #security', impactScore: 96, hookType: 'Fear/Urgency Hook', contentStructure: 'Alarming Hook > App 1-5 with Evidence > Alternative Apps > CTA', pacing: 'Rapid-fire with screen recordings', length: '38 seconds', audioStrategy: 'Dramatic sound effects + direct-to-camera', visualStyle: 'Screen recordings with red highlight circles and warning graphics', ctaStrategy: 'Share with someone who needs to see this + follow for more' },
  { url: 'https://instagram.com/p/mock5', creatorHandle: '@mindfulmaya', title: 'The 3-3-3 rule for anxiety that actually works', format: 'carousel', niche: 'Wellness & Mindset', views: 420000, likes: 38000, comments: 1900, engagementRate: 9.5, followerCountAtPosting: 130000, caption: 'As a therapist, this is the technique I recommend most...', hashtags: '#anxiety #mentalhealth #therapy #wellness', impactScore: 91, hookType: 'Authority + Promise', contentStructure: '7-slide carousel: Hook > What is 3-3-3 > Step 1-3 > Science > Save Slide', pacing: 'One concept per slide, progressive disclosure', length: '7 slides', audioStrategy: 'N/A (carousel)', visualStyle: 'Soft gradients, calming colors, handwritten-style accents', ctaStrategy: 'Save this for your next anxious moment + free guide in bio' },
  { url: 'https://instagram.com/p/mock6', creatorHandle: '@designbyjake', title: "I redesigned the Uber logo in 15 minutes — here's why it works", format: 'image', niche: 'Design & Branding', views: 310000, likes: 29000, comments: 1500, engagementRate: 9.8, followerCountAtPosting: 85000, caption: "Good design isn't about complexity, it's about clarity...", hashtags: '#design #branding #logo #creative', impactScore: 95, hookType: 'Challenge/Demonstration', contentStructure: 'Side-by-side comparison > Design principles applied > Final reveal', pacing: 'Single impactful image with detailed caption', length: '1 image', audioStrategy: 'N/A (image)', visualStyle: 'Clean mockup with split-screen before/after on dark background', ctaStrategy: 'What brand should I redesign next? Comment below' },
  { url: 'https://instagram.com/p/mock7', creatorHandle: '@moneywithlisa', title: "The 50/30/20 rule is dead — here's what replaced it", format: 'carousel', niche: 'Finance', views: 780000, likes: 62000, comments: 3200, engagementRate: 8.4, followerCountAtPosting: 325000, caption: 'The budgeting rule everyone follows is outdated...', hashtags: '#personalfinance #budgeting #money #investing', impactScore: 87, hookType: 'Contrarian Take', contentStructure: '8-slide carousel: Controversial Hook > Why 50/30/20 Fails > New Framework > Examples > CTA', pacing: 'Data-driven slides with progressive argument', length: '8 slides', audioStrategy: 'N/A (carousel)', visualStyle: 'Dark background with neon accent charts and clean data visualization', ctaStrategy: 'Save + share with someone who needs to hear this' },
  { url: 'https://instagram.com/p/mock8', creatorHandle: '@coachdaniel', title: 'Stop saying "I help people" — say this instead', format: 'reel', niche: 'Business & Coaching', views: 540000, likes: 41000, comments: 2100, engagementRate: 8.0, followerCountAtPosting: 200000, caption: 'Your positioning statement is killing your business...', hashtags: '#business #coaching #marketing #entrepreneur', impactScore: 83, hookType: 'Pattern Interrupt + Correction', contentStructure: 'Wrong Way > Why It Fails > Framework > Examples > CTA', pacing: 'Direct-to-camera with text reinforcement', length: '42 seconds', audioStrategy: 'No music, direct speech for authority', visualStyle: 'Clean studio setup with bold text overlays on key phrases', ctaStrategy: 'DM me "POSITION" for my free positioning template' },
  { url: 'https://instagram.com/p/mock9', creatorHandle: '@alexfitlife', title: 'Why your protein shake is making you fat', format: 'reel', niche: 'Fitness', views: 1400000, likes: 110000, comments: 5600, engagementRate: 8.3, followerCountAtPosting: 280000, caption: 'Most people are making this mistake with their post-workout shake...', hashtags: '#protein #fitness #nutrition #gym', impactScore: 90, hookType: 'Contrarian/Shock Hook', contentStructure: 'Shocking Claim > Common Mistakes > Correct Method > Results > CTA', pacing: 'Quick cuts between kitchen and gym footage', length: '52 seconds', audioStrategy: 'Upbeat background + authoritative voiceover', visualStyle: 'Split-screen comparison shots with calorie counter overlay', ctaStrategy: 'Follow for more nutrition myths debunked' },
  { url: 'https://instagram.com/p/mock10', creatorHandle: '@sarahcooks', title: 'The one-pan dinner that went viral (2M views recipe)', format: 'reel', niche: 'Food & Cooking', views: 2400000, likes: 195000, comments: 7200, engagementRate: 8.4, followerCountAtPosting: 510000, caption: 'This is the recipe that changed my account forever...', hashtags: '#recipe #onepan #dinner #viral', impactScore: 85, hookType: 'Social Proof Hook', contentStructure: 'Viral Claim > Ingredients > Quick Process > Final Reveal > CTA', pacing: 'Fast overhead cooking shots with ASMR elements', length: '35 seconds', audioStrategy: 'ASMR cooking sounds + trending audio', visualStyle: 'Overhead bright kitchen shots with ingredient callouts', ctaStrategy: 'Save this for dinner tonight + full recipe in bio' },
];

for (const p of postsData) {
  insertPost.run(p.url, creatorMap[p.creatorHandle], p.creatorHandle, p.title, p.format, p.niche, p.views, p.likes, p.comments, p.engagementRate, p.followerCountAtPosting, p.caption, p.hashtags, p.impactScore, p.hookType, p.contentStructure, p.pacing, p.length, p.audioStrategy, p.visualStyle, p.ctaStrategy);
}

// Seed Blueprints
const insertBlueprint = db.prepare(
  'INSERT INTO blueprints (name, format, description, hookType, structure, pacing, length, audioStrategy, visualStyle, ctaStrategy, usageCount, score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

const blueprintsData = [
  ['Transformation Reveal', 'reel', 'Show dramatic before/after results with a clear method breakdown.', 'Before/After Reveal', 'Hook > Before State > Process Montage > After Reveal > Method Summary > CTA', 'Fast-cut, 3-5 second clips', '30-60 seconds', 'Trending audio or dramatic sound design', 'High contrast, split-screen comparisons', 'Save for later + Follow for part 2', 45, 92],
  ['Budget Breakdown', 'carousel', 'Break down exact costs for an experience or lifestyle.', 'Specific Number Hook', 'Cover with total > Category breakdowns > Surprise savings > Tips > Save slide', 'One category per slide', '6-8 slides', 'N/A', 'Clean data visualization with accent colors', 'Comment keyword for detailed spreadsheet', 38, 94],
  ['Myth Buster', 'reel', 'Challenge a widely-held belief with evidence.', 'Contrarian/Shock Statement', 'Shocking claim > Why people believe it > Evidence against > Truth > New approach > CTA', 'Rapid-fire with emphasis pauses', '35-50 seconds', 'No music or subtle tension-building audio', 'Direct-to-camera with bold text overlays on key claims', 'Share with someone who needs to hear this', 52, 90],
  ['Expert Framework', 'carousel', 'Present a named framework or methodology.', 'Authority + Named Method', 'Hook slide > Problem > Framework name > Step 1-3 > Example > Implementation > CTA', 'Progressive disclosure, one step per slide', '7-9 slides', 'N/A', 'Consistent branded slides with numbered steps', 'Save + DM keyword for template', 61, 91],
  ['Tool Stack Reveal', 'reel', 'Share the exact tools you use for a specific outcome.', 'Listicle with Social Proof', 'Hook > Tool 1-5 with use case > Bonus tool > Results > CTA', 'Screen recordings with quick transitions', '40-55 seconds', 'Upbeat background music', 'Screen recordings with highlight circles and tool logos', 'Follow for more tool recommendations', 33, 87],
  ['Redesign Challenge', 'image', 'Redesign something well-known to demonstrate expertise.', 'Challenge/Demonstration', 'Side-by-side original vs redesign > Design principles annotated > Final polished version', 'Single impactful image', '1 image with detailed caption', 'N/A', 'Clean mockup, dark background, split-screen', 'Comment what to redesign next', 28, 95],
  ['Day-in-the-Life', 'reel', 'Show a realistic day following a specific routine or lifestyle.', 'Curiosity Gap', 'Morning routine > Work highlights > Key habit > Evening wind-down > Results/reflection', 'Smooth transitions, natural pacing', '45-75 seconds', 'Lo-fi or ambient background', 'Aesthetic lifestyle footage with time stamps', 'Follow for daily motivation', 41, 83],
  ['Data Story', 'carousel', 'Present surprising data or research findings in a visual format.', 'Surprising Statistic', 'Shocking stat > Context > Data visualization > Implications > What to do > CTA', 'One insight per slide with charts', '6-8 slides', 'N/A', 'Dark background with neon data charts', 'Save for reference + share', 35, 88],
  ['Pattern Interrupt Correction', 'reel', 'Point out a common mistake and provide the correct approach.', 'Stop Doing This Wrong', 'Wrong way demo > Why it fails > Correct method > Side-by-side > Results > CTA', 'Direct-to-camera with demonstrations', '35-45 seconds', 'Minimal, speech-focused', 'Studio setup with bold text reinforcement', 'DM keyword for free template/guide', 47, 83],
  ['Social Proof Showcase', 'reel', 'Lead with viral metrics or testimonials to build credibility.', 'Social Proof + Curiosity', 'Viral claim/metric > Quick backstory > The content/method > Why it worked > Replication tips > CTA', 'Fast-paced with metric overlays', '30-45 seconds', 'Trending audio with voiceover', 'Metric counters, screenshot overlays, bright energy', 'Save + try this yourself', 29, 85],
];

for (const b of blueprintsData) {
  insertBlueprint.run(...b);
}

console.log('Seed data inserted successfully');
db.close();
