
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createOrder } from '@/services/order-service';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
      console.error("Stripe webhook secret is not set.");
      return new NextResponse('Webhook secret not configured', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error message: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    if (!session.metadata?.userId || !session.metadata?.items) {
        console.error('Missing metadata in checkout session');
        return new NextResponse('Webhook error: Missing metadata', { status: 400 });
    }

    try {
      await createOrder({
        userId: session.metadata.userId,
        items: JSON.parse(session.metadata.items),
        total: (session.amount_total || 0) / 100,
      });
    } catch (error) {
       console.error("Error creating order in webhook:", error);
       return new NextResponse('Error creating order', { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
