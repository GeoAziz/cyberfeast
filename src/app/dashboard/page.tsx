// src/app/dashboard/page.tsx

import { adminDb } from "@/lib/firebase-server";
import { Button } from "@/components/ui/button";
import { MealCard } from "@/components/meal-card";
import { RestaurantCard } from "@/components/restaurant-card";
import { SearchWithSuggestions } from "@/components/search-with-suggestions";
import { Pizza, UtensilsCrossed, Leaf, GlassWater, IceCream } from "lucide-react";
import { collection, getDocs, limit, query } from "firebase/firestore";

async function getDashboardData() {
    const restaurantsRef = adminDb.collection('restaurants');
    const restaurantsSnapshot = await restaurantsRef.get();
    const nearbyRestaurants = restaurantsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    // For simplicity, "For You" meals are taken from the first restaurant's menu
    let forYouMeals: any[] = [];
    if (restaurantsSnapshot.docs.length > 0) {
        const firstRestaurantId = restaurantsSnapshot.docs[0].id;
        const mealsRef = adminDb.collection(`restaurants/${firstRestaurantId}/meals`).limit(3);
        const mealsSnapshot = await mealsRef.get();
        forYouMeals = mealsSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
    }
    
    return { nearbyRestaurants, forYouMeals };
}

const categories = [
  { name: "Pizza", icon: Pizza },
  { name: "Burgers", icon: UtensilsCrossed },
  { name: "Vegan", icon: Leaf },
  { name: "Drinks", icon: GlassWater },
  { name: "Desserts", icon: IceCream },
];

export default async function DashboardPage() {
  const { nearbyRestaurants, forYouMeals } = await getDashboardData();
  
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-bold tracking-tight">Welcome back!</h1>
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
          {forYouMeals.map((meal: any) => (
            <MealCard key={meal.id} {...meal} data-ai-hint={meal.imageHint} />
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="font-headline text-2xl font-bold mb-4">Restaurants Near You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {nearbyRestaurants.map((restaurant: any) => (
            <RestaurantCard key={restaurant.id} {...restaurant} data-ai-hint={restaurant.imageHint}/>
          ))}
        </div>
      </section>
    </div>
  );
}
