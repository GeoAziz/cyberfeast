
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Fish, Beef, Pizza, Leaf, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'All', icon: ChefHat, value: 'all' },
  { name: 'Japanese', icon: Fish, value: 'japanese' },
  { name: 'American', icon: Beef, value: 'american' },
  { name: 'Italian', icon: Pizza, value: 'italian' },
  { name: 'Healthy', icon: Leaf, value: 'healthy' },
];

export function DashboardControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category')?.toLowerCase() || 'all';
  const currentSortBy = searchParams.get('sortBy') || 'rating';

  const handleFilterChange = (categoryValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryValue === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryValue);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortValue);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className='space-y-4'>
        <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
            <Button
                key={category.name}
                variant={currentCategory === category.value ? 'default' : 'outline'}
                className="gap-2"
                onClick={() => handleFilterChange(category.value)}
            >
                <category.icon className="h-4 w-4" />
                {category.name}
            </Button>
            ))}
        </div>
        
        <div className="flex justify-end">
            <Select value={currentSortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="rating">Sort by Rating</SelectItem>
                <SelectItem value="name-asc">Sort by Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Sort by Name (Z-A)</SelectItem>
            </SelectContent>
            </Select>
        </div>
    </div>
  );
}
