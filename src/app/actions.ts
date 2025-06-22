
"use server";

import { concierge, ConciergeInput, ConciergeOutput } from "@/ai/flows/concierge-flow";
import { getSearchSuggestions, SearchSuggestionsInput, SearchSuggestionsOutput } from "@/ai/flows/ai-powered-search-suggestions";
import { adminDb } from "@/lib/firebase-server";
import type { CartItem, Address } from "@/context/cart-context";
import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { stripe } from '@/lib/stripe';
import { headers } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { revalidatePath } from "next/cache";


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

interface CreateCheckoutSessionInput {
    items: CartItem[];
    userId: string;
}

export async function createCheckoutSessionAction(input: CreateCheckoutSessionInput): Promise<{ sessionId: string }> {
    const { items, userId } = input;
    const origin = headers().get('origin') || 'http://localhost:9002';

    if (!userId) {
        throw new Error("User is not authenticated.");
    }

    const lineItems = items.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.name,
                images: [item.imageUrl]
            },
            unit_amount: Math.round(item.price * 100), // Stripe expects amount in cents
        },
        quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${origin}/dashboard/orders?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/dashboard`,
        metadata: {
            userId: userId,
            items: JSON.stringify(items.map(item => ({...item, price: Number(item.price)}))), // Pass cart items to webhook
        },
    });

    if (!session.id) {
        throw new Error("Could not create Stripe Checkout session.");
    }

    return { sessionId: session.id };
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

// ---- Admin Actions ----

async function verifyAdminAndOwner(userId: string, restaurantId: string): Promise<void> {
    if (!userId) {
        throw new Error("Authentication required.");
    }
    const user = await getAuth().getUser(userId);
    if (!user.customClaims?.isAdmin) {
        throw new Error("Authorization failed: User is not an admin.");
    }
    
    const restaurantRef = adminDb.collection('restaurants').doc(restaurantId);
    const restaurantDoc = await restaurantRef.get();
    if (!restaurantDoc.exists || restaurantDoc.data()?.ownerId !== userId) {
        throw new Error("Authorization failed: User does not own this restaurant.");
    }
}

interface UpdateRestaurantInput {
    userId: string;
    restaurantId: string;
    name: string;
    cuisine: string;
}

export async function updateRestaurantAction(input: UpdateRestaurantInput): Promise<{ success: boolean }> {
    const { userId, restaurantId, name, cuisine } = input;
    try {
        await verifyAdminAndOwner(userId, restaurantId);
        
        await adminDb.collection('restaurants').doc(restaurantId).update({ name, cuisine });

        revalidatePath(`/admin/restaurant/${restaurantId}`);
        revalidatePath(`/dashboard`);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating restaurant:", error.message);
        return { success: false };
    }
}

interface MealInput {
    userId: string;
    restaurantId: string;
    name: string;
    price: string;
    imageUrl: string;
}

export async function addMealAction(input: MealInput): Promise<{ success: boolean }> {
    const { userId, restaurantId, ...mealData } = input;
    try {
        await verifyAdminAndOwner(userId, restaurantId);

        const mealsCollectionRef = adminDb.collection('restaurants').doc(restaurantId).collection('meals');
        await mealsCollectionRef.add(mealData);

        revalidatePath(`/admin/restaurant/${restaurantId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error adding meal:", error.message);
        return { success: false };
    }
}

interface UpdateMealInput extends MealInput {
    mealId: string;
}

export async function updateMealAction(input: UpdateMealInput): Promise<{ success: boolean }> {
    const { userId, restaurantId, mealId, ...mealData } = input;
    try {
        await verifyAdminAndOwner(userId, restaurantId);

        const mealRef = adminDb.collection('restaurants').doc(restaurantId).collection('meals').doc(mealId);
        await mealRef.update(mealData);

        revalidatePath(`/admin/restaurant/${restaurantId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating meal:", error.message);
        return { success: false };
    }
}

interface DeleteMealInput {
    userId: string;
    restaurantId: string;
    mealId: string;
}

export async function deleteMealAction(input: DeleteMealInput): Promise<{ success: boolean }> {
    const { userId, restaurantId, mealId } = input;
    try {
        await verifyAdminAndOwner(userId, restaurantId);

        const mealRef = adminDb.collection('restaurants').doc(restaurantId).collection('meals').doc(mealId);
        await mealRef.delete();

        revalidatePath(`/admin/restaurant/${restaurantId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting meal:", error.message);
        return { success: false };
    }
}
