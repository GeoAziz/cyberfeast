import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

interface RestaurantCardProps {
  name: string;
  cuisine: string;
  rating: number;
  imageUrl: string;
  "data-ai-hint"?: string;
}

export function RestaurantCard({ name, cuisine, rating, imageUrl, "data-ai-hint": dataAiHint }: RestaurantCardProps) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/20 cursor-pointer">
      <CardHeader className="p-0">
        <div className="aspect-[16/10] overflow-hidden relative">
          <Image
            src={imageUrl}
            alt={name}
            width={600}
            height={375}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            data-ai-hint={dataAiHint}
          />
           <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
           <div className="absolute bottom-4 left-4">
             <h3 className="font-headline text-2xl text-white font-bold">{name}</h3>
             <p className="text-sm text-gray-300">{cuisine}</p>
           </div>
           <div className="absolute top-4 right-4 bg-background/70 backdrop-blur-sm p-2 rounded-full flex items-center gap-1 text-sm">
             <Star className="w-4 h-4 text-accent fill-accent" />
             <span>{rating.toFixed(1)}</span>
           </div>
        </div>
      </CardHeader>
    </Card>
  );
}
