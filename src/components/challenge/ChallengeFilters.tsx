import React from 'react';
import { Category, Tag } from '@/lib/supabase/types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BadgeCheck, Filter } from 'lucide-react';

type ChallengeFiltersProps = {
  categories: Category[];
  tags: Tag[];
  selectedCategory: string | null;
  selectedTags: string[];
  onCategoryChange: (categoryId: string | null) => void;
  onTagsChange: (tags: string[]) => void;
};

const ALL_CATEGORIES_VALUE = "__ALL_CATEGORIES__";

const ChallengeFilters: React.FC<ChallengeFiltersProps> = ({
  categories,
  tags,
  selectedCategory,
  selectedTags,
  onCategoryChange,
  onTagsChange,
}) => {
  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleClearFilters = () => {
    onCategoryChange(null);
    onTagsChange([]);
  };

  const hasActiveFilters = selectedCategory !== null || selectedTags.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="h-8 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category filter */}
        <div className="space-y-2">
          <Label htmlFor="category-filter">Category</Label>
          <Select
            value={selectedCategory === null ? ALL_CATEGORIES_VALUE : selectedCategory}
            onValueChange={(value) => onCategoryChange(value === ALL_CATEGORIES_VALUE ? null : value)}
          >
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES_VALUE}>All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags filter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4" />
            Popular Tags
          </Label>
          <div className="space-y-2">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => handleTagToggle(tag.id)}
                />
                <Label
                  htmlFor={`tag-${tag.id}`}
                  className="text-sm cursor-pointer flex items-center justify-between w-full"
                >
                  <span>{tag.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tag.usage_count}
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeFilters;
