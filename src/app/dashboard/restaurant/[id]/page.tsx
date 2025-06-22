import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MealCard } from "@/components/meal-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data - in a real app, this would be fetched based on the [id] param
const restaurantDetails = {
  name: "Cyber Sushi",
  cuisine: "Japanese",
  rating: 4.8,
  imageUrl: "https://placehold.co/1200x400.png",
  imageHint: "sushi restaurant interior",
  isFavorited: false,
};

const menuItems = [
  { name: "Stardust Sushi", restaurantName: "Cyber Sushi", price: "19.99", imageUrl: "https://placehold.co/600x400.png", imageHint: "sushi platter" },
  { name: "Galactic Gyoza", restaurantName: "Cyber Sushi", price: "9.50", imageUrl: "https://placehold.co/600x400.png", imageHint: "futuristic dumplings" },
  { name: "Saturn Sashimi", restaurantName: "Cyber Sushi", price: "24.00", imageUrl: "https://placehold.co/600x400.png", imageHint: "sashimi slices" },
  { name: "Comet Tempura", restaurantName: "Cyber Sushi", price: "15.75", imageUrl: "https://placehold.co/600x400.png", imageHint: "shrimp tempura" },
  { name: "Quantum Quinoa Roll", restaurantName: "Cyber Sushi", price: "18.50", imageUrl: "https://placehold.co/600x400.png", imageHint: "quinoa sushi" },
  { name: "Plasma Edamame", restaurantName: "Cyber Sushi", price: "7.00", imageUrl: "https://placehold.co/600x400.png", imageHint: "glowing edamame" },
];

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
  {
    id: 3,
    author: "ChromeCritic",
    avatarUrl: "https://placehold.co/40x40.png",
    rating: 5,
    comment: "The ambiance is unmatched. Felt like I was dining in a high-end sector of Neo-Tokyo. Food was equally impressive. 10/10 would interface again.",
  },
];

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


export default function RestaurantDetailsPage({ params }: { params: { id: string } }) {
  // In a real app, you'd use params.id to fetch data for the specific restaurant
  
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
                        <Heart className={`h-5 w-5 ${restaurantDetails.isFavorited ? 'text-accent fill-accent' : ''}`} />
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
              {menuItems.map((meal) => (
                <MealCard key={meal.name} {...meal} data-ai-hint={meal.imageHint} />
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
