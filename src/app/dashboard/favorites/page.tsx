
// src/app/dashboard/favorites/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RestaurantCard } from '@/components/restaurant-card';
import { MealCard } from '@/components/meal-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';

// Define types for our fetched data
interface Restaurant {
  id: string;
  [key: string]: any;
}
interface Meal {
  id: string;
  [key: string]: any;
}

export default function FavoritesPage() {
  const { user, userData } = useAuth();
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !userData) {
        setLoading(false);
        return;
      }
      
      setLoading(true);

      try {
        // Fetch favorite restaurants
        const restaurantIds = userData.favoriteRestaurants || [];
        if (restaurantIds.length > 0) {
          const restaurantQuery = query(collection(db, 'restaurants'), where(documentId(), 'in', restaurantIds));
          const restaurantSnapshot = await getDocs(restaurantQuery);
          const restaurantsData = restaurantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Restaurant[];
          setFavoriteRestaurants(restaurantsData);
        } else {
          setFavoriteRestaurants([]);
        }

        // Fetch favorite meals
        const mealIds = userData.favoriteMeals || [];
        if (mealIds.length > 0) {
          // Firestore 'in' queries are limited to 30 items. We query all restaurants' meal subcollections.
          // This is less efficient but necessary without a root 'meals' collection.
          // For Spark plan, this is okay for a small number of restaurants.
          const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
          let mealsData: Meal[] = [];
          for (const restaurantDoc of restaurantsSnapshot.docs) {
             const mealQuery = query(collection(db, `restaurants/${restaurantDoc.id}/meals`), where(documentId(), 'in', mealIds));
             const mealSnapshot = await getDocs(mealQuery);
             mealSnapshot.forEach(doc => {
                 mealsData.push({ id: doc.id, ...doc.data() } as Meal);
             });
          }
          setFavoriteMeals(mealsData);
        } else {
            setFavoriteMeals([]);
        }

      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, userData]);

  const renderSkeletons = (count: number) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full" />
      ))}
    </div>
  );

  const hasFavorites = favoriteRestaurants.length > 0 || favoriteMeals.length > 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-bold tracking-tight">Favorites</h1>
        <p className="text-muted-foreground">Your most-loved restaurants and meals.</p>
      </header>
      
      {loading ? (
        <div className="space-y-8">
          <Skeleton className="h-8 w-1/4" />
          {renderSkeletons(3)}
          <Skeleton className="h-8 w-1/4 mt-8" />
          {renderSkeletons(3)}
        </div>
      ) : !hasFavorites ? (
        <div className="flex flex-col items-center justify-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
          <Heart className="w-16 h-16 mb-4" />
          <p className="text-lg">You haven't favorited anything yet.</p>
          <p className="text-sm">Click the heart icon on restaurants or meals to save them here.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {favoriteRestaurants.length > 0 && (
            <section>
              <h2 className="font-headline text-2xl font-bold mb-4">Favorite Restaurants</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {favoriteRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} {...restaurant} />
                ))}
              </div>
            </section>
          )}
          {favoriteMeals.length > 0 && (
            <section>
              <h2 className="font-headline text-2xl font-bold mb-4">Favorite Meals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {favoriteMeals.map((meal) => (
                  <MealCard key={meal.id} {...meal} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
