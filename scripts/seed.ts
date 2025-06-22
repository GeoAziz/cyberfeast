
import admin from 'firebase-admin';
import { config } from 'dotenv';
import { getAuth } from 'firebase-admin/auth';
config({ path: '.env.local' });

const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}


if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const auth = getAuth();

const ADMIN_EMAIL = "admin@cyberfeast.com";
const ADMIN_PASSWORD = "password";

const restaurantsData = [
  { name: "Cyber Sushi", slug: "cyber-sushi", cuisine: "Japanese", rating: 4.8, imageUrl: "https://placehold.co/600x400.png", imageHint: "sushi neon" },
  { name: "Droid's Diner", slug: "droids-diner", cuisine: "American", rating: 4.5, imageUrl: "https://placehold.co/600x400.png", imageHint: "robot diner" },
  { name: "The Grid Pizzeria", slug: "the-grid-pizzeria", cuisine: "Italian", rating: 4.7, imageUrl: "https://placehold.co/600x400.png", imageHint: "tron pizza" },
  { name: "BioDome Cafe", slug: "biodome-cafe", cuisine: "Healthy", rating: 4.9, imageUrl: "https://placehold.co/600x400.png", imageHint: "organic cafe" },
];

const mealsByRestaurantSlug: { [key: string]: any[] } = {
    "cyber-sushi": [
        { name: "Stardust Sushi", restaurantName: "Cyber Sushi", price: "19.99", imageUrl: "https://placehold.co/600x400.png", imageHint: "sushi platter" },
        { name: "Galactic Gyoza", restaurantName: "Cyber Sushi", price: "9.50", imageUrl: "https://placehold.co/600x400.png", imageHint: "futuristic dumplings" },
        { name: "Saturn Sashimi", restaurantName: "Cyber Sushi", price: "24.00", imageUrl: "https://placehold.co/600x400.png", imageHint: "sashimi slices" },
    ],
    "droids-diner": [
        { name: "Chrono Chicken", restaurantName: "Droid's Diner", price: "15.99", imageUrl: "https://placehold.co/600x400.png", imageHint: "futuristic chicken" },
        { name: "Void-Veggie Wrap", restaurantName: "Droid's Diner", price: "11.50", imageUrl: "https://placehold.co/600x400.png", imageHint: "glowing wrap" },
    ],
    "the-grid-pizzeria": [
        { name: "Plasma Pizza", restaurantName: "The Grid Pizzeria", price: "16.00", imageUrl: "https://placehold.co/600x400.png", imageHint: "futuristic pizza", },
    ],
    "biodome-cafe": [
        { name: "Zero-G Cheesecake", restaurantName: "BioDome Cafe", price: "8.99", imageUrl: "https://placehold.co/600x400.png", imageHint: "levitating cheesecake" }
    ]
};

async function seedDatabase() {
    console.log("Starting to seed database...");

    // 1. Create or verify the admin user
    let adminUser;
    try {
        adminUser = await auth.getUserByEmail(ADMIN_EMAIL);
        console.log(`Admin user ${ADMIN_EMAIL} already exists.`);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.log(`Creating admin user: ${ADMIN_EMAIL}`);
            adminUser = await auth.createUser({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                displayName: "Admin User",
            });
        } else {
            throw error;
        }
    }

    // 2. Set custom claims and create user document in Firestore
    await auth.setCustomUserClaims(adminUser.uid, { isAdmin: true });
    const adminUserRef = db.collection('users').doc(adminUser.uid);
    await adminUserRef.set({
        uid: adminUser.uid,
        displayName: adminUser.displayName || "Admin User",
        email: adminUser.email,
        createdAt: new Date(),
        isAdmin: true,
        loyaltyPoints: 1000, // Give admin some points
        photoURL: null,
        addresses: [],
        favoriteRestaurants: [],
        favoriteMeals: [],
        ownedRestaurants: [],
    }, { merge: true });

    console.log(`Admin user ${adminUser.uid} configured.`);

    // 3. Clear existing restaurants and their subcollections
    const restaurantsCol = db.collection('restaurants');
    const existingRestaurants = await restaurantsCol.get();
    if (!existingRestaurants.empty) {
        console.log("Deleting existing restaurant data...");
        const deleteBatch = db.batch();
        for (const doc of existingRestaurants.docs) {
            deleteBatch.delete(doc.ref);
        }
        await deleteBatch.commit();
        console.log("Existing restaurant data deleted.");
    }
    
    // 4. Seed new data
    const seedBatch = db.batch();
    const ownedRestaurantIds: string[] = [];

    for (const restaurantData of restaurantsData) {
        const restaurantRef = restaurantsCol.doc(); // Let Firestore auto-generate ID
        seedBatch.set(restaurantRef, { ...restaurantData, ownerId: adminUser.uid });
        ownedRestaurantIds.push(restaurantRef.id);
        console.log(`Queueing restaurant: ${restaurantData.name} for owner ${adminUser.uid}`);

        const meals = mealsByRestaurantSlug[restaurantData.slug];
        if (meals && meals.length > 0) {
            const mealsCollectionRef = restaurantRef.collection('meals');
            for (const mealData of meals) {
                const mealRef = mealsCollectionRef.doc(); // Auto-generate meal ID
                seedBatch.set(mealRef, mealData);
                console.log(`  - Queueing meal: ${mealData.name}`);
            }
        }
    }

    // 5. Update admin user with owned restaurants
    seedBatch.update(adminUserRef, { ownedRestaurants: ownedRestaurantIds });

    await seedBatch.commit();
    console.log(`Database seeding completed successfully! Admin user ${ADMIN_EMAIL} now owns ${ownedRestaurantIds.length} restaurants.`);
    console.log(`\nAdmin login credentials:`);
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
}

seedDatabase().catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
});
