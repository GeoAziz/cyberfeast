'use client';

import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart as ShoppingCartIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { placeOrderAction } from '@/app/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ShoppingCart() {
  const { isCartOpen, toggleCart, items, dispatch, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };
  
  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const handleCheckout = async () => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: "Authentication Required",
            description: "Please log in to place an order.",
        });
        toggleCart();
        router.push('/login');
        return;
    }
    if (items.length === 0) return;

    setIsLoading(true);
    try {
        await placeOrderAction({
            userId: user.uid,
            items: items.map(item => ({...item, price: Number(item.price)})),
            total: totalPrice,
        });
        clearCart();
        toast({
          title: "Order Placed!",
          description: "Your feast is being summoned from the future. It will arrive shortly.",
        });
        router.push('/dashboard/orders');
    } catch (error) {
        toast({
            variant: 'destructive',
            title: "Order Failed",
            description: "There was a problem placing your order. Please try again.",
        });
    } finally {
        setIsLoading(false);
        if (isCartOpen) {
          toggleCart();
        }
    }
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={toggleCart}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6 py-4">
          <SheetTitle className='font-headline text-primary flex items-center gap-2'>
            <ShoppingCartIcon />
            Your Cart
            </SheetTitle>
        </SheetHeader>
        <Separator />
        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-4 p-6">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-primary font-bold">${Number(item.price).toFixed(2)}</p>
                            <div className="mt-2 flex items-center gap-2 text-sm">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span>{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                ))}
                </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="p-6 bg-secondary/30">
                <div className="w-full space-y-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <Button onClick={handleCheckout} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                       {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Proceed to Checkout
                    </Button>
                </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCartIcon className="h-20 w-20 text-muted-foreground/50" />
            <h3 className="font-headline text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">Add items to your cart to get started.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
