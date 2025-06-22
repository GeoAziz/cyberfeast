
'use client';

import { useState, useTransition } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlusCircle, MoreHorizontal, Pen, Trash2, Loader2 } from 'lucide-react';
import { MealForm } from './meal-form';
import { deleteMealAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface Meal {
    id: string;
    name: string;
    price: string;
    imageUrl: string;
}

interface ManageMenuProps {
    initialMeals: Meal[];
    restaurantId: string;
}

export function ManageMenu({ initialMeals, restaurantId }: ManageMenuProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

    const handleEdit = (meal: Meal) => {
        setSelectedMeal(meal);
        setIsDialogOpen(true);
    };
    
    const handleAdd = () => {
        setSelectedMeal(null);
        setIsDialogOpen(true);
    }
    
    const handleDelete = (mealId: string) => {
        if (!user) return;
        startTransition(async () => {
            const result = await deleteMealAction({ userId: user.uid, restaurantId, mealId });
            if (result.success) {
                toast({ title: "Meal Deleted", description: "The meal has been removed from the menu." });
            } else {
                toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the meal." });
            }
        });
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Menu</CardTitle>
                    <CardDescription>Add, edit, or remove meals from this restaurant's menu.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                         <Button onClick={handleAdd}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Meal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedMeal ? 'Edit Meal' : 'Add a New Meal'}</DialogTitle>
                        </DialogHeader>
                        <MealForm 
                            restaurantId={restaurantId} 
                            initialData={selectedMeal} 
                            onFinished={() => setIsDialogOpen(false)} 
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialMeals.map((meal) => (
                            <TableRow key={meal.id}>
                                <TableCell className="font-medium">{meal.name}</TableCell>
                                <TableCell>${meal.price}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                                                <span className="sr-only">Open menu</span>
                                                 {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(meal)}>
                                                <Pen className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the meal from the menu.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(meal.id)} className="bg-destructive hover:bg-destructive/90">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {initialMeals.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">This restaurant has no meals yet.</p>
                )}
            </CardContent>
        </Card>
    );
}
