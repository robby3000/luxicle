import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Challenge as BasicChallenge, Category, Tag } from '@/lib/supabase/types';
import { CalendarIcon, UserIcon } from 'lucide-react';

// Define a type structure compatible with PopulatedChallenge from challenges/page.tsx
type PopulatedChallengeTagForCard = {
  tag: Tag;
};

type PopulatedChallengeForCard = BasicChallenge & {
  category: Category | null; // Allow category to be null
  tags: PopulatedChallengeTagForCard[];
};

type ChallengeCardProps = {
  challenge: PopulatedChallengeForCard;
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  // Format dates for display
  const opensAtDate = new Date(challenge.opens_at);
  const closesAtDate = challenge.closes_at ? new Date(challenge.closes_at) : null;
  
  const isActive = opensAtDate <= new Date() && 
    (!closesAtDate || closesAtDate >= new Date());
  
  const timeUntilClose = closesAtDate 
    ? formatDistanceToNow(closesAtDate, { addSuffix: true })
    : 'Ongoing';
  
  return (
    <Link href={`/challenges/${challenge.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="relative h-48 w-full">
          {challenge.cover_image_url ? (
            <Image
              src={challenge.cover_image_url}
              alt={challenge.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}
          {challenge.is_featured && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                Featured
              </Badge>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <Badge 
              variant="outline" 
              className={`${isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}
            >
              {isActive ? 'Active' : 'Closed'}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              {challenge.category && (
              <Badge variant="outline" className="mb-2">
                {challenge.category.name}
              </Badge>
            )}
              <h3 className="text-xl font-semibold line-clamp-2">{challenge.title}</h3>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground line-clamp-3 mb-3">
            {challenge.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {challenge.tags.slice(0, 3).map(({ tag }) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {challenge.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{challenge.tags.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{isActive ? `Closes ${timeUntilClose}` : 'Closed'}</span>
            </div>
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              <span>{challenge.submission_count} submissions</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ChallengeCard;
