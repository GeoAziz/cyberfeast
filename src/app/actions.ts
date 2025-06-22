
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
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const orderRef = await adminDb.collection('orders').add(orderData);

    // Update user's loyalty points
    const userRef = adminDb.collection('users').doc(userId);
    const loyaltyPointsToAdd = Math.floor(total);
    await userRef.update({
        loyaltyPoints: admin.firestore.FieldValue.increment(loyaltyPointsToAdd)
    });

    return { orderId: orderRef.id };
}

interface ToggleFavoriteInput {
    userId: string;
    itemId: string;
    itemType: 'restaurant' | 'meal';
    isFavorited: boolean;
}

export async function toggleFavoriteAction(input: ToggleFavoriteInput): Promise<{ success: boolean }> {
    const { userId, itemId, itemType, isFavorited } = input;
    if (!userId || !itemId || !itemType) {
        throw new Error("User ID, Item ID, and Item Type are required.");
    }

    const userRef = adminDb.collection('users').doc(userId);
    const fieldToUpdate = itemType === 'restaurant' ? 'favoriteRestaurants' : 'favoriteMeals';
    
    try {
        if (isFavorited) {
            // Remove from favorites
            await userRef.update({
                [fieldToUpdate]: admin.firestore.FieldValue.arrayRemove(itemId)
            });
        } else {
            // Add to favorites
            await userRef.update({
                [fieldToUpdate]: admin.firestore.FieldValue.arrayUnion(itemId)
            });
        }
        return { success: true };
    } catch (error) {
        console.error("Error toggling favorite:", error);
        return { success: false };
    }
}
