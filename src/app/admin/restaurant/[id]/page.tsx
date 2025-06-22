
import { getRestaurantById, getMenuForRestaurantById } from "@/services/restaurant-service";
import { notFound, redirect } from "next/navigation";
import { RestaurantForm } from "@/components/admin/restaurant-form";
import { ManageMenu } from "@/components/admin/manage-menu";
import { Separator } from "@/components/ui/separator";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";

async function getUserId() {
    try {
        const sessionCookie = cookies().get('__session')?.value;
        if (!sessionCookie) return null;
        const decodedIdToken = await getAuth().verifySessionCookie(sessionCookie, true);
        return decodedIdToken.uid;
    } catch {
        return null;
    }
}

export default async function ManageRestaurantPage({ params }: { params: { id: string } }) {
    const restaurantId = params.id;
    const userId = await getUserId();
    if (!userId) {
        redirect('/login');
    }

    const restaurant = await getRestaurantById(restaurantId);
    if (!restaurant) {
        notFound();
    }

    // Security check: ensure the logged-in user owns this restaurant
    if (restaurant.ownerId !== userId) {
        redirect('/admin?error=unauthorized');
    }

    const menu = await getMenuForRestaurantById(restaurantId);

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
                    <ManageMenu initialMeals={menu} restaurantId={restaurantId} />
                </div>
            </div>
        </div>
    );
}
