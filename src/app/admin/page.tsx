
import { getRestaurantsByOwner } from "@/services/restaurant-service";
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Utensils } from "lucide-react";

async function getUserId() {
    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) return null;
    const decodedIdToken = await getAuth().verifySessionCookie(sessionCookie, true);
    return decodedIdToken.uid;
}

export default async function AdminDashboardPage() {
    const userId = await getUserId();
    if (!userId) {
        return <p>You must be logged in to view this page.</p>;
    }
    
    const restaurants = await getRestaurantsByOwner(userId);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="font-headline text-4xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your restaurants and menus.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Your Restaurants</CardTitle>
                    <CardDescription>You own {restaurants.length} restaurant(s). Select one to manage its details and menu.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {restaurants.length > 0 ? (
                        restaurants.map(restaurant => (
                            <Card key={restaurant.id} className="flex items-center justify-between p-4">
                                <div>
                                    <h3 className="font-bold text-lg">{restaurant.name}</h3>
                                    <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                                </div>
                                <Button asChild>
                                    <Link href={`/admin/restaurant/${restaurant.id}`}>
                                        Manage <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground h-48 border-2 border-dashed rounded-lg">
                           <Utensils className="w-12 h-12 mb-4" />
                           <p className="text-lg">No restaurants assigned to you.</p>
                           <p className="text-sm">Contact support to get set up.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
