'use server';

import { adminDb } from "@/lib/firebase-server";

export interface Restaurant {
    id: string;
    name: string;
    cuisine: string;
    rating: number;
    slug: string;
    [key: string]: any;
}

export interface Meal {
    id: string;
    name: string;
    price: string;
    [key: string]: any;
}

export async function getRestaurants(): Promise<Restaurant[]> {
    const restaurantsSnapshot = await adminDb.collection('restaurants').get();
    if (restaurantsSnapshot.empty) {
        return [];
    }
    return restaurantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Restaurant[];
}

export async function getMenuForRestaurant(restaurantName: string): Promise<Meal[]> {
    const restaurantQuery = adminDb.collection('restaurants').where('name', '==', restaurantName).limit(1);
    const restaurantSnapshot = await restaurantQuery.get();

    if (restaurantSnapshot.empty) {
        throw new Error(`Restaurant with name "${restaurantName}" not found.`);
    }

    const restaurantDoc = restaurantSnapshot.docs[0];
    const mealsSnapshot = await restaurantDoc.ref.collection('meals').get();

    if (mealsSnapshot.empty) {
        return [];
    }

    return mealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Meal[];
}
