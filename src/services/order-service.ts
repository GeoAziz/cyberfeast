
'use server';

import { adminDb } from "@/lib/firebase-server";
import type { CartItem } from "@/context/cart-context";
import admin from 'firebase-admin';

// This is the type returned by the service function, safe for server components
export interface SerializableOrder {
    id: string;
    userId: string;
    total: number;
    status: string;
    createdAt: string; // ISO string
    items: CartItem[];
}

export async function getOrders(userId: string): Promise<SerializableOrder[]> {
    const ordersQuery = adminDb.collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(10); // Limit to last 10 orders

    const ordersSnapshot = await ordersQuery.get();

    if (ordersSnapshot.empty) {
        return [];
    }

    return ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            total: data.total,
            status: data.status,
            items: data.items,
            // Convert Firestore timestamp to a serializable format (ISO string)
            createdAt: data.createdAt.toDate().toISOString(),
        } as SerializableOrder;
    });
}

interface CreateOrderInput {
    userId: string;
    items: CartItem[];
    total: number;
}

export async function createOrder(input: CreateOrderInput): Promise<{ orderId: string }> {
    const { userId, items, total } = input;
    
    const orderData = {
        userId,
        items,
        total,
        status: 'paid', // Status is now 'paid' since this is called after successful payment
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const orderRef = await adminDb.collection('orders').add(orderData);

    // Increment loyalty points
    const userRef = adminDb.collection('users').doc(userId);
    const loyaltyPointsToAdd = Math.floor(total); // 1 point per dollar spent
    await userRef.update({
        loyaltyPoints: admin.firestore.FieldValue.increment(loyaltyPointsToAdd)
    });

    return { orderId: orderRef.id };
}
