
"use server";

import { mealRecommendation, MealRecommendationInput, MealRecommendationOutput } from "@/ai/flows/meal-recommendation";
import { getSearchSuggestions, SearchSuggestionsInput, SearchSuggestionsOutput } from "@/ai/flows/ai-powered-search-suggestions";
import { adminDb } from "@/lib/firebase-server";
import type { CartItem } from "@/context/cart-context";
import admin from 'firebase-admin';

export async function getMealRecommendationAction(
  input: MealRecommendationInput
): Promise<MealRecommendationOutput> {
  return await mealRecommendation(input);
}

export async function getSearchSuggestionsAction(
  input: SearchSuggestionsInput
): Promise<SearchSuggestionsOutput> {
  return await getSearchSuggestions(input);
}

interface PlaceOrderInput {
    userId: string;
    items: CartItem[];
    total: number;
}

export async function placeOrderAction(input: PlaceOrderInput): Promise<{ orderId: string }> {
    const { userId, items, total } = input;
    
    const orderData = {
        userId,
        items,
        total,
        status: 'pending',
        createdAt: new Date(),
    };

    const orderRef = await adminDb.collection('orders').add(orderData);

    // Optional: Update user's loyalty points
    const userRef = adminDb.collection('users').doc(userId);
    const loyaltyPointsToAdd = Math.floor(total);
    await userRef.update({
        loyaltyPoints: admin.firestore.FieldValue.increment(loyaltyPointsToAdd)
    });

    return { orderId: orderRef.id };
}
