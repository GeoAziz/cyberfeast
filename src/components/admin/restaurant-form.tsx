
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { updateRestaurantAction } from '@/app/actions';

const restaurantFormSchema = z.object({
  name: z.string().min(3, "Restaurant name must be at least 3 characters."),
  cuisine: z.string().min(3, "Cuisine type must be at least 3 characters."),
});

type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;

interface RestaurantFormProps {
    restaurant: {
        id: string;
        name: string;
        cuisine: string;
    };
}

export function RestaurantForm({ restaurant }: RestaurantFormProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<RestaurantFormValues>({
        resolver: zodResolver(restaurantFormSchema),
        defaultValues: {
            name: restaurant.name || '',
            cuisine: restaurant.cuisine || '',
        },
    });

    const onSubmit = (data: RestaurantFormValues) => {
        if (!user) return;
        startTransition(async () => {
            const result = await updateRestaurantAction({
                userId: user.uid,
                restaurantId: restaurant.id,
                ...data,
            });

            if (result.success) {
                toast({ title: "Restaurant Updated", description: "Your changes have been saved." });
            } else {
                toast({ variant: "destructive", title: "Update Failed", description: "Could not save your changes." });
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Restaurant Details</CardTitle>
                <CardDescription>Update the name and cuisine type for your restaurant.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Restaurant Name</FormLabel>
                                    <FormControl><Input placeholder="Cyber Sushi" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cuisine"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cuisine Type</FormLabel>
                                    <FormControl><Input placeholder="Japanese" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
