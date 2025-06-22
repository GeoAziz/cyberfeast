
// src/app/dashboard/restaurant/[id]/page.tsx
'use client';

import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MealCard } from "@/components/meal-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { toggleFavoriteAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useTransition } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// In a real app, reviews would be fetched from Firestore. For now, this is mock data.
const mockReviews = [
  {
    id: 1,
    author: "SynthWaveSurfer",
    avatarUrl: "https://placehold.co/40x40.png",
    rating: 5,
    comment: "Absolutely transcendent! The Stardust Sushi felt like tasting the cosmos. The holographic fish swimming by the table was a nice touch. A must-visit!",
  },
  {
    id: 2,
    author: "GlitchGourmet",
    avatarUrl: "https://placehold.co/40x40.png",
    rating: 4,
    comment: "Solid spot. The Galactic Gyoza was perfectly crisp. The service was a bit slow, probably a server bot running on old firmware. Still, I'd come back.",
  },
];

const renderStars = (rating: number) => {
  const roundedRating = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < roundedRating ? "text-accent fill-accent" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  );
};

export default function RestaurantDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, userData, setUserData, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const [restaurantDetails, setRestaurantDetails] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRestaurantData = async (id: string) => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const restaurantRef = doc(db, 'restaurants', id);
        const restaurantSnapshot = await getDoc(restaurantRef);

        if (!restaurantSnapshot.exists()) {
          setError("Restaurant not found.");
          return;
        }

        const details = { id: restaurantSnapshot.id, ...restaurantSnapshot.data() };
        setRestaurantDetails(details);

        const mealsRef = collection(db, `restaurants/${restaurantSnapshot.id}/meals`);
        const mealsSnapshot = await getDocs(mealsRef);
        const menu = mealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenuItems(menu);

      } catch (err) {
        console.error(err);
        setError("Failed to load restaurant data.");
      } finally {
        setLoading(false);
      }
    }
    getRestaurantData(params.id);
  }, [params.id]);
  
  const isFavorited = userData?.favoriteRestaurants?.includes(restaurantDetails?.id);

  const handleToggleFavorite = () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Please login to add favorites.' });
      router.push('/login');
      return;
    }
    startTransition(async () => {
      await toggleFavoriteAction({
        userId: user.uid,
        itemId: restaurantDetails.id,
        itemType: 'restaurant',
        isFavorited: !!isFavorited,
      });

      // Optimistic update
      const newFavorites = isFavorited
        ? userData.favoriteRestaurants.filter((id: string) => id !== restaurantDetails.id)
        : [...(userData.favoriteRestaurants || []), restaurantDetails.id];
      
      setUserData({ ...userData, favoriteRestaurants: newFavorites });
      
      toast({
        title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
        description: `${restaurantDetails.name} has been ${isFavorited ? 'removed from' : 'added to'} your favorites.`,
      });
    });
  };

  if (loading || authLoading) {
    // Basic skeleton loader
    return <div className="space-y-8">
      <header className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
         <Skeleton className="w-full h-64 md:h-80" />
      </header>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative">
        <Card className="p-6">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-4 w-1/4 mt-2" />
            <Skeleton className="h-6 w-1/3 mt-2" />
        </Card>
      </div>
    </div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <h2 className="text-2xl font-bold text-destructive">Oops!</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">Back to Dashboard</Button>
      </div>
    );
  }

  if (!restaurantDetails) {
    return null; // Should be covered by loading and error states
  }
  
  return (
    <div className="space-y-8">
      <header className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
        <div className="w-full h-64 md:h-80 relative">
          <Image
            src={restaurantDetails.imageUrl}
            alt={restaurantDetails.name}
            fill
            className="object-cover"
            data-ai-hint={restaurantDetails.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative">
            <Card className="bg-card/80 backdrop-blur-sm p-6">
                 <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="font-headline text-4xl font-bold">{restaurantDetails.name}</h1>
                        <p className="text-muted-foreground">{restaurantDetails.cuisine}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{restaurantDetails.rating.toFixed(1)}</Badge>
                            {renderStars(restaurantDetails.rating)}
                            <span className="text-sm text-muted-foreground">({mockReviews.length} reviews)</span>
                        </div>
                    </div>
                    {user && (
                      <Button variant="outline" className="shrink-0 gap-2" onClick={handleToggleFavorite} disabled={isPending}>
                          <Heart className={cn(`h-5 w-5`, isFavorited && 'text-accent fill-accent')} />
                          <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
                      </Button>
                    )}
                </div>
            </Card>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-96">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="menu" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {menuItems.map((meal: any) => (
                <MealCard key={meal.id} {...meal} data-ai-hint={meal.imageHint} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {mockReviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage src={review.avatarUrl} alt={review.author} />
                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold font-headline">{review.author}</p>
                            {renderStars(review.rating)}
                        </div>
                        <p className="text-muted-foreground mt-2">{review.comment}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
