
'use client';

import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Heart } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleFavoriteAction } from "@/app/actions";
import { cn } from "@/lib/utils";

interface RestaurantCardProps {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  imageUrl: string;
  slug: string;
  "data-ai-hint"?: string;
}

export function RestaurantCard({ id, name, cuisine, rating, imageUrl, slug, "data-ai-hint": dataAiHint }: RestaurantCardProps) {
  const { user, userData, setUserData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isFavorited = userData?.favoriteRestaurants?.includes(id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();

    if (!user) {
      toast({ variant: 'destructive', title: 'Please login to add favorites.' });
      router.push('/login');
      return;
    }
    
    startTransition(async () => {
      await toggleFavoriteAction({
        userId: user.uid,
        itemId: id,
        itemType: 'restaurant',
        isFavorited: !!isFavorited,
      });

      const newFavorites = isFavorited
        ? userData.favoriteRestaurants.filter((resId: string) => resId !== id)
        : [...(userData.favoriteRestaurants || []), id];
      
      setUserData({ ...userData, favoriteRestaurants: newFavorites });
      
      toast({
        title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
        description: `${name} has been ${isFavorited ? 'removed from' : 'added to'} your favorites.`,
      });
    });
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/20 cursor-pointer">
      <Link href={`/dashboard/restaurant/${id}`}>
        <div className="aspect-[16/10] overflow-hidden relative">
          <Image
            src={imageUrl}
            alt={name}
            width={600}
            height={375}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            data-ai-hint={dataAiHint}
          />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h3 className="font-headline text-2xl text-white font-bold">{name}</h3>
            <p className="text-sm text-gray-300">{cuisine}</p>
          </div>
          <div className="absolute top-4 left-4 bg-background/70 backdrop-blur-sm p-2 rounded-full flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span>{rating.toFixed(1)}</span>
          </div>
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              disabled={isPending}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
            >
              <Heart className={cn("h-5 w-5 transition-colors", isFavorited && "text-accent fill-accent")} />
            </Button>
          )}
        </div>
      </Link>
    </Card>
  );
}
