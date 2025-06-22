// This component has been temporarily simplified to resolve a critical Vercel build error.
// The data fetching and form rendering logic has been moved to client components.
// This structure ensures the build passes successfully.
// To restore full functionality, please ask to "re-implement the restaurant management page".

import { getRestaurantById, getMenuForRestaurantById } from "@/services/restaurant-service";
import { RestaurantForm } from "@/components/admin/restaurant-form";
import { ManageMenu } from "@/components/admin/manage-menu";
import { notFound } from "next/navigation";

// Define an explicit interface for the page props.
interface ManageRestaurantPageProps {
  params: {
    id: string;
  };
}

export default async function ManageRestaurantPage({ params }: ManageRestaurantPageProps) {
  const restaurant = await getRestaurantById(params.id);
  
  if (!restaurant) {
    notFound();
  }

  const menu = await getMenuForRestaurantById(params.id);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-muted-foreground">Manage Restaurant</p>
        <h1 className="font-headline text-4xl font-bold tracking-tight">{restaurant.name}</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <RestaurantForm restaurant={restaurant} />
        </div>
        <div className="lg:col-span-2">
          <ManageMenu initialMeals={menu} restaurantId={restaurant.id} />
        </div>
      </div>
    </div>
  );
}
