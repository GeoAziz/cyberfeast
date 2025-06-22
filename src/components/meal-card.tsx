
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, PlusCircle } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleFavoriteAction } from "@/app/actions";
import { cn } from "@/lib/utils";

interface MealCardProps {
  id: string;
  name: string;
  restaurantName: string;
  price: string;
  imageUrl: string;
  "data-ai-hint"?: string;
}

export function MealCard({ id, name, restaurantName, price, imageUrl, "data-ai-hint": dataAiHint }: MealCardProps) {
  const { addItem } = useCart();
  const { user, userData, setUserData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isFavorited = userData?.favoriteMeals?.includes(id);
  
  const mealData = { id, name, restaurantName, price, imageUrl };

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price: parseFloat(price),
      imageUrl,
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("meal", JSON.stringify(mealData));
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card drag from triggering
    if (!user) {
      toast({ variant: 'destructive', title: 'Please login to add favorites.' });
      router.push('/login');
      return;
    }
    startTransition(async () => {
      await toggleFavoriteAction({
        userId: user.uid,
        itemId: id,
        itemType: 'meal',
        isFavorited: !!isFavorited,
      });

      const newFavorites = isFavorited
        ? userData.favoriteMeals.filter((mealId: string) => mealId !== id)
        : [...(userData.favoriteMeals || []), id];
      
      setUserData({ ...userData, favoriteMeals: newFavorites });
      
      toast({
        title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
        description: `${name} has been ${isFavorited ? 'removed from' : 'added to'} your favorites.`,
      });
    });
  };

  return (
    <Card 
      className="overflow-hidden group transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20 cursor-grab active:cursor-grabbing"
      draggable="true"
      onDragStart={handleDragStart}
    >
      <CardHeader className="p-0 relative">
        <div className="aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            width={600}
            height={400}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            data-ai-hint={dataAiHint}
          />
        </div>
        {user && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={isPending}
            className="absolute top-2 right-2 z-10 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <Heart className={cn("h-5 w-5 transition-colors", isFavorited && "text-accent fill-accent")} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="font-headline text-lg">{name}</CardTitle>
        <p className="text-sm text-muted-foreground">{restaurantName}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-lg font-bold text-primary">${price}</p>
        <Button size="sm" variant="outline" className="gap-2" onClick={handleAddToCart}>
          <PlusCircle className="h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
