
// src/app/dashboard/page.tsx

import { adminDb } from "@/lib/firebase-server";
import { MealCard } from "@/components/meal-card";
import { RestaurantCard } from "@/components/restaurant-card";
import { SearchWithSuggestions } from "@/components/search-with-suggestions";
import { DashboardControls } from "@/components/dashboard-controls";
import type { Query } from "firebase-admin/firestore";
import { ChefHat } from "lucide-react";

interface DashboardPageProps {
  searchParams: {
    category?: string;
    sortBy?: string;
  };
}

async function getDashboardData({ category, sortBy }: { category?: string; sortBy?: string }) {
    let restaurantsQuery: Query = adminDb.collection('restaurants');
    
    // Filtering
    if (category && category.toLowerCase() !== 'all') {
      const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      restaurantsQuery = restaurantsQuery.where('cuisine', '==', capitalizedCategory);
    }
    
    // Sorting
    if (sortBy === 'rating') {
        restaurantsQuery = restaurantsQuery.orderBy('rating', 'desc');
    } else if (sortBy === 'name-asc') {
        restaurantsQuery = restaurantsQuery.orderBy('name', 'asc');
    } else if (sortBy === 'name-desc') {
        restaurantsQuery = restaurantsQuery.orderBy('name', 'desc');
    } else {
        // Default sort by rating if no sort is specified or it's an unknown value
        restaurantsQuery = restaurantsQuery.orderBy('rating', 'desc');
    }
    
    const restaurantsSnapshot = await restaurantsQuery.get();
    const restaurants = restaurantsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    // Featured meals - keep it simple, not affected by filters for now
    let featuredMeals: any[] = [];
    const allRestaurantsSnapshot = await adminDb.collection('restaurants').limit(1).get();
    if (allRestaurantsSnapshot.docs.length > 0) {
        // This is simplified; in a real app you might want a "featured" flag on meals
        const firstRestaurantId = allRestaurantsSnapshot.docs[0].id;
        const mealsRef = adminDb.collection(`restaurants/${firstRestaurantId}/meals`).limit(3);
        const mealsSnapshot = await mealsRef.get();
        featuredMeals = mealsSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
    }
    
    return { restaurants, featuredMeals };
}


export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { category, sortBy } = searchParams;
  const { restaurants, featuredMeals } = await getDashboardData({ category, sortBy });
  
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">Ready to explore the taste of tomorrow?</p>
      </header>

      <SearchWithSuggestions />
      
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold">Featured Meals</h2>
        {featuredMeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMeals.map((meal: any) => (
              <MealCard key={meal.id} {...meal} data-ai-hint={meal.imageHint} />
            ))}
          </div>
        ) : (
           <p className="text-muted-foreground">No featured meals available right now.</p>
        )}
      </section>
      
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold">Find Your Next Feast</h2>
        
        <DashboardControls />

        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
            {restaurants.map((restaurant: any) => (
              <RestaurantCard key={restaurant.id} {...restaurant} data-ai-hint={restaurant.imageHint}/>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground h-64 border-2 border-dashed rounded-lg mt-4">
            <ChefHat className="w-16 h-16 mb-4" />
            <p className="text-lg">No restaurants match your criteria.</p>
            <p className="text-sm">Try selecting a different category or clearing your filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
