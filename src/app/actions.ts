
"use server";

import { concierge, ConciergeInput, ConciergeOutput } from "@/ai/flows/concierge-flow";
import { getSearchSuggestions, SearchSuggestionsInput, SearchSuggestionsOutput } from "@/ai/flows/ai-powered-search-suggestions";
import { adminDb } from "@/lib/firebase-server";
import type { CartItem, Address } from "@/context/cart-context";
import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export async function getConciergeResponseAction(
  input: ConciergeInput
): Promise<ConciergeOutput> {
  return await concierge(input);
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
            await userRef.update({
                [fieldToUpdate]: admin.firestore.FieldValue.arrayRemove(itemId)
            });
        } else {
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

interface UpdateUserProfileInput {
    userId: string;
    displayName: string;
    addresses: Address[];
}

export async function updateUserProfileAction(input: UpdateUserProfileInput): Promise<{ success: boolean }> {
    const { userId, displayName, addresses } = input;

    try {
        const userRef = adminDb.collection('users').doc(userId);
        
        await admin.auth().updateUser(userId, { displayName });
        
        const processedAddresses = addresses.map(addr => ({
            ...addr,
            id: addr.id || uuidv4(),
        }));
        
        await userRef.update({
            displayName,
            addresses: processedAddresses,
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating user profile:", error);
        return { success: false };
    }
}

interface UpdateAvatarInput {
    userId: string;
    photoURL: string;
}

export async function updateAvatarAction(input: UpdateAvatarInput): Promise<{ success: boolean }> {
    const { userId, photoURL } = input;
    try {
        await admin.auth().updateUser(userId, { photoURL });
        await adminDb.collection('users').doc(userId).update({ photoURL });
        return { success: true };
    } catch (error) {
        console.error("Error updating avatar:", error);
        return { success: false };
    }
}
