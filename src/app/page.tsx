'use client'; 

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MealCard } from "@/components/meal-card";
import { Logo } from "@/components/logo";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const trendingMeals = [
  {
    id: "1",
    name: "Quantum Burger",
    restaurantName: "Galaxy Grill",
    price: "14.99",
    imageUrl: "https://placehold.co/600x400.png",
    "data-ai-hint": "glowing burger",
  },
  {
    id: "2",
    name: "Nebula Noodles",
    restaurantName: "Cosmic Kitchen",
    price: "12.50",
    imageUrl: "https://placehold.co/600x400.png",
    "data-ai-hint": "holographic noodles",
  },
  {
    id: "3",
    name: "Stardust Sushi",
    restaurantName: "Starlight Sushi",
    price: "19.99",
    imageUrl: "https://placehold.co/600x400.png",
    "data-ai-hint": "sushi platter",
  },
  {
    id: "4",
    name: "Plasma Pizza",
    restaurantName: "Pizza Planet",
    price: "16.00",
    imageUrl: "https://placehold.co/600x400.png",
    "data-ai-hint": "futuristic pizza",
  },
  {
    id: "5",
    name: "Zero-G Cheesecake",
    restaurantName: "The Sweet Singularity",
    price: "8.99",
    imageUrl: "https://placehold.co/600x400.png",
    "data-ai-hint": "levitating cheesecake"
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/50">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/50">
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter relative">
            <span className="animate-text-reveal [animation-delay:0.2s]">
              Summon your feast
            </span>
            <br />
            <span className="animate-text-reveal [animation-delay:0.7s]">
              from the{" "}
              <span className="text-primary relative">
                future.
                <Sparkles className="absolute -top-4 -right-8 w-8 h-8 text-accent animate-pulse" />
              </span>
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground animate-fade-in [animation-delay:1.2s]">
            Fuel your hunger with CyberFeast. Explore a universe of flavors from
            trending restaurants, delivered at light speed.
          </p>
          <div className="mt-10 flex justify-center gap-4 animate-fade-in [animation-delay:1.5s]">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/50">
              <Link href="/dashboard">
                Explore Food <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
              Trending Transmissions
            </h2>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10" />
              <div className="flex overflow-x-auto space-x-8 pb-4 scrollbar-hide">
                {trendingMeals.map((meal, index) => (
                  <div
                    key={meal.id}
                    className="flex-shrink-0 w-80 animate-slide-up"
                    style={{ animationDelay: `${1.5 + index * 0.1}s` }}
                  >
                    <MealCard
                      id={meal.id}
                      name={meal.name}
                      restaurantName={meal.restaurantName}
                      price={meal.price}
                      imageUrl={meal.imageUrl}
                      data-ai-hint={meal['data-ai-hint']}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CyberFeast. All rights reserved.</p>
      </footer>
    </div>
  );
}
