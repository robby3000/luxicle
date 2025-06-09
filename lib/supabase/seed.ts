/* eslint-disable no-unused-vars */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, Category, Tag, Challenge, ChallengeTag } from './types';

// Ensure these environment variables are set in your .env file for this script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Role Key is not defined in environment variables.');
}

// Initialize Supabase client with service_role key for admin operations
const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

const sampleCategories: Omit<Category, 'id' | 'created_at'>[] = [
  { name: 'Music', slug: 'music', description: 'Challenges related to music, artists, albums, and genres.' },
  { name: 'Movies', slug: 'movies', description: 'Challenges about films, directors, actors, and cinema history.' },
  { name: 'Books', slug: 'books', description: 'Literary challenges: favorite books, authors, and genres.' },
  { name: 'Games', slug: 'games', description: 'Video games, board games, and all things gaming.' },
  { name: 'Food', slug: 'food', description: 'Culinary challenges, recipes, and favorite dishes.' },
  { name: 'Travel', slug: 'travel', description: 'Share your travel experiences and bucket lists.' },
  { name: 'Technology', slug: 'technology', description: 'Gadgets, software, and tech trends.' },
];

const sampleTags: Omit<Tag, 'id' | 'created_at' | 'usage_count'>[] = [
  { name: 'Indie', slug: 'indie' },
  { name: 'Rock', slug: 'rock' },
  { name: 'Electronic', slug: 'electronic' },
  { name: 'Sci-Fi', slug: 'sci-fi' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Documentary', slug: 'documentary' },
  { name: 'Classic Literature', slug: 'classic-literature' },
  { name: 'RPG', slug: 'rpg' },
  { name: 'Strategy', slug: 'strategy' },
  { name: 'Vegan', slug: 'vegan' },
  { name: 'Street Food', slug: 'street-food' },
  { name: 'Adventure Travel', slug: 'adventure-travel' },
  { name: 'AI', slug: 'ai' },
  { name: 'Web Development', slug: 'web-development' },
  { name: 'Photography', slug: 'photography' },
  { name: 'Filmmaking', slug: 'filmmaking' },
  { name: 'Writing', slug: 'writing' },
  { name: 'Productivity', slug: 'productivity' },
  { name: 'Mindfulness', slug: 'mindfulness' },
  { name: 'Fitness', slug: 'fitness' },
];

const sampleChallenges: Omit<Challenge, 'id' | 'created_at' | 'updated_at' | 'submission_count' | 'category_id' | 'tags'>[] = [
  {
    title: 'Top 10 Albums of All Time',
    description: 'Share your definitive list of the top 10 music albums ever released. Explain your choices!',
    rules: 'List 10 albums. Provide a brief reason for each. No ties allowed.',
    opens_at: new Date().toISOString(),
    is_featured: true,
    // category_id will be set after categories are inserted
    // tags will be linked after tags and challenges are inserted
  },
  {
    title: 'Favorite Sci-Fi Movie Trilogy',
    description: 'Which science fiction movie trilogy reigns supreme? Defend your pick.',
    rules: 'Pick one trilogy. Explain why it is the best.',
    opens_at: new Date().toISOString(),
    is_featured: false,
  },
  {
    title: 'Most Anticipated Video Game of Next Year',
    description: 'What upcoming video game are you most excited about and why?',
    rules: 'Focus on games expected next calendar year. Detail your expectations.',
    opens_at: new Date().toISOString(),
    is_featured: true,
  },
];

const sampleUsers: Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'onboarding_completed'>[] = [
  {
    email: 'alice@example.com',
    username: 'alice_wonder',
    display_name: 'Alice W.',
    bio: 'Exploring the rabbit hole of challenges.',
  },
  {
    email: 'bob@example.com',
    username: 'bob_the_builder',
    display_name: 'Bob B.',
    bio: 'Can we fix it? Yes, we can (list it)!',
  },
  {
    email: 'charlie@example.com',
    username: 'charlie_brown',
    display_name: 'Charlie B.',
    bio: 'Good grief, another list to make.',
  },
];

async function seedDatabase() {
  console.log('Starting database seeding...');

  // Seed Categories
  console.log('Seeding categories...');
  const { data: categories, error: categoriesError } = await supabaseAdmin
    .from('categories')
    .insert(sampleCategories)
    .select();
  if (categoriesError) {
    console.error('Error seeding categories:', categoriesError.message);
  } else {
    console.log(`${categories?.length || 0} categories seeded.`);
  }

  // Seed Tags
  console.log('Seeding tags...');
  const { data: tags, error: tagsError } = await supabaseAdmin
    .from('tags')
    .insert(sampleTags)
    .select();
  if (tagsError) {
    console.error('Error seeding tags:', tagsError.message);
  } else {
    console.log(`${tags?.length || 0} tags seeded.`);
  }

  // Seed Challenges
  if (categories && categories.length > 0) {
    console.log('Seeding challenges...');
    const challengesToInsert = sampleChallenges.map((challenge, index) => ({
      ...challenge,
      // Assign a category somewhat randomly for variety, or specifically for the onboarding challenge
      category_id: challenge.title === 'Top 10 Albums of All Time' 
        ? categories.find(c => c.slug === 'music')?.id 
        : categories[index % categories.length].id,
    }));
    const { data: challenges, error: challengesError } = await supabaseAdmin
      .from('challenges')
      .insert(challengesToInsert)
      .select();
    if (challengesError) {
      console.error('Error seeding challenges:', challengesError.message);
    } else {
      console.log(`${challenges?.length || 0} challenges seeded.`);
      
      // Seed Challenge Tags (Junction Table)
      if (challenges && tags && tags.length > 0) {
        console.log('Seeding challenge_tags...');
        const challengeTagsToInsert: Omit<ChallengeTag, 'id'>[] = [];
        challenges.forEach(challenge => {
          // Assign 1-3 random tags to each challenge for variety
          const numTags = Math.floor(Math.random() * 3) + 1;
          const shuffledTags = [...tags].sort(() => 0.5 - Math.random());
          for (let i = 0; i < numTags; i++) {
            if (shuffledTags[i]) {
              challengeTagsToInsert.push({
                challenge_id: challenge.id,
                tag_id: shuffledTags[i].id,
              });
            }
          }
        });
        const { error: challengeTagsError } = await supabaseAdmin
          .from('challenge_tags')
          .insert(challengeTagsToInsert);
        if (challengeTagsError) {
          console.error('Error seeding challenge_tags:', challengeTagsError.message);
        } else {
          console.log(`${challengeTagsToInsert.length} challenge_tag relationships seeded.`);
        }
      }
    }
  }

  // Seed Users
  // Note: Seeding users this way creates them in the 'users' table but doesn't handle Supabase Auth users.
  // For full user setup with auth, you'd typically use supabase.auth.signUp() or invite users.
  // This seed is for placeholder profile data linked to potential auth users if IDs match.
  console.log('Seeding user profiles (placeholders)...');
  const { data: userProfiles, error: usersError } = await supabaseAdmin
    .from('users')
    .insert(sampleUsers.map(u => ({...u, onboarding_completed: false})))
    .select();
  if (usersError) {
    console.error('Error seeding user profiles:', usersError.message);
    // It's common for this to error if RLS is on and not allowing service key to bypass, 
    // or if users with these emails/usernames already exist from auth signups.
    // Consider upsert or more specific error handling if needed.
  } else {
    console.log(`${userProfiles?.length || 0} user profiles seeded.`);
  }

  console.log('Database seeding completed.');
}

seedDatabase()
  .then(() => console.log('Seeding script finished successfully.'))
  .catch((err) => console.error('Seeding script failed:', err));
