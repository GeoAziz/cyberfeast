"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useCart } from "@/context/cart-context";

interface MealCardProps {
  name: string;
  restaurantName: string;
  price: string;
  imageUrl: string;
  "data-ai-hint"?: string;
}

export function MealCard({ name, restaurantName, price, imageUrl, "data-ai-hint": dataAiHint }: MealCardProps) {
  const { addItem } = useCart();
  
  const mealData = { name, restaurantName, price, imageUrl };

  const handleAddToCart = () => {
    addItem({
      name,
      price: parseFloat(price),
      imageUrl,
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("meal", JSON.stringify(mealData));
  }

  return (
    <Card 
      className="overflow-hidden group transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20 cursor-grab active:cursor-grabbing"
      draggable="true"
      onDragStart={handleDragStart}
    >
      <CardHeader className="p-0">
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
