'use server';

import { adminDb } from "@/lib/firebase-server";
import type { CartItem } from "@/context/cart-context";

export interface Order {
    id: string;
    userId: string;
    total: number;
    status: string;
    createdAt: any;
    items: CartItem[];
}

export async function getOrders(userId: string): Promise<Order[]> {
    const ordersQuery = adminDb.collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(5); // Limit to last 5 orders for brevity

    const ordersSnapshot = await ordersQuery.get();

    if (ordersSnapshot.empty) {
        return [];
    }

    return ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Convert Firestore timestamp to a serializable format (ISO string)
            createdAt: data.createdAt.toDate().toISOString(),
        } as Order;
    });
}
