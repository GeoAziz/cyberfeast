// src/app/dashboard/restaurant/[slug]/page.tsx
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MealCard } from "@/components/meal-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { adminDb } from "@/lib/firebase-server";
import { notFound } from "next/navigation";


async function getRestaurantData(slug: string) {
    const restaurantsRef = adminDb.collection('restaurants').where('slug', '==', slug).limit(1);
    const restaurantSnapshot = await restaurantsRef.get();

    if (restaurantSnapshot.empty) {
        notFound();
    }

    const restaurantDoc = restaurantSnapshot.docs[0];
    const restaurantDetails = { id: restaurantDoc.id, ...restaurantDoc.data() };

    const mealsRef = adminDb.collection(`restaurants/${restaurantDoc.id}/meals`);
    const mealsSnapshot = await mealsRef.get();
    const menuItems = mealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // For now, reviews are hardcoded
    // In a real app, you would fetch these from a 'reviews' subcollection
    const reviews = [
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

    return { restaurantDetails, menuItems, reviews };
}


const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-accent fill-accent" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  );
};


export default async function RestaurantDetailsPage({ params }: { params: { slug: string } }) {
  const { restaurantDetails, menuItems, reviews } = await getRestaurantData(params.slug);

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
                            {renderStars(Math.round(restaurantDetails.rating))}
                            <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                        </div>
                    </div>
                    <Button variant="outline" className="shrink-0 gap-2">
                        <Heart className={`h-5 w-5 ${false ? 'text-accent fill-accent' : ''}`} />
                        <span>Favorite</span>
                    </Button>
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
              {reviews.map((review) => (
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
