import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { env } from '@/lib/env';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabaseAdmin = getSupabaseAdmin();

    if (!stripe || !supabaseAdmin) {
      console.log('Webhook: Stripe or Supabase not configured');
      return NextResponse.json({ ok: false, reason: 'not_configured' });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event: Stripe.Event;

    // Verify signature if webhook secret is present
    if (env.stripeWebhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          env.stripeWebhookSecret
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ ok: false, reason: 'invalid_signature' });
      }
    } else {
      // No signature verification (development)
      try {
        event = JSON.parse(body) as Stripe.Event;
      } catch {
        return NextResponse.json({ ok: false, reason: 'invalid_json' });
      }
    }

    // Check if this webhook is for our app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventObject = event.data.object as any;
    const metadata = eventObject.metadata as Record<string, string> | undefined;
    if (metadata?.app_name && metadata.app_name !== 'indie-sample-finder') {
      // Not for this app, ignore
      return NextResponse.json({ ok: true, reason: 'not_for_this_app' });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId) as any;
          const userId = session.metadata?.user_id;

          if (userId && subscriptionData) {
            await supabaseAdmin.from('subscriptions').upsert(
              {
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscriptionId,
                status: subscriptionData.status,
                price_id: subscriptionData.items?.data?.[0]?.price?.id || null,
                current_period_end: subscriptionData.current_period_end
                  ? new Date(subscriptionData.current_period_end * 1000).toISOString()
                  : null,
                cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: subscription.status,
              price_id: subscription.items?.data?.[0]?.price?.id || null,
              current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
              cancel_at_period_end: subscription.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: false, reason: 'error' });
  }
}
