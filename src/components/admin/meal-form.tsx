
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { addMealAction, updateMealAction } from '@/app/actions';

const mealFormSchema = z.object({
  name: z.string().min(3, "Meal name must be at least 3 characters."),
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, { message: "Please enter a valid price." }),
  imageUrl: z.string().url("Please enter a valid image URL."),
});

type MealFormValues = z.infer<typeof mealFormSchema>;

interface MealFormProps {
    restaurantId: string;
    initialData?: {
        id: string;
        name: string;
        price: string;
        imageUrl: string;
    } | null;
    onFinished: () => void;
}

export function MealForm({ restaurantId, initialData, onFinished }: MealFormProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<MealFormValues>({
        resolver: zodResolver(mealFormSchema),
        defaultValues: initialData || {
            name: '',
            price: '',
            imageUrl: 'https://placehold.co/600x400.png',
        },
    });

    const onSubmit = (data: MealFormValues) => {
        if (!user) return;
        
        startTransition(async () => {
            const action = initialData ? updateMealAction : addMealAction;
            const input = {
                userId: user.uid,
                restaurantId,
                mealId: initialData?.id || '',
                ...data
            }
            const result = await action(input as any); // Cast to any to satisfy both action types

            if (result.success) {
                toast({ title: `Meal ${initialData ? 'Updated' : 'Added'}`, description: "The menu has been successfully updated." });
                onFinished();
            } else {
                toast({ variant: "destructive", title: "Update Failed", description: "Could not save your changes." });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Meal Name</FormLabel>
                            <FormControl><Input placeholder="Quantum Quinoa Bowl" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl><Input placeholder="18.50" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl><Input placeholder="https://placehold.co/600x400.png" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end pt-4">
                     <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Save Changes' : 'Add Meal'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
