// src/app/dashboard/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: {
        toDate: () => Date;
    };
    items: { name: string, quantity: number, price: number }[];
}

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            const fetchOrders = async () => {
                try {
                    const q = query(
                        collection(db, 'orders'), 
                        where('userId', '==', user.uid),
                        orderBy('createdAt', 'desc')
                    );
                    const querySnapshot = await getDocs(q);
                    const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
                    setOrders(userOrders);
                } catch (error) {
                    console.error("Error fetching orders: ", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="font-headline text-4xl font-bold tracking-tight">Your Orders</h1>
                <p className="text-muted-foreground">A history of your cosmic culinary journeys.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                        {orders.length > 0 ? `You have placed ${orders.length} orders.` : "You haven't placed any orders yet."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium truncate max-w-[100px]">{order.id}</TableCell>
                                    <TableCell>{new Date(order.createdAt.toDate()).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
