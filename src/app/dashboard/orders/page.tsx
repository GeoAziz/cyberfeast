
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getOrders, SerializableOrder } from '@/services/order-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { adminAuth } from '@/lib/firebase-server';

async function getUserId() {
  const sessionCookie = cookies().get('__session')?.value;
  if (!sessionCookie) return null;
  try {
    const decodedIdToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedIdToken.uid;
  } catch (error) {
    // Session cookie is invalid or expired
    return null;
  }
}

export default async function OrdersPage() {
    const userId = await getUserId();
    
    if (!userId) {
        redirect('/login');
    }
    
    const orders: SerializableOrder[] = await getOrders(userId);

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
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium truncate max-w-[100px]">{order.id}</TableCell>
                                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>{order.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        You haven't placed any orders yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
