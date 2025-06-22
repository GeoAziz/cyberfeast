
'use server';

import { adminDb } from "@/lib/firebase-server";

export interface Restaurant {
    id: string;
    name: string;
    cuisine: string;
    rating: number;
    slug: string;
    ownerId: string;
    [key: string]: any;
}

export interface Meal {
    id: string;
    name: string;
    price: string;
    imageUrl: string;
    [key: string]: any;
}

export async function getRestaurants(): Promise<Omit<Restaurant, 'ownerId'>[]> {
    const restaurantsSnapshot = await adminDb.collection('restaurants').get();
    if (restaurantsSnapshot.empty) {
        return [];
    }
    return restaurantsSnapshot.docs.map(doc => {
        const { ownerId, ...data } = doc.data();
        return { id: doc.id, ...data };
    }) as Omit<Restaurant, 'ownerId'>[];
}

export async function getRestaurantsByOwner(ownerId: string): Promise<Omit<Restaurant, 'ownerId'>[]> {
    const query = adminDb.collection('restaurants').where('ownerId', '==', ownerId);
    const snapshot = await query.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Omit<Restaurant, 'ownerId'>[];
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

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
    const docRef = adminDb.collection('restaurants').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
        return null;
    }
    return { id: docSnap.id, ...docSnap.data() } as Restaurant;
}


export async function getMenuForRestaurantById(restaurantId: string): Promise<Meal[]> {
    const mealsSnapshot = await adminDb.collection(`restaurants/${restaurantId}/meals`).get();
    if (mealsSnapshot.empty) {
        return [];
    }
    return mealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Meal[];
}
