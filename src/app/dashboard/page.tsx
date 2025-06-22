import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MealCard } from "@/components/meal-card";
import { RestaurantCard } from "@/components/restaurant-card";
import { SearchWithSuggestions } from "@/components/search-with-suggestions";
import { Pizza, UtensilsCrossed, Leaf, GlassWater, IceCream } from "lucide-react";

const forYouMeals = [
  { name: "Chrono Chicken", restaurantName: "Time Bistro", price: "15.99", imageUrl: "https://placehold.co/600x400.png", imageHint: "futuristic chicken" },
  { name: "Void-Veggie Wrap", restaurantName: "The Green Anomaly", price: "11.50", imageUrl: "https://placehold.co/600x400.png", imageHint: "glowing wrap" },
  { name: "Meteor Meatballs", restaurantName: "Asteroid Eatery", price: "13.99", imageUrl: "https://placehold.co/600x400.png", imageHint: "space meatballs" },
];

const nearbyRestaurants = [
  { name: "Cyber Sushi", slug: "cyber-sushi", cuisine: "Japanese", rating: 4.8, imageUrl: "https://placehold.co/600x400.png", imageHint: "sushi neon" },
  { name: "Droid's Diner", slug: "droids-diner", cuisine: "American", rating: 4.5, imageUrl: "https://placehold.co/600x400.png", imageHint: "robot diner" },
  { name: "The Grid Pizzeria", slug: "the-grid-pizzeria", cuisine: "Italian", rating: 4.7, imageUrl: "https://placehold.co/600x400.png", imageHint: "tron pizza" },
  { name: "BioDome Cafe", slug: "biodome-cafe", cuisine: "Healthy", rating: 4.9, imageUrl: "https://placehold.co/600x400.png", imageHint: "organic cafe" },
];

const categories = [
  { name: "Pizza", icon: Pizza },
  { name: "Burgers", icon: UtensilsCrossed },
  { name: "Vegan", icon: Leaf },
  { name: "Drinks", icon: GlassWater },
  { name: "Desserts", icon: IceCream },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-bold tracking-tight">Welcome back, User!</h1>
        <p className="text-muted-foreground">Ready to explore the taste of tomorrow?</p>
      </header>

      <SearchWithSuggestions />

      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Button key={category.name} variant="outline" className="gap-2">
            <category.icon className="h-4 w-4" />
            {category.name}
          </Button>
        ))}
      </div>

      <section>
        <h2 className="font-headline text-2xl font-bold mb-4">For You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forYouMeals.map((meal) => (
            <MealCard key={meal.name} {...meal} data-ai-hint={meal.imageHint} />
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="font-headline text-2xl font-bold mb-4">Restaurants Near You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {nearbyRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.name} {...restaurant} data-ai-hint={restaurant.imageHint}/>
          ))}
        </div>
      </section>
    </div>
  );
}
