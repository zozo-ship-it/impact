import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

const conn = await mysql.createConnection(DATABASE_URL);

// Clear existing data
await conn.execute('DELETE FROM posts');
await conn.execute('DELETE FROM creators');
await conn.execute('DELETE FROM blueprints');
await conn.execute('DELETE FROM userProfiles');

// Seed Creators (6+)
const creatorsData = [
  ['@alexfitlife', 'instagram', 'Fitness', 285000, 2.8, 5.2, 142000, 6.4, 'Certified PT | Helping you build muscle & confidence | DM for coaching 💪', 87, 'reel'],
  ['@sarahcooks', 'instagram', 'Food & Cooking', 520000, 1.9, 6.8, 310000, 5.1, 'Recipe developer & food photographer | NYT featured | New cookbook out now 📖', 91, 'carousel'],
  ['@nomadnikki', 'instagram', 'Travel', 178000, 3.5, 4.1, 95000, 7.2, 'Full-time traveler | 67 countries | Budget travel tips that actually work ✈️', 82, 'reel'],
  ['@techwithtom', 'instagram', 'Tech & Productivity', 410000, 2.1, 7.0, 225000, 4.8, 'Making tech simple | App reviews & productivity hacks | Former Google engineer', 89, 'reel'],
  ['@mindfulmaya', 'instagram', 'Wellness & Mindset', 145000, 4.2, 3.5, 78000, 8.1, 'Therapist turned creator | Evidence-based mental health tips | Free anxiety guide in bio', 84, 'carousel'],
  ['@designbyjake', 'instagram', 'Design & Branding', 92000, 5.1, 4.8, 67000, 9.3, 'Brand designer | Turning startups into iconic brands | Portfolio in link', 93, 'image'],
  ['@moneywithlisa', 'instagram', 'Finance', 340000, 1.7, 5.5, 180000, 5.6, 'CFA | Personal finance made simple | Helped 10K+ people invest smarter', 86, 'carousel'],
  ['@coachdaniel', 'instagram', 'Business & Coaching', 215000, 2.4, 4.0, 120000, 6.0, 'Business coach | $2M+ generated for clients | Free strategy call in bio', 80, 'reel'],
];

for (const c of creatorsData) {
  await conn.execute(
    `INSERT INTO creators (handle, platform, niche, followerCount, weeklyGrowthRate, postingFrequency, averageViews, engagementRate, bio, impactScore, topFormat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    c
  );
}

// Get creator IDs
const [creatorRows] = await conn.execute('SELECT id, handle FROM creators');
const creatorMap = {};
for (const r of creatorRows) { creatorMap[r.handle] = r.id; }

// Seed Posts (10 posts)
const postsData = [
  {
    url: 'https://instagram.com/p/mock1', creatorHandle: '@alexfitlife', title: 'I gained 15lbs of muscle in 6 months — here\'s the exact split',
    format: 'reel', niche: 'Fitness', views: 890000, likes: 72000, comments: 3400, engagementRate: 8.5, followerCountAtPosting: 270000,
    caption: 'The push/pull/legs split that changed everything for me...', hashtags: '#fitness #muscle #gym #transformation',
    impactScore: 92, hookType: 'Transformation Reveal', contentStructure: 'Before/After → Method Breakdown → Results Timeline → CTA',
    pacing: 'Fast-cut with text overlays', length: '45 seconds', audioStrategy: 'Trending audio with voiceover', visualStyle: 'High-contrast gym footage with bold text overlays',
    ctaStrategy: 'Save for later + follow for part 2'
  },
  {
    url: 'https://instagram.com/p/mock2', creatorHandle: '@sarahcooks', title: '5 meals I meal prep every Sunday (under $30)',
    format: 'carousel', niche: 'Food & Cooking', views: 1200000, likes: 95000, comments: 4100, engagementRate: 8.3, followerCountAtPosting: 500000,
    caption: 'Budget meal prep doesn\'t have to be boring...', hashtags: '#mealprep #budgetmeals #cooking #foodie',
    impactScore: 88, hookType: 'Listicle with Constraint', contentStructure: '5-slide carousel: Cover → Meal 1-4 → Shopping List',
    pacing: 'One meal per slide, consistent layout', length: '6 slides', audioStrategy: 'N/A (carousel)', visualStyle: 'Bright, overhead food photography with clean typography',
    ctaStrategy: 'Save this for Sunday + link in bio for full recipes'
  },
  {
    url: 'https://instagram.com/p/mock3', creatorHandle: '@nomadnikki', title: 'I spent $47/day in Japan for 3 weeks — full breakdown',
    format: 'reel', niche: 'Travel', views: 650000, likes: 48000, comments: 2800, engagementRate: 7.8, followerCountAtPosting: 165000,
    caption: 'Japan on a budget is absolutely possible...', hashtags: '#japan #budgettravel #traveltips #backpacking',
    impactScore: 94, hookType: 'Specific Number Hook', contentStructure: 'Hook → Daily Budget Breakdown → Tips → Surprise Savings → CTA',
    pacing: 'Medium pace with b-roll transitions', length: '58 seconds', audioStrategy: 'Lo-fi background + clear voiceover', visualStyle: 'Cinematic travel footage with animated number overlays',
    ctaStrategy: 'Comment "JAPAN" for my full budget spreadsheet'
  },
  {
    url: 'https://instagram.com/p/mock4', creatorHandle: '@techwithtom', title: 'Delete these 5 apps right now (your phone is spying on you)',
    format: 'reel', niche: 'Tech & Productivity', views: 2100000, likes: 180000, comments: 8900, engagementRate: 9.0, followerCountAtPosting: 395000,
    caption: 'These apps are collecting way more data than you think...', hashtags: '#privacy #tech #apps #security',
    impactScore: 96, hookType: 'Fear/Urgency Hook', contentStructure: 'Alarming Hook → App 1-5 with Evidence → Alternative Apps → CTA',
    pacing: 'Rapid-fire with screen recordings', length: '38 seconds', audioStrategy: 'Dramatic sound effects + direct-to-camera', visualStyle: 'Screen recordings with red highlight circles and warning graphics',
    ctaStrategy: 'Share with someone who needs to see this + follow for more'
  },
  {
    url: 'https://instagram.com/p/mock5', creatorHandle: '@mindfulmaya', title: 'The 3-3-3 rule for anxiety that actually works',
    format: 'carousel', niche: 'Wellness & Mindset', views: 420000, likes: 38000, comments: 1900, engagementRate: 9.5, followerCountAtPosting: 130000,
    caption: 'As a therapist, this is the technique I recommend most...', hashtags: '#anxiety #mentalhealth #therapy #wellness',
    impactScore: 91, hookType: 'Authority + Promise', contentStructure: '7-slide carousel: Hook → What is 3-3-3 → Step 1-3 → Science → Save Slide',
    pacing: 'One concept per slide, progressive disclosure', length: '7 slides', audioStrategy: 'N/A (carousel)', visualStyle: 'Soft gradients, calming colors, handwritten-style accents',
    ctaStrategy: 'Save this for your next anxious moment + free guide in bio'
  },
  {
    url: 'https://instagram.com/p/mock6', creatorHandle: '@designbyjake', title: 'I redesigned the Uber logo in 15 minutes — here\'s why it works',
    format: 'image', niche: 'Design & Branding', views: 310000, likes: 29000, comments: 1500, engagementRate: 9.8, followerCountAtPosting: 85000,
    caption: 'Good design isn\'t about complexity, it\'s about clarity...', hashtags: '#design #branding #logo #creative',
    impactScore: 95, hookType: 'Challenge/Demonstration', contentStructure: 'Side-by-side comparison → Design principles applied → Final reveal',
    pacing: 'Single impactful image with detailed caption', length: '1 image', audioStrategy: 'N/A (image)', visualStyle: 'Clean mockup with split-screen before/after on dark background',
    ctaStrategy: 'What brand should I redesign next? Comment below'
  },
  {
    url: 'https://instagram.com/p/mock7', creatorHandle: '@moneywithlisa', title: 'The 50/30/20 rule is dead — here\'s what replaced it',
    format: 'carousel', niche: 'Finance', views: 780000, likes: 62000, comments: 3200, engagementRate: 8.4, followerCountAtPosting: 325000,
    caption: 'The budgeting rule everyone follows is outdated...', hashtags: '#personalfinance #budgeting #money #investing',
    impactScore: 87, hookType: 'Contrarian Take', contentStructure: '8-slide carousel: Controversial Hook → Why 50/30/20 Fails → New Framework → Examples → CTA',
    pacing: 'Data-driven slides with progressive argument', length: '8 slides', audioStrategy: 'N/A (carousel)', visualStyle: 'Dark background with neon accent charts and clean data visualization',
    ctaStrategy: 'Save + share with someone who needs to hear this'
  },
  {
    url: 'https://instagram.com/p/mock8', creatorHandle: '@coachdaniel', title: 'Stop saying "I help people" — say this instead',
    format: 'reel', niche: 'Business & Coaching', views: 540000, likes: 41000, comments: 2100, engagementRate: 8.0, followerCountAtPosting: 200000,
    caption: 'Your positioning statement is killing your business...', hashtags: '#business #coaching #marketing #entrepreneur',
    impactScore: 83, hookType: 'Pattern Interrupt + Correction', contentStructure: 'Wrong Way → Why It Fails → Framework → Examples → CTA',
    pacing: 'Direct-to-camera with text reinforcement', length: '42 seconds', audioStrategy: 'No music, direct speech for authority', visualStyle: 'Clean studio setup with bold text overlays on key phrases',
    ctaStrategy: 'DM me "POSITION" for my free positioning template'
  },
  {
    url: 'https://instagram.com/p/mock9', creatorHandle: '@alexfitlife', title: 'Why your protein shake is making you fat',
    format: 'reel', niche: 'Fitness', views: 1400000, likes: 110000, comments: 5600, engagementRate: 8.3, followerCountAtPosting: 280000,
    caption: 'Most people are making this mistake with their post-workout shake...', hashtags: '#protein #fitness #nutrition #gym',
    impactScore: 90, hookType: 'Contrarian/Shock Hook', contentStructure: 'Shocking Claim → Common Mistakes → Correct Method → Results → CTA',
    pacing: 'Quick cuts between kitchen and gym footage', length: '52 seconds', audioStrategy: 'Upbeat background + authoritative voiceover', visualStyle: 'Split-screen comparison shots with calorie counter overlay',
    ctaStrategy: 'Follow for more nutrition myths debunked'
  },
  {
    url: 'https://instagram.com/p/mock10', creatorHandle: '@sarahcooks', title: 'The one-pan dinner that went viral (2M views recipe)',
    format: 'reel', niche: 'Food & Cooking', views: 2400000, likes: 195000, comments: 7200, engagementRate: 8.4, followerCountAtPosting: 510000,
    caption: 'This is the recipe that changed my account forever...', hashtags: '#recipe #onepan #dinner #viral',
    impactScore: 85, hookType: 'Social Proof Hook', contentStructure: 'Viral Claim → Ingredients → Quick Process → Final Reveal → CTA',
    pacing: 'Fast overhead cooking shots with ASMR elements', length: '35 seconds', audioStrategy: 'ASMR cooking sounds + trending audio', visualStyle: 'Overhead bright kitchen shots with ingredient callouts',
    ctaStrategy: 'Save this for dinner tonight + full recipe in bio'
  },
];

for (const p of postsData) {
  await conn.execute(
    `INSERT INTO posts (url, creatorId, creatorHandle, title, format, niche, views, likes, comments, engagementRate, followerCountAtPosting, caption, hashtags, impactScore, hookType, contentStructure, pacing, length, audioStrategy, visualStyle, ctaStrategy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [p.url, creatorMap[p.creatorHandle], p.creatorHandle, p.title, p.format, p.niche, p.views, p.likes, p.comments, p.engagementRate, p.followerCountAtPosting, p.caption, p.hashtags, p.impactScore, p.hookType, p.contentStructure, p.pacing, p.length, p.audioStrategy, p.visualStyle, p.ctaStrategy]
  );
}

// Seed Blueprints (10 blueprints)
const blueprintsData = [
  ['Transformation Reveal', 'reel', 'Show dramatic before/after results with a clear method breakdown. Works best for fitness, skills, and makeover content.', 'Before/After Reveal', 'Hook → Before State → Process Montage → After Reveal → Method Summary → CTA', 'Fast-cut, 3-5 second clips', '30-60 seconds', 'Trending audio or dramatic sound design', 'High contrast, split-screen comparisons', 'Save for later + Follow for part 2', 45, 92],
  ['Budget Breakdown', 'carousel', 'Break down exact costs for an experience or lifestyle. Transparency builds trust and drives saves.', 'Specific Number Hook', 'Cover with total → Category breakdowns → Surprise savings → Tips → Save slide', 'One category per slide', '6-8 slides', 'N/A', 'Clean data visualization with accent colors', 'Comment keyword for detailed spreadsheet', 38, 94],
  ['Myth Buster', 'reel', 'Challenge a widely-held belief with evidence. Contrarian takes drive comments and shares.', 'Contrarian/Shock Statement', 'Shocking claim → Why people believe it → Evidence against → Truth → New approach → CTA', 'Rapid-fire with emphasis pauses', '35-50 seconds', 'No music or subtle tension-building audio', 'Direct-to-camera with bold text overlays on key claims', 'Share with someone who needs to hear this', 52, 90],
  ['Expert Framework', 'carousel', 'Present a named framework or methodology. Numbered systems feel actionable and get saved.', 'Authority + Named Method', 'Hook slide → Problem → Framework name → Step 1-3 → Example → Implementation → CTA', 'Progressive disclosure, one step per slide', '7-9 slides', 'N/A', 'Consistent branded slides with numbered steps', 'Save + DM keyword for template', 61, 91],
  ['Tool Stack Reveal', 'reel', 'Share the exact tools you use for a specific outcome. People love copying proven systems.', 'Listicle with Social Proof', 'Hook → Tool 1-5 with use case → Bonus tool → Results → CTA', 'Screen recordings with quick transitions', '40-55 seconds', 'Upbeat background music', 'Screen recordings with highlight circles and tool logos', 'Follow for more tool recommendations', 33, 87],
  ['Redesign Challenge', 'image', 'Redesign something well-known to demonstrate expertise. Side-by-side comparisons drive engagement.', 'Challenge/Demonstration', 'Side-by-side original vs redesign → Design principles annotated → Final polished version', 'Single impactful image', '1 image with detailed caption', 'N/A', 'Clean mockup, dark background, split-screen', 'Comment what to redesign next', 28, 95],
  ['Day-in-the-Life', 'reel', 'Show a realistic day following a specific routine or lifestyle. Aspirational but achievable content.', 'Curiosity Gap', 'Morning routine → Work highlights → Key habit → Evening wind-down → Results/reflection', 'Smooth transitions, natural pacing', '45-75 seconds', 'Lo-fi or ambient background', 'Aesthetic lifestyle footage with time stamps', 'Follow for daily motivation', 41, 83],
  ['Data Story', 'carousel', 'Present surprising data or research findings in a visual, digestible format.', 'Surprising Statistic', 'Shocking stat → Context → Data visualization → Implications → What to do → CTA', 'One insight per slide with charts', '6-8 slides', 'N/A', 'Dark background with neon data charts', 'Save for reference + share', 35, 88],
  ['Pattern Interrupt Correction', 'reel', 'Point out a common mistake and provide the correct approach. Educational authority content.', 'Stop Doing This Wrong', 'Wrong way demo → Why it fails → Correct method → Side-by-side → Results → CTA', 'Direct-to-camera with demonstrations', '35-45 seconds', 'Minimal, speech-focused', 'Studio setup with bold text reinforcement', 'DM keyword for free template/guide', 47, 83],
  ['Social Proof Showcase', 'reel', 'Lead with viral metrics or testimonials to build credibility before delivering value.', 'Social Proof + Curiosity', 'Viral claim/metric → Quick backstory → The content/method → Why it worked → Replication tips → CTA', 'Fast-paced with metric overlays', '30-45 seconds', 'Trending audio with voiceover', 'Metric counters, screenshot overlays, bright energy', 'Save + try this yourself', 29, 85],
];

for (const b of blueprintsData) {
  await conn.execute(
    `INSERT INTO blueprints (name, format, description, hookType, structure, pacing, length, audioStrategy, visualStyle, ctaStrategy, usageCount, score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    b
  );
}

console.log('✅ Seed data inserted successfully');
await conn.end();
