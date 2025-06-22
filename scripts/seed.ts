import admin from 'firebase-admin';
import { config } from 'dotenv';
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

const restaurants = [
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
        { name: "Comet Tempura", restaurantName: "Cyber Sushi", price: "15.75", imageUrl: "https://placehold.co/600x400.png", imageHint: "shrimp tempura" },
        { name: "Quantum Quinoa Roll", restaurantName: "Cyber Sushi", price: "18.50", imageUrl: "https://placehold.co/600x400.png", imageHint: "quinoa sushi" },
        { name: "Plasma Edamame", restaurantName: "Cyber Sushi", price: "7.00", imageUrl: "https://placehold.co/600x400.png", imageHint: "glowing edamame" },
    ],
    "droids-diner": [
        { name: "Chrono Chicken", restaurantName: "Droid's Diner", price: "15.99", imageUrl: "https://placehold.co/600x400.png", imageHint: "futuristic chicken" },
        { name: "Void-Veggie Wrap", restaurantName: "Droid's Diner", price: "11.50", imageUrl: "https://placehold.co/600x400.png", imageHint: "glowing wrap" },
        { name: "Meteor Meatballs", restaurantName: "Droid's Diner", price: "13.99", imageUrl: "https://placehold.co/600x400.png", imageHint: "space meatballs" },
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

    const batch = db.batch();
    const restaurantsCol = db.collection('restaurants');

    // Clear existing restaurants and their subcollections
    const existingRestaurants = await restaurantsCol.get();
    if (!existingRestaurants.empty) {
        console.log("Deleting existing data...");
        for (const doc of existingRestaurants.docs) {
            // This is a more complex operation if subcollections exist.
            // For simplicity, we are deleting the documents. For production, a more robust cleanup is needed.
            batch.delete(doc.ref);
        }
        await batch.commit();
        console.log("Existing data deleted.");
    }
    
    // Start new batch for seeding
    const seedBatch = db.batch();

    for (const restaurantData of restaurants) {
        const restaurantRef = restaurantsCol.doc(); // Let Firestore auto-generate ID
        seedBatch.set(restaurantRef, restaurantData);
        console.log(`Queueing restaurant: ${restaurantData.name}`);

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

    await seedBatch.commit();
    console.log("Database seeding completed successfully!");
}

seedDatabase().catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
});
