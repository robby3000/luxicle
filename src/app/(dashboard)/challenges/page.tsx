'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Challenge as BasicChallenge, Category, Tag } from '@/lib/supabase/types';

// Define the populated challenge type
type PopulatedChallengeTag = {
  tag: Tag; 
};

type PopulatedChallenge = BasicChallenge & {
  category: Category | null; 
  tags: PopulatedChallengeTag[];
};
import ChallengeCard from '@/components/challenge/ChallengeCard';
import ChallengeFilters from '@/components/challenge/ChallengeFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

export default function ChallengesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  
  const [challenges, setChallenges] = useState<PopulatedChallenge[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );

  // Fetch challenges, categories, and tags
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
        // Fetch popular tags
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select('*')
          .order('usage_count', { ascending: false })
          .limit(20);
          
        if (tagsError) throw tagsError;
        setTags(tagsData || []);
        
        // Build challenges query
        let query = supabase
          .from('challenges')
          .select(`
            *,
            category:categories(*),
            tags:challenge_tags(tag:tags(*))
          `)
          .order('opens_at', { ascending: false });
        
        // Apply filters
        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory);
        }
        
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }
        
        // Execute query
        const { data: challengesData, error: challengesError } = await query;
        
        if (challengesError) throw challengesError;
        
        // Filter by tags if needed
        let filteredChallenges = (challengesData as PopulatedChallenge[]) || [];
        if (selectedTags.length > 0) {
          filteredChallenges = filteredChallenges.filter(challenge => {
            const challengeTags = challenge.tags.map((t) => t.tag.id);
            return selectedTags.some(tagId => challengeTags.includes(tagId));
          });
        }
        
        setChallenges(filteredChallenges);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [supabase, searchQuery, selectedCategory, selectedTags]);

  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('query', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, selectedCategory, selectedTags]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by state changes
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Challenges</h1>
          <p className="text-muted-foreground">
            Discover and participate in creative challenges across various categories.
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="w-full md:w-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search challenges..."
              className="pl-10 w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ChallengeFilters
            categories={categories}
            tags={tags}
            selectedCategory={selectedCategory}
            selectedTags={selectedTags}
            onCategoryChange={setSelectedCategory}
            onTagsChange={setSelectedTags}
          />
        </div>
        
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No challenges found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search query.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setSelectedTags([]);
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
